/**
 * Khởi động service local — tự dừng Docker + giải phóng port trước khi chạy.
 * Usage:
 *   node scripts/start-dev-service.cjs <ai|gateway|trip|booking>           — setup + dev
 *   node scripts/start-dev-service.cjs <ai|gateway|trip|booking> --setup-only
 */
const { execSync, spawn } = require('child_process');
const path = require('path');

const SERVICES = {
  ai: {
    port: process.env.PORT || '8765',
    dockerService: 'ai-service',
    dockerMatch: 'ai-service',
    workspace: '@bus/ai-service',
    label: 'dev:ai',
    extraPorts: [],
  },
  trip: {
    port: process.env.GRPC_PORT || '50053',
    dockerService: 'trip-service',
    dockerMatch: 'trip-service',
    workspace: '@bus/trip-service',
    label: 'dev:trip',
    extraPorts: [9103],
    env: {
      GRPC_PORT: '50053',
      DATABASE_URL: 'postgresql://bus_trip:bus123@localhost:5432/bus_trip',
      REDIS_URL: 'redis://localhost:6379',
      KAFKA_BROKERS: 'localhost:9092',
    },
  },
  booking: {
    port: process.env.GRPC_PORT || '50055',
    dockerService: 'booking-service',
    dockerMatch: 'booking-service',
    workspace: '@bus/booking-service',
    label: 'dev:booking',
    extraPorts: [9105],
    env: {
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
    },
  },
  gateway: {
    port: process.env.PORT || '4000',
    dockerService: 'api-gateway',
    dockerMatch: 'api-gateway',
    workspace: '@bus/api-gateway',
    label: 'dev:gateway',
    extraPorts: [],
    env: {
      ALLOW_SIMULATE_PAYMENT: 'true',
      REDIS_URL: 'redis://localhost:6379',
      TRIP_SERVICE_URL: 'localhost:50053',
      SEAT_SERVICE_URL: 'localhost:50054',
      BOOKING_SERVICE_URL: 'localhost:50055',
      AUTH_SERVICE_URL: 'localhost:50051',
      ANALYTICS_SERVICE_URL: 'localhost:50059',
    },
  },
};

const root = path.join(__dirname, '..');
const isWin = process.platform === 'win32';
const serviceKey = process.argv[2];
const setupOnly = process.argv.includes('--setup-only');

if (!serviceKey || !SERVICES[serviceKey]) {
  console.error('Usage: node scripts/start-dev-service.cjs <ai|gateway|trip|booking> [--setup-only]');
  process.exit(1);
}

const cfg = SERVICES[serviceKey];
const PORT = cfg.port;

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

function killPort(port) {
  const killed = new Set();
  const tag = `[${cfg.label}]`;

  if (isWin) {
    for (const pid of parseListeningPids(port)) {
      if (killed.has(pid)) continue;
      const name = getProcessName(pid);
      if (name && DOCKER_PROCESS_RE.test(name)) {
        console.log(`${tag} Bỏ qua port ${port} (PID ${pid} — ${name}, thuộc Docker)`);
        continue;
      }
      if (name && !/node|tsx/i.test(name)) {
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

function dockerPublished(port, nameMatch) {
  try {
    const out = execSync('docker ps --format "{{.Names}} {{.Ports}}"', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const hostPattern = new RegExp(`0\\.0\\.0\\.0:${port}->|:::${port}->|\\[::\\]:${port}->`);
    return out.split('\n').some((line) => line.includes(nameMatch) && hostPattern.test(line));
  } catch {
    return false;
  }
}

function stopDockerService(serviceName) {
  const tag = `[${cfg.label}]`;
  try {
    console.log(`${tag} Đang dừng Docker ${serviceName} để chuyển sang bản local...`);
    execSync(`docker compose stop ${serviceName}`, { stdio: 'inherit', cwd: root });
    execSync(`docker compose rm -f ${serviceName}`, { stdio: 'pipe', cwd: root });
    sleep(2000);
  } catch {
    console.log(`${tag} Không dừng được Docker ${serviceName} (có thể Docker chưa chạy).`);
  }
}

function runSetup() {
  if (dockerPublished(PORT, cfg.dockerMatch)) {
    stopDockerService(cfg.dockerService);
  }

  killPort(PORT);
  for (const p of cfg.extraPorts || []) killPort(p);
  sleep(500);

  if (serviceKey === 'gateway' && process.env.DEV_SKIP_BUILD !== '1') {
    console.log(`[${cfg.label}] Build @bus/shared (đồng bộ dist)...`);
    execSync('npm run build -w @bus/shared', { cwd: root, stdio: 'inherit', shell: true });
    console.log(`[${cfg.label}] Build api-gateway (đồng bộ schema GraphQL)...`);
    execSync('npm run build -w @bus/api-gateway', { cwd: root, stdio: 'inherit', shell: true });
  }

  if (serviceKey === 'trip') {
    console.log(`[${cfg.label}] Prisma generate trip-service...`);
    execSync('npx prisma generate', {
      cwd: path.join(root, 'services', 'trip-service'),
      stdio: 'inherit',
      shell: true,
    });
    console.log(`[${cfg.label}] Prisma db push trip-service...`);
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: path.join(root, 'services', 'trip-service'),
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...(cfg.env || {}) },
    });
    console.log(`[${cfg.label}] Seed trip-service...`);
    try {
      execSync('npx tsx prisma/seed.ts', {
        cwd: path.join(root, 'services', 'trip-service'),
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, ...(cfg.env || {}) },
      });
    } catch {
      console.warn(`[${cfg.label}] Seed bỏ qua (có thể đã có dữ liệu).`);
    }
  }

  if (serviceKey === 'booking') {
    console.log(`[${cfg.label}] Prisma db push booking-service...`);
    execSync('npx prisma db push --skip-generate', {
      cwd: path.join(root, 'services', 'booking-service'),
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...(cfg.env || {}) },
    });
  }
}

runSetup();

if (setupOnly) {
  process.exit(0);
}

console.log(`[${cfg.label}] Khởi động local trên port ${PORT}...`);

const child = spawn(`npm run dev -w ${cfg.workspace}`, {
  stdio: 'inherit',
  cwd: root,
  shell: true,
  env: { ...process.env, PORT, ...(cfg.env || {}) },
});

child.on('exit', (code) => process.exit(code ?? 0));
