import { formatAdminDate, formatAdminDateTime } from './admin-datetime';
import { formatVnd } from './admin-dashboard';

export type CheckInPassenger = {
  fullName: string;
  seatId: string;
};

export type CheckInPreview = {
  found: boolean;
  canCheckIn: boolean;
  invalidReason?: string | null;
  ticketCode?: string | null;
  bookingCode?: string | null;
  status?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  buyerEmail?: string | null;
  passengers: CheckInPassenger[];
  seatCount: number;
  routeName?: string | null;
  operatorName?: string | null;
  busPlate?: string | null;
  departureTime?: string | null;
  pickupPoint?: string | null;
  dropoffPoint?: string | null;
  ticketSubtotal?: number | null;
  serviceFee?: number | null;
  voucherCode?: string | null;
  voucherName?: string | null;
  discountAmount?: number | null;
  finalAmount?: number | null;
  checkedInAt?: string | null;
  checkedInByUserId?: string | null;
};

export const ADMIN_CHECKIN_PREVIEW_QUERY = `
  query AdminCheckInPreview($ref: String!) {
    adminCheckInPreview(ref: $ref) {
      found
      canCheckIn
      invalidReason
      ticketCode
      bookingCode
      status
      buyerName
      buyerPhone
      buyerEmail
      passengers { fullName seatId }
      seatCount
      routeName
      operatorName
      busPlate
      departureTime
      pickupPoint
      dropoffPoint
      ticketSubtotal
      serviceFee
      voucherCode
      voucherName
      discountAmount
      finalAmount
      checkedInAt
      checkedInByUserId
    }
  }
`;

export function parseCheckInRef(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get('bookingCode') || url.searchParams.get('code');
    if (fromQuery) return fromQuery.trim();
  } catch {
    /* not a URL */
  }

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { bookingCode?: string; ticketCode?: string };
      if (parsed.bookingCode) return parsed.bookingCode.trim();
      if (parsed.ticketCode) return parsed.ticketCode.trim();
    } catch {
      /* not JSON */
    }
  }

  const jsonMatch = trimmed.match(/"bookingCode"\s*:\s*"([^"]+)"/i);
  if (jsonMatch) return jsonMatch[1];

  const ticketMatch = trimmed.match(/"ticketCode"\s*:\s*"([^"]+)"/i);
  if (ticketMatch) return ticketMatch[1];

  if (trimmed.includes('|')) return trimmed.split('|')[0].trim();

  const composite = splitCompositeTicketRef(trimmed);
  if (composite.seatId) return composite.bookingRef;

  return trimmed;
}

/** Admin table shows multi-seat ticket refs as BOOKINGCODE-SEAT. */
export function splitCompositeTicketRef(ref: string): { bookingRef: string; seatId?: string } {
  const trimmed = ref.trim();
  const lastDash = trimmed.lastIndexOf('-');
  if (lastDash > 0) {
    const suffix = trimmed.slice(lastDash + 1);
    if (/^[A-Z]{1,2}\d{1,2}$/i.test(suffix)) {
      return { bookingRef: trimmed.slice(0, lastDash), seatId: suffix.toUpperCase() };
    }
  }
  return { bookingRef: trimmed };
}

export function checkInStatusLabel(preview: CheckInPreview): string {
  const status = preview.status ?? '';
  if (status === 'CHECKED_IN' || status === 'COMPLETED' || preview.invalidReason === 'already_checked_in') {
    return 'Đã check-in';
  }
  if (preview.invalidReason === 'refunded' || (status === 'CANCELLED' && preview.invalidReason === 'refunded')) {
    return 'Vé đã hoàn tiền';
  }
  if (status === 'CANCELLED' || preview.invalidReason === 'cancelled') {
    return 'Vé đã hủy';
  }
  if (status === 'TICKET_ISSUED' || status === 'PAID') {
    return 'Chưa check-in';
  }
  return status;
}

export function checkInInvalidMessage(preview: CheckInPreview): string {
  if (!preview.found || preview.invalidReason === 'not_found') {
    return 'Không tìm thấy vé với mã đã nhập. Thử mã booking (TK...) hoặc mã vé đầy đủ từ bảng đơn hàng.';
  }
  if (preview.invalidReason === 'empty_ref') {
    return 'Vui lòng nhập mã booking hoặc quét mã QR.';
  }
  if (preview.invalidReason === 'already_checked_in') {
    const when = preview.checkedInAt ? formatAdminDateTime(preview.checkedInAt) : '';
    return when
      ? `Vé đã được check-in lúc ${when}`
      : 'Vé đã được check-in. Không thể check-in lần nữa.';
  }
  if (preview.invalidReason === 'refunded') {
    return 'Vé đã được hoàn tiền. Không thể check-in.';
  }
  if (preview.invalidReason === 'cancelled') {
    return 'Vé đã bị hủy. Không thể check-in.';
  }
  if (preview.invalidReason === 'expired') {
    return 'Vé đã hết hạn thanh toán. Không thể check-in.';
  }
  if (preview.invalidReason === 'not_ready') {
    return 'Vé chưa sẵn sàng check-in (chưa thanh toán hoặc chưa xuất vé).';
  }
  return 'Vé không hợp lệ để check-in.';
}

export function formatCheckInDateTime(iso?: string | null): string {
  if (!iso) return '—';
  return formatAdminDateTime(iso);
}

export function formatCheckInDate(iso?: string | null): string {
  if (!iso) return '—';
  return formatAdminDate(iso);
}

export function formatCheckInTime(iso?: string | null): string {
  if (!iso) return '—';
  const formatted = formatAdminDateTime(iso);
  const parts = formatted.split(' ');
  return parts.length > 1 ? parts[1] : formatted;
}

export { formatVnd };
