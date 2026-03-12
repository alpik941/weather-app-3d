import React, { useContext } from 'react';
import RealtimeMoon from './RealtimeMoon';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTime } from '../contexts/TimeContext';

/**
 * AstronomyPanel
 * Displays moon phase, rise/set & placeholder for sun times (to be wired with existing weather data if available)
 * Props:
 *  - lat, lon
 *  - sunrise, sunset (Date or string) optional (if not passed shows placeholders)
 */
const AstronomyPanel = React.memo(function AstronomyPanel({ lat, lon, autoLocate=false, sunrise, sunset, timezone }) {
  const ctx = useContext(LanguageContext);
  const tFn = ctx?.t || ((k) => k);
  const { formatTime } = useTime();

  function fmtTime(tsOrDate) {
    if (!tsOrDate) return '—';
    if (tsOrDate instanceof Date) {
      return formatTime(Math.floor(tsOrDate.getTime()/1000), timezone ? { timezone } : undefined);
    }
    if (typeof tsOrDate === 'number') return formatTime(tsOrDate, timezone ? { timezone } : undefined);
    const parsed = new Date(tsOrDate);
    if (!isNaN(parsed)) return formatTime(Math.floor(parsed.getTime()/1000), timezone ? { timezone } : undefined);
    return '—';
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border border-slate-700/50 bg-slate-800/60 p-4 shadow-inner backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="break-words pr-2 text-sm font-semibold uppercase tracking-wide text-slate-200">{(() => { const a = tFn('astronomyTitle'); return a === 'astronomyTitle' ? 'Astronomy' : a; })()}</h3>
      </div>
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{(() => { const a = tFn('sun'); return a === 'sun' ? 'Sun' : a; })()}</div>
          <div className="flex flex-col gap-1 text-xs text-slate-300">
            <span className="break-words">{(() => { const a = tFn('sunrise'); return a === 'sunrise' ? 'Sunrise' : a; })()}: {fmtTime(sunrise)}</span>
            <span className="break-words">{(() => { const a = tFn('sunset'); return a === 'sunset' ? 'Sunset' : a; })()}: {fmtTime(sunset)}</span>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <RealtimeMoon lat={lat} lon={lon} autoLocate={autoLocate} size={72} timezone={timezone} />
        </div>
      </div>
    </div>
  );
});

export default AstronomyPanel;
