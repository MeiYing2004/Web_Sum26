'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

type Suggestion = { name: string };

export function LocationField({
  value,
  onChange,
  suggestions,
  catalogLocations = [],
  onPick,
  placeholder,
  className,
  icon = 'origin',
  isOpen = false,
  onOpenChange,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: Suggestion[];
  catalogLocations?: string[];
  onPick: (name: string) => void;
  placeholder: string;
  className?: string;
  icon?: 'origin' | 'destination';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [openedByChevron, setOpenedByChevron] = useState(false);

  const displaySuggestions = useMemo(() => {
    const trimmed = value.trim();
    if (trimmed) return suggestions;
    if (openedByChevron && isOpen) {
      return catalogLocations.slice(0, 10).map((name) => ({ name }));
    }
    return [];
  }, [value, suggestions, catalogLocations, isOpen, openedByChevron]);

  const showDropdown = isOpen && displaySuggestions.length > 0;

  useEffect(() => {
    if (!isOpen) setOpenedByChevron(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpenedByChevron(false);
        onOpenChange?.(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onOpenChange]);

  function closeDropdown() {
    setOpenedByChevron(false);
    onOpenChange?.(false);
  }

  function handleInputChange(next: string) {
    setOpenedByChevron(false);
    onChange(next);
    if (next.trim()) {
      onOpenChange?.(true);
    } else {
      onOpenChange?.(false);
    }
  }

  function handleChevronClick() {
    if (isOpen) {
      closeDropdown();
      return;
    }
    setOpenedByChevron(true);
    onOpenChange?.(true);
  }

  function handlePick(name: string) {
    onPick(name);
    closeDropdown();
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <MapPin
        className={cn(
          'pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2',
          icon === 'origin' ? 'text-brand' : 'text-accent'
        )}
      />
      <Input
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          /* Chỉ mở khi gõ hoặc bấm mũi tên — không mở khi focus */
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeDropdown();
        }}
        placeholder={placeholder}
        className="h-11 pl-10 pr-10"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listId : undefined}
        aria-autocomplete="list"
      />
      <button
        type="button"
        onClick={handleChevronClick}
        aria-label={isOpen ? 'Đóng danh sách địa điểm' : 'Mở danh sách địa điểm'}
        className={cn(
          'absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink',
          isOpen && 'bg-slate-100 text-ink'
        )}
      >
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-auto rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-overlay"
        >
          {displaySuggestions.map((s) => (
            <button
              key={s.name}
              type="button"
              role="option"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-body text-ink transition-colors hover:bg-brand-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePick(s.name)}
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
