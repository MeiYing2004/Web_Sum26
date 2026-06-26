'use client';

import { useEffect, useState } from 'react';
import { Bus, MapPin, Shield, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  fetchPlatformStats,
  formatSatisfactionPercent,
  formatStatNumber,
  type PlatformStats,
} from '@/lib/platform-stats';
import { AnimatedCounter } from '@/components/marketing/AnimatedCounter';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

type StatItem = {
  key: keyof Pick<PlatformStats, 'tripsToday' | 'customers' | 'operators' | 'provinces'>;
  label: string;
  icon: typeof Bus;
};

const STAT_ITEMS: StatItem[] = [
  { key: 'tripsToday', label: 'Chuyến mỗi ngày', icon: Bus },
  { key: 'customers', label: 'Khách hàng', icon: Users },
  { key: 'operators', label: 'Nhà xe', icon: Shield },
  { key: 'provinces', label: 'Tỉnh thành', icon: MapPin },
];

const ICON_COLORS = [
  'bg-blue-100 text-brand-600',
  'bg-violet-100 text-violet-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
] as const;

/** Section thống kê hệ thống — dữ liệu thật từ GraphQL platformStats */
export function StatsSection({ className }: { className?: string }) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPlatformStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được thống kê');
          setStats(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showSatisfaction = stats?.hasSatisfactionData && stats.satisfactionPercent != null;

  return (
    <section className={cn('page-section page-container', className)} aria-label="Thống kê hệ thống">
      {error && !loading && (
        <p className="mb-4 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-center text-caption text-danger">
          {error}
        </p>
      )}

      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5',
          showSatisfaction || loading ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
        )}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="stat-card flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:min-h-[200px]"
              >
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="mt-4 h-9 w-24" />
                <Skeleton className="mt-2 h-4 w-28" />
              </div>
            ))
          : stats &&
            STAT_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="stat-card card-hover-lift flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-card sm:min-h-[200px]"
                >
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full shadow-sm',
                      ICON_COLORS[i % ICON_COLORS.length]
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <AnimatedCounter
                    value={formatStatNumber(stats[item.key])}
                    className="mt-4 text-[2.25rem] font-bold leading-none tracking-tight text-brand"
                  />
                  <p className="mt-2 text-sm text-ink-muted">{item.label}</p>
                </motion.div>
              );
            })}

        {!loading && showSatisfaction && stats && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="stat-card card-hover-lift flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-card sm:min-h-[200px]"
          >
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full shadow-sm',
                ICON_COLORS[4]
              )}
            >
              <Star className="h-6 w-6" aria-hidden />
            </div>
            <AnimatedCounter
              value={formatSatisfactionPercent(stats.satisfactionPercent!)}
              className="mt-4 text-[2.25rem] font-bold leading-none tracking-tight text-brand"
            />
            <p className="mt-2 text-sm text-ink-muted">Khách hài lòng</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
