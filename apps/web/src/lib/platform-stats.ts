import { gql } from '@/lib/graphql';

export type PlatformStats = {
  tripsToday: number;
  customers: number;
  operators: number;
  provinces: number;
  satisfactionPercent: number | null;
  hasSatisfactionData: boolean;
};

export const PLATFORM_STATS_QUERY = `
  query {
    platformStats {
      tripsToday
      customers
      operators
      provinces
      satisfactionPercent
      hasSatisfactionData
    }
  }
`;

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const data = await gql<{ platformStats: PlatformStats }>(PLATFORM_STATS_QUERY);
  return data.platformStats;
}

/** Format số theo locale Việt Nam: 1200 → 1.200 */
export function formatStatNumber(value: number): string {
  return value.toLocaleString('vi-VN');
}

/** Format phần trăm hài lòng: 99.8 → "99,8%" */
export function formatSatisfactionPercent(value: number): string {
  return `${value.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}
