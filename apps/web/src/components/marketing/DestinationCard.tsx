'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getDestinationImage } from '@/lib/images';
import { buildDestinationSearchUrl } from '@/lib/trip-search';
import { todayVN } from '@/lib/datetime';
import { cn } from '@/lib/cn';

export type DestinationCardData = {
  city: string;
  slug?: string;
  tagline: string;
  routeCount: number;
  priceFrom?: number | null;
};

type DestinationCardProps = {
  dest: DestinationCardData;
  travelDate?: string;
  index?: number;
  className?: string;
};

/** Card điểm đến — ảnh địa danh, gradient, hover zoom 1.05 */
export function DestinationCard({ dest, travelDate, index = 0, className }: DestinationCardProps) {
  const href = buildDestinationSearchUrl(dest.city, travelDate ?? todayVN());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn('group', className)}
    >
      <Link
        href={href}
        className="relative block overflow-hidden rounded-2xl shadow-soft transition-shadow duration-300 ease-out hover:shadow-elevated"
      >
        <div className="relative h-56 sm:h-64">
          <Image
            src={getDestinationImage(dest.city)}
            alt={`${dest.city} — ${dest.tagline}`}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-card-title font-bold text-white">{dest.city}</h3>
            <p className="mt-1 text-caption text-white/85">{dest.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-micro font-medium text-white backdrop-blur-sm">
                <MapPin className="h-3 w-3" />
                {dest.routeCount} tuyến
              </span>
              {dest.priceFrom != null && dest.priceFrom > 0 && (
                <span className="text-sm font-semibold text-white">
                  từ {dest.priceFrom.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
