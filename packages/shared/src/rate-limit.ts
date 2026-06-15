import Redis from 'ioredis';
import { REDIS_KEYS } from './constants';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/** Sliding window rate limit via Redis INCR + EXPIRE */
export async function checkRateLimit(
  redis: Redis,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  const ttl = await redis.ttl(key);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
  };
}

export async function checkLookupRateLimit(redis: Redis, ip: string): Promise<RateLimitResult> {
  return checkRateLimit(redis, REDIS_KEYS.rateLookup(ip), 10, 60);
}
