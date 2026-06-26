/** Client-side trip availability — mirrors @bus/shared/trip-lifecycle (server is source of truth). */
import { todayVN, departureDateVN, filterByDepartureDate } from './datetime';

export type TripAvailabilityStatus =
  | 'AVAILABLE'
  | 'UPCOMING'
  | 'DEPARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INACTIVE'
  | 'PAST_DAY'
  | 'SOLD_OUT';

const NON_BOOKABLE_STATUSES = new Set<TripAvailabilityStatus>([
  'DEPARTED',
  'COMPLETED',
  'CANCELLED',
  'INACTIVE',
  'PAST_DAY',
  'SOLD_OUT',
]);

export interface TripSearchResult {
  id: string;
  routeName?: string;
  operatorName?: string;
  busType?: string;
  departureTime: string;
  arrivalTime?: string;
  price: number;
  availableSeats?: number;
  durationMinutes?: number;
  bookable?: boolean;
  availabilityStatus?: TripAvailabilityStatus | string;
  availabilityLabel?: string;
}

function compareDateVN(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Fallback only when API omits availability — prefer server fields from GraphQL. */
export function getTripAvailability(
  travelDate: string,
  departureTimeIso: string,
  now: Date = new Date(),
  availableSeats?: number,
  options?: { arrivalTimeIso?: string; dbStatus?: string }
): { bookable: boolean; availabilityStatus: TripAvailabilityStatus; availabilityLabel: string } {
  const dbStatus = options?.dbStatus || 'ACTIVE';
  const arrivalTimeIso = options?.arrivalTimeIso || departureTimeIso;

  if (dbStatus === 'CANCELLED') {
    return { bookable: false, availabilityStatus: 'CANCELLED', availabilityLabel: 'Chuyến xe đã kết thúc' };
  }
  if (dbStatus === 'INACTIVE') {
    return { bookable: false, availabilityStatus: 'INACTIVE', availabilityLabel: 'Chuyến tạm khóa' };
  }

  if (!departureTimeIso || departureDateVN(departureTimeIso) !== travelDate) {
    return { bookable: false, availabilityStatus: 'PAST_DAY', availabilityLabel: '' };
  }

  const today = todayVN(now);
  const cmp = compareDateVN(travelDate, today);

  if (cmp < 0) {
    return { bookable: false, availabilityStatus: 'PAST_DAY', availabilityLabel: 'Chuyến xe đã kết thúc' };
  }

  const depMs = new Date(departureTimeIso).getTime();
  const arrMs = new Date(arrivalTimeIso).getTime();
  const nowMs = now.getTime();

  if (nowMs >= arrMs) {
    return { bookable: false, availabilityStatus: 'COMPLETED', availabilityLabel: 'Chuyến xe đã kết thúc' };
  }

  if (nowMs >= depMs) {
    return { bookable: false, availabilityStatus: 'DEPARTED', availabilityLabel: 'Xe đã khởi hành' };
  }

  if (cmp === 0 && depMs - nowMs <= 60 * 60 * 1000) {
    return { bookable: true, availabilityStatus: 'UPCOMING', availabilityLabel: 'Sắp khởi hành' };
  }

  if (availableSeats !== undefined && availableSeats <= 0) {
    return { bookable: false, availabilityStatus: 'SOLD_OUT', availabilityLabel: 'Hết vé' };
  }

  return { bookable: true, availabilityStatus: 'AVAILABLE', availabilityLabel: '' };
}

export function ensureTripAvailability<T extends TripSearchResult>(
  travelDate: string,
  trip: T
): T & { bookable: boolean; availabilityStatus: string; availabilityLabel: string } {
  if (!isDepartureOnTravelDate(trip.departureTime, travelDate)) {
    return {
      ...trip,
      bookable: false,
      availabilityStatus: 'PAST_DAY',
      availabilityLabel: '',
    };
  }

  if (trip.bookable !== undefined && trip.availabilityStatus !== undefined) {
    const status = String(trip.availabilityStatus) as TripAvailabilityStatus;
    const bookable = Boolean(trip.bookable) && !NON_BOOKABLE_STATUSES.has(status);
    return {
      ...trip,
      bookable,
      availabilityStatus: status,
      availabilityLabel: trip.availabilityLabel ?? '',
    };
  }

  const av = getTripAvailability(travelDate, trip.departureTime, new Date(), trip.availableSeats, {
    arrivalTimeIso: trip.arrivalTime,
  });
  return { ...trip, ...av, availabilityStatus: av.availabilityStatus };
}

function isDepartureOnTravelDate(departureTimeIso: string, travelDate: string): boolean {
  return departureDateVN(departureTimeIso) === travelDate;
}

export function normalizeSearchTrips<T extends TripSearchResult>(
  travelDate: string,
  trips: T[]
): Array<T & { bookable: boolean; availabilityStatus: string; availabilityLabel: string }> {
  return filterByDepartureDate(trips, travelDate)
    .map((t) => ensureTripAvailability(travelDate, t))
    .filter((t) => departureDateVN(t.departureTime) === travelDate);
}

export const TRIP_SEARCH_FIELDS = `
  id routeName operatorName busType departureTime arrivalTime price availableSeats durationMinutes
  bookable availabilityStatus availabilityLabel
`;

export const TRIP_DETAIL_BASE_FIELDS = `
  id routeName origin destination pickupPoint dropoffPoint
  operatorName busType price busPlate departureTime arrivalTime totalSeats
  cancellationPolicy status
`;

export const TRIP_DETAIL_AVAILABILITY_FIELDS = `
  bookable availabilityStatus availabilityLabel
`;

export function enrichTripDetailAvailability<
  T extends {
    departureTime: string;
    arrivalTime?: string;
    status?: string;
    bookable?: boolean;
    availabilityStatus?: string;
    availabilityLabel?: string;
  },
>(trip: T, availableSeats?: number) {
  if (trip.bookable !== undefined && trip.availabilityStatus !== undefined) {
    return trip as T & {
      bookable: boolean;
      availabilityStatus: string;
      availabilityLabel: string;
    };
  }
  const travelDate = departureDateVN(trip.departureTime);
  const av = getTripAvailability(travelDate, trip.departureTime, new Date(), availableSeats, {
    arrivalTimeIso: trip.arrivalTime,
    dbStatus: trip.status,
  });
  return { ...trip, ...av };
}

export function isMissingBookableFieldError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /cannot query field ['"]bookable['"]/i.test(msg);
}

export function nonBookableButtonLabel(status?: string): string {
  if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'PAST_DAY') {
    return 'Chuyến đã kết thúc';
  }
  return 'Đã khởi hành';
}
