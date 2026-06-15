const SLUG_MAP: Record<string, string> = {
  'tp-hcm': 'TP.HCM',
  'da-lat': 'Đà Lạt',
  'nha-trang': 'Nha Trang',
  'can-tho': 'Cần Thơ',
  'da-nang': 'Đà Nẵng',
  'ha-noi': 'Hà Nội',
};

export function slugifyLocation(name: string): string {
  const entry = Object.entries(SLUG_MAP).find(([, v]) => v === name);
  if (entry) return entry[0];
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-');
}

export function unslugifyLocation(slug: string): string {
  return SLUG_MAP[slug] || slug.replace(/-/g, ' ');
}

export function buildRouteSlug(origin: string, destination: string, date: string): string {
  const d = date.split('-');
  const datePart = d.length === 3 ? `${d[2]}-${d[1]}` : date;
  return `ve-xe-${slugifyLocation(origin)}-di-${slugifyLocation(destination)}-ngay-${datePart}`;
}

export function parseRouteSlug(slug: string): { origin: string; destination: string; date: string } | null {
  const m = slug.match(/^ve-xe-(.+)-di-(.+)-ngay-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = new Date().getFullYear();
  const [, originSlug, destSlug, day, month] = m;
  return {
    origin: unslugifyLocation(originSlug),
    destination: unslugifyLocation(destSlug),
    date: `${year}-${month}-${day}`,
  };
}

export function buildSeoTitle(origin: string, destination: string, date: string) {
  const [y, m, d] = date.split('-');
  return `Vé xe ${origin} đi ${destination} ngày ${d}/${m}`;
}

export function buildSeoDescription(origin: string, destination: string) {
  return `Đặt vé xe ${origin} → ${destination}, giá tốt, nhiều khung giờ. Chọn ghế online, thanh toán nhanh.`;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
