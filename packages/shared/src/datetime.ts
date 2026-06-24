/** Vietnam timezone helpers — Asia/Ho_Chi_Minh (UTC+7) */
export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

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

/** Inclusive day bounds in Vietnam local time (for departureTime queries) */
export function vnDayBounds(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00+07:00`);
  const end = new Date(`${dateStr}T23:59:59.999+07:00`);
  return { start, end };
}

/** YYYY-MM-DD of departure instant in Asia/Ho_Chi_Minh */
export function departureDateVN(departureTimeIso: string): string {
  return formatDateVN(new Date(departureTimeIso));
}

/** HH:mm (24h) of departure instant in Asia/Ho_Chi_Minh */
export function departureTimeVN(departureTimeIso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(departureTimeIso));
}

/** True when departure falls on the user-selected travel date (departure day, not arrival). */
export function isDepartureOnTravelDate(departureTimeIso: string, travelDate: string): boolean {
  return departureDateVN(departureTimeIso) === travelDate;
}

export function filterByDepartureDate<T extends { departure_time?: string; departureTime?: string }>(
  trips: T[],
  travelDate: string
): T[] {
  return trips.filter((t) => {
    const dep = String(t.departure_time ?? t.departureTime ?? '');
    return dep.length > 0 && isDepartureOnTravelDate(dep, travelDate);
  });
}

/** Milliseconds until next 00:00 in Vietnam */
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

const RELATIVE_DATE_PATTERNS: Array<{ re: RegExp; offset: number }> = [
  { re: /\b(hom nay|hon nay|toi nay)\b/, offset: 0 },
  { re: /\b(hom qua|hom wa)\b/, offset: -1 },
  { re: /\b(ngay mai|mai|sang mai|toi mai)\b/, offset: 1 },
  { re: /\b(ngay kia|ngay mot)\b/, offset: 2 },
];

/**
 * Parse travel date from YYYY-MM-DD, DD/MM/YYYY, or Vietnamese relative phrases.
 */
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

  for (const { re, offset } of RELATIVE_DATE_PATTERNS) {
    if (re.test(norm)) return addDaysVN(today, offset);
  }

  if (/\bcuoi tuan nay\b/.test(norm)) {
    const day = ref.getUTCDay();
    const daysUntilSat = (6 - day + 7) % 7;
    return addDaysVN(today, daysUntilSat === 0 ? 0 : daysUntilSat);
  }

  throw new Error(`Ngày không hợp lệ (dùng YYYY-MM-DD hoặc hôm nay/hôm qua/ngày mai): ${raw}`);
}
