export function isValidOptionalEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function emailFieldError(email: string): string | undefined {
  if (!email.trim()) return undefined;
  if (!isValidOptionalEmail(email)) return 'Email không hợp lệ';
  return undefined;
}
