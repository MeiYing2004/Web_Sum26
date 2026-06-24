/** Browser-safe VN timezone helpers (mirrors @bus/shared/datetime) */
export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

function parseValidDate(iso: string | undefined | null): Date | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateVN(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: VN_TIMEZONE }).format(date);
}

export function todayVN(ref: Date = new Date()): string {
  return formatDateVN(ref);
}

export function addDaysVN(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return formatDateVN(utc);
}

export function departureDateVN(departureTimeIso: string): string {
  const d = parseValidDate(departureTimeIso);
  if (!d) return todayVN();
  return formatDateVN(d);
}

export function departureTimeVN(departureTimeIso: string): string {
  const d = parseValidDate(departureTimeIso);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function isDepartureOnTravelDate(departureTimeIso: string, travelDate: string): boolean {
  return departureDateVN(departureTimeIso) === travelDate;
}

export function filterByDepartureDate<T extends { departureTime: string }>(
  trips: T[],
  travelDate: string
): T[] {
  return trips.filter((t) => isDepartureOnTravelDate(t.departureTime, travelDate));
}

export function msUntilNextMidnightVN(now: Date = new Date()): number {
  const tomorrow = addDaysVN(todayVN(now), 1);
  const midnight = new Date(`${tomorrow}T00:00:00+07:00`);
  return Math.max(0, midnight.getTime() - now.getTime());
}

function normalizeDateText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export function parseTravelDate(input: unknown, ref: Date = new Date()): string {
  if (input == null || String(input).trim() === '') return todayVN(ref);
  const raw = String(input).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const dmy = raw.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{4}))?$/);
  if (dmy) {
    const year = dmy[3] ? Number(dmy[3]) : Number(todayVN(ref).split('-')[0]);
    return `${year}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }

  const norm = normalizeDateText(raw);
  const today = todayVN(ref);
  if (/\b(hom nay|hon nay|toi nay)\b/.test(norm)) return today;
  if (/\b(hom qua|hom wa)\b/.test(norm)) return addDaysVN(today, -1);
  if (/\b(ngay mai|mai|sang mai|toi mai)\b/.test(norm)) return addDaysVN(today, 1);
  if (/\b(ngay kia)\b/.test(norm)) return addDaysVN(today, 2);

  throw new Error(`Ngày không hợp lệ: ${raw}`);
}

export function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}
