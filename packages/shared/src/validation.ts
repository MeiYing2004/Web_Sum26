/** Sanitize user input — strip control chars, trim, limit length */
import { parseTravelDate } from './datetime';
import { resolveLocationAlias } from './locations';

export function sanitizeString(input: unknown, maxLen = 200): string {
  if (input == null) return '';
  return String(input)
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[<>'"`;\\]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeEmail(email: unknown): string {
  const s = sanitizeString(email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
    throw new Error('Email không hợp lệ');
  }
  return s;
}

export function sanitizeBookingCode(code: unknown): string {
  const s = sanitizeString(code, 32).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!/^(BK|TK)[A-Z0-9]{4,}$/.test(s)) {
    throw new Error('Mã vé không hợp lệ');
  }
  return s;
}

export function sanitizeDate(date: unknown): string {
  try {
    return parseTravelDate(date);
  } catch {
    const s = sanitizeString(date, 32);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      throw new Error('Ngày không hợp lệ (YYYY-MM-DD hoặc hôm nay/hôm qua/ngày mai)');
    }
    return s;
  }
}

export function sanitizeLocation(name: unknown): string {
  const s = resolveLocationAlias(sanitizeString(name, 100));
  if (s.length < 2) throw new Error('Địa điểm quá ngắn');
  return s;
}
