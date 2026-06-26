'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ClipboardList, Loader2, Search, Ticket } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { ETicketCard } from '@/components/ETicketCard';
import { gql } from '@/lib/graphql';
import { getStoredProfile } from '@/lib/auth';
import {
  type ETicket,
  type TicketFilter,
  ETICKET_FIELDS,
  TICKET_FILTER_OPTIONS,
  groupTicketsByBooking,
  formatTicketDateTime,
} from '@/lib/tickets';
import { type Review, REVIEW_FIELDS } from '@/lib/reviews';
import { PageShell, PageHeader } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonTicketList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

function MyTicketsContent() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<ETicket[]>([]);
  const [reviewsByBooking, setReviewsByBooking] = useState<Record<string, Review>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TicketFilter>('ALL');
  useEffect(() => {
    const raw = (searchParams.get('filter') || 'ALL').toUpperCase();
    const allowed: TicketFilter[] = ['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'];
    setFilter(allowed.includes(raw as TicketFilter) ? (raw as TicketFilter) : 'ALL');
  }, [searchParams]);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profile = getStoredProfile();
      const ticketData = await gql<{ myTickets: ETicket[] }>(
        `query($search:String,$filter:String,$email:String){
          myTickets(search:$search,filter:$filter,email:$email){${ETICKET_FIELDS}}
        }`,
        {
          search: debouncedSearch || null,
          filter: filter === 'ALL' ? null : filter,
          email: profile?.email || null,
        }
      );
      setTickets(ticketData.myTickets);

      const reviewMap: Record<string, Review> = {};
      try {
        const reviewData = await gql<{ myReviews: Review[] }>(
          `query { myReviews {${REVIEW_FIELDS}} }`
        );
        for (const review of reviewData.myReviews) {
          reviewMap[review.bookingId] = review;
        }
      } catch {
        /* review API chưa sẵn sàng — vẫn hiển thị vé */
      }
      setReviewsByBooking(reviewMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải vé');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  const handleReviewSubmitted = useCallback((review: Review) => {
    setReviewsByBooking((prev) => ({ ...prev, [review.bookingId]: review }));
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const groups = useMemo(() => {
    const map = groupTicketsByBooking(tickets);
    return Array.from(map.entries()).sort((a, b) => {
      const tA = a[1][0]?.createdAt ?? '';
      const tB = b[1][0]?.createdAt ?? '';
      return tB.localeCompare(tA);
    });
  }, [tickets]);

  return (
    <div className="ticket-page-bg min-h-[calc(100vh-80px)]">
      <PageShell className="max-w-[1320px]">
        <PageHeader
          title="Vé của tôi"
          description="Quản lý vé điện tử và lịch sử đặt chỗ"
        />

        <Card variant="glass" padding="md" className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã vé, SĐT, email..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {TICKET_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilter(opt.value)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-caption font-medium transition-colors',
                    filter === opt.value
                      ? 'bg-brand text-white shadow-card'
                      : 'border border-slate-200 bg-white text-ink-muted hover:border-brand/30 hover:text-brand'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {loading && <SkeletonTicketList count={2} />}
          </AnimatePresence>

          {error && (
            <Card variant="flat" padding="md" className="border-danger/20 bg-danger-light text-center">
              <p className="text-caption text-danger">{error}</p>
            </Card>
          )}

          {!loading && !error && groups.length === 0 && (
            <EmptyState
              icon={Ticket}
              title="Không có vé"
              description={
                debouncedSearch || filter !== 'ALL'
                  ? 'Không tìm thấy vé phù hợp bộ lọc'
                  : 'Đặt chuyến xe đầu tiên để nhận vé điện tử'
              }
              actionLabel="Tìm chuyến xe"
              actionHref="/"
            />
          )}

          {!loading &&
            groups.map(([bookingId, bookingTickets], i) => {
              const first = bookingTickets[0];
              const { date, time } = formatTicketDateTime(first.departureTime);
              const total = bookingTickets.reduce((s, t) => s + t.totalAmount, 0);
              return (
                <motion.div
                  key={bookingId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="space-y-3"
                >
                  <Card variant="glass" padding="sm" className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-mono text-caption font-bold text-brand">{first.bookingCode}</p>
                        <p className="text-micro text-ink-muted">
                          {first.routeName} · {date} {time} · {bookingTickets.length} ghế ·{' '}
                          {total.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/my-tickets/${first.bookingCode}`}>
                        <Button variant="secondary" size="sm">
                          Xem tất cả
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                  <ETicketCard
                    ticket={first}
                    compact
                    showActions
                    allowCancel
                    review={reviewsByBooking[bookingId]}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancelled={fetchTickets}
                  />
                </motion.div>
              );
            })}
        </div>
      </PageShell>
    </div>
  );
}

export default function MyTicketsPage() {
  return (
    <AuthGuard requireAuth>
      <Suspense
        fallback={
          <div className="ticket-page-bg flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        }
      >
        <MyTicketsContent />
      </Suspense>
    </AuthGuard>
  );
}
