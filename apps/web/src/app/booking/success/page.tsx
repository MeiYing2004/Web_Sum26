'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Bus,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Search,
  Ticket,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BookingProgress } from '@/components/domain/BookingProgress';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatVnd } from '@/lib/booking-pricing';
import {
  buildLookupUrl,
  clearBookingSuccess,
  fetchBookingSuccessFromApi,
  formatDepartureDate,
  formatDepartureTime,
  isCompleteSuccessPayload,
  readBookingSuccess,
  readSuccessParamsFromUrl,
  type BookingSuccessPayload,
} from '@/lib/booking-success';
import { cn } from '@/lib/cn';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Đã thanh toán',
  TICKET_ISSUED: 'Đã xuất vé',
  PENDING: 'Chờ thanh toán',
  PENDING_PAYMENT: 'Chờ thanh toán',
};

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-micro font-medium text-ink-subtle">{label}</p>
        <div className="mt-0.5 font-medium text-ink">{value}</div>
      </div>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<BookingSuccessPayload | null>(() => readBookingSuccess());
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (resolvedRef.current) return;

    let cancelled = false;

    async function resolvePayload() {
      const fromStorage = readBookingSuccess();
      const urlParams = readSuccessParamsFromUrl(searchParams);

      if (isCompleteSuccessPayload(fromStorage)) {
        if (!fromStorage.trip && urlParams) {
          const fromApi = await fetchBookingSuccessFromApi(
            urlParams.bookingCode,
            urlParams.guestEmail
          );
          if (!cancelled && fromApi) {
            resolvedRef.current = true;
            setPayload({
              ...fromStorage,
              trip: fromApi.trip,
              ticketTotal: fromStorage.ticketTotal || fromApi.ticketTotal,
              serviceFee: fromStorage.serviceFee || fromApi.serviceFee,
              totalAmount: fromStorage.totalAmount || fromApi.totalAmount,
            });
            setReady(true);
            return;
          }
        }
        if (!cancelled) {
          resolvedRef.current = true;
          setPayload(fromStorage);
          setReady(true);
        }
        return;
      }

      if (!urlParams) {
        if (!cancelled) {
          resolvedRef.current = true;
          setPayload(fromStorage);
          setReady(true);
        }
        return;
      }

      const fromApi = await fetchBookingSuccessFromApi(urlParams.bookingCode, urlParams.guestEmail);
      if (!cancelled) {
        resolvedRef.current = true;
        setPayload(fromApi ?? fromStorage);
        setReady(true);
      }
    }

    void resolvePayload();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const copyBookingCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Đã sao chép mã đặt vé');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép mã đặt vé');
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!isCompleteSuccessPayload(payload)) {
    return (
      <div className="mesh-bg flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-light">
            <AlertCircle className="h-7 w-7 text-danger" />
          </div>
          <h1 className="text-title text-ink">Không tìm thấy thông tin đặt vé</h1>
          <p className="mt-2 text-body text-ink-muted">
            Vui lòng tra cứu vé bằng mã đặt vé và email nhận vé.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/lookup">
              <Button>
                <Search className="h-4 w-4" />
                Tra cứu vé
              </Button>
            </Link>
            <Link href="/" onClick={() => clearBookingSuccess()}>
              <Button variant="secondary">
                <Bus className="h-4 w-4" />
                Đặt chuyến mới
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const paymentLabel =
    PAYMENT_STATUS_LABELS[payload.paymentStatus] || payload.paymentStatus || 'Đã thanh toán';
  const lookupHref = buildLookupUrl(payload.bookingCode, payload.guestEmail);
  const trip = payload.trip;
  const routeLabel =
    trip?.origin && trip?.destination
      ? `${trip.origin} → ${trip.destination}`
      : trip?.routeName || '—';

  return (
    <div className="mesh-bg min-h-screen pb-12">
      <div className="page-section page-container max-w-3xl">
        <BookingProgress current="done" className="mb-10" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-100/80" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200">
              <CheckCircle2 className="h-11 w-11 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-display text-ink">🎉 Đặt vé thành công!</h1>
          <p className="mx-auto mt-3 max-w-lg text-body text-ink-muted">
            Thông tin vé đã được gửi tới email của bạn. Bạn có thể tra cứu vé bất kỳ lúc nào.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <Card
            variant="elevated"
            padding="none"
            className="overflow-hidden rounded-3xl shadow-xl shadow-slate-200/60"
          >
            {/* Booking code hero */}
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-6 py-7 sm:px-8 sm:py-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-micro font-semibold uppercase tracking-widest text-white/60">
                    Mã đặt vé
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="font-mono text-2xl font-bold tracking-wide text-white sm:text-3xl">
                      {payload.bookingCode}
                    </p>
                    <button
                      type="button"
                      onClick={() => void copyBookingCode(payload.bookingCode)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-caption font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
                <Badge variant="success" className="shrink-0 border border-white/20 bg-white/15 text-white">
                  {paymentLabel}
                </Badge>
              </div>
            </div>

            <div className="space-y-8 p-6 sm:p-8">
              {/* Trip route highlight */}
              {trip && (
                <div className="rounded-2xl border border-brand/15 bg-gradient-to-r from-brand-50/80 to-indigo-50/50 p-5">
                  <div className="flex items-center gap-2 text-brand">
                    <MapPin className="h-5 w-5" />
                    <span className="text-micro font-semibold uppercase tracking-wide">Tuyến xe</span>
                  </div>
                  <p className="mt-2 text-subtitle font-bold text-ink">{routeLabel}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <InfoRow
                      icon={Calendar}
                      label="Ngày khởi hành"
                      value={formatDepartureDate(trip.departureTime)}
                    />
                    <InfoRow
                      icon={Clock}
                      label="Giờ khởi hành"
                      value={formatDepartureTime(trip.departureTime)}
                    />
                    <InfoRow icon={Bus} label="Nhà xe" value={trip.operatorName || '—'} />
                    <InfoRow icon={Ticket} label="Loại xe" value={trip.busType || '—'} />
                  </div>
                </div>
              )}

              {/* Passenger & contact */}
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoRow icon={Mail} label="Email nhận vé" value={payload.guestEmail} />
                <InfoRow
                  icon={Hash}
                  label="Ghế đã đặt"
                  value={
                    <span className="font-semibold">{payload.seats.join(', ')}</span>
                  }
                />
              </div>

              <div>
                <p className="mb-3 flex items-center gap-2 text-micro font-semibold uppercase tracking-wide text-ink-subtle">
                  <User className="h-4 w-4" />
                  Hành khách
                </p>
                <ul className="space-y-2">
                  {payload.passengers.map((p) => (
                    <li
                      key={`${p.seatId}-${p.fullName}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-surface-sunken px-4 py-3.5"
                    >
                      <span className="font-semibold text-ink">{p.fullName}</span>
                      <Badge variant="brand">{p.seatId}</Badge>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment breakdown */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <p className="mb-4 text-micro font-semibold uppercase tracking-wide text-ink-subtle">
                  Chi tiết thanh toán
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-body">
                    <span className="text-ink-muted">Giá vé</span>
                    <span className="font-semibold text-ink">{formatVnd(payload.ticketTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-body">
                    <span className="text-ink-muted">Phí dịch vụ</span>
                    <span className="font-semibold text-ink">{formatVnd(payload.serviceFee)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-subtitle font-bold text-ink">Tổng cộng</span>
                      <span className="text-title font-bold text-brand">
                        {formatVnd(payload.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Link href={lookupHref} className="sm:flex-1 sm:max-w-xs">
            <Button size="lg" className="w-full bg-gradient-to-r from-brand-600 to-brand-700 shadow-lg shadow-brand/20">
              <Ticket className="h-4 w-4" />
              Xem vé của tôi
            </Button>
          </Link>
          <Link href="/" className="sm:flex-1 sm:max-w-xs" onClick={() => clearBookingSuccess()}>
            <Button size="lg" variant="secondary" className="w-full">
              <Bus className="h-4 w-4" />
              Đặt chuyến mới
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
