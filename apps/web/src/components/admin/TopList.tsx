import { Card } from '@/components/ui/Card';
import type { LucideIcon } from 'lucide-react';
import { type AdminRankItem, formatVnd } from '@/lib/admin-dashboard';
import EmptyState from './EmptyState';

type Props = {
  title: string;
  icon: LucideIcon;
  items: AdminRankItem[];
  valueLabel?: string;
};

export default function TopList({ title, icon, items, valueLabel = 'vé' }: Props) {
  return (
    <Card variant="glass" padding="md">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>

      {!items.length ? (
        <EmptyState icon={icon} title="Chưa có dữ liệu" description="Dữ liệu sẽ hiển thị khi có giao dịch thực tế." />
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={`${item.name}-${item.subtitle}-${i}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-100/80 bg-white/60 px-3 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                {item.subtitle ? (
                  <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  {item.count} {valueLabel}
                </p>
                <p className="text-xs text-indigo-600">{formatVnd(item.revenue)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
