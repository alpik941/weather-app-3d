import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, Cloud, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Moon from './Moon';
import CelestialSun from './CelestialSun';
import CelestialMoon from './CelestialMoon';
import { useTheme } from '../contexts/ThemeContext';

// Improved rain streaks with splashes and better physics
function RainStreaks({ count = 1400, area = 60, wind = 0.35 }) {
  const meshRef = useRef(null);
  const splashesRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const splashDummy = useMemo(() => new THREE.Object3D(), []);

  // Rain configuration
  const splashCount = Math.floor(count * 0.2); // 20% of raindrops can create splashes

  const { offsets, speeds, lengths } = useMemo(() => {
    const offsets = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const lengths = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      offsets[i * 3] = (Math.random() - 0.5) * area;
      offsets[i * 3 + 1] = Math.random() * area * 0.8 + 10;
      offsets[i * 3 + 2] = (Math.random() - 0.5) * area;

      speeds[i] = 0.8 + Math.random() * 0.6; // varied fall speed
      lengths[i] = 0.6 + Math.random() * 0.7; // varied streak length
    }

    return { offsets, speeds, lengths };
  }, [count, area]);

  // Splash particles
  const splashData = useMemo(() => {
    const positions = new Float32Array(splashCount * 3);
    const velocities = new Float32Array(splashCount * 3);
    const lifetimes = new Float32Array(splashCount);
    const maxLifetimes = new Float32Array(splashCount);

    for (let i = 0; i < splashCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // Start hidden
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;

      lifetimes[i] = 0;
      maxLifetimes[i] = 0.3 + Math.random() * 0.3;
    }

    return { positions, velocities, lifetimes, maxLifetimes };
  }, [splashCount]);

  useFrame((_, delta) => {
    const m = meshRef.current;
    const s = splashesRef.current;
    if (!m || !s) return;

    // Update raindrops
    for (let i = 0; i < count; i++) {
      // Update Y position
      offsets[i * 3 + 1] -= speeds[i] * (delta * 60);
      offsets[i * 3] += wind * 0.02; // slight wind drift

      // Reset raindrop when it hits ground and create splash
      if (offsets[i * 3 + 1] < -10) {
        // Find free splash slot
        if (i < splashCount) {
          const idx = i % splashCount;
          if (splashData.lifetimes[idx] <= 0) {
            splashData.positions[idx * 3] = offsets[i * 3];
            splashData.positions[idx * 3 + 1] = -9.8;
            splashData.positions[idx * 3 + 2] = offsets[i * 3 + 2];
            
            splashData.velocities[idx * 3] = (Math.random() - 0.5) * 0.8;
            splashData.velocities[idx * 3 + 1] = Math.random() * 1.5 + 1.0;
            splashData.velocities[idx * 3 + 2] = (Math.random() - 0.5) * 0.8;
            
            splashData.lifetimes[idx] = splashData.maxLifetimes[idx];
          }
        }

        offsets[i * 3] = (Math.random() - 0.5) * area;
        offsets[i * 3 + 1] = Math.random() * area * 0.5 + 20;
        offsets[i * 3 + 2] = (Math.random() - 0.5) * area;
      }

      dummy.position.set(
        offsets[i * 3],
        offsets[i * 3 + 1],
        offsets[i * 3 + 2]
      );
      dummy.rotation.set(-Math.PI / 2 + 0.05, 0, wind * 0.08); // slight tilt
      dummy.scale.set(0.04, lengths[i], 0.04);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // Update splashes
    for (let i = 0; i < splashCount; i++) {
      if (splashData.lifetimes[i] > 0) {
        // Physics
        splashData.positions[i * 3] += splashData.velocities[i * 3] * delta * 60;
        splashData.positions[i * 3 + 1] += splashData.velocities[i * 3 + 1] * delta * 60;
        splashData.positions[i * 3 + 2] += splashData.velocities[i * 3 + 2] * delta * 60;

        // Gravity
        splashData.velocities[i * 3 + 1] -= 3.0 * delta * 60;

        // Lifetime
        splashData.lifetimes[i] -= delta;

        const opacity = splashData.lifetimes[i] / splashData.maxLifetimes[i];
        const scale = 0.03 * opacity;

        splashDummy.position.set(
          splashData.positions[i * 3],
          splashData.positions[i * 3 + 1],
          splashData.positions[i * 3 + 2]
        );
        splashDummy.scale.set(scale, scale, scale);
        splashDummy.updateMatrix();
        s.setMatrixAt(i, splashDummy.matrix);
      } else {
        // Hide dead splashes
        splashDummy.position.set(0, -100, 0);
        splashDummy.scale.set(0, 0, 0);
        splashDummy.updateMatrix();
        s.setMatrixAt(i, splashDummy.matrix);
      }
    }
    s.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Raindrops */}
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#8fb3ff"
          transparent
          opacity={0.55}
          roughness={0.8}
          metalness={0}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Splashes */}
      <instancedMesh ref={splashesRef} args={[null, null, splashCount]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshStandardMaterial
          color="#aec2e0"
          transparent
          opacity={0.7}
          roughness={0.6}
          metalness={0.1}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}

// Realistic Snow Particles
function SnowParticles({ intensity = 800 }) {
  const ref = useRef(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(intensity * 3);
    const velocities = new Float32Array(intensity * 3);
    const sizes = new Float32Array(intensity);
    
    for (let i = 0; i < intensity; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 40 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = -Math.random() * 0.2 - 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      
      sizes[i] = Math.random() * 0.3 + 0.1;
    }
    
    return { positions, velocities, sizes };
  }, [intensity]);

  useFrame((state) => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < intensity; i++) {
        positions[i * 3] += particles.velocities[i * 3] + Math.sin(time + i) * 0.01;
        positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
        
        if (positions[i * 3 + 1] < -10) {
          positions[i * 3] = (Math.random() - 0.5) * 40;
          positions[i * 3 + 1] = 40;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={particles.positions}>
      <PointMaterial
        transparent
        size={0.2}
        sizeAttenuation={true}
        color="#FFFFFF"
        opacity={0.9}
        depthWrite={false}
      />
    </Points>
  );
}

// Dynamic Clouds
function DynamicClouds({ coverage = 0.5, isStormy = false }) {
  const groupRef = useRef(null);
  const cloudCount = Math.floor(coverage * 8) + 2;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      groupRef.current.children.forEach((cloud, index) => {
        cloud.position.x += Math.sin(state.clock.elapsedTime * 0.1 + index) * 0.01;
        cloud.position.z += Math.cos(state.clock.elapsedTime * 0.1 + index) * 0.01;
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
          opacity={isStormy ? 0.8 : 0.4}
          color={isStormy ? "#7fa4d2" : "#cfe7ff"}
          speed={0.1}
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

// Sun/Moon
function Sun({ temperature, isVisible = true }) {
  const ref = useRef(null);
  
  useFrame((state) => {
    if (ref.current && isVisible) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const sunColor = temperature > 30 ? "#FF6B35" : temperature > 20 ? "#FFD700" : "#FFA500";
  
  if (!isVisible) return null;
  
  return (
    <Sphere 
      ref={ref}
      args={[2, 64, 64]}  // Увеличил детализацию
      position={[15, 15, -20]}
    >
      <meshStandardMaterial 
        color={sunColor}
        emissive={sunColor}
        emissiveIntensity={0.5} // Увеличил интенсивность
        roughness={0.1}
        metalness={0.1}
      />
    </Sphere>
  );
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
  
  // Determine weather effects
  const isRaining = weatherCondition.includes('rain') || weatherCondition.includes('drizzle');
  const isSnowing = weatherCondition.includes('snow');
  const isThunderstorm = weatherCondition.includes('thunderstorm') || weatherCondition.includes('storm');
  const isCloudy = weatherCondition.includes('cloud') || weatherCondition.includes('overcast');
  const isFoggy = weatherCondition.includes('fog') || weatherCondition.includes('mist') || humidity > 85;
  const isWindy = windSpeed > 10;

  if (mode === 'css') {
    return (
      <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/20 to-sky-900/40 dark:from-slate-800 dark:to-slate-950" />
        {isNight ? (
          // Show moon at night: clear, clouds, or precipitation
          (!isRaining && !isSnowing && !isCloudy) ? (
            <CelestialMoon phase={0.6} size={backgroundMoonSize} />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-400/20 blur-sm" />
          )
        ) : (
          // Day: show sun only in clear weather, diffused glow during precipitation
          (!isRaining && !isSnowing && !isCloudy) ? (
            <CelestialSun temperature={temperature} size={72} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-yellow-200/30 dark:bg-yellow-300/20 blur-md" />
          )
        )}
        {/* Simple stars for night (only in clear weather) */}
        {isNight && !isRaining && !isSnowing && !isCloudy && (
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
      {/* Lighting Setup */}
      <ambientLight intensity={isRaining ? 0.15 : isNight ? 0.2 : 0.6} color={isNight ? "#2f3545" : "#FFFFFF"} />
      <directionalLight 
        position={isNight ? [-6, 12, 4] : [10, 10, 5]} 
        intensity={isRaining ? 0.15 : isNight ? 0.3 : 1} 
        color={isNight ? "#7586a3" : "#FFFFFF"}
        castShadow
      />
      
      {/* Sky and Stars */}
      {isNight && !isRaining && !isSnowing && !isCloudy && <Stars radius={100} depth={50} count={1200} factor={2.5} saturation={0} fade />}
      {!isNight && !isCloudy && !isRaining && !isSnowing && (
        <Sky
          distance={450000}
          sunPosition={[10, 10, -10]}
          inclination={0}
          azimuth={0.25}
        />
      )}

      {/* Celestial Bodies */}
      {isNight ? (
        (isRaining || isSnowing || isCloudy) ? (
          // Diffused moon behind clouds/precipitation
          <group position={[-12, 12, -18]} scale={[2.2, 2.2, 2.2]}>
            <Sphere args={[2.2, 32, 32]}>
              <meshStandardMaterial
                color="#cfd8e3"
                emissive="#9aa5b5"
                emissiveIntensity={isSnowing ? 0.12 : 0.1}
                transparent
                opacity={isSnowing ? 0.2 : isCloudy ? 0.3 : 0.35}
                roughness={1}
                metalness={0}
              />
            </Sphere>
          </group>
        ) : (
          <group position={[-15, 14, -20]} scale={[2, 2, 2]}>
            <Moon lightTheme={theme === 'light'} />
          </group>
        )
      ) : (
        // Day: hide sun during snow/rain/heavy clouds, show diffused glow instead
        (isSnowing || isRaining || isCloudy) ? (
          <group position={[12, 12, -18]} scale={[1.5, 1.5, 1.5]}>
            <Sphere args={[1.5, 32, 32]}>
              <meshStandardMaterial
                color="#fff5e1"
                emissive="#ffe4b3"
                emissiveIntensity={isSnowing ? 0.2 : 0.15}
                transparent
                opacity={isSnowing ? 0.15 : isRaining ? 0.2 : 0.25}
                roughness={1}
                metalness={0}
              />
            </Sphere>
          </group>
        ) : (
          <Sun temperature={temperature} isVisible={true} />
        )
      )}

      {/* Weather Effects */}
      {isRaining && (
        <>
          <RainStreaks count={isThunderstorm ? 2000 : 1400} area={70} wind={Math.min(windSpeed / 20, 0.6)} />
          <FogEffect color={0x0f1624} near={4} far={55} />
        </>
      )}
      {isSnowing && <SnowParticles intensity={800} />}
      {(isCloudy || isThunderstorm || isRaining) && (
        <DynamicClouds coverage={Math.max(cloudCoverage, isRaining ? 0.9 : 0.6)} isStormy={true} />
      )}
      {isThunderstorm && <Lightning active={true} />}
      {isFoggy && !isRaining && <FogEffect color={0x1f2937} near={6} far={70} />}
      {isWindy && <WindParticles speed={windSpeed} />}

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