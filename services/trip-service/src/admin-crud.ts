import * as grpc from '@grpc/grpc-js';
import { PrismaClient, TripStatus } from '@prisma/client';
import type { Redis } from 'ioredis';
import {
  DEFAULT_LAYOUTS,
  TRIP_STATUS,
  isValidTripStatus,
  sanitizeString,
  parseTravelDate,
  vnDayBounds,
} from '@bus/shared';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function pageParams(page?: number, pageSize?: number) {
  const p = Math.max(1, page || 1);
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize || DEFAULT_PAGE_SIZE));
  return { skip: (p - 1) * size, take: size, page: p, pageSize: size };
}

function grpcError(code: grpc.status, message: string): grpc.ServiceError {
  return { code, message } as grpc.ServiceError;
}

function mapRoute(route: {
  id: string;
  name: string;
  origin: string;
  destination: string;
  createdAt: Date;
  stops: Array<{ id: string; name: string; order: number }>;
}) {
  return {
    id: route.id,
    name: route.name,
    origin: route.origin,
    destination: route.destination,
    stops: route.stops.map((s) => ({ id: s.id, name: s.name, order: s.order })),
    created_at: route.createdAt.toISOString(),
  };
}

function mapStop(stop: {
  id: string;
  routeId: string;
  name: string;
  order: number;
  route: { name: string };
}) {
  return {
    id: stop.id,
    route_id: stop.routeId,
    route_name: stop.route.name,
    name: stop.name,
    order: stop.order,
  };
}

function mapBus(bus: {
  id: string;
  plate: string;
  busType: string;
  seatCount: number;
  layoutType: string;
  seatLayoutJson: unknown;
  operatorId: string;
  operator: { name: string };
}) {
  const layoutJson =
    bus.seatLayoutJson && Object.keys(bus.seatLayoutJson as object).length > 0
      ? JSON.stringify(bus.seatLayoutJson)
      : JSON.stringify(DEFAULT_LAYOUTS[bus.layoutType] || DEFAULT_LAYOUTS['bus-29']);
  return {
    id: bus.id,
    plate: bus.plate,
    bus_type: bus.busType,
    seat_count: bus.seatCount,
    layout_type: bus.layoutType,
    seat_layout_json: layoutJson,
    operator_id: bus.operatorId,
    operator_name: bus.operator.name,
  };
}

function mapAdminTrip(t: {
  id: string;
  routeId: string;
  busId: string;
  operatorId: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  status: TripStatus;
  pickupPoint: string;
  dropoffPoint: string;
  cancellationPolicy: string;
  route: { name: string; origin: string; destination: string };
  bus: { plate: string; busType: string };
  operator: { name: string };
}) {
  return {
    id: t.id,
    route_id: t.routeId,
    route_name: t.route.name,
    origin: t.route.origin,
    destination: t.route.destination,
    bus_id: t.busId,
    bus_plate: t.bus.plate,
    bus_type: t.bus.busType,
    operator_id: t.operatorId,
    operator_name: t.operator.name,
    departure_time: t.departureTime.toISOString(),
    arrival_time: t.arrivalTime.toISOString(),
    price: t.price,
    status: t.status,
    pickup_point: t.pickupPoint,
    dropoff_point: t.dropoffPoint,
    cancellation_policy: t.cancellationPolicy,
  };
}

async function invalidateTripCaches(redis: Redis) {
  const keys = await redis.keys('search:*');
  if (keys.length) await redis.del(...keys);
  const autoKeys = await redis.keys('autocomplete:*');
  if (autoKeys.length) await redis.del(...autoKeys);
}

export function createAdminCrudHandlers(prisma: PrismaClient, redis: Redis) {
  return {
    GetRoutes: async (
      call: grpc.ServerUnaryCall<{ search?: string; page?: number; page_size?: number }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const search = sanitizeString(call.request.search || '', 100);
        const { skip, take } = pageParams(call.request.page, call.request.page_size);
        const where = search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { origin: { contains: search, mode: 'insensitive' as const } },
                { destination: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {};
        const [routes, total] = await Promise.all([
          prisma.route.findMany({
            where,
            include: { stops: { orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
          }),
          prisma.route.count({ where }),
        ]);
        callback(null, { routes: routes.map(mapRoute), total });
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    GetRouteById: async (
      call: grpc.ServerUnaryCall<{ route_id: string }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const route = await prisma.route.findUnique({
          where: { id: call.request.route_id },
          include: { stops: { orderBy: { order: 'asc' } } },
        });
        if (!route) return callback(grpcError(grpc.status.NOT_FOUND, 'Route not found'), null);
        callback(null, mapRoute(route));
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    CreateRoute: async (
      call: grpc.ServerUnaryCall<{ name: string; origin: string; destination: string }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const name = sanitizeString(call.request.name, 120);
        const origin = sanitizeString(call.request.origin, 80);
        const destination = sanitizeString(call.request.destination, 80);
        if (!name || !origin || !destination) {
          return callback(grpcError(grpc.status.INVALID_ARGUMENT, 'name, origin, destination required'), null);
        }
        const route = await prisma.route.create({
          data: {
            name,
            origin,
            destination,
            stops: {
              create: [
                { name: origin, order: 1 },
                { name: destination, order: 2 },
              ],
            },
          },
          include: { stops: { orderBy: { order: 'asc' } } },
        });
        await invalidateTripCaches(redis);
        callback(null, mapRoute(route));
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    UpdateRoute: async (
      call: grpc.ServerUnaryCall<
        { route_id: string; name: string; origin: string; destination: string },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const name = sanitizeString(call.request.name, 120);
        const origin = sanitizeString(call.request.origin, 80);
        const destination = sanitizeString(call.request.destination, 80);
        const route = await prisma.route.update({
          where: { id: call.request.route_id },
          data: { name, origin, destination },
          include: { stops: { orderBy: { order: 'asc' } } },
        });
        await invalidateTripCaches(redis);
        callback(null, mapRoute(route));
      } catch (err) {
        if ((err as { code?: string }).code === 'P2025') {
          return callback(grpcError(grpc.status.NOT_FOUND, 'Route not found'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    DeleteRoute: async (
      call: grpc.ServerUnaryCall<{ route_id: string }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const tripCount = await prisma.trip.count({ where: { routeId: call.request.route_id } });
        if (tripCount > 0) {
          return callback(
            grpcError(grpc.status.FAILED_PRECONDITION, 'Cannot delete route with existing trips'),
            null
          );
        }
        await prisma.route.delete({ where: { id: call.request.route_id } });
        await invalidateTripCaches(redis);
        callback(null, { success: true });
      } catch (err) {
        if ((err as { code?: string }).code === 'P2025') {
          return callback(grpcError(grpc.status.NOT_FOUND, 'Route not found'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    GetStops: async (
      call: grpc.ServerUnaryCall<
        { route_id?: string; search?: string; page?: number; page_size?: number },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const search = sanitizeString(call.request.search || '', 100);
        const { skip, take } = pageParams(call.request.page, call.request.page_size);
        const where = {
          ...(call.request.route_id ? { routeId: call.request.route_id } : {}),
          ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
        };
        const [stops, total] = await Promise.all([
          prisma.routeStop.findMany({
            where,
            include: { route: true },
            orderBy: [{ routeId: 'asc' }, { order: 'asc' }],
            skip,
            take,
          }),
          prisma.routeStop.count({ where }),
        ]);
        callback(null, { stops: stops.map(mapStop), total });
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    CreateStop: async (
      call: grpc.ServerUnaryCall<{ route_id: string; name: string; order: number }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const name = sanitizeString(call.request.name, 120);
        const route = await prisma.route.findUnique({ where: { id: call.request.route_id } });
        if (!route) return callback(grpcError(grpc.status.NOT_FOUND, 'Route not found'), null);
        const stop = await prisma.routeStop.create({
          data: {
            routeId: call.request.route_id,
            name,
            order: call.request.order || 1,
          },
          include: { route: true },
        });
        await invalidateTripCaches(redis);
        callback(null, mapStop(stop));
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    UpdateStop: async (
      call: grpc.ServerUnaryCall<{ stop_id: string; name: string; order: number }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const stop = await prisma.routeStop.update({
          where: { id: call.request.stop_id },
          data: {
            name: sanitizeString(call.request.name, 120),
            order: call.request.order,
          },
          include: { route: true },
        });
        await invalidateTripCaches(redis);
        callback(null, mapStop(stop));
      } catch (err) {
        if ((err as { code?: string }).code === 'P2025') {
          return callback(grpcError(grpc.status.NOT_FOUND, 'Stop not found'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    DeleteStop: async (
      call: grpc.ServerUnaryCall<{ stop_id: string }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const stop = await prisma.routeStop.findUnique({
          where: { id: call.request.stop_id },
          include: { route: { include: { stops: true } } },
        });
        if (!stop) return callback(grpcError(grpc.status.NOT_FOUND, 'Stop not found'), null);
        if (stop.route.stops.length <= 2) {
          return callback(grpcError(grpc.status.FAILED_PRECONDITION, 'Route must have at least 2 stops'), null);
        }
        await prisma.routeStop.delete({ where: { id: call.request.stop_id } });
        await invalidateTripCaches(redis);
        callback(null, { success: true });
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    GetBuses: async (
      call: grpc.ServerUnaryCall<
        { search?: string; operator_id?: string; page?: number; page_size?: number },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const search = sanitizeString(call.request.search || '', 50);
        const { skip, take } = pageParams(call.request.page, call.request.page_size);
        const where = {
          ...(call.request.operator_id ? { operatorId: call.request.operator_id } : {}),
          ...(search
            ? {
                OR: [
                  { plate: { contains: search, mode: 'insensitive' as const } },
                  { busType: { contains: search, mode: 'insensitive' as const } },
                ],
              }
            : {}),
        };
        const [buses, total] = await Promise.all([
          prisma.bus.findMany({
            where,
            include: { operator: true },
            orderBy: { plate: 'asc' },
            skip,
            take,
          }),
          prisma.bus.count({ where }),
        ]);
        callback(null, { buses: buses.map(mapBus), total });
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    CreateBus: async (
      call: grpc.ServerUnaryCall<
        {
          plate: string;
          bus_type: string;
          seat_count: number;
          layout_type: string;
          operator_id: string;
          seat_layout_json?: string;
        },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const layoutType = sanitizeString(call.request.layout_type, 32) || 'bus-29';
        let seatLayoutJson: object = DEFAULT_LAYOUTS[layoutType] || DEFAULT_LAYOUTS['bus-29'];
        if (call.request.seat_layout_json) {
          seatLayoutJson = JSON.parse(call.request.seat_layout_json);
        }
        const bus = await prisma.bus.create({
          data: {
            plate: sanitizeString(call.request.plate, 20),
            busType: sanitizeString(call.request.bus_type, 80),
            seatCount: call.request.seat_count,
            layoutType,
            seatLayoutJson,
            operatorId: call.request.operator_id,
          },
          include: { operator: true },
        });
        callback(null, mapBus(bus));
      } catch (err) {
        if ((err as { code?: string }).code === 'P2002') {
          return callback(grpcError(grpc.status.ALREADY_EXISTS, 'Plate already exists'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    UpdateBus: async (
      call: grpc.ServerUnaryCall<
        {
          bus_id: string;
          plate: string;
          bus_type: string;
          seat_count: number;
          layout_type: string;
          operator_id: string;
          seat_layout_json?: string;
        },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const layoutType = sanitizeString(call.request.layout_type, 32) || 'bus-29';
        const data: Record<string, unknown> = {
          plate: sanitizeString(call.request.plate, 20),
          busType: sanitizeString(call.request.bus_type, 80),
          seatCount: call.request.seat_count,
          layoutType,
          operatorId: call.request.operator_id,
        };
        if (call.request.seat_layout_json) {
          data.seatLayoutJson = JSON.parse(call.request.seat_layout_json);
        }
        const bus = await prisma.bus.update({
          where: { id: call.request.bus_id },
          data,
          include: { operator: true },
        });
        callback(null, mapBus(bus));
      } catch (err) {
        if ((err as { code?: string }).code === 'P2025') {
          return callback(grpcError(grpc.status.NOT_FOUND, 'Bus not found'), null);
        }
        if ((err as { code?: string }).code === 'P2002') {
          return callback(grpcError(grpc.status.ALREADY_EXISTS, 'Plate already exists'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    DeleteBus: async (
      call: grpc.ServerUnaryCall<{ bus_id: string }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const tripCount = await prisma.trip.count({ where: { busId: call.request.bus_id } });
        if (tripCount > 0) {
          return callback(
            grpcError(grpc.status.FAILED_PRECONDITION, 'Cannot delete bus with existing trips'),
            null
          );
        }
        await prisma.bus.delete({ where: { id: call.request.bus_id } });
        callback(null, { success: true });
      } catch (err) {
        if ((err as { code?: string }).code === 'P2025') {
          return callback(grpcError(grpc.status.NOT_FOUND, 'Bus not found'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    GetTripsAdmin: async (
      call: grpc.ServerUnaryCall<
        {
          route_id?: string;
          status?: string;
          search?: string;
          from_date?: string;
          to_date?: string;
          page?: number;
          page_size?: number;
        },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const search = sanitizeString(call.request.search || '', 100);
        const { skip, take } = pageParams(call.request.page, call.request.page_size);
        const where: Record<string, unknown> = {};

        if (call.request.route_id) where.routeId = call.request.route_id;
        if (call.request.status && isValidTripStatus(call.request.status)) {
          where.status = call.request.status as TripStatus;
        }
        if (call.request.from_date || call.request.to_date) {
          const from = call.request.from_date ? vnDayBounds(parseTravelDate(call.request.from_date)).start : undefined;
          const to = call.request.to_date ? vnDayBounds(parseTravelDate(call.request.to_date)).end : undefined;
          where.departureTime = {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          };
        }
        if (search) {
          where.OR = [
            { route: { name: { contains: search, mode: 'insensitive' } } },
            { bus: { plate: { contains: search, mode: 'insensitive' } } },
            { operator: { name: { contains: search, mode: 'insensitive' } } },
          ];
        }

        const [trips, total] = await Promise.all([
          prisma.trip.findMany({
            where,
            include: { route: true, bus: true, operator: true },
            orderBy: { departureTime: 'desc' },
            skip,
            take,
          }),
          prisma.trip.count({ where }),
        ]);
        callback(null, { trips: trips.map(mapAdminTrip), total });
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    CreateTrip: async (
      call: grpc.ServerUnaryCall<
        {
          route_id: string;
          bus_id: string;
          operator_id: string;
          departure_time: string;
          arrival_time: string;
          price: number;
          pickup_point: string;
          dropoff_point: string;
          cancellation_policy?: string;
          status?: string;
        },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const status =
          call.request.status && isValidTripStatus(call.request.status)
            ? (call.request.status as TripStatus)
            : TripStatus.ACTIVE;
        const trip = await prisma.trip.create({
          data: {
            routeId: call.request.route_id,
            busId: call.request.bus_id,
            operatorId: call.request.operator_id,
            departureTime: new Date(call.request.departure_time),
            arrivalTime: new Date(call.request.arrival_time),
            price: call.request.price,
            pickupPoint: sanitizeString(call.request.pickup_point, 200),
            dropoffPoint: sanitizeString(call.request.dropoff_point, 200),
            cancellationPolicy:
              sanitizeString(call.request.cancellation_policy || '', 500) ||
              'Hủy trước 24h được hoàn 80%',
            status,
          },
          include: { route: true, bus: true, operator: true },
        });
        await invalidateTripCaches(redis);
        callback(null, mapAdminTrip(trip));
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },

    UpdateTrip: async (
      call: grpc.ServerUnaryCall<
        {
          trip_id: string;
          route_id?: string;
          bus_id?: string;
          operator_id?: string;
          departure_time?: string;
          arrival_time?: string;
          price?: number;
          pickup_point?: string;
          dropoff_point?: string;
          cancellation_policy?: string;
          status?: string;
        },
        unknown
      >,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        const data: Record<string, unknown> = {};
        if (call.request.route_id) data.routeId = call.request.route_id;
        if (call.request.bus_id) data.busId = call.request.bus_id;
        if (call.request.operator_id) data.operatorId = call.request.operator_id;
        if (call.request.departure_time) data.departureTime = new Date(call.request.departure_time);
        if (call.request.arrival_time) data.arrivalTime = new Date(call.request.arrival_time);
        if (call.request.price !== undefined) data.price = call.request.price;
        if (call.request.pickup_point) data.pickupPoint = sanitizeString(call.request.pickup_point, 200);
        if (call.request.dropoff_point) data.dropoffPoint = sanitizeString(call.request.dropoff_point, 200);
        if (call.request.cancellation_policy) {
          data.cancellationPolicy = sanitizeString(call.request.cancellation_policy, 500);
        }
        if (call.request.status && isValidTripStatus(call.request.status)) {
          data.status = call.request.status as TripStatus;
        }
        const trip = await prisma.trip.update({
          where: { id: call.request.trip_id },
          data,
          include: { route: true, bus: true, operator: true },
        });
        await invalidateTripCaches(redis);
        callback(null, mapAdminTrip(trip));
      } catch (err) {
        if ((err as { code?: string }).code === 'P2025') {
          return callback(grpcError(grpc.status.NOT_FOUND, 'Trip not found'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    DeleteTrip: async (
      call: grpc.ServerUnaryCall<{ trip_id: string }, unknown>,
      callback: grpc.sendUnaryData<unknown>
    ) => {
      try {
        await prisma.trip.delete({ where: { id: call.request.trip_id } });
        await invalidateTripCaches(redis);
        callback(null, { success: true });
      } catch (err) {
        if ((err as { code?: string }).code === 'P2025') {
          return callback(grpcError(grpc.status.NOT_FOUND, 'Trip not found'), null);
        }
        callback(err as grpc.ServiceError, null);
      }
    },

    GetOperators: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
      try {
        const operators = await prisma.operator.findMany({ orderBy: { name: 'asc' } });
        callback(null, { operators: operators.map((o) => ({ id: o.id, name: o.name })) });
      } catch (err) {
        callback(err as grpc.ServiceError, null);
      }
    },
  };
}

export { TRIP_STATUS };
