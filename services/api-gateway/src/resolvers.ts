import { PubSub } from 'graphql-subscriptions';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeBookingCode,
  sanitizeLocation,
  sanitizeDate,
  REDIS_KEYS,
  createLogger,
  logEvent,
} from '@bus/shared';
import { createContext, requireRole, enforceLookupRateLimit, redis, type GatewayContext } from './context';

export { createContext } from './context';

export const pubsub = new PubSub();
export const SEAT_UPDATED = 'SEAT_UPDATED';

const gatewayLogger = createLogger('api-gateway');

function promisify<T>(fn: (cb: (err: Error | null, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, res) => (err ? reject(err) : resolve(res))));
}

export const resolvers = {
  Query: {
    health: () => 'OK',

    autocompleteLocations: async (_: unknown, { query }: { query: string }, ctx: GatewayContext) => {
      const q = sanitizeString(query, 50);
      const res = await promisify<{ suggestions: Array<{ id: string; name: string; type: string }> }>((cb) =>
        ctx.tripClient.AutocompleteLocations({ query: q }, cb)
      );
      return res.suggestions.map((s) => ({ id: s.id, name: s.name, type: s.type }));
    },

    searchTrips: async (_: unknown, args: Record<string, unknown>, ctx: GatewayContext) => {
      const res = await promisify<{ trips: Array<Record<string, unknown>> }>((cb) =>
        ctx.tripClient.SearchTrips(
          {
            origin: sanitizeLocation(args.origin),
            destination: sanitizeLocation(args.destination),
            travel_date: sanitizeDate(args.travelDate),
            operator_filter: args.operatorFilter ? sanitizeString(args.operatorFilter) : undefined,
            bus_type_filter: args.busTypeFilter ? sanitizeString(args.busTypeFilter) : undefined,
            min_price: args.minPrice,
            max_price: args.maxPrice,
            departure_time_from: args.departureTimeFrom,
            departure_time_to: args.departureTimeTo,
            min_seats: args.minSeats,
            sort_by: args.sortBy || 'earliest',
            user_id: ctx.user?.userId ?? null,
          },
          cb
        )
      );
      return res.trips.map(mapTrip);
    },

    tripDetail: async (_: unknown, { tripId }: { tripId: string }, ctx: GatewayContext) => {
      const t = await promisify<Record<string, unknown>>((cb) =>
        ctx.tripClient.GetTripDetail({ trip_id: tripId }, cb)
      );
      return mapTripDetail(t);
    },

    seatMap: async (_: unknown, { tripId }: { tripId: string }, ctx: GatewayContext) => {
      const res = await promisify<{ trip_id: string; bus_layout: string; layout_json: string; seats: Array<Record<string, unknown>> }>((cb) =>
        ctx.seatClient.GetSeatMap({ trip_id: tripId }, cb)
      );
      return {
        tripId: res.trip_id,
        busLayout: res.bus_layout,
        layoutJson: res.layout_json,
        seats: res.seats.map((s) => ({
          seatId: s.seat_id,
          seatLabel: s.seat_label,
          status: s.status,
          heldBy: s.held_by,
          holdTtlSeconds: s.hold_ttl_seconds,
        })),
      };
    },

    booking: async (_: unknown, { id }: { id: string }, ctx: GatewayContext) => {
      const b = await promisify<Record<string, unknown>>((cb) => ctx.bookingClient.GetBooking({ booking_id: id }, cb));
      return mapBooking(b);
    },

    bookingByCode: async (
      _: unknown,
      { bookingCode, email }: { bookingCode: string; email: string },
      ctx: GatewayContext
    ) => {
      await enforceLookupRateLimit(ctx);
      const code = sanitizeBookingCode(bookingCode);
      const em = sanitizeEmail(email);
      const b = await promisify<Record<string, unknown>>((cb) =>
        ctx.bookingClient.GetBookingByCode({ booking_code: code, email: em }, cb)
      );
      if (!b) throw new Error('Không tìm thấy booking — mã và email phải khớp');
      return mapBooking(b);
    },

    myBookings: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const res = await promisify<{ bookings: Array<Record<string, unknown>> }>((cb) =>
        ctx.bookingClient.ListUserBookings({ user_id: ctx.user!.userId }, cb)
      );
      return res.bookings.map(mapBooking);
    },

    suggestNearestDate: async (
      _: unknown,
      args: { origin: string; destination: string; travelDate: string },
      ctx: GatewayContext
    ) => {
      const res = await promisify<{ nearest_date: string }>((cb) =>
        ctx.tripClient.SuggestNearestDate(
          { origin: args.origin, destination: args.destination, travel_date: args.travelDate },
          cb
        )
      );
      return res.nearest_date;
    },

    revenueSummary: async (
      _: unknown,
      { fromDate, toDate }: { fromDate?: string; toDate?: string },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, ['ADMIN', 'STAFF']);
      const res = await promisify<{ daily: Array<Record<string, unknown>>; total_revenue: number }>((cb) =>
        ctx.analyticsClient.GetRevenueSummary({ from_date: fromDate, to_date: toDate }, cb)
      );
      return {
        daily: res.daily.map((d) => ({
          date: d.date,
          revenue: d.revenue,
          bookingCount: d.booking_count,
        })),
        totalRevenue: res.total_revenue,
      };
    },

    popularRoutes: async (_: unknown, { limit }: { limit?: number }, ctx: GatewayContext) => {
      const res = await promisify<{ routes: Array<Record<string, unknown>> }>((cb) =>
        ctx.analyticsClient.GetPopularRoutes({ limit: limit || 10 }, cb)
      );
      return res.routes.map((r) => ({
        origin: r.origin,
        destination: r.destination,
        searchCount: r.search_count,
      }));
    },

    conversionRate: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      const res = await promisify<Record<string, number>>((cb) => ctx.analyticsClient.GetConversionRate({}, cb));
      return {
        totalSearches: res.total_searches,
        totalBookings: res.total_bookings,
        conversionRate: res.conversion_rate,
      };
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      args: { email: string; password: string; fullName: string },
      ctx: GatewayContext
    ) => {
      const res = await promisify<{ token: string; user_id: string; role?: string }>((cb) =>
        ctx.authClient.Register({ email: args.email, password: args.password, full_name: args.fullName }, cb)
      );
      return { token: res.token, userId: res.user_id, role: 'CUSTOMER' };
    },

    login: async (_: unknown, args: { email: string; password: string }, ctx: GatewayContext) => {
      const res = await promisify<{ token: string; user_id: string; role: string }>((cb) =>
        ctx.authClient.Login({ email: args.email, password: args.password }, cb)
      );
      return { token: res.token, userId: res.user_id, role: res.role };
    },

    holdSeats: async (
      _: unknown,
      args: { tripId: string; seatIds: string[]; sessionId: string },
      ctx: GatewayContext
    ) => {
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.seatClient.HoldSeats(
          {
            trip_id: args.tripId,
            seat_ids: args.seatIds,
            session_id: args.sessionId,
            ttl_seconds: 300,
          },
          cb
        )
      );

      logEvent(gatewayLogger, 'holdSeats', {
        requestId: ctx.requestId,
        userId: ctx.user?.userId,
        tripId: args.tripId,
        seatIds: args.seatIds,
        success: res.success,
      });

      for (const seatId of args.seatIds) {
        await pubsub.publish(SEAT_UPDATED, {
          seatUpdated: {
            tripId: args.tripId,
            seatId,
            status: res.success ? 'HELD' : 'AVAILABLE',
            heldBy: args.sessionId,
            holdTtlSeconds: 300,
          },
        });
      }

      return {
        success: res.success,
        holdToken: res.hold_token,
        expiresInSeconds: res.expires_in_seconds,
        message: res.message,
        failedSeats: res.failed_seats || [],
      };
    },

    releaseSeats: async (
      _: unknown,
      args: { tripId: string; seatIds: string[]; holdToken: string },
      ctx: GatewayContext
    ) => {
      await promisify((cb) =>
        ctx.seatClient.ReleaseSeats(
          { trip_id: args.tripId, seat_ids: args.seatIds, hold_token: args.holdToken },
          cb
        )
      );
      for (const seatId of args.seatIds) {
        await pubsub.publish(SEAT_UPDATED, {
          seatUpdated: { tripId: args.tripId, seatId, status: 'AVAILABLE' },
        });
      }
      return true;
    },

    createBooking: async (
      _: unknown,
      args: {
        tripId: string;
        holdToken: string;
        passengers: Array<Record<string, string>>;
        guestEmail: string;
      },
      ctx: GatewayContext
    ) => {
      const res = await promisify<Record<string, unknown>>((cb) =>
        ctx.bookingClient.CreateBooking(
          {
            trip_id: args.tripId,
            hold_token: args.holdToken,
            guest_email: args.guestEmail,
            user_id: ctx.user?.userId,
            passengers: args.passengers.map((p) => ({
              full_name: p.fullName,
              phone: p.phone,
              email: p.email,
              id_number: p.idNumber,
              seat_id: p.seatId,
            })),
          },
          cb
        )
      );
      return {
        bookingId: res.booking_id,
        bookingCode: res.booking_code,
        status: res.status,
        totalAmount: res.total_amount,
        paymentDeadlineSeconds: res.payment_deadline_seconds,
      };
    },

    processPayment: async (
      _: unknown,
      { bookingId, simulateSuccess }: { bookingId: string; simulateSuccess: boolean },
      ctx: GatewayContext
    ) => {
      const result = await promisify<{ success: boolean; message: string }>((cb) =>
        ctx.bookingClient.ProcessPayment({ booking_id: bookingId, simulate_success: simulateSuccess }, cb)
      );
      if (result.success) {
        logEvent(gatewayLogger, 'payment.success', { requestId: ctx.requestId, userId: ctx.user?.userId, bookingId });
      }
      return result;
    },

    cancelBooking: async (
      _: unknown,
      { bookingId }: { bookingId: string },
      ctx: GatewayContext
    ) => {
      const res = await promisify<{ success: boolean; message: string }>((cb) =>
        ctx.bookingClient.CancelBooking({ booking_id: bookingId, user_id: ctx.user?.userId }, cb)
      );
      return res;
    },

    checkIn: async (_: unknown, args: { bookingCode: string; ticketId?: string }, ctx: GatewayContext) => {
      const res = await promisify<{ success: boolean; message: string }>((cb) =>
        ctx.bookingClient.CheckIn(
          { booking_code: args.bookingCode, ticket_id: args.ticketId, staff_id: ctx.user?.userId || 'staff' },
          cb
        )
      );
      logEvent(gatewayLogger, 'check-in', {
        requestId: ctx.requestId,
        userId: ctx.user?.userId,
        bookingCode: args.bookingCode,
        success: res.success,
      });
      return res;
    },

    blockSeats: async (
      _: unknown,
      args: { tripId: string; seatIds: string[]; blocked: boolean },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, ['ADMIN', 'STAFF']);
      await promisify((cb) =>
        ctx.seatClient.BlockSeats(
          { trip_id: args.tripId, seat_ids: args.seatIds, blocked: args.blocked },
          cb
        )
      );
      for (const seatId of args.seatIds) {
        await pubsub.publish(SEAT_UPDATED, {
          seatUpdated: {
            tripId: args.tripId,
            seatId,
            status: args.blocked ? 'BLOCKED' : 'AVAILABLE',
          },
        });
      }
      return true;
    },

    updateBusSeatLayout: async (
      _: unknown,
      { busLayoutType, layoutJson }: { busLayoutType: string; layoutJson: string },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, ['ADMIN']);
      JSON.parse(layoutJson);
      await redis.set(REDIS_KEYS.busLayout(sanitizeString(busLayoutType, 32)), layoutJson);
      return true;
    },
  },

  Subscription: {
    seatUpdated: {
      subscribe: (_: unknown, { tripId }: { tripId: string }) =>
        (pubsub as unknown as { asyncIterator: (topics: string[]) => AsyncIterable<unknown> }).asyncIterator([SEAT_UPDATED]),
      resolve: (payload: { seatUpdated: Record<string, unknown> }, args: { tripId: string }) => {
        if (payload.seatUpdated.tripId !== args.tripId) return null;
        return payload.seatUpdated;
      },
    },
  },
};

function mapTrip(t: Record<string, unknown>) {
  return {
    id: t.id,
    routeName: t.route_name,
    origin: t.origin,
    destination: t.destination,
    operatorName: t.operator_name,
    busType: t.bus_type,
    departureTime: t.departure_time,
    arrivalTime: t.arrival_time,
    price: t.price,
    availableSeats: t.available_seats,
    durationMinutes: t.duration_minutes,
  };
}

function mapTripDetail(t: Record<string, unknown>) {
  return {
    id: t.id,
    routeName: t.route_name,
    origin: t.origin,
    destination: t.destination,
    pickupPoint: t.pickup_point,
    dropoffPoint: t.dropoff_point,
    operatorName: t.operator_name,
    busType: t.bus_type,
    departureTime: t.departure_time,
    arrivalTime: t.arrival_time,
    price: t.price,
    cancellationPolicy: t.cancellation_policy,
    busId: t.bus_id,
    busPlate: t.bus_plate,
    totalSeats: t.total_seats,
    seatLayoutJson: t.seat_layout_json,
  };
}

function mapBooking(b: Record<string, unknown>) {
  return {
    id: b.id,
    bookingCode: b.booking_code,
    status: b.status,
    tripId: b.trip_id,
    totalAmount: b.total_amount,
    passengers: (b.passengers as Array<Record<string, string>> || []).map((p) => ({
      fullName: p.full_name,
      phone: p.phone,
      email: p.email,
      idNumber: p.id_number,
      seatId: p.seat_id,
    })),
    createdAt: b.created_at,
  };
}
