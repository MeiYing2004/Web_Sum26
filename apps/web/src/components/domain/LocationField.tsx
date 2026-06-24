'use client';

import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

export function LocationField({
  value,
  onChange,
  suggestions,
  onPick,
  placeholder,
  className,
  icon = 'origin',
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: Array<{ name: string }>;
  onPick: (name: string) => void;
  placeholder: string;
  className?: string;
  icon?: 'origin' | 'destination';
}) {
  return (
    <div className={cn('relative', className)}>
      <MapPin
        className={cn(
          'pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2',
          icon === 'origin' ? 'text-brand' : 'text-accent'
        )}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-10"
      />
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-auto rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-overlay">
          {suggestions.map((s) => (
            <button
              key={s.name}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-body text-ink transition-colors hover:bg-brand-50"
              onClick={() => onPick(s.name)}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand/60" />
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
