import { PrismaClient, TripStatus } from './generated/client';
import type { Redis } from 'ioredis';
import {
  nextPersistedTripStatus,
  releaseAllTripHolds,
  TRIP_STATUS,
} from '@bus/shared';

type TripRow = {
  id: string;
  status: TripStatus;
  departureTime: Date;
  arrivalTime: Date;
};

export async function syncTripStatusIfNeeded(
  prisma: PrismaClient,
  redis: Redis,
  trip: TripRow,
  now: Date = new Date()
): Promise<TripStatus> {
  const next = nextPersistedTripStatus(
    trip.status,
    trip.departureTime.toISOString(),
    trip.arrivalTime.toISOString(),
    now
  );

  if (!next) return trip.status;

  await prisma.trip.update({
    where: { id: trip.id },
    data: { status: next },
  });

  if (next === TRIP_STATUS.DEPARTED || next === TRIP_STATUS.COMPLETED) {
    await releaseAllTripHolds(redis, trip.id);
  }

  return next;
}

export async function syncTripsBatch(
  prisma: PrismaClient,
  redis: Redis,
  trips: TripRow[],
  now: Date = new Date()
): Promise<Map<string, TripStatus>> {
  const statuses = new Map<string, TripStatus>();
  for (const trip of trips) {
    statuses.set(trip.id, await syncTripStatusIfNeeded(prisma, redis, trip, now));
  }
  return statuses;
}

export function startTripStatusSyncJob(
  prisma: PrismaClient,
  redis: Redis,
  intervalMs = 60_000
): NodeJS.Timeout {
  const tick = async () => {
    try {
      const now = new Date();
      const trips = await prisma.trip.findMany({
        where: {
          status: { in: [TRIP_STATUS.ACTIVE, TRIP_STATUS.DEPARTED] },
          departureTime: { lte: now },
        },
        select: { id: true, status: true, departureTime: true, arrivalTime: true },
      });
      await syncTripsBatch(prisma, redis, trips, now);
    } catch {
      /* background sync — ignore transient errors */
    }
  };

  void tick();
  return setInterval(() => void tick(), intervalMs);
}
