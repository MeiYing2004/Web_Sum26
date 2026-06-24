import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border bg-white px-3.5 text-body text-ink shadow-sm transition-all duration-200',
        'placeholder:text-ink-subtle',
        'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-slate-200',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
