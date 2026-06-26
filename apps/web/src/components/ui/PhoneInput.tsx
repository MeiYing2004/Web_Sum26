'use client';

import type { ClipboardEvent, ComponentProps } from 'react';
import { Input } from '@/components/ui/Input';
import { PHONE_MAX_LENGTH, sanitizePhoneInput } from '@/lib/phone';

type Props = Omit<ComponentProps<typeof Input>, 'type' | 'inputMode' | 'onChange' | 'value' | 'maxLength'> & {
  value: string;
  onChange: (value: string) => void;
};

export function PhoneInput({ value, onChange, onPaste, ...props }: Props) {
  const digits = sanitizePhoneInput(value);

  function handleChange(next: string) {
    onChange(sanitizePhoneInput(next));
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const el = e.currentTarget;
    const start = el.selectionStart ?? digits.length;
    const end = el.selectionEnd ?? digits.length;
    const merged = `${digits.slice(0, start)}${pasted}${digits.slice(end)}`;
    handleChange(merged);
    onPaste?.(e);
  }

  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      value={digits}
      maxLength={PHONE_MAX_LENGTH}
      onChange={(e) => handleChange(e.target.value)}
      onPaste={handlePaste}
    />
  );
}
