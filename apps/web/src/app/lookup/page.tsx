'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Bus,
  Calendar,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Search,
  Ticket,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';
import { useAuth } from '@/hooks/useAuth';
import { CancelBookingButton } from '@/components/domain/CancelBookingButton';
import type { ETicket } from '@/lib/tickets';

type Passenger = {
  fullName: string;
  phone: string;
  email: string;
  seatId: string;
};

type Booking = {
  id: string;
  bookingCode: string;
  status: string;
  tripId: string;
  totalAmount: number;
  userId?: string | null;
  passengers: Passenger[];
  createdAt: string;
  routeName?: string;
  origin?: string;
  destination?: string;
  operatorName?: string;
  departureTime?: string;
  paymentStatus?: string;
};

type TripDetail = {
  routeName: string;
  origin: string;
  destination: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
};

export default function LookupPage() {
  return (
    <Suspense fallback={<LookupSkeleton />}>
      <LookupContent />
    </Suspense>
  );
}

function LookupContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ code?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const autoLookupDone = useRef(false);

  useEffect(() => {
    const codeParam = searchParams.get('code')?.trim() || '';
    const emailParam = searchParams.get('email')?.trim() || '';
    if (codeParam) setCode(codeParam);
    if (emailParam) setEmail(emailParam);
    if (codeParam && !autoLookupDone.current) {
      autoLookupDone.current = true;
      void runLookup(codeParam, emailParam || undefined);
    }
  }, [searchParams]);

  function validateValues(bookingCode: string, lookupEmail?: string) {
    const next: typeof errors = {};
    const c = bookingCode.trim();
    if (!c) next.code = 'Vui lòng nhập mã vé';
    else if (!/^(BK|TK)[A-Z0-9]{4,}$/i.test(c.replace(/[^A-Za-z0-9]/g, ''))) {
      next.code = 'Mã vé không hợp lệ (VD: TKMQRPNMD3JMM)';
    }
    if (lookupEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lookupEmail)) next.email = 'Email không hợp lệ';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function runLookup(bookingCode: string, lookupEmail?: string) {
    if (!validateValues(bookingCode, lookupEmail)) return;

    setLoading(true);
    setSearched(true);
    setBooking(null);
    setTrip(null);
    setErrorMsg('');

    const normalizedCode = bookingCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    try {
      const data = await gql<{ bookingByCode: Booking }>(
        `query($bookingCode:String!,$email:String){
          bookingByCode(bookingCode:$bookingCode,email:$email){
            id bookingCode status tripId totalAmount createdAt userId
            routeName origin destination operatorName departureTime paymentStatus
            passengers { fullName phone email seatId }
          }
        }`,
        { bookingCode: normalizedCode, email: lookupEmail?.trim().toLowerCase() || null }
      );
      setBooking(data.bookingByCode);
      toast.success('Tra cứu thành công!');

      if (data.bookingByCode.routeName && data.bookingByCode.departureTime) {
        setTrip({
          routeName: data.bookingByCode.routeName || '',
          origin: data.bookingByCode.origin || '',
          destination: data.bookingByCode.destination || '',
          operatorName: data.bookingByCode.operatorName || '',
          busType: '',
          departureTime: data.bookingByCode.departureTime,
          arrivalTime: '',
        });
      } else {
        try {
          const tripData = await gql<{ tripDetail: TripDetail }>(
            `query($tripId:ID!){
              tripDetail(tripId:$tripId){
                routeName origin destination operatorName busType departureTime arrivalTime
              }
            }`,
            { tripId: data.bookingByCode.tripId }
          );
          setTrip(tripData.tripDetail);
        } catch {
          /* trip detail optional */
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tìm thấy vé';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    await runLookup(code.trim(), email.trim() || undefined);
  }

  return (
    <div className="mesh-bg min-h-[calc(100vh-80px)]">
      <div className="page-container py-8 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-display text-ink">Tra cứu vé</h1>
            <p className="mt-2 text-body text-ink-muted">
              Nhập mã đặt vé để xem thông tin chi tiết và vé điện tử
            </p>
          </div>

          <Card variant="elevated" padding="md" className="rounded-2xl shadow-search">
            <form onSubmit={lookup} className="space-y-4">
              <Field label="Mã đặt vé" error={errors.code} required>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
                  <Input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setErrors((p) => ({ ...p, code: undefined }));
                    }}
                    placeholder="VD: TKMQRPNMD3JMM"
                    error={!!errors.code}
                    className="h-11 pl-10 font-mono"
                  />
                </div>
              </Field>

              <Field label="Email đặt vé " error={errors.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    placeholder="email@example.com"
                    error={!!errors.email}
                    className="h-11 pl-10"
                  />
                </div>
              </Field>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                {loading ? 'Đang tra cứu...' : 'Tra cứu vé'}
              </Button>
            </form>
          </Card>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
                <SkeletonCard className="h-64 rounded-2xl" />
              </motion.div>
            )}

            {!loading && errorMsg && (
              <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
                <Card variant="flat" padding="md" className="flex items-start gap-3 rounded-2xl border-danger/20 bg-danger-light">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                  <div>
                    <p className="font-semibold text-danger">Không tìm thấy vé</p>
                    <p className="mt-1 text-caption text-danger/80">{errorMsg}</p>
                  </div>
                </Card>
              </motion.div>
            )}

            {!loading && booking && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
                <BookingResult
                  booking={booking}
                  trip={trip}
                  onCancelled={() => void runLookup(booking.bookingCode, email || undefined)}
                />
              </motion.div>
            )}

            {!loading && !searched && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                    <Ticket className="h-6 w-6 text-brand" />
                  </div>
                  <p className="mt-4 font-medium text-ink">Tra cứu nhanh bằng mã vé</p>
                  <p className="mt-1 text-caption text-ink-muted">
                    Mã vé được gửi qua email sau khi thanh toán thành công
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function BookingResult({
  booking,
  trip,
  onCancelled,
}: {
  booking: Booking;
  trip: TripDetail | null;
  onCancelled?: () => void;
}) {
  const { isLoggedIn, user } = useAuth();
  const cancelTicket: ETicket = {
    id: booking.id,
    ticketCode: booking.bookingCode,
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    tripId: booking.tripId,
    passengerName: booking.passengers[0]?.fullName || '',
    passengerPhone: booking.passengers[0]?.phone || '',
    passengerEmail: booking.passengers[0]?.email || '',
    seatId: booking.passengers.map((p) => p.seatId).join(', '),
    routeName: trip?.routeName || booking.routeName || 'Tuyến xe',
    origin: trip?.origin || booking.origin || '',
    destination: trip?.destination || booking.destination || '',
    operatorName: trip?.operatorName || '',
    pickupPoint: '',
    dropoffPoint: '',
    departureTime: trip?.departureTime || booking.departureTime || '',
    busPlate: '',
    totalAmount: booking.totalAmount,
    paymentStatus: booking.paymentStatus || 'PAID',
    bookingStatus: booking.status,
    qrCode: '',
    createdAt: booking.createdAt,
  };

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden rounded-2xl">
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-micro font-medium uppercase tracking-wide text-white/70">Mã đặt vé</p>
            <p className="mt-1 font-mono text-2xl font-bold">{booking.bookingCode}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="p-6">
        <h3 className="flex items-center gap-2 text-caption font-semibold text-ink">
          <Bus className="h-4 w-4 text-brand" />
          Thông tin chuyến
        </h3>

        {trip ? (
          <div className="mt-3 rounded-xl bg-surface-sunken p-4">
            <div className="flex items-center gap-2 text-subtitle font-bold text-ink">
              <span>{trip.origin}</span>
              <ArrowRight className="h-4 w-4 text-brand" />
              <span>{trip.destination}</span>
            </div>
            <p className="mt-1 text-caption text-ink-muted">{trip.routeName}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-caption text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateTime(trip.departureTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {trip.operatorName} {trip.busType && `· ${trip.busType}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-surface-sunken p-4 text-caption text-ink-muted">
            Mã chuyến: <span className="font-mono font-medium text-ink">{booking.tripId}</span>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-3 text-caption font-semibold text-ink">Ghế đã đặt</h3>
          <div className="flex flex-wrap gap-2">
            {booking.passengers.map((p) => (
              <Badge key={p.seatId} variant="brand">
                <Ticket className="h-3 w-3" />
                Ghế {p.seatId}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-caption font-semibold text-ink">Hành khách</h3>
          {booking.passengers.map((p) => (
            <div
              key={`${p.seatId}-${p.fullName}`}
              className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-brand-50/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand">
                {p.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  <User className="h-3.5 w-3.5 text-ink-subtle" />
                  {p.fullName}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-caption text-ink-muted">
                  <Phone className="h-3.5 w-3.5" />
                  {p.phone || '—'}
                </p>
              </div>
              <Badge variant="outline">{p.seatId}</Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-caption text-ink-muted">Tổng thanh toán</p>
            <p className="text-title font-bold text-brand">
              {booking.totalAmount.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isLoggedIn && booking.userId && user?.userId === booking.userId ? (
              <CancelBookingButton
                ticket={cancelTicket}
                bookingUserId={booking.userId}
                onCancelled={onCancelled}
              />
            ) : null}
            {(booking.status === 'PAID' || booking.status === 'TICKET_ISSUED' || booking.status === 'CHECKED_IN') && (
              <Link href={`/my-tickets/${booking.bookingCode}`}>
                <Button size="lg" className="bg-gradient-to-r from-brand-600 to-brand-700">
                  <QrCode className="h-4 w-4" />
                  Xem vé điện tử
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'success' | 'brand' | 'warning' | 'danger' | 'default'> = {
    PAID: 'success',
    TICKET_ISSUED: 'brand',
    PENDING_PAYMENT: 'warning',
    CANCELLED: 'danger',
    EXPIRED: 'default',
    CHECKED_IN: 'brand',
  };
  const labels: Record<string, string> = {
    PAID: 'Đã thanh toán',
    TICKET_ISSUED: 'Đã xuất vé',
    PENDING_PAYMENT: 'Chờ thanh toán',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn',
    CHECKED_IN: 'Đã check-in',
  };
  return <Badge variant={variantMap[status] || 'default'}>{labels[status] || status}</Badge>;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function LookupSkeleton() {
  return (
    <div className="mesh-bg page-container py-10">
      <SkeletonCard className="mx-auto h-48 max-w-2xl rounded-2xl" />
    </div>
  );
}
