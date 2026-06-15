import * as grpc from '@grpc/grpc-js';
import { TripService, SeatInventoryService, BookingService, AuthService, AnalyticsService } from '@bus/proto';
import { createRedisClient, checkLookupRateLimit } from '@bus/shared';

const TRIP_URL = process.env.TRIP_SERVICE_URL || 'localhost:50053';
const SEAT_URL = process.env.SEAT_SERVICE_URL || 'localhost:50054';
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'localhost:50055';
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'localhost:50051';
const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'localhost:50059';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createRedisClient(REDIS_URL);

export interface GatewayContext {
  user: { userId: string; role: string } | null;
  clientIp: string;
  requestId: string;
  tripClient: InstanceType<typeof TripService>;
  seatClient: InstanceType<typeof SeatInventoryService>;
  bookingClient: InstanceType<typeof BookingService>;
  authClient: InstanceType<typeof AuthService>;
  analyticsClient: InstanceType<typeof AnalyticsService>;
}

export async function createContext(authHeader?: string, clientIp = '0.0.0.0', requestId = 'unknown'): Promise<GatewayContext> {
  let user: { userId: string; role: string } | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const authClient = new AuthService(AUTH_URL, grpc.credentials.createInsecure());
    const validated = await new Promise<{ valid: boolean; user_id: string; role: string }>((resolve, reject) => {
      authClient.ValidateToken({ token }, (err: Error | null, res: { valid: boolean; user_id: string; role: string }) =>
        err ? reject(err) : resolve(res)
      );
    });
    if (validated.valid) {
      user = { userId: validated.user_id, role: validated.role };
    }
  }

  return {
    user,
    clientIp,
    requestId,
    tripClient: new TripService(TRIP_URL, grpc.credentials.createInsecure()),
    seatClient: new SeatInventoryService(SEAT_URL, grpc.credentials.createInsecure()),
    bookingClient: new BookingService(BOOKING_URL, grpc.credentials.createInsecure()),
    authClient: new AuthService(AUTH_URL, grpc.credentials.createInsecure()),
    analyticsClient: new AnalyticsService(ANALYTICS_URL, grpc.credentials.createInsecure()),
  };
}

export function requireRole(ctx: GatewayContext, roles: string[]) {
  if (!ctx.user || !roles.includes(ctx.user.role)) {
    throw new Error('Forbidden — insufficient permissions');
  }
}

export async function enforceLookupRateLimit(ctx: GatewayContext) {
  const result = await checkLookupRateLimit(redis, ctx.clientIp);
  if (!result.allowed) {
    throw new Error(`Rate limit exceeded. Thử lại sau ${result.retryAfterSeconds}s`);
  }
}
