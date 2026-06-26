'use client';

import { useState } from 'react';
import { Loader2, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';
import type { ETicket } from '@/lib/tickets';
import type { Review } from '@/lib/reviews';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Props = {
  ticket: ETicket;
  reviewerName?: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: (review: Review) => void;
};

export function TripReviewModal({ ticket, reviewerName, open, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSubmitting(true);
    try {
      const data = await gql<{
        submitReview: { success: boolean; message: string; review: Review | null };
      }>(
        `mutation($bookingId:ID!,$rating:Int!,$comment:String!,$reviewerName:String){
          submitReview(bookingId:$bookingId,rating:$rating,comment:$comment,reviewerName:$reviewerName){
            success message review { id bookingId rating comment createdAt reviewerName routeLabel }
          }
        }`,
        {
          bookingId: ticket.bookingId,
          rating,
          comment: comment.trim(),
          reviewerName: reviewerName || null,
        }
      );
      if (data.submitReview.success && data.submitReview.review) {
        toast.success('Cảm ơn bạn đã đánh giá chuyến đi!');
        onSubmitted(data.submitReview.review);
        onClose();
        setComment('');
        setRating(5);
      } else {
        toast.error(data.submitReview.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-overlay">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-subtitle font-bold text-ink">Đánh giá chuyến đi</h3>
            <p className="mt-1 text-caption text-ink-muted">
              {ticket.routeName} · {ticket.bookingCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-caption font-medium text-ink">Chất lượng chuyến xe</p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              const active = value <= (hoverRating || rating);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                  aria-label={`${value} sao`}
                >
                  <Star
                    className={cn(
                      'h-8 w-8',
                      active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="review-comment" className="text-caption font-medium text-ink">
            Nhận xét của bạn
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Chia sẻ trải nghiệm về chuyến xe, dịch vụ, đúng giờ..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-body text-ink outline-none ring-brand/20 transition focus:border-brand focus:ring-2"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="button" className="flex-1" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </div>
      </div>
    </div>
  );
}
