/** Admin UI date/time — always Asia/Ho_Chi_Minh, explicit DD/MM/YYYY HH:mm */
export const ADMIN_TIMEZONE = 'Asia/Ho_Chi_Minh';

function parseIso(iso: string | undefined | null): Date | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function vnDateTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ADMIN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return {
    day: get('day'),
    month: get('month'),
    year: get('year'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/** ISO or YYYY-MM-DD → DD/MM/YYYY */
export function formatAdminDate(value: string): string {
  const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[3]}/${ymd[2]}/${ymd[1]}`;

  const d = parseIso(value);
  if (!d) return value || '—';
  const { day, month, year } = vnDateTimeParts(d);
  return `${day}/${month}/${year}`;
}

/** ISO instant → DD/MM/YYYY HH:mm (24h, Vietnam) */
export function formatAdminDateTime(iso: string): string {
  const d = parseIso(iso);
  if (!d) return iso || '—';
  const { day, month, year, hour, minute } = vnDateTimeParts(d);
  return `${day}/${month}/${year} ${hour}:${minute}`;
}
