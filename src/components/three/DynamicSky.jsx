import React, { useMemo } from 'react';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';

/**
 * DynamicSky
 * Props:
 *  - sunrise (ms)
 *  - sunset (ms)
 *  - currentTime (ms)
 *  - weather (string) e.g. 'Clear', 'Clouds', 'Rain'
 *  - enabled (boolean) override gate (optional)
 * Behavior:
 *  - Interpolates sun position across the sky dome using time fraction between sunrise & sunset.
 *  - Warmer sun color & softer light near sunrise/sunset.
 *  - Only renders when weather is clear-ish unless enabled explicitly.
 */
export default function DynamicSky({ sunrise, sunset, currentTime, weather, enabled }) {
  const lower = weather?.toLowerCase() || '';
  const isClear = /(clear|sun)/.test(lower);
  const active = enabled ?? isClear;

  const t = useMemo(() => {
    if (!sunrise || !sunset || sunrise >= sunset) return 0.5; // midday fallback
    return Math.min(Math.max((currentTime - sunrise) / (sunset - sunrise), 0), 1);
  }, [sunrise, sunset, currentTime]);

  // Map t (0 sunrise -> 1 sunset) to solar elevation using a simple half-arc
  const sunAngle = useMemo(() => THREE.MathUtils.lerp(-Math.PI / 2, Math.PI / 2, t), [t]);
  const sunPosition = useMemo(() => [
    Math.sin(sunAngle) * 100,
    Math.cos(sunAngle) * 100,
    0
  ], [sunAngle]);

  const sunIntensity = useMemo(() => (t < 0.15 || t > 0.85 ? 0.7 : 1.2), [t]);
  const sunColor = useMemo(() => {
    if (t < 0.15) return '#ffd27f'; // sunrise hue
    if (t > 0.85) return '#ff8c42'; // sunset hue
    return '#ffffff'; // day
  }, [t]);
  const ambientIntensity = useMemo(() => (t < 0.15 || t > 0.85 ? 0.4 : 0.6), [t]);
  const ambientColor = useMemo(() => (t < 0.15 || t > 0.85 ? '#ffe6c7' : '#ffffff'), [t]);

  if (!active) return null;

  return (
    <group>
      <Sky
        sunPosition={sunPosition}
        turbidity={8}
        rayleigh={3}
        mieCoefficient={0.005}
        mieDirectionalG={0.9}
        distance={450000}
        inclination={0}
        azimuth={0.25}
      />
      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
      />
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
    </group>
  );
}
