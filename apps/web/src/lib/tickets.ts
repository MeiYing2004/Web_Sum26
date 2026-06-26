export type ETicket = {
  id: string;
  ticketCode: string;
  bookingId: string;
  bookingCode: string;
  tripId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  seatId: string;
  routeName: string;
  origin: string;
  destination: string;
  operatorName: string;
  pickupPoint: string;
  dropoffPoint: string;
  departureTime: string;
  arrivalTime?: string;
  busPlate: string;
  busType?: string;
  totalAmount: number;
  ticketSubtotal?: number;
  serviceFee?: number;
  discountAmount?: number;
  voucherCode?: string;
  finalAmount?: number;
  paymentStatus: string;
  bookingStatus: string;
  qrCode: string;
  createdAt: string;
};

/** Must match `ETicket` in services/api-gateway/src/schema.graphql */
export const ETICKET_FIELDS = `
  id ticketCode bookingId bookingCode tripId
  passengerName passengerPhone passengerEmail seatId
  routeName origin destination operatorName
  pickupPoint dropoffPoint departureTime
  busPlate totalAmount ticketSubtotal serviceFee discountAmount voucherCode finalAmount
  paymentStatus bookingStatus qrCode createdAt
`;

export type TicketFilter = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export const TICKET_FILTER_OPTIONS: { value: TicketFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'UPCOMING', label: 'Sắp khởi hành' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export function groupTicketsByBooking(tickets: ETicket[]): Map<string, ETicket[]> {
  const map = new Map<string, ETicket[]>();
  for (const t of tickets) {
    const list = map.get(t.bookingId) ?? [];
    list.push(t);
    map.set(t.bookingId, list);
  }
  return map;
}

export function parseValidDate(iso: string | undefined | null): Date | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTicketDateTime(iso: string): { date: string; time: string } {
  const d = parseValidDate(iso);
  if (!d) return { date: '—', time: '—' };
  return {
    date: d.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    time: d.toLocaleTimeString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PAID: 'Đã thanh toán',
    PENDING: 'Chờ thanh toán',
    FAILED: 'Thất bại',
  };
  return map[status] || status;
}

export function bookingStatusLabel(status: string): string {
  const map: Record<string, string> = {
    TICKET_ISSUED: 'Đã xuất vé',
    PAID: 'Đã thanh toán',
    CHECKED_IN: 'Đã check-in',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn',
  };
  return map[status] || status;
}

export type TripProgressStatus = 'UPCOMING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

const DEFAULT_TRIP_DURATION_HOURS = 8;

export function getTripProgressStatus(
  departureTime: string,
  arrivalTime?: string | null,
  bookingStatus?: string,
  now: Date = new Date()
): TripProgressStatus {
  if (bookingStatus === 'CANCELLED' || bookingStatus === 'EXPIRED') {
    return 'CANCELLED';
  }
  if (bookingStatus === 'COMPLETED' || bookingStatus === 'CHECKED_IN') {
    return 'COMPLETED';
  }

  const dep = parseValidDate(departureTime);
  if (!dep) return 'UPCOMING';

  const nowMs = now.getTime();
  const depMs = dep.getTime();

  if (nowMs < depMs) return 'UPCOMING';

  if (arrivalTime) {
    const arr = parseValidDate(arrivalTime);
    if (arr) {
      const arrMs = arr.getTime();
      if (nowMs >= arrMs) return 'COMPLETED';
      return 'IN_TRANSIT';
    }
  }

  const hoursSinceDep = (nowMs - depMs) / (1000 * 60 * 60);
  if (hoursSinceDep >= DEFAULT_TRIP_DURATION_HOURS) return 'COMPLETED';
  return 'IN_TRANSIT';
}

export function tripProgressStatusLabel(status: TripProgressStatus): string {
  const map: Record<TripProgressStatus, string> = {
    UPCOMING: 'Chưa khởi hành',
    IN_TRANSIT: 'Đang chạy',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return map[status];
}

export function isTicketValid(ticket: ETicket): boolean {
  const cancelled = ticket.bookingStatus === 'CANCELLED' || ticket.bookingStatus === 'EXPIRED';
  const paid = ticket.paymentStatus === 'PAID';
  const issued = ['TICKET_ISSUED', 'PAID', 'CHECKED_IN', 'COMPLETED'].includes(ticket.bookingStatus);
  return paid && issued && !cancelled;
}

export const CANCELLATION_POLICY =
  'Theo chính sách hủy vé nội bộ: Hủy trước 24 giờ được hoàn 80% giá vé. Hủy trong vòng 24 giờ không được hoàn tiền.';

export type CancelEligibility = {
  canCancel: boolean;
  reason?: string;
  policyNote: string;
  refundHint?: string;
};

export function getCancelEligibility(ticket: ETicket, now: Date = new Date()): CancelEligibility {
  const policyNote = CANCELLATION_POLICY;

  if (ticket.bookingStatus === 'CANCELLED' || ticket.bookingStatus === 'EXPIRED') {
    return { canCancel: false, reason: 'Đơn đặt vé đã hủy hoặc hết hạn', policyNote };
  }
  if (!['PAID', 'TICKET_ISSUED'].includes(ticket.bookingStatus)) {
    return { canCancel: false, reason: 'Chỉ hủy được vé đã thanh toán', policyNote };
  }
  if (ticket.paymentStatus !== 'PAID') {
    return { canCancel: false, reason: 'Vé chưa được thanh toán', policyNote };
  }

  const dep = parseValidDate(ticket.departureTime);
  if (!dep || dep.getTime() <= now.getTime()) {
    return { canCancel: false, reason: 'Chuyến đã khởi hành — không thể hủy', policyNote };
  }

  const hoursUntil = (dep.getTime() - now.getTime()) / (1000 * 60 * 60);
  const refundHint =
    hoursUntil >= 24
      ? 'Hoàn 80% giá vé khi hủy trước 24 giờ'
      : 'Hủy trong vòng 24 giờ: không hoàn tiền';

  return { canCancel: true, policyNote, refundHint };
}

export function getBusTypeLabel(ticket: ETicket): string {
  if (ticket.busType?.trim()) return ticket.busType.trim();
  return 'Xe khách liên tỉnh';
}
