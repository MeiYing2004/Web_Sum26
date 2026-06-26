'use client';

import { useState } from 'react';
import { CheckCircle2, Info, Star } from 'lucide-react';
import type { ETicket } from '@/lib/tickets';
import type { Review } from '@/lib/reviews';
import { getReviewUnavailableReason } from '@/lib/reviews';
import { useAuth } from '@/hooks/useAuth';
import { TripReviewModal } from '@/components/domain/TripReviewModal';
import { Button } from '@/components/ui/Button';

type Props = {
  ticket: ETicket;
  review?: Review | null;
  onReviewSubmitted: (review: Review) => void;
};

export function BookingReviewActions({ ticket, review, onReviewSubmitted }: Props) {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const unavailableReason = getReviewUnavailableReason(ticket);

  if (review) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="h-4 w-4" />
        Đã đánh giá
      </span>
    );
  }

  if (unavailableReason) {
    return (
      <span
        title={unavailableReason}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500"
      >
        <Info className="h-4 w-4 shrink-0" />
        {unavailableReason}
      </span>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="ticket-action-btn inline-flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-2.5 text-sm font-semibold text-amber-900 shadow-sm hover:border-amber-300 hover:bg-amber-100"
      >
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        Đánh giá chuyến đi
      </Button>
      <TripReviewModal
        ticket={ticket}
        reviewerName={user?.fullName}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={onReviewSubmitted}
      />
    </>
  );
}
