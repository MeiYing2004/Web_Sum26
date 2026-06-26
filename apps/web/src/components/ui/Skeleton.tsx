import { cn } from '@/lib/cn';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-200/70', className)}
      aria-hidden
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-card border border-slate-100 bg-white p-5 shadow-card', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho trang chủ — Hero */
export function SkeletonHero({ className }: SkeletonProps) {
  return (
    <div className={cn('relative min-h-[650px] overflow-hidden bg-slate-200', className)}>
      <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-slate-300/80 to-slate-100" />
      <div className="relative z-10 mx-auto flex max-w-container flex-col items-center px-4 pb-16 pt-14">
        <Skeleton className="h-8 w-64 rounded-full" />
        <Skeleton className="mt-6 h-12 w-full max-w-xl" />
        <Skeleton className="mt-3 h-6 w-full max-w-md" />
        <div className="mt-10 w-full max-w-5xl rounded-3xl border border-white/80 bg-white p-6 shadow-search">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho tuyến phổ biến */
export function SkeletonPopularRoute({ className }: SkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-white shadow-soft', className)}>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Skeleton cho nhà xe */
export function SkeletonOperatorCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-6 shadow-soft', className)}>
      <div className="flex items-start justify-between">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-6 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
}

/** Skeleton cho voucher */
export function SkeletonVoucherCard({ className }: SkeletonProps) {
  return (
    <div className={cn('flex min-w-[320px] overflow-hidden rounded-2xl border border-border bg-white shadow-soft', className)}>
      <Skeleton className="w-28 shrink-0 rounded-none" />
      <div className="flex-1 space-y-3 p-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton cho review */
export function SkeletonReviewCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white p-6 shadow-soft', className)}>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-4 rounded-sm" />
        ))}
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho thẻ chuyến xe (trang tìm chuyến) */
export function SkeletonTripCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl border border-slate-100 bg-white p-5 shadow-card', className)}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-28 w-full shrink-0 rounded-xl sm:w-36" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho trang chi tiết chuyến */
export function SkeletonTripDetail({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho danh sách vé */
export function SkeletonTicketList({ count = 2, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="h-48" />
      ))}
    </div>
  );
}
