'use client';

import { ArrowLeft, UserRound } from 'lucide-react';
import { SavedPassengerPicker } from '@/components/domain/SavedPassengerPicker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

export type PassengerDraft = {
  fullName: string;
  phone: string;
  email: string;
  seatId: string;
};

export type BookerInfo = {
  fullName: string;
  phone: string;
  email: string;
};

type Props = {
  selectedSeats: string[];
  booker: BookerInfo;
  onBookerChange: (booker: BookerInfo) => void;
  sameForAll: boolean;
  onSameForAllChange: (value: boolean) => void;
  customizePerSeat: boolean;
  onCustomizePerSeat: () => void;
  passengers: PassengerDraft[];
  onPassengerFieldChange: (
    index: number,
    field: keyof Omit<PassengerDraft, 'seatId'>,
    value: string
  ) => void;
  onBack: () => void;
  className?: string;
};

export function PassengerInfoStep({
  selectedSeats,
  booker,
  onBookerChange,
  sameForAll,
  onSameForAllChange,
  customizePerSeat,
  onCustomizePerSeat,
  passengers,
  onPassengerFieldChange,
  onBack,
  className,
}: Props) {
  const showPreview = sameForAll && !customizePerSeat && booker.fullName.trim();

  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-subtitle text-ink">Thông tin hành khách</h2>
          <p className="mt-1 text-caption text-ink-muted">
            {selectedSeats.length} ghế · {selectedSeats.join(', ')}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Quay lại chọn ghế
        </Button>
      </div>

      <Card variant="elevated" padding="lg" className="rounded-3xl">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <p className="text-caption font-semibold text-ink">Thông tin người đặt</p>
            <p className="text-micro text-ink-muted">Dùng để nhận vé và liên hệ</p>
          </div>
        </div>

        <SavedPassengerPicker
          passengerIndex={0}
          className="mb-4"
          onApply={(data) => onBookerChange({ ...booker, ...data })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ tên" required className="sm:col-span-2">
            <Input
              placeholder="Nguyễn Văn A"
              value={booker.fullName}
              onChange={(e) => onBookerChange({ ...booker, fullName: e.target.value })}
              className="h-11"
            />
          </Field>
          <Field label="Số điện thoại" required>
            <Input
              placeholder="0901234567"
              value={booker.phone}
              onChange={(e) => onBookerChange({ ...booker, phone: e.target.value })}
              className="h-11"
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              placeholder="email@example.com"
              value={booker.email}
              onChange={(e) => onBookerChange({ ...booker, email: e.target.value })}
              className="h-11"
            />
          </Field>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-brand/15 bg-brand-50/50 px-4 py-3 ipe-clickable">
          <input
            type="checkbox"
            checked={sameForAll && !customizePerSeat}
            onChange={(e) => {
              onSameForAllChange(e.target.checked);
              if (e.target.checked) {
                /* parent resets customizePerSeat */
              }
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span className="text-caption text-ink">
            <span className="font-semibold">Sử dụng thông tin này cho tất cả ghế</span>
            <span className="mt-0.5 block text-ink-muted">
              Một hành khách đặt nhiều ghế — không cần nhập lại từng ghế
            </span>
          </span>
        </label>

        {showPreview && (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-surface-sunken p-4">
            <p className="mb-3 text-micro font-semibold uppercase tracking-wide text-ink-subtle">
              Xem trước gán ghế
            </p>
            <ul className="space-y-2">
              {selectedSeats.map((seatId) => (
                <li
                  key={seatId}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-caption"
                >
                  <Badge variant="brand">{seatId}</Badge>
                  <span className="text-ink-muted">→</span>
                  <span className="font-medium text-ink">{booker.fullName}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(!sameForAll || customizePerSeat) && (
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
            <p className="text-caption font-semibold text-ink">Tùy chỉnh từng ghế</p>
            {passengers.map((p, i) => (
              <div key={p.seatId} className="rounded-2xl border border-slate-100 bg-surface-sunken/80 p-4">
                <p className="mb-3 text-micro font-bold uppercase tracking-wide text-brand">
                  Ghế {p.seatId}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Họ tên" required className="sm:col-span-2">
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={p.fullName}
                      onChange={(e) => onPassengerFieldChange(i, 'fullName', e.target.value)}
                    />
                  </Field>
                  <Field label="Số điện thoại" required className="sm:col-span-2">
                    <Input
                      placeholder="0901234567"
                      value={p.phone}
                      onChange={(e) => onPassengerFieldChange(i, 'phone', e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}

        {sameForAll && !customizePerSeat && (
          <button
            type="button"
            onClick={onCustomizePerSeat}
            className="mt-4 text-caption font-semibold text-brand underline-offset-2 hover:underline"
          >
            Tùy chỉnh từng ghế
          </button>
        )}
      </Card>
    </div>
  );
}
