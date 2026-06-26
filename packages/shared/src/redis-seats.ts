import Redis from 'ioredis';
import { REDIS_KEYS, SEAT_HOLD_TTL_SECONDS } from './constants';

function formatRedisError(err: unknown): string {
  if (err instanceof AggregateError) {
    const parts = err.errors
      ?.map((e) => (e instanceof Error ? e.message : String(e)))
      .filter(Boolean);
    if (parts?.length) return parts.join('; ');
    return err.message || 'ECONNREFUSED';
  }
  if (err instanceof Error && err.message) return err.message;
  return String(err);
}

export function createRedisClient(url: string): Redis {
  const client = new Redis(url, {
    // null = queue commands until connected (avoids MaxRetriesPerRequest crash during dev startup)
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      return Math.min(times * 500, 5000);
    },
  });

  let lastErrorLog = 0;
  client.on('error', (err) => {
    const now = Date.now();
    if (now - lastErrorLog > 10_000) {
      console.warn(`[redis] ${formatRedisError(err)}`);
      lastErrorLog = now;
    }
  });

  return client;
}

export interface HoldResult {
  success: boolean;
  holdToken?: string;
  expiresInSeconds?: number;
  message: string;
  failedSeats: string[];
}

/**
 * Concurrency-safe seat hold using Redis SET NX + distributed lock
 */
export async function holdSeatsInRedis(
  redis: Redis,
  tripId: string,
  seatIds: string[],
  sessionId: string,
  ttlSeconds = SEAT_HOLD_TTL_SECONDS
): Promise<HoldResult> {
  const holdToken = `hold_${tripId}_${sessionId}_${Date.now()}`;
  const failedSeats: string[] = [];
  const heldSeats: string[] = [];

  for (const seatId of seatIds) {
    const lockKey = REDIS_KEYS.seatHoldLock(tripId, seatId);
    const holdKey = REDIS_KEYS.seatHold(tripId, seatId);

    const lockAcquired = await redis.set(lockKey, sessionId, 'EX', 10, 'NX');
    if (!lockAcquired) {
      failedSeats.push(seatId);
      continue;
    }

    try {
      const existing = await redis.get(holdKey);
      if (existing && existing !== sessionId) {
        failedSeats.push(seatId);
        continue;
      }

      const booked = await redis.sismember(REDIS_KEYS.seatStatus(tripId) + ':booked', seatId);
      const blocked = await redis.sismember(REDIS_KEYS.seatStatus(tripId) + ':blocked', seatId);
      if (booked || blocked) {
        failedSeats.push(seatId);
        continue;
      }

      const set = await redis.set(holdKey, sessionId, 'EX', ttlSeconds, 'NX');
      if (!set && (await redis.get(holdKey)) !== sessionId) {
        failedSeats.push(seatId);
        continue;
      }

      await redis.expire(holdKey, ttlSeconds);
      await redis.sadd(REDIS_KEYS.seatStatus(tripId) + ':held', seatId);
      heldSeats.push(seatId);
    } finally {
      await redis.del(lockKey);
    }
  }

  if (failedSeats.length > 0) {
    for (const seatId of heldSeats) {
      await releaseSeatInRedis(redis, tripId, seatId, sessionId);
    }
    return {
      success: false,
      message: `Ghế đã bị giữ hoặc đã đặt: ${failedSeats.join(', ')}`,
      failedSeats,
    };
  }

  await redis.set(
    REDIS_KEYS.holdToken(holdToken),
    JSON.stringify({ tripId, seatIds, sessionId }),
    'EX',
    ttlSeconds
  );

  return {
    success: true,
    holdToken,
    expiresInSeconds: ttlSeconds,
    message: 'Giữ ghế thành công',
    failedSeats: [],
  };
}

export async function releaseSeatInRedis(
  redis: Redis,
  tripId: string,
  seatId: string,
  sessionId: string
): Promise<boolean> {
  const holdKey = REDIS_KEYS.seatHold(tripId, seatId);
  const current = await redis.get(holdKey);
  if (current === sessionId) {
    await redis.del(holdKey);
    await redis.srem(REDIS_KEYS.seatStatus(tripId) + ':held', seatId);
    return true;
  }
  return false;
}

export async function confirmSeatsInRedis(
  redis: Redis,
  tripId: string,
  seatIds: string[],
  holdToken: string
): Promise<{ success: boolean; message: string }> {
  const tokenData = await redis.get(REDIS_KEYS.holdToken(holdToken));
  if (!tokenData) {
    return { success: false, message: 'Hold token hết hạn hoặc không hợp lệ' };
  }

  const parsed = JSON.parse(tokenData) as { tripId: string; seatIds: string[]; sessionId: string };
  if (parsed.tripId !== tripId) {
    return { success: false, message: 'Hold token không khớp chuyến xe' };
  }

  const expected = [...parsed.seatIds].sort().join(',');
  const requested = [...seatIds].sort().join(',');
  if (expected !== requested) {
    return { success: false, message: 'Hold token không khớp danh sách ghế' };
  }

  for (const seatId of seatIds) {
    const holdKey = REDIS_KEYS.seatHold(tripId, seatId);
    await redis.del(holdKey);
    await redis.srem(REDIS_KEYS.seatStatus(tripId) + ':held', seatId);
    await redis.sadd(REDIS_KEYS.seatStatus(tripId) + ':booked', seatId);
  }

  await redis.del(REDIS_KEYS.holdToken(holdToken));
  return { success: true, message: 'Xác nhận ghế thành công' };
}

export async function validateHoldTokenInRedis(
  redis: Redis,
  tripId: string,
  holdToken: string,
  seatIds: string[]
): Promise<{ valid: boolean; message: string }> {
  const token = holdToken?.trim();
  if (!token) {
    return { valid: false, message: 'Thiếu mã giữ ghế' };
  }

  const tokenData = await redis.get(REDIS_KEYS.holdToken(token));
  if (!tokenData) {
    return { valid: false, message: 'Mã giữ ghế hết hạn hoặc không hợp lệ' };
  }

  let parsed: { tripId: string; seatIds: string[]; sessionId: string };
  try {
    parsed = JSON.parse(tokenData) as { tripId: string; seatIds: string[]; sessionId: string };
  } catch {
    return { valid: false, message: 'Mã giữ ghế không hợp lệ' };
  }

  if (parsed.tripId !== tripId) {
    return { valid: false, message: 'Mã giữ ghế không khớp chuyến xe' };
  }

  const expected = [...parsed.seatIds].sort().join(',');
  const requested = [...seatIds].sort().join(',');
  if (expected !== requested) {
    return { valid: false, message: 'Mã giữ ghế không khớp ghế đã chọn' };
  }

  for (const seatId of seatIds) {
    const holdKey = REDIS_KEYS.seatHold(tripId, seatId);
    const heldBy = await redis.get(holdKey);
    if (!heldBy || heldBy !== parsed.sessionId) {
      return { valid: false, message: `Ghế ${seatId} không còn được giữ` };
    }
  }

  return { valid: true, message: 'OK' };
}

/** Release every held seat for a trip (e.g. after departure). */
export async function releaseAllTripHolds(redis: Redis, tripId: string): Promise<number> {
  const heldKey = REDIS_KEYS.seatStatus(tripId) + ':held';
  const heldSeats = await redis.smembers(heldKey);
  let released = 0;

  for (const seatId of heldSeats) {
    const holdKey = REDIS_KEYS.seatHold(tripId, seatId);
    const sessionId = await redis.get(holdKey);
    if (sessionId) {
      const ok = await releaseSeatInRedis(redis, tripId, seatId, sessionId);
      if (ok) released += 1;
    } else {
      await redis.del(holdKey);
      await redis.srem(heldKey, seatId);
      released += 1;
    }
  }

  return released;
}

export async function unbookSeatsInRedis(
  redis: Redis,
  tripId: string,
  seatIds: string[]
): Promise<{ success: boolean; message: string }> {
  const bookedKey = REDIS_KEYS.seatStatus(tripId) + ':booked';
  for (const seatId of seatIds) {
    await redis.srem(bookedKey, seatId);
  }
  return { success: true, message: 'Đã giải phóng ghế đã đặt' };
}

export async function getSeatStatuses(
  redis: Redis,
  tripId: string,
  allSeatIds: string[]
): Promise<Record<string, { status: string; heldBy?: string; ttl?: number }>> {
  const result: Record<string, { status: string; heldBy?: string; ttl?: number }> = {};

  const [booked, blocked, held] = await Promise.all([
    redis.smembers(REDIS_KEYS.seatStatus(tripId) + ':booked'),
    redis.smembers(REDIS_KEYS.seatStatus(tripId) + ':blocked'),
    redis.smembers(REDIS_KEYS.seatStatus(tripId) + ':held'),
  ]);

  const bookedSet = new Set(booked);
  const blockedSet = new Set(blocked);
  const heldSet = new Set(held);

  for (const seatId of allSeatIds) {
    if (blockedSet.has(seatId)) {
      result[seatId] = { status: 'BLOCKED' };
    } else if (bookedSet.has(seatId)) {
      result[seatId] = { status: 'BOOKED' };
    } else if (heldSet.has(seatId)) {
      const holdKey = REDIS_KEYS.seatHold(tripId, seatId);
      const heldBy = await redis.get(holdKey);
      const ttl = await redis.ttl(holdKey);
      result[seatId] = { status: 'HELD', heldBy: heldBy ?? undefined, ttl: ttl > 0 ? ttl : undefined };
    } else {
      result[seatId] = { status: 'AVAILABLE' };
    }
  }

  return result;
}

export { REDIS_KEYS, SEAT_HOLD_TTL_SECONDS };
