import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const cardVariants = cva('rounded-card transition-all duration-200', {
  variants: {
    variant: {
      solid: 'border border-slate-200/80 bg-white shadow-card',
      glass: 'glass-panel',
      elevated: 'border border-slate-200/60 bg-white shadow-elevated',
      dashed: 'border-2 border-dashed border-slate-200 bg-slate-50/50',
      flat: 'border border-slate-100 bg-surface-sunken',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-8',
    },
    interactive: {
      true: 'hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'solid',
    padding: 'md',
    interactive: false,
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export function CardHeader({
  className,
  title,
  description,
  action,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
      <div className="min-w-0">
        {title && <h3 className="text-subtitle text-ink">{title}</h3>}
        {description && <p className="mt-0.5 text-caption text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export { Card, cardVariants };
