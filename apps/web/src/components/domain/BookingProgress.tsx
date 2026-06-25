'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export const BOOKING_STEPS = [
  { id: 'trip', label: 'Chọn chuyến' },
  { id: 'seat', label: 'Chọn ghế' },
  { id: 'passenger', label: 'Thông tin' },
  { id: 'payment', label: 'Thanh toán' },
  { id: 'done', label: 'Hoàn tất' },
] as const;

export type BookingStepId = (typeof BOOKING_STEPS)[number]['id'];

export function BookingProgress({
  current,
  className,
}: {
  current: BookingStepId;
  className?: string;
}) {
  const currentIndex = BOOKING_STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Tiến trình đặt vé" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {BOOKING_STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const upcoming = i > currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-micro font-bold transition-all duration-300',
                    done && 'bg-brand text-white shadow-card',
                    active && 'bg-brand text-white shadow-elevated ring-4 ring-brand/20',
                    upcoming && 'bg-surface-sunken text-ink-subtle'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'hidden text-micro font-medium sm:block',
                    active ? 'text-brand' : done ? 'text-ink' : 'text-ink-subtle'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < BOOKING_STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full transition-colors duration-300',
                    i < currentIndex ? 'bg-brand' : 'bg-slate-200'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
