'use client';

import { useEffect, useState } from 'react';
import { gql } from '@/lib/graphql';
import { OperatorCard, type OperatorCardData } from '@/components/marketing/OperatorCard';
import { SkeletonOperatorCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bus } from 'lucide-react';

export type FeaturedOperator = {
  id: string;
  name: string;
  tripCountToday: number;
  routes: string[];
  priceFrom: number | null;
  badge: string;
  rating: number | null;
  reviewCount: number;
  satisfactionPercent: number | null;
};

const FEATURED_OPERATORS_QUERY = `
  query FeaturedOperators($limit: Int) {
    featuredOperators(limit: $limit) {
      id
      name
      tripCountToday
      routes
      priceFrom
      badge
      rating
      reviewCount
      satisfactionPercent
    }
  }
`;

export async function fetchFeaturedOperators(limit = 12): Promise<FeaturedOperator[]> {
  const data = await gql<{ featuredOperators: FeaturedOperator[] }>(FEATURED_OPERATORS_QUERY, { limit });
  return data.featuredOperators;
}

function toCardData(op: FeaturedOperator): OperatorCardData {
  return {
    name: op.name,
    rating: op.rating ?? 0,
    trips: `${op.tripCountToday}+ chuyến/ngày`,
    tripCount: op.tripCountToday,
    badge: op.badge,
    routes: op.routes,
    priceFrom: op.priceFrom ?? undefined,
    satisfactionRate: op.satisfactionPercent ?? undefined,
  };
}

/** Section nhà xe nổi bật — đồng bộ với số nhà xe trong database */
export function FeaturedOperatorsSection({ travelDate }: { travelDate?: string }) {
  const [operators, setOperators] = useState<FeaturedOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFeaturedOperators()
      .then((data) => {
        if (!cancelled) setOperators(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được danh sách nhà xe');
          setOperators([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page-section page-container">
      <div className="mb-10">
        <h2 className="section-heading">Nhà xe nổi bật</h2>
        <p className="section-subheading">Đối tác uy tín trên Cappy Bus</p>
      </div>

      {error && !loading && (
        <p className="mb-4 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-center text-caption text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonOperatorCard key={i} />
          ))}
        </div>
      ) : operators.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="Chưa có nhà xe"
          description="Hệ thống chưa có nhà xe nào được đăng ký."
          actionLabel="Tìm chuyến"
          actionHref="/trips"
        />
      ) : (
        <div
          className={`grid gap-5 sm:grid-cols-2 ${
            operators.length >= 4 ? 'lg:grid-cols-4' : operators.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
          }`}
        >
          {operators.map((op, i) => (
            <OperatorCard
              key={op.id}
              operator={toCardData(op)}
              index={i}
              travelDate={travelDate}
              showRating={op.reviewCount > 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
