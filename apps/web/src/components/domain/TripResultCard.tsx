'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Star,
  Wifi,
  Droplets,
  Plug,
  Armchair,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TripAvailabilityBadge } from '@/components/TripAvailabilityBadge';
import { getBusImage } from '@/lib/images';
import { operatorRating } from '@/lib/marketing';
import { cn } from '@/lib/cn';

export interface TripResultItem {
  id: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  arrivalTime?: string;
  price: number;
  availableSeats: number;
  bookable: boolean;
  availabilityLabel?: string;
  availabilityStatus?: string;
  durationMinutes?: number;
}

const AMENITY_ICONS = [
  { icon: Wifi, label: 'WiFi' },
  { icon: Droplets, label: 'Nước' },
  { icon: Plug, label: 'USB' },
  { icon: Armchair, label: 'Ghế ngả' },
] as const;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

function formatDuration(mins?: number) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}p`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}p`;
}

export function TripResultCard({
  trip,
  index = 0,
  promoCode,
}: {
  trip: TripResultItem;
  index?: number;
  promoCode?: string | null;
}) {
  const router = useRouter();
  const depTime = formatTime(trip.departureTime);
  const arrTime = trip.arrivalTime ? formatTime(trip.arrivalTime) : null;
  const rating = operatorRating(trip.operatorName);
  const busImage = getBusImage(trip.busType);
  const initials = trip.operatorName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className={cn(
        'group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition-all duration-300',
        trip.bookable
          ? 'hover:-translate-y-1 hover:border-brand/20 hover:shadow-elevated'
          : 'opacity-80'
      )}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Bus image */}
        <div className="relative h-44 shrink-0 overflow-hidden lg:h-auto lg:w-52">
          <Image
            src={busImage}
            alt={trip.busType}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 208px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r" />
          <Badge variant="brand" className="absolute left-3 top-3 bg-white/90 text-brand backdrop-blur-sm">
            {trip.busType}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-micro font-bold text-white shadow-sm">
                {initials}
              </div>
              <div>
                <h3 className="text-subtitle font-semibold text-ink">{trip.operatorName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-micro font-semibold text-amber-700 ring-1 ring-amber-200/80">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {trip.availableSeats} ghế trống
                  </span>
                </div>
              </div>
            </div>

            {/* Time block */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-ink">{depTime}</p>
                <p className="text-micro text-ink-subtle">Khởi hành</p>
              </div>
              <div className="flex flex-col items-center gap-1 px-2">
                <div className="h-px w-12 bg-slate-200" />
                <span className="text-micro font-medium text-ink-muted">
                  {formatDuration(trip.durationMinutes) || '—'}
                </span>
                <div className="h-px w-12 bg-slate-200" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-ink">{arrTime || '—'}</p>
                <p className="text-micro text-ink-subtle">Đến nơi</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {AMENITY_ICONS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-sunken px-2.5 py-1 text-micro text-ink-muted"
              >
                <Icon className="h-3 w-3 text-brand/70" />
                {label}
              </span>
            ))}
          </div>

          {trip.availabilityLabel && (
            <div className="mt-3">
              <TripAvailabilityBadge label={trip.availabilityLabel} status={trip.availabilityStatus} />
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
            <div>
              <p className="text-micro text-ink-subtle">Giá từ</p>
              <p className="text-2xl font-bold text-brand">
                {trip.price.toLocaleString('vi-VN')}
                <span className="text-sm font-medium">đ</span>
              </p>
              <p className="text-micro text-ink-muted">/ ghế · chưa gồm phí dịch vụ</p>
            </div>

            {trip.bookable ? (
              <Button
                size="lg"
                onClick={() => {
                  const path = `/trips/${encodeURIComponent(trip.id)}`;
                  const withPromo = promoCode ? `${path}?promo=${encodeURIComponent(promoCode)}` : path;
                  router.push(withPromo);
                }}
                className="bg-gradient-to-r from-brand-600 to-brand-700 shadow-card group-hover:shadow-elevated"
              >
                Chọn ghế
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            ) : (
              <Badge variant="danger" className="px-4 py-2 text-body">
                {trip.availabilityLabel || 'Hết vé'}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
