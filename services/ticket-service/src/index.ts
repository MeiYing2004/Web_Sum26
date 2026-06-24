import * as grpc from '@grpc/grpc-js';
import { PrismaClient, type Ticket } from '@prisma/client';
import { TicketService, TripService, BookingService } from '@bus/proto';
import {
  consumeQueue,
  RABBITMQ_QUEUES,
  createRedisClient,
  markProcessed,
  isProcessed,
  bootstrapServiceHealth,
  BOOKING_STATUS,
} from '@bus/shared';

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://bus:bus123@localhost:5672';
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'localhost:50055';
const TRIP_URL = process.env.TRIP_SERVICE_URL || 'localhost:50053';
const GRPC_PORT = process.env.GRPC_PORT || '50057';
const redis = createRedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

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

function bookingClient() {
  return new BookingService(BOOKING_URL, grpc.credentials.createInsecure());
}

function tripClient() {
  return new TripService(TRIP_URL, grpc.credentials.createInsecure());
}

function promisify<T>(fn: (cb: (err: Error | null, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, res) => (err ? reject(err) : resolve(res))));
}

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

function formatDepartureVN(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  } catch {
    return iso;
  }
}

function toTicketDetail(t: Ticket) {
  return {
    id: t.id,
    ticket_code: t.ticketCode,
    booking_id: t.bookingId,
    booking_code: t.bookingCode,
    trip_id: t.tripId,
    passenger_name: t.passengerName,
    passenger_phone: t.passengerPhone,
    passenger_email: t.passengerEmail,
    seat_id: t.seatId,
    route_name: t.routeName,
    origin: t.origin,
    destination: t.destination,
    operator_name: t.operatorName,
    pickup_point: t.pickupPoint,
    dropoff_point: t.dropoffPoint,
    departure_time: t.departureTime,
    bus_plate: t.busPlate,
    total_amount: t.totalAmount,
    payment_status: t.paymentStatus,
    booking_status: t.bookingStatus,
    qr_code: t.qrCode,
    created_at: t.createdAt.toISOString(),
  };
}

function generateTicketHtml(data: {
  bookingCode: string;
  ticketCode: string;
  passengerName: string;
  passengerPhone: string;
  routeName: string;
  origin: string;
  destination: string;
  operatorName: string;
  pickupPoint: string;
  dropoffPoint: string;
  departureTime: string;
  seatId: string;
  busPlate: string;
  totalAmount: number;
  qrCode: string;
}) {
  const dep = formatDepartureVN(data.departureTime);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Vé ${data.ticketCode}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:640px;margin:24px auto;padding:24px;border:2px solid #4f46e5;border-radius:16px}
h1{color:#4f46e5;font-size:1.25rem;margin:0 0 16px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
.label{color:#64748b}.val{font-weight:600;color:#0f172a;text-align:right}
.qr{margin-top:20px;padding:16px;background:#f8fafc;border-radius:12px;text-align:center;font-family:monospace;word-break:break-all}
</style></head><body>
<h1>Cappy Bus — Vé điện tử</h1>
<div class="row"><span class="label">Mã vé</span><span class="val">${data.ticketCode}</span></div>
<div class="row"><span class="label">Mã booking</span><span class="val">${data.bookingCode}</span></div>
<div class="row"><span class="label">Hành khách</span><span class="val">${data.passengerName}</span></div>
<div class="row"><span class="label">SĐT</span><span class="val">${data.passengerPhone}</span></div>
<div class="row"><span class="label">Tuyến</span><span class="val">${data.routeName}</span></div>
<div class="row"><span class="label">Điểm đi</span><span class="val">${data.origin || data.pickupPoint}</span></div>
<div class="row"><span class="label">Điểm đến</span><span class="val">${data.destination || data.dropoffPoint}</span></div>
<div class="row"><span class="label">Nhà xe</span><span class="val">${data.operatorName}</span></div>
<div class="row"><span class="label">Biển số</span><span class="val">${data.busPlate || '—'}</span></div>
<div class="row"><span class="label">Khởi hành</span><span class="val">${dep}</span></div>
<div class="row"><span class="label">Ghế</span><span class="val">${data.seatId}</span></div>
<div class="row"><span class="label">Tổng tiền</span><span class="val">${data.totalAmount.toLocaleString('vi-VN')}đ</span></div>
<div class="qr">QR: ${data.qrCode}</div>
<p style="margin-top:16px;font-size:12px;color:#64748b">Xuất trình mã vé hoặc QR khi lên xe. Có mặt trước giờ khởi hành 30 phút.</p>
</body></html>`;
}

function generateTicketCode() {
  return `TK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

function matchesFilter(t: Ticket, filter?: string): boolean {
  if (!filter || filter === 'ALL') return true;
  const dep = new Date(t.departureTime).getTime();
  const now = Date.now();
  const cancelled = t.bookingStatus === BOOKING_STATUS.CANCELLED || t.bookingStatus === BOOKING_STATUS.EXPIRED;
  switch (filter.toUpperCase()) {
    case 'UPCOMING':
      return !cancelled && dep >= now;
    case 'COMPLETED':
      return cancelled || dep < now || t.bookingStatus === BOOKING_STATUS.CHECKED_IN || t.bookingStatus === BOOKING_STATUS.COMPLETED;
    case 'CANCELLED':
      return cancelled;
    default:
      return true;
  }
}

function matchesSearch(t: Ticket, q: string): boolean {
  if (!q.trim()) return true;
  const norm = q.trim().toLowerCase();
  return (
    t.bookingCode.toLowerCase().includes(norm) ||
    t.ticketCode.toLowerCase().includes(norm) ||
    t.passengerPhone.includes(norm) ||
    t.passengerEmail.toLowerCase().includes(norm) ||
    t.passengerName.toLowerCase().includes(norm)
  );
}

async function handleBookingPaid(data: Record<string, unknown>) {
  const bookingId = data.bookingId as string;
  const idemKey = `ticket:${bookingId}`;

  if (await isProcessed(redis, idemKey)) {
    console.log(`[ticket] Skip duplicate booking.paid for ${bookingId}`);
    return;
  }

  const existing = await prisma.ticket.count({ where: { bookingId } });
  if (existing > 0) {
    await markProcessed(redis, idemKey);
    return;
  }

  const passengers =
    (data.passengers as Array<{ fullName?: string; full_name?: string; phone: string; email: string; seatId?: string; seat_id?: string }>) || [];
  const bookingCode = data.bookingCode as string;
  const tripId = data.tripId as string;
  const totalAmount = Number(data.totalAmount ?? 0);
  const userId = (data.userId as string) || null;
  const trip = await fetchTripMeta(tripId);
  const perSeatAmount = passengers.length > 0 ? totalAmount / passengers.length : totalAmount;

  for (const p of passengers) {
    const fullName = p.fullName ?? p.full_name ?? '';
    const seatId = p.seatId ?? p.seat_id ?? '';
    const ticketCode = generateTicketCode();
    const qrCode = JSON.stringify({
      bookingCode,
      ticketCode,
      passenger: fullName,
      seat: seatId,
      departure: trip.departureTime,
    });

    const html = generateTicketHtml({
      bookingCode,
      ticketCode,
      passengerName: fullName,
      passengerPhone: p.phone,
      routeName: trip.routeName,
      origin: trip.origin,
      destination: trip.destination,
      operatorName: trip.operatorName,
      pickupPoint: trip.pickupPoint,
      dropoffPoint: trip.dropoffPoint,
      departureTime: trip.departureTime,
      seatId,
      busPlate: trip.busPlate,
      totalAmount: perSeatAmount,
      qrCode,
    });

    await prisma.ticket.create({
      data: {
        ticketCode,
        bookingId,
        bookingCode,
        tripId,
        userId,
        passengerName: fullName,
        passengerPhone: p.phone,
        passengerEmail: p.email,
        seatId,
        routeName: trip.routeName,
        origin: trip.origin,
        destination: trip.destination,
        operatorName: trip.operatorName,
        pickupPoint: trip.pickupPoint,
        dropoffPoint: trip.dropoffPoint,
        departureTime: trip.departureTime,
        busPlate: trip.busPlate,
        totalAmount: perSeatAmount,
        paymentStatus: 'PAID',
        bookingStatus: BOOKING_STATUS.TICKET_ISSUED,
        qrCode,
        htmlContent: html,
      },
    });
    console.log(`Ticket generated: ${ticketCode} for ${fullName}`);
  }

  await markProcessed(redis, idemKey);

  await promisify<void>((cb) =>
    bookingClient().MarkTicketIssued({ booking_id: bookingId }, (err: Error | null) => (err ? cb(err, undefined as never) : cb(null, undefined as never)))
  );
}

const ticketServiceImpl = {
  ListByBooking: async (call: grpc.ServerUnaryCall<{ booking_id: string }, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const tickets = await prisma.ticket.findMany({
        where: { bookingId: call.request.booking_id },
        orderBy: { createdAt: 'asc' },
      });
      callback(null, { tickets: tickets.map(toTicketDetail) });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  ListForUser: async (
    call: grpc.ServerUnaryCall<{ user_id: string; search?: string; filter?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      let tickets = await prisma.ticket.findMany({
        where: { userId: call.request.user_id },
        orderBy: { createdAt: 'desc' },
      });
      if (call.request.search) {
        tickets = tickets.filter((t) => matchesSearch(t, call.request.search!));
      }
      if (call.request.filter) {
        tickets = tickets.filter((t) => matchesFilter(t, call.request.filter));
      }
      callback(null, { tickets: tickets.map(toTicketDetail) });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  Search: async (
    call: grpc.ServerUnaryCall<{ query?: string; email?: string; filter?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const email = call.request.email?.trim().toLowerCase();
      const q = call.request.query?.trim() ?? '';
      const where = email
        ? {
            AND: [
              { passengerEmail: { equals: email, mode: 'insensitive' as const } },
              ...(q
                ? [
                    {
                      OR: [
                        { bookingCode: { contains: q, mode: 'insensitive' as const } },
                        { ticketCode: { contains: q, mode: 'insensitive' as const } },
                        { passengerPhone: { contains: q } },
                        { passengerName: { contains: q, mode: 'insensitive' as const } },
                      ],
                    },
                  ]
                : []),
            ],
          }
        : q
          ? {
              OR: [
                { bookingCode: { contains: q, mode: 'insensitive' as const } },
                { ticketCode: { contains: q, mode: 'insensitive' as const } },
                { passengerPhone: { contains: q } },
                { passengerEmail: { contains: q, mode: 'insensitive' as const } },
                { passengerName: { contains: q, mode: 'insensitive' as const } },
              ],
            }
          : undefined;

      let tickets = await prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      if (call.request.filter) {
        tickets = tickets.filter((t) => matchesFilter(t, call.request.filter));
      }
      callback(null, { tickets: tickets.map(toTicketDetail) });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetTicket: async (call: grpc.ServerUnaryCall<{ ticket_id: string }, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const t = await prisma.ticket.findUnique({ where: { id: call.request.ticket_id } });
      if (!t) return callback({ code: grpc.status.NOT_FOUND, message: 'Ticket not found' } as grpc.ServiceError, null);
      callback(null, toTicketDetail(t));
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  CancelByBooking: async (
    call: grpc.ServerUnaryCall<{ booking_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const result = await prisma.ticket.updateMany({
        where: { bookingId: call.request.booking_id },
        data: { bookingStatus: BOOKING_STATUS.CANCELLED },
      });
      callback(null, { updated_count: result.count });
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
      const ticketsSold = await prisma.ticket.count();

      const [routeGroups, operatorGroups, customerGroups, recentTickets] = await Promise.all([
        prisma.ticket.groupBy({
          by: ['routeName'],
          _count: { id: true },
          _sum: { totalAmount: true },
          orderBy: { _count: { id: 'desc' } },
          take: topLimit,
        }),
        prisma.ticket.groupBy({
          by: ['operatorName'],
          _count: { id: true },
          _sum: { totalAmount: true },
          orderBy: { _count: { id: 'desc' } },
          take: topLimit,
        }),
        prisma.ticket.groupBy({
          by: ['passengerEmail'],
          _count: { id: true },
          _sum: { totalAmount: true },
          orderBy: { _count: { id: 'desc' } },
          take: topLimit,
        }),
        prisma.ticket.findMany({
          orderBy: { createdAt: 'desc' },
          take: ordersLimit,
        }),
      ]);

      const customerEmails = customerGroups.map((g) => g.passengerEmail).filter(Boolean);
      const nameByEmail = new Map<string, string>();
      if (customerEmails.length > 0) {
        const nameRows = await prisma.ticket.findMany({
          where: { passengerEmail: { in: customerEmails } },
          select: { passengerEmail: true, passengerName: true },
          orderBy: { createdAt: 'desc' },
        });
        for (const row of nameRows) {
          if (!nameByEmail.has(row.passengerEmail)) {
            nameByEmail.set(row.passengerEmail, row.passengerName);
          }
        }
      }

      callback(null, {
        tickets_sold: ticketsSold,
        top_routes: routeGroups.map((g) => ({
          name: g.routeName,
          subtitle: '',
          count: g._count.id,
          revenue: g._sum.totalAmount || 0,
        })),
        top_operators: operatorGroups
          .filter((g) => g.operatorName)
          .map((g) => ({
            name: g.operatorName,
            subtitle: '',
            count: g._count.id,
            revenue: g._sum.totalAmount || 0,
          })),
        top_customers: customerGroups
          .filter((g) => g.passengerEmail)
          .map((g) => ({
            name: nameByEmail.get(g.passengerEmail) || g.passengerEmail.split('@')[0],
            subtitle: g.passengerEmail,
            count: g._count.id,
            revenue: g._sum.totalAmount || 0,
          })),
        recent_orders: recentTickets.map((t) => ({
          ticket_code: t.ticketCode,
          booking_code: t.bookingCode,
          customer_name: t.passengerName,
          route_name: t.routeName,
          origin: t.origin,
          destination: t.destination,
          seat_id: t.seatId,
          total_amount: t.totalAmount,
          status: t.bookingStatus,
          created_at: t.createdAt.toISOString(),
        })),
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },
};

async function startGrpc() {
  const server = new grpc.Server();
  server.addService(TicketService.service, ticketServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  await new Promise<void>((resolve, reject) => {
    server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err) => {
      if (err) reject(err);
      else {
        server.start();
        console.log(`Ticket Service gRPC on ${port}`);
        resolve();
      }
    });
  });
}

async function main() {
  bootstrapServiceHealth({
    service: 'ticket-service',
    defaultPort: 9107,
    checkDb: async () => {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    },
    checkRabbitmq: async () => {
      const amqp = await import('amqplib');
      const conn = await amqp.connect(RABBITMQ_URL);
      await conn.close();
      return true;
    },
  });

  await startGrpc();
  console.log('Ticket Worker starting...');
  await consumeQueue(RABBITMQ_URL, RABBITMQ_QUEUES.TICKET_GENERATE, handleBookingPaid);
  console.log('Ticket Worker listening on booking.paid');
}

main().catch(console.error);

export { ticketServiceImpl, handleBookingPaid, toTicketDetail };
