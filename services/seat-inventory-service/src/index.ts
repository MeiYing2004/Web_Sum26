import * as grpc from '@grpc/grpc-js';
import { SeatInventoryService } from '@bus/proto';
import {
  createRedisClient,
  holdSeatsInRedis,
  releaseSeatInRedis,
  confirmSeatsInRedis,
  unbookSeatsInRedis,
  validateHoldTokenInRedis,
  getSeatStatuses,
  SEAT_HOLD_TTL_SECONDS,
  REDIS_KEYS,
  DEFAULT_LAYOUTS,
  extractSeatIds,
  parseLayoutJson,
  bootstrapServiceHealth,
  createLogger,
  logEvent,
  getGrpcRequestId,
} from '@bus/shared';

const logger = createLogger('seat-inventory-service');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const GRPC_PORT = process.env.GRPC_PORT || '50054';

const redis = createRedisClient(REDIS_URL);

async function getLayoutForTrip(tripId: string) {
  const busLayoutType = (await redis.get(REDIS_KEYS.tripBus(tripId))) || 'bus-29';
  const cached = await redis.get(REDIS_KEYS.busLayout(busLayoutType));
  if (cached) return { layoutType: busLayoutType, layout: parseLayoutJson(cached) };
  const layout = DEFAULT_LAYOUTS[busLayoutType] || DEFAULT_LAYOUTS['bus-29'];
  return { layoutType: busLayoutType, layout };
}

const seatServiceImpl = {
  GetSeatMap: async (
    call: grpc.ServerUnaryCall<{ trip_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const tripId = call.request.trip_id;
      const { layoutType, layout } = await getLayoutForTrip(tripId);
      const seatIds = extractSeatIds(layout);
      const statuses = await getSeatStatuses(redis, tripId, seatIds);

      const seats = seatIds.map((seatId) => {
        const s = statuses[seatId];
        return {
          seat_id: seatId,
          seat_label: seatId,
          status: s.status,
          held_by: s.heldBy || undefined,
          hold_ttl_seconds: s.ttl || undefined,
        };
      });

      callback(null, {
        trip_id: tripId,
        bus_layout: layoutType,
        seats,
        layout_json: JSON.stringify(layout),
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  HoldSeats: async (
    call: grpc.ServerUnaryCall<
      { trip_id: string; seat_ids: string[]; session_id: string; ttl_seconds: number },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { trip_id, seat_ids, session_id, ttl_seconds } = call.request;
      const result = await holdSeatsInRedis(
        redis,
        trip_id,
        seat_ids,
        session_id,
        ttl_seconds || SEAT_HOLD_TTL_SECONDS
      );

      logEvent(logger, 'holdSeats', {
        requestId: getGrpcRequestId(call),
        tripId: trip_id,
        seatIds: seat_ids,
        success: result.success,
      });

      callback(null, {
        success: result.success,
        hold_token: result.holdToken || '',
        expires_in_seconds: result.expiresInSeconds || 0,
        message: result.message,
        failed_seats: result.failedSeats,
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ReleaseSeats: async (
    call: grpc.ServerUnaryCall<
      { trip_id: string; seat_ids: string[]; hold_token: string },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { trip_id, seat_ids, hold_token } = call.request;
      const tokenData = await redis.get(`holdtoken:${hold_token}`);
      const sessionId = tokenData ? JSON.parse(tokenData).sessionId : '';

      for (const seatId of seat_ids) {
        await releaseSeatInRedis(redis, trip_id, seatId, sessionId);
      }
      callback(null, { success: true });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ValidateHold: async (
    call: grpc.ServerUnaryCall<
      { trip_id: string; hold_token: string; seat_ids: string[] },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { trip_id, hold_token, seat_ids } = call.request;
      const result = await validateHoldTokenInRedis(redis, trip_id, hold_token, seat_ids);
      callback(null, { valid: result.valid, message: result.message });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ConfirmSeats: async (
    call: grpc.ServerUnaryCall<
      { trip_id: string; seat_ids: string[]; hold_token: string; booking_id: string },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { trip_id, seat_ids, hold_token } = call.request;
      const result = await confirmSeatsInRedis(redis, trip_id, seat_ids, hold_token);
      callback(null, { success: result.success, message: result.message });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  BlockSeats: async (
    call: grpc.ServerUnaryCall<
      { trip_id: string; seat_ids: string[]; blocked: boolean },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { trip_id, seat_ids, blocked } = call.request;
      const key = `seats:${trip_id}:blocked`;
      if (blocked) {
        await redis.sadd(key, ...seat_ids);
      } else {
        await redis.srem(key, ...seat_ids);
      }
      callback(null, { success: true });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  UnbookSeats: async (
    call: grpc.ServerUnaryCall<{ trip_id: string; seat_ids: string[] }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { trip_id, seat_ids } = call.request;
      const result = await unbookSeatsInRedis(redis, trip_id, seat_ids);
      logEvent(logger, 'unbookSeats', {
        requestId: getGrpcRequestId(call),
        tripId: trip_id,
        seatIds: seat_ids,
        success: result.success,
      });
      callback(null, { success: result.success, message: result.message });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },
};

export function startSeatInventoryServer() {
  const server = new grpc.Server();
  server.addService(SeatInventoryService.service, seatServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
      console.error('Seat Inventory gRPC failed:', err);
      process.exit(1);
    }
    server.start();
    console.log(`Seat Inventory Service gRPC on ${port}`);
  });
  return server;
}

if (require.main === module) {
  bootstrapServiceHealth({
    service: 'seat-inventory-service',
    defaultPort: 9104,
    checkRedis: async () => (await redis.ping()) === 'PONG',
  });
  startSeatInventoryServer();
}

export { seatServiceImpl, redis };
