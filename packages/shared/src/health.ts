import http from 'http';

export type HealthStatus = 'connected' | 'disconnected' | 'n/a';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  db: HealthStatus;
  redis: HealthStatus;
  kafka?: HealthStatus;
  rabbitmq?: HealthStatus;
  timestamp: string;
}

export interface HealthOptions {
  service: string;
  port?: number;
  checkDb?: () => Promise<boolean>;
  checkRedis?: () => Promise<boolean>;
  checkKafka?: () => Promise<boolean>;
  checkRabbitmq?: () => Promise<boolean>;
}

async function runCheck(fn?: () => Promise<boolean>): Promise<HealthStatus> {
  if (!fn) return 'n/a';
  try {
    return (await fn()) ? 'connected' : 'disconnected';
  } catch {
    return 'disconnected';
  }
}

export async function buildHealthResponse(opts: HealthOptions): Promise<HealthCheckResult> {
  const [db, redis, kafka, rabbitmq] = await Promise.all([
    runCheck(opts.checkDb),
    runCheck(opts.checkRedis),
    runCheck(opts.checkKafka),
    runCheck(opts.checkRabbitmq),
  ]);

  const checks = [db, redis, kafka, rabbitmq].filter((c) => c !== 'n/a');
  const allOk = checks.every((c) => c === 'connected');
  const anyFail = checks.some((c) => c === 'disconnected');

  return {
    status: allOk ? 'ok' : anyFail ? 'degraded' : 'ok',
    service: opts.service,
    db,
    redis,
    ...(opts.checkKafka ? { kafka } : {}),
    ...(opts.checkRabbitmq ? { rabbitmq } : {}),
    timestamp: new Date().toISOString(),
  };
}

export function startHealthServer(opts: HealthOptions): http.Server {
  const port = opts.port || Number(process.env.HEALTH_PORT) || 9090;

  const server = http.createServer(async (req, res) => {
    if (req.url !== '/health' && req.url !== '/') {
      res.writeHead(404);
      res.end();
      return;
    }
    const body = await buildHealthResponse(opts);
    const code = body.status === 'error' ? 503 : 200;
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  });

  server.listen(port, () => {
    console.log(`[health] ${opts.service} → :${port}/health`);
  });

  return server;
}

export interface AggregateHealthEntry {
  name: string;
  url: string;
}

export async function aggregateHealth(services: AggregateHealthEntry[]) {
  const results = await Promise.all(
    services.map(async ({ name, url }) => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        return { name, ...data, httpStatus: res.status };
      } catch (err) {
        return {
          name,
          status: 'error',
          service: name,
          db: 'disconnected',
          redis: 'disconnected',
          error: String(err),
        };
      }
    })
  );

  const allOk = results.every((r) => r.status === 'ok');
  return {
    status: allOk ? 'ok' : 'degraded',
    service: 'platform-aggregator',
    timestamp: new Date().toISOString(),
    services: results,
  };
}
