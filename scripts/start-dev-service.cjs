/**
 * Khởi động service local — tự dừng Docker + giải phóng port trước khi chạy.
 * Usage: node scripts/start-dev-service.cjs <ai|gateway>
 */
const { execSync, spawn } = require('child_process');
const path = require('path');

const SERVICES = {
  ai: {
    port: process.env.PORT || '50060',
    dockerService: 'ai-service',
    dockerMatch: 'ai-service',
    workspace: '@bus/ai-service',
    label: 'dev:ai',
  },
  gateway: {
    port: process.env.PORT || '4000',
    dockerService: 'api-gateway',
    dockerMatch: 'api-gateway',
    workspace: '@bus/api-gateway',
    label: 'dev:gateway',
    env: {
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

if (!serviceKey || !SERVICES[serviceKey]) {
  console.error('Usage: node scripts/start-dev-service.cjs <ai|gateway>');
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

function killPort(port) {
  const killed = new Set();
  const tag = `[${cfg.label}]`;

  if (isWin) {
    try {
      const out = execSync(`netstat -ano | findstr ":${port}" | findstr LISTENING`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
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
    sleep(1500);
  } catch {
    console.log(`${tag} Không dừng được Docker ${serviceName} (có thể Docker chưa chạy).`);
  }
}

if (dockerPublished(PORT, cfg.dockerMatch)) {
  stopDockerService(cfg.dockerService);
}

killPort(PORT);
sleep(500);

console.log(`[${cfg.label}] Khởi động local trên port ${PORT}...`);

const child = spawn(`npm run dev -w ${cfg.workspace}`, {
  stdio: 'inherit',
  cwd: root,
  shell: true,
  env: { ...process.env, PORT, ...(cfg.env || {}) },
});

child.on('exit', (code) => process.exit(code ?? 0));
