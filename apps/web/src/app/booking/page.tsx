'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  QrCode,
  Shield,
  Smartphone,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';
import { useAuth } from '@/hooks/useAuth';
import { saveBookingSuccess, buildSuccessPageUrl } from '@/lib/booking-success';
import { computeBookingPricing, computePricingFromTicketTotal } from '@/lib/booking-pricing';
import { SavedPassengerPicker } from '@/components/domain/SavedPassengerPicker';
import { BookingProgress } from '@/components/domain/BookingProgress';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

type Passenger = { fullName: string; phone: string; email: string; seatId: string };
type PaymentMethod = 'qr' | 'bank' | 'wallet';

const PAYMENT_METHODS = [
  { id: 'qr' as const, label: 'Quét mã QR', icon: QrCode, desc: 'MoMo, ZaloPay, VNPay' },
  { id: 'bank' as const, label: 'Chuyển khoản', icon: Building2, desc: 'Ngân hàng nội địa' },
  { id: 'wallet' as const, label: 'Ví điện tử', icon: Wallet, desc: 'MoMo, ShopeePay' },
] as const;

type TripDraftSummary = {
  origin: string;
  destination: string;
  routeName?: string;
  departureTime: string;
  operatorName: string;
  busType: string;
  pricePerSeat: number;
};

function readDraftTripSummary(): TripDraftSummary | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('bookingDraft');
    if (!raw) return null;
    const draft = JSON.parse(raw) as { tripSummary?: TripDraftSummary };
    return draft.tripSummary ?? null;
  } catch {
    return null;
  }
}

function readDraft(seats: string[]) {
  const defaults = seats.map((s) => ({ fullName: '', phone: '', email: '', seatId: s }));
  if (typeof window === 'undefined') return { passengers: defaults, guestEmail: '' };
  try {
    const raw = sessionStorage.getItem('bookingDraft');
    if (!raw) return { passengers: defaults, guestEmail: '' };
    const draft = JSON.parse(raw) as { passengers?: Passenger[]; guestEmail?: string };
    return {
      passengers: draft.passengers?.length ? draft.passengers : defaults,
      guestEmail: draft.guestEmail || draft.passengers?.[0]?.email || '',
    };
  } catch {
    return { passengers: defaults, guestEmail: '' };
  }
}

function BookingForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const tripId = params.get('tripId') || '';
  const holdToken = params.get('holdToken') || '';
  const seats = (params.get('seats') || '').split(',').filter(Boolean);
  const promoFromQuery = (params.get('promo') || '').trim().toUpperCase();
  const [initialDraft] = useState(() => readDraft(seats));

  const [passengers, setPassengers] = useState<Passenger[]>(initialDraft.passengers);
  const [guestEmail, setGuestEmail] = useState(initialDraft.guestEmail);
  const [bookingId, setBookingId] = useState('');
  const [bookingTotalAmount, setBookingTotalAmount] = useState(0);
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr');
  const [activePromoCode, setActivePromoCode] = useState(promoFromQuery || '');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [autoSkippedForm, setAutoSkippedForm] = useState(false);
  const missingParams = !tripId || !holdToken || seats.length === 0;

  const passengersReady = useMemo(() => {
    const email = guestEmail.trim() || passengers[0]?.email?.trim() || '';
    return (
      !!email &&
      passengers.length === seats.length &&
      passengers.every((p) => p.fullName.trim() && p.phone.trim() && p.email.trim())
    );
  }, [guestEmail, passengers, seats.length]);

  useEffect(() => {
    const draft = readDraft(seats);
    setPassengers(draft.passengers);
    setGuestEmail(draft.guestEmail);
  }, [tripId, holdToken, seats.join(',')]);

  useEffect(() => {
    if (promoFromQuery) {
      setActivePromoCode(promoFromQuery);
      sessionStorage.setItem('activePromoCode', promoFromQuery);
      return;
    }
    const saved = sessionStorage.getItem('activePromoCode') || '';
    if (saved) setActivePromoCode(saved.toUpperCase());
  }, [promoFromQuery]);

  useEffect(() => {
    if (missingParams || !passengersReady || step !== 'form' || bookingId || autoSkippedForm) return;
    setAutoSkippedForm(true);
    void submitBooking();
  }, [missingParams, passengersReady, step, bookingId, autoSkippedForm]);

  async function submitBooking() {
    if (!tripId || !holdToken) {
      toast.error('Thiếu thông tin chuyến hoặc mã giữ ghế');
      return;
    }
    const email = guestEmail.trim() || passengers[0]?.email?.trim() || '';
    if (!email) {
      toast.error('Vui lòng nhập email nhận vé');
      return;
    }
    if (!passengers.every((p) => p.fullName.trim() && p.phone.trim() && p.email.trim())) {
      toast.error('Vui lòng điền đầy đủ thông tin hành khách');
      return;
    }

    setSubmitting(true);
    try {
      const data = await gql<{
        createBooking: { bookingId: string; bookingCode: string; totalAmount: number };
      }>(
        `mutation($tripId:ID!,$holdToken:String!,$passengers:[PassengerInput!]!,$guestEmail:String!){
          createBooking(tripId:$tripId,holdToken:$holdToken,passengers:$passengers,guestEmail:$guestEmail){
            bookingId bookingCode totalAmount paymentDeadlineSeconds
          }
        }`,
        { tripId, holdToken, passengers, guestEmail: email }
      );
      setBookingId(data.createBooking.bookingId);
      setBookingTotalAmount(data.createBooking.totalAmount);
      setStep('payment');
      toast.success('Đã tạo đơn đặt vé — vui lòng thanh toán');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tạo booking');
      setAutoSkippedForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function pay(success: boolean) {
    if (!bookingId) return;
    setPaying(true);
    try {
      const data = await gql<{
        processPayment: { success: boolean; message: string; bookingId?: string; bookingCode?: string };
      }>(
        `mutation($bookingId:ID!,$simulateSuccess:Boolean!){
          processPayment(bookingId:$bookingId,simulateSuccess:$simulateSuccess){
            success message bookingId bookingCode
          }
        }`,
        { bookingId, simulateSuccess: success }
      );
      if (data.processPayment.success) {
        const tripSummary = readDraftTripSummary();
        sessionStorage.removeItem('bookingDraft');
        const code = data.processPayment.bookingCode;
        if (!code) {
          toast.error('Thanh toán thành công nhưng không nhận được mã vé từ database');
          return;
        }
        toast.success('Thanh toán thành công!');
        if (isLoggedIn) {
          router.replace('/my-tickets');
          return;
        }
        const email = guestEmail.trim() || passengers[0]?.email?.trim() || '';
        const pricing = tripSummary?.pricePerSeat
          ? computeBookingPricing(seats.length, tripSummary.pricePerSeat)
          : computePricingFromTicketTotal(bookingTotalAmount);
        const successPayload = {
          bookingCode: code,
          guestEmail: email,
          passengers: passengers.map((p) => ({ fullName: p.fullName.trim(), seatId: p.seatId })),
          seats,
          totalAmount: pricing.grandTotal,
          ticketTotal: pricing.ticketTotal,
          serviceFee: pricing.serviceFee,
          paymentStatus: 'PAID',
          ...(tripSummary
            ? {
                trip: {
                  origin: tripSummary.origin,
                  destination: tripSummary.destination,
                  routeName: tripSummary.routeName,
                  departureTime: tripSummary.departureTime,
                  operatorName: tripSummary.operatorName,
                  busType: tripSummary.busType,
                },
              }
            : {}),
        };
        saveBookingSuccess(successPayload);
        router.replace(buildSuccessPageUrl(successPayload));
      } else {
        toast.error(data.processPayment.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Thanh toán thất bại');
    } finally {
      setPaying(false);
    }
  }

  if (missingParams) {
    return (
      <div className="mesh-bg flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-light">
            <AlertCircle className="h-7 w-7 text-danger" />
          </div>
          <h1 className="text-title text-ink">Thiếu thông tin đặt vé</h1>
          <p className="mt-2 text-body text-ink-muted">Vui lòng chọn ghế và thử lại từ đầu.</p>
          <Link href="/">
            <Button className="mt-8">
              <ArrowLeft className="h-4 w-4" />
              Tìm chuyến xe
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="page-section page-container max-w-6xl">
        <BookingProgress current="payment" className="mb-8" />

        <div className="mb-6">
          <h1 className="text-display text-ink">Thanh toán đặt vé</h1>
          <p className="mt-2 text-body text-ink-muted">
            {seats.length} ghế · {seats.join(', ')}
          </p>
          {activePromoCode && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-50 px-3 py-1.5 text-caption font-semibold text-brand">
              <BadgePercent className="h-4 w-4" />
              Đang áp dụng mã giảm giá: {activePromoCode}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {step === 'form' && (
              <div className="space-y-5">
                {passengersReady && (submitting || autoSkippedForm) ? (
                  <Card variant="solid" padding="lg" className="flex flex-col items-center rounded-3xl py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="mt-4 text-body text-ink-muted">Đang chuẩn bị thanh toán...</p>
                  </Card>
                ) : (
                  <>
                    <Card variant="solid" padding="md" className="rounded-3xl">
                      <Field label="Email nhận vé" htmlFor="guestEmail" required>
                        <Input
                          id="guestEmail"
                          placeholder="email@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="h-11"
                        />
                      </Field>
                    </Card>

                    {passengers.map((p, i) => (
                      <Card key={p.seatId} variant="solid" padding="md" className="rounded-3xl">
                        <CardHeader
                          title={`Hành khách — Ghế ${p.seatId}`}
                          action={<Badge variant="brand">{p.seatId}</Badge>}
                        />
                        <SavedPassengerPicker
                          passengerIndex={i}
                          className="mb-4"
                          onApply={(data) => {
                            const n = [...passengers];
                            n[i] = { ...n[i], ...data };
                            setPassengers(n);
                            if (i === 0 && data.email) setGuestEmail(data.email);
                          }}
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Field label="Họ tên" required className="sm:col-span-2">
                            <Input
                              placeholder="Nguyễn Văn A"
                              value={p.fullName}
                              onChange={(e) => {
                                const n = [...passengers];
                                n[i] = { ...n[i], fullName: e.target.value };
                                setPassengers(n);
                              }}
                            />
                          </Field>
                          <Field label="Số điện thoại" required>
                            <Input
                              placeholder="0901234567"
                              value={p.phone}
                              onChange={(e) => {
                                const n = [...passengers];
                                n[i] = { ...n[i], phone: e.target.value };
                                setPassengers(n);
                              }}
                            />
                          </Field>
                          <Field label="Email" required>
                            <Input
                              placeholder="email@example.com"
                              value={p.email}
                              onChange={(e) => {
                                const n = [...passengers];
                                n[i] = { ...n[i], email: e.target.value };
                                setPassengers(n);
                              }}
                            />
                          </Field>
                        </div>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      size="lg"
                      onClick={submitBooking}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-brand-600 to-brand-700"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {submitting ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'}
                    </Button>
                  </>
                )}
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-5">
                <Card variant="solid" padding="md" className="rounded-2xl">
                  <h2 className="text-subtitle font-semibold text-ink">Chọn phương thức thanh toán</h2>
                  {activePromoCode && (
                    <div className="mt-4 rounded-xl border border-brand/20 bg-brand-50/80 p-3">
                      <Field label="Mã khuyến mãi tự động áp dụng">
                        <Input value={activePromoCode} readOnly className="h-10 font-mono font-semibold text-brand" />
                      </Field>
                    </div>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={cn(
                          'flex flex-col items-center rounded-xl border p-4 text-center transition-all',
                          paymentMethod === id
                            ? 'border-brand bg-brand-50 shadow-sm ring-2 ring-brand/20'
                            : 'border-slate-200 bg-white hover:border-brand/30'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-6 w-6',
                            paymentMethod === id ? 'text-brand' : 'text-ink-muted'
                          )}
                        />
                        <p className="mt-2 text-caption font-semibold text-ink">{label}</p>
                        <p className="mt-0.5 text-micro text-ink-subtle">{desc}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                {paymentMethod === 'qr' && (
                  <Card variant="solid" padding="lg" className="rounded-2xl text-center">
                    <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 bg-brand-50/50">
                      <div className="text-center">
                        <QrCode className="mx-auto h-16 w-16 text-brand" />
                        <p className="mt-2 text-caption text-ink-muted">Quét mã để thanh toán</p>
                      </div>
                    </div>
                    <p className="mt-4 text-caption text-ink-muted">
                      Mở ứng dụng ngân hàng hoặc ví điện tử và quét mã QR
                    </p>
                  </Card>
                )}

                {paymentMethod === 'bank' && (
                  <Card variant="solid" padding="lg" className="rounded-2xl">
                    <div className="space-y-3 text-body">
                      <div className="flex justify-between rounded-xl bg-surface-sunken px-4 py-3">
                        <span className="text-ink-muted">Ngân hàng</span>
                        <span className="font-semibold text-ink">Vietcombank</span>
                      </div>
                      <div className="flex justify-between rounded-xl bg-surface-sunken px-4 py-3">
                        <span className="text-ink-muted">Số tài khoản</span>
                        <span className="font-mono font-semibold text-ink">0123456789</span>
                      </div>
                      <div className="flex justify-between rounded-xl bg-surface-sunken px-4 py-3">
                        <span className="text-ink-muted">Chủ tài khoản</span>
                        <span className="font-semibold text-ink">CAPPY BUS CO LTD</span>
                      </div>
                      <div className="flex justify-between rounded-xl bg-surface-sunken px-4 py-3">
                        <span className="text-ink-muted">Nội dung CK</span>
                        <span className="font-mono font-semibold text-brand">CAPPY {bookingId.slice(0, 8)}</span>
                      </div>
                    </div>
                  </Card>
                )}

                {paymentMethod === 'wallet' && (
                  <Card variant="solid" padding="lg" className="rounded-2xl">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {['MoMo', 'ZaloPay', 'ShopeePay', 'VNPay'].map((w) => (
                        <button
                          key={w}
                          type="button"
                          className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-all hover:border-brand/30 hover:bg-brand-50/50"
                        >
                          <Smartphone className="h-5 w-5 text-brand" />
                          <span className="font-medium text-ink">{w}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => pay(true)}
                    disabled={paying}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {paying ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                  </Button>
                  <Button type="button" variant="danger" onClick={() => pay(false)} disabled={paying}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card variant="elevated" padding="none" className="overflow-hidden rounded-2xl">
              <div className="relative h-32">
                <Image
                  src="/images/bus-limousine.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <p className="text-micro font-medium uppercase tracking-wide text-white/70">
                    Tóm tắt đơn hàng
                  </p>
                  <p className="text-subtitle font-bold text-white">{seats.length} ghế đã chọn</p>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3 text-body">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Ghế</span>
                    <span className="font-semibold text-ink">{seats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Số lượng</span>
                    <span className="font-semibold text-ink">{seats.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Phương thức</span>
                    <span className="flex items-center gap-1.5 font-semibold text-ink">
                      <CreditCard className="h-3.5 w-3.5 text-brand" />
                      {step === 'payment'
                        ? PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label
                        : 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Mã giảm giá</span>
                    <span className="font-semibold text-brand">{activePromoCode || '—'}</span>
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
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
