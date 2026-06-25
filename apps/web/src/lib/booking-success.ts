import { gql } from '@/lib/graphql';
import { computePricingFromTicketTotal } from '@/lib/booking-pricing';
import { departureDateVN, formatDisplayDate, departureTimeVN } from '@/lib/datetime';

export const BOOKING_SUCCESS_KEY = 'bookingSuccess';

export type BookingSuccessPassenger = {
  fullName: string;
  seatId: string;
};

export type BookingSuccessTrip = {
  origin: string;
  destination: string;
  routeName?: string;
  departureTime: string;
  operatorName: string;
  busType: string;
};

export type BookingSuccessPayload = {
  bookingCode: string;
  guestEmail: string;
  passengers: BookingSuccessPassenger[];
  seats: string[];
  totalAmount: number;
  ticketTotal: number;
  serviceFee: number;
  paymentStatus: string;
  trip?: BookingSuccessTrip;
};

export function saveBookingSuccess(payload: BookingSuccessPayload): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(BOOKING_SUCCESS_KEY, JSON.stringify(payload));
}

export function readBookingSuccess(): BookingSuccessPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_SUCCESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookingSuccessPayload;
    if (!parsed?.bookingCode?.trim()) return null;
    return normalizeSuccessPayload(parsed);
  } catch {
    return null;
  }
}

export function normalizeSuccessPayload(payload: BookingSuccessPayload): BookingSuccessPayload {
  const ticketTotal =
    payload.ticketTotal > 0 ? payload.ticketTotal : payload.totalAmount;
  const pricing =
    payload.serviceFee > 0
      ? {
          ticketTotal,
          serviceFee: payload.serviceFee,
          grandTotal: ticketTotal + payload.serviceFee,
        }
      : computePricingFromTicketTotal(ticketTotal);

  return {
    ...payload,
    ticketTotal: pricing.ticketTotal,
    serviceFee: pricing.serviceFee,
    totalAmount: pricing.grandTotal,
  };
}

export function clearBookingSuccess(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(BOOKING_SUCCESS_KEY);
}

export function buildLookupUrl(bookingCode: string, guestEmail: string): string {
  const params = new URLSearchParams({
    code: bookingCode,
    email: guestEmail,
  });
  return `/lookup?${params.toString()}`;
}

export function buildSuccessPageUrl(payload: Pick<BookingSuccessPayload, 'bookingCode' | 'guestEmail'>): string {
  const params = new URLSearchParams({
    code: payload.bookingCode,
    email: payload.guestEmail,
  });
  return `/booking/success?${params.toString()}`;
}

export function readSuccessParamsFromUrl(searchParams: URLSearchParams): {
  bookingCode: string;
  guestEmail: string;
} | null {
  const bookingCode = searchParams.get('code')?.trim() || '';
  const guestEmail = searchParams.get('email')?.trim() || '';
  if (!bookingCode) return null;
  return { bookingCode, guestEmail };
}

type BookingByCodeResult = {
  bookingByCode: {
    bookingCode: string;
    guestEmail?: string | null;
    totalAmount: number;
    paymentStatus?: string | null;
    status: string;
    tripId: string;
    routeName?: string | null;
    origin?: string | null;
    destination?: string | null;
    operatorName?: string | null;
    departureTime?: string | null;
    passengers: Array<{ fullName: string; seatId: string }>;
  } | null;
};

async function fetchTripBusType(tripId: string): Promise<string> {
  try {
    const data = await gql<{ tripDetail: { busType: string } }>(
      `query($tripId:ID!){ tripDetail(tripId:$tripId){ busType } }`,
      { tripId }
    );
    return data.tripDetail?.busType || '';
  } catch {
    return '';
  }
}

function mapApiBookingToPayload(
  booking: NonNullable<BookingByCodeResult['bookingByCode']>,
  guestEmail: string,
  busType: string
): BookingSuccessPayload {
  const seats = booking.passengers.map((p) => p.seatId);
  const pricing = computePricingFromTicketTotal(booking.totalAmount);

  return normalizeSuccessPayload({
    bookingCode: booking.bookingCode,
    guestEmail: booking.guestEmail || guestEmail,
    passengers: booking.passengers.map((p) => ({
      fullName: p.fullName,
      seatId: p.seatId,
    })),
    seats,
    totalAmount: pricing.grandTotal,
    ticketTotal: pricing.ticketTotal,
    serviceFee: pricing.serviceFee,
    paymentStatus: booking.paymentStatus || booking.status || 'PAID',
    trip: {
      origin: booking.origin || '',
      destination: booking.destination || '',
      routeName: booking.routeName || undefined,
      departureTime: booking.departureTime || '',
      operatorName: booking.operatorName || '',
      busType,
    },
  });
}

export async function fetchBookingSuccessFromApi(
  bookingCode: string,
  guestEmail: string
): Promise<BookingSuccessPayload | null> {
  const normalizedCode = bookingCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!normalizedCode) return null;

  try {
    const data = await gql<BookingByCodeResult>(
      `query($bookingCode:String!,$email:String){
        bookingByCode(bookingCode:$bookingCode,email:$email){
          bookingCode guestEmail totalAmount paymentStatus status tripId
          routeName origin destination operatorName departureTime
          passengers { fullName seatId }
        }
      }`,
      { bookingCode: normalizedCode, email: guestEmail || undefined }
    );

    const booking = data.bookingByCode;
    if (!booking) return null;

    const busType = booking.tripId ? await fetchTripBusType(booking.tripId) : '';
    return mapApiBookingToPayload(booking, guestEmail, busType);
  } catch {
    return null;
  }
}

export function isCompleteSuccessPayload(payload: BookingSuccessPayload | null): payload is BookingSuccessPayload {
  if (!payload?.bookingCode?.trim()) return false;
  if (!payload.guestEmail?.trim()) return false;
  if (!payload.passengers?.length) return false;
  if (!payload.seats?.length) return false;
  return true;
}

export function formatDepartureDate(departureTimeIso: string): string {
  if (!departureTimeIso?.trim()) return '—';
  return formatDisplayDate(departureDateVN(departureTimeIso));
}

export function formatDepartureTime(departureTimeIso: string): string {
  if (!departureTimeIso?.trim()) return '—';
  return departureTimeVN(departureTimeIso);
}
