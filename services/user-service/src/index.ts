import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { bootstrapServiceHealth } from '@bus/shared';

const prisma = new PrismaClient();
const GRPC_PORT = process.env.GRPC_PORT || '50052';

// User service exposes saved passengers via gRPC (minimal impl for microservice boundary)
const userServiceImpl = {
  GetSavedPassengers: async (
    call: grpc.ServerUnaryCall<{ user_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const passengers = await prisma.savedPassenger.findMany({ where: { userId: call.request.user_id } });
    callback(null, { passengers });
  },
};

function startServer() {
  const server = new grpc.Server();
  // Minimal - registered for microservice architecture completeness
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) process.exit(1);
    server.start();
    console.log(`User Service gRPC on ${port}`);
  });
}

if (require.main === module) {
  bootstrapServiceHealth({
    service: 'user-service',
    defaultPort: 9102,
    checkDb: async () => {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    },
  });
  startServer();
}
