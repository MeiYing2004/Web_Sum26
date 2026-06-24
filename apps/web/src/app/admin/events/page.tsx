'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Construction } from 'lucide-react';
import { gql } from '@/lib/graphql';
import { useAuth } from '@/hooks/useAuth';
import { formatAdminDate } from '@/lib/admin-datetime';
import { statusLabel, statusTone } from '@/lib/admin-dashboard';
import { ADMIN_EVENT_LOGS_ENABLED } from '@/lib/admin-features';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import EmptyState from '@/components/admin/EmptyState';

type EventLog = {
  id: string;
  bookingId: string;
  bookingCode: string;
  eventType: string;
  detail: string;
  createdAt: string;
};

const EVENT_LOGS_QUERY = `
  query AdminEventLogs($limit: Int) {
    adminEventLogs(limit: $limit) {
      id
      bookingId
      bookingCode
      eventType
      detail
      createdAt
    }
  }
`;

export default function AdminEventsPage() {
  if (!ADMIN_EVENT_LOGS_ENABLED) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-500">Theo dõi thay đổi trạng thái booking</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nhật ký sự kiện</h2>
        </div>
        <EmptyState
          icon={Construction}
          title="Chức năng đang được phát triển"
          description="Nhật ký sự kiện sẽ sớm khả dụng khi backend hoàn thiện."
        />
      </div>
    );
  }

  return <AdminEventsContent />;
}

function AdminEventsContent() {
  const { getToken } = useAuth();
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Vui lòng đăng nhập');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await gql<{ adminEventLogs: EventLog[] }>(EVENT_LOGS_QUERY, { limit: 100 }, { token });
      setEvents(res.adminEventLogs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được nhật ký');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Theo dõi thay đổi trạng thái booking</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nhật ký sự kiện</h2>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <Card variant="glass" padding="none" className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <Activity className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">Chưa có sự kiện nào được ghi nhận</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Mã booking</th>
                  <th className="px-4 py-3">Sự kiện</th>
                  <th className="px-4 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatAdminDate(ev.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">
                      {ev.bookingCode}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                          statusTone(ev.eventType)
                        )}
                      >
                        {statusLabel(ev.eventType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{ev.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
