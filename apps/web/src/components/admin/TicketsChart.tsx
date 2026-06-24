'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { type DailyRevenue, formatShortDate } from '@/lib/admin-dashboard';

type Props = {
  data: DailyRevenue[];
};

const W = 640;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 32, left: 12 };

export default function TicketsChart({ data }: Props) {
  const bars = useMemo(() => {
    if (!data.length) {
      return { items: [] as Array<{ x: number; y: number; h: number; w: number; label: string; count: number }>, max: 0 };
    }
    const max = Math.max(...data.map((d) => d.bookingCount), 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const barW = Math.max(8, innerW / data.length - 4);

    const items = data.map((d, i) => {
      const h = (d.bookingCount / max) * innerH;
      const x = PAD.left + i * (innerW / data.length) + 2;
      const y = PAD.top + innerH - h;
      return { x, y, h, w: barW, label: formatShortDate(d.date), count: d.bookingCount };
    });

    return { items, max };
  }, [data]);

  return (
    <Card variant="glass" padding="md">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Vé bán theo ngày</h3>
        <p className="text-xs text-slate-500">Số lượng vé xuất trong khoảng thời gian</p>
      </div>

      {!bars.items.length ? (
        <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
          Chưa có dữ liệu vé bán
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full" role="img" aria-label="Vé bán theo ngày">
          {bars.items.map((b, i) => (
            <g key={i}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                rx={4}
                fill="url(#barGrad)"
                opacity={0.9}
              />
              {b.count > 0 ? (
                <title>{`${b.label}: ${b.count} vé`}</title>
              ) : null}
            </g>
          ))}
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </Card>
  );
}
