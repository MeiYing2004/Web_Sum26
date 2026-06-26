/** Display helpers for route cards — no API changes */

import { getRouteDisplayMeta } from '@/lib/route-metadata';

const OPERATORS = ['Phương Trang', 'Thành Bưởi', 'Hoàng Long', 'Mai Linh Express', 'Futa Bus Lines'];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash + input.charCodeAt(i) * (i + 1)) % 1000;
  return hash;
}

/** Quãng đường thực tế từ metadata, hoặc ước lượng từ thời gian di chuyển */
export function routeDistanceKm(
  origin: string,
  destination: string,
  durationMinutes: number
): number {
  const meta = getRouteDisplayMeta(origin, destination);
  if (meta) return meta.distanceKm;
  return estimateRouteDistanceKm(durationMinutes);
}

/** Estimate distance from duration (~65 km/h average) — fallback khi chưa có metadata */
export function estimateRouteDistanceKm(durationMinutes: number): number {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return 0;
  return Math.round((durationMinutes / 60) * 65);
}

export function formatDistanceKm(km: number): string {
  if (km <= 0) return '—';
  return `${km.toLocaleString('vi-VN')} km`;
}

/** Nhà xe khai thác chính — ưu tiên metadata tuyến */
export function popularOperatorForRoute(origin: string, destination: string): string {
  const meta = getRouteDisplayMeta(origin, destination);
  if (meta) return meta.operator;
  const key = `${origin}-${destination}`;
  return OPERATORS[hashString(key) % OPERATORS.length];
}

/** Điểm đánh giá tuyến — ưu tiên metadata */
export function routeRating(origin: string, destination: string): number {
  const meta = getRouteDisplayMeta(origin, destination);
  if (meta) return meta.rating;
  const hash = hashString(`${origin}${destination}`);
  return 4.3 + (hash % 7) / 10;
}
