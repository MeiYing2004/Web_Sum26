import type { PrismaClient } from './generated/client';
import { TRIP_STATUS } from '@bus/shared';

/** Điểm đến nổi bật — metadata hiển thị; số tuyến & giá lấy từ DB */
export const FEATURED_DESTINATION_META = [
  {
    city: 'Đà Lạt',
    slug: 'dalat',
    tagline: 'Hồ Xuân Hương & đồi thông LangBiang',
  },
  {
    city: 'Nha Trang',
    slug: 'nhatrang',
    tagline: 'Bãi biển & quảng trường biển',
  },
  {
    city: 'Đà Nẵng',
    slug: 'danang',
    tagline: 'Cầu Rồng, Cầu Vàng & biển Mỹ Khê',
  },
  {
    city: 'Hà Nội',
    slug: 'hanoi',
    tagline: 'Hồ Gươm, Văn Miếu & phố cổ',
  },
  {
    city: 'Cần Thơ',
    slug: 'cantho',
    tagline: 'Chợ nổi Cái Răng & Bến Ninh Kiều',
  },
  {
    city: 'TP.HCM',
    slug: 'hcm',
    tagline: 'Nhà thờ Đức Bà & phố đi bộ Nguyễn Huệ',
  },
] as const;

/** Danh sách điểm đến nổi bật — route_count & price_from từ database */
export async function listFeaturedDestinations(prisma: PrismaClient) {
  const [routes, trips] = await Promise.all([
    prisma.route.findMany({ select: { destination: true } }),
    prisma.trip.findMany({
      where: {
        status: TRIP_STATUS.ACTIVE,
        departureTime: { gte: new Date() },
      },
      select: { price: true, route: { select: { destination: true } } },
    }),
  ]);

  const routeCountByDest = new Map<string, number>();
  for (const route of routes) {
    routeCountByDest.set(route.destination, (routeCountByDest.get(route.destination) ?? 0) + 1);
  }

  const minPriceByDest = new Map<string, number>();
  for (const trip of trips) {
    const dest = trip.route.destination;
    const current = minPriceByDest.get(dest);
    if (current == null || trip.price < current) {
      minPriceByDest.set(dest, trip.price);
    }
  }

  return FEATURED_DESTINATION_META.map((meta) => ({
    city: meta.city,
    slug: meta.slug,
    tagline: meta.tagline,
    route_count: routeCountByDest.get(meta.city) ?? 0,
    price_from: minPriceByDest.get(meta.city) ?? undefined,
  }));
}
