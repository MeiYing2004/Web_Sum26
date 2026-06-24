import { Badge } from '@/components/ui/Badge';

export function TripAvailabilityBadge({ label, status }: { label: string; status?: string }) {
  if (!label) return null;
  const variant = status === 'UPCOMING' ? 'warning' : 'danger';
  return <Badge variant={variant}>{label}</Badge>;
}
