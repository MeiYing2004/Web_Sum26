'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, type MotionValue } from 'framer-motion';
import { HERO_CAROUSEL_SLIDES } from '@/lib/images';
import { cn } from '@/lib/cn';

const AUTO_PLAY_MS = 3000;
const FADE_MS = 800;

type HeroCarouselProps = {
  parallaxY?: MotionValue<string>;
  className?: string;
};

function usePreloadNextImage(
  currentIndex: number,
  onPreloaded: (index: number) => void
) {
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % HERO_CAROUSEL_SLIDES.length;
    const img = new window.Image();
    img.onload = () => onPreloaded(nextIndex);
    img.src = HERO_CAROUSEL_SLIDES[nextIndex].src;
  }, [currentIndex, onPreloaded]);
}

export function HeroCarousel({ parallaxY, className }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set([0]));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const markLoaded = useCallback((index: number) => {
    setLoadedSlides((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const goTo = useCallback((index: number) => {
    const normalized = ((index % HERO_CAROUSEL_SLIDES.length) + HERO_CAROUSEL_SLIDES.length) % HERO_CAROUSEL_SLIDES.length;
    setCurrentIndex(normalized);
    markLoaded(normalized);
  }, [markLoaded]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  const resetAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % HERO_CAROUSEL_SLIDES.length;
        markLoaded(next);
        return next;
      });
    }, AUTO_PLAY_MS);
  }, [markLoaded]);

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetAutoPlay]);

  usePreloadNextImage(currentIndex, markLoaded);

  const handleManualNav = useCallback(
    (action: () => void) => {
      action();
      resetAutoPlay();
    },
    [resetAutoPlay]
  );

  const background = (
  <>
      {HERO_CAROUSEL_SLIDES.map((slide, index) => {
        if (!loadedSlides.has(index)) return null;

        const isActive = index === currentIndex;

        return (
          <div
            key={slide.src}
            aria-hidden={!isActive}
            className={cn(
              'absolute inset-0 transition-opacity ease-in-out',
              isActive ? 'z-[1] opacity-100' : 'z-0 opacity-0 pointer-events-none'
            )}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        );
      })}

      <div
        className="absolute inset-0 z-[2]"
        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
        aria-hidden
      />
  </>
  );

  return (
    <div className={cn('absolute inset-0', className)}>
      {parallaxY ? (
        <motion.div style={{ y: parallaxY }} className="absolute inset-0 scale-110">
          {background}
        </motion.div>
      ) : (
        <div className="absolute inset-0 scale-110">{background}</div>
      )}

      <button
        type="button"
        onClick={() => handleManualNav(goPrev)}
        aria-label="Ảnh trước"
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white/90 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/50 sm:left-4 sm:p-2.5"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <button
        type="button"
        onClick={() => handleManualNav(goNext)}
        aria-label="Ảnh tiếp theo"
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white/90 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/50 sm:right-4 sm:p-2.5"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-8">
        {HERO_CAROUSEL_SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Chuyển đến ảnh ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : undefined}
            onClick={() => handleManualNav(() => goTo(index))}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'w-6 bg-white'
                : 'w-2 bg-white/45 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  );
}
