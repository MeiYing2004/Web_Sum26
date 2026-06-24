import { USER_ROLES } from '@bus/shared';
import { requireRole, type GatewayContext } from './context';

function promisify<T>(fn: (cb: (err: Error | null, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, res) => (err ? reject(err) : resolve(res))));
}

const STAFF_ROLES = [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE];

function mapAdminRoute(r: Record<string, unknown>) {
  const stops = (r.stops as Array<Record<string, unknown>>) || [];
  return {
    id: r.id,
    name: r.name,
    origin: r.origin,
    destination: r.destination,
    stops: stops.map((s) => ({ id: s.id, name: s.name, order: s.order })),
    createdAt: r.created_at,
  };
}

function mapAdminStop(s: Record<string, unknown>) {
  return {
    id: s.id,
    routeId: s.route_id,
    routeName: s.route_name,
    name: s.name,
    order: s.order,
  };
}

function mapAdminBus(b: Record<string, unknown>) {
  return {
    id: b.id,
    plate: b.plate,
    busType: b.bus_type,
    seatCount: b.seat_count,
    layoutType: b.layout_type,
    seatLayoutJson: b.seat_layout_json,
    operatorId: b.operator_id,
    operatorName: b.operator_name,
  };
}

function mapAdminTrip(t: Record<string, unknown>) {
  return {
    id: t.id,
    routeId: t.route_id,
    routeName: t.route_name,
    origin: t.origin,
    destination: t.destination,
    busId: t.bus_id,
    busPlate: t.bus_plate,
    busType: t.bus_type,
    operatorId: t.operator_id,
    operatorName: t.operator_name,
    departureTime: t.departure_time,
    arrivalTime: t.arrival_time,
    price: t.price,
    status: t.status,
    pickupPoint: t.pickup_point,
    dropoffPoint: t.dropoff_point,
    cancellationPolicy: t.cancellation_policy,
  };
}

export const adminResolvers = {
  Query: {
    adminRoutes: async (
      _: unknown,
      args: { search?: string; page?: number; pageSize?: number },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<{ routes: Array<Record<string, unknown>>; total: number }>((cb) =>
        ctx.tripClient.GetRoutes(
          { search: args.search, page: args.page, page_size: args.pageSize },
          cb
        )
      );
      return { routes: res.routes.map(mapAdminRoute), total: res.total };
    },

    adminRoute: async (_: unknown, { id }: { id: string }, ctx: GatewayContext) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.GetRouteById({ route_id: id }, cb)
      );
      return mapAdminRoute(res);
    },

    adminStops: async (
      _: unknown,
      args: { routeId?: string; search?: string; page?: number; pageSize?: number },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<{ stops: Array<Record<string, unknown>>; total: number }>((cb) =>
        ctx.tripClient.GetStops(
          { route_id: args.routeId, search: args.search, page: args.page, page_size: args.pageSize },
          cb
        )
      );
      return { stops: res.stops.map(mapAdminStop), total: res.total };
    },

    adminBuses: async (
      _: unknown,
      args: { search?: string; operatorId?: string; page?: number; pageSize?: number },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<{ buses: Array<Record<string, unknown>>; total: number }>((cb) =>
        ctx.tripClient.GetBuses(
          { search: args.search, operator_id: args.operatorId, page: args.page, page_size: args.pageSize },
          cb
        )
      );
      return { buses: res.buses.map(mapAdminBus), total: res.total };
    },

    adminTrips: async (
      _: unknown,
      args: {
        routeId?: string;
        status?: string;
        search?: string;
        fromDate?: string;
        toDate?: string;
        page?: number;
        pageSize?: number;
      },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<{ trips: Array<Record<string, unknown>>; total: number }>((cb) =>
        ctx.tripClient.GetTripsAdmin(
          {
            route_id: args.routeId,
            status: args.status,
            search: args.search,
            from_date: args.fromDate,
            to_date: args.toDate,
            page: args.page,
            page_size: args.pageSize,
          },
          cb
        )
      );
      return { trips: res.trips.map(mapAdminTrip), total: res.total };
    },

    adminOperators: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<{ operators: Array<Record<string, unknown>> }>((cb) =>
        ctx.tripClient.GetOperators({}, cb)
      );
      return res.operators.map((o) => ({ id: o.id, name: o.name }));
    },

    adminBookingsByTrip: async (
      _: unknown,
      args: { tripId: string; search?: string; page?: number; pageSize?: number },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<{ bookings: Array<Record<string, unknown>>; total: number }>((cb) =>
        ctx.bookingClient.ListBookingsByTrip(
          {
            trip_id: args.tripId,
            search: args.search,
            page: args.page,
            page_size: args.pageSize,
          },
          cb
        )
      );
      return {
        total: res.total,
        bookings: res.bookings.map((b) => ({
          id: b.id,
          bookingCode: b.booking_code,
          status: b.status,
          tripId: b.trip_id,
          totalAmount: b.total_amount,
          routeName: b.route_name,
          origin: b.origin,
          destination: b.destination,
          operatorName: b.operator_name,
          pickupPoint: b.pickup_point,
          dropoffPoint: b.dropoff_point,
          departureTime: b.departure_time,
          busPlate: b.bus_plate,
          paymentStatus: b.payment_status,
          guestEmail: b.guest_email,
          passengers: ((b.passengers as Array<Record<string, string>>) || []).map((p) => ({
            fullName: p.full_name,
            phone: p.phone,
            email: p.email,
            idNumber: p.id_number,
            seatId: p.seat_id,
          })),
          createdAt: b.created_at,
        })),
      };
    },

    adminEventLogs: async (_: unknown, args: { limit?: number }, ctx: GatewayContext) => {
      requireRole(ctx, STAFF_ROLES);
      const res = await promisify<{ events: Array<Record<string, unknown>> }>((cb) =>
        ctx.bookingClient.ListAdminEventLogs({ limit: args.limit || 50 }, cb)
      );
      return (res.events || []).map((e) => ({
        id: String(e.id),
        bookingId: String(e.booking_id),
        bookingCode: String(e.booking_code),
        eventType: String(e.event_type),
        detail: String(e.detail),
        createdAt: String(e.created_at),
      }));
    },
  },

  Mutation: {
    createRoute: async (
      _: unknown,
      args: { name: string; origin: string; destination: string },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.CreateRoute(
          { name: args.name, origin: args.origin, destination: args.destination },
          cb
        )
      );
      return mapAdminRoute(res);
    },

    updateRoute: async (
      _: unknown,
      args: { id: string; name: string; origin: string; destination: string },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.UpdateRoute(
          { route_id: args.id, name: args.name, origin: args.origin, destination: args.destination },
          cb
        )
      );
      return mapAdminRoute(res);
    },

    deleteRoute: async (_: unknown, { id }: { id: string }, ctx: GatewayContext) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<{ success: boolean }>((cb) =>
        ctx.tripClient.DeleteRoute({ route_id: id }, cb)
      );
      return { success: res.success };
    },

    createStop: async (
      _: unknown,
      args: { routeId: string; name: string; order: number },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.CreateStop(
          { route_id: args.routeId, name: args.name, order: args.order },
          cb
        )
      );
      return mapAdminStop(res);
    },

    updateStop: async (
      _: unknown,
      args: { id: string; name: string; order: number },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.UpdateStop({ stop_id: args.id, name: args.name, order: args.order }, cb)
      );
      return mapAdminStop(res);
    },

    deleteStop: async (_: unknown, { id }: { id: string }, ctx: GatewayContext) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<{ success: boolean }>((cb) =>
        ctx.tripClient.DeleteStop({ stop_id: id }, cb)
      );
      return { success: res.success };
    },

    createBus: async (
      _: unknown,
      args: {
        plate: string;
        busType: string;
        seatCount: number;
        layoutType: string;
        operatorId: string;
        seatLayoutJson?: string;
      },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.CreateBus(
          {
            plate: args.plate,
            bus_type: args.busType,
            seat_count: args.seatCount,
            layout_type: args.layoutType,
            operator_id: args.operatorId,
            seat_layout_json: args.seatLayoutJson,
          },
          cb
        )
      );
      return mapAdminBus(res);
    },

    updateBus: async (
      _: unknown,
      args: {
        id: string;
        plate: string;
        busType: string;
        seatCount: number;
        layoutType: string;
        operatorId: string;
        seatLayoutJson?: string;
      },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.UpdateBus(
          {
            bus_id: args.id,
            plate: args.plate,
            bus_type: args.busType,
            seat_count: args.seatCount,
            layout_type: args.layoutType,
            operator_id: args.operatorId,
            seat_layout_json: args.seatLayoutJson,
          },
          cb
        )
      );
      return mapAdminBus(res);
    },

    deleteBus: async (_: unknown, { id }: { id: string }, ctx: GatewayContext) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<{ success: boolean }>((cb) =>
        ctx.tripClient.DeleteBus({ bus_id: id }, cb)
      );
      return { success: res.success };
    },

    createTrip: async (
      _: unknown,
      args: {
        routeId: string;
        busId: string;
        operatorId: string;
        departureTime: string;
        arrivalTime: string;
        price: number;
        pickupPoint: string;
        dropoffPoint: string;
        cancellationPolicy?: string;
        status?: string;
      },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.CreateTrip(
          {
            route_id: args.routeId,
            bus_id: args.busId,
            operator_id: args.operatorId,
            departure_time: args.departureTime,
            arrival_time: args.arrivalTime,
            price: args.price,
            pickup_point: args.pickupPoint,
            dropoff_point: args.dropoffPoint,
            cancellation_policy: args.cancellationPolicy,
            status: args.status,
          },
          cb
        )
      );
      return mapAdminTrip(res);
    },

    updateTrip: async (
      _: unknown,
      args: {
        id: string;
        routeId?: string;
        busId?: string;
        operatorId?: string;
        departureTime?: string;
        arrivalTime?: string;
        price?: number;
        pickupPoint?: string;
        dropoffPoint?: string;
        cancellationPolicy?: string;
        status?: string;
      },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.UpdateTrip(
          {
            trip_id: args.id,
            route_id: args.routeId,
            bus_id: args.busId,
            operator_id: args.operatorId,
            departure_time: args.departureTime,
            arrival_time: args.arrivalTime,
            price: args.price,
            pickup_point: args.pickupPoint,
            dropoff_point: args.dropoffPoint,
            cancellation_policy: args.cancellationPolicy,
            status: args.status,
          },
          cb
        )
      );
      return mapAdminTrip(res);
    },

    deleteTrip: async (_: unknown, { id }: { id: string }, ctx: GatewayContext) => {
      requireRole(ctx, [USER_ROLES.ADMIN]);
      const res = await promisify<{ success: boolean }>((cb) =>
        ctx.tripClient.DeleteTrip({ trip_id: id }, cb)
      );
      return { success: res.success };
    },
  },
};
