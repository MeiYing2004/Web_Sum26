'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Bus,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';
import { gql } from '@/lib/graphql';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDisplayDate, todayVN } from '@/lib/datetime';
import { useTravelDateWithTodaySync } from '@/hooks/useTodayVN';
import { normalizeSearchTrips, TRIP_SEARCH_FIELDS, type TripSearchResult } from '@/lib/trip-availability';
import { fetchRouteCatalog, filterLocationSuggestions, destinationsForOrigin, originsForDestination, type CatalogRoute, type RouteCatalog, EMPTY_ROUTE_CATALOG } from '@/lib/route-catalog';
import { TripResultCard } from '@/components/domain/TripResultCard';
import { TripSearchBox } from '@/components/domain/TripSearchBox';
import { PromoVoucherCard } from '@/components/domain/PromoVoucherCard';
import {
  SkeletonPopularRoute,
  SkeletonTripCard,
} from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsSection } from '@/components/marketing/StatsSection';
import { WhyChooseUsSection } from '@/components/marketing/WhyChooseUsSection';
import { FAQSection } from '@/components/marketing/FAQSection';
import { AppDownloadSection } from '@/components/marketing/AppDownloadSection';
import { ReviewsSection } from '@/components/marketing/ReviewsSection';
import { FeaturedOperatorsSection } from '@/components/marketing/FeaturedOperatorsSection';
import { PopularRouteCard } from '@/components/marketing/PopularRouteCard';
import { FeaturedDestinationsSection } from '@/components/marketing/FeaturedDestinationsSection';
import { SAMPLE_REVIEWS } from '@/lib/marketing-content';
import {
  PROMOTIONS,
} from '@/lib/marketing';
import { type Review } from '@/lib/reviews';
import { HeroCarousel } from '@/components/marketing/HeroCarousel';
import { showToast } from '@/lib/toast';
import { cn } from '@/lib/cn';

const SORT_OPTIONS = [
  { value: 'DEPART_EARLY', label: 'Sớm nhất' },
  { value: 'PRICE_ASC', label: 'Rẻ nhất' },
  { value: 'DURATION_SHORT', label: 'Ngắn nhất' },
] as const;

const TRUST_STATS = [
  { label: '500+ chuyến/ngày', icon: Bus },
  { label: '4.9★ đánh giá', icon: Star },
  { label: 'Đối tác chính hãng', icon: Shield },
] as const;

type Trip = TripSearchResult & {
  routeName: string;
  operatorName: string;
  busType: string;
  arrivalTime: string;
  availableSeats: number;
  durationMinutes: number;
  bookable: boolean;
  availabilityStatus: string;
  availabilityLabel: string;
};

export default function HomePage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [travelDate, setTravelDate] = useTravelDateWithTodaySync();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [nearestDate, setNearestDate] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('DEPART_EARLY');
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ name: string }>>([]);
  const [destSuggestions, setDestSuggestions] = useState<Array<{ name: string }>>([]);
  const [catalog, setCatalog] = useState<RouteCatalog>(EMPTY_ROUTE_CATALOG);
  const [popularRoutes, setPopularRoutes] = useState<CatalogRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [copiedPromoCode, setCopiedPromoCode] = useState<string | null>(null);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const debouncedOrigin = useDebounce(originQuery, 300);
  const debouncedDest = useDebounce(destQuery, 300);

  /** API reviews hoặc mẫu tối thiểu 6 đánh giá */
  const displayReviews = useMemo(() => {
    if (featuredReviews.length >= 6) {
      return featuredReviews.map((r) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        routeLabel: r.routeLabel,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }));
    }
    const apiIds = new Set(featuredReviews.map((r) => r.id));
    const samples = SAMPLE_REVIEWS.filter((s) => !apiIds.has(s.id));
    const merged = [
      ...featuredReviews.map((r) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        routeLabel: r.routeLabel,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      ...samples,
    ];
    return merged.length >= 6 ? merged.slice(0, 6) : SAMPLE_REVIEWS;
  }, [featuredReviews]);

  const sortedTrips = useMemo(() => {
    const copy = [...trips];
    switch (sortBy) {
      case 'PRICE_ASC':
        return copy.sort((a, b) => a.price - b.price);
      case 'DURATION_SHORT':
        return copy.sort((a, b) => a.durationMinutes - b.durationMinutes);
      default:
        return copy.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
  }, [trips, sortBy]);

  const originOptions = useMemo(
    () => (destination ? originsForDestination(catalog, destination) : catalog.origins),
    [catalog, destination]
  );
  const destOptions = useMemo(
    () => (origin ? destinationsForOrigin(catalog, origin) : catalog.destinations),
    [catalog, origin]
  );

  useEffect(() => {
    setOriginSuggestions(filterLocationSuggestions(originOptions, debouncedOrigin));
  }, [originOptions, debouncedOrigin]);

  useEffect(() => {
    setDestSuggestions(filterLocationSuggestions(destOptions, debouncedDest));
  }, [destOptions, debouncedDest]);

  useEffect(() => {
    setRoutesLoading(true);
    fetchRouteCatalog(travelDate, 6)
      .then((nextCatalog) => {
        setCatalog(nextCatalog);
        setPopularRoutes(nextCatalog.routes);
        if (!nextCatalog.routePairs.length) return;
        if (!origin && !destination && !hasSearched) {
          const first = nextCatalog.routePairs[0];
          setOrigin(first.origin);
          setOriginQuery(first.origin);
          setDestination(first.destination);
          setDestQuery(first.destination);
        }
      })
      .catch(() => {
        setCatalog(EMPTY_ROUTE_CATALOG);
        setPopularRoutes([]);
      })
      .finally(() => setRoutesLoading(false));
  }, [travelDate, hasSearched]);

  useEffect(() => {
    setReviewsLoading(true);
    gql<{ featuredReviews: Review[] }>(
      `query { featuredReviews(limit: 6) { id reviewerName routeLabel rating comment createdAt } }`
    )
      .then((data) => setFeaturedReviews(data.featuredReviews))
      .catch(() => setFeaturedReviews([]))
      .finally(() => setReviewsLoading(false));
  }, []);

  function swapLocations() {
    const o = origin;
    const oq = originQuery;
    setOrigin(destination);
    setOriginQuery(destQuery);
    setDestination(o);
    setDestQuery(oq);
  }

  async function search(overrideDate?: string) {
    const date = overrideDate || travelDate;
    if (date < todayVN()) {
      setTrips([]);
      setSearchError('Ngày đã qua, vui lòng chọn ngày khác.');
      setHasSearched(true);
      return;
    }
    if (!origin.trim() || !destination.trim()) {
      setSearchError('Vui lòng nhập điểm đi và điểm đến');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setSearchError(null);
    setNearestDate(null);
    try {
      const data = await gql<{ searchTrips: Trip[] }>(
        `query($origin:String!,$destination:String!,$travelDate:String!,$sortBy:String){
          searchTrips(origin:$origin,destination:$destination,travelDate:$travelDate,sortBy:$sortBy){
            ${TRIP_SEARCH_FIELDS}
          }
        }`,
        { origin, destination, travelDate: date, sortBy }
      );
      const normalized = normalizeSearchTrips(date, data.searchTrips);
      setTrips(normalized);
      if (normalized.length === 0) {
        try {
          const suggest = await gql<{ suggestNearestDate: string | null }>(
            `query($origin:String!,$destination:String!,$travelDate:String!){
              suggestNearestDate(origin:$origin,destination:$destination,travelDate:$travelDate)
            }`,
            { origin, destination, travelDate: date }
          );
          const next = suggest.suggestNearestDate?.trim() || null;
          setNearestDate(next && next !== date ? next : null);
        } catch {
          setNearestDate(null);
        }
        setSearchError('Không tìm thấy chuyến xe. Hãy chọn địa điểm từ gợi ý hoặc thử đổi ngày đi.');
      } else if (normalized.every((t) => !t.bookable)) {
        setSearchError('Không còn chuyến khả dụng cho ngày đã chọn.');
      }
    } catch (err) {
      setTrips([]);
      const msg = err instanceof Error ? err.message : '';
      setSearchError(
        msg.includes('UNAVAILABLE') || msg.includes('connection')
          ? 'Không kết nối được dịch vụ backend. Hãy chạy: docker compose up -d api-gateway trip-service'
          : msg || 'Không kết nối được máy chủ. Hãy kiểm tra API đang chạy (port 4000).'
      );
    } finally {
      setLoading(false);
    }
  }


  async function copyPromoCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedPromoCode(code);
      showToast.copied(`mã ${code}`);
      window.setTimeout(() => {
        setCopiedPromoCode((current) => (current === code ? null : current));
      }, 1800);
    } catch {
      showToast.error('Không thể sao chép mã khuyến mãi');
    }
  }

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-[480px] overflow-hidden sm:min-h-[650px] lg:min-h-[700px]"
      >
        <HeroCarousel parallaxY={heroImageY} />

        <motion.div
          style={{ y: heroContentY }}
          className="relative z-10 mx-auto max-w-container px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md ring-1 ring-white/25">
              <Sparkles className="h-4 w-4 text-accent" />
              Nền tảng đặt vé xe khách #1 Việt Nam
            </span>
            <h1 className="mt-6 text-balance font-display text-display text-white">
              Đặt vé xe liên tỉnh
              <span className="block bg-gradient-to-r from-white to-brand-200 bg-clip-text text-transparent">
                nhanh chóng & an tâm
              </span>
            </h1>
            <p className="mt-5 text-balance text-base text-white/80 sm:text-lg">
              So sánh giá từ hàng trăm nhà xe, chọn ghế trực quan và nhận vé điện tử ngay lập tức
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              {TRUST_STATS.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-sm text-white/75"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto mt-12 max-w-5xl"
          >
            <TripSearchBox
              variant="hero"
              originQuery={originQuery}
              destQuery={destQuery}
              travelDate={travelDate}
              originSuggestions={originSuggestions}
              destSuggestions={destSuggestions}
              catalogLocations={originOptions}
              destCatalogLocations={destOptions}
              loading={loading}
              onOriginChange={(v) => {
                setOriginQuery(v);
                setOrigin(v);
              }}
              onDestChange={(v) => {
                setDestQuery(v);
                setDestination(v);
              }}
              onOriginPick={(name) => {
                setOrigin(name);
                setOriginQuery(name);
                setOriginSuggestions([]);
              }}
              onDestPick={(name) => {
                setDestination(name);
                setDestQuery(name);
                setDestSuggestions([]);
              }}
              onDateChange={setTravelDate}
              onSearch={() => void search()}
              onSwap={swapLocations}
            />
            {searchError && hasSearched && !loading && (
              <div className="mt-3 text-center text-caption text-red-200">
                <p>{searchError}</p>
                {nearestDate && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-white/90">
                    <p>
                      Ngày gần nhất có chuyến:{' '}
                      <span className="font-semibold text-accent">{formatDisplayDate(nearestDate)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTravelDate(nearestDate);
                        void search(nearestDate);
                      }}
                      className="rounded-lg bg-white/15 px-3 py-1.5 font-semibold text-white ring-1 ring-white/25 hover:bg-white/25"
                    >
                      Tìm chuyến ngày này
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Search results */}
      {hasSearched && (
        <section className="page-section page-container -mt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="section-heading">Kết quả tìm kiếm</h2>
              <p className="section-subheading">
                {loading
                  ? 'Đang tìm chuyến phù hợp...'
                  : `${sortedTrips.length} chuyến · ${origin} → ${destination}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-caption font-medium transition-all',
                    sortBy === opt.value
                      ? 'bg-brand text-white shadow-card'
                      : 'border border-slate-200 bg-white text-ink-muted hover:border-brand/30'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonTripCard key={i} />)}
            {!loading && !sortedTrips.length && (
              <EmptyState
                icon={Bus}
                title="Không có chuyến xe"
                description={searchError || 'Thử đổi ngày hoặc tuyến khác'}
                actionLabel="Tìm lại"
                onAction={() => setHasSearched(false)}
              />
            )}
            {!loading &&
              sortedTrips.map((trip, i) => (
                <TripResultCard
                  key={trip.id}
                  index={i}
                  trip={{
                    id: trip.id,
                    operatorName: trip.operatorName,
                    busType: trip.busType,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    price: trip.price,
                    availableSeats: trip.availableSeats,
                    bookable: trip.bookable,
                    availabilityLabel: trip.availabilityLabel,
                    availabilityStatus: trip.availabilityStatus,
                    durationMinutes: trip.durationMinutes,
                  }}
                />
              ))}
          </div>
        </section>
      )}

      {/* Marketing sections */}
      {!hasSearched && (
        <div className="mesh-bg">
          {/* Thống kê website */}
          <StatsSection />

          {/* Tuyến phổ biến */}
          <section className="page-section page-container">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="section-heading">Tuyến phổ biến</h2>
                <p className="section-subheading">Giá tốt nhất, cập nhật hàng ngày</p>
              </div>
              <Link href="/trips" className="hidden text-sm font-semibold text-brand hover:underline sm:block">
                Xem tất cả
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {routesLoading &&
                Array.from({ length: 6 }).map((_, i) => <SkeletonPopularRoute key={i} />)}
              {!routesLoading &&
                popularRoutes.map((route, i) => (
                  <PopularRouteCard
                    key={`${route.origin}-${route.destination}`}
                    route={route}
                    travelDate={travelDate}
                    index={i}
                  />
                ))}
            </div>
          </section>

          {/* Nhà xe nổi bật */}
          <FeaturedOperatorsSection travelDate={travelDate} />

          {/* Tại sao chọn Cappy Bus */}
          <WhyChooseUsSection />

          {/* Điểm đến nổi bật */}
          <FeaturedDestinationsSection travelDate={travelDate} />

          {/* Promotions */}
          <section className="page-section page-container">
            <div className="mb-10">
              <h2 className="section-heading">Ưu đãi hiện có</h2>
              <p className="section-subheading">
                Voucher đang chạy thật, sẵn sàng áp dụng cho chuyến tiếp theo của bạn
              </p>
            </div>
            <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 md:overflow-visible">
              <div className="flex gap-5 md:grid md:grid-cols-3">
                {PROMOTIONS.map((promo, index) => (
                  <PromoVoucherCard
                    key={promo.code}
                    promo={promo}
                    index={index}
                    copied={copiedPromoCode === promo.code}
                    onCopy={copyPromoCode}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Khách hàng nói gì */}
          <section className="page-section page-container">
            <div className="mb-10 text-center">
              <h2 className="section-heading">Khách hàng nói gì</h2>
              <p className="section-subheading">Hàng nghìn lượt đặt vé mỗi ngày</p>
            </div>
            <ReviewsSection reviews={displayReviews} loading={reviewsLoading} />
          </section>

          {/* FAQ */}
          <div id="faq">
            <FAQSection />
          </div>

          {/* Tải app */}
          <AppDownloadSection className="pb-28" />
        </div>
      )}

    </div>
  );
}
