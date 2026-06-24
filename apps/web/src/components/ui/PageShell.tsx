import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface PageShellProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageShell({ children, className, narrow }: PageShellProps) {
  return (
    <div
      className={cn(
        'page-section page-container',
        narrow ? 'max-w-3xl' : 'max-w-6xl',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  className,
  size = 'default',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'default' | 'large';
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h1 className={cn(size === 'large' ? 'text-display' : 'text-title', 'text-ink')}>
          {title}
        </h1>
        {description && <p className="mt-1.5 text-body text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
