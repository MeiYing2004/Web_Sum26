/** Default marketing & trip imagery — local assets in public/images */

export type HeroCarouselSlide = {
  src: string;
  alt: string;
};

/** Hero slideshow — thêm/xóa slide tại đây */
export const HERO_CAROUSEL_SLIDES: HeroCarouselSlide[] = [
  {
    src: '/images/hero-carousel-sleeper.jpg',
    alt: 'Xe khách giường nằm cao cấp',
  },
  {
    src: '/images/hero-carousel-limousine.jpg',
    alt: 'Xe limousine liên tỉnh',
  },
  {
    src: '/images/hero-carousel-mountain.jpg',
    alt: 'Đường đèo Việt Nam',
  },
  {
    src: '/images/hero-carousel-city-night.jpg',
    alt: 'Thành phố ban đêm',
  },
  {
    src: '/images/hero-carousel-sunrise.jpg',
    alt: 'Bình minh trên quốc lộ',
  },
];

const IMAGES = {
  hero: '/images/hero-coach.jpg',
  heroFallback: '/images/hero-bus.png',
  routeFallback: '/images/bus-limousine.jpg',
  logo: '/images/cappy-bus-logo.png',
  busDefault: '/images/bus-limousine.jpg',
  busSleeper: '/images/bus-sleeper.jpg',
  destinations: {
    'TP.HCM': '/images/routes/hanoi-hcm.jpg',
    'Đà Lạt': '/images/routes/hcm-dalat.jpg',
    'Nha Trang': '/images/routes/hcm-nhatrang.jpg',
    'Cần Thơ': '/images/routes/hcm-cantho.jpg',
    'Đà Nẵng': '/images/routes/hanoi-danang.jpg',
    'Hà Nội': '/images/routes/hanoi.jpg',
  } as Record<string, string>,
  routes: {
    'TP.HCM__Cần Thơ': '/images/routes/hcm-cantho.jpg',
    'TP.HCM__Đà Lạt': '/images/routes/hcm-dalat.jpg',
    'TP.HCM__Nha Trang': '/images/routes/hcm-nhatrang.jpg',
    'Hà Nội__Đà Nẵng': '/images/routes/hanoi-danang.jpg',
    'Hà Nội__TP.HCM': '/images/routes/hanoi-hcm.jpg',
  } as Record<string, string>,
} as const;

/** Ảnh theo cung đường — ưu tiên ảnh tuyến, fallback ảnh điểm đến */
export function getRouteImage(origin: string, destination: string): string {
  const key = `${origin}__${destination}`;
  return IMAGES.routes[key] ?? getDestinationImage(destination);
}

/** Ảnh địa danh Việt Nam — file local, không watermark */

export function getDestinationImage(city: string): string {
  return IMAGES.destinations[city] ?? IMAGES.busDefault;
}

export function getBusImage(busType?: string): string {
  const t = (busType || '').toLowerCase();
  if (t.includes('giường') || t.includes('limousine') || t.includes('vip')) {
    return IMAGES.busSleeper;
  }
  return IMAGES.busDefault;
}

export function getOperatorLogo(operatorName: string): string {
  return IMAGES.logo;
}

export function getHeroImage(): string {
  return IMAGES.hero;
}

export { IMAGES };
