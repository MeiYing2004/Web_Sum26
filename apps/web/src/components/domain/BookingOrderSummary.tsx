'use client';

import Image from 'next/image';
import { CreditCard, Shield } from 'lucide-react';
import { formatVnd } from '@/lib/booking-pricing';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

type Props = {
  seats: string[];
  paymentMethodLabel?: string;
  ticketSubtotal: number;
  serviceFee: number;
  discountAmount: number;
  finalAmount: number;
  voucherCode?: string;
  className?: string;
};

export function BookingOrderSummary({
  seats,
  paymentMethodLabel,
  ticketSubtotal,
  serviceFee,
  discountAmount,
  finalAmount,
  voucherCode,
  className,
}: Props) {
  return (
    <Card variant="elevated" padding="none" className={cn('overflow-hidden rounded-2xl', className)}>
      <div className="relative h-32">
        <Image src="/images/bus-limousine.jpg" alt="" fill className="object-cover" sizes="360px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-5">
          <p className="text-micro font-medium uppercase tracking-wide text-white/70">Tóm tắt đơn hàng</p>
          <p className="text-subtitle font-bold text-white">{seats.length} ghế đã chọn</p>
        </div>
      </div>
      <div className="p-5">
        <div className="space-y-3 text-body">
          <div className="flex justify-between">
            <span className="text-ink-muted">Ghế</span>
            <span className="font-semibold text-ink">{seats.join(', ')}</span>
          </div>
          {paymentMethodLabel && (
            <div className="flex justify-between">
              <span className="text-ink-muted">Phương thức</span>
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <CreditCard className="h-3.5 w-3.5 text-brand" />
                {paymentMethodLabel}
              </span>
            </div>
          )}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-muted">Giá vé</span>
              <span className="font-semibold text-ink">{formatVnd(ticketSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Phí dịch vụ</span>
              <span className="font-semibold text-ink">{formatVnd(serviceFee)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>
                  Voucher{voucherCode ? ` (${voucherCode})` : ''}
                </span>
                <span className="font-semibold">-{formatVnd(discountAmount)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-200 pt-3">
            <span className="text-subtitle font-bold text-ink">Tổng thanh toán</span>
            <span className="text-title font-bold text-brand">{formatVnd(finalAmount)}</span>
          </div>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="flex items-center gap-1.5 text-micro text-ink-subtle">
            <Shield className="h-3.5 w-3.5 text-brand" />
            Thanh toán được mã hóa SSL 256-bit
          </p>
        </div>
      </div>
    </Card>
  );
}
