/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getDisplayTime, getDisplayDate, dayKey } from '../utils/timeFormat';
import { basicFormatTime, basicFormatDate } from '../utils/timeFormat_rollback';

/**
 * TimeContext centralizes timezone + formatting preferences.
 * - timezone: IANA string (preferred) or numeric offset seconds
 * - hour12: boolean | undefined (user preference)
 * - rollback: when true, bypass helpers (legacy formatting path)
 * Persistence keys: TIME_HOUR12, TIME_ROLLBACK
 */

const TimeContext = createContext(undefined);

export function TimeProvider({ children, initialTimezone, fallbackTimezone }) {
  const [timezone, setTimezone] = useState(initialTimezone || undefined);
  const [hour12, setHour12] = useState(() => {
    const stored = localStorage.getItem('TIME_HOUR12');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return undefined; // let locale decide
  });
  const [rollback, setRollback] = useState(() => localStorage.getItem('TIME_ROLLBACK') === '1');

  // When initialTimezone changes (e.g., after weather fetch) adopt it if not already set.
  useEffect(() => {
    if (initialTimezone && initialTimezone !== timezone) {
      setTimezone(initialTimezone);
    }
  }, [initialTimezone, timezone]);

  // Diagnostic once on mount (dev aid): log sample offsets if not production
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__TIME_DIAG_LOGGED__) {
      window.__TIME_DIAG_LOGGED__ = true;
      const samples = ['UTC','Europe/Moscow','America/New_York','Asia/Kathmandu'];
      try {
        const now = Date.now();
        const rows = samples.map(tz => {
          try {
            const parts = new Intl.DateTimeFormat('en-US',{ timeZone: tz, hour:'2-digit', hour12:false, minute:'2-digit'}).formatToParts(now);
            return { tz, local: parts.map(p=>p.value).join('') };
          } catch { return { tz, error: true }; }
        });
        console.log('[TimeContext][diagnostic] sample local times', rows);
      } catch {}
    }
  }, []);

  const toggleHour12 = () => setHour12(prev => {
    const next = prev === true ? false : prev === false ? undefined : true; // cycle true -> false -> undefined -> true
    if (next === undefined) localStorage.removeItem('TIME_HOUR12'); else localStorage.setItem('TIME_HOUR12', String(next));
    return next;
  });

  const setHour12Pref = (val) => {
    setHour12(val);
    if (val == null) localStorage.removeItem('TIME_HOUR12'); else localStorage.setItem('TIME_HOUR12', String(val));
  };

  const setRollbackFlag = (val) => {
    setRollback(val);
    if (val) localStorage.setItem('TIME_ROLLBACK', '1'); else localStorage.removeItem('TIME_ROLLBACK');
  };

  // Formatting helpers respect rollback flag but otherwise always use provided timezone
  const formatWithTZTime = useCallback((input, opts) => {
    const tz = timezone || fallbackTimezone;
    return getDisplayTime(input, { timezone: tz, hour12, ...(opts || {}) });
  }, [timezone, fallbackTimezone, hour12]);

  const formatWithTZDate = useCallback((input, opts) => {
    const tz = timezone || fallbackTimezone;
    return getDisplayDate(input, { timezone: tz, ...(opts || {}) });
  }, [timezone, fallbackTimezone]);

  const value = useMemo(() => ({
    timezone: timezone || fallbackTimezone,
    setTimezone,
    hour12,
    setHour12: setHour12Pref,
    toggleHour12,
    rollback,
    setRollback: setRollbackFlag,
  // Utilities (respect rollback)
  formatTime: (input, opts) => rollback ? basicFormatTime(input, opts) : formatWithTZTime(input, opts),
  formatDate: (input, opts) => rollback ? basicFormatDate(input, opts) : formatWithTZDate(input, opts),
    dayKey: (input) => {
      const tz = timezone || fallbackTimezone;
      return dayKey(input, tz);
    }
  }), [timezone, fallbackTimezone, hour12, rollback, formatWithTZTime, formatWithTZDate]);

  return <TimeContext.Provider value={value}>{children}</TimeContext.Provider>;
}

export function useTime() {
  const ctx = useContext(TimeContext);
  if (!ctx) throw new Error('useTime must be used within <TimeProvider>');
  return ctx;
}

// --- Legacy fallbacks (minimal) ---
function legacyFormatTime(input) {
  if (input == null) return '—';
  let date;
  if (typeof input === 'number') date = input < 1e12 ? new Date(input * 1000) : new Date(input); else if (input instanceof Date) date = input; else if (typeof input === 'string') date = new Date(input); else return '—';
  if (isNaN(date)) return '—';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function legacyFormatDate(input) {
  if (input == null) return '—';
  let date;
  if (typeof input === 'number') date = input < 1e12 ? new Date(input * 1000) : new Date(input); else if (input instanceof Date) date = input; else if (typeof input === 'string') date = new Date(input); else return '—';
  if (isNaN(date)) return '—';
  return date.toLocaleDateString();
}

// Do not export TimeContext directly; prefer the useTime() hook per project conventions.