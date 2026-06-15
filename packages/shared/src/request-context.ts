import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  requestId: string;
  userId?: string | null;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestId(): string {
  return requestContext.getStore()?.requestId || 'no-request-id';
}

export function getUserId(): string | null {
  return requestContext.getStore()?.userId ?? null;
}

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return requestContext.run(ctx, fn);
}

export function newRequestId(headerValue?: string | string[]): string {
  if (typeof headerValue === 'string' && headerValue) return headerValue;
  if (Array.isArray(headerValue) && headerValue[0]) return headerValue[0];
  return uuidv4();
}
