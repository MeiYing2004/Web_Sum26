/** Default marketing & trip imagery — local assets in public/images */

const IMAGES = {
  hero: '/images/hero-coach.jpg',
  heroFallback: '/images/hero-bus.png',
  logo: '/images/cappy-bus-logo.png',
  busDefault: '/images/bus-limousine.jpg',
  busSleeper: '/images/bus-sleeper.jpg',
  destinations: {
    'TP.HCM': '/images/dest-hcm.jpg',
    'Đà Lạt': '/images/dest-dalat.jpg',
    'Nha Trang': '/images/dest-nhatrang.jpg',
    'Cần Thơ': '/images/dest-cantho.jpg',
    'Đà Nẵng': '/images/dest-danang.jpg',
    'Hà Nội': '/images/dest-hanoi.jpg',
  } as Record<string, string>,
} as const;

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
