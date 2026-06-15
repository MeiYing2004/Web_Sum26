import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from './constants';
import { withRetry } from './retry';

let producer: Producer | null = null;

export function createKafkaClient(brokers: string[]) {
  return new Kafka({
    clientId: 'bus-booking',
    brokers,
    retry: { retries: 5 },
  });
}

export async function getKafkaProducer(brokers: string[]): Promise<Producer> {
  if (!producer) {
    const kafka = createKafkaClient(brokers);
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

export async function publishEvent(
  brokers: string[],
  topic: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  await withRetry(
    async () => {
      const p = await getKafkaProducer(brokers);
      await p.send({
        topic,
        messages: [
          {
            key: eventType,
            value: JSON.stringify({
              eventType,
              timestamp: new Date().toISOString(),
              ...payload,
            }),
          },
        ],
      });
    },
    { maxAttempts: 3, delayMs: 500, label: `kafka:${topic}` }
  );
}

export interface SearchEventPayload {
  keyword?: string;
  origin: string;
  destination: string;
  travelDate: string;
  resultCount: number;
  userId?: string | null;
}

export async function publishSearchEvent(brokers: string[], data: SearchEventPayload) {
  await publishEvent(brokers, KAFKA_TOPICS.SEARCH_EVENTS, 'search.performed', {
    keyword: data.keyword ?? `${data.origin}-${data.destination}`,
    origin: data.origin,
    destination: data.destination,
    travelDate: data.travelDate,
    resultCount: data.resultCount,
    userId: data.userId ?? null,
    timestamp: new Date().toISOString(),
  });
}

export async function publishBookingEvent(
  brokers: string[],
  eventType: string,
  data: Record<string, unknown>
) {
  await publishEvent(brokers, KAFKA_TOPICS.BOOKING_EVENTS, eventType, data);
}

export async function publishPaymentEvent(
  brokers: string[],
  eventType: string,
  data: Record<string, unknown>
) {
  await publishEvent(brokers, KAFKA_TOPICS.PAYMENT_EVENTS, eventType, data);
}

export async function createKafkaConsumer(
  brokers: string[],
  groupId: string,
  topics: string[],
  handler: (payload: EachMessagePayload) => Promise<void>
) {
  const kafka = createKafkaClient(brokers);
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }
  await consumer.run({
    eachMessage: async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`Kafka handler error [${payload.topic}]:`, err);
      }
    },
  });
  return consumer;
}

export { KAFKA_TOPICS };
