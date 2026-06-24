import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-brand-foreground shadow-card hover:bg-brand-700 hover:shadow-elevated active:scale-[0.98] disabled:opacity-60',
        secondary:
          'border border-slate-200 bg-white text-ink shadow-sm hover:border-brand/30 hover:bg-brand-50/50 active:scale-[0.98]',
        ghost: 'text-ink-muted hover:bg-slate-100 hover:text-ink',
        danger: 'bg-danger text-white shadow-card hover:bg-red-700 active:scale-[0.98]',
        accent:
          'bg-accent text-ink shadow-card hover:bg-accent-dark hover:text-white active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-caption',
        md: 'h-10 rounded-lg px-4 text-body',
        lg: 'h-12 rounded-xl px-6 text-body',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
