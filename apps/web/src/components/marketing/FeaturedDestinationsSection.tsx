'use client';

import { useEffect, useState } from 'react';
import { gql } from '@/lib/graphql';
import { DestinationCard } from '@/components/marketing/DestinationCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { MapPin } from 'lucide-react';

export type FeaturedDestination = {
  city: string;
  slug: string;
  tagline: string;
  routeCount: number;
  priceFrom: number | null;
};

const FEATURED_DESTINATIONS_QUERY = `
  query FeaturedDestinations {
    featuredDestinations {
      city
      slug
      tagline
      routeCount
      priceFrom
    }
  }
`;

export async function fetchFeaturedDestinations(): Promise<FeaturedDestination[]> {
  const data = await gql<{ featuredDestinations: FeaturedDestination[] }>(FEATURED_DESTINATIONS_QUERY);
  return data.featuredDestinations;
}

function SkeletonDestinationCard() {
  return (
    <div className="overflow-hidden rounded-2xl shadow-soft">
      <Skeleton className="h-56 w-full sm:h-64" />
    </div>
  );
}

/** Section điểm đến nổi bật — số tuyến & giá từ database */
export function FeaturedDestinationsSection({ travelDate }: { travelDate?: string }) {
  const [destinations, setDestinations] = useState<FeaturedDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFeaturedDestinations()
      .then((data) => {
        if (!cancelled) setDestinations(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được điểm đến');
          setDestinations([]);
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
        <h2 className="section-heading">Điểm đến nổi bật</h2>
        <p className="section-subheading">Khám phá Việt Nam cùng Cappy Bus</p>
      </div>

      {error && !loading && (
        <p className="mb-4 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-center text-caption text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonDestinationCard key={i} />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Chưa có điểm đến"
          description="Hệ thống chưa có tuyến xe nào."
          actionLabel="Tìm chuyến"
          actionHref="/trips"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest, i) => (
            <DestinationCard key={dest.city} dest={dest} travelDate={travelDate} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
