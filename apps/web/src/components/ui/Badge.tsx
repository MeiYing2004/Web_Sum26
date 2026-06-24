import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-micro font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-ink-muted',
        brand: 'bg-brand-50 text-brand-700',
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        danger: 'bg-danger-light text-danger',
        accent: 'bg-accent/15 text-accent-dark',
        outline: 'border border-slate-200 bg-white text-ink-muted',
      },
      size: {
        sm: 'px-1.5 py-px text-[10px]',
        md: 'px-2 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
