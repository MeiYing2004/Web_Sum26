import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '@bus/proto';
import { createKafkaConsumer, KAFKA_TOPICS, bootstrapServiceHealth } from '@bus/shared';

const prisma = new PrismaClient();
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const GRPC_PORT = process.env.GRPC_PORT || '50059';

async function startKafkaConsumer() {
  await createKafkaConsumer(
    KAFKA_BROKERS,
    'analytics-consumer',
    [KAFKA_TOPICS.SEARCH_EVENTS, KAFKA_TOPICS.BOOKING_EVENTS, KAFKA_TOPICS.PAYMENT_EVENTS],
    async ({ topic, message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());

      if (topic === KAFKA_TOPICS.SEARCH_EVENTS) {
        await prisma.searchEvent.create({
          data: {
            keyword: event.keyword,
            origin: event.origin,
            destination: event.destination,
            travelDate: event.travelDate,
            resultCount: event.resultCount,
            userId: event.userId,
          },
        });
        await prisma.routeSearchStat.upsert({
          where: {
            origin_destination: { origin: event.origin, destination: event.destination },
          },
          update: { searchCount: { increment: 1 } },
          create: {
            origin: event.origin,
            destination: event.destination,
            searchCount: 1,
          },
        });
      }

      if (topic === KAFKA_TOPICS.BOOKING_EVENTS) {
        await prisma.bookingEvent.create({
          data: {
            eventType: event.eventType,
            bookingId: event.bookingId,
            tripId: event.tripId,
            amount: event.amount,
          },
        });

        if (event.eventType === 'booking.paid') {
          const routeName = String(event.routeName || 'Khác');
          const ticketCount = Number(event.ticketCount) || 1;
          const amount = Number(event.amount) || 0;
          const existing = await prisma.routeTicketStat.findFirst({ where: { routeName } });
          if (existing) {
            await prisma.routeTicketStat.update({
              where: { id: existing.id },
              data: {
                ticketsSold: { increment: ticketCount },
                revenue: { increment: amount },
              },
            });
          } else {
            await prisma.routeTicketStat.create({
              data: { routeName, ticketsSold: ticketCount, revenue: amount },
            });
          }
        }
      }

      if (topic === KAFKA_TOPICS.PAYMENT_EVENTS && event.eventType === 'payment.success') {
        await prisma.paymentEvent.create({
          data: {
            eventType: event.eventType,
            bookingId: event.bookingId,
            amount: event.amount,
          },
        });
        const date = new Date().toISOString().split('T')[0];
        await prisma.dailyRevenue.upsert({
          where: { date },
          update: {
            revenue: { increment: event.amount || 0 },
            bookingCount: { increment: 1 },
          },
          create: {
            date,
            revenue: event.amount || 0,
            bookingCount: 1,
          },
        });
      }
    }
  );
  console.log('Analytics Kafka consumer started');
}

const analyticsServiceImpl = {
  GetRevenueSummary: async (
    call: grpc.ServerUnaryCall<{ from_date?: string; to_date?: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const where: { date?: { gte?: string; lte?: string } } = {};
    if (call.request.from_date || call.request.to_date) {
      where.date = {};
      if (call.request.from_date) where.date.gte = call.request.from_date;
      if (call.request.to_date) where.date.lte = call.request.to_date;
    }
    const daily = await prisma.dailyRevenue.findMany({ where, orderBy: { date: 'asc' } });
    const total = daily.reduce((s, d) => s + d.revenue, 0);
    callback(null, {
      daily: daily.map((d) => ({ date: d.date, revenue: d.revenue, booking_count: d.bookingCount })),
      total_revenue: total,
    });
  },

  GetPopularRoutes: async (
    call: grpc.ServerUnaryCall<{ limit: number }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const routes = await prisma.routeSearchStat.findMany({
      orderBy: { searchCount: 'desc' },
      take: call.request.limit || 10,
    });
    callback(null, {
      routes: routes.map((r) => ({
        origin: r.origin,
        destination: r.destination,
        search_count: r.searchCount,
      })),
    });
  },

  GetConversionRate: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    const totalSearches = await prisma.searchEvent.count();
    const totalBookings = await prisma.bookingEvent.count({
      where: { eventType: 'booking.paid' },
    });
    callback(null, {
      total_searches: totalSearches,
      total_bookings: totalBookings,
      conversion_rate: totalSearches > 0 ? totalBookings / totalSearches : 0,
    });
  },

  GetTicketsSoldByRoute: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    const routes = await prisma.routeTicketStat.findMany();
    callback(null, {
      routes: routes.map((r) => ({
        route_name: r.routeName,
        tickets_sold: r.ticketsSold,
        revenue: r.revenue,
      })),
    });
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(AnalyticsService.service, analyticsServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) process.exit(1);
    server.start();
    console.log(`Analytics Service gRPC on ${port}`);
  });
}

async function main() {
  await prisma.$connect();
  bootstrapServiceHealth({
    service: 'analytics-service',
    defaultPort: 9109,
    checkDb: async () => {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    },
  });
  await startKafkaConsumer();
  startServer();
}

main().catch(console.error);
