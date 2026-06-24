'use client';

import { motion } from 'framer-motion';
import { Armchair, Crown } from 'lucide-react';

interface SeatLayoutJson {
  type: string;
  floors: Array<{ label?: string; rows: string[][] }>;
}

interface SeatInfo {
  seatId: string;
  seatLabel: string;
  status: string;
  heldBy?: string;
}

interface Props {
  layout: SeatLayoutJson;
  seats: SeatInfo[];
  selected: string[];
  holdingSeatId?: string | null;
  onSelect: (seatId: string) => void;
  adminMode?: boolean;
}

function isSelectable(status: string, adminMode?: boolean) {
  if (adminMode) return status === 'AVAILABLE' || status === 'BLOCKED';
  return status === 'AVAILABLE';
}

function isVipSeat(seatId: string, rowIndex: number) {
  return rowIndex === 0 || /^A0[1-4]$/.test(seatId) || /^L0[1-4]$/.test(seatId);
}

export function SeatMapGrid({ layout, seats, selected, holdingSeatId, onSelect, adminMode }: Props) {
  const statusMap = Object.fromEntries(seats.map((s) => [s.seatId, s]));

  return (
    <div className="space-y-8">
      {layout.floors.map((floor, fi) => (
        <div key={fi}>
          {floor.label && (
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {floor.label}
            </p>
          )}

          <div className="relative mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 shadow-elevated sm:max-w-xl">
            {/* Cabin front */}
            <div className="mb-6 flex flex-col items-center">
              <div className="h-2 w-32 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
              <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Phía trước xe
              </p>
            </div>

            <div className="space-y-3">
              {floor.rows.map((row, ri) => (
                <div key={ri} className="flex items-center justify-center gap-2.5">
                  {row.map((seatId, ci) =>
                    seatId ? (
                      <LuxurySeat
                        key={seatId}
                        seatId={seatId}
                        status={statusMap[seatId]?.status || 'AVAILABLE'}
                        isSelected={selected.includes(seatId)}
                        isVip={isVipSeat(seatId, ri)}
                        isHolding={holdingSeatId === seatId}
                        adminMode={adminMode}
                        onSelect={() => onSelect(seatId)}
                      />
                    ) : (
                      <div key={`aisle-${ri}-${ci}`} className="w-11" aria-hidden />
                    )
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 border-t border-slate-100 pt-6">
              <LegendDot className="bg-white ring-2 ring-slate-200" label="Trống" />
              <LegendDot className="bg-gradient-to-br from-brand-500 to-brand-700 ring-brand-300" label="Đang chọn" />
              <LegendDot className="bg-slate-200 ring-slate-300" label="Đã đặt" />
              <LegendDot className="bg-red-100 ring-red-300" label="Bị khóa" />
              <LegendDot className="bg-amber-50 ring-amber-300" label="VIP" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-md ring-1 ${className}`} />
      {label}
    </span>
  );
}

function LuxurySeat({
  seatId,
  status,
  isSelected,
  isVip,
  isHolding,
  adminMode,
  onSelect,
}: {
  seatId: string;
  status: string;
  isSelected: boolean;
  isVip: boolean;
  isHolding: boolean;
  adminMode?: boolean;
  onSelect: () => void;
}) {
  const available = isSelectable(status, adminMode);
  const blocked = status === 'BLOCKED';
  const booked = status === 'BOOKED';
  const occupied = booked || (blocked && !adminMode);
  const held = status === 'HELD' && !isSelected;

  return (
    <motion.button
      type="button"
      disabled={(!available && !isSelected) || isHolding}
      onClick={onSelect}
      whileHover={available && !isSelected ? { scale: 1.06, y: -2 } : undefined}
      whileTap={available ? { scale: 0.95 } : undefined}
      animate={isSelected ? { scale: [1, 1.08, 1.02] } : { scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`Ghế ${seatId}${isVip ? ' VIP' : ''}${occupied ? ' đã bán' : ''}`}
      aria-pressed={isSelected}
      className={[
        'group relative flex h-[52px] w-11 flex-col items-center justify-center rounded-2xl text-[10px] font-bold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2',
        isSelected
          ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_4px_20px_rgba(0,102,255,0.4)] ring-2 ring-brand-300/50'
          : blocked && !isSelected
            ? 'cursor-pointer bg-red-100 text-red-700 ring-2 ring-red-300/80'
            : occupied
            ? 'cursor-not-allowed bg-slate-200/80 text-slate-400'
            : held
              ? 'cursor-not-allowed bg-amber-50 text-amber-600 ring-1 ring-amber-200'
              : isVip
                ? 'bg-gradient-to-b from-amber-50 to-white text-amber-800 ring-1 ring-amber-200/80 hover:shadow-[0_4px_16px_rgba(245,158,11,0.2)]'
                : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/80 hover:bg-white hover:shadow-md hover:ring-indigo-200',
        isHolding ? 'opacity-60' : '',
      ].join(' ')}
    >
      {isVip && !isSelected && !occupied && (
        <Crown className="absolute -top-1.5 right-0.5 h-3 w-3 text-amber-500" aria-hidden />
      )}
      <Armchair
        className={`mb-0.5 h-4 w-4 ${isSelected ? 'text-white/90' : isVip ? 'text-amber-500' : 'text-slate-400 group-hover:text-indigo-500'}`}
        strokeWidth={1.75}
      />
      <span>{seatId}</span>
      {isHolding && (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/50">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </span>
      )}
    </motion.button>
  );
}
