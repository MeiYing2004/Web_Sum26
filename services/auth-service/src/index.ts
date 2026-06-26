import * as grpc from '@grpc/grpc-js';
import { PrismaClient, type SavedPassenger } from './generated/client';
import { AuthService } from '@bus/proto';
import { bootstrapServiceHealth, createLogger, normalizeRole, USER_ROLES } from '@bus/shared';
import * as crypto from 'crypto';
import { migrateUsersData, migrateUsersSchemaSql } from './migrate-users';
import { hashPassword, isBcryptHash, verifyPassword } from './password';

const prisma = new PrismaClient();
const logger = createLogger('auth-service');
const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW || JWT_SECRET_RAW.length < 32) {
  console.error('FATAL: JWT_SECRET must be set in environment (minimum 32 characters).');
  process.exit(1);
}
const JWT_SECRET: string = JWT_SECRET_RAW;
const GRPC_PORT = process.env.GRPC_PORT || '50051';

function logAuthConfig() {
  logger.info(
    {
      databaseUrl: process.env.DATABASE_URL ? '(set)' : '(missing)',
      jwtSecret: JWT_SECRET ? '(set)' : '(missing)',
      grpcPort: GRPC_PORT,
    },
    'Auth configuration'
  );
}

function createToken(userId: string, role: string) {
  const normalized = normalizeRole(role);
  const payload = Buffer.from(
    JSON.stringify({ userId, role: normalized, exp: Date.now() + 86400000 })
  ).toString('base64');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string) {
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  if (sig !== expected) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64').toString());
  if (data.exp < Date.now()) return null;
  return {
    userId: data.userId as string,
    role: normalizeRole(data.role as string),
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function upgradePasswordHash(userId: string, password: string, currentHash: string) {
  if (isBcryptHash(currentHash)) return;
  const nextHash = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: nextHash } });
  logger.info({ userId }, 'Upgraded legacy password hash to bcrypt');
}

const authServiceImpl = {
  Login: async (
    call: grpc.ServerUnaryCall<{ email: string; password: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const email = normalizeEmail(call.request.email);
    logger.info({ email }, 'Login attempt');

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        logger.warn({ email, reason: 'user_not_found' }, 'Login failed');
        return callback(
          { code: grpc.status.NOT_FOUND, message: 'Tài khoản không tồn tại' } as grpc.ServiceError,
          null
        );
      }

      const valid = await verifyPassword(call.request.password, user.passwordHash);
      if (!valid) {
        logger.warn({ email, userId: user.id, reason: 'wrong_password' }, 'Login failed');
        return callback(
          { code: grpc.status.UNAUTHENTICATED, message: 'Sai mật khẩu' } as grpc.ServiceError,
          null
        );
      }

      await upgradePasswordHash(user.id, call.request.password, user.passwordHash);

      const role = normalizeRole(user.role);
      logger.info({ email, userId: user.id, role }, 'Login success');
      callback(null, { token: createToken(user.id, role), user_id: user.id, role });
    } catch (err) {
      logger.error({ email, err }, 'Login error');
      callback({ code: grpc.status.INTERNAL, message: 'Lỗi máy chủ' } as grpc.ServiceError, null);
    }
  },

  Register: async (
    call: grpc.ServerUnaryCall<{ email: string; password: string; full_name: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const email = normalizeEmail(call.request.email);
    const fullName = call.request.full_name.trim();
    logger.info({ email, fullName }, 'Register attempt');

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        logger.warn({ email, reason: 'email_exists' }, 'Register failed');
        return callback(
          { code: grpc.status.ALREADY_EXISTS, message: 'Email đã được đăng ký' } as grpc.ServiceError,
          null
        );
      }

      const passwordHash = await hashPassword(call.request.password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: USER_ROLES.CUSTOMER,
        },
      });

      const role = normalizeRole(user.role);
      logger.info({ email, userId: user.id, role }, 'Register success — user saved to database');
      callback(null, { user_id: user.id, token: createToken(user.id, role), role });
    } catch (err) {
      logger.error({ email, err }, 'Register error');
      callback({ code: grpc.status.INTERNAL, message: 'Lỗi máy chủ' } as grpc.ServiceError, null);
    }
  },

  ValidateToken: async (
    call: grpc.ServerUnaryCall<{ token: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const data = verifyToken(call.request.token);
    callback(null, {
      valid: !!data,
      user_id: data?.userId || '',
      role: data?.role || '',
    });
  },

  GetSavedPassengers: async (
    call: grpc.ServerUnaryCall<{ user_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    const passengers = await prisma.savedPassenger.findMany({
      where: { userId: call.request.user_id },
    });
    callback(null, {
      passengers: passengers.map((p: SavedPassenger) => ({
        id: p.id,
        full_name: p.fullName,
        phone: p.phone,
        email: p.email,
        id_number: p.idNumber || '',
      })),
    });
  },

  CountCustomers: async (_call: grpc.ServerUnaryCall<unknown, unknown>, callback: grpc.sendUnaryData<unknown>) => {
    try {
      const count = await prisma.user.count({ where: { role: USER_ROLES.CUSTOMER } });
      callback(null, { count });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },
};

async function seedUsers() {
  if (process.env.SEED_DEMO_ACCOUNTS !== 'true') {
    logger.info('Skipping demo account seed (set SEED_DEMO_ACCOUNTS=true to enable)');
    return;
  }
  await prisma.user.upsert({
    where: { email: 'admin@bus.demo' },
    update: { role: USER_ROLES.ADMIN },
    create: {
      email: 'admin@bus.demo',
      passwordHash: await hashPassword('admin123'),
      fullName: 'System Admin',
      role: USER_ROLES.ADMIN,
    },
  });
  await prisma.user.upsert({
    where: { email: 'employee@bus.demo' },
    update: { role: USER_ROLES.EMPLOYEE },
    create: {
      email: 'employee@bus.demo',
      passwordHash: await hashPassword('employee123'),
      fullName: 'Nhân viên Demo',
      role: USER_ROLES.EMPLOYEE,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@bus.demo' },
    update: {},
    create: {
      email: 'customer@bus.demo',
      passwordHash: await hashPassword('customer123'),
      fullName: 'Khách hàng Demo',
      role: USER_ROLES.CUSTOMER,
    },
  });

  const savedSamples = [
    { fullName: 'Nguyễn Văn An', phone: '0901234567', email: 'customer@bus.demo', idNumber: '079123456789' },
    { fullName: 'Trần Thị Bình', phone: '0912345678', email: 'binh.tran@example.com', idNumber: null },
  ];
  for (const sample of savedSamples) {
    const existing = await prisma.savedPassenger.findFirst({
      where: { userId: customer.id, phone: sample.phone },
    });
    if (existing) continue;
    await prisma.savedPassenger.create({
      data: { userId: customer.id, ...sample },
    });
  }
}

function startServer() {
  const server = new grpc.Server();
  server.addService(AuthService.service, authServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err: Error | null) => {
    if (err) process.exit(1);
    server.start();
    logger.info({ port }, 'Auth Service gRPC started (users table)');
  });
}

async function main() {
  logAuthConfig();
  await migrateUsersSchemaSql(prisma);
  await migrateUsersData(prisma);
  await seedUsers();
  startServer();
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
  main().catch((err) => {
    logger.error({ err }, 'Startup failed');
    process.exit(1);
  });
}

export { authServiceImpl, verifyToken, createToken };
