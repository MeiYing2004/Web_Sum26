import { todayVN, departureDateVN } from './datetime';

export type TripAvailabilityStatus = 'AVAILABLE' | 'UPCOMING' | 'DEPARTED' | 'PAST_DAY' | 'SOLD_OUT';

export interface TripAvailability {
  bookable: boolean;
  availabilityStatus: TripAvailabilityStatus;
  availabilityLabel: string;
}

/** Compare YYYY-MM-DD strings */
export function compareDateVN(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Bookability for a trip on a selected departure date (Asia/Ho_Chi_Minh).
 * travelDate is the departure day chosen by the user — not arrival day.
 */
export function getTripAvailability(
  travelDate: string,
  departureTimeIso: string,
  now: Date = new Date(),
  availableSeats?: number
): TripAvailability {
  if (!departureTimeIso || departureDateVN(departureTimeIso) !== travelDate) {
    return {
      bookable: false,
      availabilityStatus: 'PAST_DAY',
      availabilityLabel: '',
    };
  }

  const today = todayVN(now);
  const dateCmp = compareDateVN(travelDate, today);

  if (dateCmp < 0) {
    return {
      bookable: false,
      availabilityStatus: 'PAST_DAY',
      availabilityLabel: 'Chuyến đã kết thúc',
    };
  }

  const depMs = new Date(departureTimeIso).getTime();
  if (dateCmp === 0 && depMs <= now.getTime()) {
    return {
      bookable: false,
      availabilityStatus: 'DEPARTED',
      availabilityLabel: 'Đã khởi hành',
    };
  }

  if (dateCmp === 0 && depMs - now.getTime() <= 60 * 60 * 1000) {
    return {
      bookable: true,
      availabilityStatus: 'UPCOMING',
      availabilityLabel: 'Sắp khởi hành',
    };
  }

  if (availableSeats !== undefined && availableSeats <= 0) {
    return {
      bookable: false,
      availabilityStatus: 'SOLD_OUT',
      availabilityLabel: 'Hết vé',
    };
  }

  return {
    bookable: true,
    availabilityStatus: 'AVAILABLE',
    availabilityLabel: '',
  };
}

export function annotateTripAvailability<T extends { departure_time?: string; departureTime?: string }>(
  travelDate: string,
  trip: T,
  now?: Date,
  availableSeats?: number
): T & {
  bookable: boolean;
  availability_status: string;
  availability_label: string;
} {
  const dep = String(trip.departure_time ?? trip.departureTime ?? '');
  const seats =
    availableSeats ??
    (trip as { available_seats?: number; availableSeats?: number }).available_seats ??
    (trip as { availableSeats?: number }).availableSeats;
  const av = getTripAvailability(travelDate, dep, now, seats);
  return {
    ...trip,
    bookable: av.bookable,
    availability_status: av.availabilityStatus,
    availability_label: av.availabilityLabel,
  };
}
