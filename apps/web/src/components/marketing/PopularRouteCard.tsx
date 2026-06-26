'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bus, Clock, MapPin, Route, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RouteCardImage } from '@/components/marketing/RouteCardImage';
import { formatDurationMinutes, type CatalogRoute } from '@/lib/route-catalog';
import {
  formatDistanceKm,
  popularOperatorForRoute,
  routeDistanceKm,
  routeRating,
} from '@/lib/route-display';
import { getRouteDisplayMeta } from '@/lib/route-metadata';
import { getRouteImage } from '@/lib/images';
import { buildTripsSeoUrl } from '@/lib/trip-search';
import { cn } from '@/lib/cn';

type PopularRouteCardProps = {
  route: CatalogRoute;
  travelDate: string;
  index?: number;
  className?: string;
};

/** Card tuyến phổ biến — ảnh & metadata theo cung đường thực tế */
export function PopularRouteCard({ route, travelDate, index = 0, className }: PopularRouteCardProps) {
  const href = buildTripsSeoUrl(route.origin, route.destination, travelDate);
  const meta = getRouteDisplayMeta(route.origin, route.destination);
  const distanceKm = routeDistanceKm(route.origin, route.destination, route.durationMinutes);
  const operator = popularOperatorForRoute(route.origin, route.destination);
  const rating = routeRating(route.origin, route.destination);
  const imageSrc = getRouteImage(route.origin, route.destination);
  const imageAlt =
    meta?.imageAlt ?? `Tuyến xe ${route.origin} đến ${route.destination}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        'group overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-2 hover:border-brand/20 hover:shadow-elevated',
        className
      )}
    >
      <div className="relative overflow-hidden">
        <RouteCardImage
          src={imageSrc}
          alt={imageAlt}
          priority={index < 3}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-3 left-4 right-4">
          <h3 className="text-card-title font-bold text-white drop-shadow-sm">
            {route.origin} <span className="text-brand-300">→</span> {route.destination}
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-3 text-caption text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand" />
            {formatDurationMinutes(route.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand" />
            {formatDistanceKm(distanceKm)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bus className="h-4 w-4 text-brand" />
            {route.tripsCount} chuyến hôm nay
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-micro font-semibold text-amber-700 ring-1 ring-amber-200/80">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
            <span className="text-caption text-ink-muted">
              <Route className="mr-1 inline h-3.5 w-3.5" />
              {operator}
            </span>
          </div>
          <div className="text-right">
            <p className="text-micro text-ink-subtle">Giá từ</p>
            <p className="text-xl font-bold text-brand">
              {route.minPrice.toLocaleString('vi-VN')}
              <span className="text-sm font-medium">đ</span>
            </p>
          </div>
        </div>

        <Link href={href} className="mt-auto">
          <Button className="btn-ripple h-11 w-full bg-gradient-to-r from-brand-600 to-brand-500 shadow-card hover:shadow-elevated">
            Xem chuyến
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
