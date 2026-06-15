'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bus,
  Clock,
  MapPin,
  Shield,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SeatMapGrid } from '@/components/SeatMapGrid';
import { gql } from '@/lib/graphql';
import { getSessionId } from '@/lib/session';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/graphql';
const SERVICE_FEE_RATE = 0.02;

type TripInfo = {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  pickupPoint: string;
  dropoffPoint: string;
  operatorName: string;
  busType: string;
  price: number;
  busPlate: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
};

type SeatLayout = { type: string; floors: Array<{ label?: string; rows: string[][] }> };
type SeatRow = { seatId: string; seatLabel: string; status: string };

type PassengerDraft = { fullName: string; phone: string; email: string; seatId: string };

function normalizeTripId(raw: string | string[] | undefined): string {
  if (!raw) return '';
  const value = Array.isArray(raw) ? raw.join('/') : raw;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(dep: string, arr: string) {
  const mins = Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h}h ${m}m`;
}

function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const tripId = useMemo(() => normalizeTripId(params.id), [params.id]);
  const router = useRouter();

  const [trip, setTrip] = useState<TripInfo | null>(null);
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [seats, setSeats] = useState<SeatRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerDraft[]>([]);
  const [holdToken, setHoldToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [holdingSeatId, setHoldingSeatId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const availableCount = useMemo(
    () => seats.filter((s) => s.status === 'AVAILABLE').length,
    [seats]
  );

  const ticketTotal = trip ? trip.price * selected.length : 0;
  const serviceFee = Math.round(ticketTotal * SERVICE_FEE_RATE);
  const grandTotal = ticketTotal + serviceFee;

  const loadSeats = useCallback(async () => {
    const data = await gql<{ seatMap: { layoutJson: string; seats: SeatRow[] } }>(
      `query($id:ID!){seatMap(tripId:$id){layoutJson seats{seatId seatLabel status heldBy holdTtlSeconds}}}`,
      { id: tripId }
    );
    setLayout(JSON.parse(data.seatMap.layoutJson) as SeatLayout);
    setSeats(data.seatMap.seats);
  }, [tripId]);

  useEffect(() => {
    if (!tripId) {
      setError('Mã chuyến không hợp lệ');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const [detailResult, seatResult] = await Promise.allSettled([
          gql<{ tripDetail: TripInfo | null }>(
            `query($id:ID!){tripDetail(tripId:$id){
              id routeName origin destination pickupPoint dropoffPoint
              operatorName busType price busPlate departureTime arrivalTime totalSeats
            }}`,
            { id: tripId }
          ),
          gql<{ seatMap: { layoutJson: string; seats: SeatRow[] } }>(
            `query($id:ID!){seatMap(tripId:$id){layoutJson seats{seatId seatLabel status}}}`,
            { id: tripId }
          ),
        ]);

        if (cancelled) return;

        if (detailResult.status !== 'fulfilled' || !detailResult.value.tripDetail) {
          throw new Error(
            detailResult.status === 'rejected'
              ? String(detailResult.reason)
              : 'Không tìm thấy chuyến xe'
          );
        }
        setTrip(detailResult.value.tripDetail);

        if (seatResult.status === 'fulfilled') {
          setLayout(JSON.parse(seatResult.value.seatMap.layoutJson) as SeatLayout);
          setSeats(seatResult.value.seatMap.seats);
        } else {
          throw seatResult.reason;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải sơ đồ ghế');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  useEffect(() => {
    if (!tripId || typeof WebSocket === 'undefined') return;
    const ws = new WebSocket(WS_URL, 'graphql-transport-ws');
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'connection_init' }));
      ws.send(
        JSON.stringify({
          id: '1',
          type: 'subscribe',
          payload: {
            query: `subscription($tripId:ID!){seatUpdated(tripId:$tripId){seatId status heldBy holdTtlSeconds}}`,
            variables: { tripId },
          },
        })
      );
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'next' && msg.payload?.data?.seatUpdated) {
          const u = msg.payload.data.seatUpdated;
          setSeats((prev) =>
            prev.map((s) => (s.seatId === u.seatId ? { ...s, status: u.status } : s))
          );
        }
      } catch {
        /* ignore malformed websocket frames */
      }
    };
    return () => ws.close();
  }, [tripId]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  useEffect(() => {
    setPassengers((prev) => {
      const next = selected.map((seatId) => {
        const existing = prev.find((p) => p.seatId === seatId);
        return existing || { seatId, fullName: '', phone: '', email: '' };
      });
      return next;
    });
  }, [selected]);

  async function holdSeat(seatId: string) {
    if (holdingSeatId) return;
    setHoldingSeatId(seatId);
    try {
      const data = await gql<{
        holdSeats: { success: boolean; holdToken: string; expiresInSeconds: number; message: string };
      }>(
        `mutation($tripId:ID!,$seatIds:[ID!]!,$sessionId:String!){holdSeats(tripId:$tripId,seatIds:$seatIds,sessionId:$sessionId){success holdToken expiresInSeconds message}}`,
        { tripId, seatIds: [seatId], sessionId: getSessionId() }
      );
      const r = data.holdSeats;
      if (r.success) {
        setHoldToken(r.holdToken);
        setCountdown(r.expiresInSeconds);
        setSelected((s) => (s.includes(seatId) ? s : [...s, seatId]));
        toast.success(`Đã chọn ghế ${seatId}`);
        await loadSeats();
      } else {
        toast.error(r.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể giữ ghế');
    } finally {
      setHoldingSeatId(null);
    }
  }

  function updatePassenger(index: number, field: keyof Omit<PassengerDraft, 'seatId'>, value: string) {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function canContinue() {
    if (!holdToken || selected.length === 0) return false;
    return passengers.every((p) => p.fullName.trim() && p.phone.trim() && p.email.trim());
  }

  function handleContinue() {
    if (!canContinue() || !trip) return;
    const guestEmail = passengers[0]?.email || '';
    sessionStorage.setItem(
      'bookingDraft',
      JSON.stringify({ passengers, guestEmail, tripId, holdToken, selected })
    );
    router.push(
      `/booking?tripId=${encodeURIComponent(tripId)}&holdToken=${encodeURIComponent(holdToken)}&seats=${selected.join(',')}`
    );
  }

  if (loading) return <PageSkeleton />;

  if (error || !trip || !layout) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">Không tải được chuyến xe</h1>
        <p className="mt-2 text-sm text-slate-500">{error || 'Vui lòng thử lại sau.'}</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại tìm chuyến
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại kết quả tìm kiếm
        </Link>

        {/* Route hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 overflow-hidden rounded-[24px] border border-white/60 bg-white/80 p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                <Sparkles className="h-3.5 w-3.5" />
                {trip.operatorName}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                {trip.origin}{' '}
                <span className="mx-1 font-normal text-indigo-400">→</span>{' '}
                {trip.destination}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {trip.pickupPoint}
                </span>
                <span className="hidden text-slate-300 sm:inline">·</span>
                <span>{trip.dropoffPoint}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-600">
                {trip.price.toLocaleString('vi-VN')}
                <span className="text-lg font-semibold">đ</span>
              </p>
              <p className="text-xs text-slate-400">/ ghế</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <MetaChip icon={Clock} label="Khởi hành" value={formatTime(trip.departureTime)} />
            <MetaChip icon={Clock} label="Đến nơi" value={formatTime(trip.arrivalTime)} />
            <MetaChip
              icon={Timer}
              label="Thời gian"
              value={formatDuration(trip.departureTime, trip.arrivalTime)}
            />
            <MetaChip icon={Bus} label="Loại xe" value={trip.busType} />
            <MetaChip icon={Users} label="Còn trống" value={`${availableCount} ghế`} highlight />
          </div>

          <AnimatePresence>
            {countdown > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                    <Timer className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Ghế đang được giữ</p>
                    <p className="text-xs text-amber-700">
                      Hoàn tất đặt vé trong{' '}
                      <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* Seat map */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <h2 className="mb-5 text-lg font-bold text-[#0F172A]">Chọn ghế của bạn</h2>
            <SeatMapGrid
              layout={layout}
              seats={seats}
              selected={selected}
              holdingSeatId={holdingSeatId}
              onSelect={holdSeat}
            />
          </motion.section>

          {/* Sticky summary */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="lg:sticky lg:top-24"
          >
            <div className="rounded-[24px] border border-white/60 bg-white/85 p-6 shadow-[0_12px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <h3 className="text-lg font-bold text-[#0F172A]">Tóm tắt đặt vé</h3>
              <p className="mt-1 text-sm text-slate-500">Xe {trip.busPlate}</p>

              <div className="mt-6 space-y-4">
                <SummaryRow label="Ghế đã chọn" value={selected.length ? selected.join(', ') : '—'} />
                <SummaryRow
                  label="Giá vé"
                  value={ticketTotal ? `${ticketTotal.toLocaleString('vi-VN')}đ` : '—'}
                />
                <SummaryRow
                  label="Phí dịch vụ"
                  value={ticketTotal ? `${serviceFee.toLocaleString('vi-VN')}đ` : '—'}
                  muted
                />
                <div className="border-t border-slate-100 pt-4">
                  <SummaryRow
                    label="Tổng cộng"
                    value={grandTotal ? `${grandTotal.toLocaleString('vi-VN')}đ` : '—'}
                    bold
                  />
                </div>
              </div>

              {/* Passenger forms */}
              <AnimatePresence>
                {selected.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4 overflow-hidden border-t border-slate-100 pt-6"
                  >
                    <p className="text-sm font-semibold text-[#0F172A]">Thông tin hành khách</p>
                    {passengers.map((p, i) => (
                      <div key={p.seatId} className="space-y-2 rounded-2xl bg-slate-50/80 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                          Ghế {p.seatId}
                        </p>
                        <input
                          placeholder="Họ và tên"
                          value={p.fullName}
                          onChange={(e) => updatePassenger(i, 'fullName', e.target.value)}
                          className={inputClass}
                        />
                        <input
                          placeholder="Số điện thoại"
                          value={p.phone}
                          onChange={(e) => updatePassenger(i, 'phone', e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={p.email}
                          onChange={(e) => updatePassenger(i, 'email', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                disabled={!canContinue()}
                onClick={handleContinue}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Tiếp tục thanh toán
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Shield className="h-3.5 w-3.5" />
                Thanh toán an toàn & bảo mật
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${highlight ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'bg-slate-50/80'}`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={`text-sm font-semibold ${highlight ? 'text-indigo-600' : 'text-[#0F172A]'}`}>
        {value}
      </p>
    </div>
  );
}

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
      <span className={`text-sm ${muted ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <span
        className={`text-sm ${bold ? 'text-lg font-bold text-[#0F172A]' : 'font-semibold text-[#0F172A]'}`}
      >
        {value}
      </span>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 transition-colors focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6">
        <div className="mb-6 h-4 w-40 rounded-lg bg-slate-200" />
        <div className="mb-8 h-48 rounded-[24px] bg-slate-200/70" />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="h-[480px] rounded-[24px] bg-slate-200/60" />
          <div className="h-96 rounded-[24px] bg-slate-200/60" />
        </div>
      </div>
    </div>
  );
}
