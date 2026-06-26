import * as grpc from '@grpc/grpc-js';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '@bus/proto';
import { publishPaymentEvent, PAYMENT_STATUS, bootstrapServiceHealth, createLogger, logEvent, getGrpcRequestId } from '@bus/shared';

const logger = createLogger('payment-service');

const prisma = new PrismaClient();
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const GRPC_PORT = process.env.GRPC_PORT || '50056';

const paymentServiceImpl = {
  ProcessPayment: async (
    call: grpc.ServerUnaryCall<
      { booking_id: string; booking_code: string; amount: number; simulate_success: boolean; idempotency_key?: string },
      unknown
    >,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const { booking_id, booking_code, amount, idempotency_key } = call.request;
      const idemKey = idempotency_key || `pay:${booking_id}`;

      const existingByIdem = idempotency_key
        ? await prisma.payment.findUnique({ where: { idempotencyKey: idemKey } })
        : null;
      if (existingByIdem?.status === PAYMENT_STATUS.SUCCESS) {
        return callback(null, {
          success: true,
          status: PAYMENT_STATUS.SUCCESS,
          payment_id: existingByIdem.id,
          message: 'Idempotent replay — payment đã xử lý',
        });
      }

      const existing =
        existingByIdem || (await prisma.payment.findUnique({ where: { bookingId: booking_id } }));
      if (existing?.status === PAYMENT_STATUS.SUCCESS) {
        return callback(null, {
          success: true,
          status: PAYMENT_STATUS.SUCCESS,
          payment_id: existing.id,
          message: 'Payment đã thành công trước đó',
        });
      }

      const allowSimulate = process.env.ALLOW_SIMULATE_PAYMENT === 'true';
      // Dev simulate mode: always succeed when enabled (gateway used to send simulate_success=false)
      const effectiveSimulate = allowSimulate;

      if (!allowSimulate) {
        return callback(null, {
          success: false,
          status: PAYMENT_STATUS.FAILED,
          payment_id: '',
          message: 'Cổng thanh toán chưa được cấu hình',
        });
      }

      const finalStatus = effectiveSimulate ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED;

      const payment = existing
        ? await prisma.payment.update({
            where: { bookingId: booking_id },
            data: { status: finalStatus, idempotencyKey: idemKey },
          })
        : await prisma.payment.create({
            data: {
              bookingId: booking_id,
              bookingCode: booking_code,
              amount,
              status: PAYMENT_STATUS.INIT,
              idempotencyKey: idemKey,
            },
          });

      const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: { status: finalStatus },
      });

      await publishPaymentEvent(KAFKA_BROKERS, effectiveSimulate ? 'payment.success' : 'payment.failed', {
        paymentId: updated.id,
        bookingId: booking_id,
        amount,
        idempotencyKey: idemKey,
      });

      if (effectiveSimulate) {
        logEvent(logger, 'payment.success', {
          requestId: getGrpcRequestId(call),
          bookingId: booking_id,
          paymentId: updated.id,
          amount,
        });
      }

      callback(null, {
        success: effectiveSimulate,
        status: finalStatus,
        payment_id: updated.id,
        message: effectiveSimulate ? 'Thanh toán mô phỏng thành công' : 'Thanh toán mô phỏng thất bại',
      });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },

  GetPaymentStatus: async (
    call: grpc.ServerUnaryCall<{ booking_id: string }, unknown>,
    callback: grpc.sendUnaryData<unknown>
  ) => {
    try {
      const p = await prisma.payment.findUnique({ where: { bookingId: call.request.booking_id } });
      callback(null, { status: p?.status || PAYMENT_STATUS.INIT, payment_id: p?.id || '' });
    } catch (err) {
      callback(err as grpc.ServiceError, null);
    }
  },
};

function startServer() {
  const server = new grpc.Server();
  server.addService(PaymentService.service, paymentServiceImpl);
  const port = `0.0.0.0:${GRPC_PORT}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) process.exit(1);
    server.start();
    console.log(`Payment Service gRPC on ${port}`);
  });
}

if (require.main === module) {
  bootstrapServiceHealth({
    service: 'payment-service',
    defaultPort: 9106,
    checkDb: async () => {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    },
  });
  startServer();
}
export { paymentServiceImpl };
