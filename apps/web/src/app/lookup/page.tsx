'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';

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
  passengers: Passenger[];
  createdAt: string;
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
    if (codeParam && emailParam && !autoLookupDone.current) {
      autoLookupDone.current = true;
      void runLookup(codeParam, emailParam);
    }
  }, [searchParams]);

  function validateValues(bookingCode: string, lookupEmail: string) {
    const next: typeof errors = {};
    if (!bookingCode) next.code = 'Vui lòng nhập mã đặt vé';
    if (!lookupEmail) next.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lookupEmail)) next.email = 'Email không hợp lệ';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function runLookup(bookingCode: string, lookupEmail: string) {
    if (!validateValues(bookingCode, lookupEmail)) return;

    setLoading(true);
    setSearched(true);
    setBooking(null);
    setTrip(null);
    setErrorMsg('');

    try {
      const data = await gql<{ bookingByCode: Booking }>(
        `query($bookingCode:String!,$email:String!){
          bookingByCode(bookingCode:$bookingCode,email:$email){
            id bookingCode status tripId totalAmount createdAt
            passengers { fullName phone email seatId }
          }
        }`,
        { bookingCode, email: lookupEmail }
      );
      setBooking(data.bookingByCode);
      toast.success('Tra cứu thành công!');

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tìm thấy vé';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    return validateValues(code.trim(), email.trim());
  }

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    await runLookup(code.trim(), email.trim());
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bus.png"
            alt="Xe khách hiện đại trên đường ven biển"
            fill
            priority
            className="object-cover object-[60%_center] sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/40" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 text-center text-white sm:py-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
            <Ticket className="h-4 w-4" />
            Tra cứu nhanh
          </div>
          <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl">Tra cứu vé xe</h1>
          <p className="mx-auto mt-2 max-w-md text-white/90">
            Nhập mã đặt vé để xem thông tin chi tiết
          </p>
        </div>
      </section>

      {/* Search card */}
      <div className="relative z-10 mx-auto max-w-xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="-mt-10 rounded-2xl border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur-sm"
        >
          <form onSubmit={lookup} className="space-y-4">
            <FormField
              label="Mã đặt vé"
              error={errors.code}
              icon={<Hash className="h-4 w-4" />}
            >
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setErrors((p) => ({ ...p, code: undefined }));
                }}
                placeholder="VD: BK-ABC123"
                className={inputClass(!!errors.code)}
              />
            </FormField>

            <FormField
              label="Email đặt vé"
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="email@example.com"
                className={inputClass(!!errors.email)}
              />
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              {loading ? 'Đang tra cứu...' : 'Tra cứu'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Results area */}
      <div className="mx-auto mt-8 max-w-xl px-4">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultSkeleton />
            </motion.div>
          )}

          {!loading && errorMsg && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">Không tìm thấy vé</p>
                <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {!loading && booking && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <BookingResult booking={booking} trip={trip} />
            </motion.div>
          )}

          {!loading && !searched && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center"
            >
              <Search className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-4 font-medium text-gray-600">Nhập mã để tra cứu</p>
              <p className="mt-1 text-sm text-gray-400">
                Mã booking và email phải trùng với lúc đặt vé
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BookingResult({ booking, trip }: { booking: Booking; trip: TripDetail | null }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Mã đặt vé</p>
          <p className="mt-1 font-mono text-2xl font-bold text-gray-900">{booking.bookingCode}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Trip info */}
      <div className="mt-5 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Bus className="h-4 w-4 text-blue-600" />
          Thông tin chuyến
        </h3>

        {trip ? (
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span>{trip.origin}</span>
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <span>{trip.destination}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{trip.routeName}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {formatDateTime(trip.departureTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {trip.operatorName} · {trip.busType}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            Mã chuyến: <span className="font-mono font-medium text-gray-700">{booking.tripId}</span>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Ngày đặt:{' '}
          <span className="font-medium text-gray-700">
            {new Date(booking.createdAt).toLocaleString('vi-VN')}
          </span>
        </p>
      </div>

      {/* Seats */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Ghế đã đặt</h3>
        <div className="flex flex-wrap gap-2">
          {booking.passengers.map((p) => (
            <span
              key={p.seatId}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700"
            >
              <Ticket className="h-3.5 w-3.5" />
              Ghế {p.seatId}
            </span>
          ))}
        </div>
      </div>

      {/* Passengers */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Hành khách</h3>
        {booking.passengers.map((p) => (
          <div
            key={`${p.seatId}-${p.fullName}`}
            className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
              {p.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-medium text-gray-900">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {p.fullName}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {p.phone || '—'}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {p.seatId}
            </span>
          </div>
        ))}
      </div>

      {/* Price + QR */}
      <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Tổng thanh toán</p>
          <p className="text-2xl font-bold text-blue-600">
            {booking.totalAmount.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
            <QrCode className="h-8 w-8 text-gray-400" />
            <span className="mt-1 text-[10px] font-mono text-gray-400">QR</span>
          </div>
          <div className="text-xs text-gray-400">
            <p className="font-medium text-gray-600">Mã lên xe</p>
            <p className="mt-1 font-mono text-sm font-bold text-gray-800">{booking.bookingCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    TICKET_ISSUED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    PENDING_PAYMENT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    CANCELLED: 'bg-red-50 text-red-600 ring-red-600/20',
    EXPIRED: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    CHECKED_IN: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  };
  const labels: Record<string, string> = {
    PAID: 'Đã thanh toán',
    TICKET_ISSUED: 'Đã xuất vé',
    PENDING_PAYMENT: 'Chờ thanh toán',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn',
    CHECKED_IN: 'Đã check-in',
  };
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || 'bg-gray-100 text-gray-600 ring-gray-500/20'}`}
    >
      {labels[status] || status}
    </span>
  );
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-8 w-40 rounded-lg bg-gray-200" />
        </div>
        <div className="h-7 w-24 rounded-full bg-gray-200" />
      </div>
      <div className="mt-6 h-24 rounded-xl bg-gray-100" />
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-16 rounded-lg bg-gray-100" />
        <div className="h-8 w-16 rounded-lg bg-gray-100" />
      </div>
      <div className="mt-4 h-16 rounded-xl bg-gray-100" />
    </div>
  );
}

function FormField({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs font-medium text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border py-3 pl-10 pr-4 text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
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
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-xl animate-pulse px-4 py-20">
        <div className="h-48 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
