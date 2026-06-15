import amqp from 'amqplib';
import { RABBITMQ_QUEUES } from './constants';
import { withRetry } from './retry';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

export async function getRabbitChannel(url: string): Promise<amqp.Channel> {
  if (!channel) {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertExchange('bus.events', 'topic', { durable: true });
    await channel.assertQueue(RABBITMQ_QUEUES.BOOKING_PAID, { durable: true });
    await channel.assertQueue(RABBITMQ_QUEUES.TICKET_GENERATE, { durable: true });
    await channel.assertQueue(RABBITMQ_QUEUES.EMAIL_SEND, { durable: true });
    await channel.bindQueue(RABBITMQ_QUEUES.TICKET_GENERATE, 'bus.events', 'booking.paid');
    await channel.bindQueue(RABBITMQ_QUEUES.EMAIL_SEND, 'bus.events', 'booking.paid');
  }
  return channel;
}

export async function publishBookingPaid(url: string, payload: Record<string, unknown>) {
  await withRetry(
    async () => {
      const ch = await getRabbitChannel(url);
      ch.publish('bus.events', 'booking.paid', Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        contentType: 'application/json',
      });
    },
    { maxAttempts: 3, delayMs: 500, label: 'rabbitmq:booking.paid' }
  );
}

export async function consumeQueue(
  url: string,
  queue: string,
  handler: (data: Record<string, unknown>) => Promise<void>
) {
  const ch = await getRabbitChannel(url);
  await ch.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      ch.ack(msg);
    } catch (err) {
      console.error(`RabbitMQ consumer error [${queue}]:`, err);
      ch.nack(msg, false, false);
    }
  });
}

export { RABBITMQ_QUEUES };
