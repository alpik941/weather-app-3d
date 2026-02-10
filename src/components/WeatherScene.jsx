import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import CelestialSun from './CelestialSun';
import CelestialMoon from './CelestialMoon';
import { useTheme } from '../contexts/ThemeContext';
import LightingSection from './scene/LightingSection';
import SkySection from './scene/SkySection';
import CelestialBodiesSection from './scene/CelestialBodiesSection';
import WeatherEffectsSection from './scene/WeatherEffectsSection';

// Dynamic Clouds
function DynamicClouds({ coverage = 0.5, isStormy = false, opacity }) {
  const groupRef = useRef(null);
  const cloudCount = Math.floor(coverage * 8) + 2;
  
  // Use custom opacity or default based on storm status
  const cloudOpacity = opacity !== undefined ? opacity : (isStormy ? 0.8 : 0.4);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.002;
      groupRef.current.children.forEach((cloud, index) => {
        cloud.position.x += Math.sin(state.clock.elapsedTime * 0.015 + index) * 0.0015;
        cloud.position.z += Math.cos(state.clock.elapsedTime * 0.015 + index) * 0.0015;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: cloudCount }, (_, i) => (
        <Cloud
          key={i}
          position={[
            (Math.random() - 0.5) * 30,
            Math.random() * 10 + 5,
            (Math.random() - 0.5) * 30
          ]}
          scale={Math.random() * 2 + 1}
          opacity={cloudOpacity}
          color={isStormy ? "#7fa4d2" : "#cfe7ff"}
          speed={0.01}
        />
      ))}
    </group>
  );
}

// Lightning Effect
function Lightning({ active }) {
  const lightRef = useRef(null);
  const [flash, setFlash] = React.useState(false);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 100);
      }, Math.random() * 3000 + 2000);
      
      return () => clearInterval(interval);
    }
  }, [active]);

  return (
    <pointLight
      ref={lightRef}
      position={[0, 20, 0]}
      intensity={flash ? 10 : 0}
      color="#FFFFFF"
      distance={100}
    />
  );
}

// Fog Effect
function FogEffect({ color = 0x0f1624, near = 5, far = 60 }) {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.fog = new THREE.Fog(color, near, far);
    return () => {
      scene.fog = null;
    };
  }, [scene, color, near, far]);

  return null;
}

// Wind Effect Particles
function WindParticles({ speed = 5 }) {
  const ref = useRef(null);
  const particleCount = Math.floor(speed * 50);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    
    return positions;
  }, [particleCount]);

  useFrame(() => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += speed * 0.02;
        
        if (positions[i * 3] > 20) {
          positions[i * 3] = -20;
        }
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={particles}>
      <PointMaterial
        transparent
        size={0.05}
        sizeAttenuation={true}
        color="#E6E6FA"
        opacity={0.3}
        depthWrite={false}
      />
    </Points>
  );
}

export default function WeatherScene({ 
  weather, 
  temperature = 20, 
  humidity = 50, 
  windSpeed = 5, 
  isNight = false,
  cloudCoverage = 0.5,
  mode = '3d' // '3d' | 'css'
}) {
  const { theme } = useTheme();
  const weatherCondition = weather?.toLowerCase() || 'clear';
  const backgroundMoonSize = 64;
  
  // Time detection for sunrise/sunset
  const hour = new Date().getHours();
  const isSunrise = hour >= 5 && hour < 7;
  const isSunset = hour >= 18 && hour < 20;
  const isGoldenHour = isSunrise || isSunset;
  
  // Determine weather effects
  const isRaining = weatherCondition.includes('rain') || weatherCondition.includes('drizzle');
  const isSnowing = weatherCondition.includes('snow');
  const isThunderstorm = weatherCondition.includes('thunderstorm') || weatherCondition.includes('storm');
  const isCloudy = weatherCondition.includes('cloud') || weatherCondition.includes('overcast');
  const isFoggy = weatherCondition.includes('fog') || weatherCondition.includes('mist') || humidity > 85;
  const isWindy = windSpeed > 10;
  
  // Mist/Fog should obscure celestial bodies
  const isMistyCondition = weatherCondition.includes('mist') || weatherCondition.includes('fog');
  const shouldObscureSun = isRaining || isSnowing || isCloudy || isMistyCondition;

  if (mode === 'css') {
    return (
      <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/20 to-sky-900/40 dark:from-slate-800 dark:to-slate-950" />
        {isNight ? (
          (!isRaining && !isSnowing && !isCloudy && !isMistyCondition) ? (
            <CelestialMoon phase={0.6} size={backgroundMoonSize} />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-400/20 blur-sm" />
          )
        ) : (
          (!isRaining && !isSnowing && !isCloudy && !isMistyCondition) ? (
            <CelestialSun temperature={temperature} size={72} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-yellow-200/30 dark:bg-yellow-300/20 blur-md" />
          )
        )}
        {/* Simple stars for night (only in clear weather) */}
        {isNight && !isRaining && !isSnowing && !isCloudy && !isMistyCondition && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white/70 animate-pulse"
                style={{
                  width: 2,
                  height: 2,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 5, 15], fov: 75 }}
      style={{ background: 'transparent' }}
    >
      <LightingSection
        isNight={isNight}
        isRaining={isRaining}
        isGoldenHour={isGoldenHour}
        isMistyCondition={isMistyCondition}
      />

      <SkySection
        isNight={isNight}
        isRaining={isRaining}
        isSnowing={isSnowing}
        isCloudy={isCloudy}
        isMistyCondition={isMistyCondition}
        isGoldenHour={isGoldenHour}
      />

      <CelestialBodiesSection
        isNight={isNight}
        shouldObscureSun={shouldObscureSun}
        isSnowing={isSnowing}
        isCloudy={isCloudy}
        isRaining={isRaining}
        isMistyCondition={isMistyCondition}
        theme={theme}
        temperature={temperature}
        isGoldenHour={isGoldenHour}
        isSunrise={isSunrise}
      />

      <WeatherEffectsSection
        isRaining={isRaining}
        isSnowing={isSnowing}
        isThunderstorm={isThunderstorm}
        isFoggy={isFoggy}
        isCloudy={isCloudy}
        isWindy={isWindy}
        temperature={temperature}
        windSpeed={windSpeed}
        renderClouds={() => (
          <DynamicClouds
            coverage={Math.max(cloudCoverage, isRaining ? 0.9 : 0.6)}
            isStormy={true}
            opacity={isGoldenHour ? 0.4 : undefined}
          />
        )}
        renderFog={() => (
          <FogEffect
            color={isRaining ? 0x0f1624 : 0x1f2937}
            near={isRaining ? 4 : (isMistyCondition ? 3 : 6)}
            far={isRaining ? 55 : (isMistyCondition ? 40 : 70)}
          />
        )}
        renderLightning={() => <Lightning active={true} />}
        renderWind={() => <WindParticles speed={windSpeed} />}
      />

      {/* Clear Weather Atmosphere */}
      {weatherCondition === 'clear' && !isNight && (
        <group>
          {/* Gentle floating particles for clear day */}
          <Points positions={new Float32Array(Array.from({ length: 200 }, () => [
            (Math.random() - 0.5) * 50,
            Math.random() * 30,
            (Math.random() - 0.5) * 50
          ]).flat())}>
            <PointMaterial
              transparent
              size={0.02}
              sizeAttenuation={true}
              color="#FFD700"
              opacity={0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </Points>
        </group>
      )}

      {/* Subtle background particles for atmosphere (disabled during rain to avoid snow-like look) */}
      {!isRaining && (
        <Points positions={new Float32Array(Array.from({ length: 300 }, () => [
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 100
        ]).flat())}>
          <PointMaterial
            transparent
            size={0.01}
            sizeAttenuation={true}
            color={isNight ? "#4A5568" : "#87CEEB"}
            opacity={0.2}
            depthWrite={false}
          />
        </Points>
      )}
    </Canvas>
  );
}