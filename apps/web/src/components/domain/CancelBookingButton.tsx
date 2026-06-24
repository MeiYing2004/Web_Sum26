'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';
import { useAuth } from '@/hooks/useAuth';
import { type ETicket, getCancelEligibility } from '@/lib/tickets';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const LOGIN_REQUIRED_MSG = 'Vui lòng đăng nhập để quản lý hoặc hủy vé.';

type Props = {
  ticket: ETicket;
  /** Booking owner — chỉ hiện nút khi khớp user đang đăng nhập */
  bookingUserId?: string | null;
  onCancelled?: () => void;
  className?: string;
};

export function CancelBookingButton({ ticket, bookingUserId, onCancelled, className }: Props) {
  const { isLoggedIn, user, getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const eligibility = getCancelEligibility(ticket);

  if (!eligibility.canCancel) return null;

  const ownsBooking =
    isLoggedIn &&
    !!user?.userId &&
    !!bookingUserId &&
    bookingUserId === user.userId;

  if (!ownsBooking) return null;

  function handleOpen() {
    if (!isLoggedIn || !getToken()) {
      toast.error(LOGIN_REQUIRED_MSG);
      return;
    }
    setOpen(true);
  }

  async function confirmCancel() {
    const token = getToken();
    if (!token || !user?.userId) {
      toast.error(LOGIN_REQUIRED_MSG);
      return;
    }

    setLoading(true);
    try {
      const data = await gql<{
        cancelBooking: { success: boolean; message: string };
      }>(
        `mutation($bookingId:ID!){ cancelBooking(bookingId:$bookingId){ success message } }`,
        { bookingId: ticket.bookingId },
        { token }
      );

      if (data.cancelBooking.success) {
        toast.success(data.cancelBooking.message || 'Đã hủy đặt vé');
        setOpen(false);
        onCancelled?.();
      } else {
        toast.error(data.cancelBooking.message || 'Không thể hủy đặt vé');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy đặt vé');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={className}
        onClick={handleOpen}
      >
        <XCircle className="h-4 w-4" />
        Hủy đặt vé
      </Button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} title="Xác nhận hủy vé">
        <div className="space-y-4">
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Điều kiện hủy vé</p>
              <p className="mt-1">{eligibility.policyNote}</p>
              {eligibility.refundHint ? (
                <p className="mt-2 font-medium text-amber-800">{eligibility.refundHint}</p>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Bạn sắp hủy đơn <span className="font-mono font-semibold">{ticket.bookingCode}</span> (
            {ticket.routeName}, ghế {ticket.seatId}). Hành động này không thể hoàn tác.
          </p>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" disabled={loading} onClick={() => setOpen(false)}>
              Giữ vé
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-700"
              disabled={loading}
              onClick={confirmCancel}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              {loading ? 'Đang hủy...' : 'Xác nhận hủy'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
