import type { ETicket } from './tickets';
import { getTripProgressStatus, parseValidDate } from './tickets';

export type Review = {
  id: string;
  bookingId: string;
  userId: string;
  tripId: string;
  reviewerName: string;
  routeName: string;
  routeLabel: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const REVIEW_FIELDS = `
  id bookingId userId tripId reviewerName routeName routeLabel rating comment createdAt
`;

export function isTripCompletedForReview(ticket: ETicket, now: Date = new Date()): boolean {
  const cancelled = ticket.bookingStatus === 'CANCELLED' || ticket.bookingStatus === 'EXPIRED';
  if (cancelled) return false;

  if (ticket.bookingStatus === 'CHECKED_IN' || ticket.bookingStatus === 'COMPLETED') {
    return true;
  }

  const progress = getTripProgressStatus(
    ticket.departureTime,
    ticket.arrivalTime,
    ticket.bookingStatus,
    now
  );
  if (progress === 'COMPLETED') return true;

  const dep = parseValidDate(ticket.departureTime);
  return !!dep && dep.getTime() < now.getTime();
}

export function canReviewTrip(ticket: ETicket, now: Date = new Date()): boolean {
  return getReviewUnavailableReason(ticket, now) === null;
}

/** Giải thích vì sao chưa đánh giá được — `null` nghĩa là có thể đánh giá. */
export function getReviewUnavailableReason(ticket: ETicket, now: Date = new Date()): string | null {
  const cancelled = ticket.bookingStatus === 'CANCELLED' || ticket.bookingStatus === 'EXPIRED';
  if (cancelled) return 'Vé đã hủy — không thể đánh giá';

  const issued = ['PAID', 'TICKET_ISSUED', 'CHECKED_IN', 'COMPLETED'].includes(ticket.bookingStatus);
  const paid = ticket.paymentStatus === 'PAID' || issued;
  if (!paid) return 'Chưa thanh toán — không thể đánh giá';

  if (!isTripCompletedForReview(ticket, now)) {
    return 'Chuyến chưa hoàn thành — đánh giá sau khi đi xong';
  }

  return null;
}

export function reviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
  }
  return (parts[0] || 'KH').slice(0, 2).toUpperCase();
}

export function publicReviewerName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] || 'Khách hàng';
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last[0]}.`;
}
