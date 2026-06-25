import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, error, hint, required, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-caption font-medium text-ink"
          aria-required={required || undefined}
        >
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-micro font-medium text-danger">{error}</p>}
      {hint && !error && <p className="text-micro text-ink-muted">{hint}</p>}
    </div>
  );
}

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('block text-caption font-medium text-ink', className)}
    {...props}
  />
));
Label.displayName = 'Label';
