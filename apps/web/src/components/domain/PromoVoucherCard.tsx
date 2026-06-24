'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgePercent,
  CalendarClock,
  CircleDollarSign,
  Copy,
  CopyCheck,
  Gift,
  Leaf,
  ShieldCheck,
  TicketPercent,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { Promotion } from '@/lib/marketing';

const PROMO_ICONS: Record<Promotion['kind'], LucideIcon> = {
  'new-user': BadgePercent,
  'round-trip': TicketPercent,
  weekend: Leaf,
};

const PROMO_ACCENTS: Record<
  Promotion['kind'],
  {
    bar: string;
    iconWrap: string;
    badge: string;
    code: string;
    cta: string;
  }
> = {
  'new-user': {
    bar: 'bg-brand',
    iconWrap: 'bg-brand-100 text-brand-700',
    badge: 'border border-brand-200 bg-brand-50 text-brand-800',
    code: 'text-brand-700',
    cta: 'bg-brand hover:bg-brand-700',
  },
  'round-trip': {
    bar: 'bg-violet-600',
    iconWrap: 'bg-violet-100 text-violet-700',
    badge: 'border border-violet-200 bg-violet-50 text-violet-800',
    code: 'text-violet-700',
    cta: 'bg-violet-600 hover:bg-violet-700',
  },
  weekend: {
    bar: 'bg-emerald-600',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    badge: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
    code: 'text-emerald-700',
    cta: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export interface PromoVoucherCardProps {
  promo: Promotion;
  index?: number;
  copied?: boolean;
  onCopy: (code: string) => void;
}

export function PromoVoucherCard({ promo, index = 0, copied, onCopy }: PromoVoucherCardProps) {
  const PromoIcon = PROMO_ICONS[promo.kind];
  const accent = PROMO_ACCENTS[promo.kind];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group flex w-[86vw] min-w-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated md:w-auto md:min-w-0"
    >
      <div className={cn('h-1.5 w-full', accent.bar)} />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', accent.iconWrap)}>
            <PromoIcon className="h-6 w-6" strokeWidth={2} />
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-micro font-semibold',
              accent.badge
            )}
          >
            HSD {promo.validUntil}
          </span>
        </div>

        <p className="mt-4 text-micro font-bold uppercase tracking-[0.2em] text-ink-muted">
          {promo.eyebrow}
        </p>
        <p className="mt-2 text-3xl font-black tracking-tight text-ink">{promo.discountValue}</p>
        <h3 className="mt-1 text-lg font-bold text-ink">{promo.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{promo.desc}</p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Mã giảm giá
              </p>
              <p className={cn('mt-1 font-mono text-2xl font-black tracking-[0.14em]', accent.code)}>
                {promo.code}
              </p>
            </div>
            <Gift className="h-7 w-7 shrink-0 text-ink-subtle" aria-hidden />
          </div>

          <dl className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <dt className="inline-flex shrink-0 items-center gap-1.5 text-ink-muted">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Điều kiện
              </dt>
              <dd className="max-w-[210px] text-right font-medium text-ink">{promo.condition}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                <CircleDollarSign className="h-3.5 w-3.5" aria-hidden />
                Giảm tối đa
              </dt>
              <dd className="font-semibold text-ink">{promo.maxDiscount}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-ink-muted">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                Hạn sử dụng
              </dt>
              <dd className="font-semibold text-ink">{promo.validUntil}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="h-11 flex-1 border-slate-200 bg-white text-ink hover:border-brand/30 hover:bg-brand-50 hover:text-brand"
            onClick={() => onCopy(promo.code)}
          >
            {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Đã sao chép' : 'Sao chép mã'}
          </Button>
          <Link href={`/trips?promo=${encodeURIComponent(promo.code)}`} className="flex flex-1">
            <Button
              type="button"
              className={cn('h-11 w-full text-white shadow-card', accent.cta)}
            >
              Áp dụng ngay
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
