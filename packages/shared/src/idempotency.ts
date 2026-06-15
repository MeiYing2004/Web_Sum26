import Redis from 'ioredis';
import { REDIS_KEYS } from './constants';

export interface IdempotencyResult<T> {
  cached: boolean;
  value: T;
}

/** Returns cached result if key exists; otherwise runs fn and caches result */
export async function withIdempotency<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<IdempotencyResult<T>> {
  const redisKey = REDIS_KEYS.idempotency(key);
  const existing = await redis.get(redisKey);
  if (existing) {
    return { cached: true, value: JSON.parse(existing) as T };
  }

  const lockKey = `${redisKey}:lock`;
  const acquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');
  if (!acquired) {
    await new Promise((r) => setTimeout(r, 200));
    const retry = await redis.get(redisKey);
    if (retry) return { cached: true, value: JSON.parse(retry) as T };
    throw new Error('Idempotency lock timeout');
  }

  try {
    const result = await fn();
    await redis.set(redisKey, JSON.stringify(result), 'EX', ttlSeconds);
    return { cached: false, value: result };
  } finally {
    await redis.del(lockKey);
  }
}

export async function isProcessed(redis: Redis, key: string): Promise<boolean> {
  return (await redis.exists(REDIS_KEYS.idempotency(key))) === 1;
}

export async function markProcessed(redis: Redis, key: string, ttlSeconds = 86400): Promise<void> {
  await redis.set(REDIS_KEYS.idempotency(key), '1', 'EX', ttlSeconds);
}
