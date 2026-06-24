/**
 * Khởi động full stack dev local — một lệnh thay cho nhiều terminal.
 * Usage: npm run dev
 *
 * Thứ tự: build shared → Docker infra + backend → gateway + ai + web (local)
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const isWin = process.platform === 'win32';
const tag = '[dev]';

const DOCKER_INFRA = ['postgres', 'redis', 'rabbitmq', 'zookeeper'].join(' ');

const DOCKER_BACKEND = [
  'trip-service',
  'seat-inventory-service',
  'booking-service',
  'payment-service',
  'auth-service',
  'analytics-service',
].join(' ');

const DOCKER_STOP_LOCAL = ['web', 'api-gateway', 'ai-service'].join(' ');

const children = [];
let shuttingDown = false;

function sleep(ms) {
  if (isWin) {
    try {
      execSync(`powershell -Command "Start-Sleep -Milliseconds ${ms}"`, { stdio: 'ignore' });
    } catch {
      /* ignore */
    }
  } else {
    execSync(`sleep ${ms / 1000}`, { stdio: 'ignore' });
  }
}

function run(cmd, label) {
  console.log(`\n${tag} ${label}...`);
  execSync(cmd, { cwd: root, shell: true, stdio: 'inherit' });
}

function killPort(port) {
  if (isWin) {
    try {
      const out = execSync(`netstat -ano | findstr ":${port}" | findstr LISTENING`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const killed = new Set();
      for (const line of out.split('\n')) {
        const pid = line.trim().split(/\s+/).pop();
        if (!pid || pid === '0' || killed.has(pid)) continue;
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          killed.add(pid);
          console.log(`${tag} Đã giải phóng port ${port} (PID ${pid})`);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* port free */
    }
    return;
  }

  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
    if (!pids) return;
    for (const pid of pids.split('\n')) {
      if (!pid) continue;
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`${tag} Đã giải phóng port ${port} (PID ${pid})`);
    }
  } catch {
    /* port free */
  }
}

function ensureSharedBuilt() {
  const dist = path.join(root, 'packages', 'shared', 'dist', 'index.js');
  if (!fs.existsSync(dist)) {
    run('npm run build -w @bus/shared', 'Build @bus/shared (thiếu dist)');
  }
}

function runQuiet(cmd) {
  try {
    execSync(cmd, { cwd: root, shell: true, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function dockerStatus(service) {
  try {
    return execSync(`docker compose ps ${service} --format "{{.Status}}"`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

/**
 * Kafka + Zookeeper: tránh NodeExistsException (/brokers/ids/1) khi restart dev.
 * Xảy ra khi container Kafka bị recreate nhưng Zookeeper vẫn giữ ephemeral node cũ.
 */
function prepareKafka() {
  const kafkaStatus = dockerStatus('kafka');
  const needsReset =
    !kafkaStatus ||
    kafkaStatus.includes('Exited') ||
    kafkaStatus.includes('unhealthy') ||
    kafkaStatus.includes('Restarting') ||
    kafkaStatus.includes('Created');

  if (!needsReset && kafkaStatus.includes('healthy')) return;

  console.log(`\n${tag} Chuẩn bị Kafka (tránh lỗi NodeExists)...`);
  runQuiet('docker compose stop kafka');
  runQuiet('docker compose rm -f kafka');

  const zkStatus = dockerStatus('zookeeper');
  if (zkStatus.includes('Up') || zkStatus.includes('healthy')) {
    run('docker compose restart zookeeper', 'Restart Zookeeper (xóa broker cũ)');
    sleep(10000);
  }
}

function waitForHealthy(service, maxAttempts = 18, intervalMs = 5000) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = dockerStatus(service);
    if (status.includes('healthy')) return true;
    if (status.includes('Exited') || status.includes('dead')) return false;
    sleep(intervalMs);
  }
  return dockerStatus(service).includes('healthy');
}

function dockerOnPort(port) {
  try {
    return execSync(`docker ps --filter publish=${port} --format "{{.Names}}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

function checkPortConflicts() {
  const ports = [
    { port: 6379, service: 'redis' },
    { port: 5432, service: 'postgres' },
    { port: 5672, service: 'rabbitmq' },
    { port: 15672, service: 'rabbitmq' },
  ];

  const blockers = [];
  for (const { port, service } of ports) {
    const ours = dockerStatus(service).includes('Up') || dockerStatus(service).includes('healthy');
    const others = dockerOnPort(port).filter((name) => !name.startsWith('websum26-'));
    if (others.length > 0 && !ours) {
      blockers.push({ port, names: others });
    }
  }

  if (blockers.length === 0) return;

  console.error(`\n${tag} ⚠ Port bị chiếm bởi container khác (không phải Cappy Bus):`);
  for (const { port, names } of blockers) {
    console.error(`${tag}   Port ${port}: ${names.join(', ')}`);
    console.error(`${tag}   → docker stop ${names.join(' ')}`);
  }
  console.error(`\n${tag} Dừng project khác rồi chạy lại: npm run dev\n`);
  process.exit(1);
}

function startDocker() {
  try {
    run(`docker compose stop ${DOCKER_STOP_LOCAL}`, 'Dừng Docker web / gateway / ai (chuyển sang local)');
  } catch {
    console.log(`${tag} Docker chưa chạy hoặc không dừng được container — tiếp tục...`);
  }

  checkPortConflicts();

  try {
    // Bước 1: hạ tầng cơ bản (không Kafka)
    run(`docker compose up -d ${DOCKER_INFRA}`, 'Khởi động Postgres, Redis, RabbitMQ, Zookeeper');

    if (!waitForHealthy('zookeeper', 15, 4000)) {
      console.warn(`\n${tag} ⚠ Zookeeper chưa healthy — vẫn thử Kafka...`);
    }

    // Bước 2: reset + khởi động Kafka (tránh NodeExists khi dev restart)
    prepareKafka();
    try {
      run('docker compose up -d kafka', 'Khởi động Kafka');
    } catch {
      console.log(`\n${tag} Kafka lỗi lần 1 — reset và thử lại...`);
      prepareKafka();
      run('docker compose up -d kafka', 'Khởi động lại Kafka');
    }

    if (!waitForHealthy('kafka', 20, 5000)) {
      const kafkaStatus = dockerStatus('kafka');
      if (kafkaStatus.includes('Exited')) {
        console.log(`\n${tag} Kafka vẫn lỗi — reset lần cuối...`);
        prepareKafka();
        run('docker compose up -d kafka', 'Khởi động lại Kafka (lần 2)');
        waitForHealthy('kafka', 20, 5000);
      }
    }

    const kafkaFinal = dockerStatus('kafka');
    if (!kafkaFinal.includes('healthy')) {
      console.warn(`\n${tag} ⚠ Kafka chưa healthy: ${kafkaFinal || 'không chạy'}`);
      console.warn(`${tag} Chạy thủ công:`);
      console.warn(`${tag}   docker compose stop kafka && docker compose rm -f kafka`);
      console.warn(`${tag}   docker compose restart zookeeper && timeout /t 10`);
      console.warn(`${tag}   docker compose up -d kafka`);
    } else {
      console.log(`${tag} ✓ Kafka healthy`);
    }

    // Bước 3: backend gRPC (analytics-service cần Kafka healthy)
    try {
      run(`docker compose up -d ${DOCKER_BACKEND}`, 'Khởi động backend gRPC');
    } catch {
      console.warn(`\n${tag} ⚠ Một số backend chưa lên — thử lại...`);
      runQuiet(`docker compose up -d ${DOCKER_BACKEND}`);
    }

    console.log(`${tag} Đợi backend Docker sẵn sàng (10 giây)...`);
    sleep(10000);
  } catch (err) {
    console.error(`\n${tag} Lỗi Docker. Cần Docker Desktop đang chạy.`);
    console.error(`${tag} Hoặc chạy riêng: npm run dev:infra`);
    process.exit(1);
  }
}

function spawnDev(cmd, label) {
  const child = spawn(cmd, {
    cwd: root,
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    if (shuttingDown) return;
    if (code !== 0 && code !== null) {
      console.error(`\n${tag} ${label} thoát (mã ${code}) — dừng các service khác...`);
      shutdown(code ?? 1);
    }
  });

  children.push({ child, label });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${tag} Đang dừng tất cả service local...`);

  for (const { child, label } of children) {
    if (child.killed || child.exitCode !== null) continue;
    try {
      if (isWin) {
        execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      console.log(`${tag} Không dừng được ${label}`);
    }
  }

  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log(`${tag} Khởi động full stack Cappy Bus (một lệnh)\n`);
console.log(`${tag} Web:     http://localhost:3000`);
console.log(`${tag} Gateway: http://localhost:4000/graphql`);
console.log(`${tag} Capy AI: http://localhost:8765/health`);
console.log(`${tag} Nhấn Ctrl+C để dừng tất cả\n`);

ensureSharedBuilt();
startDocker();

killPort(4000);
killPort(8765);
killPort(3000);
sleep(500);

console.log(`\n${tag} Khởi động gateway (4000), Capy AI (8765), web (3000)...\n`);

spawnDev('node scripts/start-dev-service.cjs gateway', 'gateway');
sleep(2000);
spawnDev('node scripts/start-dev-service.cjs ai', 'ai');
sleep(1000);
spawnDev('npm run dev -w @bus/web', 'web');
