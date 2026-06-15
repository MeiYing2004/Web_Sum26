import { consumeQueue, RABBITMQ_QUEUES, bootstrapServiceHealth } from '@bus/shared';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://bus:bus123@localhost:5672';

async function checkRabbit() {
  const amqp = await import('amqplib');
  const conn = await amqp.connect(RABBITMQ_URL);
  await conn.close();
  return true;
}

async function handleEmailSend(data: Record<string, unknown>) {
  const email = data.guestEmail as string;
  const bookingCode = data.bookingCode as string;
  console.log('='.repeat(60));
  console.log('[EMAIL MOCK]');
  console.log(`To: ${email}`);
  console.log(`Subject: Xác nhận đặt vé - ${bookingCode}`);
  console.log(`Nội dung: Cảm ơn bạn đã đặt vé. Mã booking: ${bookingCode}`);
  console.log('='.repeat(60));
}

async function main() {
  bootstrapServiceHealth({
    service: 'notification-service',
    defaultPort: 9108,
    checkRabbitmq: checkRabbit,
  });
  console.log('Notification Worker starting...');
  await consumeQueue(RABBITMQ_URL, RABBITMQ_QUEUES.EMAIL_SEND, handleEmailSend);
  console.log('Email Worker listening on booking.paid');
}

main().catch(console.error);
