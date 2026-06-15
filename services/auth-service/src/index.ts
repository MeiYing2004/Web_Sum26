import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@bus/proto';
import { bootstrapServiceHealth } from '@bus/shared';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'bus-booking-jwt-secret';
const GRPC_PORT = process.env.GRPC_PORT || '50051';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

function createToken(userId: string, role: string) {
  const payload = Buffer.from(JSON.stringify({ userId, role, exp: Date.now() + 86400000 })).toString('base64');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string) {
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  if (sig !== expected) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64').toString());
  if (data.exp < Date.now()) return null;
  return data as { userId: string; role: string };
}

const authServiceImpl = {
  Login: async (
    call: grpc.ServerUnaryCall<{ email: string; password: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const user = await prisma.user.findUnique({ where: { email: call.request.email } });
    if (!user || user.passwordHash !== hashPassword(call.request.password)) {
      return callback({ code: grpc.status.UNAUTHENTICATED, message: 'Invalid credentials' } as grpc.ServiceError, null);
    }
    callback(null, { token: createToken(user.id, user.role), user_id: user.id, role: user.role });
  },

  Register: async (
    call: grpc.ServerUnaryCall<{ email: string; password: string; full_name: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const user = await prisma.user.create({
      data: {
        email: call.request.email,
        passwordHash: hashPassword(call.request.password),
        fullName: call.request.full_name,
        role: 'CUSTOMER',
      },
    });
    callback(null, { user_id: user.id, token: createToken(user.id, user.role) });
  },

  ValidateToken: async (
    call: grpc.ServerUnaryCall<{ token: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const data = verifyToken(call.request.token);
    callback(null, { valid: !!data, user_id: data?.userId || '', role: data?.role || '' });
  },
};

async function seedAdmin() {
  await prisma.user.upsert({
    where: { email: 'admin@bus.demo' },
    update: {},
    create: {
      email: 'admin@bus.demo',
      passwordHash: hashPassword('admin123'),
      fullName: 'System Admin',
      role: 'ADMIN',
    },
  });
}

function startServer() {
  const server = new grpc.Server();
  server.addService(AuthService.service, authServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), async (err) => {
    if (err) process.exit(1);
    await seedAdmin();
    server.start();
    console.log(`Auth Service gRPC on ${port}`);
  });
}

if (require.main === module) {
  bootstrapServiceHealth({
    service: 'auth-service',
    defaultPort: 9101,
    checkDb: async () => {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    },
  });
  startServer();
}
export { authServiceImpl, verifyToken, createToken };
