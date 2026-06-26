'use client';

import { AlertCircle, CheckCircle2, TicketCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  type CheckInPreview,
  checkInInvalidMessage,
  checkInStatusLabel,
  formatCheckInDate,
  formatCheckInTime,
  formatVnd,
} from '@/lib/admin-checkin';

type Props = {
  open: boolean;
  onClose: () => void;
  preview: CheckInPreview | null;
  loading: boolean;
  confirming: boolean;
  onConfirm: () => void;
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 sm:text-right">{value?.trim() || '—'}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{title}</h3>
      <dl className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">{children}</dl>
    </section>
  );
}

export function CheckInPreviewModal({ open, onClose, preview, loading, confirming, onConfirm }: Props) {
  const statusLabel = preview ? checkInStatusLabel(preview) : '';
  const invalidMessage = preview ? checkInInvalidMessage(preview) : '';
  const alreadyCheckedIn = preview?.invalidReason === 'already_checked_in';
  const showConfirm = Boolean(preview?.found && preview.canCheckIn);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xác nhận Check-in"
      description="Kiểm tra thông tin vé trước khi xác nhận check-in hành khách"
      size="lg"
      closeOnOverlayClick={false}
      className="max-h-[90vh] overflow-y-auto"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm">Đang tải thông tin vé...</p>
        </div>
      ) : !preview ? null : !preview.found ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{invalidMessage}</p>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              showConfirm
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : alreadyCheckedIn
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {showConfirm ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">Trạng thái: {statusLabel}</p>
                <Badge
                  variant="outline"
                  className={
                    showConfirm
                      ? 'border-emerald-300 bg-white text-emerald-700'
                      : alreadyCheckedIn
                        ? 'border-amber-300 bg-white text-amber-700'
                        : 'border-rose-300 bg-white text-rose-700'
                  }
                >
                  {preview.status}
                </Badge>
              </div>
              {!showConfirm ? <p className="text-sm">{invalidMessage}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Section title="Người mua">
              <InfoRow label="Họ tên" value={preview.buyerName} />
              <InfoRow label="Số điện thoại" value={preview.buyerPhone} />
              <InfoRow label="Email" value={preview.buyerEmail} />
            </Section>

            <Section title="Hành khách">
              {preview.passengers.map((p) => (
                <InfoRow key={`${p.seatId}-${p.fullName}`} label={p.fullName} value={`Ghế ${p.seatId}`} />
              ))}
              <InfoRow label="Số lượng ghế" value={String(preview.seatCount)} />
            </Section>
          </div>

          <Section title="Chuyến xe">
            <InfoRow label="Mã vé" value={preview.ticketCode} />
            <InfoRow label="Mã booking" value={preview.bookingCode} />
            <InfoRow label="Tuyến xe" value={preview.routeName} />
            <InfoRow label="Nhà xe" value={preview.operatorName} />
            <InfoRow label="Biển số xe" value={preview.busPlate} />
            <InfoRow label="Ngày khởi hành" value={formatCheckInDate(preview.departureTime)} />
            <InfoRow label="Giờ khởi hành" value={formatCheckInTime(preview.departureTime)} />
            <InfoRow label="Điểm đón" value={preview.pickupPoint} />
            <InfoRow label="Điểm trả" value={preview.dropoffPoint} />
          </Section>

          <Section title="Thanh toán">
            <InfoRow label="Giá vé" value={formatVnd(preview.ticketSubtotal ?? 0)} />
            <InfoRow label="Phí dịch vụ" value={formatVnd(preview.serviceFee ?? 0)} />
            <InfoRow
              label="Voucher"
              value={preview.voucherCode ? `${preview.voucherCode}${preview.voucherName ? ` — ${preview.voucherName}` : ''}` : 'Không có'}
            />
            <InfoRow label="Số tiền giảm" value={formatVnd(preview.discountAmount ?? 0)} />
            <InfoRow label="Tổng thanh toán" value={formatVnd(preview.finalAmount ?? 0)} />
          </Section>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={confirming}>
              Đóng
            </Button>
            {showConfirm ? (
              <Button onClick={onConfirm} disabled={confirming} className="gap-2">
                <TicketCheck className="h-4 w-4" />
                {confirming ? 'Đang xác nhận...' : 'Xác nhận Check-in'}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
