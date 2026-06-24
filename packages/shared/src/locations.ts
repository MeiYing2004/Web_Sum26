import { normalizeVietnamese } from './text';

/** Canonical city names used in DB seed */
export const CANONICAL_LOCATIONS = [
  'TP.HCM',
  'Đà Lạt',
  'Nha Trang',
  'Cần Thơ',
  'Đà Nẵng',
  'Hà Nội',
] as const;

/** Alias → canonical name (normalized keys) */
export const LOCATION_ALIASES: Record<string, string> = {
  hcm: 'TP.HCM',
  'tp hcm': 'TP.HCM',
  'tp.hcm': 'TP.HCM',
  'sai gon': 'TP.HCM',
  'sài gòn': 'TP.HCM',
  'ho chi minh': 'TP.HCM',
  'tp ho chi minh': 'TP.HCM',
  dalat: 'Đà Lạt',
  'da lat': 'Đà Lạt',
  'nha trang': 'Nha Trang',
  'can tho': 'Cần Thơ',
  'da nang': 'Đà Nẵng',
  hanoi: 'Hà Nội',
  'ha noi': 'Hà Nội',
};

export function resolveLocationAlias(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const norm = normalizeVietnamese(trimmed);
  if (LOCATION_ALIASES[norm]) return LOCATION_ALIASES[norm];

  for (const [alias, canonical] of Object.entries(LOCATION_ALIASES)) {
    if (norm === alias || norm.includes(alias) || alias.includes(norm)) {
      return canonical;
    }
  }

  for (const city of CANONICAL_LOCATIONS) {
    const cityNorm = normalizeVietnamese(city);
    if (cityNorm === norm || cityNorm.includes(norm) || norm.includes(cityNorm)) {
      return city;
    }
  }

  return trimmed;
}

export function matchLocation(input: string, knownNames: string[]): string | null {
  const alias = resolveLocationAlias(input);
  const normIn = normalizeVietnamese(alias);

  const exact = knownNames.find((n) => normalizeVietnamese(n) === normIn);
  if (exact) return exact;

  const partial = knownNames.find((n) => {
    const normN = normalizeVietnamese(n);
    return normN.includes(normIn) || normIn.includes(normN);
  });
  return partial ?? null;
}
