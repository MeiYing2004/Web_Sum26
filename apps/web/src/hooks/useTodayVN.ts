'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { todayVN, msUntilNextMidnightVN } from '@/lib/datetime';

/** Tracks today's date in VN timezone; refreshes after midnight. */
export function useTodayVN(): string {
  const [today, setToday] = useState(() => todayVN());

  useEffect(() => {
    function refresh() {
      const next = todayVN();
      setToday((prev) => (prev === next ? prev : next));
    }

    refresh();
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      refresh();
      intervalId = setInterval(refresh, 60_000);
    }, msUntilNextMidnightVN());

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return today;
}

/**
 * Travel date state that auto-advances when the user had "today" selected and midnight passes.
 */
export function useTravelDateWithTodaySync(initial?: string) {
  const today = useTodayVN();
  const [travelDate, setTravelDateState] = useState(initial || today);
  const prevTodayRef = useRef(today);

  useEffect(() => {
    if (travelDate === prevTodayRef.current) {
      setTravelDateState(today);
    }
    prevTodayRef.current = today;
  }, [today, travelDate]);

  const setTravelDate = useCallback((date: string) => {
    setTravelDateState(date);
  }, []);

  return [travelDate, setTravelDate, today] as const;
}
