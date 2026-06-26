'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReviewCard, type ReviewCardData } from '@/components/domain/ReviewCard';
import { SkeletonReviewCard } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

type ReviewsSectionProps = {
  reviews: ReviewCardData[];
  loading?: boolean;
  className?: string;
};

/** Carousel đánh giá — avatar, sao, tuyến, ngày đi */
export function ReviewsSection({ reviews, loading, className }: ReviewsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);

    const cardWidth = el.firstElementChild?.clientWidth ?? 320;
    const gap = 24;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, reviews.length - 1));
  }, [reviews.length]);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [reviews, updateScrollButtons]);

  useEffect(() => {
    if (loading || reviews.length <= 1) return;
    const timer = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8;
      el.scrollBy({ left: atEnd ? -el.scrollWidth : 340, behavior: 'smooth' });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loading, reviews.length]);

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div className={cn('flex gap-6 overflow-hidden', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonReviewCard key={i} className="w-full min-w-[300px] shrink-0 sm:min-w-[340px]" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollRef}
        className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((r, i) => (
          <ReviewCard key={r.id} review={r} index={i} className="w-[85vw] min-w-[300px] shrink-0 sm:min-w-[340px] lg:min-w-[380px]" />
        ))}
      </div>

      {reviews.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-muted shadow-sm transition hover:border-brand/30 hover:text-brand disabled:opacity-40"
            aria-label="Xem trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  const card = el.children[i] as HTMLElement | undefined;
                  card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                }}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === activeIndex ? 'w-6 bg-brand' : 'w-2 bg-slate-300'
                )}
                aria-label={`Đánh giá ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink-muted shadow-sm transition hover:border-brand/30 hover:text-brand disabled:opacity-40"
            aria-label="Xem tiếp"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
