'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';

type Passenger = { fullName: string; phone: string; email: string; seatId: string };

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
  const tripId = params.get('tripId') || '';
  const holdToken = params.get('holdToken') || '';
  const seats = (params.get('seats') || '').split(',').filter(Boolean);

  const [passengers, setPassengers] = useState<Passenger[]>(() => readDraft(seats).passengers);
  const [guestEmail, setGuestEmail] = useState(() => readDraft(seats).guestEmail);
  const [bookingId, setBookingId] = useState('');
  const [step, setStep] = useState<'form' | 'payment' | 'done'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const missingParams = !tripId || !holdToken || seats.length === 0;

  useEffect(() => {
    const draft = readDraft(seats);
    setPassengers(draft.passengers);
    setGuestEmail(draft.guestEmail);
  }, [tripId, holdToken, seats.join(',')]);

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
      setStep('payment');
      toast.success('Đã tạo đơn đặt vé — vui lòng thanh toán');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tạo booking');
    } finally {
      setSubmitting(false);
    }
  }

  async function pay(success: boolean) {
    if (!bookingId) return;
    setPaying(true);
    try {
      const data = await gql<{
        processPayment: { success: boolean; message: string };
      }>(
        `mutation($bookingId:ID!,$simulateSuccess:Boolean!){
          processPayment(bookingId:$bookingId,simulateSuccess:$simulateSuccess){success message}
        }`,
        { bookingId, simulateSuccess: success }
      );
      if (data.processPayment.success) {
        sessionStorage.removeItem('bookingDraft');
        setStep('done');
        toast.success('Thanh toán thành công!');
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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">Thiếu thông tin đặt vé</h1>
        <p className="mt-2 text-sm text-slate-500">Vui lòng chọn ghế và thử lại từ đầu.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Tìm chuyến xe
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#0F172A]">Đặt vé</h1>

      {step === 'form' && (
        <div className="mt-6 space-y-4">
          <input
            placeholder="Email nhận vé"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className={inputClass}
          />
          {passengers.map((p, i) => (
            <div key={p.seatId} className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-indigo-600">Ghế {p.seatId}</h3>
              <input
                placeholder="Họ tên"
                value={p.fullName}
                onChange={(e) => {
                  const n = [...passengers];
                  n[i] = { ...n[i], fullName: e.target.value };
                  setPassengers(n);
                }}
                className={inputClass}
              />
              <input
                placeholder="SĐT"
                value={p.phone}
                onChange={(e) => {
                  const n = [...passengers];
                  n[i] = { ...n[i], phone: e.target.value };
                  setPassengers(n);
                }}
                className={inputClass}
              />
              <input
                placeholder="Email"
                value={p.email}
                onChange={(e) => {
                  const n = [...passengers];
                  n[i] = { ...n[i], email: e.target.value };
                  setPassengers(n);
                }}
                className={inputClass}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={submitBooking}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'}
          </button>
        </div>
      )}

      {step === 'payment' && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
          <p className="text-sm text-slate-600">Thanh toán mô phỏng:</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => pay(true)}
              disabled={paying}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {paying ? 'Đang xử lý...' : 'Thanh toán thành công'}
            </button>
            <button
              type="button"
              onClick={() => pay(false)}
              disabled={paying}
              className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Thanh toán thất bại
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
          <h2 className="text-lg font-bold text-emerald-800">Đặt vé thành công!</h2>
          <p className="mt-2 text-sm text-emerald-700">Vé điện tử đã được gửi qua email (mock).</p>
          <button
            type="button"
            onClick={() => router.push('/lookup')}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Tra cứu vé
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20';
