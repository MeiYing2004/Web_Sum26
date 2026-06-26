import type { PrismaClient } from './generated/client';
import { todayVN, vnDayBounds, TRIP_STATUS } from '@bus/shared';

const BADGE_BY_RANK = ['Bán chạy', 'Uy tín', 'Giá tốt', 'Premium'] as const;

/** Danh sách nhà xe nổi bật — dữ liệu thật từ DB, sắp xếp theo số chuyến hôm nay */
export async function listFeaturedOperators(prisma: PrismaClient, limit = 12) {
  const { start, end } = vnDayBounds(todayVN());
  const operators = await prisma.operator.findMany({ orderBy: { name: 'asc' } });

  const rows = await Promise.all(
    operators.map(async (op) => {
      const [tripCountToday, trips] = await Promise.all([
        prisma.trip.count({
          where: {
            operatorId: op.id,
            departureTime: { gte: start, lte: end },
          },
        }),
        prisma.trip.findMany({
          where: {
            operatorId: op.id,
            status: TRIP_STATUS.ACTIVE,
            departureTime: { gte: start },
          },
          include: { route: true },
          orderBy: { departureTime: 'asc' },
          take: 80,
        }),
      ]);

      const routeLabels = [
        ...new Set(trips.map((t) => `${t.route.origin} → ${t.route.destination}`)),
      ].slice(0, 3);

      const priceFrom = trips.length > 0 ? Math.min(...trips.map((t) => t.price)) : null;

      return {
        id: op.id,
        name: op.name,
        trip_count_today: tripCountToday,
        routes: routeLabels,
        price_from: priceFrom,
      };
    })
  );

  rows.sort((a, b) => b.trip_count_today - a.trip_count_today || a.name.localeCompare(b.name, 'vi'));

  return rows.slice(0, Math.max(1, limit)).map((row, i) => ({
    ...row,
    badge: BADGE_BY_RANK[i] ?? 'Đối tác',
  }));
}
