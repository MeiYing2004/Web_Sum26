import pino from 'pino';

const SERVICE_NAME = process.env.SERVICE_NAME || 'bus-platform';

export const rootLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: SERVICE_NAME },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export function createLogger(service: string) {
  return rootLogger.child({ service });
}

export interface LogFields {
  requestId?: string;
  userId?: string | null;
  action?: string;
  [key: string]: unknown;
}

export function logEvent(
  logger: pino.Logger,
  action: string,
  fields: LogFields = {}
) {
  logger.info({
    timestamp: new Date().toISOString(),
    action,
    requestId: fields.requestId,
    userId: fields.userId ?? null,
    ...fields,
  });
}
