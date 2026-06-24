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
  vnDayBounds,
  parseTravelDate,
  matchLocation,
  resolveLocationAlias,
  getTripAvailability,
  filterByDepartureDate,
  departureTimeVN,
  TRIP_STATUS,
} from '@bus/shared';
import { createAdminCrudHandlers } from './admin-crud';

const prisma = new PrismaClient();
const redis = createRedisClient(process.env.REDIS_URL || 'redis://localhost:6379');
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const GRPC_PORT = process.env.GRPC_PORT || '50053';

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
  const activeRoutes = await prisma.trip.findMany({
    where: {
      status: TRIP_STATUS.ACTIVE,
      departureTime: { gte: new Date() },
    },
    include: { route: true },
  });
  const activeLocationSet = new Set<string>();
  for (const trip of activeRoutes) {
    activeLocationSet.add(trip.route.origin);
    activeLocationSet.add(trip.route.destination);
  }
  const locations = await prisma.location.findMany({ take: 200 });
  const suggestions = locations
    .filter((l) => activeLocationSet.has(l.name) && normalizeVietnamese(l.name).includes(normQ))
    .map((l) => ({
      id: l.id,
      name: l.name,
      type: l.type,
      score: activeLocationSet.has(l.name) ? 100 : 0,
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

async function getRouteCatalog(travelDateRaw: string, limit?: number) {
  const travelDate = parseTravelDate(travelDateRaw);
  const { start, end } = vnDayBounds(travelDate);
  const trips = await prisma.trip.findMany({
    where: {
      status: TRIP_STATUS.ACTIVE,
      departureTime: { gte: start, lte: end },
    },
    include: { route: true },
    orderBy: { departureTime: 'asc' },
  });

  const routeMap = new Map<
    string,
    {
      origin: string;
      destination: string;
      trips_count: number;
      min_price: number;
      duration_minutes: number;
      next_departure_time: string;
    }
  >();
  const locations = new Set<string>();

  for (const trip of trips) {
    const origin = trip.route.origin;
    const destination = trip.route.destination;
    locations.add(origin);
    locations.add(destination);
    const key = `${origin}__${destination}`;
    const duration = durationMinutes(trip.departureTime, trip.arrivalTime);
    const departureIso = trip.departureTime.toISOString();
    const current = routeMap.get(key);
    if (!current) {
      routeMap.set(key, {
        origin,
        destination,
        trips_count: 1,
        min_price: trip.price,
        duration_minutes: duration,
        next_departure_time: departureIso,
      });
      continue;
    }
    current.trips_count += 1;
    if (trip.price < current.min_price) current.min_price = trip.price;
    if (duration < current.duration_minutes) current.duration_minutes = duration;
  }

  let routes = [...routeMap.values()].sort(
    (a, b) => b.trips_count - a.trips_count || a.next_departure_time.localeCompare(b.next_departure_time)
  );
  if (limit && limit > 0) routes = routes.slice(0, limit);
  return {
    locations: [...locations].sort((a, b) => a.localeCompare(b, 'vi')),
    routes,
  };
}

async function resolveLocationName(input: string): Promise<string> {
  const alias = resolveLocationAlias(input);
  const locations = await prisma.location.findMany();
  const names = locations.map((l) => l.name);
  return matchLocation(alias, names) ?? alias;
}

type TripResult = {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  operator_name: string;
  bus_type: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  duration_minutes: number;
  bookable: boolean;
  availability_status: string;
  availability_label: string;
};

type TripSearchBase = Omit<TripResult, 'bookable' | 'availability_status' | 'availability_label'>;

function applyTripFilters(
  results: TripSearchBase[],
  params: {
    departure_time_from?: string;
    departure_time_to?: string;
    min_seats?: number;
    sort_by?: string;
  }
) {
  let filtered = [...results];

  if (params.departure_time_from) {
    const from = params.departure_time_from.slice(0, 5);
    filtered = filtered.filter((t) => departureTimeVN(t.departure_time) >= from);
  }
  if (params.departure_time_to) {
    const to = params.departure_time_to.slice(0, 5);
    filtered = filtered.filter((t) => departureTimeVN(t.departure_time) <= to);
  }
  if (params.min_seats) {
    filtered = filtered.filter((t) => t.available_seats >= params.min_seats!);
  }

  switch (params.sort_by) {
    case 'cheapest':
    case 'PRICE_ASC':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'PRICE_DESC':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'shortest':
    case 'DURATION_SHORT':
      filtered.sort((a, b) => a.duration_minutes - b.duration_minutes);
      break;
    case 'earliest':
    case 'DEPART_EARLY':
    default:
      filtered.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  }

  return filtered;
}

function applyTripAvailability(results: TripSearchBase[], travelDate: string): TripResult[] {
  return filterByDepartureDate(results, travelDate).map((t) => {
    const av = getTripAvailability(travelDate, t.departure_time, new Date(), t.available_seats);
    return {
      ...t,
      bookable: av.bookable,
      availability_status: av.availabilityStatus,
      availability_label: av.availabilityLabel,
    };
  });
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
  const travelDate = parseTravelDate(params.travel_date);
  const resolvedOrigin = await resolveLocationName(params.origin);
  const resolvedDestination = await resolveLocationName(params.destination);
  const cacheKey = REDIS_KEYS.searchCache(resolvedOrigin, resolvedDestination, travelDate);

  let baseResults: TripSearchBase[];

  const cached = await redis.get(cacheKey);
  if (cached) {
    baseResults = JSON.parse(cached);
  } else {
    const { start, end } = vnDayBounds(travelDate);

    const trips = await prisma.trip.findMany({
      where: {
        status: TRIP_STATUS.ACTIVE,
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

    baseResults = filterByDepartureDate(
      trips.map((t) => {
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
          available_seats: Math.max(0, t.bus.seatCount - 5),
          duration_minutes: durationMinutes(t.departureTime, t.arrivalTime),
        };
      }),
      travelDate
    );

    await redis.setex(cacheKey, 300, JSON.stringify(baseResults));
    publishSearchEvent(KAFKA_BROKERS, {
      keyword: `${resolvedOrigin}-${resolvedDestination}`,
      origin: resolvedOrigin,
      destination: resolvedDestination,
      travelDate,
      resultCount: baseResults.length,
      userId: params.user_id ?? null,
    }).catch(() => {});
  }

  return applyTripAvailability(applyTripFilters(baseResults, params), travelDate);
}

const tripServiceImpl = {
  ...createAdminCrudHandlers(prisma, redis),

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
      const travelDate = parseTravelDate(call.request.travel_date);
      const origin = await resolveLocationName(call.request.origin);
      const destination = await resolveLocationName(call.request.destination);
      const { start } = vnDayBounds(travelDate);
      const trip = await prisma.trip.findFirst({
        where: {
          status: TRIP_STATUS.ACTIVE,
          route: { origin, destination },
          departureTime: { gte: start },
        },
        orderBy: { departureTime: 'asc' },
      });
      callback(null, { nearest_date: trip ? formatDateFromTrip(trip.departureTime) : null });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  CountActiveTrips: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const count = await prisma.trip.count({
        where: {
          status: TRIP_STATUS.ACTIVE,
          departureTime: { gte: new Date() },
        },
      });
      callback(null, { count });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetRouteCatalog: async (
    call: grpc.ServerUnaryCall<{ travel_date?: string; limit?: number }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const catalog = await getRouteCatalog(call.request.travel_date || formatDateFromTrip(new Date()), call.request.limit);
      callback(null, catalog);
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },
};

function formatDateFromTrip(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
}

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
