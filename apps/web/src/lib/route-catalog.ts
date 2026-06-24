import { gql } from '@/lib/graphql';

export interface CatalogRoute {
  origin: string;
  destination: string;
  tripsCount: number;
  minPrice: number;
  durationMinutes: number;
  nextDepartureTime: string;
}

export interface RouteCatalog {
  locations: string[];
  routes: CatalogRoute[];
}

export async function fetchRouteCatalog(travelDate: string, limit = 6): Promise<RouteCatalog> {
  const data = await gql<{ routeCatalog: RouteCatalog }>(
    `query($travelDate:String!,$limit:Int){
      routeCatalog(travelDate:$travelDate,limit:$limit){
        locations
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
  if (q.length < 1) return [];
  return locations
    .filter((name) => name.toLocaleLowerCase('vi').includes(q))
    .slice(0, 10)
    .map((name) => ({ name }));
}

export function formatDurationMinutes(durationMinutes: number): string {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return '—';
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  if (!h) return `${m}p`;
  if (!m) return `${h}h`;
  return `${h}h ${m}p`;
}
