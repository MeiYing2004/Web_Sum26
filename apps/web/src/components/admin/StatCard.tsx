import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: string;
};

export default function StatCard({ label, value, hint, icon: Icon, accent }: Props) {
  return (
    <Card variant="glass" padding="md" className="group relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-micro font-medium uppercase tracking-wide text-ink-muted">{label}</p>
          <p className="mt-1.5 truncate text-title text-ink">{value}</p>
          {hint ? <p className="mt-0.5 text-micro text-ink-muted">{hint}</p> : null}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-card`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
