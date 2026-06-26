'use client';

import { forwardRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Armchair,
  BadgeCheck,
  Banknote,
  Bus,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Phone,
  Printer,
  RotateCcw,
  ShieldCheck,
  Tag,
  Ticket,
  User,
} from 'lucide-react';
import { CancelBookingButton } from '@/components/domain/CancelBookingButton';
import { BookingReviewActions } from '@/components/domain/BookingReviewActions';
import type { Review } from '@/lib/reviews';
import { TicketQRCode } from '@/components/TicketQRCode';
import { useAuth } from '@/hooks/useAuth';
import {
  type ETicket,
  formatTicketDateTime,
  getBusTypeLabel,
  getTripProgressStatus,
  isTicketValid,
  paymentStatusLabel,
  tripProgressStatusLabel,
} from '@/lib/tickets';
import { buildTripsSearchUrl } from '@/lib/trip-search';
import { departureDateVN } from '@/lib/datetime';

type Props = {
  ticket: ETicket;
  showActions?: boolean;
  compact?: boolean;
  isDetailView?: boolean;
  allowCancel?: boolean;
  onCancelled?: () => void;
  review?: Review | null;
  onReviewSubmitted?: (review: Review) => void;
};

export const ETicketCard = forwardRef<HTMLElement, Props>(function ETicketCard(
  { ticket, showActions = true, compact = false, isDetailView = false, allowCancel = false, onCancelled, review, onReviewSubmitted },
  ref
) {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { date, time } = formatTicketDateTime(ticket.departureTime);
  const booked = formatTicketDateTime(ticket.createdAt);
  const busType = getBusTypeLabel(ticket);
  const tripProgress = getTripProgressStatus(
    ticket.departureTime,
    ticket.arrivalTime,
    ticket.bookingStatus,
    now
  );
  const ticketValid = isTicketValid(ticket);
  const paidAmount = ticket.finalAmount ?? ticket.totalAmount;
  const hasVoucher = (ticket.discountAmount ?? 0) > 0 || !!ticket.voucherCode;
  const rebookUrl = buildTripsSearchUrl(
    ticket.origin,
    ticket.destination,
    departureDateVN(ticket.departureTime)
  );

  function handlePrint() {
    window.print();
  }

  function handleDownloadPdf() {
    window.print();
  }

  const qrSize = compact ? 128 : 168;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={compact ? undefined : { y: -4 }}
      style={{ '--ticket-notch-color': '#eef2ff' } as React.CSSProperties}
      className={`ticket-print-root group relative mx-auto w-full ${
        compact ? 'max-w-2xl' : 'max-w-[1320px]'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-ticket border border-white/60 bg-white/80 shadow-elevated backdrop-blur-xl transition-shadow duration-300 group-hover:shadow-overlay ${
          compact ? '' : 'print:rounded-none print:border-slate-300 print:shadow-none'
        }`}
      >
        <div className="ticket-notch-layer" aria-hidden />

        {/* Premium header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-surface-hero px-6 py-6 sm:px-8 sm:py-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(167,139,250,0.2) 0%, transparent 40%)',
            }}
          />
          <Image
            src="/images/cappy-bus-logo.png"
            alt=""
            width={200}
            height={200}
            className="ticket-watermark"
            aria-hidden
          />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 sm:flex">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-200/90">
                  Cappy Bus
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Vé điện tử
                </h2>
                <p className="mt-1.5 font-mono text-sm text-indigo-100/90">{ticket.bookingCode}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/12 px-4 py-3 text-right backdrop-blur-md ring-1 ring-white/20 transition-all duration-300 hover:bg-white/18">
              <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
                <BadgeCheck className="h-3 w-3" />
                Mã vé
              </p>
              <p className="mt-0.5 font-mono text-base font-bold text-white sm:text-lg">
                {ticket.ticketCode}
              </p>
            </div>
          </div>
        </div>

        <div className="ticket-perforation" aria-hidden />

        {/* Body */}
        <div className="relative bg-white/95 px-5 py-6 sm:px-8 sm:py-8">
          <Image
            src="/images/cappy-bus-logo.png"
            alt=""
            width={180}
            height={180}
            className="ticket-watermark !right-4 !bottom-4 !opacity-[0.04]"
            aria-hidden
          />

          <div
            className={`grid gap-6 lg:gap-8 ${
              compact ? '' : 'lg:grid-cols-[1fr_auto] lg:items-start'
            }`}
          >
            <div className="space-y-5 sm:space-y-6">
              {/* Passenger */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 ring-1 ring-indigo-100/80">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Hành khách
                  </p>
                  <p className="text-lg font-bold text-[#0F172A]">{ticket.passengerName}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <Phone className="h-3.5 w-3.5 text-indigo-400" />
                    {ticket.passengerPhone}
                  </p>
                </div>
              </div>

              {/* Bus thumbnail + route */}
              <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-gradient-to-br from-slate-50/80 to-white ring-1 ring-slate-100/60">
                <div className="grid sm:grid-cols-[140px_1fr]">
                  <div className="relative h-28 sm:h-auto sm:min-h-[120px]">
                    <Image
                      src="/images/hero-bus.png"
                      alt={busType}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="140px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/40 sm:bg-gradient-to-t sm:from-slate-900/30 sm:to-transparent" />
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-base font-bold text-indigo-700">{ticket.routeName}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                        <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
                        {ticket.origin || ticket.pickupPoint}
                      </span>
                      <span className="text-slate-300">→</span>
                      <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                        <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
                        {ticket.destination || ticket.dropoffPoint}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Bus className="h-3.5 w-3.5 text-indigo-400" />
                        {ticket.operatorName}
                        {ticket.busPlate ? ` · ${ticket.busPlate}` : ''}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700 ring-1 ring-indigo-100">
                        <Armchair className="h-3 w-3" />
                        {busType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info grid — Ngày đi / Giờ đi / Ghế / Tổng tiền */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoChip icon={Calendar} label="Ngày đi" value={date} />
                <InfoChip icon={Clock} label="Giờ đi" value={time} />
                <InfoChip icon={Armchair} label="Ghế" value={ticket.seatId} />
                <InfoChip
                  icon={Banknote}
                  label="Tổng tiền"
                  value={`${Math.round(paidAmount).toLocaleString('vi-VN')}đ`}
                  highlight
                />
              </div>

              {hasVoucher && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm">
                  <p className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <Tag className="h-4 w-4" />
                    Voucher đã áp dụng
                  </p>
                  <div className="mt-2 space-y-1 text-caption text-emerald-900/90">
                    {ticket.voucherCode ? (
                      <p>
                        Mã: <span className="font-mono font-bold">{ticket.voucherCode}</span>
                      </p>
                    ) : null}
                    {(ticket.discountAmount ?? 0) > 0 ? (
                      <p>Giảm: -{Math.round(ticket.discountAmount!).toLocaleString('vi-VN')}đ</p>
                    ) : null}
                    <p className="font-semibold">
                      Tổng thanh toán: {Math.round(paidAmount).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              )}

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <StatusPill
                  icon={Banknote}
                  label={paymentStatusLabel(ticket.paymentStatus)}
                  tone={ticket.paymentStatus === 'PAID' ? 'emerald' : 'amber'}
                />
                <StatusPill
                  icon={ShieldCheck}
                  label={ticketValid ? 'Vé hợp lệ' : 'Vé không hợp lệ'}
                  tone={ticketValid ? 'violet' : 'rose'}
                />
                <StatusPill
                  icon={Bus}
                  label={tripProgressStatusLabel(tripProgress)}
                  tone={
                    tripProgress === 'IN_TRANSIT'
                      ? 'sky'
                      : tripProgress === 'COMPLETED'
                        ? 'slate'
                        : tripProgress === 'CANCELLED'
                          ? 'rose'
                          : 'indigo'
                  }
                  pulse={tripProgress === 'IN_TRANSIT'}
                />
                <StatusPill icon={Calendar} label={`Đặt: ${booked.date}`} tone="slate" />
              </div>
            </div>

            {/* QR section */}
            <div className="flex flex-col items-center gap-3 lg:items-center">
              <div className="ticket-body-perforation hidden w-full lg:block" aria-hidden />
              <div className="qr-elevated-card w-full max-w-[220px] rounded-2xl p-4 sm:p-5">
                <TicketQRCode value={ticket.qrCode} size={qrSize} elevated />
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  Quét mã QR để xác minh vé tại bến
                </p>
              </div>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100/80 bg-gradient-to-b from-slate-50/60 to-white/80 px-5 py-4 sm:gap-3 sm:px-8 sm:py-5 print:hidden">
            {!isDetailView && (
              <Link
                href={`/my-tickets/${ticket.bookingCode}`}
                className="ticket-action-btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 hover:shadow-lg hover:shadow-brand/30"
              >
                <ExternalLink className="h-4 w-4" />
                Xem chi tiết
              </Link>
            )}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="ticket-action-btn inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
            >
              <Download className="h-4 w-4" />
              Tải PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="ticket-action-btn inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
            >
              <Printer className="h-4 w-4" />
              In vé
            </button>
            <Link
              href={rebookUrl}
              className="ticket-action-btn inline-flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/80 px-4 py-2.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur-sm hover:border-indigo-300 hover:bg-indigo-100"
            >
              <RotateCcw className="h-4 w-4" />
              Đặt lại chuyến
            </Link>
            {onReviewSubmitted ? (
              <BookingReviewActions
                ticket={ticket}
                review={review}
                onReviewSubmitted={onReviewSubmitted}
              />
            ) : null}
            {allowCancel ? (
              <CancelBookingButton
                ticket={ticket}
                bookingUserId={user?.userId}
                onCancelled={onCancelled}
              />
            ) : null}
          </div>
        )}
      </div>
    </motion.article>
  );
});

function InfoChip({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex h-full min-h-[5.5rem] flex-col justify-between rounded-xl border border-slate-100/80 bg-white/80 p-3.5 ring-1 ring-slate-100/50 transition-shadow duration-200 hover:shadow-sm sm:min-h-[5.75rem] sm:p-4"
    >
      <p className="flex min-h-[2rem] items-start gap-1.5 text-[10px] font-semibold uppercase leading-snug tracking-wide text-slate-400">
        <Icon
          className={`mt-0.5 h-3 w-3 shrink-0 ${highlight ? 'text-brand-500' : 'text-slate-400'}`}
        />
        <span className="line-clamp-2">{label}</span>
      </p>
      <p
        className={`mt-2 text-sm font-bold leading-tight tabular-nums ${
          highlight ? 'text-brand-700' : 'text-[#0F172A]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type StatusTone = 'emerald' | 'indigo' | 'violet' | 'sky' | 'slate' | 'amber' | 'rose';

function StatusPill({
  icon: Icon,
  label,
  tone,
  pulse = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: StatusTone;
  pulse?: boolean;
}) {
  const tones: Record<StatusTone, string> = {
    emerald: 'bg-emerald-50/90 text-emerald-700 ring-emerald-200/80',
    indigo: 'bg-indigo-50/90 text-indigo-700 ring-indigo-200/80',
    violet: 'bg-violet-50/90 text-violet-700 ring-violet-200/80',
    sky: 'bg-sky-50/90 text-sky-700 ring-sky-200/80',
    slate: 'bg-slate-100/90 text-slate-600 ring-slate-200/80',
    amber: 'bg-amber-50/90 text-amber-700 ring-amber-200/80',
    rose: 'bg-rose-50/90 text-rose-700 ring-rose-200/80',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.03] ${tones[tone]} ${
        pulse ? 'animate-pulse' : ''
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
