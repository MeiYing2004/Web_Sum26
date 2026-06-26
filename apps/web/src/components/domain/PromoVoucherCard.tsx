'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgePercent,
  CalendarClock,
  Copy,
  CopyCheck,
  Leaf,
  ShieldCheck,
  TicketPercent,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { VoucherQR } from '@/components/marketing/VoucherQR';
import { cn } from '@/lib/cn';
import type { Promotion } from '@/lib/marketing';
import { daysUntilExpiry, voucherUsagePercent } from '@/lib/marketing-content';

const PROMO_ICONS: Record<Promotion['kind'], LucideIcon> = {
  'new-user': BadgePercent,
  'round-trip': TicketPercent,
  weekend: Leaf,
};

const PROMO_THEMES: Record<
  Promotion['kind'],
  {
    strip: string;
    iconWrap: string;
    progress: string;
    cta: string;
  }
> = {
  'new-user': {
    strip: 'bg-gradient-to-b from-brand-600 to-brand-500',
    iconWrap: 'bg-white/20 text-white',
    progress: 'bg-brand-500',
    cta: 'bg-brand-600 hover:bg-brand-700',
  },
  'round-trip': {
    strip: 'bg-gradient-to-b from-violet-600 to-violet-500',
    iconWrap: 'bg-white/20 text-white',
    progress: 'bg-violet-500',
    cta: 'bg-violet-600 hover:bg-violet-700',
  },
  weekend: {
    strip: 'bg-gradient-to-b from-emerald-600 to-emerald-500',
    iconWrap: 'bg-white/20 text-white',
    progress: 'bg-emerald-500',
    cta: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export interface PromoVoucherCardProps {
  promo: Promotion;
  index?: number;
  copied?: boolean;
  onCopy: (code: string) => void;
}

/** Card voucher dạng coupon — QR, mã giảm, progress, điều kiện */
export function PromoVoucherCard({ promo, index = 0, copied, onCopy }: PromoVoucherCardProps) {
  const PromoIcon = PROMO_ICONS[promo.kind];
  const theme = PROMO_THEMES[promo.kind];
  const daysLeft = daysUntilExpiry(promo.validUntil);
  const usagePercent = voucherUsagePercent(promo.code);
  const remainingPercent = Math.max(0, 100 - usagePercent);
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="coupon-card group flex w-[86vw] min-w-[340px] flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated md:w-auto md:min-w-0"
    >
      <div className="flex min-h-[280px] flex-1">
        {/* Strip trái — màu coupon */}
        <div
          className={cn(
            'voucher-perforation relative flex w-28 shrink-0 flex-col items-center justify-center gap-3 px-3 py-6 text-white',
            theme.strip
          )}
        >
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', theme.iconWrap)}>
            <PromoIcon className="h-5 w-5" strokeWidth={2} />
          </div>
          <VoucherQR code={promo.code} size={64} />
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/90">
            {promo.eyebrow}
          </p>
        </div>

        {/* Nội dung phải */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-black tracking-tight text-ink">{promo.discountValue}</p>
              <h3 className="mt-1 text-base font-bold text-ink">{promo.title}</h3>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold',
                isExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-ink-muted'
              )}
            >
              {isExpiringSoon ? `${daysLeft} ngày` : promo.validUntil}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{promo.desc}</p>

          {/* Progress còn lại */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-micro text-ink-subtle">
              <span>Còn lại {remainingPercent}%</span>
              <span>{usagePercent}% đã dùng</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn('h-full rounded-full transition-all', theme.progress)}
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
          </div>

          {/* Mã giảm */}
          <div className="mt-4 rounded-xl border border-dashed border-border bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Mã giảm giá</p>
            <p className="mt-1 font-mono text-xl font-black tracking-wider text-brand">{promo.code}</p>
          </div>

          <div className="mt-3 flex items-start gap-1.5 text-caption text-ink-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span>{promo.condition}</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-caption text-ink-subtle">
            <CalendarClock className="h-3.5 w-3.5" />
            HSD: {promo.validUntil} · {promo.maxDiscount}
          </div>

          <div className="mt-auto flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-10 flex-1 border-border"
              onClick={() => onCopy(promo.code)}
            >
              {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </Button>
            <Link href={`/trips?promo=${encodeURIComponent(promo.code)}`} className="flex-1">
              <Button type="button" size="sm" className={cn('btn-ripple h-10 w-full text-white', theme.cta)}>
                Áp dụng
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
