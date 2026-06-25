'use client';

import { ArrowRight, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

type Props = {
  busPlate: string;
  selectedSeats: string[];
  ticketTotal: number;
  serviceFee: number;
  grandTotal: number;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
  children?: React.ReactNode;
  className?: string;
};

function SummaryRow({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn('text-caption', muted ? 'text-ink-subtle' : 'text-ink-muted')}>{label}</span>
      <span
        className={cn(
          'text-caption text-right',
          bold ? 'text-subtitle font-bold text-ink' : 'font-semibold text-ink'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function BookingSeatSummary({
  busPlate,
  selectedSeats,
  ticketTotal,
  serviceFee,
  grandTotal,
  actionLabel,
  onAction,
  actionDisabled,
  children,
  className,
}: Props) {
  const hasSeats = selectedSeats.length > 0;

  return (
    <Card variant="elevated" padding="md" className={cn('rounded-3xl', className)}>
      <h3 className="text-subtitle text-ink">Tóm tắt đặt vé</h3>
      <p className="mt-0.5 text-caption text-ink-muted">Xe {busPlate}</p>

      {hasSeats && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedSeats.map((seatId) => (
            <Badge key={seatId} variant="brand">
              {seatId}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <SummaryRow label="Số lượng ghế" value={hasSeats ? String(selectedSeats.length) : '—'} />
        <SummaryRow label="Ghế đã chọn" value={hasSeats ? selectedSeats.join(', ') : '—'} />
        <SummaryRow
          label="Giá vé"
          value={ticketTotal ? `${ticketTotal.toLocaleString('vi-VN')}đ` : '—'}
        />
        <SummaryRow
          label="Phí dịch vụ"
          value={ticketTotal ? `${serviceFee.toLocaleString('vi-VN')}đ` : '—'}
          muted
        />
        <div className="border-t border-slate-100 pt-3">
          <SummaryRow
            label="Tổng cộng"
            value={grandTotal ? `${grandTotal.toLocaleString('vi-VN')}đ` : '—'}
            bold
          />
        </div>
      </div>

      {children}

      <Button
        type="button"
        size="lg"
        disabled={actionDisabled}
        onClick={onAction}
        className="mt-5 w-full"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-micro text-ink-subtle">
        <Shield className="h-3.5 w-3.5" />
        Thanh toán an toàn & bảo mật
      </p>
    </Card>
  );
}
