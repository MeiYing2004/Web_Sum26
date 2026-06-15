import { PrismaClient } from '@prisma/client';
import * as grpc from '@grpc/grpc-js';
import { consumeQueue, RABBITMQ_QUEUES, createRedisClient, markProcessed, isProcessed, bootstrapServiceHealth } from '@bus/shared';
import { BookingService } from '@bus/proto';

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://bus:bus123@localhost:5672';
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'localhost:50055';
const redis = createRedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

function bookingClient() {
  return new BookingService(BOOKING_URL, grpc.credentials.createInsecure());
}

function generateTicketHtml(data: {
  bookingCode: string;
  ticketId: string;
  passengerName: string;
  routeName: string;
  pickupPoint: string;
  dropoffPoint: string;
  departureTime: string;
  seatId: string;
  busPlate: string;
  qrCode: string;
}) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Vé ${data.ticketId}</title>
<style>body{font-family:Arial;max-width:600px;margin:40px auto;padding:20px;border:2px solid #1a56db}
h1{color:#1a56db}.qr{background:#f3f4f6;padding:16px;text-align:center;font-family:monospace}</style>
</head><body>
<h1>Vé Xe Khách Điện Tử</h1>
<p><strong>Mã booking:</strong> ${data.bookingCode}</p>
<p><strong>Mã vé:</strong> ${data.ticketId}</p>
<p><strong>Hành khách:</strong> ${data.passengerName}</p>
<p><strong>Tuyến:</strong> ${data.routeName}</p>
<p><strong>Điểm đón:</strong> ${data.pickupPoint}</p>
<p><strong>Điểm trả:</strong> ${data.dropoffPoint}</p>
<p><strong>Khởi hành:</strong> ${data.departureTime}</p>
<p><strong>Ghế:</strong> ${data.seatId}</p>
<p><strong>Biển số xe:</strong> ${data.busPlate}</p>
<div class="qr">QR: ${data.qrCode}</div>
<p><em>Chính sách check-in: Có mặt trước giờ khởi hành 30 phút, xuất trình mã vé hoặc QR.</em></p>
</body></html>`;
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

  const passengers = (data.passengers as Array<{ fullName: string; seatId: string }>) || [];
  const bookingCode = data.bookingCode as string;

  for (const p of passengers) {
    const ticketId = `TK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
    const qrCode = `${bookingCode}-${ticketId}`;
    const html = generateTicketHtml({
      bookingCode,
      ticketId,
      passengerName: p.fullName,
      routeName: 'Tuyến xe',
      pickupPoint: 'Bến xe',
      dropoffPoint: 'Điểm đến',
      departureTime: new Date().toISOString(),
      seatId: p.seatId,
      busPlate: '51B-12345',
      qrCode,
    });

    await prisma.ticket.create({
      data: {
        bookingId,
        bookingCode,
        passengerName: p.fullName,
        seatId: p.seatId,
        routeName: 'Tuyến xe',
        pickupPoint: 'Bến xe',
        dropoffPoint: 'Điểm đến',
        departureTime: new Date().toISOString(),
        busPlate: '51B-12345',
        qrCode,
        htmlContent: html,
      },
    });
    console.log(`Ticket generated: ${ticketId} for ${p.fullName}`);
  }

  await markProcessed(redis, idemKey);

  const client = bookingClient();
  await new Promise<void>((resolve, reject) => {
    client.MarkTicketIssued({ booking_id: bookingId }, (err: Error | null) =>
      err ? reject(err) : resolve()
    );
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
  console.log('Ticket Worker starting...');
  await consumeQueue(RABBITMQ_URL, RABBITMQ_QUEUES.TICKET_GENERATE, handleBookingPaid);
  console.log('Ticket Worker listening on booking.paid');
}

main().catch(console.error);
