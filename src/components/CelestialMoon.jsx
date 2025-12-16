import React from 'react';

/**
 * Pure Tailwind/CSS Moon representation (no WebGL) for low-power or fallback mode.
 */
export default function CelestialMoon({
  phase = 0.5, // legacy: cycle 0..1 (0 new -> 0.5 full)
  illumination, // optional direct fraction lit (0..1)
  phaseCycle, // optional cycle 0..1 (alias for phase)
  waxing, // optional boolean to override inferred waxing/waning
  southernHemisphere = false,
  size = 64,
  className = ''
}) {
  const cycle = typeof phaseCycle === 'number' ? phaseCycle : phase;
  const clamped = Math.max(0, Math.min(1, cycle));
  const inferredWaxing = clamped < 0.5;
  const isWaxing = waxing != null ? waxing : inferredWaxing;
  // Illumination fraction: if provided use it, else approximate from cycle
  const illum = typeof illumination === 'number'
    ? Math.min(1, Math.max(0, illumination))
    : 1 - Math.abs(clamped - 0.5) * 2; // simple linear bright curve, not physical

  // Convert illumination (lit fraction) to mask width. When illum=1 => maskWidth=0 (no shadow)
  // When illum near 0 => mask covers almost all disk.
  const maskWidth = (1 - illum) * 100;
  const isWaning = !isWaxing;
  const flip = southernHemisphere ? -1 : 1;
  const sideKey = (isWaning ^ southernHemisphere) ? 'right' : 'left';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="Moon"
    >
      {/* Base moon */}
      <div
        className="rounded-full bg-gradient-to-b from-slate-200 to-slate-500 shadow-inner"
        style={{ width: size, height: size }}
      />
      {/* Terminator (phase mask) */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className="absolute top-0 bottom-0 bg-slate-900/85 transition-all duration-500"
          style={{
            width: `${maskWidth}%`,
            [sideKey]: 0,
            filter: 'blur(1px)',
            transform: `scaleX(${flip})`
          }}
        />
      </div>
      {/* Subtle glow */}
      <div
        className="absolute -inset-1 rounded-full bg-slate-300/10 blur-sm"
        aria-hidden
      />
    </div>
  );
}
