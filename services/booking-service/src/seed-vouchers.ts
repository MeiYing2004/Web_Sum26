import type { PrismaClient } from './generated/client';

const DEFAULT_VOUCHERS = [
  {
    code: 'CAPPY15',
    name: 'Giảm 15% chuyến đầu',
    description: 'Áp dụng cho khách hàng mới đặt vé lần đầu trên Cappy Bus.',
    discountType: 'PERCENT',
    discountValue: 15,
    maxDiscount: 120_000,
    minOrderValue: 200_000,
    startDate: new Date('2026-01-01T00:00:00+07:00'),
    endDate: new Date('2026-12-31T23:59:59+07:00'),
    usageLimit: null,
    usagePerUser: 1,
    applicableRoutes: '[]',
    applicableBusCompanies: '[]',
    applicableTripTypes: '[]',
    requiresNewUser: true,
    isActive: true,
  },
  {
    code: 'ROUND10',
    name: 'Combo khứ hồi',
    description: 'Giảm thêm khi đặt vé chiều đi và chiều về trong cùng một đơn.',
    discountType: 'PERCENT',
    discountValue: 10,
    maxDiscount: 180_000,
    minOrderValue: 0,
    startDate: new Date('2026-01-01T00:00:00+07:00'),
    endDate: new Date('2027-01-15T23:59:59+07:00'),
    usageLimit: null,
    usagePerUser: null,
    applicableRoutes: '[]',
    applicableBusCompanies: '[]',
    applicableTripTypes: '["ROUND_TRIP"]',
    requiresNewUser: false,
    isActive: true,
  },
  {
    code: 'WEEKEND',
    name: 'Ưu đãi cuối tuần',
    description: 'Hàng trăm chuyến từ Thứ 6 đến Chủ nhật có giá ưu đãi riêng.',
    discountType: 'FIXED',
    discountValue: 80_000,
    maxDiscount: 80_000,
    minOrderValue: 150_000,
    startDate: new Date('2026-01-01T00:00:00+07:00'),
    endDate: new Date('2026-12-31T23:59:59+07:00'),
    usageLimit: null,
    usagePerUser: null,
    applicableRoutes: '["Đà Lạt","Nha Trang","Vũng Tàu"]',
    applicableBusCompanies: '[]',
    applicableTripTypes: '[]',
    requiresNewUser: false,
    isActive: true,
  },
] as const;

export async function ensureVoucherSeed(prisma: PrismaClient, maxAttempts = 20) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      for (const v of DEFAULT_VOUCHERS) {
        await prisma.voucher.upsert({
          where: { code: v.code },
          create: { ...v },
          update: {
            name: v.name,
            description: v.description,
            discountType: v.discountType,
            discountValue: v.discountValue,
            maxDiscount: v.maxDiscount,
            minOrderValue: v.minOrderValue,
            startDate: v.startDate,
            endDate: v.endDate,
            usageLimit: v.usageLimit,
            usagePerUser: v.usagePerUser,
            applicableRoutes: v.applicableRoutes,
            applicableBusCompanies: v.applicableBusCompanies,
            applicableTripTypes: v.applicableTripTypes,
            requiresNewUser: v.requiresNewUser,
            isActive: v.isActive,
          },
        });
      }
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const retryable =
        msg.includes("Can't reach database") ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('Connection terminated');
      if (!retryable || attempt === maxAttempts) throw err;
      console.warn(`Voucher seed: DB chưa sẵn sàng (${attempt}/${maxAttempts}), thử lại sau 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
