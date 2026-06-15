'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bus, Calendar, Ticket } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';

type Booking = {
  id: string;
  bookingCode: string;
  status: string;
  tripId: string;
  totalAmount: number;
  createdAt: string;
};

export default function MyBookingsPage() {
  return (
    <AuthGuard requireAuth>
      <MyBookingsContent />
    </AuthGuard>
  );
}

function MyBookingsContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    gql<{ myBookings: Booking[] }>(
      `query { myBookings { id bookingCode status tripId totalAmount createdAt } }`
    )
      .then((d) => setBookings(d.myBookings))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử vé của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý và theo dõi các đặt vé của bạn</p>
      </motion.div>

      <div className="mt-8 space-y-4">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-48 rounded bg-gray-100" />
            </div>
          ))}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Bus className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 font-medium text-gray-600">Chưa có vé nào</p>
            <p className="mt-1 text-sm text-gray-400">Đặt chuyến xe đầu tiên ngay hôm nay</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
            >
              Tìm chuyến xe
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!loading &&
          bookings.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold text-gray-900">{b.bookingCode}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">
                    {b.totalAmount.toLocaleString('vi-VN')}đ
                  </p>
                  <Link
                    href={`/lookup?code=${encodeURIComponent(b.bookingCode)}&email=${encodeURIComponent(user?.email || '')}`}
                    className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Chi tiết vé →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: 'bg-emerald-50 text-emerald-700',
    PENDING_PAYMENT: 'bg-amber-50 text-amber-700',
    CANCELLED: 'bg-red-50 text-red-600',
    TICKET_ISSUED: 'bg-indigo-50 text-indigo-700',
    EXPIRED: 'bg-gray-100 text-gray-600',
    CHECKED_IN: 'bg-violet-50 text-violet-700',
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
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}
