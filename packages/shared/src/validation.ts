/** Sanitize user input — strip control chars, trim, limit length */
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
  const s = sanitizeString(code, 32).toUpperCase();
  if (!/^BK[A-Z0-9]+$/.test(s)) {
    throw new Error('Mã booking không hợp lệ');
  }
  return s;
}

export function sanitizeDate(date: unknown): string {
  const s = sanitizeString(date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error('Ngày không hợp lệ (YYYY-MM-DD)');
  }
  return s;
}

export function sanitizeLocation(name: unknown): string {
  const s = sanitizeString(name, 100);
  if (s.length < 2) throw new Error('Địa điểm quá ngắn');
  return s;
}
