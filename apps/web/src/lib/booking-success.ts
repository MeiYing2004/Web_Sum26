import { gql } from '@/lib/graphql';
import { splitGrandTotal } from '@/lib/booking-pricing';
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
  guestEmail?: string;
  guestPhone?: string;
  passengers: BookingSuccessPassenger[];
  seats: string[];
  totalAmount: number;
  ticketTotal: number;
  serviceFee: number;
  discountAmount?: number;
  voucherCode?: string;
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
  if (payload.discountAmount && payload.discountAmount > 0) {
    const ticketTotal = payload.ticketTotal > 0 ? payload.ticketTotal : splitGrandTotal(payload.totalAmount).ticketTotal;
    const serviceFee = payload.serviceFee > 0 ? payload.serviceFee : splitGrandTotal(payload.totalAmount).serviceFee;
    const grandTotal = ticketTotal - payload.discountAmount + serviceFee;
    return {
      ...payload,
      ticketTotal,
      serviceFee,
      totalAmount: grandTotal,
    };
  }
  if (payload.ticketTotal > 0 && payload.serviceFee > 0) {
    return {
      ...payload,
      totalAmount: payload.ticketTotal + payload.serviceFee,
    };
  }
  const split = splitGrandTotal(payload.totalAmount);
  return {
    ...payload,
    ticketTotal: split.ticketTotal,
    serviceFee: split.serviceFee,
    totalAmount: split.grandTotal,
  };
}

export function clearBookingSuccess(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(BOOKING_SUCCESS_KEY);
}

export function buildLookupUrl(
  bookingCode: string,
  guestEmail?: string,
  guestPhone?: string
): string {
  const params = new URLSearchParams({ code: bookingCode });
  const email = guestEmail?.trim();
  const phone = guestPhone?.trim();
  if (email) params.set('email', email);
  else if (phone) params.set('phone', phone);
  return `/lookup?${params.toString()}`;
}

export function buildSuccessPageUrl(
  payload: Pick<BookingSuccessPayload, 'bookingCode' | 'guestEmail' | 'guestPhone'>
): string {
  const params = new URLSearchParams({ code: payload.bookingCode });
  const email = payload.guestEmail?.trim();
  const phone = payload.guestPhone?.trim();
  if (email) params.set('email', email);
  else if (phone) params.set('phone', phone);
  return `/booking/success?${params.toString()}`;
}

export function readSuccessParamsFromUrl(searchParams: URLSearchParams): {
  bookingCode: string;
  guestEmail: string;
  guestPhone: string;
} | null {
  const bookingCode = searchParams.get('code')?.trim() || '';
  const guestEmail = searchParams.get('email')?.trim() || '';
  const guestPhone = searchParams.get('phone')?.trim() || '';
  if (!bookingCode) return null;
  return { bookingCode, guestEmail, guestPhone };
}

type BookingByCodeResult = {
  bookingByCode: {
    bookingCode: string;
    guestEmail?: string | null;
    totalAmount: number;
    ticketSubtotal?: number | null;
    serviceFee?: number | null;
    discountAmount?: number | null;
    voucherCode?: string | null;
    finalAmount?: number | null;
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
  busType: string,
  guestPhone?: string
): BookingSuccessPayload {
  const seats = booking.passengers.map((p) => p.seatId);
  const ticketTotal =
    booking.ticketSubtotal != null && booking.ticketSubtotal > 0
      ? booking.ticketSubtotal
      : splitGrandTotal(booking.totalAmount).ticketTotal;
  const serviceFee =
    booking.serviceFee != null && booking.serviceFee >= 0
      ? booking.serviceFee
      : splitGrandTotal(booking.totalAmount).serviceFee;
  const discountAmount = booking.discountAmount ?? 0;
  const grandTotal = booking.finalAmount ?? ticketTotal - discountAmount + serviceFee;

  return normalizeSuccessPayload({
    bookingCode: booking.bookingCode,
    guestEmail: booking.guestEmail || guestEmail || undefined,
    guestPhone: guestPhone?.trim() || undefined,
    passengers: booking.passengers.map((p) => ({
      fullName: p.fullName,
      seatId: p.seatId,
    })),
    seats,
    totalAmount: grandTotal,
    ticketTotal,
    serviceFee,
    discountAmount: discountAmount > 0 ? discountAmount : undefined,
    voucherCode: booking.voucherCode || undefined,
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
  guestEmail?: string,
  guestPhone?: string
): Promise<BookingSuccessPayload | null> {
  const normalizedCode = bookingCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!normalizedCode) return null;

  const email = guestEmail?.trim() || undefined;
  const phone = guestPhone?.trim() || undefined;

  try {
    const data = await gql<BookingByCodeResult>(
      `query($bookingCode:String!,$email:String,$phone:String){
        bookingByCode(bookingCode:$bookingCode,email:$email,phone:$phone){
          bookingCode guestEmail totalAmount ticketSubtotal serviceFee discountAmount voucherCode finalAmount
          paymentStatus status tripId
          routeName origin destination operatorName departureTime
          passengers { fullName seatId }
        }
      }`,
      {
        bookingCode: normalizedCode,
        email: email?.toLowerCase() || null,
        phone: phone || null,
      }
    );

    const booking = data.bookingByCode;
    if (!booking) return null;

    const busType = booking.tripId ? await fetchTripBusType(booking.tripId) : '';
    return mapApiBookingToPayload(booking, guestEmail || '', busType, guestPhone);
  } catch {
    return null;
  }
}

export function isCompleteSuccessPayload(payload: BookingSuccessPayload | null): payload is BookingSuccessPayload {
  if (!payload?.bookingCode?.trim()) return false;
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
