/** Client-side trip availability (mirrors @bus/shared/trip-availability) */
import { todayVN, departureDateVN, filterByDepartureDate } from './datetime';

export type TripAvailabilityStatus = 'AVAILABLE' | 'UPCOMING' | 'DEPARTED' | 'PAST_DAY' | 'SOLD_OUT';

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

export function getTripAvailability(
  travelDate: string,
  departureTimeIso: string,
  now: Date = new Date(),
  availableSeats?: number
): { bookable: boolean; availabilityStatus: TripAvailabilityStatus; availabilityLabel: string } {
  if (!departureTimeIso || departureDateVN(departureTimeIso) !== travelDate) {
    return { bookable: false, availabilityStatus: 'PAST_DAY', availabilityLabel: '' };
  }

  const today = todayVN(now);
  const cmp = travelDate.localeCompare(today);

  if (cmp < 0) {
    return { bookable: false, availabilityStatus: 'PAST_DAY', availabilityLabel: 'Chuyến đã kết thúc' };
  }

  if (cmp === 0 && new Date(departureTimeIso).getTime() <= now.getTime()) {
    return { bookable: false, availabilityStatus: 'DEPARTED', availabilityLabel: 'Đã khởi hành' };
  }

  if (cmp === 0 && new Date(departureTimeIso).getTime() - now.getTime() <= 60 * 60 * 1000) {
    return { bookable: true, availabilityStatus: 'UPCOMING', availabilityLabel: 'Sắp khởi hành' };
  }

  if (availableSeats !== undefined && availableSeats <= 0) {
    return { bookable: false, availabilityStatus: 'SOLD_OUT', availabilityLabel: 'Hết vé' };
  }

  return { bookable: true, availabilityStatus: 'AVAILABLE', availabilityLabel: '' };
}

/** Fallback if API omits availability fields; drops trips not departing on travelDate. */
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

  if (trip.bookable !== undefined && trip.availabilityStatus) {
    return trip as T & { bookable: boolean; availabilityStatus: string; availabilityLabel: string };
  }

  const av = getTripAvailability(travelDate, trip.departureTime, new Date(), trip.availableSeats);
  return { ...trip, ...av, availabilityStatus: av.availabilityStatus };
}

function isDepartureOnTravelDate(departureTimeIso: string, travelDate: string): boolean {
  return departureDateVN(departureTimeIso) === travelDate;
}

/** Normalize search results: only trips departing on the selected date. */
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
