'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BadgePercent, ChevronDown, Filter, SlidersHorizontal, X, Bus } from 'lucide-react';
import { gql } from '@/lib/graphql';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDisplayDate, todayVN } from '@/lib/datetime';
import { useTravelDateWithTodaySync } from '@/hooks/useTodayVN';
import { parseTripsSearchParams, buildTripsSeoUrl, buildTripsSearchUrl, TRIP_OPERATORS, TRIP_BUS_TYPES } from '@/lib/trip-search';
import { normalizeSearchTrips, TRIP_SEARCH_FIELDS, type TripSearchResult } from '@/lib/trip-availability';
import { fetchRouteCatalog, filterLocationSuggestions, destinationsForOrigin, originsForDestination, type RouteCatalog, EMPTY_ROUTE_CATALOG } from '@/lib/route-catalog';
import { TripResultCard } from '@/components/domain/TripResultCard';
import { TripSearchBox } from '@/components/domain/TripSearchBox';
import { BookingProgress } from '@/components/domain/BookingProgress';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { SkeletonCard, SkeletonTripCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

type Trip = TripSearchResult & {
  routeName: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  price: number;
  availableSeats: number;
  durationMinutes: number;
  bookable: boolean;
  availabilityStatus: string;
  availabilityLabel: string;
};

const SORT_OPTIONS = [
  { value: 'DEPART_EARLY', label: 'Sớm nhất' },
  { value: 'PRICE_ASC', label: 'Rẻ nhất' },
  { value: 'DURATION_SHORT', label: 'Ngắn nhất' },
] as const;

const EMPTY_FILTERS = {
  operatorFilter: '',
  busTypeFilter: '',
  minPrice: '',
  maxPrice: '',
  departureTimeFrom: '',
  departureTimeTo: '',
  minSeats: '',
};

function TripsSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = useMemo(() => parseTripsSearchParams(searchParams), [searchParams]);
  const promoFromQuery = (searchParams.get('promo') || '').trim().toUpperCase();

  const [origin, setOrigin] = useState(parsed?.origin || '');
  const [destination, setDestination] = useState(parsed?.destination || '');
  const [originQuery, setOriginQuery] = useState(parsed?.origin || '');
  const [destQuery, setDestQuery] = useState(parsed?.destination || '');
  const [travelDate, setTravelDate] = useTravelDateWithTodaySync(parsed?.date);
  const [sortBy, setSortBy] = useState('DEPART_EARLY');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ name: string }>>([]);
  const [destSuggestions, setDestSuggestions] = useState<Array<{ name: string }>>([]);
  const [catalog, setCatalog] = useState<RouteCatalog>(EMPTY_ROUTE_CATALOG);
  const [activePromoCode, setActivePromoCode] = useState(promoFromQuery || '');
  const [nearestDate, setNearestDate] = useState<string | null>(null);
  const reqId = useRef(0);

  const debouncedOrigin = useDebounce(originQuery, 300);
  const debouncedDest = useDebounce(destQuery, 300);

  useEffect(() => {
    setActivePromoCode(promoFromQuery || '');
    if (promoFromQuery) {
      sessionStorage.setItem('activePromoCode', promoFromQuery);
    }
  }, [promoFromQuery]);

  useEffect(() => {
    if (!parsed) return;
    setOrigin(parsed.origin);
    setDestination(parsed.destination);
    setOriginQuery(parsed.origin);
    setDestQuery(parsed.destination);
    setTravelDate(parsed.date);
  }, [parsed]);

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
    const id = ++reqId.current;
    fetchRouteCatalog(travelDate, 50)
      .then((nextCatalog) => {
        if (id !== reqId.current) return;
        setCatalog(nextCatalog);
        if (!nextCatalog.routePairs.length) return;
        if (!origin && !destination && nextCatalog.routePairs[0]) {
          const first = nextCatalog.routePairs[0];
          setOrigin(first.origin);
          setOriginQuery(first.origin);
          setDestination(first.destination);
          setDestQuery(first.destination);
        }
      })
      .catch(() => {
        if (id === reqId.current) setCatalog(EMPTY_ROUTE_CATALOG);
      });
  }, [travelDate]);

  const activeFilterCount = useMemo(
    () =>
      Object.values(filters).filter((v) => v.trim() !== '').length,
    [filters]
  );

  const fetchTrips = useCallback(async () => {
    if (!origin.trim() || !destination.trim()) return;
    if (travelDate < todayVN()) {
      setTrips([]);
      setError('Ngày đã qua, vui lòng chọn ngày khác.');
      return;
    }
    setLoading(true);
    setError(null);
    setNearestDate(null);
    try {
      const vars: Record<string, unknown> = { origin, destination, travelDate, sortBy };
      if (filters.operatorFilter) vars.operatorFilter = filters.operatorFilter;
      if (filters.busTypeFilter) vars.busTypeFilter = filters.busTypeFilter;
      if (filters.minPrice) vars.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) vars.maxPrice = Number(filters.maxPrice);
      if (filters.departureTimeFrom) vars.departureTimeFrom = filters.departureTimeFrom;
      if (filters.departureTimeTo) vars.departureTimeTo = filters.departureTimeTo;
      if (filters.minSeats) vars.minSeats = Number(filters.minSeats);

      const data = await gql<{ searchTrips: Trip[] }>(
        `query(
          $origin:String!,$destination:String!,$travelDate:String!,$sortBy:String
          $operatorFilter:String,$busTypeFilter:String
          $minPrice:Float,$maxPrice:Float
          $departureTimeFrom:String,$departureTimeTo:String,$minSeats:Int
        ){
          searchTrips(
            origin:$origin,destination:$destination,travelDate:$travelDate,sortBy:$sortBy
            operatorFilter:$operatorFilter,busTypeFilter:$busTypeFilter
            minPrice:$minPrice,maxPrice:$maxPrice
            departureTimeFrom:$departureTimeFrom,departureTimeTo:$departureTimeTo,minSeats:$minSeats
          ){
            ${TRIP_SEARCH_FIELDS}
          }
        }`,
        vars
      );
      const normalized = normalizeSearchTrips(travelDate, data.searchTrips);
      setTrips(normalized);
      if (normalized.length === 0) {
        try {
          const suggest = await gql<{ suggestNearestDate: string | null }>(
            `query($origin:String!,$destination:String!,$travelDate:String!){
              suggestNearestDate(origin:$origin,destination:$destination,travelDate:$travelDate)
            }`,
            { origin, destination, travelDate }
          );
          const next = suggest.suggestNearestDate?.trim() || null;
          setNearestDate(next && next !== travelDate ? next : null);
        } catch {
          setNearestDate(null);
        }
        setError('Không tìm thấy chuyến xe cho ngày đã chọn.');
      } else if (normalized.every((t) => !t.bookable)) {
        setError('Không còn chuyến khả dụng cho ngày đã chọn.');
      }
    } catch (err) {
      setTrips([]);
      setNearestDate(null);
      setError(err instanceof Error ? err.message : 'Không thể tìm chuyến');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, travelDate, sortBy, filters]);

  useEffect(() => {
    if (!parsed) return;
    fetchTrips();
  }, [parsed, sortBy, filters, fetchTrips]);

  function submitSearch() {
    const base = buildTripsSeoUrl(origin, destination, travelDate);
    const target = activePromoCode
      ? `${base}${base.includes('?') ? '&' : '?'}promo=${encodeURIComponent(activePromoCode)}`
      : base;
    router.push(target);
  }

  function swapLocations() {
    const o = origin;
    const oq = originQuery;
    setOrigin(destination);
    setOriginQuery(destQuery);
    setDestination(o);
    setDestQuery(oq);
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="page-section page-container">
        <BookingProgress current="trip" className="mb-8" />

        <div className="mb-6">
          <h1 className="text-display text-ink">
            {origin} <span className="text-brand">→</span> {destination}
          </h1>
          <p className="mt-2 text-body text-ink-muted">{formatDisplayDate(travelDate)}</p>
          {activePromoCode && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-50 px-3 py-1.5 text-caption font-semibold text-brand">
              <BadgePercent className="h-4 w-4" />
              Đang áp dụng mã giảm giá: {activePromoCode}
            </div>
          )}
        </div>

        <div className="sticky top-20 z-30 mb-8">
          <TripSearchBox
            variant="inline"
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
            onOriginPick={(n) => {
              setOrigin(n);
              setOriginQuery(n);
              setOriginSuggestions([]);
            }}
            onDestPick={(n) => {
              setDestination(n);
              setDestQuery(n);
              setDestSuggestions([]);
            }}
            onDateChange={setTravelDate}
            onSearch={submitSearch}
            onSwap={swapLocations}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Hôm qua', offset: -1 },
                { label: 'Hôm nay', offset: 0 },
                { label: 'Ngày mai', offset: 1 },
              ].map(({ label, offset }) => {
                const d =
                  offset === 0
                    ? todayVN()
                    : (() => {
                        const t = todayVN();
                        const [y, m, day] = t.split('-').map(Number);
                        const dt = new Date(Date.UTC(y, m - 1, day + offset, 12));
                        return new Intl.DateTimeFormat('en-CA', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                        }).format(dt);
                      })();
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setTravelDate(d);
                      const base = buildTripsSeoUrl(origin, destination, d);
                      const target = activePromoCode
                        ? `${base}${base.includes('?') ? '&' : '?'}promo=${encodeURIComponent(activePromoCode)}`
                        : base;
                      router.push(target);
                    }}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-caption font-medium transition-all',
                      travelDate === d
                        ? 'border-brand bg-brand-50 text-brand shadow-sm'
                        : 'border-slate-200 bg-white text-ink-muted hover:border-brand/30'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-caption font-medium transition-all',
                  showFilters || activeFilterCount > 0
                    ? 'border-brand bg-brand-50 text-brand'
                    : 'border-slate-200 bg-white text-ink-muted hover:border-brand/30'
                )}
              >
                <Filter className="h-4 w-4" />
                Lọc
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-micro font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform', showFilters && 'rotate-180')}
                />
              </button>
              <SlidersHorizontal className="h-4 w-4 text-ink-subtle" />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 w-auto min-w-[140px]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {showFilters && (
            <Card variant="flat" padding="md" className="mt-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-caption font-semibold text-ink">Bộ lọc chuyến xe</p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="inline-flex items-center gap-1 text-micro font-medium text-brand hover:text-brand-700"
                  >
                    <X className="h-3.5 w-3.5" />
                    Xóa bộ lọc
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Nhà xe">
                  <Select
                    value={filters.operatorFilter}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, operatorFilter: e.target.value }))
                    }
                    className="h-9"
                  >
                    <option value="">Tất cả nhà xe</option>
                    {TRIP_OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Loại xe">
                  <Select
                    value={filters.busTypeFilter}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, busTypeFilter: e.target.value }))
                    }
                    className="h-9"
                  >
                    <option value="">Tất cả loại xe</option>
                    {TRIP_BUS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Giờ đi từ">
                  <Input
                    type="time"
                    value={filters.departureTimeFrom}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, departureTimeFrom: e.target.value }))
                    }
                    className="h-9"
                  />
                </Field>
                <Field label="Giờ đi đến">
                  <Input
                    type="time"
                    value={filters.departureTimeTo}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, departureTimeTo: e.target.value }))
                    }
                    className="h-9"
                  />
                </Field>
                <Field label="Giá từ (đ)">
                  <Input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="200000"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                    className="h-9"
                  />
                </Field>
                <Field label="Giá đến (đ)">
                  <Input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="500000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                    className="h-9"
                  />
                </Field>
                <Field label="Ghế trống tối thiểu">
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={filters.minSeats}
                    onChange={(e) => setFilters((f) => ({ ...f, minSeats: e.target.value }))}
                    className="h-9"
                  />
                </Field>
              </div>
            </Card>
          )}
        </div>

        {!loading && trips.length > 0 && (
          <p className="mb-4 flex items-center gap-2 text-caption text-ink-muted">
            <Filter className="h-4 w-4" />
            {trips.length} chuyến xe phù hợp
            {activeFilterCount > 0 && ` · ${activeFilterCount} bộ lọc đang áp dụng`}
          </p>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-caption text-danger">
            <p>{error}</p>
            {nearestDate && (
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-danger/10 pt-3 text-ink">
                <p>
                  Ngày gần nhất có chuyến:{' '}
                  <span className="font-semibold text-brand">{formatDisplayDate(nearestDate)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTravelDate(nearestDate);
                    const base = buildTripsSeoUrl(origin, destination, nearestDate);
                    const target = activePromoCode
                      ? `${base}${base.includes('?') ? '&' : '?'}promo=${encodeURIComponent(activePromoCode)}`
                      : base;
                    router.push(target);
                  }}
                  className="rounded-lg bg-brand px-3 py-1.5 text-caption font-semibold text-white transition hover:bg-brand-700"
                >
                  Tìm chuyến ngày này
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonTripCard key={i} />
            ))}
          </div>
        )}

        {!loading && trips.length === 0 && !error && parsed && (
          <EmptyState
            icon={Bus}
            title="Không có chuyến xe"
            description="Chưa có kết quả — thử đổi ngày hoặc tuyến."
            actionLabel="Tìm chuyến khác"
            actionHref="/"
          />
        )}

        <div className="space-y-4">
          {!loading &&
            trips.map((t, i) => (
              <TripResultCard
                key={t.id}
                index={i}
                trip={{
                  id: t.id,
                  operatorName: t.operatorName,
                  busType: t.busType,
                  departureTime: t.departureTime,
                  arrivalTime: t.arrivalTime,
                  price: t.price,
                  availableSeats: t.availableSeats,
                  bookable: t.bookable,
                  availabilityLabel: t.availabilityLabel,
                  availabilityStatus: t.availabilityStatus,
                  durationMinutes: t.durationMinutes,
                }}
                promoCode={activePromoCode}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense
      fallback={
        <div className="mesh-bg page-section page-container">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonTripCard key={i} />
            ))}
          </div>
        </div>
      }
    >
      <TripsSearchContent />
    </Suspense>
  );
}
