import type { Booking, Passenger, Review } from './generated/client';
import { PrismaClient } from './generated/client';
import { BOOKING_STATUS } from '@bus/shared';

const PAID_STATUSES = [
  BOOKING_STATUS.PAID,
  BOOKING_STATUS.TICKET_ISSUED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.COMPLETED,
];

const MIN_TRIP_HOURS_BEFORE_REVIEW = 8;

type BookingWithPassengers = Booking & { passengers: Passenger[] };

export function toReviewDetail(review: Review) {
  return {
    id: review.id,
    booking_id: review.bookingId,
    user_id: review.userId,
    trip_id: review.tripId,
    reviewer_name: review.reviewerName,
    route_name: review.routeName,
    origin: review.origin,
    destination: review.destination,
    rating: review.rating,
    comment: review.comment,
    created_at: review.createdAt.toISOString(),
  };
}

export function routeLabel(origin: string, destination: string, routeName?: string): string {
  if (origin && destination) return `${origin} → ${destination}`;
  return routeName || 'Tuyến xe';
}

export function isBookingTripCompleted(booking: Pick<Booking, 'status' | 'departureTime'>): boolean {
  const cancelled = booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.EXPIRED;
  if (cancelled) return false;

  if (booking.status === BOOKING_STATUS.CHECKED_IN || booking.status === BOOKING_STATUS.COMPLETED) {
    return true;
  }

  const dep = new Date(booking.departureTime).getTime();
  if (Number.isNaN(dep)) return false;

  const hoursSinceDep = (Date.now() - dep) / (1000 * 60 * 60);
  return hoursSinceDep >= MIN_TRIP_HOURS_BEFORE_REVIEW;
}

export function assertReviewEligible(booking: BookingWithPassengers, userId: string): string | null {
  if (!booking.userId || booking.userId !== userId) {
    return 'Bạn không có quyền đánh giá đặt vé này';
  }
  if (!PAID_STATUSES.includes(booking.status as (typeof PAID_STATUSES)[number])) {
    return 'Chỉ có thể đánh giá sau khi thanh toán thành công';
  }
  if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.EXPIRED) {
    return 'Không thể đánh giá vé đã hủy hoặc hết hạn';
  }
  if (!isBookingTripCompleted(booking)) {
    return 'Chuyến đi chưa hoàn thành — vui lòng đánh giá sau khi kết thúc chuyến';
  }
  return null;
}

export function normalizeRating(rating: number): number | null {
  const value = Math.round(Number(rating));
  if (!Number.isFinite(value) || value < 1 || value > 5) return null;
  return value;
}

export function normalizeComment(comment: string): string {
  return comment.trim().slice(0, 1000);
}

export function reviewerDisplayName(booking: BookingWithPassengers, reviewerName?: string): string {
  const fromInput = reviewerName?.trim();
  if (fromInput) return fromInput.slice(0, 120);
  const passenger = booking.passengers[0];
  if (passenger?.fullName?.trim()) return passenger.fullName.trim();
  return 'Khách hàng';
}

export async function submitReview(
  prisma: PrismaClient,
  input: {
    bookingId: string;
    userId: string;
    reviewerName?: string;
    rating: number;
    comment: string;
  }
) {
  const rating = normalizeRating(input.rating);
  if (rating === null) {
    return { success: false, message: 'Điểm đánh giá phải từ 1 đến 5 sao', review: null };
  }

  const comment = normalizeComment(input.comment);
  if (!comment) {
    return { success: false, message: 'Vui lòng nhập nội dung đánh giá', review: null };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { passengers: true, review: true },
  });
  if (!booking) {
    return { success: false, message: 'Không tìm thấy đặt vé', review: null };
  }
  if (booking.review) {
    return { success: false, message: 'Bạn đã đánh giá chuyến đi này', review: toReviewDetail(booking.review) };
  }

  const eligibilityError = assertReviewEligible(booking, input.userId);
  if (eligibilityError) {
    return { success: false, message: eligibilityError, review: null };
  }

  try {
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        userId: input.userId,
        tripId: booking.tripId,
        reviewerName: reviewerDisplayName(booking, input.reviewerName),
        routeName: booking.routeName,
        origin: booking.origin,
        destination: booking.destination,
        rating,
        comment,
      },
    });

    return { success: true, message: 'Cảm ơn bạn đã đánh giá chuyến đi', review: toReviewDetail(review) };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      return { success: false, message: 'Bạn đã đánh giá chuyến đi này', review: null };
    }
    throw err;
  }
}

export async function getReviewByBooking(prisma: PrismaClient, bookingId: string, userId?: string) {
  const review = await prisma.review.findUnique({ where: { bookingId } });
  if (!review) return null;
  if (userId && review.userId !== userId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: { userId: true } });
    if (!booking || booking.userId !== userId) return null;
  }
  return toReviewDetail(review);
}

export async function listUserReviews(prisma: PrismaClient, userId: string) {
  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return reviews.map(toReviewDetail);
}

export async function listTripReviews(prisma: PrismaClient, tripId: string, limit = 20) {
  const reviews = await prisma.review.findMany({
    where: { tripId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 50),
  });
  return reviews.map(toReviewDetail);
}

export async function listFeaturedReviews(prisma: PrismaClient, limit = 6) {
  const reviews = await prisma.review.findMany({
    where: { comment: { not: '' } },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 12),
  });
  return reviews.map(toReviewDetail);
}

export async function getTripRatingSummary(prisma: PrismaClient, tripId: string) {
  const agg = await prisma.review.aggregate({
    where: { tripId },
    _avg: { rating: true },
    _count: { id: true },
  });
  return {
    trip_id: tripId,
    average_rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    review_count: agg._count.id,
  };
}

/** Tỷ lệ khách hài lòng: đánh giá >= 4 sao / tổng đánh giá */
export async function getReviewSatisfactionStats(prisma: PrismaClient) {
  const total = await prisma.review.count();
  if (total === 0) {
    return { total_reviews: 0, satisfied_reviews: 0, satisfaction_percent: undefined };
  }
  const satisfied = await prisma.review.count({ where: { rating: { gte: 4 } } });
  const satisfaction_percent = Math.round((satisfied / total) * 1000) / 10;
  return { total_reviews: total, satisfied_reviews: satisfied, satisfaction_percent };
}

/** Đánh giá trung bình theo tên nhà xe (từ booking.operatorName) */
export async function getOperatorReviewSummaries(prisma: PrismaClient) {
  const reviews = await prisma.review.findMany({
    include: { booking: { select: { operatorName: true } } },
  });

  const map = new Map<string, { total: number; sum: number; satisfied: number }>();
  for (const review of reviews) {
    const name = review.booking.operatorName?.trim();
    if (!name) continue;
    const entry = map.get(name) ?? { total: 0, sum: 0, satisfied: 0 };
    entry.total += 1;
    entry.sum += review.rating;
    if (review.rating >= 4) entry.satisfied += 1;
    map.set(name, entry);
  }

  return [...map.entries()].map(([operator_name, stats]) => ({
    operator_name,
    average_rating: Math.round((stats.sum / stats.total) * 10) / 10,
    review_count: stats.total,
    satisfaction_percent: Math.round((stats.satisfied / stats.total) * 1000) / 10,
  }));
}
