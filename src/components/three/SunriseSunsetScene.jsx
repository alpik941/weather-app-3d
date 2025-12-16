import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Billboard } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useMemo, useRef } from 'react';
  const sunRef = useRef();
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.position.set(sunPos.x, sunPos.y, sunPos.z);
    }
  });

/**
 * SunriseSunsetScene
 * Props:
 * - sunrise: ms since epoch
 * - sunset: ms since epoch
 * - currentTime: ms since epoch
 * - weather: string (e.g., 'Clear', 'Clouds', 'Rain')
 */
export default function SunriseSunsetScene({ sunrise, sunset, currentTime, weather }) {
  const clamped = useMemo(() => {
    const start = Math.min(sunrise, sunset);
    const end = Math.max(sunrise, sunset);
    const t = Math.max(start, Math.min(end, currentTime));
    const progress = end === start ? 0.5 : (t - start) / (end - start);
    return { start, end, t, progress };
  }, [sunrise, sunset, currentTime]);

  const lighting = useMemo(() => {
    const baseIntensity = weather === 'Clear' ? 1.0 : weather === 'Clouds' ? 0.75 : 0.6;
    const overcast = ['Rain', 'Snow', 'Thunderstorm', 'Drizzle', 'Mist', 'Fog'].includes(weather);
    const turbidity = overcast ? 10 : 5; // Sky haze
    const rayleigh = overcast ? 1.5 : 2.5; // Scattering
    const mieCoefficient = overcast ? 0.02 : 0.005; // Particulate
    const mieDirectionalG = 0.8;
    return { baseIntensity, turbidity, rayleigh, mieCoefficient, mieDirectionalG };
  }, [weather]);

  // Map progress (0..1) to sun elevation and azimuth
  const sunPos = useMemo(() => {
    const azimuth = -Math.PI + clamped.progress * 2 * Math.PI; // east->west across sky
    const elevation = Math.sin(clamped.progress * Math.PI) * (Math.PI / 3); // 0..60 deg
    const radius = 50;
    const x = radius * Math.cos(elevation) * Math.cos(azimuth);
    const y = radius * Math.sin(elevation);
    const z = radius * Math.cos(elevation) * Math.sin(azimuth);
    return { x, y, z, elevation };
  }, [clamped.progress]);

  // Visualization neutralized: no animated sun or celestial objects

  const ambientIntensity = Math.max(0.12, lighting.baseIntensity * Math.sin(clamped.progress * Math.PI));
  let directionalIntensity = Math.max(0.18, lighting.baseIntensity * Math.sin(clamped.progress * Math.PI));

  // Weather-aware visibility: hide sun/moon/stars when adverse conditions; show sun only during day
  const isDay = currentTime >= sunrise && currentTime <= sunset;
  const shouldShowSun = isDay && weather === 'Clear';
  if (!shouldShowSun) {
    directionalIntensity = 0; // no key light resembling the sun
  }

  // Dawn/Dusk color blending based on progress and weather
  const timeBlend = useMemo(() => {
    // Define dawn/dusk windows ~1.5 hours around sunrise/sunset
    const windowMs = 90 * 60 * 1000;
    const isNearSunrise = Math.abs(currentTime - sunrise) <= windowMs;
    const isNearSunset = Math.abs(currentTime - sunset) <= windowMs;
    const phase = isNearSunrise ? 'dawn' : isNearSunset ? 'dusk' : 'day';

    const palettes = {
      Clear: {
        dawnSky: '#ffb199', // warm peach
        daySky: '#87ceeb', // clear blue
        duskSky: '#ff9a76', // soft orange
        dawnGround: '#a0bf8e',
        dayGround: '#88b06a',
        duskGround: '#9db271',
      },
      Clouds: {
        dawnSky: '#c7c1d9',
        daySky: '#a9b7c6',
        duskSky: '#b5a7c7',
        dawnGround: '#8fa48a',
        dayGround: '#7ea07a',
        duskGround: '#8b9c86',
      },
      Rain: {
        dawnSky: '#9aa4b0',
        daySky: '#7f8a96',
        duskSky: '#8b97a4',
        dawnGround: '#778c76',
        dayGround: '#6b846a',
        duskGround: '#728971',
      },
      Snow: {
        dawnSky: '#dfe7ef',
        daySky: '#e6f0ff',
        duskSky: '#d8e2ee',
        dawnGround: '#f4f7fb',
        dayGround: '#eef4fb',
        duskGround: '#f1f5fb',
      },
      Thunderstorm: {
        dawnSky: '#8d8299',
        daySky: '#6e6a78',
        duskSky: '#7f748d',
        dawnGround: '#6f7a6e',
        dayGround: '#5f6d5e',
        duskGround: '#667365',
      },
      Drizzle: {
        dawnSky: '#a9b3bf',
        daySky: '#94a0ad',
        duskSky: '#a0a9b6',
        dawnGround: '#829481',
        dayGround: '#7a8e79',
        duskGround: '#7f917e',
      },
      Mist: {
        dawnSky: '#cfd6de',
        daySky: '#c3ccd6',
        duskSky: '#c9d1da',
        dawnGround: '#bfc9c0',
        dayGround: '#b7c2b8',
        duskGround: '#bcc5bb',
      },
      Fog: {
        dawnSky: '#cfd6de',
        daySky: '#c3ccd6',
        duskSky: '#c9d1da',
        dawnGround: '#bfc9c0',
        dayGround: '#b7c2b8',
        duskGround: '#bcc5bb',
      },
    };

    const palette = palettes[weather] || palettes.Clear;
    const mix = (c1, c2, t) => {
      const hexToRgb = (h) => {
        const s = h.replace('#', '');
        return [
          parseInt(s.substring(0, 2), 16),
          parseInt(s.substring(2, 4), 16),
          parseInt(s.substring(4, 6), 16),
        ];
      };
      const rgbToHex = (r, g, b) => `#${[r, g, b]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('')}`;
      const [r1, g1, b1] = hexToRgb(c1);
      const [r2, g2, b2] = hexToRgb(c2);
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      return rgbToHex(r, g, b);
    };

    // Blend factor increases as we get closer to sunrise/sunset
    const blendFactor = phase === 'day'
      ? 0
      : 1 - Math.min(1, Math.abs(currentTime - (phase === 'dawn' ? sunrise : sunset)) / windowMs);

    const skyColor =
      phase === 'dawn'
        ? mix(palette.daySky, palette.dawnSky, blendFactor)
        : phase === 'dusk'
          ? mix(palette.daySky, palette.duskSky, blendFactor)
          : palette.daySky;

    const groundColor =
      phase === 'dawn'
        ? mix(palette.dayGround, palette.dawnGround, blendFactor)
        : phase === 'dusk'
          ? mix(palette.dayGround, palette.duskGround, blendFactor)
          : palette.dayGround;

    return { phase, skyColor, groundColor };
  }, [currentTime, sunrise, sunset, weather]);

  // Additional tone control: hemisphere light and scene bg color
  const hemiTop = timeBlend.skyColor;
  const hemiBottom = timeBlend.phase === 'day' ? '#b7c2b8' : timeBlend.groundColor;

  // Simple cloud particles for Clouds/Drizzle
  const showClouds = weather === 'Clouds' || weather === 'Drizzle';
  const intensityFactor = weather === 'Drizzle' ? 0.5 : 1.0; // drizzle fewer clouds
  const cloudParticles = useMemo(() => {
    if (!showClouds) return [];
    const count = Math.round(80 * intensityFactor);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 40 + Math.random() * 25;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 10;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 10;
      const y = 15 + Math.random() * 10;
      arr.push({ x, y, z, s: 3 + Math.random() * 4, o: 0.5 + Math.random() * 0.3 });
    }
    return arr;
  }, [showClouds, intensityFactor]);

  // Thin fog for Mist/Fog
  const enableFog = weather === 'Mist' || weather === 'Fog';

  // Cinematic glow near sunrise/sunset
  const glowStrength = timeBlend.phase === 'day' ? 0 : Math.min(0.6, directionalIntensity * 0.7);

  return (
    <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
        {/* Neutral background and hemisphere light for subtle ambient tone */}
        <hemisphereLight skyColor={hemiTop} groundColor={hemiBottom} intensity={0.8} />
        <color attach="background" args={[timeBlend.skyColor]} />

        {/* Fog for misty conditions */}
        {enableFog && <fog attach="fog" args={[timeBlend.skyColor, 10, 120]} />}

        <ambientLight intensity={ambientIntensity} />
        {directionalIntensity > 0 && (
          <directionalLight position={[sunPos.x, sunPos.y, sunPos.z]} intensity={directionalIntensity} />
        )}

        {/* Sky dome with weather-dependent parameters */}
        <Sky
          distance={450000}
          turbidity={lighting.turbidity}
          rayleigh={lighting.rayleigh}
          mieCoefficient={lighting.mieCoefficient}
          mieDirectionalG={lighting.mieDirectionalG}
          sunPosition={[sunPos.x, sunPos.y, sunPos.z]}
        />

        {/* Simple ground plane */
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={timeBlend.groundColor} />
        </mesh>

        {/* Sun sprite (shown only when allowed) */}
        {shouldShowSun && (
          <mesh ref={sunRef}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshBasicMaterial color={'#ffd27d'} />
          </mesh>
        )}

        {/* Subtle glow billboard near sun at dawn/dusk */}
        {glowStrength > 0 && shouldShowSun && (
          <mesh position={[sunPos.x, sunPos.y, sunPos.z]}>
            <sphereGeometry args={[3.5, 16, 16]} />
            <meshBasicMaterial color={timeBlend.skyColor} transparent opacity={0.25 * glowStrength} />
          </mesh>
        )}

        {/* Cloud particles */}
        {showClouds && cloudParticles.map((p, idx) => (
          <Billboard key={idx} position={[p.x, p.y, p.z]}>
            <mesh>
              <planeGeometry args={[p.s * 2.5, p.s]} />
              <meshStandardMaterial
                color="#dfe4e8"
                transparent
                opacity={p.o}
                roughness={1}
                metalness={0}
              />
            </mesh>
          </Billboard>
        ))}

        <OrbitControls enablePan={false} enableZoom={false} />

        {/* Post-processing bloom for stronger glow */}
        <EffectComposer>
          <Bloom intensity={timeBlend.phase === 'day' ? 0.2 : 0.6} luminanceThreshold={0.2} luminanceSmoothing={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
