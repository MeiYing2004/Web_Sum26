import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-body text-ink shadow-sm transition-all duration-200',
        'placeholder:text-ink-subtle',
        'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
        'disabled:ipe-blocked disabled:opacity-50',
        error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-slate-200',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
