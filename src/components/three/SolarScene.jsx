import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Bounds } from '@react-three/drei';
import { shouldShowSun, shouldShowMoon, isDaytime } from '../../utils/weatherVisuals';
import { useTheme } from '../../contexts/ThemeContext';

// Utility: linear interpolate between two colors (hex strings) by t in [0,1]
function lerpColor(a, b, t) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return ca.lerp(cb, THREE.MathUtils.clamp(t, 0, 1)).getStyle();
}

// Map temperature (°C) to sun color
function sunColorForTemp(tempC) {
  // Key points
  const c20 = '#FFA500'; // orange at 20°C
  const c25 = '#FFD54A'; // warm yellow at 25°C
  const c30 = '#FF7A00'; // red-orange at 30°C

  if (tempC <= 20) return c20;
  if (tempC >= 30) return c30;
  if (tempC <= 25) {
    const t = (tempC - 20) / 5;
    return lerpColor(c20, c25, t);
  }
  // between 25 and 30
  const t = (tempC - 25) / 5;
  return lerpColor(c25, c30, t);
}

function Sun({ temperature = 25 }) {
  const sunRef = useRef();
  const haloRef = useRef();
  const color = useMemo(() => sunColorForTemp(temperature), [temperature]);

  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2; // slow rotation
    }
    if (haloRef.current) {
      haloRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group>
      {/* Core sun */}
      <mesh ref={sunRef} castShadow receiveShadow>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Simple halo using additive blending on a slightly larger back-sided sphere */}
      <mesh ref={haloRef} scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Light emitted from the sun */}
      <pointLight color={color} intensity={2.2} distance={80} decay={2} />
    </group>
  );
}

function Moon({
  colorMapUrl = '/textures/2k_moon.jpg',
  bumpMapUrl = '/textures/2k_moon_bump.jpg',
  lightTheme = false,
}) {
  const moonRef = useRef();
  const [colorMap, setColorMap] = useState(null);
  const [bumpMap, setBumpMap] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let mounted = true;
    loader.load(
      colorMapUrl,
      (tex) => {
        if (!mounted) return;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        setColorMap(tex);
      },
      undefined,
      () => setColorMap(null) // fallback if not found
    );
    loader.load(
      bumpMapUrl,
      (tex) => {
        if (!mounted) return;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        setBumpMap(tex);
      },
      undefined,
      () => setBumpMap(null)
    );
    return () => {
      mounted = false;
    };
  }, [colorMapUrl, bumpMapUrl]);

  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={moonRef} castShadow receiveShadow>
        <sphereGeometry args={[5, 64, 64]} />
        {colorMap ? (
          <meshStandardMaterial
            map={colorMap}
            bumpMap={bumpMap || undefined}
            bumpScale={bumpMap ? 0.25 : 0}
            roughness={0.9}
            metalness={0.0}
            emissive={lightTheme ? '#bfc5ff' : '#000000'}
            emissiveIntensity={lightTheme ? 0.2 : 0}
          />
        ) : (
          <meshStandardMaterial
            color="#d0d0d0"
            roughness={0.9}
            metalness={0.0}
            emissive={lightTheme ? '#bfc5ff' : '#000000'}
            emissiveIntensity={lightTheme ? 0.2 : 0}
          />
        )}
      </mesh>

      {/* Subtle glow around the moon */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#9fb3ff"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Cool point light to give the moon some rim lighting */}
      <pointLight color="#9fb3ff" intensity={0.8} distance={60} decay={2} />
    </group>
  );
}

function isCurrentlyDay() {
  const h = new Date().getHours();
  // Consider day between 6:00 and 18:00
  return h >= 6 && h < 18;
}

export default function SolarScene({ defaultTemperature = 25, isNight, weather, sunrise, sunset, currentTime }) {
  const { theme } = useTheme();
  const [isDay, setIsDay] = useState(() => {
    if (typeof isNight === 'boolean') return !isNight;
    if (currentTime || sunrise || sunset) {
      return isDaytime(currentTime || Date.now(), sunrise, sunset);
    }
    return isCurrentlyDay();
  });
  const [temp, setTemp] = useState(defaultTemperature);
  const boundsRef = useRef();

  // Sync with external isNight prop if provided
  useEffect(() => {
    if (typeof isNight === 'boolean') {
      setIsDay(!isNight);
    } else if (currentTime || sunrise || sunset) {
      setIsDay(isDaytime(currentTime || Date.now(), sunrise, sunset));
    }
  }, [isNight, currentTime, sunrise, sunset]);

  useEffect(() => {
    // Refit bounds when switching objects
    if (boundsRef.current) {
      // small timeout to ensure object tree updated before fitting
      const id = setTimeout(() => {
        try {
          boundsRef.current.refresh().fit();
        } catch (_) {
          // ignore
        }
      }, 0);
      return () => clearTimeout(id);
    }
  }, [isDay, temp]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 480 }}>
      {/* Overlay Controls */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => setIsDay(true)}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}
          aria-label="Make Day"
        >
          Make Day
        </button>
        <button
          onClick={() => setIsDay(false)}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}
          aria-label="Make Night"
        >
          Make Night
        </button>
        {isDay && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', marginLeft: 8 }}>
            Temp: <input type="range" min={15} max={35} step={1} value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
            <span style={{ minWidth: 36 }}>{temp}°C</span>
          </label>
        )}
      </div>

      <Canvas shadows camera={{ position: [0, 0, 30], fov: 45 }}>
        {/* Lights: day uses directional; at night, increase ambient slightly in light theme to avoid black moon */}
        <ambientLight intensity={isDay ? 0.5 : (theme === 'light' ? 0.35 : 0.25)} />
        {isDay && <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />}

        <Suspense fallback={null}>
          <Bounds ref={boundsRef} fit clip observe>
            <Center>
              {isDay && shouldShowSun({ currentMs: currentTime || Date.now(), sunriseMs: sunrise, sunsetMs: sunset, weather }) ? (
                <Sun temperature={temp} />
              ) : null}
              {!isDay && shouldShowMoon({ currentMs: currentTime || Date.now(), sunriseMs: sunrise, sunsetMs: sunset, weather }) ? (
                <Moon lightTheme={theme === 'light'} />
              ) : null}
            </Center>
          </Bounds>
        </Suspense>

        <OrbitControls enableDamping dampingFactor={0.08} target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}
