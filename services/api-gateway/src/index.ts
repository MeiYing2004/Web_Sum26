import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import {
  requestIdMiddleware,
  createLogger,
  logEvent,
  buildHealthResponse,
  createRedisClient,
} from '@bus/shared';
import { createContext, resolvers } from './resolvers';
import { getAggregatedHealth } from './health-routes';

const PORT = process.env.PORT || 4000;
const logger = createLogger('api-gateway');
const redis = createRedisClient(process.env.REDIS_URL || 'redis://localhost:6379');

async function main() {
  const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
  const serverCleanup = useServer({ schema }, wsServer);

  const apollo = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apollo.start();

  app.use(requestIdMiddleware());

  app.get('/health/self', async (_req, res) => {
    const body = await buildHealthResponse({
      service: 'api-gateway',
      checkRedis: async () => {
        return (await redis.ping()) === 'PONG';
      },
    });
    res.status(body.status === 'error' ? 503 : 200).json(body);
  });

  app.get('/health', async (_req, res) => {
    const body = await getAggregatedHealth();
    res.status(body.status === 'ok' ? 200 : 503).json(body);
  });

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => {
        const requestId = (req as unknown as { requestId?: string }).requestId || 'unknown';
        const ctx = await createContext(
          req.headers.authorization,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0',
          requestId
        );
        logEvent(logger, 'graphql.request', {
          requestId,
          userId: ctx.user?.userId,
          operation: req.body?.operationName,
        });
        return ctx;
      },
    }) as unknown as express.RequestHandler
  );

  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(
        { port: PORT },
        `Port ${PORT} đã được sử dụng. Chạy: npm run dev:gateway (tự giải phóng port) hoặc docker compose stop api-gateway`
      );
      process.exit(1);
    }
    throw err;
  });

  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ action: 'server.shutdown', signal }, 'Shutting down API Gateway');
    try {
      await serverCleanup.dispose();
      await apollo.stop();
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve()));
      });
      await redis.quit();
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'API Gateway shutdown failed');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(
        { port: PORT, err },
        `Port ${PORT} is already in use. Stop the Docker api-gateway container or another process using this port.`
      );
    } else {
      logger.error({ err }, 'HTTP server failed to start');
    }
    process.exit(1);
  });

  httpServer.listen(PORT, () => {
    logger.info({ action: 'server.start', port: PORT }, 'API Gateway started');
  });
}

main().catch((err) => {
  logger.error({ err }, 'API Gateway failed to start');
  process.exit(1);
});
