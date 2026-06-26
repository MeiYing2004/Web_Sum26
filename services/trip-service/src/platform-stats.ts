import type { PrismaClient } from './generated/client';
import { todayVN, vnDayBounds } from '@bus/shared';

/** Thống kê chuyến/nhà xe/tỉnh thành cho trang chủ — dữ liệu thật từ DB */
export async function getPlatformTripStats(prisma: PrismaClient) {
  const { start, end } = vnDayBounds(todayVN());

  const [tripsToday, operatorCount, routes, locations] = await Promise.all([
    prisma.trip.count({
      where: {
        departureTime: { gte: start, lte: end },
      },
    }),
    prisma.operator.count(),
    prisma.route.findMany({ select: { origin: true, destination: true } }),
    prisma.location.findMany({ select: { name: true } }),
  ]);

  const provinces = new Set<string>();
  for (const r of routes) {
    provinces.add(r.origin);
    provinces.add(r.destination);
  }
  for (const l of locations) {
    provinces.add(l.name);
  }

  return {
    trips_today: tripsToday,
    operator_count: operatorCount,
    province_count: provinces.size,
  };
}
