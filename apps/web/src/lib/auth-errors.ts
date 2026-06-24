const AUTH_ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /email đã|already.?exists|duplicate/i, message: 'Email đã được đăng ký' },
  { pattern: /không tồn tại|not.?found|no user/i, message: 'Tài khoản không tồn tại' },
  { pattern: /sai mật khẩu|invalid credentials|unauthenticated|wrong password/i, message: 'Sai mật khẩu' },
  { pattern: /email không hợp lệ|invalid email/i, message: 'Email không hợp lệ' },
  { pattern: /token không hợp lệ|invalid token/i, message: 'Phiên đăng nhập không hợp lệ' },
  { pattern: /lỗi máy chủ|server|unavailable|econnrefused|network/i, message: 'Lỗi máy chủ. Vui lòng thử lại sau.' },
];

export function formatAuthError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (!raw.trim()) return fallback;
  for (const { pattern, message } of AUTH_ERROR_PATTERNS) {
    if (pattern.test(raw)) return message;
  }
  return raw;
}

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}
