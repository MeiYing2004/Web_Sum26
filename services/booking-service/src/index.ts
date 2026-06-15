import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { BookingService, SeatInventoryService, PaymentService } from '@bus/proto';
import {
  canTransition,
  publishBookingEvent,
  publishPaymentEvent,
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
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://bus:bus123@localhost:5672';

function seatClient() {
  return new SeatInventoryService(
    SEAT_SERVICE_URL,
    grpc.credentials.createInsecure()
  );
}

function paymentClient() {
  return new PaymentService(PAYMENT_SERVICE_URL, grpc.credentials.createInsecure());
}

function generateBookingCode() {
  return `BK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
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
    route_name: '',
    origin: '',
    destination: '',
    departure_time: '',
    total_amount: b.totalAmount,
    passengers: ((b.passengers as Array<{ fullName: string; phone: string; email: string; idNumber?: string; seatId: string }>) || []).map((p) => ({
      full_name: p.fullName,
      phone: p.phone,
      email: p.email,
      id_number: p.idNumber,
      seat_id: p.seatId,
    })),
    user_id: b.userId,
    created_at: b.createdAt.toISOString(),
  };
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

      const booking = await prisma.booking.create({
        data: {
          bookingCode: generateBookingCode(),
          tripId: req.trip_id,
          userId: req.user_id,
          guestEmail: req.guest_email,
          holdToken: req.hold_token,
          status: BOOKING_STATUS.PENDING_PAYMENT,
          totalAmount,
          paymentDeadline: new Date(Date.now() + 15 * 60 * 1000),
          passengers: {
            create: req.passengers.map((p) => ({
              fullName: p.full_name,
              phone: p.phone,
              email: p.email,
              idNumber: p.id_number,
              seatId: p.seat_id,
            })),
          },
          statusLogs: {
            create: [{ fromStatus: BOOKING_STATUS.DRAFT, toStatus: BOOKING_STATUS.PENDING_PAYMENT }],
          },
        },
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
      const b = await prisma.booking.findUnique({
        where: { id: call.request.booking_id },
        include: { passengers: true },
      });
      if (!b) return callback({ code: grpc.status.NOT_FOUND, message: 'Not found' } as grpc.ServiceError, null);
      callback(null, toBookingDetail(b));
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetBookingByCode: async (
    call: grpc.ServerUnaryCall<{ booking_code: string; email: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const emailNorm = call.request.email.trim().toLowerCase();
      const b = await prisma.booking.findFirst({
        where: {
          bookingCode: call.request.booking_code,
          OR: [
            { guestEmail: { equals: emailNorm, mode: 'insensitive' } },
            { passengers: { some: { email: { equals: emailNorm, mode: 'insensitive' } } } },
          ],
        },
        include: { passengers: true },
      });
      if (!b) return callback({ code: grpc.status.NOT_FOUND, message: 'Mã booking và email không khớp' } as grpc.ServiceError, null);
      callback(null, toBookingDetail(b));
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  CancelBooking: async (
    call: grpc.ServerUnaryCall<{ booking_id: string; user_id?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const b = await prisma.booking.findUnique({ where: { id: call.request.booking_id } });
      if (!b) return callback(null, { success: false, message: 'Not found' });
      if (b.status !== BOOKING_STATUS.PAID && b.status !== BOOKING_STATUS.TICKET_ISSUED) {
        return callback(null, { success: false, message: 'Không thể hủy ở trạng thái hiện tại' });
      }
      await transitionStatus(b.id, b.status, BOOKING_STATUS.CANCELLED);
      await publishBookingEvent(KAFKA_BROKERS, 'booking.cancelled', { bookingId: b.id });
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
      const b = await prisma.booking.findUnique({ where: { bookingCode: call.request.booking_code } });
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
    call: grpc.ServerUnaryCall<{ user_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId: call.request.user_id },
        include: { passengers: true },
        orderBy: { createdAt: 'desc' },
      });
      callback(null, { bookings: bookings.map((b) => toBookingDetail(b)) });
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

  await publishBookingPaid(RABBITMQ_URL, {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    tripId: booking.tripId,
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
    console.log(`[recovery] Re-publishing booking.paid for ${b.bookingCode}`);
    await publishBookingPaid(RABBITMQ_URL, {
      bookingId: b.id,
      bookingCode: b.bookingCode,
      tripId: b.tripId,
      guestEmail: b.guestEmail,
      passengers: b.passengers,
      totalAmount: b.totalAmount,
    });
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

export { bookingServiceImpl, prisma };
