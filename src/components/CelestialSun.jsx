import React from 'react';

/**
 * Pure Tailwind/CSS Sun representation with animated flare.
 */
export default function CelestialSun({ temperature = 25, size = 64, className = '' }) {
  // Map temperature to color (approx)
  const colorStops = [
    { t: 0, c: '#FDB813' }, // base warm
    { t: 10, c: '#FFC83D' },
    { t: 20, c: '#FFE066' },
    { t: 30, c: '#FF9F1C' },
    { t: 40, c: '#FF6B35' }
  ];
  const clampTemp = Math.max(0, Math.min(40, temperature));
  let baseColor = colorStops[colorStops.length - 1].c;
  for (let i = 0; i < colorStops.length - 1; i++) {
    const a = colorStops[i];
    const b = colorStops[i + 1];
    if (clampTemp >= a.t && clampTemp <= b.t) {
      const ratio = (clampTemp - a.t) / (b.t - a.t);
      // simple channel lerp
      const ca = a.c.match(/#(..)(..)(..)/).slice(1).map(h => parseInt(h, 16));
      const cb = b.c.match(/#(..)(..)(..)/).slice(1).map(h => parseInt(h, 16));
      const blended = ca.map((v, idx) => Math.round(v + (cb[idx] - v) * ratio));
      baseColor = `rgb(${blended[0]}, ${blended[1]}, ${blended[2]})`;
      break;
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="Sun"
    >
      {/* Core */}
      <div
        className="rounded-full animate-pulse"
        style={{
          width: size,
            height: size,
            background: `radial-gradient(circle at 30% 30%, #fff 0%, ${baseColor} 60%, #ff8800 100%)`,
            boxShadow: `0 0 20px ${baseColor}, 0 0 40px ${baseColor}55`
        }}
      />
      {/* Flares */}
      <div className="absolute inset-0 animate-spin-slow" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 bg-gradient-to-b from-yellow-300/70 to-transparent"
            style={{
              width: 4,
              height: size * 0.85,
              transform: `translate(-50%, -50%) rotate(${(360 / 8) * i}deg)`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
      {/* Outer aura */}
      <div
        className="absolute -inset-2 rounded-full blur-2xl"
        style={{ background: `${baseColor}40` }}
        aria-hidden
      />
    </div>
  );
}
