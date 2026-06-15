import { holdSeatsInRedis, createRedisClient } from '@bus/shared';

/**
 * Test: hai người cùng đặt một ghế — chỉ một người thành công
 */
async function main() {
  const redis = createRedisClient(process.env.REDIS_URL || 'redis://localhost:6379');
  const tripId = 'test-trip-1';
  const seatId = 'A01';

  await redis.del(`hold:${tripId}:${seatId}`);
  await redis.srem(`seats:${tripId}:booked`, seatId);
  await redis.srem(`seats:${tripId}:held`, seatId);

  const [userA, userB] = await Promise.all([
    holdSeatsInRedis(redis, tripId, [seatId], 'user-a', 300),
    holdSeatsInRedis(redis, tripId, [seatId], 'user-b', 300),
  ]);

  const successes = [userA, userB].filter((r) => r.success);
  console.log('User A:', userA.success ? 'SUCCESS' : userA.message);
  console.log('User B:', userB.success ? 'SUCCESS' : userB.message);
  console.log(`Kết quả: ${successes.length === 1 ? 'PASS' : 'FAIL'} — chỉ 1 người giữ được ghế`);

  await redis.quit();
  process.exit(successes.length === 1 ? 0 : 1);
}

main().catch(console.error);
