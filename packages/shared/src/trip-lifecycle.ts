import { TRIP_STATUS, type TripStatus } from './constants';
import { departureDateVN, todayVN } from './datetime';

/** Compare YYYY-MM-DD strings */
export function compareDateVN(a: string, b: string): number {
  return a.localeCompare(b);
}

export type TripAvailabilityStatus =
  | 'AVAILABLE'
  | 'UPCOMING'
  | 'DEPARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INACTIVE'
  | 'PAST_DAY'
  | 'SOLD_OUT';

export type TripDisplayStatus =
  | 'SELLING'
  | 'UPCOMING'
  | 'DEPARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INACTIVE';

export interface TripAvailability {
  bookable: boolean;
  availabilityStatus: TripAvailabilityStatus;
  availabilityLabel: string;
  effectiveStatus: TripStatus;
  displayStatus: TripDisplayStatus;
  displayStatusLabel: string;
}

const UPCOMING_WINDOW_MS = 60 * 60 * 1000;

export const TRIP_DISPLAY_STATUS_LABEL: Record<TripDisplayStatus, string> = {
  SELLING: 'Đang mở bán',
  UPCOMING: 'Sắp khởi hành',
  DEPARTED: 'Đã khởi hành',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  INACTIVE: 'Tạm khóa',
};

export function computeEffectiveTripStatus(
  dbStatus: string,
  departureTimeIso: string,
  arrivalTimeIso: string,
  now: Date = new Date()
): TripStatus {
  if (dbStatus === TRIP_STATUS.CANCELLED) return TRIP_STATUS.CANCELLED;
  if (dbStatus === TRIP_STATUS.INACTIVE) return TRIP_STATUS.INACTIVE;

  const depMs = new Date(departureTimeIso).getTime();
  const arrMs = arrivalTimeIso ? new Date(arrivalTimeIso).getTime() : depMs;
  const nowMs = now.getTime();

  if (nowMs >= arrMs) return TRIP_STATUS.COMPLETED;
  if (nowMs >= depMs) return TRIP_STATUS.DEPARTED;
  return TRIP_STATUS.ACTIVE;
}

/** DB status to persist when time has advanced (never downgrades). */
export function nextPersistedTripStatus(
  dbStatus: TripStatus,
  departureTimeIso: string,
  arrivalTimeIso: string,
  now: Date = new Date()
): TripStatus | null {
  if (dbStatus === TRIP_STATUS.CANCELLED) return null;

  const effective = computeEffectiveTripStatus(dbStatus, departureTimeIso, arrivalTimeIso, now);
  if (effective === dbStatus) return null;

  if (effective === TRIP_STATUS.COMPLETED) {
    return TRIP_STATUS.COMPLETED;
  }
  if (effective === TRIP_STATUS.DEPARTED && dbStatus === TRIP_STATUS.ACTIVE) {
    return TRIP_STATUS.DEPARTED;
  }
  return null;
}

export function resolveTripDisplayStatus(
  effectiveStatus: TripStatus,
  departureTimeIso: string,
  now: Date = new Date()
): { displayStatus: TripDisplayStatus; displayStatusLabel: string } {
  if (effectiveStatus === TRIP_STATUS.CANCELLED) {
    return { displayStatus: 'CANCELLED', displayStatusLabel: TRIP_DISPLAY_STATUS_LABEL.CANCELLED };
  }
  if (effectiveStatus === TRIP_STATUS.INACTIVE) {
    return { displayStatus: 'INACTIVE', displayStatusLabel: TRIP_DISPLAY_STATUS_LABEL.INACTIVE };
  }
  if (effectiveStatus === TRIP_STATUS.COMPLETED) {
    return { displayStatus: 'COMPLETED', displayStatusLabel: TRIP_DISPLAY_STATUS_LABEL.COMPLETED };
  }
  if (effectiveStatus === TRIP_STATUS.DEPARTED) {
    return { displayStatus: 'DEPARTED', displayStatusLabel: TRIP_DISPLAY_STATUS_LABEL.DEPARTED };
  }

  const depMs = new Date(departureTimeIso).getTime();
  if (depMs - now.getTime() <= UPCOMING_WINDOW_MS) {
    return { displayStatus: 'UPCOMING', displayStatusLabel: TRIP_DISPLAY_STATUS_LABEL.UPCOMING };
  }
  return { displayStatus: 'SELLING', displayStatusLabel: TRIP_DISPLAY_STATUS_LABEL.SELLING };
}

export function getTripAvailability(
  travelDate: string,
  departureTimeIso: string,
  now: Date = new Date(),
  availableSeats?: number,
  options?: {
    arrivalTimeIso?: string;
    dbStatus?: string;
  }
): TripAvailability {
  const dbStatus = (options?.dbStatus || TRIP_STATUS.ACTIVE) as TripStatus;
  const arrivalTimeIso = options?.arrivalTimeIso || departureTimeIso;
  const effectiveStatus = computeEffectiveTripStatus(
    dbStatus,
    departureTimeIso,
    arrivalTimeIso,
    now
  );
  const { displayStatus, displayStatusLabel } = resolveTripDisplayStatus(
    effectiveStatus,
    departureTimeIso,
    now
  );

  if (dbStatus === TRIP_STATUS.CANCELLED || effectiveStatus === TRIP_STATUS.CANCELLED) {
    return {
      bookable: false,
      availabilityStatus: 'CANCELLED',
      availabilityLabel: 'Chuyến xe đã kết thúc',
      effectiveStatus: TRIP_STATUS.CANCELLED,
      displayStatus,
      displayStatusLabel,
    };
  }

  if (dbStatus === TRIP_STATUS.INACTIVE || effectiveStatus === TRIP_STATUS.INACTIVE) {
    return {
      bookable: false,
      availabilityStatus: 'INACTIVE',
      availabilityLabel: 'Chuyến tạm khóa',
      effectiveStatus: TRIP_STATUS.INACTIVE,
      displayStatus,
      displayStatusLabel,
    };
  }

  if (!departureTimeIso || departureDateVN(departureTimeIso) !== travelDate) {
    return {
      bookable: false,
      availabilityStatus: 'PAST_DAY',
      availabilityLabel: '',
      effectiveStatus,
      displayStatus,
      displayStatusLabel,
    };
  }

  const today = todayVN(now);
  const dateCmp = compareDateVN(travelDate, today);

  if (dateCmp < 0) {
    return {
      bookable: false,
      availabilityStatus: 'PAST_DAY',
      availabilityLabel: 'Chuyến xe đã kết thúc',
      effectiveStatus,
      displayStatus,
      displayStatusLabel,
    };
  }

  const depMs = new Date(departureTimeIso).getTime();
  const arrMs = new Date(arrivalTimeIso).getTime();

  if (now.getTime() >= arrMs) {
    return {
      bookable: false,
      availabilityStatus: 'COMPLETED',
      availabilityLabel: 'Chuyến xe đã kết thúc',
      effectiveStatus: TRIP_STATUS.COMPLETED,
      displayStatus,
      displayStatusLabel,
    };
  }

  if (now.getTime() >= depMs) {
    return {
      bookable: false,
      availabilityStatus: 'DEPARTED',
      availabilityLabel: 'Xe đã khởi hành',
      effectiveStatus: TRIP_STATUS.DEPARTED,
      displayStatus,
      displayStatusLabel,
    };
  }

  if (dateCmp === 0 && depMs - now.getTime() <= UPCOMING_WINDOW_MS) {
    return {
      bookable: true,
      availabilityStatus: 'UPCOMING',
      availabilityLabel: 'Sắp khởi hành',
      effectiveStatus: TRIP_STATUS.ACTIVE,
      displayStatus,
      displayStatusLabel,
    };
  }

  if (availableSeats !== undefined && availableSeats <= 0) {
    return {
      bookable: false,
      availabilityStatus: 'SOLD_OUT',
      availabilityLabel: 'Hết vé',
      effectiveStatus: TRIP_STATUS.ACTIVE,
      displayStatus,
      displayStatusLabel,
    };
  }

  return {
    bookable: true,
    availabilityStatus: 'AVAILABLE',
    availabilityLabel: '',
    effectiveStatus: TRIP_STATUS.ACTIVE,
    displayStatus,
    displayStatusLabel,
  };
}

export function tripBookingBlockedMessage(availabilityStatus: TripAvailabilityStatus): string {
  if (
    availabilityStatus === 'DEPARTED' ||
    availabilityStatus === 'COMPLETED' ||
    availabilityStatus === 'PAST_DAY' ||
    availabilityStatus === 'CANCELLED'
  ) {
    return 'Chuyến xe đã khởi hành, không thể đặt vé.';
  }
  return 'Chuyến không còn khả dụng';
}

export function annotateTripAvailability<T extends { departure_time?: string; departureTime?: string }>(
  travelDate: string,
  trip: T,
  now?: Date,
  availableSeats?: number,
  options?: { arrivalTimeIso?: string; dbStatus?: string }
): T & {
  bookable: boolean;
  availability_status: string;
  availability_label: string;
  effective_status: string;
  display_status: string;
  display_status_label: string;
} {
  const dep = String(trip.departure_time ?? trip.departureTime ?? '');
  const arr =
    options?.arrivalTimeIso ??
    (String((trip as { arrival_time?: string; arrivalTime?: string }).arrival_time ?? '') ||
      String((trip as { arrivalTime?: string }).arrivalTime ?? ''));
  const seats =
    availableSeats ??
    (trip as { available_seats?: number; availableSeats?: number }).available_seats ??
    (trip as { availableSeats?: number }).availableSeats;
  const status =
    options?.dbStatus ??
    String((trip as { status?: string }).status ?? TRIP_STATUS.ACTIVE);
  const av = getTripAvailability(travelDate, dep, now, seats, {
    arrivalTimeIso: arr || dep,
    dbStatus: status,
  });
  return {
    ...trip,
    bookable: av.bookable,
    availability_status: av.availabilityStatus,
    availability_label: av.availabilityLabel,
    effective_status: av.effectiveStatus,
    display_status: av.displayStatus,
    display_status_label: av.displayStatusLabel,
  };
}
