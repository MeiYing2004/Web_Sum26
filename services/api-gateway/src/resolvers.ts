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
  getTripAvailability,
  formatDateVN,
  departureDateVN,
  filterByDepartureDate,
  USER_ROLES,
  normalizeRole,
} from '@bus/shared';
import { createContext, requireRole, enforceLookupRateLimit, redis, type GatewayContext } from './context';
import { mapAuthError } from './auth-errors';
import { adminResolvers } from './admin-resolvers';

export { createContext } from './context';

export const pubsub = new PubSub();
export const SEAT_UPDATED = 'SEAT_UPDATED';

const gatewayLogger = createLogger('api-gateway');

function mapSortBy(sort?: unknown): string {
  const s = String(sort || 'DEPART_EARLY').toUpperCase();
  const map: Record<string, string> = {
    PRICE_ASC: 'PRICE_ASC',
    PRICE_DESC: 'PRICE_DESC',
    DEPART_EARLY: 'DEPART_EARLY',
    DURATION_SHORT: 'DURATION_SHORT',
    earliest: 'DEPART_EARLY',
    cheapest: 'PRICE_ASC',
    shortest: 'DURATION_SHORT',
  };
  return map[s] || map[String(sort || '').toLowerCase()] || 'DEPART_EARLY';
}

function promisify<T>(fn: (cb: (err: Error | null, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, res) => (err ? reject(err) : resolve(res))));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function grpcCall<T>(
  label: string,
  fn: (cb: (err: Error | null, res: T) => void) => void
): Promise<T | null> {
  try {
    return await promisify(fn);
  } catch (err) {
    logEvent(gatewayLogger, 'adminDashboard.partial_failure', {
      source: label,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function assertTripBookable(
  ctx: GatewayContext,
  tripId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const t = await promisify<Record<string, unknown>>((cb) =>
    ctx.tripClient.GetTripDetail({ trip_id: tripId }, cb)
  );
  const departureTime = String(t.departure_time ?? '');
  if (!departureTime) {
    return { ok: false, message: 'Không tìm thấy chuyến xe' };
  }
  const travelDate = departureDateVN(departureTime);
  const seatsRaw = t.available_seats ?? t.availableSeats;
  const seats = seatsRaw !== undefined && seatsRaw !== null ? Number(seatsRaw) : undefined;
  const av = getTripAvailability(travelDate, departureTime, new Date(), seats);
  if (!av.bookable) {
    return { ok: false, message: av.availabilityLabel || 'Chuyến không còn khả dụng' };
  }
  return { ok: true };
}

export const resolvers = {
  Query: {
    health: () => 'OK',

    session: (_: unknown, __: unknown, ctx: GatewayContext) => {
      if (!ctx.user) {
        return { valid: false, userId: null, role: null };
      }
      return { valid: true, userId: ctx.user.userId, role: ctx.user.role };
    },

    savedPassengers: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const res = await promisify<{
        passengers: Array<{
          id: string;
          full_name: string;
          phone: string;
          email: string;
          id_number: string;
        }>;
      }>((cb) => ctx.authClient.GetSavedPassengers({ user_id: ctx.user!.userId }, cb));
      return (res.passengers || []).map((p) => ({
        id: p.id,
        fullName: p.full_name,
        phone: p.phone,
        email: p.email,
        idNumber: p.id_number || null,
      }));
    },

    autocompleteLocations: async (_: unknown, { query }: { query: string }, ctx: GatewayContext) => {
      const q = sanitizeString(query, 50);
      const res = await promisify<{ suggestions: Array<{ id: string; name: string; type: string }> }>((cb) =>
        ctx.tripClient.AutocompleteLocations({ query: q }, cb)
      );
      return res.suggestions.map((s) => ({ id: s.id, name: s.name, type: s.type }));
    },

    searchTrips: async (_: unknown, args: Record<string, unknown>, ctx: GatewayContext) => {
      const travelDate = sanitizeDate(args.travelDate);
      const res = await promisify<{ trips: Array<Record<string, unknown>> }>((cb) =>
        ctx.tripClient.SearchTrips(
          {
            origin: sanitizeLocation(args.origin),
            destination: sanitizeLocation(args.destination),
            travel_date: travelDate,
            operator_filter: args.operatorFilter ? sanitizeString(args.operatorFilter) : undefined,
            bus_type_filter: args.busTypeFilter ? sanitizeString(args.busTypeFilter) : undefined,
            min_price: args.minPrice,
            max_price: args.maxPrice,
            departure_time_from: args.departureTimeFrom,
            departure_time_to: args.departureTimeTo,
            min_seats: args.minSeats,
            sort_by: mapSortBy(args.sortBy),
            user_id: ctx.user?.userId ?? null,
          },
          cb
        )
      );
      return filterByDepartureDate(res.trips, travelDate).map((t) => mapTrip(t, travelDate));
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
      if (!b?.id) return null;
      assertBookingReadAccess(b, ctx);
      return mapBooking(b);
    },

    bookingByCode: async (
      _: unknown,
      { bookingCode, email }: { bookingCode: string; email?: string },
      ctx: GatewayContext
    ) => {
      await enforceLookupRateLimit(ctx);
      const code = sanitizeBookingCode(bookingCode);
      const em = email ? sanitizeEmail(email) : undefined;
      if (!ctx.user && !em) {
        throw new Error('Vui lòng cung cấp email để tra cứu vé');
      }
      try {
        const b = await promisify<Record<string, unknown>>((cb) =>
          ctx.bookingClient.GetBookingByCode({ booking_code: code, email: em }, cb)
        );
        if (!b?.id) return null;
        assertBookingReadAccess(b, ctx, em);
        return mapBooking(b);
      } catch {
        return null;
      }
    },

    myBookings: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const res = await promisify<{ bookings: Array<Record<string, unknown>> }>((cb) =>
        ctx.bookingClient.ListUserBookings({ user_id: ctx.user!.userId }, cb)
      );
      return res.bookings.map(mapBooking);
    },

    myTickets: async (
      _: unknown,
      { search, filter, email }: { search?: string; filter?: string; email?: string },
      ctx: GatewayContext
    ) => {
      if (!ctx.user) throw new Error('Unauthorized');
      const userEmail = email ? sanitizeEmail(email) : undefined;

      if (!userEmail) {
        try {
          const ticketRes = await promisify<{ tickets: Array<Record<string, unknown>> }>((cb) =>
            ctx.ticketClient.ListForUser(
              {
                user_id: ctx.user!.userId,
                search: search ? sanitizeString(search, 80) : '',
                filter: filter ? sanitizeString(filter, 20) : '',
              },
              cb
            )
          );
          if (ticketRes.tickets?.length) {
            return ticketRes.tickets.map(mapETicket);
          }
        } catch (err) {
          logEvent(gatewayLogger, 'myTickets.ticketServiceFallback', {
            requestId: ctx.requestId,
            error: String(err),
          });
        }
      }

      const res = await promisify<{ bookings: Array<Record<string, unknown>> }>((cb) =>
        ctx.bookingClient.ListUserBookings(
          {
            user_id: ctx.user!.userId,
            email: userEmail,
          },
          cb
        )
      );
      let bookings = res.bookings;
      if (search) {
        const q = sanitizeString(search, 80);
        bookings = bookings.filter((b) => matchesBookingSearch(b, q));
      }
      if (filter) {
        bookings = bookings.filter((b) => matchesBookingFilter(b, sanitizeString(filter, 20)));
      }
      return bookings.flatMap((b) => bookingToETickets(b));
    },

    ticketsForBooking: async (
      _: unknown,
      { bookingId, email }: { bookingId: string; email?: string },
      ctx: GatewayContext
    ) => {
      const b = await promisify<Record<string, unknown>>((cb) =>
        ctx.bookingClient.GetBooking({ booking_id: bookingId }, cb)
      );
      if (!b?.id) return [];

      if (ctx.user) {
        const ownerId = String(b.user_id ?? '').trim();
        if (ownerId && ownerId !== ctx.user.userId) {
          throw new Error('Forbidden — bạn không có quyền xem vé này');
        }
      } else if (email) {
        assertGuestEmailAccess(b, sanitizeEmail(email));
      } else {
        throw new Error('Unauthorized — vui lòng đăng nhập hoặc cung cấp email đặt vé');
      }

      try {
        const ticketRes = await promisify<{ tickets: Array<Record<string, unknown>> }>((cb) =>
          ctx.ticketClient.ListByBooking({ booking_id: String(b.id) }, cb)
        );
        if (ticketRes.tickets?.length) {
          const bookingStatus = String(b.status ?? '');
          return ticketRes.tickets.map((t) =>
            mapETicket({
              ...t,
              booking_status: bookingStatus || t.booking_status,
            })
          );
        }
      } catch (err) {
        logEvent(gatewayLogger, 'ticketsForBooking.ticketServiceFallback', {
          requestId: ctx.requestId,
          bookingId,
          error: String(err),
        });
      }

      return bookingToETickets(b);
    },

    ticket: async (_: unknown, { id }: { id: string }, ctx: GatewayContext) => {
      if (!ctx.user) {
        throw new Error('Unauthorized');
      }
      const t = await promisify<Record<string, unknown>>((cb) =>
        ctx.ticketClient.GetTicket({ ticket_id: id }, cb)
      );
      if (!t?.id) return null;
      if (ctx.user && t.user_id && t.user_id !== ctx.user.userId) {
        throw new Error('Forbidden');
      }
      return mapETicket(t);
    },

    searchTickets: async (
      _: unknown,
      { query, email, filter }: { query: string; email?: string; filter?: string },
      ctx: GatewayContext
    ) => {
      await enforceLookupRateLimit(ctx);
      const res = await promisify<{ tickets: Array<Record<string, unknown>> }>((cb) =>
        ctx.ticketClient.Search(
          {
            query: sanitizeString(query, 80),
            email: email ? sanitizeEmail(email) : '',
            filter: filter ? sanitizeString(filter, 20) : '',
          },
          cb
        )
      );
      return res.tickets.map(mapETicket);
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

    routeCatalog: async (
      _: unknown,
      { travelDate, limit }: { travelDate: string; limit?: number },
      ctx: GatewayContext
    ) => {
      const date = sanitizeDate(travelDate);
      const res = await promisify<{
        locations: string[];
        routes: Array<{
          origin: string;
          destination: string;
          trips_count: number;
          min_price: number;
          duration_minutes: number;
          next_departure_time: string;
        }>;
      }>((cb) => ctx.tripClient.GetRouteCatalog({ travel_date: date, limit: limit || 6 }, cb));
      return {
        locations: res.locations || [],
        routes: (res.routes || []).map((r) => ({
          origin: r.origin,
          destination: r.destination,
          tripsCount: r.trips_count,
          minPrice: r.min_price,
          durationMinutes: r.duration_minutes,
          nextDepartureTime: r.next_departure_time,
        })),
      };
    },

    revenueSummary: async (
      _: unknown,
      { fromDate, toDate }: { fromDate?: string; toDate?: string },
      ctx: GatewayContext
    ) => {
      requireRole(ctx, [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);
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

    adminDashboard: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      requireRole(ctx, [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);

      const today = formatDateVN(new Date());
      const from7 = formatDateVN(daysAgo(6));
      const from30 = formatDateVN(daysAgo(29));

      const mapDaily = (daily: Array<Record<string, unknown>>) =>
        daily.map((d) => ({
          date: String(d.date),
          revenue: Number(d.revenue) || 0,
          bookingCount: Number(d.booking_count) || 0,
        }));

      const mapRank = (items: Array<Record<string, unknown>>) =>
        (items || []).map((r) => ({
          name: String(r.name || ''),
          subtitle: String(r.subtitle || ''),
          count: Number(r.count) || 0,
          revenue: Number(r.revenue) || 0,
        }));

      const [revAll, rev7, rev30, conversion, ticketsByRoute, insightsRaw, activeTrips, customers] = await Promise.all([
        grpcCall<Record<string, unknown>>('analytics.revenueAll', (cb) => ctx.analyticsClient.GetRevenueSummary({}, cb)),
        grpcCall<Record<string, unknown>>('analytics.revenue7d', (cb) =>
          ctx.analyticsClient.GetRevenueSummary({ from_date: from7, to_date: today }, cb)
        ),
        grpcCall<Record<string, unknown>>('analytics.revenue30d', (cb) =>
          ctx.analyticsClient.GetRevenueSummary({ from_date: from30, to_date: today }, cb)
        ),
        grpcCall<Record<string, unknown>>('analytics.conversion', (cb) => ctx.analyticsClient.GetConversionRate({}, cb)),
        grpcCall<Record<string, unknown>>('analytics.ticketsByRoute', (cb) =>
          ctx.analyticsClient.GetTicketsSoldByRoute({}, cb)
        ),
        grpcCall<Record<string, unknown>>('booking.insights', (cb) =>
          ctx.bookingClient.GetAdminInsights({ orders_limit: 20, top_limit: 5 }, cb)
        ),
        grpcCall<Record<string, unknown>>('trip.activeCount', (cb) => ctx.tripClient.CountActiveTrips({}, cb)),
        grpcCall<Record<string, unknown>>('auth.customerCount', (cb) => ctx.authClient.CountCustomers({}, cb)),
      ]);
      const insights = insightsRaw;

      if (!revAll && !insights) {
        throw new Error(
          'Không kết nối được dịch vụ backend (booking-service / analytics). Chạy: docker compose up -d booking-service analytics-service trip-service auth-service'
        );
      }

      const recentOrders = ((insights?.recent_orders as Array<Record<string, unknown>>) || []).map((o) => ({
        ticketCode: String(o.booking_code || ''),
        bookingCode: String(o.booking_code || ''),
        customerName: String(o.customer_name || ''),
        routeName: String(o.route_name || ''),
        origin: String(o.origin || ''),
        destination: String(o.destination || ''),
        seatId: String(o.seat_id || ''),
        totalAmount: Number(o.total_amount) || 0,
        status: String(o.status || ''),
        createdAt: String(o.created_at || ''),
      }));

      const analyticsTopRoutes = ((ticketsByRoute?.routes as Array<Record<string, unknown>>) || [])
        .sort((a, b) => Number(b.tickets_sold) - Number(a.tickets_sold))
        .slice(0, 5)
        .map((r) => ({
          name: String(r.route_name || ''),
          subtitle: 'Kafka analytics',
          count: Number(r.tickets_sold) || 0,
          revenue: Number(r.revenue) || 0,
        }));

      return {
        stats: {
          totalRevenue: revAll?.total_revenue || 0,
          ticketsSold: Number(insights?.bookings_sold) || 0,
          customers: customers?.count || 0,
          activeTrips: activeTrips?.count || 0,
          conversionRate: conversion?.conversion_rate || 0,
          totalSearches: conversion?.total_searches || 0,
          totalBookings: conversion?.total_bookings || 0,
        },
        revenue7Days: mapDaily((rev7?.daily as Array<Record<string, unknown>>) || []),
        revenue30Days: mapDaily((rev30?.daily as Array<Record<string, unknown>>) || []),
        topRoutes:
          analyticsTopRoutes.length > 0
            ? analyticsTopRoutes
            : mapRank((insights?.top_routes as Array<Record<string, unknown>>) || []),
        topOperators: mapRank((insights?.top_operators as Array<Record<string, unknown>>) || []),
        topCustomers: mapRank((insights?.top_customers as Array<Record<string, unknown>>) || []),
        recentOrders,
      };
    },

    ...adminResolvers.Query,
  },

  Mutation: {
    register: async (
      _: unknown,
      args: { email: string; password: string; fullName: string },
      ctx: GatewayContext
    ) => {
      try {
        const email = sanitizeEmail(args.email);
        const fullName = sanitizeString(args.fullName, 120);
        if (!args.password || args.password.length < 6) {
          throw new Error('Mật khẩu tối thiểu 6 ký tự');
        }
        const res = await promisify<{ token: string; user_id: string; role?: string }>((cb) =>
          ctx.authClient.Register({ email, password: args.password, full_name: fullName }, cb)
        );
        logEvent(gatewayLogger, 'auth.register', { requestId: ctx.requestId, email, userId: res.user_id });
        return {
          token: res.token,
          userId: res.user_id,
          role: normalizeRole(res.role ?? USER_ROLES.CUSTOMER),
        };
      } catch (err) {
        logEvent(gatewayLogger, 'auth.register.failed', {
          requestId: ctx.requestId,
          email: args.email,
          error: err instanceof Error ? err.message : String(err),
        });
        throw mapAuthError(err);
      }
    },

    login: async (_: unknown, args: { email: string; password: string }, ctx: GatewayContext) => {
      try {
        const email = sanitizeEmail(args.email);
        if (!args.password) {
          throw new Error('Vui lòng nhập mật khẩu');
        }
        const res = await promisify<{ token: string; user_id: string; role: string }>((cb) =>
          ctx.authClient.Login({ email, password: args.password }, cb)
        );
        logEvent(gatewayLogger, 'auth.login', { requestId: ctx.requestId, email, userId: res.user_id });
        return {
          token: res.token,
          userId: res.user_id,
          role: normalizeRole(res.role),
        };
      } catch (err) {
        logEvent(gatewayLogger, 'auth.login.failed', {
          requestId: ctx.requestId,
          email: args.email,
          error: err instanceof Error ? err.message : String(err),
        });
        throw mapAuthError(err);
      }
    },

    holdSeats: async (
      _: unknown,
      args: { tripId: string; seatIds: string[]; sessionId: string },
      ctx: GatewayContext
    ) => {
      const bookable = await assertTripBookable(ctx, args.tripId);
      if (!bookable.ok) {
        return {
          success: false,
          holdToken: '',
          expiresInSeconds: 0,
          message: bookable.message,
        };
      }

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
      const bookable = await assertTripBookable(ctx, args.tripId);
      if (!bookable.ok) {
        throw new Error(bookable.message);
      }

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
      logEvent(gatewayLogger, 'booking.created', {
        requestId: ctx.requestId,
        bookingId: res.booking_id,
        bookingCode: res.booking_code,
        userId: ctx.user?.userId,
      });
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
        const b = await promisify<Record<string, unknown>>((cb) =>
          ctx.bookingClient.GetBooking({ booking_id: bookingId }, cb)
        );
        if (!b?.id) {
          return { success: false, message: 'Thanh toán thành công nhưng không tìm thấy booking trong database', bookingId: null, bookingCode: null };
        }
        return {
          success: true,
          message: result.message,
          bookingId: b.id,
          bookingCode: b.booking_code,
        };
      }
      return { success: false, message: result.message, bookingId: null, bookingCode: null };
    },

    cancelBooking: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GatewayContext) => {
      if (!ctx.user?.userId) {
        throw new Error('Forbidden — vui lòng đăng nhập để quản lý hoặc hủy vé');
      }

      const b = await promisify<Record<string, unknown>>((cb) =>
        ctx.bookingClient.GetBooking({ booking_id: bookingId }, cb)
      );
      if (!b?.id) {
        return { success: false, message: 'Không tìm thấy đặt vé', bookingId: null, bookingCode: null };
      }

      const ownerId = String(b.user_id ?? '').trim();
      if (!ownerId || ownerId !== ctx.user.userId) {
        throw new Error('Forbidden — bạn không có quyền hủy đặt vé này');
      }

      const res = await promisify<{ success: boolean; message: string }>((cb) =>
        ctx.bookingClient.CancelBooking({ booking_id: bookingId, user_id: ctx.user!.userId }, cb)
      );
      if (!res.success) {
        throw new Error(res.message || 'Không thể hủy đặt vé');
      }
      return { ...res, bookingId, bookingCode: String(b.booking_code ?? '') };
    },

    checkIn: async (_: unknown, args: { bookingCode: string; ticketId?: string }, ctx: GatewayContext) => {
      requireRole(ctx, [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);
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
      requireRole(ctx, [USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);
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
      requireRole(ctx, [USER_ROLES.ADMIN]);
      JSON.parse(layoutJson);
      await redis.set(REDIS_KEYS.busLayout(sanitizeString(busLayoutType, 32)), layoutJson);
      return true;
    },

    ...adminResolvers.Mutation,
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

function mapTrip(t: Record<string, unknown>, travelDate?: string) {
  const departureTime = String(t.departure_time ?? t.departureTime ?? '');
  const fromGrpc =
    t.bookable !== undefined && t.bookable !== null
      ? {
          bookable: Boolean(t.bookable),
          availabilityStatus: String(t.availability_status ?? t.availabilityStatus ?? 'AVAILABLE'),
          availabilityLabel: String(t.availability_label ?? t.availabilityLabel ?? ''),
        }
      : null;
  const fallback =
    travelDate && departureTime
      ? (() => {
          const seatsRaw = t.available_seats ?? t.availableSeats;
          const seats =
            seatsRaw !== undefined && seatsRaw !== null ? Number(seatsRaw) : undefined;
          const av = getTripAvailability(travelDate, departureTime, new Date(), seats);
          return {
            bookable: av.bookable,
            availabilityStatus: av.availabilityStatus,
            availabilityLabel: av.availabilityLabel,
          };
        })()
      : { bookable: true, availabilityStatus: 'AVAILABLE', availabilityLabel: '' };

  const availability = fromGrpc ?? fallback;

  return {
    id: t.id,
    routeName: t.route_name,
    origin: t.origin,
    destination: t.destination,
    operatorName: t.operator_name,
    busType: t.bus_type,
    departureTime,
    arrivalTime: t.arrival_time,
    price: t.price,
    availableSeats: t.available_seats,
    durationMinutes: t.duration_minutes,
    bookable: availability.bookable,
    availabilityStatus: availability.availabilityStatus,
    availabilityLabel: availability.availabilityLabel,
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

function assertGuestEmailAccess(b: Record<string, unknown>, email: string) {
  const guest = String(b.guest_email ?? '').toLowerCase();
  const passengerEmails = ((b.passengers as Array<{ email?: string }>) || []).map((p) =>
    String(p.email ?? '').toLowerCase()
  );
  if (guest !== email && !passengerEmails.includes(email)) {
    throw new Error('Unauthorized — email không khớp với đơn đặt vé');
  }
}

function assertBookingReadAccess(
  b: Record<string, unknown>,
  ctx: GatewayContext,
  guestEmail?: string
) {
  if (ctx.user?.userId) {
    const ownerId = String(b.user_id ?? '').trim();
    if (ownerId && ownerId !== ctx.user.userId) {
      throw new Error('Forbidden — bạn không có quyền xem đặt vé này');
    }
    return;
  }
  if (guestEmail) {
    assertGuestEmailAccess(b, guestEmail);
    return;
  }
  throw new Error('Unauthorized — vui lòng đăng nhập hoặc cung cấp email đặt vé');
}

function mapBooking(b: Record<string, unknown>) {
  return {
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
    userId: b.user_id ? String(b.user_id) : null,
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

function resolveDepartureTime(b: Record<string, unknown>): string {
  const dep = String(b.departure_time ?? '').trim();
  if (dep) {
    const d = new Date(dep);
    if (!Number.isNaN(d.getTime())) return dep;
  }
  const created = String(b.created_at ?? '').trim();
  if (created) {
    const d = new Date(created);
    if (!Number.isNaN(d.getTime())) return created;
  }
  return new Date().toISOString();
}

function bookingToETickets(b: Record<string, unknown>) {
  const passengers = (b.passengers as Array<Record<string, string>>) || [];
  const bookingCode = String(b.booking_code ?? '');
  const perSeat =
    passengers.length > 0 ? Number(b.total_amount ?? 0) / passengers.length : Number(b.total_amount ?? 0);
  const paymentStatus = String(b.payment_status ?? (b.status === 'PENDING_PAYMENT' ? 'PENDING' : 'PAID'));
  const bookingStatus = String(b.status ?? '');
  const departureTime = resolveDepartureTime(b);

  return passengers.map((p) => {
    const seatId = String(p.seat_id ?? '');
    const ticketCode = passengers.length === 1 ? bookingCode : `${bookingCode}-${seatId}`;
    const qrCode = JSON.stringify({
      bookingCode,
      ticketCode,
      passenger: p.full_name,
      seat: seatId,
      departure: departureTime,
    });
    return {
      id: `${b.id}-${seatId}`,
      ticketCode,
      bookingId: b.id,
      bookingCode,
      tripId: b.trip_id,
      passengerName: p.full_name,
      passengerPhone: p.phone,
      passengerEmail: p.email,
      seatId,
      routeName: String(b.route_name ?? 'Tuyến xe'),
      origin: String(b.origin ?? ''),
      destination: String(b.destination ?? ''),
      operatorName: String(b.operator_name ?? ''),
      pickupPoint: String(b.pickup_point ?? ''),
      dropoffPoint: String(b.dropoff_point ?? ''),
      departureTime,
      busPlate: String(b.bus_plate ?? ''),
      totalAmount: perSeat,
      paymentStatus,
      bookingStatus,
      qrCode,
      createdAt: String(b.created_at ?? new Date().toISOString()),
    };
  });
}

function matchesBookingFilter(b: Record<string, unknown>, filter: string): boolean {
  const status = String(b.status ?? '');
  const departureTime = resolveDepartureTime(b);
  const dep = new Date(departureTime).getTime();
  const now = Date.now();
  const cancelled = status === 'CANCELLED' || status === 'EXPIRED';
  switch (filter.toUpperCase()) {
    case 'UPCOMING':
      return !cancelled && !Number.isNaN(dep) && dep >= now;
    case 'COMPLETED':
      return cancelled || Number.isNaN(dep) || dep < now || status === 'CHECKED_IN' || status === 'COMPLETED';
    case 'CANCELLED':
      return cancelled;
    default:
      return true;
  }
}

function matchesBookingSearch(b: Record<string, unknown>, q: string): boolean {
  const norm = q.trim().toLowerCase();
  if (!norm) return true;
  if (String(b.booking_code ?? '').toLowerCase().includes(norm)) return true;
  if (String(b.guest_email ?? '').toLowerCase().includes(norm)) return true;
  const passengers = (b.passengers as Array<Record<string, string>>) || [];
  return passengers.some(
    (p) =>
      String(p.full_name ?? '').toLowerCase().includes(norm) ||
      String(p.phone ?? '').includes(norm) ||
      String(p.email ?? '').toLowerCase().includes(norm)
  );
}

function mapETicket(t: Record<string, unknown>) {
  return {
    id: t.id,
    ticketCode: t.ticket_code,
    bookingId: t.booking_id,
    bookingCode: t.booking_code,
    tripId: t.trip_id,
    passengerName: t.passenger_name,
    passengerPhone: t.passenger_phone,
    passengerEmail: t.passenger_email,
    seatId: t.seat_id,
    routeName: t.route_name,
    origin: t.origin,
    destination: t.destination,
    operatorName: t.operator_name,
    pickupPoint: t.pickup_point,
    dropoffPoint: t.dropoff_point,
    departureTime: t.departure_time,
    busPlate: t.bus_plate,
    totalAmount: t.total_amount,
    paymentStatus: t.payment_status,
    bookingStatus: t.booking_status,
    qrCode: t.qr_code,
    createdAt: t.created_at,
  };
}
