'use client';

import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchSavedPassengers, type SavedPassenger } from '@/lib/saved-passengers';
import { cn } from '@/lib/cn';

type PassengerDraft = {
  fullName: string;
  phone: string;
  email: string;
  seatId: string;
};

type Props = {
  passengerIndex: number;
  onApply: (data: Pick<PassengerDraft, 'fullName' | 'phone' | 'email'>) => void;
  className?: string;
};

export function SavedPassengerPicker({ passengerIndex, onApply, className }: Props) {
  const { isLoggedIn, getToken } = useAuth();
  const [passengers, setPassengers] = useState<SavedPassenger[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setPassengers([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSavedPassengers(getToken() ?? undefined)
      .then((list) => {
        if (!cancelled) setPassengers(list);
      })
      .catch(() => {
        if (!cancelled) setPassengers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, getToken]);

  if (!isLoggedIn || (!loading && passengers.length === 0)) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-ink-subtle">
        <UserRound className="h-3.5 w-3.5" />
        Hành khách thường dùng
      </p>
      {loading ? (
        <p className="text-caption text-ink-muted">Đang tải...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {passengers.map((p) => (
            <button
              key={`${passengerIndex}-${p.id}`}
              type="button"
              onClick={() =>
                onApply({ fullName: p.fullName, phone: p.phone, email: p.email })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-left text-caption transition hover:border-brand/40 hover:bg-brand-50"
            >
              <span className="font-semibold text-ink">{p.fullName}</span>
              <span className="mt-0.5 block text-micro text-ink-muted">{p.phone}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
