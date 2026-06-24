'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Timer,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SeatMapGrid } from '@/components/SeatMapGrid';
import { gql } from '@/lib/graphql';
import { getSessionId } from '@/lib/session';
import { departureDateVN } from '@/lib/datetime';
import { getTripAvailability } from '@/lib/trip-availability';
import { TripAvailabilityBadge } from '@/components/TripAvailabilityBadge';
import { SavedPassengerPicker } from '@/components/domain/SavedPassengerPicker';
import { BookingProgress } from '@/components/domain/BookingProgress';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql';
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
  cancellationPolicy: string;
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const promoCode = (searchParams.get('promo') || '').trim().toUpperCase();

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
  const [tripBlocked, setTripBlocked] = useState<string | null>(null);
  const holdTokenRef = useRef('');
  const selectedRef = useRef<string[]>([]);

  useEffect(() => {
    holdTokenRef.current = holdToken;
  }, [holdToken]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

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

  const releaseHeldSeats = useCallback(
    async (seatIds: string[], token: string) => {
      if (!tripId || !token || seatIds.length === 0) return false;
      try {
        await gql<{ releaseSeats: boolean }>(
          `mutation($tripId:ID!,$seatIds:[ID!]!,$holdToken:String!){
            releaseSeats(tripId:$tripId,seatIds:$seatIds,holdToken:$holdToken)
          }`,
          { tripId, seatIds, holdToken: token }
        );
        return true;
      } catch {
        return false;
      }
    },
    [tripId]
  );

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
              cancellationPolicy
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

        const dep = detailResult.value.tripDetail.departureTime;
        const travelDate = departureDateVN(dep);
        const av = getTripAvailability(
          travelDate,
          dep,
          new Date(),
          detailResult.value.tripDetail.totalSeats
        );
        if (!av.bookable) {
          setTripBlocked(av.availabilityLabel);
        }

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
    return () => {
      const token = holdTokenRef.current;
      const seatIds = [...selectedRef.current];
      if (!token || !seatIds.length || !tripId) return;
      void fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query:
            'mutation($tripId:ID!,$seatIds:[ID!]!,$holdToken:String!){releaseSeats(tripId:$tripId,seatIds:$seatIds,holdToken:$holdToken)}',
          variables: { tripId, seatIds, holdToken: token },
        }),
        keepalive: true,
      });
    };
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
    if (holdingSeatId || tripBlocked) return;
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

  async function handleSeatClick(seatId: string) {
    if (holdingSeatId || tripBlocked) return;

    if (selected.includes(seatId)) {
      setHoldingSeatId(seatId);
      const token = holdToken;
      if (!token) {
        setSelected((s) => s.filter((id) => id !== seatId));
        setHoldingSeatId(null);
        return;
      }
      const ok = await releaseHeldSeats([seatId], token);
      if (ok) {
        const nextSelected = selected.filter((id) => id !== seatId);
        setSelected(nextSelected);
        if (nextSelected.length === 0) {
          setHoldToken('');
          setCountdown(0);
        }
        toast.success(`Đã bỏ chọn ghế ${seatId}`);
        await loadSeats();
      } else {
        toast.error('Không thể nhả ghế — thử lại');
      }
      setHoldingSeatId(null);
      return;
    }

    await holdSeat(seatId);
  }

  function updatePassenger(index: number, field: keyof Omit<PassengerDraft, 'seatId'>, value: string) {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function canContinue() {
    if (tripBlocked) return false;
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
    if (promoCode) {
      sessionStorage.setItem('activePromoCode', promoCode);
    }
    const promoParam = promoCode ? `&promo=${encodeURIComponent(promoCode)}` : '';
    router.push(
      `/booking?tripId=${encodeURIComponent(tripId)}&holdToken=${encodeURIComponent(holdToken)}&seats=${selected.join(',')}${promoParam}`
    );
  }

  if (loading) return <PageSkeleton />;

  if (error || !trip || !layout) {
    return (
      <PageShell narrow className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-danger-light">
          <AlertCircle className="h-7 w-7 text-danger" />
        </div>
        <h1 className="text-title text-ink">Không tải được chuyến xe</h1>
        <p className="mt-2 text-body text-ink-muted">{error || 'Vui lòng thử lại sau.'}</p>
        <Link href="/">
          <Button className="mt-8">
            <ArrowLeft className="h-4 w-4" />
            Quay lại tìm chuyến
          </Button>
        </Link>
      </PageShell>
    );
  }

  return (
    <div className="mesh-bg min-h-screen">
    <PageShell className="max-w-7xl">
      <BookingProgress current="seat" className="mb-8" />

      <Link
        href="/trips"
        className="mb-5 inline-flex items-center gap-2 text-caption font-medium text-ink-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại kết quả
      </Link>

      <Card variant="glass" padding="md" className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="brand" className="mb-2">
              {trip.operatorName}
            </Badge>
            <h1 className="text-title text-ink">
              {trip.origin} <span className="font-normal text-brand">→</span> {trip.destination}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {trip.pickupPoint}
              </span>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span>{trip.dropoffPoint}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand">
              {trip.price.toLocaleString('vi-VN')}
              <span className="text-sm font-medium">đ</span>
            </p>
            <p className="text-micro text-ink-subtle">/ ghế</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
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

        {trip.cancellationPolicy && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-1 flex items-center gap-1.5 text-caption font-semibold text-ink">
              <Shield className="h-4 w-4 shrink-0 text-brand" />
              Chính sách hủy vé
            </p>
            <p className="text-caption leading-relaxed text-ink-muted">{trip.cancellationPolicy}</p>
          </div>
        )}

        {tripBlocked && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-danger/20 bg-danger-light px-4 py-3">
            <TripAvailabilityBadge label={tripBlocked} />
            <p className="text-caption text-danger">Chuyến này không còn khả dụng để đặt vé.</p>
          </div>
        )}

        <AnimatePresence>
          {countdown > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-light px-4 py-3">
                <Timer className="h-4 w-4 text-warning" />
                <p className="text-caption text-ink">
                  Ghế đang được giữ — hoàn tất trong{' '}
                  <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <section>
          <h2 className="mb-4 text-subtitle text-ink">Chọn ghế</h2>
          {tripBlocked ? (
            <Card variant="flat" padding="lg" className="text-center">
              <p className="text-body text-danger">Không thể chọn ghế — {tripBlocked}</p>
            </Card>
          ) : (
            <SeatMapGrid
              layout={layout}
              seats={seats}
              selected={selected}
              holdingSeatId={holdingSeatId}
              onSelect={handleSeatClick}
            />
          )}
        </section>

        <aside className="lg:sticky lg:top-24">
          <Card variant="elevated" padding="md">
            <h3 className="text-subtitle text-ink">Tóm tắt đặt vé</h3>
            <p className="mt-0.5 text-caption text-ink-muted">Xe {trip.busPlate}</p>

            <div className="mt-4 space-y-3">
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
              <div className="border-t border-slate-100 pt-3">
                <SummaryRow
                  label="Tổng cộng"
                  value={grandTotal ? `${grandTotal.toLocaleString('vi-VN')}đ` : '—'}
                  bold
                />
              </div>
            </div>

            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 space-y-3 overflow-hidden border-t border-slate-100 pt-5"
                >
                      <p className="text-caption font-semibold text-ink">Thông tin hành khách</p>
                      {passengers.map((p, i) => (
                    <div key={p.seatId} className="space-y-2 rounded-lg bg-surface-sunken p-3">
                      <p className="text-micro font-bold uppercase tracking-wide text-brand">
                        Ghế {p.seatId}
                      </p>
                      <SavedPassengerPicker
                        passengerIndex={i}
                        onApply={(data) => {
                          setPassengers((prev) => {
                            const next = [...prev];
                            next[i] = { ...next[i], ...data };
                            return next;
                          });
                        }}
                      />
                      <Field label="Họ và tên">
                        <Input
                          placeholder="Nguyễn Văn A"
                          value={p.fullName}
                          onChange={(e) => updatePassenger(i, 'fullName', e.target.value)}
                        />
                      </Field>
                      <Field label="Số điện thoại">
                        <Input
                          placeholder="0901234567"
                          value={p.phone}
                          onChange={(e) => updatePassenger(i, 'phone', e.target.value)}
                        />
                      </Field>
                      <Field label="Email">
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={p.email}
                          onChange={(e) => updatePassenger(i, 'email', e.target.value)}
                        />
                      </Field>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="button"
              size="lg"
              disabled={!canContinue()}
              onClick={handleContinue}
              className="mt-5 w-full"
            >
              Tiếp tục thanh toán
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-micro text-ink-subtle">
              <Shield className="h-3.5 w-3.5" />
              Thanh toán an toàn & bảo mật
            </p>
          </Card>
        </aside>
      </div>

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-lg lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-caption text-ink-muted">{selected.length} ghế · {selected.join(', ')}</p>
              <p className="text-subtitle font-bold text-brand">
                {grandTotal.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <Button disabled={!canContinue()} onClick={handleContinue}>
              Tiếp tục
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PageShell>
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
      className={`rounded-lg px-3 py-2.5 ${highlight ? 'bg-brand-50 ring-1 ring-brand-100' : 'bg-surface-sunken'}`}
    >
      <div className="mb-0.5 flex items-center gap-1 text-micro font-medium uppercase tracking-wide text-ink-subtle">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className={`text-caption font-semibold ${highlight ? 'text-brand' : 'text-ink'}`}>
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
      <span className={`text-caption ${muted ? 'text-ink-subtle' : 'text-ink-muted'}`}>{label}</span>
      <span className={`text-caption ${bold ? 'text-subtitle font-bold text-ink' : 'font-semibold text-ink'}`}>
        {value}
      </span>
    </div>
  );
}

function PageSkeleton() {
  return (
    <PageShell className="max-w-7xl">
      <Skeleton className="mb-5 h-4 w-32" />
      <Skeleton className="mb-6 h-40 rounded-card" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-[420px] rounded-card" />
        <Skeleton className="h-80 rounded-card" />
      </div>
    </PageShell>
  );
}
