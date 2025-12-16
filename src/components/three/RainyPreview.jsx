import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function RainParticles({ intensity = 1200 }) {
  const ref = useRef(null);
  const particles = useMemo(() => {
    const positions = new Float32Array(intensity * 3);
    const velocities = new Float32Array(intensity * 3);
    for (let i = 0; i < intensity; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 40 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i * 3] = (Math.random() - 0.5) * 0.15;
      velocities[i * 3 + 1] = -Math.random() * 0.6 - 0.4;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    return { positions, velocities };
  }, [intensity]);

  useFrame(() => {
    if (!ref.current) return;
    const positions = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < intensity; i++) {
      positions[i * 3] += particles.velocities[i * 3];
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={particles.positions}>
      <PointMaterial
        transparent
        size={0.08}
        sizeAttenuation
        color="#6EC6FF"
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function StormClouds({ coverage = 0.8, color = '#4A5568', opacity = 0.85, speed = 0.08 }) {
  const count = Math.floor(coverage * 10) + 4;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <Cloud
          key={i}
          position={[(Math.random() - 0.5) * 30, Math.random() * 8 + 6, (Math.random() - 0.5) * 30]}
          scale={Math.random() * 2.5 + 1.5}
          opacity={opacity}
          color={color}
          speed={speed}
        />
      ))}
    </group>
  );
}

function Lightning({ active = false }) {
  const ref = useRef(null);
  const [flash, setFlash] = useState(false);
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 120);
    }, 1800 + Math.random() * 2400);
    return () => clearInterval(id);
  }, [active]);
  return (
    <pointLight
      ref={ref}
      position={[0, 18, 0]}
      intensity={flash ? 12 : 0}
      color="#FFFFFF"
      distance={120}
    />
  );
}

export default function RainyPreview() {
  const [intensity, setIntensity] = useState(1400);
  const [coverage, setCoverage] = useState(0.9);
  const [stormy, setStormy] = useState(false);
  const [fog, setFog] = useState(false);
  const [wind, setWind] = useState(0);
  return (
    <div className="w-full h-full relative">
      {/* Controls (dev-only) */}
      <div className="absolute top-2 left-2 z-10 p-2 rounded bg-white/80 dark:bg-gray-800/80 text-xs flex flex-wrap gap-2">
        <label className="flex items-center gap-1">Rain
          <input type="range" min={300} max={3000} step={100} value={intensity} onChange={(e)=>setIntensity(Number(e.target.value))} />
          <span>{Math.round(intensity)}</span>
        </label>
        <label className="flex items-center gap-1">Clouds
          <input type="range" min={0.2} max={1} step={0.05} value={coverage} onChange={(e)=>setCoverage(Number(e.target.value))} />
          <span>{coverage.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={stormy} onChange={(e)=>setStormy(e.target.checked)} /> Storm
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={fog} onChange={(e)=>setFog(e.target.checked)} /> Fog
        </label>
        <label className="flex items-center gap-1">Wind
          <input type="range" min={0} max={20} step={1} value={wind} onChange={(e)=>setWind(Number(e.target.value))} />
          <span>{wind}</span>
        </label>
      </div>
      <Canvas camera={{ position: [0, 6, 16], fov: 60 }} style={{ background: 'transparent' }}>
        {fog && <fog attach="fog" args={[0x95a5a6, 10, 90]} />}
        <ambientLight intensity={0.5} color={stormy ? "#9aa5ab" : "#B0BEC5"} />
        <directionalLight position={[8, 12, 6]} intensity={stormy ? 0.9 : 0.75} color={stormy ? "#CFD8DC" : "#CFD8DC"} />
        {/* Clouds + Rain only: no sun, moon, or stars */}
        <StormClouds coverage={coverage} opacity={stormy ? 0.9 : 0.85} color={stormy ? '#3b4252' : '#4A5568'} speed={stormy ? 0.12 : 0.08} />
        <RainParticles intensity={intensity} />
        {stormy && <Lightning active />}
        {/* Simple wind streaks */}
        {wind > 0 && (
          <Points positions={new Float32Array(Array.from({ length: wind * 30 }, () => [
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 50
          ]).flat())}>
            <PointMaterial transparent size={0.015} sizeAttenuation color="#E6E6FA" opacity={0.35} depthWrite={false} />
          </Points>
        )}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
