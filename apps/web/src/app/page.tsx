'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Armchair,
  Bot,
  Bus,
  Calendar,
  ChevronRight,
  Coffee,
  Headphones,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Star,
  Ticket,
  Wifi,
  Wind,
} from 'lucide-react';
import { gql } from '@/lib/graphql';
import { useDebounce } from '@/hooks/useDebounce';

const AI_CHAT_URL = '/api/chat';

const SORT_OPTIONS = [
  { value: 'earliest', label: 'Sớm nhất' },
  { value: 'cheapest', label: 'Rẻ nhất' },
  { value: 'shortest', label: 'Ngắn nhất' },
] as const;

const FEATURES = [
  {
    icon: Shield,
    title: 'An toàn & Uy tín',
    desc: 'Đối tác nhà xe chính hãng, được Cappy Bus kiểm duyệt kỹ lưỡng.',
    accent: 'from-indigo-500/10 to-indigo-600/5',
  },
  {
    icon: Ticket,
    title: 'Đặt vé trong 60 giây',
    desc: 'Chọn ghế VIP, thanh toán mượt mà như đặt vé máy bay.',
    accent: 'from-[#D4AF37]/15 to-amber-50',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    desc: 'Capy AI luôn sẵn sàng — thông minh, ấm áp, không để bạn chờ đợi.',
    accent: 'from-violet-500/10 to-purple-50',
  },
] as const;

const AMENITIES = [
  { icon: Wifi, label: 'WiFi' },
  { icon: Wind, label: 'Điều hòa' },
  { icon: Coffee, label: 'Nước uống' },
  { icon: Armchair, label: 'Ghế VIP' },
] as const;

type Trip = {
  id: string;
  routeName: string;
  operatorName: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  durationMinutes: number;
};

export default function HomePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('TP.HCM');
  const [destination, setDestination] = useState('Đà Lạt');
  const [originQuery, setOriginQuery] = useState('TP.HCM');
  const [destQuery, setDestQuery] = useState('Đà Lạt');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('earliest');
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ name: string }>>([]);
  const [destSuggestions, setDestSuggestions] = useState<Array<{ name: string }>>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  const debouncedOrigin = useDebounce(originQuery, 300);
  const debouncedDest = useDebounce(destQuery, 300);

  const sortedTrips = useMemo(() => {
    const copy = [...trips];
    switch (sortBy) {
      case 'cheapest':
        return copy.sort((a, b) => a.price - b.price);
      case 'shortest':
        return copy.sort((a, b) => a.durationMinutes - b.durationMinutes);
      default:
        return copy.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
  }, [trips, sortBy]);

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

  async function search() {
    if (!origin.trim() || !destination.trim()) {
      setSearchError('Vui lòng nhập điểm đi và điểm đến');
      return;
    }
    setLoading(true);
    setHasSearched(true);
    setSearchError(null);
    try {
      const data = await gql<{ searchTrips: Trip[] }>(
        `query($origin:String!,$destination:String!,$travelDate:String!,$sortBy:String){
          searchTrips(origin:$origin,destination:$destination,travelDate:$travelDate,sortBy:$sortBy){
            id routeName operatorName busType departureTime arrivalTime price availableSeats durationMinutes
          }
        }`,
        { origin, destination, travelDate, sortBy }
      );
      setTrips(data.searchTrips);
      if (data.searchTrips.length === 0) {
        setSearchError('Không tìm thấy chuyến xe. Hãy chọn địa điểm từ gợi ý hoặc thử đổi ngày đi.');
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

  async function sendChat() {
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');
    try {
      const res = await fetch(AI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Lỗi máy chủ (${res.status})`);
      }
      setChatMessages([
        ...newMsgs,
        { role: 'assistant', content: data.reply || 'Không nhận được phản hồi.' },
      ]);
    } catch (err) {
      const hint =
        err instanceof TypeError
          ? 'Không kết nối được Capy AI. Hãy chạy ai-service (port 50060) hoặc docker compose up ai-service.'
          : err instanceof Error
            ? err.message
            : 'Capy AI tạm thời không khả dụng.';
      setChatMessages([...newMsgs, { role: 'assistant', content: hint }]);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ─── HERO ─── */}
      <section className="relative -mt-[76px] overflow-hidden pt-[76px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bus.png"
            alt="Luxury bus on scenic coastal highway"
            fill
            priority
            className="object-cover object-[60%_center] scale-105"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/75 via-[#0F172A]/55 to-[#0F172A]/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-transparent" />
        </div>

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#D4AF37]/15 blur-[90px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-4 pt-16 sm:px-6 sm:pt-20 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              Luxury bus travel, reimagined
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Hành trình cao cấp
              <br />
              <span className="bg-gradient-to-r from-white via-white to-indigo-200 bg-clip-text text-transparent">
                bắt đầu từ Cappy Bus
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              So sánh giá, chọn ghế limousine và thanh toán trong vài chạm — trải nghiệm đặt vé
              đẳng cấp hàng không.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {['500+ chuyến/ngày', '4.9★ đánh giá', 'Đối tác chính hãng'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Search card */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[24px] border border-white/50 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:p-8"
          >
            <p className="mb-6 text-sm font-medium text-slate-500">
              Tìm chuyến xe phù hợp nhất cho bạn
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-4">
              <LocationInput
                label="Nơi đi"
                placeholder="TP.HCM"
                query={originQuery}
                suggestions={originSuggestions}
                onQueryChange={(v) => {
                  setOriginQuery(v);
                  setOrigin(v);
                }}
                onSelect={(name) => {
                  setOrigin(name);
                  setOriginQuery(name);
                  setOriginSuggestions([]);
                }}
              />
              <LocationInput
                label="Nơi đến"
                placeholder="Đà Lạt"
                query={destQuery}
                suggestions={destSuggestions}
                onQueryChange={(v) => {
                  setDestQuery(v);
                  setDestination(v);
                }}
                onSelect={(name) => {
                  setDestination(name);
                  setDestQuery(name);
                  setDestSuggestions([]);
                }}
              />
              <DateInput label="Ngày đi" value={travelDate} onChange={setTravelDate} />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={search}
                  disabled={loading}
                  className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/35 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  {loading ? 'Đang tìm...' : 'Tìm chuyến'}
                </button>
              </div>
            </div>
            {searchError && hasSearched && !loading && (
              <p className="mt-4 text-sm text-red-500">{searchError}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Tại sao Cappy Bus
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
            Du lịch thông minh, sang trọng
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="group rounded-[24px] border border-white/80 bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-indigo-600 transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── RESULTS ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Chuyến xe phù hợp</h2>
            {hasSearched && !loading && sortedTrips.length > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                {sortedTrips.length} chuyến từ{' '}
                <span className="font-medium text-[#0F172A]">{origin}</span> →{' '}
                <span className="font-medium text-[#0F172A]">{destination}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(opt.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  sortBy === opt.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {loading && Array.from({ length: 3 }).map((_, i) => <TripSkeleton key={i} />)}

          {!loading && hasSearched && trips.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white py-24 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Bus className="h-8 w-8 text-slate-300" />
              </div>
              <p className="mt-5 text-lg font-semibold text-[#0F172A]">Không có chuyến phù hợp</p>
              <p className="mt-1 text-sm text-slate-400">
                {searchError || 'Thử đổi ngày hoặc tuyến đường khác'}
              </p>
            </div>
          )}

          <AnimatePresence>
            {!loading &&
              sortedTrips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <TripCard
                    trip={trip}
                    onSelect={() => router.push(`/trips/${encodeURIComponent(trip.id)}`)}
                  />
                </motion.div>
              ))}
          </AnimatePresence>

          {!hasSearched && !loading && (
            <div className="rounded-[24px] border border-slate-100 bg-white py-20 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Search className="h-7 w-7 text-indigo-400" />
              </div>
              <p className="mt-5 text-lg font-semibold text-[#0F172A]">Sẵn sàng khám phá?</p>
              <p className="mt-1 text-sm text-slate-400">
                Nhập tuyến đường và bấm Tìm chuyến để xem lịch trình cao cấp
              </p>
            </div>
          )}
        </div>
      </section>

      {/* AI Chat FAB */}
      <motion.button
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        aria-label="Mở Capy AI"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-white/20 bg-[#0F172A] py-3.5 pl-4 pr-5 text-white shadow-[0_12px_40px_rgba(15,23,42,0.35)] backdrop-blur-md"
      >
        <Bot className="h-5 w-5 text-[#D4AF37]" />
        <span className="text-sm font-semibold">Capy AI</span>
      </motion.button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-50 flex h-[440px] w-[380px] flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Capy AI</p>
                <p className="text-xs text-white/70">Trợ lý đặt vé thông minh</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {chatMessages.length === 0 && (
                <p className="text-center text-sm text-slate-400">
                  Xin chào! Tôi có thể giúp bạn tìm chuyến, so sánh giá hoặc chọn ghế VIP 🐾
                </p>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-indigo-600 text-white'
                        : 'rounded-bl-md bg-slate-100 text-[#0F172A]'
                    }`}
                  >
                    {m.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-4">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Hỏi Capy AI..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={sendChat}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Gửi
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Sub-components ─── */

function LocationInput({
  label,
  placeholder,
  query,
  suggestions,
  onQueryChange,
  onSelect,
}: {
  label: string;
  placeholder: string;
  query: string;
  suggestions: Array<{ name: string }>;
  onQueryChange: (v: string) => void;
  onSelect: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
        <input
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-[52px] w-full rounded-2xl border border-slate-200/80 bg-white px-4 pl-11 text-[#0F172A] outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
          {suggestions.map((s) => (
            <button
              key={s.name}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-indigo-50"
              onClick={() => {
                onSelect(s.name);
                setOpen(false);
              }}
            >
              <MapPin className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="text-sm text-[#0F172A]">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[52px] w-full rounded-2xl border border-slate-200/80 bg-white px-4 pl-11 text-[#0F172A] outline-none transition-all duration-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15"
        />
      </div>
    </div>
  );
}

function TripCard({ trip, onSelect }: { trip: Trip; onSelect: () => void }) {
  const rating = mockRating(trip.operatorName);
  const originalPrice = Math.round(trip.price * 1.12);

  return (
    <article className="group overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
      <div className="grid lg:grid-cols-[220px_1fr_auto]">
        {/* Bus image */}
        <div className="relative h-48 lg:h-auto lg:min-h-[220px]">
          <Image
            src="/images/hero-bus.png"
            alt={trip.busType}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="220px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent lg:bg-gradient-to-r" />
          <div className="absolute bottom-4 left-4 right-4 lg:bottom-auto lg:left-4 lg:top-4 lg:right-auto">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#0F172A] backdrop-blur-sm">
              <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
              {rating}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center gap-5 p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-500/25">
              {trip.operatorName.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">{trip.operatorName}</p>
              <p className="text-sm text-slate-500">{trip.busType}</p>
              <p className="mt-0.5 text-xs text-slate-400">{trip.routeName}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold tabular-nums text-[#0F172A]">
                {formatTime(trip.departureTime)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Khởi hành
              </p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1.5 px-2">
              <p className="text-xs font-medium text-indigo-600">
                {formatDuration(trip.durationMinutes)}
              </p>
              <div className="flex w-full max-w-[140px] items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300" />
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                  <Bus className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-[#0F172A]">
                {formatTime(trip.arrivalTime)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Đến nơi
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap items-center gap-2">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                <Icon className="h-3.5 w-3.5 text-indigo-500" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-100 p-6 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:p-8">
          <div className="lg:text-right">
            <p className="text-xs text-slate-400 line-through">
              {originalPrice.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-3xl font-bold text-indigo-600">
              {trip.price.toLocaleString('vi-VN')}
              <span className="text-lg font-semibold">đ</span>
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-600">
              {trip.availableSeats} ghế trống
            </p>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl active:scale-[0.98]"
          >
            Chọn ghế
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function TripSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[24px] border border-slate-100 bg-white">
      <div className="grid lg:grid-cols-[220px_1fr_auto]">
        <div className="h-48 bg-slate-100 lg:min-h-[220px]" />
        <div className="space-y-4 p-8">
          <div className="h-6 w-48 rounded-lg bg-slate-100" />
          <div className="h-4 w-32 rounded bg-slate-50" />
          <div className="flex gap-4">
            <div className="h-10 w-16 rounded-lg bg-slate-100" />
            <div className="h-10 flex-1 rounded-lg bg-slate-50" />
            <div className="h-10 w-16 rounded-lg bg-slate-100" />
          </div>
        </div>
        <div className="hidden space-y-3 p-8 lg:block">
          <div className="ml-auto h-8 w-24 rounded-lg bg-slate-100" />
          <div className="ml-auto h-12 w-32 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function mockRating(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return (4.5 + (Math.abs(h) % 5) / 10).toFixed(1);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h}h ${m}m`;
}
