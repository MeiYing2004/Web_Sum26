/** Metadata hiển thị cho từng tuyến — đồng bộ với seed trip-service & marketing */

export type RouteDisplayMeta = {
  image: string;
  imageAlt: string;
  distanceKm: number;
  operator: string;
  rating: number;
};

function routeKey(origin: string, destination: string): string {
  return `${origin}__${destination}`;
}

/**
 * Dữ liệu tĩnh theo tuyến (ảnh, quãng đường, nhà xe, đánh giá).
 * Giá vé, số chuyến và thời gian lấy từ API routeCatalog.
 */
export const ROUTE_DISPLAY_META: Record<string, RouteDisplayMeta> = {
  [routeKey('TP.HCM', 'Cần Thơ')]: {
    image: '/images/routes/hcm-cantho.jpg',
    imageAlt: 'Chợ nổi Cái Răng, Cần Thơ',
    distanceKm: 169,
    operator: 'Thành Bưởi',
    rating: 4.9,
  },
  [routeKey('TP.HCM', 'Đà Lạt')]: {
    image: '/images/routes/hcm-dalat.jpg',
    imageAlt: 'Hồ Xuân Hương, Đà Lạt',
    distanceKm: 308,
    operator: 'Phương Trang',
    rating: 4.8,
  },
  [routeKey('TP.HCM', 'Nha Trang')]: {
    image: '/images/routes/hcm-nhatrang.jpg',
    imageAlt: 'Biển Nha Trang và Hòn Chồng',
    distanceKm: 448,
    operator: 'Phương Trang',
    rating: 4.7,
  },
  [routeKey('Hà Nội', 'Đà Nẵng')]: {
    image: '/images/routes/hanoi-danang.jpg',
    imageAlt: 'Cầu Rồng Đà Nẵng về đêm',
    distanceKm: 764,
    operator: 'Hoàng Long',
    rating: 4.9,
  },
  [routeKey('Hà Nội', 'TP.HCM')]: {
    image: '/images/routes/hanoi-hcm.jpg',
    imageAlt: 'Landmark 81 và sông Sài Gòn',
    distanceKm: 1726,
    operator: 'Phương Trang',
    rating: 4.8,
  },
};

export function getRouteDisplayMeta(
  origin: string,
  destination: string
): RouteDisplayMeta | undefined {
  return ROUTE_DISPLAY_META[routeKey(origin, destination)];
}
