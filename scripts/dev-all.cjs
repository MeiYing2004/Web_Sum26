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
const { getLanCandidates } = require('./lan-ip.cjs');

function tryOpenWindowsFirewall() {
  if (!isWin) return;
  try {
    execSync('node scripts/open-lan-firewall.cjs', { cwd: root, stdio: 'pipe' });
  } catch {
    console.warn(`${tag} ⚠ Chưa mở được Windows Firewall tự động (cần PowerShell Admin):`);
    console.warn(`${tag}   node scripts/open-lan-firewall.cjs`);
  }
}

const isWin = process.platform === 'win32';
const tag = '[dev]';

const DOCKER_INFRA = ['postgres', 'redis', 'rabbitmq', 'zookeeper'].join(' ');

const DOCKER_BACKEND = [
  'seat-inventory-service',
  'payment-service',
  'auth-service',
  'analytics-service',
].join(' ');

const DOCKER_STOP_LOCAL = ['web', 'api-gateway', 'ai-service', 'trip-service', 'booking-service'].join(' ');

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

const DOCKER_PROCESS_RE = /docker|wslrelay|vmwp|vmmem|com\.docker/i;

function getProcessName(pid) {
  if (!isWin) return '';
  try {
    const out = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = out.match(/^"([^"]+)"/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

function parseListeningPids(port) {
  const pids = new Set();
  const portStr = String(port);
  try {
    const out = execSync('netstat -ano | findstr LISTENING', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    for (const line of out.split('\n')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 4 || parts[parts.length - 2] !== 'LISTENING') continue;
      const localAddr = parts[1] || '';
      const hostPort = localAddr.includes(':') ? localAddr.split(':').pop() : '';
      if (hostPort !== portStr) continue;
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }
  } catch {
    /* no listeners */
  }
  return [...pids];
}

function killPort(port, opts = {}) {
  const { nodeOnly = false } = opts;
  if (isWin) {
    const killed = new Set();
    for (const pid of parseListeningPids(port)) {
      if (killed.has(pid)) continue;
      const name = getProcessName(pid);
      if (name && DOCKER_PROCESS_RE.test(name)) {
        console.log(`${tag} Bỏ qua port ${port} (PID ${pid} — ${name}, thuộc Docker)`);
        continue;
      }
      if (nodeOnly && name && !/node|tsx/i.test(name)) {
        console.log(`${tag} Bỏ qua port ${port} (PID ${pid} — ${name}, không phải Node)`);
        continue;
      }
      try {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        killed.add(pid);
        console.log(`${tag} Đã giải phóng port ${port} (PID ${pid}${name ? ` — ${name}` : ''})`);
      } catch {
        /* ignore */
      }
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

function releasePortForLocalService(port, dockerServices = []) {
  if (dockerServices.length) {
    try {
      console.log(`\n${tag} Dừng Docker ${dockerServices.join(', ')} (chuyển sang local :${port})...`);
      execSync(`docker compose stop ${dockerServices.join(' ')}`, {
        cwd: root,
        stdio: 'inherit',
        shell: true,
      });
      execSync(`docker compose rm -f ${dockerServices.join(' ')}`, {
        cwd: root,
        stdio: 'pipe',
        shell: true,
      });
      sleep(2000);
    } catch {
      console.log(`${tag} Không dừng được Docker container (có thể đã tắt).`);
    }
  }
  killPort(port, { nodeOnly: true });
}

function ensureSharedBuilt() {
  const dist = path.join(root, 'packages', 'shared', 'dist', 'index.js');
  const validationDts = path.join(root, 'packages', 'shared', 'dist', 'validation.d.ts');
  const validationTs = path.join(root, 'packages', 'shared', 'src', 'validation.ts');

  let needsBuild = !fs.existsSync(dist);

  if (!needsBuild && fs.existsSync(validationTs) && fs.existsSync(validationDts)) {
    const srcMtime = fs.statSync(validationTs).mtimeMs;
    const distMtime = fs.statSync(validationDts).mtimeMs;
    const dts = fs.readFileSync(validationDts, 'utf8');
    if (srcMtime > distMtime || !dts.includes('sanitizeOptionalEmail')) {
      needsBuild = true;
    }
  }

  if (needsBuild) {
    run('npm run build -w @bus/shared', 'Build @bus/shared (đồng bộ dist)');
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

function isDockerReady() {
  try {
    execSync('docker ps', { cwd: root, shell: true, stdio: 'pipe', timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

const DOCKER_DESKTOP_PATHS = [
  path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Docker', 'Docker', 'Docker Desktop.exe'),
  path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Docker', 'Docker', 'Docker Desktop.exe'),
];

function tryStartDockerDesktop() {
  if (!isWin) return false;

  for (const exe of DOCKER_DESKTOP_PATHS) {
    if (!fs.existsSync(exe)) continue;
    try {
      execSync(`start "" "${exe}"`, { shell: true, stdio: 'ignore' });
      return true;
    } catch {
      /* try next path */
    }
  }
  return false;
}

/** Đợi Docker daemon sẵn sàng (tự mở Docker Desktop trên Windows nếu cần). */
function ensureDockerRunning(maxWaitMs = 180000) {
  if (isDockerReady()) return;

  console.log(`\n${tag} Docker chưa chạy — đang thử khởi động Docker Desktop...`);
  console.log(`${tag} (lần đầu có thể mất 2–3 phút, đợi icon cá voi ở taskbar)`);

  if (!tryStartDockerDesktop()) {
    console.error(`\n${tag} Không tìm thấy Docker Desktop. Cài và mở thủ công rồi chạy lại: npm run dev`);
    process.exit(1);
  }

  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    sleep(5000);
    if (isDockerReady()) {
      console.log(`${tag} ✓ Docker sẵn sàng`);
      sleep(3000);
      return;
    }
    const elapsed = Math.round((Date.now() - started) / 1000);
    console.log(`${tag} Đợi Docker... (${elapsed}s)`);
  }

  console.error(`\n${tag} Docker chưa sẵn sàng sau ${maxWaitMs / 1000}s.`);
  console.error(`${tag} Mở Docker Desktop thủ công, đợi "Engine running" rồi chạy lại: npm run dev`);
  process.exit(1);
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

function isTcpPortOpenSync(port, host = '127.0.0.1', timeoutMs = 1500) {
  try {
    // Test-NetConnection on Windows takes ~10s per call — use a fast Node TCP probe instead.
    execSync(
      `node -e "const n=require('net');const s=n.createConnection({host:'${host}',port:${port}});s.on('connect',()=>{s.destroy();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),${timeoutMs})"`,
      { stdio: 'ignore', timeout: timeoutMs + 1000 }
    );
    return true;
  } catch {
    return false;
  }
}

function waitForTcpPort(port, label, maxAttempts = 20, intervalMs = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    if (isTcpPortOpenSync(port)) {
      console.log(`${tag} ✓ ${label} (:${port}) có thể kết nối từ localhost`);
      return true;
    }
    if (i === 0 || (i + 1) % 5 === 0) {
      console.log(`${tag} Đợi ${label} (:${port})... (${i + 1}/${maxAttempts})`);
    }
    sleep(intervalMs);
  }
  console.error(`\n${tag} ${label} (:${port}) chưa mở trên localhost sau ~${Math.round((maxAttempts * intervalMs) / 1000)}s.`);
  console.error(`${tag} Kiểm tra Docker Desktop đang chạy, rồi: docker compose up -d postgres redis`);
  return false;
}

function ensureLocalInfraReachable() {
  if (!waitForTcpPort(5432, 'PostgreSQL')) process.exit(1);
  if (!waitForTcpPort(6379, 'Redis')) process.exit(1);
}

function waitForPortListening(port, label, maxAttempts = 120, intervalMs = 1000) {
  sleep(2000);
  for (let i = 0; i < maxAttempts; i++) {
    if (isTcpPortOpenSync(port)) {
      console.log(`${tag} ✓ ${label} (:${port}) sẵn sàng`);
      return true;
    }
    if (i === 0 || (i + 1) % 15 === 0) {
      console.log(`${tag} Đợi ${label} (:${port})... (${i + 1}/${maxAttempts})`);
    }
    sleep(intervalMs);
  }
  console.error(`\n${tag} ✗ ${label} (:${port}) không khởi động sau ${maxAttempts}s`);
  return false;
}

function ensurePortFree(port, label, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    if (!isTcpPortOpenSync(port)) return true;
    killPort(port, { nodeOnly: true });
    sleep(500);
  }
  console.error(`\n${tag} ✗ ${label} (:${port}) vẫn bị chiếm sau ${maxAttempts} lần thử`);
  return false;
}

function prepareLocalService(port, dockerServices = [], extraPorts = []) {
  releasePortForLocalService(port, dockerServices);
  const allPorts = [...new Set([port, ...extraPorts])];
  for (const p of allPorts) {
    if (!ensurePortFree(p, `port ${p}`)) process.exit(1);
  }
}

function runServiceSetup(service, extraEnv = {}) {
  execSync(`node scripts/start-dev-service.cjs ${service} --setup-only`, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
}

function startLocalServices() {
  console.log(`\n${tag} Khởi động service local (tuần tự)...\n`);

  prepareLocalService(50053, ['trip-service'], [9103]);
  runServiceSetup('trip');
  if (!ensurePortFree(50053, 'trip-service') || !ensurePortFree(9103, 'trip-health')) process.exit(1);
  spawnDev('npm run dev -w @bus/trip-service', 'trip', {
    GRPC_PORT: '50053',
    DATABASE_URL: 'postgresql://bus_trip:bus123@localhost:5432/bus_trip',
    REDIS_URL: 'redis://localhost:6379',
    KAFKA_BROKERS: 'localhost:9092',
  });
  if (!waitForPortListening(50053, 'trip-service')) process.exit(1);

  prepareLocalService(50055, ['booking-service'], [9105]);
  runServiceSetup('booking');
  spawnDev('npm run dev -w @bus/booking-service', 'booking', {
    GRPC_PORT: '50055',
    DATABASE_URL: 'postgresql://bus_booking:bus123@localhost:5432/bus_booking',
    REDIS_URL: 'redis://localhost:6379',
    RABBITMQ_URL: 'amqp://bus:bus123@localhost:5672',
    KAFKA_BROKERS: 'localhost:9092',
    TRIP_SERVICE_URL: 'localhost:50053',
    SEAT_SERVICE_URL: 'localhost:50054',
    PAYMENT_SERVICE_URL: 'localhost:50056',
    TICKET_SERVICE_URL: 'localhost:50057',
    ALLOW_SIMULATE_PAYMENT: 'true',
  });
  if (!waitForPortListening(50055, 'booking-service')) process.exit(1);

  prepareLocalService(4000, ['api-gateway']);
  runServiceSetup('gateway', { DEV_SKIP_BUILD: '1' });
  spawnDev('npm run dev -w @bus/api-gateway', 'gateway', {
    PORT: '4000',
    ALLOW_SIMULATE_PAYMENT: 'true',
    REDIS_URL: 'redis://localhost:6379',
    TRIP_SERVICE_URL: 'localhost:50053',
    SEAT_SERVICE_URL: 'localhost:50054',
    BOOKING_SERVICE_URL: 'localhost:50055',
    AUTH_SERVICE_URL: 'localhost:50051',
    ANALYTICS_SERVICE_URL: 'localhost:50059',
  });
  if (!waitForPortListening(4000, 'api-gateway')) process.exit(1);

  prepareLocalService(8765, ['ai-service']);
  runServiceSetup('ai');
  spawnDev('npm run dev -w @bus/ai-service', 'ai', { PORT: '8765' });
  if (!waitForPortListening(8765, 'ai-service')) process.exit(1);

  prepareLocalService(3000, ['web']);
  spawnDev('npm run dev -w @bus/web', 'web');
  if (!waitForPortListening(3000, 'web')) process.exit(1);

  console.log(`\n${tag} ═══════════════════════════════════════`);
  console.log(`${tag} ✓ Cappy Bus dev stack sẵn sàng!`);
  console.log(`${tag}   Web:     http://localhost:3000`);
  console.log(`${tag}   GraphQL: http://localhost:4000/graphql`);
  console.log(`${tag}   AI:      http://localhost:8765/health`);
  console.log(`${tag} ═══════════════════════════════════════\n`);
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
    runQuiet(`docker compose rm -f ${DOCKER_STOP_LOCAL}`);
  } catch {
    console.log(`${tag} Docker chưa chạy hoặc không dừng được container — tiếp tục...`);
  }

  checkPortConflicts();

  try {
    // Bước 1: hạ tầng cơ bản (không Kafka)
    run(`docker compose up -d ${DOCKER_INFRA}`, 'Khởi động Postgres, Redis, RabbitMQ, Zookeeper');

    if (!waitForHealthy('postgres', 18, 3000)) {
      console.error(`\n${tag} PostgreSQL chưa healthy. Mở Docker Desktop, đợi "Engine running", rồi chạy lại: npm run dev`);
      process.exit(1);
    }
    if (!waitForHealthy('redis', 18, 3000)) {
      console.error(`\n${tag} Redis chưa healthy. Mở Docker Desktop, đợi "Engine running", rồi chạy lại: npm run dev`);
      process.exit(1);
    }
    console.log(`${tag} ✓ Postgres & Redis healthy`);

    console.log(`\n${tag} Kiểm tra Postgres & Redis trên localhost...`);
    ensureLocalInfraReachable();

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

function spawnDev(cmd, label, extraEnv = {}) {
  const child = spawn(cmd, {
    cwd: root,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
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
const lanCandidates = getLanCandidates();
if (lanCandidates.length) {
  console.log(`${tag} WiFi LAN (dùng IP này trên điện thoại — KHÔNG dùng 192.168.56.x VirtualBox):`);
  for (const { address, name } of lanCandidates) {
    console.log(`${tag}   http://${address}:3000  (${name})`);
    console.log(`${tag}   API: http://${address}:4000/graphql`);
  }
} else {
  console.warn(`${tag} ⚠ Không tìm thấy IP WiFi/LAN — kiểm tra kết nối mạng`);
}
if (isWin) {
  tryOpenWindowsFirewall();
}
console.log(`${tag} Nhấn Ctrl+C để dừng tất cả\n`);

ensureSharedBuilt();
ensureDockerRunning();
startDocker();

console.log(`\n${tag} Build shared + api-gateway (trước hot-reload)...`);
try {
  run('npm run build -w @bus/shared', 'Build @bus/shared');
  run('npm run build -w @bus/api-gateway', 'Build api-gateway');
} catch {
  console.warn(`${tag} ⚠ Build thất bại — vẫn thử khởi động...`);
}

startLocalServices();
