import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

export default function EmptyState({ icon: Icon, title, description }: Props) {
  return (
    <Card variant="dashed" padding="lg" className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-caption font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-micro text-ink-muted">{description}</p> : null}
    </Card>
  );
}
