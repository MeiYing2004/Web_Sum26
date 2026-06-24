'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';
import { formatPrice, formatAdminDateTime, type AdminTrip } from '@/lib/admin-crud';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

type BookingRow = {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
  guestEmail: string;
  passengers: Array<{ fullName: string; phone: string; seatId: string }>;
  createdAt: string;
};

interface Props {
  trip: AdminTrip | null;
  open: boolean;
  onClose: () => void;
}

export function TripBookingsModal({ trip, open, onClose }: Props) {
  const { getToken } = useAuth();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!trip || !open) return;
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const q = search ? `, search: "${search.replace(/"/g, '')}"` : '';
      const data = await gql<{ adminBookingsByTrip: { bookings: BookingRow[]; total: number } }>(
        `{ adminBookingsByTrip(tripId: "${trip.id}"${q}) { total bookings { id bookingCode status totalAmount guestEmail createdAt passengers { fullName phone seatId } } } }`,
        undefined,
        { token }
      );
      setRows(data.adminBookingsByTrip.bookings);
      setTotal(data.adminBookingsByTrip.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tải booking thất bại');
    } finally {
      setLoading(false);
    }
  }, [trip, open, search, getToken]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function checkIn(code: string) {
    const token = getToken();
    if (!token) return;
    setCheckingIn(code);
    try {
      await gql(`mutation($code:String!){checkIn(bookingCode:$code){success message}}`, { code }, { token });
      toast.success('Check-in thành công');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Check-in thất bại');
    } finally {
      setCheckingIn(null);
    }
  }

  function exportCsv() {
    if (!rows.length) return;
    const header = ['Mã đặt', 'Khách', 'Ghế', 'SĐT', 'Email', 'Số tiền', 'Trạng thái', 'Ngày tạo'];
    const lines = rows.flatMap((b) =>
      b.passengers.map((p) =>
        [b.bookingCode, p.fullName, p.seatId, p.phone, b.guestEmail, b.totalAmount, b.status, formatAdminDateTime(b.createdAt)]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${trip?.id || 'trip'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking theo chuyến"
      description={
        trip
          ? `${trip.routeName} — ${trip.busPlate} · Khởi hành ${formatAdminDateTime(trip.departureTime)}`
          : undefined
      }
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đặt, tên, SĐT..."
            className="max-w-xs"
          />
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!rows.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Đang tải...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có booking cho chuyến này ({total})</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đặt</TableHead>
                <TableHead>Khách / Ghế</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.bookingCode}</TableCell>
                  <TableCell>
                    {b.passengers.map((p) => (
                      <div key={p.seatId} className="text-sm">
                        {p.fullName} — ghế {p.seatId}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{formatAdminDateTime(b.createdAt)}</TableCell>
                  <TableCell>{formatPrice(b.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === 'CHECKED_IN' ? 'success' : 'default'}>{b.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {b.status === 'TICKET_ISSUED' || b.status === 'PAID' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={checkingIn === b.bookingCode}
                        onClick={() => checkIn(b.bookingCode)}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Check-in
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Modal>
  );
}
