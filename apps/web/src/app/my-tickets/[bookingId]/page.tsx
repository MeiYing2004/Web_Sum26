'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { ETicketCard } from '@/components/ETicketCard';
import { gql } from '@/lib/graphql';
import { type ETicket, ETICKET_FIELDS } from '@/lib/tickets';
import { PageShell, PageHeader } from '@/components/ui/PageShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function BookingTicketsContent() {
  const params = useParams();
  const bookingRef = String(params.bookingId ?? '').trim();

  const [tickets, setTickets] = useState<ETicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    if (!bookingRef) return;
    setLoading(true);
    try {
      const data = await gql<{ ticketsForBooking: ETicket[] }>(
        `query($bookingId:ID!){
          ticketsForBooking(bookingId:$bookingId){${ETICKET_FIELDS}}
        }`,
        { bookingId: bookingRef }
      );
      setTickets(data.ticketsForBooking);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải vé');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [bookingRef]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  return (
    <div className="ticket-page-bg min-h-[calc(100vh-80px)]">
      <PageShell className="max-w-[1320px]">
        <Link href="/my-tickets">
          <Button variant="secondary" size="sm" className="mb-5">
            <ArrowLeft className="h-4 w-4" />
            Vé của tôi
          </Button>
        </Link>

        <PageHeader
          title="Chi tiết vé điện tử"
          description={
            tickets.length > 0
              ? `Mã đặt chỗ ${bookingRef}${tickets.length > 1 ? ` · ${tickets.length} vé` : ''}`
              : undefined
          }
        />

        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-brand" />
            <p className="text-caption text-ink-muted">Đang tải vé...</p>
          </div>
        )}

        {error && (
          <Card variant="flat" padding="md" className="border-danger/20 bg-danger-light text-center">
            <p className="text-caption text-danger">{error}</p>
          </Card>
        )}

        {!loading && !error && tickets.length === 0 && (
          <Card variant="flat" padding="md" className="border-warning/20 bg-warning-light text-center">
            <p className="text-caption text-warning">
              Không tìm thấy vé với mã <span className="font-mono font-semibold">{bookingRef}</span>
            </p>
          </Card>
        )}

        <div className="space-y-8 pb-8">
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <ETicketCard
                ticket={ticket}
                isDetailView
                showActions
                allowCancel={i === 0}
                onCancelled={loadTickets}
              />
            </motion.div>
          ))}
        </div>
      </PageShell>
    </div>
  );
}

export default function BookingTicketsPage() {
  return (
    <AuthGuard requireAuth>
      <Suspense
        fallback={
          <div className="ticket-page-bg flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        }
      >
        <BookingTicketsContent />
      </Suspense>
    </AuthGuard>
  );
}
