import { gql } from '@/lib/graphql';

export interface CatalogRoute {
  origin: string;
  destination: string;
  tripsCount: number;
  minPrice: number;
  durationMinutes: number;
  nextDepartureTime: string;
}

export interface RoutePair {
  origin: string;
  destination: string;
}

export interface RouteCatalog {
  locations: string[];
  origins: string[];
  destinations: string[];
  routePairs: RoutePair[];
  routes: CatalogRoute[];
}

export const EMPTY_ROUTE_CATALOG: RouteCatalog = {
  locations: [],
  origins: [],
  destinations: [],
  routePairs: [],
  routes: [],
};

export async function fetchRouteCatalog(travelDate: string, limit = 6): Promise<RouteCatalog> {
  const data = await gql<{ routeCatalog: RouteCatalog }>(
    `query($travelDate:String!,$limit:Int){
      routeCatalog(travelDate:$travelDate,limit:$limit){
        locations
        origins
        destinations
        routePairs { origin destination }
        routes{
          origin
          destination
          tripsCount
          minPrice
          durationMinutes
          nextDepartureTime
        }
      }
    }`,
    { travelDate, limit }
  );
  return data.routeCatalog;
}

export function filterLocationSuggestions(locations: string[], keyword: string): Array<{ name: string }> {
  const q = keyword.trim().toLocaleLowerCase('vi');
  const pool = q.length < 1 ? locations : locations.filter((name) => name.toLocaleLowerCase('vi').includes(q));
  return pool.map((name) => ({ name }));
}

export function destinationsForOrigin(catalog: RouteCatalog, origin: string): string[] {
  const trimmed = origin.trim();
  if (!trimmed) return catalog.destinations;
  const set = new Set<string>();
  for (const pair of catalog.routePairs) {
    if (pair.origin === trimmed) set.add(pair.destination);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'vi'));
}

export function originsForDestination(catalog: RouteCatalog, destination: string): string[] {
  const trimmed = destination.trim();
  if (!trimmed) return catalog.origins;
  const set = new Set<string>();
  for (const pair of catalog.routePairs) {
    if (pair.destination === trimmed) set.add(pair.origin);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'vi'));
}

export function hasRoutePair(catalog: RouteCatalog, origin: string, destination: string): boolean {
  return catalog.routePairs.some((p) => p.origin === origin && p.destination === destination);
}

export function formatDurationMinutes(durationMinutes: number): string {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return '—';
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  if (!h) return `${m}p`;
  if (!m) return `${h}h`;
  return `${h}h ${m}p`;
}
