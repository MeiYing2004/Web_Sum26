'use client';

import { Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { publicReviewerName, reviewerInitials } from '@/lib/reviews';
import { cn } from '@/lib/cn';

export type ReviewCardData = {
  id: string;
  reviewerName: string;
  routeLabel: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewCardProps = {
  review: ReviewCardData;
  index?: number;
  className?: string;
};

function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Thẻ đánh giá — avatar, 5 sao, tuyến, ngày đi */
export function ReviewCard({ review, index = 0, className }: ReviewCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        'flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5" aria-label={`${review.rating} sao`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
              )}
            />
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 text-caption text-ink-subtle">
          <Calendar className="h-3.5 w-3.5" />
          Ngày đi: {formatReviewDate(review.createdAt)}
        </span>
      </div>

      <p className="mt-1 text-sm font-medium text-brand">{review.routeLabel}</p>

      <p className="mt-4 flex-1 text-base leading-relaxed text-ink-muted">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-700 ring-2 ring-white">
          {reviewerInitials(review.reviewerName)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{publicReviewerName(review.reviewerName)}</p>
          <p className="truncate text-caption text-ink-muted">Khách hàng Cappy Bus</p>
        </div>
      </div>
    </motion.article>
  );
}
