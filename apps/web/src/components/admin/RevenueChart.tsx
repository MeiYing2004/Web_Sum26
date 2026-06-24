'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { type DailyRevenue, formatShortDate, formatVnd } from '@/lib/admin-dashboard';

type Props = {
  title: string;
  data: DailyRevenue[];
  rangeLabel: string;
};

const W = 640;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 32, left: 12 };

export default function RevenueChart({ title, data, rangeLabel }: Props) {
  const { path, area, labels, maxY, hasData } = useMemo(() => {
    if (!data.length) {
      return { path: '', area: '', labels: [] as string[], maxY: 0, hasData: false };
    }

    const max = Math.max(...data.map((d) => d.revenue), 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    const points = data.map((d, i) => {
      const x = PAD.left + i * step;
      const y = PAD.top + innerH - (d.revenue / max) * innerH;
      return { x, y, d };
    });

    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${line} L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

    const tickLabels = data
      .filter((_, i) => i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0)
      .map((d) => formatShortDate(d.date));

    return { path: line, area: areaPath, labels: tickLabels, maxY: max, hasData: true };
  }, [data]);

  return (
    <Card variant="glass" padding="md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{rangeLabel}</p>
        </div>
        {hasData ? (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            Max {formatVnd(maxY)}
          </span>
        ) : null}
      </div>

      {!hasData ? (
        <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500">
          Chưa có dữ liệu doanh thu
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full" role="img" aria-label={title}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={PAD.top + (H - PAD.top - PAD.bottom) * t}
              y2={PAD.top + (H - PAD.top - PAD.bottom) * t}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          ))}
          <path d={area} fill="url(#revGrad)" />
          <path d={path} fill="none" stroke="url(#revStroke)" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {hasData ? (
        <div className="mt-2 flex justify-between text-[10px] text-slate-400">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
