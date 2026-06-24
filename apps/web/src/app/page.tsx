'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bus,
  ChevronRight,
  Quote,
  Shield,
  Sparkles,
  Star,
  Tag,
} from 'lucide-react';
import { gql } from '@/lib/graphql';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDisplayDate, todayVN } from '@/lib/datetime';
import { useTravelDateWithTodaySync } from '@/hooks/useTodayVN';
import { normalizeSearchTrips, TRIP_SEARCH_FIELDS, type TripSearchResult } from '@/lib/trip-availability';
import { buildTripsSeoUrl } from '@/lib/trip-search';
import { fetchRouteCatalog, filterLocationSuggestions, formatDurationMinutes, type CatalogRoute } from '@/lib/route-catalog';
import { TripResultCard } from '@/components/domain/TripResultCard';
import { TripSearchBox } from '@/components/domain/TripSearchBox';
import { PromoVoucherCard } from '@/components/domain/PromoVoucherCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  FEATURED_DESTINATIONS,
  FEATURED_OPERATORS,
  PROMOTIONS,
  TESTIMONIALS,
} from '@/lib/marketing';
import { getDestinationImage, getHeroImage } from '@/lib/images';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

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
  const [catalogLocations, setCatalogLocations] = useState<string[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<CatalogRoute[]>([]);
  const [copiedPromoCode, setCopiedPromoCode] = useState<string | null>(null);

  const debouncedOrigin = useDebounce(originQuery, 300);
  const debouncedDest = useDebounce(destQuery, 300);

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

  useEffect(() => {
    setOriginSuggestions(filterLocationSuggestions(catalogLocations, debouncedOrigin));
  }, [catalogLocations, debouncedOrigin]);

  useEffect(() => {
    setDestSuggestions(filterLocationSuggestions(catalogLocations, debouncedDest));
  }, [catalogLocations, debouncedDest]);

  useEffect(() => {
    fetchRouteCatalog(travelDate, 6)
      .then((catalog) => {
        setCatalogLocations(catalog.locations);
        setPopularRoutes(catalog.routes);
        if (!catalog.routes.length) return;
        const hasCurrentRoute = catalog.routes.some((r) => r.origin === origin && r.destination === destination);
        if (!hasCurrentRoute && !hasSearched) {
          const first = catalog.routes[0];
          setOrigin(first.origin);
          setOriginQuery(first.origin);
          setDestination(first.destination);
          setDestQuery(first.destination);
        }
      })
      .catch(() => {
        setCatalogLocations([]);
        setPopularRoutes([]);
      });
  }, [travelDate, origin, destination, hasSearched]);

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
      toast.success(`Đã sao chép mã ${code}`);
      window.setTimeout(() => {
        setCopiedPromoCode((current) => (current === code ? null : current));
      }, 1800);
    } catch {
      toast.error('Không thể sao chép mã khuyến mãi');
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[520px] overflow-hidden sm:min-h-[580px]">
        <Image
          src={getHeroImage()}
          alt="Xe khách liên tỉnh Cappy Bus"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="hero-overlay absolute inset-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-caption font-medium text-white/90 backdrop-blur-sm ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Nền tảng đặt vé xe khách #1 Việt Nam
            </span>
            <h1 className="mt-5 text-balance font-display text-display text-white">
              Đặt vé xe liên tỉnh
              <span className="block text-accent">nhanh chóng & an tâm</span>
            </h1>
            <p className="mt-4 text-balance text-body text-white/75 sm:text-lg">
              So sánh giá từ hàng trăm nhà xe, chọn ghế trực quan và nhận vé điện tử ngay lập tức
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {TRUST_STATS.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-caption text-white/70"
                >
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-10 max-w-5xl"
          >
            <TripSearchBox
              variant="hero"
              originQuery={originQuery}
              destQuery={destQuery}
              travelDate={travelDate}
              originSuggestions={originSuggestions}
              destSuggestions={destSuggestions}
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
        </div>
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
            {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
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
          {/* Popular routes */}
          <section className="page-section page-container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="section-heading">Tuyến phổ biến</h2>
                <p className="section-subheading">Giá tốt nhất, cập nhật hàng ngày</p>
              </div>
              <Link href="/trips" className="hidden text-caption font-medium text-brand hover:underline sm:block">
                Xem tất cả
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularRoutes.map((route) => (
                <Link
                  key={`${route.origin}-${route.destination}`}
                  href={buildTripsSeoUrl(route.origin, route.destination, travelDate)}
                  className="card-hover-lift group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {route.origin}{' '}
                      <span className="text-brand">→</span> {route.destination}
                    </p>
                    <p className="mt-1 text-caption text-ink-muted">{formatDurationMinutes(route.durationMinutes)}</p>
                    <p className="mt-2 text-subtitle font-bold text-brand">
                      từ {route.minPrice.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-ink-subtle transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                </Link>
              ))}
            </div>
          </section>

          {/* Featured operators */}
          <section className="page-section page-container border-t border-slate-200/60">
            <div className="mb-8">
              <h2 className="section-heading">Nhà xe nổi bật</h2>
              <p className="section-subheading">Đối tác uy tín trên Cappy Bus</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_OPERATORS.map((op) => (
                <div
                  key={op.name}
                  className="card-hover-lift rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                      {op.name.charAt(0)}
                    </div>
                    <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-micro font-semibold text-accent-dark">
                      {op.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-ink">{op.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-caption font-medium text-ink">{op.rating}</span>
                    <span className="text-micro text-ink-subtle">· {op.trips}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Destinations */}
          <section className="page-section page-container border-t border-slate-200/60">
            <div className="mb-8">
              <h2 className="section-heading">Điểm đến nổi bật</h2>
              <p className="section-subheading">Khám phá Việt Nam cùng Cappy Bus</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_DESTINATIONS.map((dest) => (
                <Link
                  key={dest.city}
                  href={buildTripsSeoUrl('TP.HCM', dest.city, travelDate)}
                  className="card-hover-lift group relative overflow-hidden rounded-2xl shadow-card"
                >
                  <div className="relative h-48">
                    <Image
                      src={getDestinationImage(dest.city)}
                      alt={dest.city}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">{dest.city}</h3>
                      <p className="mt-0.5 text-caption text-white/75">{dest.tagline}</p>
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-micro font-medium text-white backdrop-blur-sm">
                        <Tag className="h-3 w-3" />
                        {dest.deals} ưu đãi
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Promotions */}
          <section className="page-section page-container border-t border-slate-200/60 bg-surface-sunken/40">
            <div className="mb-8">
              <h2 className="section-heading">Ưu đãi hiện có</h2>
              <p className="section-subheading">Voucher đang chạy thật, sẵn sàng áp dụng cho chuyến tiếp theo của bạn</p>
            </div>
            <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 md:overflow-visible">
              <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-5">
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

          {/* Testimonials */}
          <section className="page-section page-container border-t border-slate-200/60 pb-20">
            <div className="mb-8 text-center">
              <h2 className="section-heading">Khách hàng nói gì</h2>
              <p className="section-subheading">Hàng nghìn lượt đặt vé mỗi ngày</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
                >
                  <Quote className="h-8 w-8 text-brand/20" />
                  <p className="mt-4 text-body text-ink-muted">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{t.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-micro text-ink-subtle">{t.route}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
