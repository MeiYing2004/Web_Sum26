import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { TripService } from '@bus/proto';
import {
  createRedisClient,
  publishSearchEvent,
  REDIS_KEYS,
  DEFAULT_LAYOUTS,
  extractSeatIds,
  parseLayoutJson,
  sanitizeString,
  bootstrapServiceHealth,
  normalizeVietnamese,
} from '@bus/shared';

const prisma = new PrismaClient();
const redis = createRedisClient(process.env.REDIS_URL || 'redis://localhost:6379');
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const GRPC_PORT = process.env.GRPC_PORT || '50053';

const POPULAR_ROUTES = [
  { origin: 'TP.HCM', destination: 'Đà Lạt' },
  { origin: 'TP.HCM', destination: 'Nha Trang' },
  { origin: 'TP.HCM', destination: 'Cần Thơ' },
  { origin: 'Hà Nội', destination: 'Đà Nẵng' },
];

function durationMinutes(dep: Date, arr: Date) {
  return Math.round((arr.getTime() - dep.getTime()) / 60000);
}

async function cacheBusLayouts() {
  for (const [layoutType, layout] of Object.entries(DEFAULT_LAYOUTS)) {
    await redis.set(REDIS_KEYS.busLayout(layoutType), JSON.stringify(layout));
  }
}

async function autocompleteWithCache(query: string) {
  const q = sanitizeString(query, 50);
  if (q.length < 1) return [];

  const cacheKey = REDIS_KEYS.autocomplete(normalizeVietnamese(q));
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const normQ = normalizeVietnamese(q);
  const locations = await prisma.location.findMany({ take: 50 });
  const suggestions = locations
    .filter((l) => normalizeVietnamese(l.name).includes(normQ))
    .map((l) => ({
      id: l.id,
      name: l.name,
      type: l.type,
      score: POPULAR_ROUTES.some((r) => r.origin === l.name || r.destination === l.name) ? 100 : 0,
    }));

  suggestions.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const result = suggestions.slice(0, 10);
  await redis.setex(cacheKey, 600, JSON.stringify(result));

  publishSearchEvent(KAFKA_BROKERS, {
    keyword: q,
    origin: q,
    destination: '',
    travelDate: new Date().toISOString().split('T')[0],
    resultCount: result.length,
    userId: null,
  }).catch(() => {});

  return result;
}

async function resolveLocationName(input: string): Promise<string | null> {
  const norm = normalizeVietnamese(input);
  const locations = await prisma.location.findMany();
  return locations.find((l) => normalizeVietnamese(l.name) === norm)?.name ?? null;
}

async function searchTrips(params: {
  origin: string;
  destination: string;
  travel_date: string;
  operator_filter?: string;
  bus_type_filter?: string;
  min_price?: number;
  max_price?: number;
  departure_time_from?: string;
  departure_time_to?: string;
  min_seats?: number;
  sort_by?: string;
  user_id?: string | null;
}) {
  const resolvedOrigin = (await resolveLocationName(params.origin)) ?? params.origin;
  const resolvedDestination = (await resolveLocationName(params.destination)) ?? params.destination;
  const cacheKey = REDIS_KEYS.searchCache(resolvedOrigin, resolvedDestination, params.travel_date);
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const date = new Date(params.travel_date);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const trips = await prisma.trip.findMany({
    where: {
      status: 'ACTIVE',
      route: { origin: resolvedOrigin, destination: resolvedDestination },
      departureTime: { gte: start, lte: end },
      ...(params.operator_filter
        ? { operator: { name: { contains: params.operator_filter } } }
        : {}),
      ...(params.bus_type_filter ? { bus: { busType: { contains: params.bus_type_filter } } } : {}),
      ...(params.min_price ? { price: { gte: params.min_price } } : {}),
      ...(params.max_price ? { price: { lte: params.max_price } } : {}),
    },
    include: { route: true, bus: true, operator: true },
  });

  let results = trips.map((t) => {
    redis.set(REDIS_KEYS.tripBus(t.id), t.bus.layoutType);
    return {
      id: t.id,
      route_name: t.route.name,
      origin: t.route.origin,
      destination: t.route.destination,
      operator_name: t.operator.name,
      bus_type: t.bus.busType,
      departure_time: t.departureTime.toISOString(),
      arrival_time: t.arrivalTime.toISOString(),
      price: t.price,
      available_seats: t.bus.seatCount - 5,
      duration_minutes: durationMinutes(t.departureTime, t.arrivalTime),
    };
  });

  if (params.departure_time_from) {
    results = results.filter((t) => t.departure_time >= params.departure_time_from!);
  }
  if (params.departure_time_to) {
    results = results.filter((t) => t.departure_time <= params.departure_time_to!);
  }
  if (params.min_seats) {
    results = results.filter((t) => t.available_seats >= params.min_seats!);
  }

  switch (params.sort_by) {
    case 'cheapest':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'earliest':
      results.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
      break;
    case 'shortest':
      results.sort((a, b) => a.duration_minutes - b.duration_minutes);
      break;
  }

  await redis.setex(cacheKey, 300, JSON.stringify(results));
  publishSearchEvent(KAFKA_BROKERS, {
    keyword: `${resolvedOrigin}-${resolvedDestination}`,
    origin: resolvedOrigin,
    destination: resolvedDestination,
    travelDate: params.travel_date,
    resultCount: results.length,
    userId: params.user_id ?? null,
  }).catch(() => {});

  return results;
}

const tripServiceImpl = {
  SearchTrips: async (call: grpc.ServerUnaryCall<Record<string, unknown>, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const trips = await searchTrips(call.request as Parameters<typeof searchTrips>[0]);
      callback(null, { trips });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetTripDetail: async (call: grpc.ServerUnaryCall<{ trip_id: string }, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const t = await prisma.trip.findUnique({
        where: { id: call.request.trip_id },
        include: { route: true, bus: true, operator: true },
      });
      if (!t) return callback({ code: grpc.status.NOT_FOUND, message: 'Trip not found' } as grpc.ServiceError, null);

      const layoutJson =
        t.bus.seatLayoutJson && Object.keys(t.bus.seatLayoutJson as object).length > 0
          ? JSON.stringify(t.bus.seatLayoutJson)
          : JSON.stringify(DEFAULT_LAYOUTS[t.bus.layoutType] || DEFAULT_LAYOUTS['bus-29']);

      await redis.set(REDIS_KEYS.tripBus(t.id), t.bus.layoutType);
      await redis.set(REDIS_KEYS.busLayout(t.bus.layoutType), layoutJson);

      callback(null, {
        id: t.id,
        route_name: t.route.name,
        origin: t.route.origin,
        destination: t.route.destination,
        pickup_point: t.pickupPoint,
        dropoff_point: t.dropoffPoint,
        operator_name: t.operator.name,
        bus_type: t.bus.busType,
        departure_time: t.departureTime.toISOString(),
        arrival_time: t.arrivalTime.toISOString(),
        price: t.price,
        cancellation_policy: t.cancellationPolicy,
        bus_id: t.busId,
        bus_plate: t.bus.plate,
        total_seats: t.bus.seatCount,
        seat_layout_json: layoutJson,
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  AutocompleteLocations: async (call: grpc.ServerUnaryCall<{ query: string }, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const suggestions = await autocompleteWithCache(call.request.query);
      callback(null, { suggestions });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  SuggestNearestDate: async (
    call: grpc.ServerUnaryCall<{ origin: string; destination: string; travel_date: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const after = new Date(call.request.travel_date);
      const trip = await prisma.trip.findFirst({
        where: {
          status: 'ACTIVE',
          route: { origin: call.request.origin, destination: call.request.destination },
          departureTime: { gte: after },
        },
        orderBy: { departureTime: 'asc' },
      });
      callback(null, { nearest_date: trip?.departureTime.toISOString().split('T')[0] || null });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },
};

async function startServer() {
  await cacheBusLayouts();
  const server = new grpc.Server();
  server.addService(TripService.service, tripServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    server.start();
    console.log(`Trip Service gRPC on ${port}`);
  });
}

if (require.main === module) {
  bootstrapServiceHealth({
    service: 'trip-service',
    defaultPort: 9103,
    checkDb: async () => {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    },
    checkRedis: async () => (await redis.ping()) === 'PONG',
  });
  startServer();
}

export { tripServiceImpl, searchTrips, prisma, autocompleteWithCache };
