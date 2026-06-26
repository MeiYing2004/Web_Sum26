'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

type ParsedStat = {
  numeric: number;
  prefix: string;
  suffix: string;
  decimals: number;
};

function parseStatValue(value: string): ParsedStat {
  const match = value.match(/^([^0-9]*)([0-9][0-9.,]*)(.*)$/);
  if (!match) {
    return { prefix: '', numeric: 0, suffix: value, decimals: 0 };
  }
  const [, prefix, raw, suffix] = match;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const numeric = Number.parseFloat(normalized);
  const decimals = raw.includes(',') || (raw.includes('.') && raw.split('.')[1]?.length === 1) ? 1 : 0;
  return {
    prefix: prefix ?? '',
    numeric: Number.isFinite(numeric) ? numeric : 0,
    suffix: suffix ?? '',
    decimals,
  };
}

function formatStatValue({ prefix, numeric, suffix, decimals }: ParsedStat): string {
  const formatted =
    decimals > 0
      ? numeric.toLocaleString('vi-VN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.round(numeric).toLocaleString('vi-VN');
  return `${prefix}${formatted}${suffix}`;
}

type AnimatedCounterProps = {
  value: string;
  duration?: number;
  className?: string;
};

/** Animated number counter — triggers on scroll into view */
export function AnimatedCounter({ value, duration = 1800, className }: AnimatedCounterProps) {
  const parsed = parseStatValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(formatStatValue({ ...parsed, numeric: 0 }));

  useEffect(() => {
    started.current = false;
    setDisplay(formatStatValue({ ...parsed, numeric: 0 }));
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setDisplay(formatStatValue({ ...parsed, numeric: parsed.numeric * eased }));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {display}
    </span>
  );
}
