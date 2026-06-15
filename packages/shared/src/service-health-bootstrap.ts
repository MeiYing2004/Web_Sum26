/**
 * Bootstrap health HTTP server for microservices.
 * Import and call from each service index.ts — does not alter business logic.
 */
import { startHealthServer } from './health';

export interface ServiceHealthConfig {
  service: string;
  defaultPort: number;
  checkDb?: () => Promise<boolean>;
  checkRedis?: () => Promise<boolean>;
  checkKafka?: () => Promise<boolean>;
  checkRabbitmq?: () => Promise<boolean>;
}

export function bootstrapServiceHealth(config: ServiceHealthConfig) {
  return startHealthServer({
    service: config.service,
    port: Number(process.env.HEALTH_PORT) || config.defaultPort,
    checkDb: config.checkDb,
    checkRedis: config.checkRedis,
    checkKafka: config.checkKafka,
    checkRabbitmq: config.checkRabbitmq,
  });
}
