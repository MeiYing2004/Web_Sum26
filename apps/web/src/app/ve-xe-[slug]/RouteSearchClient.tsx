'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gql } from '@/lib/graphql';
import { useDebounce } from '@/hooks/useDebounce';
import { buildRouteSlug } from '@/lib/seo';

interface Props {
  initialOrigin: string;
  initialDestination: string;
  initialDate: string;
}

export default function RouteSearchClient({ initialOrigin, initialDestination, initialDate }: Props) {
  const router = useRouter();
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [travelDate, setTravelDate] = useState(initialDate);
  const [originQuery, setOriginQuery] = useState(initialOrigin);
  const [destQuery, setDestQuery] = useState(initialDestination);
  const debouncedOrigin = useDebounce(originQuery, 300);
  const debouncedDest = useDebounce(destQuery, 300);
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ name: string }>>([]);
  const [destSuggestions, setDestSuggestions] = useState<Array<{ name: string }>>([]);
  const [trips, setTrips] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setOrigin(initialOrigin);
    setDestination(initialDestination);
    setTravelDate(initialDate);
    setOriginQuery(initialOrigin);
    setDestQuery(initialDestination);
  }, [initialOrigin, initialDestination, initialDate]);

  useEffect(() => {
    if (debouncedOrigin.length < 2) {
      setOriginSuggestions([]);
      return;
    }
    gql<{ autocompleteLocations: Array<{ name: string }> }>(
      `query($q:String!){autocompleteLocations(query:$q){name}}`,
      { q: debouncedOrigin }
    )
      .then((d) => setOriginSuggestions(d.autocompleteLocations))
      .catch(() => setOriginSuggestions([]));
  }, [debouncedOrigin]);

  useEffect(() => {
    if (debouncedDest.length < 2) {
      setDestSuggestions([]);
      return;
    }
    gql<{ autocompleteLocations: Array<{ name: string }> }>(
      `query($q:String!){autocompleteLocations(query:$q){name}}`,
      { q: debouncedDest }
    )
      .then((d) => setDestSuggestions(d.autocompleteLocations))
      .catch(() => setDestSuggestions([]));
  }, [debouncedDest]);

  const search = useCallback(async () => {
    if (!origin.trim() || !destination.trim()) return;
    setLoading(true);
    setError('');
    try {
      const slug = buildRouteSlug(origin, destination, travelDate);
      router.replace(`/${slug}`);
      const data = await gql<{ searchTrips: Array<Record<string, unknown>> }>(
        `query($o:String!,$d:String!,$t:String!){searchTrips(origin:$o,destination:$d,travelDate:$t){id routeName operatorName price departureTime availableSeats}}`,
        { o: origin, d: destination, t: travelDate }
      );
      setTrips(data.searchTrips);
    } catch (err) {
      setTrips([]);
      setError(err instanceof Error ? err.message : 'Không thể tìm chuyến');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, travelDate, router]);

  useEffect(() => {
    if (!initialOrigin.trim() || !initialDestination.trim() || !initialDate) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await gql<{ searchTrips: Array<Record<string, unknown>> }>(
          `query($o:String!,$d:String!,$t:String!){searchTrips(origin:$o,destination:$d,travelDate:$t){id routeName operatorName price departureTime availableSeats}}`,
          { o: initialOrigin, d: initialDestination, t: initialDate }
        );
        if (!cancelled) setTrips(data.searchTrips);
      } catch (err) {
        if (!cancelled) {
          setTrips([]);
          setError(err instanceof Error ? err.message : 'Không thể tìm chuyến');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialOrigin, initialDestination, initialDate]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#0F172A]">
        Vé xe {origin} đi {destination}
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="relative">
          <input
            value={originQuery}
            onChange={(e) => {
              setOriginQuery(e.target.value);
              setOrigin(e.target.value);
            }}
            placeholder="Điểm đi"
            className={inputClass}
          />
          {originSuggestions.length > 0 && (
            <div className={dropdownClass}>
              {originSuggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  className={itemClass}
                  onClick={() => {
                    setOrigin(s.name);
                    setOriginQuery(s.name);
                    setOriginSuggestions([]);
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <input
            value={destQuery}
            onChange={(e) => {
              setDestQuery(e.target.value);
              setDestination(e.target.value);
            }}
            placeholder="Điểm đến"
            className={inputClass}
          />
          {destSuggestions.length > 0 && (
            <div className={dropdownClass}>
              {destSuggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  className={itemClass}
                  onClick={() => {
                    setDestination(s.name);
                    setDestQuery(s.name);
                    setDestSuggestions([]);
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="date"
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
          className={inputClass}
        />
        <button type="button" onClick={search} disabled={loading} className={btnClass}>
          {loading ? 'Đang tìm...' : 'Tìm'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-8 space-y-3">
        {trips.map((t) => (
          <button
            key={String(t.id)}
            type="button"
            className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
            onClick={() => router.push(`/trips/${encodeURIComponent(String(t.id))}`)}
          >
            <strong>{String(t.operatorName)}</strong> — {Number(t.price).toLocaleString('vi-VN')}đ
            <div className="text-sm text-slate-500">{String(t.availableSeats)} ghế trống</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20';
const btnClass =
  'rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60';
const dropdownClass =
  'absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-xl border border-slate-100 bg-white p-1 shadow-lg';
const itemClass = 'block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-indigo-50';
