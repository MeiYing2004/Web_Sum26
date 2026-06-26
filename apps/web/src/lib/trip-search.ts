import { todayVN } from './datetime';
import { buildRouteSlug } from './seo';

const SLUG_TO_CITY: Record<string, string> = {
  HCM: 'TP.HCM',
  DALAT: 'Đà Lạt',
  NHATRANG: 'Nha Trang',
  CANTHO: 'Cần Thơ',
  DANANG: 'Đà Nẵng',
  HANOI: 'Hà Nội',
};

/** Slug URL thân thiện (chữ thường) → tên thành phố */
const DESTINATION_SLUG_TO_CITY: Record<string, string> = {
  hcm: 'TP.HCM',
  dalat: 'Đà Lạt',
  nhatrang: 'Nha Trang',
  cantho: 'Cần Thơ',
  danang: 'Đà Nẵng',
  hanoi: 'Hà Nội',
};

const CITY_TO_SLUG: Record<string, string> = {
  'TP.HCM': 'HCM',
  'Đà Lạt': 'DALAT',
  'Nha Trang': 'NHATRANG',
  'Cần Thơ': 'CANTHO',
  'Đà Nẵng': 'DANANG',
  'Hà Nội': 'HANOI',
};

const CITY_TO_DESTINATION_SLUG: Record<string, string> = {
  'TP.HCM': 'hcm',
  'Đà Lạt': 'dalat',
  'Nha Trang': 'nhatrang',
  'Cần Thơ': 'cantho',
  'Đà Nẵng': 'danang',
  'Hà Nội': 'hanoi',
};

export function cityToSlug(city: string): string {
  if (CITY_TO_SLUG[city]) return CITY_TO_SLUG[city];
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

export function slugToCity(slug: string): string {
  const key = slug.toUpperCase();
  return SLUG_TO_CITY[key] || slug;
}

export function destinationSlugToCity(slug: string): string {
  const key = slug.trim().toLowerCase();
  return DESTINATION_SLUG_TO_CITY[key] || slugToCity(slug);
}

export function cityToDestinationSlug(city: string): string {
  if (CITY_TO_DESTINATION_SLUG[city]) return CITY_TO_DESTINATION_SLUG[city];
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

export const TRIP_OPERATORS = [
  'Phương Trang Demo',
  'Thành Bưởi Demo',
  'Kumho Demo',
] as const;

export const TRIP_BUS_TYPES = [
  'ghế ngồi 29 chỗ',
  'giường nằm 34 chỗ',
  'limousine 22 chỗ',
] as const;

export type TripSearchFilters = {
  operatorFilter?: string;
  busTypeFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  departureTimeFrom?: string;
  departureTimeTo?: string;
  minSeats?: number;
};

export function buildTripsSearchUrl(origin: string, destination: string, date?: string): string {
  const params = new URLSearchParams();
  params.set('from', cityToSlug(origin));
  params.set('to', cityToSlug(destination));
  params.set('date', date || todayVN());
  return `/trips?${params.toString()}`;
}

/** Tìm chuyến theo điểm đến — ví dụ /trips?destination=dalat */
export function buildDestinationSearchUrl(destinationCity: string, date?: string): string {
  const params = new URLSearchParams();
  params.set('destination', cityToDestinationSlug(destinationCity));
  params.set('date', date || todayVN());
  return `/trips?${params.toString()}`;
}

/** SEO-friendly URL — redirects to /trips with query params via [slug]/page */
export function buildTripsSeoUrl(origin: string, destination: string, date?: string): string {
  return `/${buildRouteSlug(origin, destination, date || todayVN())}`;
}

export function parseTripsSearchParams(params: URLSearchParams): {
  origin: string;
  destination: string;
  date: string;
} | null {
  const destinationOnly = params.get('destination');
  if (destinationOnly) {
    const from = params.get('from');
    return {
      origin: from ? slugToCity(from) : '',
      destination: destinationSlugToCity(destinationOnly),
      date: params.get('date') || todayVN(),
    };
  }

  const from = params.get('from');
  const to = params.get('to');
  const date = params.get('date');
  if (!from || !to) return null;
  return {
    origin: slugToCity(from),
    destination: slugToCity(to),
    date: date || todayVN(),
  };
}
