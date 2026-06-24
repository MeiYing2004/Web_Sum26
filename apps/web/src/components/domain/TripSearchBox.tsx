'use client';

import { ArrowLeftRight, Calendar, MapPin, Search } from 'lucide-react';
import { LocationField } from '@/components/domain/LocationField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

export interface TripSearchBoxProps {
  originQuery: string;
  destQuery: string;
  travelDate: string;
  originSuggestions: Array<{ name: string }>;
  destSuggestions: Array<{ name: string }>;
  loading?: boolean;
  onOriginChange: (v: string) => void;
  onDestChange: (v: string) => void;
  onOriginPick: (name: string) => void;
  onDestPick: (name: string) => void;
  onDateChange: (date: string) => void;
  onSearch: () => void;
  onSwap?: () => void;
  variant?: 'hero' | 'inline';
  className?: string;
}

export function TripSearchBox({
  originQuery,
  destQuery,
  travelDate,
  originSuggestions,
  destSuggestions,
  loading,
  onOriginChange,
  onDestChange,
  onOriginPick,
  onDestPick,
  onDateChange,
  onSearch,
  onSwap,
  variant = 'inline',
  className,
}: TripSearchBoxProps) {
  const isHero = variant === 'hero';

  return (
    <div className={cn(isHero ? 'search-box-premium' : 'rounded-xl border border-slate-200/80 bg-white p-4 shadow-card', className)}>
      <div className={cn('grid gap-2', isHero ? 'sm:grid-cols-[1fr_auto_1fr_auto_auto]' : 'sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_auto]')}>
        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-ink-subtle">
            <MapPin className="h-3 w-3 text-brand" />
            Điểm đi
          </label>
          <LocationField
            value={originQuery}
            onChange={onOriginChange}
            suggestions={originSuggestions}
            onPick={onOriginPick}
            placeholder="Nơi đi"
            icon="origin"
          />
        </div>

        {onSwap && (
          <div className={cn('flex items-end', isHero ? 'pb-1' : 'pb-0 sm:items-end')}>
            <button
              type="button"
              onClick={onSwap}
              aria-label="Đổi chiều"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-surface-sunken text-ink-muted transition-all hover:border-brand/30 hover:bg-brand-50 hover:text-brand"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-ink-subtle">
            <MapPin className="h-3 w-3 text-accent" />
            Điểm đến
          </label>
          <LocationField
            value={destQuery}
            onChange={onDestChange}
            suggestions={destSuggestions}
            onPick={onDestPick}
            placeholder="Nơi đến"
            icon="destination"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wide text-ink-subtle">
            <Calendar className="h-3 w-3 text-brand" />
            Ngày đi
          </label>
          <Input
            type="date"
            value={travelDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-11"
          />
        </div>

        <div className={cn('flex items-end', isHero ? '' : 'sm:col-span-2 lg:col-span-1')}>
          <Button
            type="button"
            onClick={onSearch}
            disabled={loading}
            size="lg"
            className={cn('h-11 w-full', isHero && 'bg-gradient-to-r from-brand-600 to-brand-700 shadow-elevated')}
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            {loading ? 'Đang tìm...' : 'Tìm chuyến'}
          </Button>
        </div>
      </div>
    </div>
  );
}
