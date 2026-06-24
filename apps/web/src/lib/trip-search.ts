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

const CITY_TO_SLUG: Record<string, string> = {
  'TP.HCM': 'HCM',
  'Đà Lạt': 'DALAT',
  'Nha Trang': 'NHATRANG',
  'Cần Thơ': 'CANTHO',
  'Đà Nẵng': 'DANANG',
  'Hà Nội': 'HANOI',
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

/** SEO-friendly URL — redirects to /trips with query params via [slug]/page */
export function buildTripsSeoUrl(origin: string, destination: string, date?: string): string {
  return `/${buildRouteSlug(origin, destination, date || todayVN())}`;
}

export function parseTripsSearchParams(params: URLSearchParams): {
  origin: string;
  destination: string;
  date: string;
} | null {
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
