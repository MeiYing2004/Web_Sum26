'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';
import { type AdminTrip } from '@/lib/admin-crud';
import { SeatMapGrid } from '@/components/SeatMapGrid';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface SeatRow {
  seatId: string;
  seatLabel: string;
  status: string;
}

interface Props {
  trip: AdminTrip | null;
  open: boolean;
  onClose: () => void;
}

export function TripSeatModal({ trip, open, onClose }: Props) {
  const { getToken } = useAuth();
  const [layout, setLayout] = useState<{ type: string; floors: Array<{ label?: string; rows: string[][] }> } | null>(
    null
  );
  const [seats, setSeats] = useState<SeatRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!trip || !open) return;
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setSelected([]);
    try {
      const data = await gql<{ seatMap: { layoutJson: string; seats: SeatRow[] } }>(
        `{ seatMap(tripId: "${trip.id}") { layoutJson seats { seatId seatLabel status } } }`,
        undefined,
        { token }
      );
      setLayout(JSON.parse(data.seatMap.layoutJson));
      setSeats(data.seatMap.seats);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tải sơ đồ ghế thất bại');
    } finally {
      setLoading(false);
    }
  }, [trip, open, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSeat(seatId: string) {
    const status = seats.find((s) => s.seatId === seatId)?.status;
    if (status !== 'AVAILABLE' && status !== 'BLOCKED') return;
    setSelected((prev) => (prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]));
  }

  async function applyBlock(blocked: boolean) {
    if (!trip || !selected.length) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await gql(
        `mutation($tripId:ID!,$seatIds:[ID!]!,$blocked:Boolean!){blockSeats(tripId:$tripId,seatIds:$seatIds,blocked:$blocked)}`,
        { tripId: trip.id, seatIds: selected, blocked },
        { token }
      );
      toast.success(blocked ? 'Đã khóa ghế' : 'Đã mở khóa ghế');
      setSelected([]);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thao tác ghế thất bại');
    } finally {
      setSaving(false);
    }
  }

  const toBlock = selected.filter((id) => seats.find((s) => s.seatId === id)?.status === 'AVAILABLE');
  const toUnblock = selected.filter((id) => seats.find((s) => s.seatId === id)?.status === 'BLOCKED');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quản lý ghế"
      description={trip ? `${trip.routeName} — ${trip.busPlate}` : undefined}
      size="lg"
      className="max-w-3xl"
    >
      {loading || !layout ? (
        <p className="text-sm text-slate-500">Đang tải sơ đồ ghế...</p>
      ) : (
        <div className="space-y-4">
          <SeatMapGrid
            layout={layout}
            seats={seats}
            selected={selected}
            onSelect={toggleSeat}
            adminMode
          />
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              variant="danger"
              size="sm"
              disabled={!toBlock.length || saving}
              onClick={() => applyBlock(true)}
            >
              Khóa ghế ({toBlock.length})
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!toUnblock.length || saving}
              onClick={() => applyBlock(false)}
            >
              Mở khóa ({toUnblock.length})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
