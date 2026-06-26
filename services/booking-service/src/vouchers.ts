import type { PrismaClient, Voucher, Booking } from './generated/client';
import {
  type BookingVoucherContext,
  type VoucherRules,
  type VoucherValidationResult,
  VOUCHER_ERROR,
  formatDiscountLabel,
  validateVoucherRules,
  voucherListsFromDb,
} from '@bus/shared';

type BookingWithPassengers = Booking & { passengers: Array<{ seatId: string }> };

function toVoucherRules(v: Voucher): VoucherRules {
  const lists = voucherListsFromDb(v);
  return {
    code: v.code,
    name: v.name,
    description: v.description,
    discountType: v.discountType as VoucherRules['discountType'],
    discountValue: v.discountValue,
    maxDiscount: v.maxDiscount,
    minOrderValue: v.minOrderValue,
    startDate: v.startDate,
    endDate: v.endDate,
    usageLimit: v.usageLimit,
    usagePerUser: v.usagePerUser,
    ...lists,
    isActive: v.isActive,
    usedCount: v.usedCount,
    requiresNewUser: v.requiresNewUser,
  };
}

export async function countUserVoucherUsage(
  prisma: PrismaClient,
  voucherId: string,
  userId?: string | null,
  guestEmail?: string | null
) {
  if (userId) {
    return prisma.voucherUsage.count({ where: { voucherId, userId } });
  }
  const email = guestEmail?.trim().toLowerCase();
  if (!email) return 0;
  return prisma.voucherUsage.count({ where: { voucherId, guestEmail: email } });
}

export async function countUserPaidBookings(
  prisma: PrismaClient,
  userId?: string | null,
  guestEmail?: string | null
) {
  const paidStatuses = ['PAID', 'TICKET_ISSUED', 'CHECKED_IN', 'COMPLETED'];
  if (userId) {
    return prisma.booking.count({
      where: { userId, status: { in: paidStatuses } },
    });
  }
  const email = guestEmail?.trim().toLowerCase();
  if (!email) return 0;
  return prisma.booking.count({
    where: { guestEmail: email, status: { in: paidStatuses } },
  });
}

export function bookingPricingFields(booking: Booking) {
  const ticketSubtotal =
    booking.ticketSubtotal > 0
      ? Math.round(booking.ticketSubtotal)
      : Math.round(booking.totalAmount / 1.02);
  const serviceFee =
    booking.serviceFee > 0 ? Math.round(booking.serviceFee) : Math.round(booking.totalAmount - ticketSubtotal);
  return { ticketSubtotal, serviceFee };
}

export async function buildVoucherContext(
  prisma: PrismaClient,
  booking: BookingWithPassengers,
  userId?: string | null
): Promise<BookingVoucherContext> {
  const { ticketSubtotal, serviceFee } = bookingPricingFields(booking);
  return {
    ticketSubtotal,
    serviceFee,
    routeName: booking.routeName,
    origin: booking.origin,
    destination: booking.destination,
    operatorName: booking.operatorName,
    tripType: booking.tripType || 'ONE_WAY',
    departureTime: booking.departureTime,
    userId: userId ?? booking.userId,
    guestEmail: booking.guestEmail,
    userUsageCount: 0,
    userPaidBookingCount: await countUserPaidBookings(prisma, userId ?? booking.userId, booking.guestEmail),
  };
}

export async function validateVoucherForBooking(
  prisma: PrismaClient,
  booking: BookingWithPassengers,
  code: string,
  userId?: string | null
): Promise<VoucherValidationResult & { voucherId?: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return {
      valid: false,
      message: VOUCHER_ERROR.NOT_FOUND,
      discountAmount: 0,
      ...bookingPricingFields(booking),
      finalAmount: Math.round(booking.totalAmount),
    };
  }

  const voucher = await prisma.voucher.findFirst({
    where: { code: { equals: normalized, mode: 'insensitive' } },
  });
  if (!voucher) {
    const pricing = bookingPricingFields(booking);
    return {
      valid: false,
      message: VOUCHER_ERROR.NOT_FOUND,
      discountAmount: 0,
      ...pricing,
      finalAmount: pricing.ticketSubtotal + pricing.serviceFee,
    };
  }

  const ctx = await buildVoucherContext(prisma, booking, userId);
  ctx.userUsageCount = await countUserVoucherUsage(prisma, voucher.id, ctx.userId, ctx.guestEmail);

  const result = validateVoucherRules(toVoucherRules(voucher), ctx);
  return { ...result, voucherId: voucher.id };
}

export async function listAvailableVouchersForBooking(
  prisma: PrismaClient,
  booking: BookingWithPassengers,
  userId?: string | null
) {
  const vouchers = await prisma.voucher.findMany({ where: { isActive: true } });
  const ctxBase = await buildVoucherContext(prisma, booking, userId);
  const rows = [];

  for (const v of vouchers) {
    const ctx = {
      ...ctxBase,
      userUsageCount: await countUserVoucherUsage(prisma, v.id, ctxBase.userId, ctxBase.guestEmail),
    };
    const result = validateVoucherRules(toVoucherRules(v), ctx);
    if (!result.valid) continue;
    rows.push({
      code: v.code,
      name: v.name,
      description: v.description,
      discount_label: formatDiscountLabel(toVoucherRules(v)),
      min_order_value: v.minOrderValue,
      max_discount: v.maxDiscount ?? undefined,
      valid_until: v.endDate.toISOString(),
    });
  }

  return rows;
}

export async function applyVoucherToBookingRecord(
  prisma: PrismaClient,
  bookingId: string,
  code: string,
  userId?: string | null
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { passengers: true },
  });
  if (!booking) throw new Error('Booking not found');

  const pricing = bookingPricingFields(booking);
  if (booking.ticketSubtotal <= 0) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ticketSubtotal: pricing.ticketSubtotal,
        serviceFee: pricing.serviceFee,
        totalAmount: pricing.ticketSubtotal + pricing.serviceFee,
      },
    });
    booking.ticketSubtotal = pricing.ticketSubtotal;
    booking.serviceFee = pricing.serviceFee;
    booking.totalAmount = pricing.ticketSubtotal + pricing.serviceFee;
  }

  if (!code.trim()) {
    const baseTotal = pricing.ticketSubtotal + pricing.serviceFee;
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        voucherId: null,
        voucherCode: null,
        discountAmount: 0,
        totalAmount: baseTotal,
      },
    });
    return {
      valid: true,
      message: 'Đã bỏ áp dụng voucher',
      discountAmount: 0,
      ticketSubtotal: pricing.ticketSubtotal,
      serviceFee: pricing.serviceFee,
      finalAmount: baseTotal,
    };
  }

  const validation = await validateVoucherForBooking(prisma, booking, code, userId);
  if (!validation.valid || !validation.voucherId) return validation;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      voucherId: validation.voucherId,
      voucherCode: validation.voucherCode,
      ticketSubtotal: validation.ticketSubtotal,
      serviceFee: validation.serviceFee,
      discountAmount: validation.discountAmount,
      totalAmount: validation.finalAmount,
    },
  });

  return validation;
}

export async function redeemVoucherForBooking(prisma: PrismaClient, bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking?.voucherId || booking.discountAmount <= 0) return;

  const existing = await prisma.voucherUsage.findFirst({ where: { bookingId } });
  if (existing) return;

  await prisma.$transaction([
    prisma.voucherUsage.create({
      data: {
        voucherId: booking.voucherId,
        bookingId: booking.id,
        userId: booking.userId,
        guestEmail: booking.guestEmail,
        discountAmount: booking.discountAmount,
      },
    }),
    prisma.voucher.update({
      where: { id: booking.voucherId },
      data: { usedCount: { increment: 1 } },
    }),
  ]);
}

export function voucherFieldsForDetail(booking: Booking) {
  const { ticketSubtotal, serviceFee } = bookingPricingFields(booking);
  return {
    ticket_subtotal: booking.ticketSubtotal > 0 ? booking.ticketSubtotal : ticketSubtotal,
    service_fee: booking.serviceFee > 0 ? booking.serviceFee : serviceFee,
    discount_amount: booking.discountAmount ?? 0,
    voucher_code: booking.voucherCode ?? '',
    voucher_id: booking.voucherId ?? '',
    final_amount: booking.totalAmount,
  };
}
