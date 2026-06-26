'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type TooltipProps = {
  content: string;
  children: ReactNode;
  className?: string;
};

/** Tooltip đơn giản cho icon — hiện khi hover/focus */
export function Tooltip({ content, children, className }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-micro font-medium text-white shadow-elevated"
        >
          {content}
        </span>
      )}
    </span>
  );
}
