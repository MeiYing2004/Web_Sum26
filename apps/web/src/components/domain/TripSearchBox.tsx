'use client';

import { useState } from 'react';
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
  catalogLocations?: string[];
  destCatalogLocations?: string[];
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
  catalogLocations = [],
  destCatalogLocations,
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
  const [openField, setOpenField] = useState<'origin' | 'destination' | null>(null);

  return (
    <div
      className={cn(
        isHero
          ? 'search-box-premium'
          : 'rounded-xl border border-border bg-white p-4 shadow-card',
        className
      )}
    >
      <div
        className={cn(
          'grid gap-3',
          isHero ? 'sm:grid-cols-[1fr_auto_1fr_auto_auto]' : 'sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_auto]'
        )}
      >
        <div className="relative">
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-subtle">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand">
              <MapPin className="h-4 w-4" />
            </span>
            Điểm đi
          </label>
          <LocationField
            value={originQuery}
            onChange={onOriginChange}
            suggestions={originSuggestions}
            catalogLocations={catalogLocations}
            onPick={onOriginPick}
            placeholder="Nơi đi"
            icon="origin"
            isOpen={openField === 'origin'}
            onOpenChange={(open) => setOpenField(open ? 'origin' : null)}
          />
        </div>

        {onSwap && (
          <div className={cn('flex items-end', isHero ? 'pb-1' : 'pb-0 sm:items-end')}>
            <button
              type="button"
              onClick={() => {
                setOpenField(null);
                onSwap?.();
              }}
              aria-label="Đổi chiều"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-ink-muted transition-all hover:border-brand/30 hover:bg-brand-50 hover:text-brand hover:shadow-sm"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="relative">
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-subtle">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <MapPin className="h-4 w-4" />
            </span>
            Điểm đến
          </label>
          <LocationField
            value={destQuery}
            onChange={onDestChange}
            suggestions={destSuggestions}
            catalogLocations={destCatalogLocations ?? catalogLocations}
            onPick={onDestPick}
            placeholder="Nơi đến"
            icon="destination"
            isOpen={openField === 'destination'}
            onOpenChange={(open) => setOpenField(open ? 'destination' : null)}
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-subtle">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand">
              <Calendar className="h-4 w-4" />
            </span>
            Ngày đi
          </label>
          <Input
            type="date"
            value={travelDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-12"
          />
        </div>

        <div className={cn('flex items-end', isHero ? '' : 'sm:col-span-2 lg:col-span-1')}>
          <Button
            type="button"
            onClick={onSearch}
            disabled={loading}
            size="lg"
            className={cn(
              'btn-ripple h-12 w-full text-base font-semibold',
              isHero && 'bg-gradient-to-r from-brand-600 to-brand-500 shadow-search hover:shadow-search-hover'
            )}
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
