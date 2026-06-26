'use client';

import Link from 'next/link';
import { ArrowRight, Bus, Route, Star, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export type OperatorCardData = {
  name: string;
  rating: number;
  trips: string;
  tripCount: number;
  badge: string;
  routes?: readonly string[];
  yearsActive?: number;
  onTimeRate?: number;
  satisfactionRate?: number;
  priceFrom?: number;
};

type OperatorCardProps = {
  operator: OperatorCardData;
  index?: number;
  travelDate?: string;
  className?: string;
  /** Chỉ hiện sao đánh giá khi có review thật */
  showRating?: boolean;
};

const BADGE_STYLES: Record<string, string> = {
  'Bán chạy': 'bg-orange-100 text-orange-700 ring-orange-200',
  'Uy tín': 'bg-blue-100 text-brand-700 ring-blue-200',
  'Giá tốt': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Premium: 'bg-amber-100 text-amber-700 ring-amber-200',
};

/** Card nhà xe nổi bật — đầy đủ thông tin, hai nút CTA */
export function OperatorCard({ operator, index = 0, travelDate, className, showRating = true }: OperatorCardProps) {
  const routesHref = operator.routes?.[0]
    ? `/trips?origin=TP.HCM&destination=${encodeURIComponent(operator.routes[0])}${travelDate ? `&date=${travelDate}` : ''}`
    : '/trips';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        'group flex min-h-[380px] flex-col rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:border-brand/20 hover:shadow-elevated',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-md">
          {operator.name.charAt(0)}
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-micro font-semibold ring-1',
            BADGE_STYLES[operator.badge] ?? 'bg-slate-100 text-ink-muted ring-slate-200'
          )}
        >
          {operator.badge}
        </span>
      </div>

      <h3 className="mt-5 text-card-title font-bold text-ink">{operator.name}</h3>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {showRating && operator.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-ink">{operator.rating}</span>
            <span className="text-caption text-ink-subtle">đánh giá</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-caption text-ink-muted">
          <Bus className="h-4 w-4 text-brand" />
          {operator.tripCount}+ chuyến/ngày
        </div>
      </div>

      {operator.priceFrom != null && (
        <p className="mt-3 text-sm text-ink-muted">
          Giá từ{' '}
          <span className="font-bold text-brand">{operator.priceFrom.toLocaleString('vi-VN')}đ</span>
        </p>
      )}

      {operator.routes && operator.routes.length > 0 && (
        <p className="mt-2 text-caption text-ink-muted">
          <Route className="mr-1 inline h-3.5 w-3.5 text-brand" />
          Tuyến nổi bật: {operator.routes.join(', ')}
        </p>
      )}

      {operator.satisfactionRate != null && (
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
          <div className="col-span-3 text-center sm:col-span-1">
            <p className="flex items-center justify-center gap-0.5 text-lg font-bold text-ink">
              <ThumbsUp className="h-3.5 w-3.5 text-brand" />
              {operator.satisfactionRate}%
            </p>
            <p className="text-micro text-ink-subtle">hài lòng</p>
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link href="/about" className="flex-1">
          <Button variant="secondary" size="sm" className="h-10 w-full border-border">
            Chi tiết
          </Button>
        </Link>
        <Link href={routesHref} className="flex-1">
          <Button size="sm" className="btn-ripple h-10 w-full bg-gradient-to-r from-brand-600 to-brand-500">
            Xem tuyến
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
