'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/Skeleton';
import { IMAGES } from '@/lib/images';
import { cn } from '@/lib/cn';

type RouteCardImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Ảnh tuyến 16:9 — skeleton khi tải, fallback khi lỗi */
export function RouteCardImage({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
}: RouteCardImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageSrc = error ? IMAGES.routeFallback : src;

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden bg-slate-200', className)}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" aria-hidden />}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={cn(
          'object-cover transition-[transform,opacity] duration-500 ease-smooth group-hover:scale-105',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}
