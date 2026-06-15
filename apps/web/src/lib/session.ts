const SESSION_KEY = 'sessionId';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'sess_ssr';
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem(SESSION_KEY, sid);
  return sid;
}
