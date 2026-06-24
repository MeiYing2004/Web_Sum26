import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { BookingService, SeatInventoryService, PaymentService, TripService, TicketService } from '@bus/proto';
import {
  canTransition,
  publishBookingEvent,
  publishBookingPaid,
  BOOKING_STATUS,
  bootstrapServiceHealth,
  createLogger,
  logEvent,
  getGrpcRequestId,
} from '@bus/shared';

const logger = createLogger('booking-service');

const prisma = new PrismaClient();
const GRPC_PORT = process.env.GRPC_PORT || '50055';
const SEAT_SERVICE_URL = process.env.SEAT_SERVICE_URL || 'localhost:50054';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'localhost:50056';
const TRIP_SERVICE_URL = process.env.TRIP_SERVICE_URL || 'localhost:50053';
const TICKET_SERVICE_URL = process.env.TICKET_SERVICE_URL || 'localhost:50057';
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://bus:bus123@localhost:5672';

const PAID_STATUSES = [
  BOOKING_STATUS.PAID,
  BOOKING_STATUS.TICKET_ISSUED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.COMPLETED,
];

function seatClient() {
  return new SeatInventoryService(SEAT_SERVICE_URL, grpc.credentials.createInsecure());
}

function paymentClient() {
  return new PaymentService(PAYMENT_SERVICE_URL, grpc.credentials.createInsecure());
}

function tripClient() {
  return new TripService(TRIP_SERVICE_URL, grpc.credentials.createInsecure());
}

function ticketClient() {
  return new TicketService(TICKET_SERVICE_URL, grpc.credentials.createInsecure());
}

function promisify<T>(fn: (cb: (err: Error | null, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, res) => (err ? reject(err) : resolve(res))));
}

function generateBookingCode() {
  return `TK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

type TripMeta = {
  routeName: string;
  origin: string;
  destination: string;
  operatorName: string;
  pickupPoint: string;
  dropoffPoint: string;
  departureTime: string;
  busPlate: string;
};

async function fetchTripMeta(tripId: string): Promise<TripMeta> {
  try {
    const t = await promisify<Record<string, unknown>>((cb) =>
      tripClient().GetTripDetail({ trip_id: tripId }, cb)
    );
    return {
      routeName: String(t.route_name ?? 'Tuyến xe'),
      origin: String(t.origin ?? ''),
      destination: String(t.destination ?? ''),
      operatorName: String(t.operator_name ?? ''),
      pickupPoint: String(t.pickup_point ?? 'Bến xe'),
      dropoffPoint: String(t.dropoff_point ?? 'Điểm đến'),
      departureTime: String(t.departure_time ?? new Date().toISOString()),
      busPlate: String(t.bus_plate ?? ''),
    };
  } catch {
    return {
      routeName: 'Tuyến xe',
      origin: '',
      destination: '',
      operatorName: '',
      pickupPoint: 'Bến xe',
      dropoffPoint: 'Điểm đến',
      departureTime: new Date().toISOString(),
      busPlate: '',
    };
  }
}

async function findBookingByRef(ref: string) {
  const code = normalizeCode(ref);
  const byId = await prisma.booking.findUnique({
    where: { id: ref },
    include: { passengers: true },
  });
  if (byId) return byId;

  return prisma.booking.findFirst({
    where: { bookingCode: { equals: code, mode: 'insensitive' } },
    include: { passengers: true },
  });
}

async function transitionStatus(bookingId: string, from: string, to: string) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} -> ${to}`);
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: to },
  });
  await prisma.statusLog.create({
    data: { bookingId, fromStatus: from, toStatus: to },
  });
}

function toBookingDetail(b: Awaited<ReturnType<typeof prisma.booking.findUnique>> & { passengers?: unknown[] }) {
  if (!b) return null;
  return {
    id: b.id,
    booking_code: b.bookingCode,
    status: b.status,
    trip_id: b.tripId,
    route_name: b.routeName,
    origin: b.origin,
    destination: b.destination,
    operator_name: b.operatorName,
    pickup_point: b.pickupPoint,
    dropoff_point: b.dropoffPoint,
    departure_time: b.departureTime,
    bus_plate: b.busPlate,
    total_amount: b.totalAmount,
    payment_status: b.paymentStatus,
    passengers: ((b.passengers as Array<{ fullName: string; phone: string; email: string; idNumber?: string; seatId: string }>) || []).map((p) => ({
      full_name: p.fullName,
      phone: p.phone,
      email: p.email,
      id_number: p.idNumber,
      seat_id: p.seatId,
    })),
    user_id: b.userId,
    guest_email: b.guestEmail,
    created_at: b.createdAt.toISOString(),
  };
}

type BookingWithPassengers = Awaited<
  ReturnType<typeof prisma.booking.findFirst<{ include: { passengers: true } }>>
> & {};

async function enrichBookingFromTrip(b: NonNullable<BookingWithPassengers>): Promise<NonNullable<BookingWithPassengers>> {
  if (!needsTripEnrichment(b)) return b;
  const trip = await fetchTripMeta(b.tripId);
  const updated = await prisma.booking.update({
    where: { id: b.id },
    data: {
      routeName: b.routeName || trip.routeName,
      origin: b.origin || trip.origin,
      destination: b.destination || trip.destination,
      operatorName: b.operatorName || trip.operatorName,
      pickupPoint: b.pickupPoint || trip.pickupPoint,
      dropoffPoint: b.dropoffPoint || trip.dropoffPoint,
      departureTime: b.departureTime || trip.departureTime,
      busPlate: b.busPlate || trip.busPlate,
    },
    include: { passengers: true },
  });
  return updated;
}

function needsTripEnrichment(b: { departureTime: string; routeName: string }) {
  return !b.departureTime?.trim() || !b.routeName?.trim();
}

function matchesFilter(
  b: { status: string; departureTime: string },
  filter?: string
): boolean {
  if (!filter || filter === 'ALL') return true;
  const dep = new Date(b.departureTime).getTime();
  const now = Date.now();
  const cancelled = b.status === BOOKING_STATUS.CANCELLED || b.status === BOOKING_STATUS.EXPIRED;
  switch (filter.toUpperCase()) {
    case 'UPCOMING':
      return !cancelled && dep >= now;
    case 'COMPLETED':
      return cancelled || dep < now || b.status === BOOKING_STATUS.CHECKED_IN || b.status === BOOKING_STATUS.COMPLETED;
    case 'CANCELLED':
      return cancelled;
    default:
      return true;
  }
}

function matchesSearch(
  b: {
    bookingCode: string;
    guestEmail: string;
    passengers: Array<{ fullName: string; phone: string; email: string }>;
  },
  q: string
): boolean {
  if (!q.trim()) return true;
  const norm = q.trim().toLowerCase();
  if (b.bookingCode.toLowerCase().includes(norm)) return true;
  if (b.guestEmail.toLowerCase().includes(norm)) return true;
  return b.passengers.some(
    (p) =>
      p.fullName.toLowerCase().includes(norm) ||
      p.phone.includes(norm) ||
      p.email.toLowerCase().includes(norm)
  );
}

const bookingServiceImpl = {
  CreateBooking: async (call: grpc.ServerUnaryCall<Record<string, unknown>, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const req = call.request as {
        trip_id: string;
        hold_token: string;
        passengers: Array<{ full_name: string; phone: string; email: string; id_number?: string; seat_id: string }>;
        user_id?: string;
        guest_email: string;
      };

      const seatIds = req.passengers.map((p) => p.seat_id);
      const totalAmount = seatIds.length * 200000;
      const trip = await fetchTripMeta(req.trip_id);
      const guestEmail = req.guest_email.trim().toLowerCase();

      const booking = await prisma.booking.create({
        data: {
          bookingCode: generateBookingCode(),
          tripId: req.trip_id,
          userId: req.user_id,
          guestEmail,
          holdToken: req.hold_token,
          status: BOOKING_STATUS.PENDING_PAYMENT,
          paymentStatus: 'PENDING',
          totalAmount,
          paymentDeadline: new Date(Date.now() + 15 * 60 * 1000),
          routeName: trip.routeName,
          origin: trip.origin,
          destination: trip.destination,
          operatorName: trip.operatorName,
          pickupPoint: trip.pickupPoint,
          dropoffPoint: trip.dropoffPoint,
          departureTime: trip.departureTime,
          busPlate: trip.busPlate,
          passengers: {
            create: req.passengers.map((p) => ({
              fullName: p.full_name,
              phone: p.phone,
              email: p.email.trim().toLowerCase(),
              idNumber: p.id_number,
              seatId: p.seat_id,
            })),
          },
          statusLogs: {
            create: [{ fromStatus: BOOKING_STATUS.DRAFT, toStatus: BOOKING_STATUS.PENDING_PAYMENT }],
          },
        },
        include: { passengers: true },
      });

      console.log('[CREATE BOOKING]', {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        userId: booking.userId,
        email: booking.guestEmail,
        recordCount: 1,
      });

      await publishBookingEvent(KAFKA_BROKERS, 'booking.created', {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        tripId: req.trip_id,
        totalAmount,
      });

      callback(null, {
        booking_id: booking.id,
        booking_code: booking.bookingCode,
        status: BOOKING_STATUS.PENDING_PAYMENT,
        total_amount: totalAmount,
        payment_deadline_seconds: 900,
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetBooking: async (call: grpc.ServerUnaryCall<{ booking_id: string }, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      let b = await findBookingByRef(call.request.booking_id);
      if (!b) return callback({ code: grpc.status.NOT_FOUND, message: 'Not found' } as grpc.ServiceError, null);
      if (needsTripEnrichment(b)) {
        b = await enrichBookingFromTrip(b);
      }

      console.log('[GET TICKET DETAIL]', {
        bookingId: b.id,
        bookingCode: b.bookingCode,
        userId: b.userId,
        email: b.guestEmail,
        recordCount: 1,
      });

      callback(null, toBookingDetail(b));
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetBookingByCode: async (
    call: grpc.ServerUnaryCall<{ booking_code: string; email?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const code = normalizeCode(call.request.booking_code);
      const emailNorm = call.request.email?.trim().toLowerCase();

      let b = await prisma.booking.findFirst({
        where: { bookingCode: { equals: code, mode: 'insensitive' } },
        include: { passengers: true },
      });

      if (!b) {
        console.log('[LOOKUP BOOKING]', { bookingId: code, email: emailNorm, recordCount: 0 });
        return callback({ code: grpc.status.NOT_FOUND, message: 'Không tìm thấy vé' } as grpc.ServiceError, null);
      }

      if (needsTripEnrichment(b)) {
        b = await enrichBookingFromTrip(b);
      }

      if (emailNorm) {
        const guestMatch = b.guestEmail.toLowerCase() === emailNorm;
        const passengerMatch = b.passengers.some((p) => p.email.toLowerCase() === emailNorm);
        if (!guestMatch && !passengerMatch) {
          console.log('[LOOKUP BOOKING]', { bookingId: b.id, email: emailNorm, recordCount: 0 });
          return callback({ code: grpc.status.NOT_FOUND, message: 'Mã vé và email không khớp' } as grpc.ServiceError, null);
        }
      }

      console.log('[LOOKUP BOOKING]', {
        bookingId: b.id,
        bookingCode: b.bookingCode,
        userId: b.userId,
        email: emailNorm || b.guestEmail,
        recordCount: 1,
      });

      callback(null, toBookingDetail(b));
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  CancelBooking: async (
    call: grpc.ServerUnaryCall<{ booking_id: string; user_id?: string; guest_email?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const b = await prisma.booking.findUnique({
        where: { id: call.request.booking_id },
        include: { passengers: true },
      });
      if (!b) return callback(null, { success: false, message: 'Not found' });

      const requesterId = call.request.user_id?.trim();
      if (!requesterId) {
        return callback(
          { code: grpc.status.PERMISSION_DENIED, message: 'Forbidden — authentication required' } as grpc.ServiceError,
          null
        );
      }

      if (!b.userId || b.userId !== requesterId) {
        return callback(
          { code: grpc.status.PERMISSION_DENIED, message: 'Forbidden — booking ownership mismatch' } as grpc.ServiceError,
          null
        );
      }

      if (b.status !== BOOKING_STATUS.PAID && b.status !== BOOKING_STATUS.TICKET_ISSUED) {
        return callback(null, { success: false, message: 'Không thể hủy ở trạng thái hiện tại' });
      }

      if (b.departureTime?.trim()) {
        const dep = new Date(b.departureTime);
        if (!Number.isNaN(dep.getTime()) && dep.getTime() <= Date.now()) {
          return callback(null, { success: false, message: 'Chuyến đã khởi hành — không thể hủy' });
        }
      }

      await transitionStatus(b.id, b.status, BOOKING_STATUS.CANCELLED);

      const seatIds = b.passengers.map((p) => p.seatId).filter(Boolean);
      if (seatIds.length > 0) {
        const seatClient_ = seatClient();
        await new Promise<void>((resolve, reject) => {
          seatClient_.UnbookSeats({ trip_id: b.tripId, seat_ids: seatIds }, (err: Error | null, res) => {
            if (err) reject(err);
            else if (!res?.success) reject(new Error(res?.message || 'Không giải phóng được ghế'));
            else resolve();
          });
        });
      }

      await publishBookingEvent(KAFKA_BROKERS, 'booking.cancelled', { bookingId: b.id });

      try {
        await promisify<{ updated_count: number }>((cb) =>
          ticketClient().CancelByBooking({ booking_id: b.id }, cb)
        );
      } catch (ticketErr) {
        console.warn('[cancel] ticket-service sync failed:', ticketErr);
      }

      callback(null, { success: true, message: 'Đã hủy booking' });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  CheckIn: async (
    call: grpc.ServerUnaryCall<{ booking_code: string; ticket_id?: string; staff_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const code = normalizeCode(call.request.booking_code);
      const b = await prisma.booking.findFirst({
        where: { bookingCode: { equals: code, mode: 'insensitive' } },
      });
      if (!b) return callback(null, { success: false, message: 'Booking không tồn tại' });
      if (b.status !== BOOKING_STATUS.TICKET_ISSUED && b.status !== BOOKING_STATUS.PAID) {
        return callback(null, { success: false, message: 'Booking chưa sẵn sàng check-in' });
      }
      await transitionStatus(b.id, b.status, BOOKING_STATUS.CHECKED_IN);
      await publishBookingEvent(KAFKA_BROKERS, 'booking.checked_in', {
        bookingId: b.id,
        staffId: call.request.staff_id,
      });
      logEvent(logger, 'check-in', {
        requestId: getGrpcRequestId(call),
        bookingCode: call.request.booking_code,
        staffId: call.request.staff_id,
      });
      callback(null, { success: true, message: 'Check-in thành công' });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListUserBookings: async (
    call: grpc.ServerUnaryCall<{ user_id: string; email?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const userId = call.request.user_id;
      const emailNorm = call.request.email?.trim().toLowerCase();

      const orFilters: Array<Record<string, unknown>> = [];
      if (userId) orFilters.push({ userId });
      if (emailNorm) {
        orFilters.push({ guestEmail: { equals: emailNorm, mode: 'insensitive' } });
        orFilters.push({ passengers: { some: { email: { equals: emailNorm, mode: 'insensitive' } } } });
      }

      const bookings = await prisma.booking.findMany({
        where: orFilters.length > 0 ? { OR: orFilters } : { userId },
        include: { passengers: true },
        orderBy: { createdAt: 'desc' },
      });

      const filtered = bookings.filter((b) => PAID_STATUSES.includes(b.status as (typeof PAID_STATUSES)[number]) || b.status === BOOKING_STATUS.CANCELLED || b.status === BOOKING_STATUS.EXPIRED);

      const enriched = await Promise.all(
        filtered.map(async (b) => (needsTripEnrichment(b) ? enrichBookingFromTrip(b) : b))
      );

      console.log('[GET MY TICKETS]', {
        bookingId: enriched.map((b) => b.bookingCode).join(','),
        userId,
        email: emailNorm,
        recordCount: enriched.length,
      });

      callback(null, { bookings: enriched.map((b) => toBookingDetail(b)) });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListBookingsByTrip: async (
    call: grpc.ServerUnaryCall<
      { trip_id: string; search?: string; page?: number; page_size?: number },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const page = Math.max(1, call.request.page || 1);
      const pageSize = Math.min(100, Math.max(1, call.request.page_size || 20));
      const search = call.request.search?.trim().toLowerCase() || '';

      const where: Record<string, unknown> = { tripId: call.request.trip_id };
      const bookings = await prisma.booking.findMany({
        where,
        include: { passengers: true },
        orderBy: { createdAt: 'desc' },
      });

      let filtered = bookings;
      if (search) {
        filtered = bookings.filter(
          (b) =>
            b.bookingCode.toLowerCase().includes(search) ||
            b.guestEmail.toLowerCase().includes(search) ||
            b.passengers.some(
              (p) =>
                p.fullName.toLowerCase().includes(search) ||
                p.phone.includes(search) ||
                p.email.toLowerCase().includes(search)
            )
        );
      }

      const total = filtered.length;
      const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
      const enriched = await Promise.all(
        paged.map(async (b) => (needsTripEnrichment(b) ? enrichBookingFromTrip(b) : b))
      );

      callback(null, { bookings: enriched.map((b) => toBookingDetail(b)), total });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetAdminInsights: async (
    call: grpc.ServerUnaryCall<{ orders_limit?: number; top_limit?: number }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const ordersLimit = call.request.orders_limit || 20;
      const topLimit = call.request.top_limit || 5;

      const paidBookings = await prisma.booking.findMany({
        where: { status: { in: PAID_STATUSES } },
        include: { passengers: true },
        orderBy: { createdAt: 'desc' },
      });

      const bookingsSold = paidBookings.reduce((sum, b) => sum + b.passengers.length, 0);

      const routeMap = new Map<string, { count: number; revenue: number }>();
      const operatorMap = new Map<string, { count: number; revenue: number }>();
      const customerMap = new Map<string, { count: number; revenue: number; name: string }>();

      for (const b of paidBookings) {
        const perSeat = b.passengers.length > 0 ? b.totalAmount / b.passengers.length : b.totalAmount;
        for (const p of b.passengers) {
          const route = b.routeName || 'Khác';
          const op = b.operatorName || 'Khác';
          const r = routeMap.get(route) || { count: 0, revenue: 0 };
          r.count += 1;
          r.revenue += perSeat;
          routeMap.set(route, r);

          const o = operatorMap.get(op) || { count: 0, revenue: 0 };
          o.count += 1;
          o.revenue += perSeat;
          operatorMap.set(op, o);

          const c = customerMap.get(p.email) || { count: 0, revenue: 0, name: p.fullName };
          c.count += 1;
          c.revenue += perSeat;
          customerMap.set(p.email, c);
        }
      }

      const toRank = (map: Map<string, { count: number; revenue: number; name?: string }>, useName = false) =>
        Array.from(map.entries())
          .map(([key, v]) => ({
            name: useName ? v.name || key.split('@')[0] : key,
            subtitle: useName ? key : '',
            count: v.count,
            revenue: v.revenue,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, topLimit);

      const recentOrders = paidBookings.slice(0, ordersLimit).flatMap((b) =>
        b.passengers.map((p) => ({
          booking_code: b.bookingCode,
          customer_name: p.fullName,
          route_name: b.routeName,
          origin: b.origin,
          destination: b.destination,
          seat_id: p.seatId,
          total_amount: b.passengers.length > 0 ? b.totalAmount / b.passengers.length : b.totalAmount,
          status: b.status,
          created_at: b.createdAt.toISOString(),
        }))
      );

      console.log('[ADMIN DASHBOARD]', {
        bookingId: recentOrders[0]?.booking_code,
        userId: null,
        email: null,
        recordCount: bookingsSold,
      });

      callback(null, {
        bookings_sold: bookingsSold,
        top_routes: toRank(routeMap),
        top_operators: toRank(operatorMap),
        top_customers: toRank(customerMap, true),
        recent_orders: recentOrders.slice(0, ordersLimit),
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListAdminEventLogs: async (
    call: grpc.ServerUnaryCall<{ limit?: number }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const limit = Math.min(Math.max(call.request.limit || 50, 1), 200);
      const logs = await prisma.statusLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { booking: { select: { bookingCode: true } } },
      });
      callback(null, {
        events: logs.map((log) => ({
          id: log.id,
          booking_id: log.bookingId,
          booking_code: log.booking.bookingCode,
          event_type: log.toStatus,
          detail: log.fromStatus ? `${log.fromStatus} → ${log.toStatus}` : log.toStatus,
          created_at: log.createdAt.toISOString(),
        })),
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ProcessPayment: async (
    call: grpc.ServerUnaryCall<{ booking_id: string; simulate_success: boolean }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const result = await processPayment(
        call.request.booking_id,
        call.request.simulate_success,
        `pay:${call.request.booking_id}`
      );
      callback(null, result);
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  MarkTicketIssued: async (
    call: grpc.ServerUnaryCall<{ booking_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const b = await prisma.booking.findUnique({ where: { id: call.request.booking_id } });
      if (!b) return callback(null, { success: false });
      if (b.status === BOOKING_STATUS.TICKET_ISSUED) return callback(null, { success: true });
      if (b.status === BOOKING_STATUS.PAID) {
        await transitionStatus(b.id, b.status, BOOKING_STATUS.TICKET_ISSUED);
      }
      callback(null, { success: true });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ExpirePendingBookings: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const expired = await prisma.booking.findMany({
        where: {
          status: BOOKING_STATUS.PENDING_PAYMENT,
          paymentDeadline: { lt: new Date() },
        },
      });
      for (const b of expired) {
        await transitionStatus(b.id, b.status, BOOKING_STATUS.EXPIRED);
        if (b.holdToken) {
          const seatClient_ = seatClient();
          const seatIds = (await prisma.passenger.findMany({ where: { bookingId: b.id } })).map((p) => p.seatId);
          await new Promise<void>((resolve, reject) => {
            seatClient_.ReleaseSeats(
              { trip_id: b.tripId, seat_ids: seatIds, hold_token: b.holdToken },
              (err: Error | null) => (err ? reject(err) : resolve())
            );
          });
        }
      }
      callback(null, { expired_count: expired.length });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },
};

export async function processPayment(
  bookingId: string,
  simulateSuccess: boolean,
  idempotencyKey?: string
): Promise<{ success: boolean; message: string }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { passengers: true },
  });
  if (!booking) return { success: false, message: 'Booking not found' };

  if (booking.status === BOOKING_STATUS.PAID || booking.status === BOOKING_STATUS.TICKET_ISSUED) {
    return { success: true, message: 'Booking đã thanh toán (idempotent)' };
  }
  if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
    return { success: false, message: 'Booking không ở trạng thái chờ thanh toán' };
  }

  const payClient = paymentClient();
  const paymentResult = await new Promise<{ success: boolean; status: string; payment_id: string; message: string }>(
    (resolve, reject) => {
      payClient.ProcessPayment(
        {
          booking_id: bookingId,
          booking_code: booking.bookingCode,
          amount: booking.totalAmount,
          simulate_success: simulateSuccess,
          idempotency_key: idempotencyKey || `pay:${bookingId}`,
        },
        (err: Error | null, res: { success: boolean; status: string; payment_id: string; message: string }) =>
          err ? reject(err) : resolve(res)
      );
    }
  );

  if (!paymentResult.success) {
    return { success: false, message: paymentResult.message };
  }

  await transitionStatus(bookingId, BOOKING_STATUS.PENDING_PAYMENT, BOOKING_STATUS.PAID);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'PAID' },
  });

  const seatIds = booking.passengers.map((p) => p.seatId);
  const seatClient_ = seatClient();
  await new Promise<void>((resolve, reject) => {
    seatClient_.ConfirmSeats(
      {
        trip_id: booking.tripId,
        seat_ids: seatIds,
        hold_token: booking.holdToken || '',
        booking_id: bookingId,
      },
      (err: Error | null) => (err ? reject(err) : resolve())
    );
  });

  await transitionStatus(bookingId, BOOKING_STATUS.PAID, BOOKING_STATUS.TICKET_ISSUED);

  if (needsTripEnrichment(booking)) {
    const enriched = await enrichBookingFromTrip(booking);
    Object.assign(booking, enriched);
  }

  await publishBookingPaid(RABBITMQ_URL, {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    tripId: booking.tripId,
    userId: booking.userId,
    guestEmail: booking.guestEmail,
    passengers: booking.passengers,
    totalAmount: booking.totalAmount,
  });

  logEvent(logger, 'booking.paid', {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    amount: booking.totalAmount,
  });

  await publishBookingEvent(KAFKA_BROKERS, 'booking.paid', {
    bookingId: booking.id,
    tripId: booking.tripId,
    routeName: booking.routeName || 'Khác',
    ticketCount: booking.passengers?.length || 0,
    amount: booking.totalAmount,
  });

  return { success: true, message: 'Thanh toán thành công' };
}

async function recoverPaidWithoutTicket() {
  const stuck = await prisma.booking.findMany({
    where: { status: BOOKING_STATUS.PAID },
    include: { passengers: true },
  });
  for (const b of stuck) {
    console.log(`[recovery] Transitioning PAID -> TICKET_ISSUED for ${b.bookingCode}`);
    try {
      await transitionStatus(b.id, b.status, BOOKING_STATUS.TICKET_ISSUED);
    } catch (err) {
      console.error(err);
    }
  }
}

function startServer() {
  const server = new grpc.Server();
  server.addService(BookingService.service, bookingServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    server.start();
    console.log(`Booking Service gRPC on ${port}`);
    setInterval(() => {
      bookingServiceImpl.ExpirePendingBookings(
        {} as grpc.ServerUnaryCall<unknown, unknown>,
        () => {}
      );
    }, 60000);
    setInterval(() => {
      recoverPaidWithoutTicket().catch(console.error);
    }, 120000);
  });
}

if (require.main === module) {
  bootstrapServiceHealth({
    service: 'booking-service',
    defaultPort: 9105,
    checkDb: async () => {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    },
  });
  startServer();
}

export { bookingServiceImpl, prisma, matchesFilter, matchesSearch, toBookingDetail, findBookingByRef };
