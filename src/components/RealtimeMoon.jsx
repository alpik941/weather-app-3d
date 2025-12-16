import React, { useContext, useEffect, useRef, useState } from 'react';
import useMoonPhase from '../hooks/useMoonPhase';
import CelestialMoon from './CelestialMoon';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTime } from '../contexts/TimeContext';

// Map internal phase keys to translation keys in LanguageContext (prefixed with moon_)
function localizePhase(tFn, key) {
  const mapKey = `moon_${key}`; // e.g., moon_full
  const result = tFn(mapKey);
  return result === mapKey ? key : result;
}

export default function RealtimeMoon({ lat, lon, autoLocate = false, size = 96, showLabel = true, locale, timezone }) {
  const ctx = useContext(LanguageContext);
  const tFn = ctx?.t || ((k) => k);
  const language = ctx?.language || locale || 'en';
  const { illumination, simpleIllumination, phaseAngleDeg, ageDays, phaseCycle, waxing, name, moonrise, moonset, loading, error } = useMoonPhase({ lat, lon, autoLocate, refreshInterval: 60_000 });
  const { formatTime } = useTime();

  // Tweened illumination for smooth transitions
  const [displayIllum, setDisplayIllum] = useState(illumination || 0);
  const targetRef = useRef(illumination || 0);
  const rafRef = useRef();

  useEffect(() => {
    if (illumination == null) return; // guard
    targetRef.current = illumination;
    const start = performance.now();
    const initial = displayIllum;
    const duration = 1400; // ms
    function tick(ts) {
      const p = Math.min(1, (ts - start) / duration);
      // easeInOutQuad
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      const value = initial + (targetRef.current - initial) * eased;
      setDisplayIllum(value);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [illumination]);

  if (loading) {
    const label = tFn('loading');
    return <div className="text-sm text-slate-400">{label === 'loading' ? 'Loading moon…' : label}</div>;
  }
  if (error) {
    const label = tFn('moonUnavailable');
    return <div className="text-sm text-red-500">{label === 'moonUnavailable' ? 'Moon unavailable' : label}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <CelestialMoon
        illumination={displayIllum}
        phaseCycle={phaseCycle}
        waxing={waxing}
        size={size}
      />
      {showLabel && (
        <div className="flex flex-col items-center text-[10px] sm:text-xs font-medium text-slate-300 tracking-wide leading-tight">
          <span>{localizePhase(tFn, name)} · {(illumination * 100).toFixed(0)}%</span>
          <span className="opacity-70">{(() => { const a = tFn('moonAge'); return a === 'moonAge' ? 'Age' : a; })()}: {ageDays?.toFixed(1)} d</span>
          {(moonrise || moonset) && (
            <span className="opacity-60 flex gap-2">
              <span>{(() => { const a = tFn('moonrise'); return a === 'moonrise' ? 'Rise' : a; })()}: {moonrise ? formatTime(moonrise) : '—'}</span>
              <span>{(() => { const a = tFn('moonset'); return a === 'moonset' ? 'Set' : a; })()}: {moonset ? formatTime(moonset) : '—'}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
