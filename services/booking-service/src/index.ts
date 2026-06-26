import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from './generated/client';
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
  computeBookingPricing,
  formatDateVN,
  normalizePhoneDigits,
  sanitizeOptionalEmail,
} from '@bus/shared';
import {
  submitReview,
  getReviewByBooking,
  listUserReviews,
  listTripReviews,
  listFeaturedReviews,
  getTripRatingSummary,
  getReviewSatisfactionStats,
  getOperatorReviewSummaries,
} from './reviews';
import { ensureVoucherSeed } from './seed-vouchers';
import {
  applyVoucherToBookingRecord,
  listAvailableVouchersForBooking,
  redeemVoucherForBooking,
  validateVoucherForBooking,
  voucherFieldsForDetail,
} from './vouchers';

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

/** Admin UI shows multi-seat refs as BOOKINGCODE-SEAT (e.g. TKMQUFLYG2J7DI-A06). */
function splitCompositeTicketRef(ref: string): { bookingRef: string; seatId?: string } {
  const trimmed = ref.trim();
  const lastDash = trimmed.lastIndexOf('-');
  if (lastDash > 0) {
    const suffix = trimmed.slice(lastDash + 1);
    if (/^[A-Z]{1,2}\d{1,2}$/i.test(suffix)) {
      return { bookingRef: trimmed.slice(0, lastDash), seatId: suffix.toUpperCase() };
    }
  }
  return { bookingRef: trimmed };
}

function bookingLookupCodes(ref: string): string[] {
  const trimmed = ref.trim();
  if (!trimmed) return [];

  const { bookingRef } = splitCompositeTicketRef(trimmed);
  const codes = [trimmed, bookingRef, normalizeCode(trimmed), normalizeCode(bookingRef)];
  return [...new Set(codes.filter(Boolean))];
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
  pricePerSeat: number;
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
      pricePerSeat: Number(t.price) || 0,
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
      pricePerSeat: 0,
    };
  }
}

async function validateHoldForBooking(tripId: string, holdToken: string, seatIds: string[]) {
  const res = await promisify<{ valid: boolean; message: string }>((cb) =>
    seatClient().ValidateHold({ trip_id: tripId, hold_token: holdToken, seat_ids: seatIds }, cb)
  );
  if (!res.valid) {
    throw new Error(res.message || 'Mã giữ ghế không hợp lệ');
  }
}

function assertPaymentAccess(
  booking: {
    userId: string | null;
    guestEmail: string;
    passengers?: Array<{ phone: string; email: string }>;
  },
  userId?: string,
  guestEmail?: string,
  guestPhone?: string
) {
  const ownerId = booking.userId?.trim() || '';
  const storedEmail = booking.guestEmail?.trim().toLowerCase() || '';

  if (userId) {
    if (ownerId) {
      if (ownerId !== userId) {
        throw new Error('Forbidden — bạn không có quyền thanh toán đặt vé này');
      }
      return;
    }
    if (storedEmail) {
      if (!guestEmail?.trim()) {
        throw new Error('Forbidden — cần email xác minh cho đơn khách vãng lai');
      }
      const emailNorm = guestEmail.trim().toLowerCase();
      if (storedEmail !== emailNorm) {
        throw new Error('Forbidden — email không khớp với đơn đặt vé');
      }
      return;
    }
    assertGuestPhoneAccess(booking, guestPhone);
    return;
  }

  if (storedEmail) {
    if (!guestEmail?.trim()) {
      throw new Error('Unauthorized — vui lòng cung cấp email đặt vé');
    }
    const emailNorm = guestEmail.trim().toLowerCase();
    if (storedEmail !== emailNorm) {
      throw new Error('Forbidden — email không khớp với đơn đặt vé');
    }
    return;
  }

  assertGuestPhoneAccess(booking, guestPhone);
}

function assertGuestPhoneAccess(
  booking: { passengers?: Array<{ phone: string }> },
  guestPhone?: string
) {
  if (!guestPhone?.trim()) {
    throw new Error('Unauthorized — vui lòng cung cấp số điện thoại đặt vé');
  }
  const phoneNorm = normalizePhoneDigits(guestPhone);
  const passengers = booking.passengers || [];
  if (!passengers.some((p) => normalizePhoneDigits(p.phone) === phoneNorm)) {
    throw new Error('Forbidden — số điện thoại không khớp với đơn đặt vé');
  }
}

function verifyBookingLookup(
  b: { guestEmail: string; passengers: Array<{ phone: string; email: string }> },
  email?: string,
  phone?: string
) {
  const emailNorm = email?.trim().toLowerCase();
  const phoneNorm = phone ? normalizePhoneDigits(phone) : '';

  if (emailNorm) {
    const guestMatch = b.guestEmail.toLowerCase() === emailNorm;
    const passengerMatch = b.passengers.some((p) => p.email.toLowerCase() === emailNorm);
    if (!guestMatch && !passengerMatch) {
      throw new Error('Mã vé và email không khớp');
    }
    return;
  }

  if (phoneNorm) {
    const phoneMatch = b.passengers.some((p) => normalizePhoneDigits(p.phone) === phoneNorm);
    if (!phoneMatch) {
      throw new Error('Mã vé và số điện thoại không khớp');
    }
    return;
  }

  if (b.guestEmail.trim()) {
    throw new Error('Vui lòng cung cấp email hoặc số điện thoại để tra cứu vé');
  }

  throw new Error('Vui lòng cung cấp số điện thoại để tra cứu vé');
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

async function findBookingForCheckIn(ref: string) {
  const { bookingRef } = splitCompositeTicketRef(ref);
  const code = normalizeCode(bookingRef);
  const byId = await prisma.booking.findUnique({
    where: { id: bookingRef },
    include: { passengers: true, voucher: true },
  });
  if (byId) return byId;

  return prisma.booking.findFirst({
    where: { bookingCode: { equals: code, mode: 'insensitive' } },
    include: { passengers: true, voucher: true },
  });
}

async function resolveBookingByRef(ref: string) {
  const trimmed = ref.trim();
  if (!trimmed) return null;

  for (const lookup of bookingLookupCodes(trimmed)) {
    const booking = await findBookingForCheckIn(lookup);
    if (booking) return booking;
  }

  for (const lookup of bookingLookupCodes(trimmed)) {
    try {
      const ticket = await promisify<{ booking_id?: string }>((cb) =>
        ticketClient().GetTicketByCode({ ticket_code: lookup }, cb)
      );
      if (ticket?.booking_id) {
        const booking = await prisma.booking.findUnique({
          where: { id: ticket.booking_id },
          include: { passengers: true, voucher: true },
        });
        if (booking) return booking;
      }
    } catch {
      /* not a ticket code */
    }
  }

  return null;
}

type BookingForCheckIn = NonNullable<Awaited<ReturnType<typeof findBookingForCheckIn>>> & {
  voucher?: { name: string } | null;
};

function evaluateCheckInEligibility(b: BookingForCheckIn) {
  if (b.status === BOOKING_STATUS.CHECKED_IN || b.status === BOOKING_STATUS.COMPLETED) {
    return { canCheckIn: false, invalidReason: 'already_checked_in' };
  }
  if (b.status === BOOKING_STATUS.CANCELLED) {
    const wasPaid = b.paymentStatus === 'SUCCESS' || b.paymentStatus === 'PAID';
    return { canCheckIn: false, invalidReason: wasPaid ? 'refunded' : 'cancelled' };
  }
  if (b.status === BOOKING_STATUS.EXPIRED) {
    return { canCheckIn: false, invalidReason: 'expired' };
  }
  if (b.status !== BOOKING_STATUS.TICKET_ISSUED && b.status !== BOOKING_STATUS.PAID) {
    return { canCheckIn: false, invalidReason: 'not_ready' };
  }
  return { canCheckIn: true, invalidReason: '' };
}

async function buildPrepareCheckInResponse(b: BookingForCheckIn) {
  if (needsTripEnrichment(b)) {
    const enriched = await enrichBookingFromTrip(b);
    const refreshed = await prisma.booking.findUnique({
      where: { id: enriched.id },
      include: { passengers: true, voucher: true },
    });
    if (refreshed) b = refreshed;
  }

  const { canCheckIn, invalidReason } = evaluateCheckInEligibility(b);
  const pricing = voucherFieldsForDetail(b);
  const firstPassenger = b.passengers[0];

  let ticketCode = '';
  try {
    const tickets = await promisify<{ tickets?: Array<{ ticket_code?: string }> }>((cb) =>
      ticketClient().ListByBooking({ booking_id: b.id }, cb)
    );
    ticketCode = tickets.tickets?.[0]?.ticket_code ?? '';
  } catch {
    ticketCode = b.passengers.length === 1 ? b.bookingCode : '';
  }

  return {
    found: true,
    can_check_in: canCheckIn,
    invalid_reason: invalidReason,
    ticket_code: ticketCode,
    booking_code: b.bookingCode,
    status: b.status,
    buyer_name: firstPassenger?.fullName ?? '',
    buyer_phone: firstPassenger?.phone ?? '',
    buyer_email: firstPassenger?.email || b.guestEmail,
    passengers: b.passengers.map((p) => ({
      full_name: p.fullName,
      seat_id: p.seatId,
    })),
    seat_count: b.passengers.length,
    route_name: b.routeName,
    operator_name: b.operatorName,
    bus_plate: b.busPlate,
    departure_time: b.departureTime,
    pickup_point: b.pickupPoint,
    dropoff_point: b.dropoffPoint,
    ticket_subtotal: pricing.ticket_subtotal,
    service_fee: pricing.service_fee,
    voucher_code: pricing.voucher_code,
    voucher_name: b.voucher?.name ?? '',
    discount_amount: pricing.discount_amount,
    final_amount: pricing.final_amount,
    checked_in_at: b.checkedInAt?.toISOString() ?? '',
    checked_in_by_user_id: b.checkedInByUserId ?? '',
  };
}

async function transitionStatus(bookingId: string, from: string, to: string, extra?: { checkedInAt?: Date; checkedInByUserId?: string }) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} -> ${to}`);
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: to,
      ...(extra?.checkedInAt ? { checkedInAt: extra.checkedInAt } : {}),
      ...(extra?.checkedInByUserId ? { checkedInByUserId: extra.checkedInByUserId } : {}),
    },
  });
  await prisma.statusLog.create({
    data: { bookingId, fromStatus: from, toStatus: to },
  });
}

function toValidateVoucherResponse(result: {
  valid: boolean;
  message: string;
  discountAmount: number;
  ticketSubtotal: number;
  serviceFee: number;
  finalAmount: number;
  voucherCode?: string;
  voucherName?: string;
}) {
  return {
    valid: result.valid,
    message: result.message,
    discount_amount: result.discountAmount,
    ticket_subtotal: result.ticketSubtotal,
    service_fee: result.serviceFee,
    final_amount: result.finalAmount,
    voucher_code: result.voucherCode ?? '',
    voucher_name: result.voucherName ?? '',
  };
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
    ...voucherFieldsForDetail(b as Parameters<typeof voucherFieldsForDetail>[0]),
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
      const holdToken = String(req.hold_token ?? '').trim();
      if (!holdToken) {
        return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'Thiếu mã giữ ghế' } as grpc.ServiceError, null);
      }

      const reused = await prisma.booking.findFirst({
        where: {
          holdToken,
          status: { notIn: [BOOKING_STATUS.EXPIRED, BOOKING_STATUS.CANCELLED] },
        },
        include: { passengers: true },
      });
      if (reused) {
        const reusedSeatIds = reused.passengers.map((p) => p.seatId).sort().join(',');
        const requestedSeatIds = [...seatIds].sort().join(',');
        if (reused.tripId !== req.trip_id || reusedSeatIds !== requestedSeatIds) {
          return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Mã giữ ghế đã được sử dụng' } as grpc.ServiceError, null);
        }
        if (reused.status === BOOKING_STATUS.PENDING_PAYMENT) {
          const deadline = reused.paymentDeadline
            ? Math.max(0, Math.floor((reused.paymentDeadline.getTime() - Date.now()) / 1000))
            : 0;
          return callback(null, {
            booking_id: reused.id,
            booking_code: reused.bookingCode,
            status: reused.status,
            total_amount: reused.totalAmount,
            payment_deadline_seconds: deadline,
          });
        }
        return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Đơn đặt vé này đã được xử lý' } as grpc.ServiceError, null);
      }

      await validateHoldForBooking(req.trip_id, holdToken, seatIds);

      const trip = await fetchTripMeta(req.trip_id);
      if (trip.pricePerSeat <= 0) {
        return callback({ code: grpc.status.FAILED_PRECONDITION, message: 'Không xác định được giá vé chuyến' } as grpc.ServiceError, null);
      }
      const pricing = computeBookingPricing(seatIds.length, trip.pricePerSeat);
      let guestEmail = '';
      try {
        guestEmail = sanitizeOptionalEmail(req.guest_email);
      } catch (err) {
        return callback(
          { code: grpc.status.INVALID_ARGUMENT, message: (err as Error).message } as grpc.ServiceError,
          null
        );
      }

      const booking = await prisma.booking.create({
        data: {
          bookingCode: generateBookingCode(),
          tripId: req.trip_id,
          userId: req.user_id,
          guestEmail,
          holdToken: holdToken,
          status: BOOKING_STATUS.PENDING_PAYMENT,
          paymentStatus: 'PENDING',
          ticketSubtotal: pricing.ticketTotal,
          serviceFee: pricing.serviceFee,
          discountAmount: 0,
          totalAmount: pricing.grandTotal,
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
              email: sanitizeOptionalEmail(p.email),
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
        totalAmount: pricing.grandTotal,
      });

      callback(null, {
        booking_id: booking.id,
        booking_code: booking.bookingCode,
        status: BOOKING_STATUS.PENDING_PAYMENT,
        total_amount: pricing.grandTotal,
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
    call: grpc.ServerUnaryCall<{ booking_code: string; email?: string; phone?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const code = normalizeCode(call.request.booking_code);
      const emailNorm = call.request.email?.trim().toLowerCase();
      const phoneNorm = call.request.phone ? normalizePhoneDigits(call.request.phone) : '';

      let b = await prisma.booking.findFirst({
        where: { bookingCode: { equals: code, mode: 'insensitive' } },
        include: { passengers: true },
      });

      if (!b) {
        console.log('[LOOKUP BOOKING]', { bookingId: code, email: emailNorm, phone: phoneNorm, recordCount: 0 });
        return callback({ code: grpc.status.NOT_FOUND, message: 'Không tìm thấy vé' } as grpc.ServiceError, null);
      }

      if (needsTripEnrichment(b)) {
        b = await enrichBookingFromTrip(b);
      }

      try {
        verifyBookingLookup(b, emailNorm, phoneNorm);
      } catch (err) {
        console.log('[LOOKUP BOOKING]', { bookingId: b.id, email: emailNorm, phone: phoneNorm, recordCount: 0 });
        return callback({ code: grpc.status.NOT_FOUND, message: (err as Error).message } as grpc.ServiceError, null);
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
          seatClient_.UnbookSeats({ trip_id: b.tripId, seat_ids: seatIds }, (err: Error | null, res: { success: boolean; message?: string } | null) => {
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
      const code = normalizeCode(splitCompositeTicketRef(call.request.booking_code).bookingRef);
      const b = await prisma.booking.findFirst({
        where: { bookingCode: { equals: code, mode: 'insensitive' } },
      });
      if (!b) return callback(null, { success: false, message: 'Booking không tồn tại' });
      if (b.status === BOOKING_STATUS.CHECKED_IN || b.status === BOOKING_STATUS.COMPLETED) {
        return callback(null, { success: false, message: 'Vé đã được check-in' });
      }
      if (b.status === BOOKING_STATUS.CANCELLED) {
        return callback(null, { success: false, message: 'Vé đã bị hủy' });
      }
      if (b.status !== BOOKING_STATUS.TICKET_ISSUED && b.status !== BOOKING_STATUS.PAID) {
        return callback(null, { success: false, message: 'Booking chưa sẵn sàng check-in' });
      }
      const staffId = call.request.staff_id?.trim() || 'staff';
      await transitionStatus(b.id, b.status, BOOKING_STATUS.CHECKED_IN, {
        checkedInAt: new Date(),
        checkedInByUserId: staffId,
      });
      await publishBookingEvent(KAFKA_BROKERS, 'booking.checked_in', {
        bookingId: b.id,
        staffId,
      });
      logEvent(logger, 'check-in', {
        requestId: getGrpcRequestId(call),
        bookingCode: call.request.booking_code,
        staffId,
      });
      callback(null, { success: true, message: 'Check-in thành công' });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  PrepareCheckIn: async (
    call: grpc.ServerUnaryCall<{ ref: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const ref = call.request.ref?.trim();
      if (!ref) {
        return callback(null, {
          found: false,
          can_check_in: false,
          invalid_reason: 'empty_ref',
        });
      }

      const booking = await resolveBookingByRef(ref);
      if (!booking) {
        return callback(null, {
          found: false,
          can_check_in: false,
          invalid_reason: 'not_found',
        });
      }

      callback(null, await buildPrepareCheckInResponse(booking));
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

      const bookings = await prisma.booking.findMany({
        where: { userId },
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
      const dailyMap = new Map<string, { revenue: number; bookingCount: number }>();
      let totalRevenue = 0;

      const routeMap = new Map<string, { count: number; revenue: number }>();
      const operatorMap = new Map<string, { count: number; revenue: number }>();
      const customerMap = new Map<string, { count: number; revenue: number; name: string }>();

      for (const b of paidBookings) {
        const amount = Math.round(b.totalAmount);
        totalRevenue += amount;
        const dayKey = formatDateVN(b.createdAt);
        const day = dailyMap.get(dayKey) || { revenue: 0, bookingCount: 0 };
        day.revenue += amount;
        day.bookingCount += b.passengers.length || 1;
        dailyMap.set(dayKey, day);

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
          ticket_code: b.passengers.length === 1 ? b.bookingCode : `${b.bookingCode}-${p.seatId}`,
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
        total_revenue: totalRevenue,
        daily_revenue: Array.from(dailyMap.entries())
          .map(([date, v]) => ({
            date,
            revenue: v.revenue,
            booking_count: v.bookingCount,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
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
    call: grpc.ServerUnaryCall<
      {
        booking_id: string;
        simulate_success: boolean;
        user_id?: string;
        guest_email?: string;
        guest_phone?: string;
        voucher_code?: string;
      },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const result = await processPayment(
        call.request.booking_id,
        {
          userId: call.request.user_id,
          guestEmail: call.request.guest_email,
          guestPhone: call.request.guest_phone,
          voucherCode: call.request.voucher_code,
        },
        `pay:${call.request.booking_id}`
      );
      callback(null, result);
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ValidateVoucher: async (
    call: grpc.ServerUnaryCall<
      { booking_id: string; code: string; user_id?: string; guest_email?: string },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: call.request.booking_id },
        include: { passengers: true },
      });
      if (!booking) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Booking not found' } as grpc.ServiceError, null);
      }
      try {
        assertPaymentAccess(booking, call.request.user_id, call.request.guest_email);
      } catch (err) {
        return callback({ code: grpc.status.PERMISSION_DENIED, message: err instanceof Error ? err.message : 'Forbidden' } as grpc.ServiceError, null);
      }

      const result = await validateVoucherForBooking(
        prisma,
        booking,
        call.request.code,
        call.request.user_id
      );

      callback(null, toValidateVoucherResponse(result));
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListAvailableVouchers: async (
    call: grpc.ServerUnaryCall<{ booking_id: string; user_id?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: call.request.booking_id },
        include: { passengers: true },
      });
      if (!booking) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Booking not found' } as grpc.ServiceError, null);
      }
      const vouchers = await listAvailableVouchersForBooking(prisma, booking, call.request.user_id);
      callback(null, { vouchers });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ApplyVoucher: async (
    call: grpc.ServerUnaryCall<
      { booking_id: string; code: string; user_id?: string; guest_email?: string },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: call.request.booking_id },
        include: { passengers: true },
      });
      if (!booking) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Booking not found' } as grpc.ServiceError, null);
      }
      assertPaymentAccess(booking, call.request.user_id, call.request.guest_email);
      const result = await applyVoucherToBookingRecord(
        prisma,
        call.request.booking_id,
        call.request.code,
        call.request.user_id
      );
      callback(null, toValidateVoucherResponse(result));
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

  SubmitReview: async (
    call: grpc.ServerUnaryCall<
      { booking_id: string; user_id: string; reviewer_name?: string; rating: number; comment: string },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { booking_id, user_id, reviewer_name, rating, comment } = call.request;
      const result = await submitReview(prisma, {
        bookingId: booking_id,
        userId: user_id,
        reviewerName: reviewer_name,
        rating,
        comment,
      });
      callback(null, result);
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetReviewByBooking: async (
    call: grpc.ServerUnaryCall<{ booking_id: string; user_id?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const review = await getReviewByBooking(prisma, call.request.booking_id, call.request.user_id);
      callback(null, review || {});
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListUserReviews: async (
    call: grpc.ServerUnaryCall<{ user_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const reviews = await listUserReviews(prisma, call.request.user_id);
      callback(null, { reviews });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListTripReviews: async (
    call: grpc.ServerUnaryCall<{ trip_id: string; limit?: number }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const reviews = await listTripReviews(prisma, call.request.trip_id, call.request.limit || 20);
      callback(null, { reviews });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListFeaturedReviews: async (
    call: grpc.ServerUnaryCall<{ limit?: number }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const reviews = await listFeaturedReviews(prisma, call.request.limit || 6);
      callback(null, { reviews });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetTripRatingSummary: async (
    call: grpc.ServerUnaryCall<{ trip_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const summary = await getTripRatingSummary(prisma, call.request.trip_id);
      callback(null, summary);
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetReviewSatisfactionStats: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const stats = await getReviewSatisfactionStats(prisma);
      callback(null, stats);
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetOperatorReviewSummaries: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const summaries = await getOperatorReviewSummaries(prisma);
      callback(null, { summaries });
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
  auth: { userId?: string; guestEmail?: string; guestPhone?: string; voucherCode?: string },
  idempotencyKey?: string
): Promise<{ success: boolean; message: string }> {
  let booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { passengers: true },
  });
  if (!booking) return { success: false, message: 'Booking not found' };

  try {
    assertPaymentAccess(booking, auth.userId, auth.guestEmail, auth.guestPhone);
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Forbidden' };
  }

  if (booking.status === BOOKING_STATUS.PAID || booking.status === BOOKING_STATUS.TICKET_ISSUED) {
    return { success: true, message: 'Booking đã thanh toán (idempotent)' };
  }
  if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
    return { success: false, message: 'Booking không ở trạng thái chờ thanh toán' };
  }

  if (booking.voucherCode) {
    const voucherCheck = await validateVoucherForBooking(
      prisma,
      booking,
      booking.voucherCode,
      auth.userId
    );
    if (!voucherCheck.valid) {
      return { success: false, message: voucherCheck.message };
    }
    if (voucherCheck.finalAmount !== booking.totalAmount) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          discountAmount: voucherCheck.discountAmount,
          totalAmount: voucherCheck.finalAmount,
        },
      });
      booking.totalAmount = voucherCheck.finalAmount;
    }
  } else if (auth.voucherCode?.trim()) {
    const applied = await applyVoucherToBookingRecord(prisma, bookingId, auth.voucherCode, auth.userId);
    if (!applied.valid) {
      return { success: false, message: applied.message };
    }
    booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { passengers: true },
    });
    if (!booking) return { success: false, message: 'Booking not found' };
  }

  const activeBooking = booking;
  const seatIds = activeBooking.passengers.map((p) => p.seatId);
  const seatClient_ = seatClient();
  const confirmResult = await new Promise<{ success: boolean; message: string }>((resolve, reject) => {
    seatClient_.ConfirmSeats(
      {
        trip_id: activeBooking.tripId,
        seat_ids: seatIds,
        hold_token: activeBooking.holdToken || '',
        booking_id: bookingId,
      },
      (err: Error | null, res: { success: boolean; message?: string } | null) => {
        if (err) reject(err);
        else resolve({ success: !!res?.success, message: res?.message || 'Xác nhận ghế thất bại' });
      }
    );
  });

  if (!confirmResult.success) {
    return { success: false, message: confirmResult.message };
  }

  const allowSimulate = process.env.ALLOW_SIMULATE_PAYMENT === 'true';
  if (!allowSimulate) {
    return { success: false, message: 'Cổng thanh toán chưa được cấu hình' };
  }

  const payClient = paymentClient();
  const paymentResult = await new Promise<{ success: boolean; status: string; payment_id: string; message: string }>(
    (resolve, reject) => {
      payClient.ProcessPayment(
        {
          booking_id: bookingId,
          booking_code: activeBooking.bookingCode,
          amount: activeBooking.totalAmount,
          simulate_success: true,
          idempotency_key: idempotencyKey || `pay:${bookingId}`,
        },
        (err: Error | null, res: { success: boolean; status: string; payment_id: string; message: string }) =>
          err ? reject(err) : resolve(res)
      );
    }
  );

  if (!paymentResult.success) {
    await new Promise<void>((resolve, reject) => {
      seatClient_.UnbookSeats({ trip_id: activeBooking.tripId, seat_ids: seatIds }, (err: Error | null, res: { success: boolean } | null) =>
        err ? reject(err) : resolve()
      );
    });
    return { success: false, message: paymentResult.message };
  }

  await transitionStatus(bookingId, BOOKING_STATUS.PENDING_PAYMENT, BOOKING_STATUS.PAID);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'PAID' },
  });

  await redeemVoucherForBooking(prisma, bookingId);

  await transitionStatus(bookingId, BOOKING_STATUS.PAID, BOOKING_STATUS.TICKET_ISSUED);

  booking = (await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { passengers: true },
  }))!;

  if (needsTripEnrichment(booking)) {
    const enriched = await enrichBookingFromTrip(booking);
    Object.assign(booking, enriched);
  }

  await publishBookingPaid(RABBITMQ_URL, {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    tripId: booking.tripId,
    userId: booking.userId,
    ...(booking.guestEmail.trim() ? { guestEmail: booking.guestEmail } : {}),
    passengers: booking.passengers,
    totalAmount: booking.totalAmount,
    ticketSubtotal: booking.ticketSubtotal,
    serviceFee: booking.serviceFee,
    discountAmount: booking.discountAmount,
    voucherCode: booking.voucherCode,
    voucherId: booking.voucherId,
    finalAmount: booking.totalAmount,
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
      await ensureVoucherSeed(prisma);
      return true;
    },
  });
  void ensureVoucherSeed(prisma)
    .then(() => startServer())
    .catch((err) => {
      console.error('Voucher seed failed:', err);
      startServer();
    });
}

export { bookingServiceImpl, prisma, matchesFilter, matchesSearch, toBookingDetail, findBookingByRef };
