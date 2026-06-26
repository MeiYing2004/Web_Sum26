import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

/** Ánh xạ trạng thái chuyến xe → màu badge */
const STATUS_VARIANT: Record<string, 'warning' | 'brand' | 'success' | 'danger' | 'default' | 'outline'> = {
  UPCOMING: 'warning',    // Sắp khởi hành
  DEPARTED: 'brand',      // Đang chạy
  COMPLETED: 'success',   // Đã hoàn thành
  CANCELLED: 'danger',    // Đã hủy
  SOLD_OUT: 'danger',     // Đầy chỗ
  INACTIVE: 'default',
  PAST_DAY: 'default',
  AVAILABLE: 'success',
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Sắp khởi hành',
  DEPARTED: 'Đang chạy',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  SOLD_OUT: 'Đầy chỗ',
};

export function TripAvailabilityBadge({
  label,
  status,
  className,
}: {
  label: string;
  status?: string;
  className?: string;
}) {
  const normalized = status?.toUpperCase() ?? '';
  const displayLabel = label || STATUS_LABEL[normalized] || '';
  if (!displayLabel) return null;

  const variant = STATUS_VARIANT[normalized] ?? 'default';

  return (
    <Badge variant={variant} className={cn(className)}>
      {displayLabel}
    </Badge>
  );
}
