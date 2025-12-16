import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, Cloud, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Moon from './Moon';
import CelestialSun from './CelestialSun';
import CelestialMoon from './CelestialMoon';

// Realistic Rain Particles
function RainParticles({ intensity = 1000 }) {
  const ref = useRef(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(intensity * 3);
    const velocities = new Float32Array(intensity * 3);
    
    for (let i = 0; i < intensity; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 40 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 1] = -Math.random() * 0.5 - 0.3;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    
    return { positions, velocities };
  }, [intensity]);

  useFrame(() => {
    if (ref.current) {
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
    }
  });

  return (
    <Points ref={ref} positions={particles.positions}>
      <PointMaterial
        transparent
        size={0.1}
        sizeAttenuation={true}
        color="#87CEEB"
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
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
          color={isStormy ? "#4A5568" : "#FFFFFF"}
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
function FogEffect({ density = 0.01 }) {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.fog = new THREE.Fog(0xcccccc, 10, 100);
    return () => {
      scene.fog = null;
    };
  }, [scene, density]);

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
  const weatherCondition = weather?.toLowerCase() || 'clear';
  
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
          <CelestialMoon phase={0.6} size={96} />
        ) : (
          <CelestialSun temperature={temperature} size={96} />
        )}
        {/* Simple stars for night */}
        {isNight && (
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
      <ambientLight intensity={isNight ? 0.2 : 0.6} color={isNight ? "#4A5568" : "#FFFFFF"} />
      <directionalLight 
        position={isNight ? [-10, 10, 5] : [10, 10, 5]} 
        intensity={isNight ? 0.3 : 1} 
        color={isNight ? "#6B73FF" : "#FFFFFF"}
        castShadow
      />
      
      {/* Sky and Stars */}
      {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />}
      
      {!isNight && !isCloudy && (
        <Sky
          distance={450000}
          sunPosition={[10, 10, -10]}
          inclination={0}
          azimuth={0.25}
        />
      )}

      {/* Celestial Bodies */}
      {isNight ? (
  <group position={[-15, 15, -20]} scale={[2, 2, 2]}>
    <Moon />
  </group>
) : (
  <Sun temperature={temperature} isVisible={!isNight} />
)}

      {/* Weather Effects */}
      {isRaining && <RainParticles intensity={isThunderstorm ? 1500 : 1000} />}
      {isSnowing && <SnowParticles intensity={800} />}
      {(isCloudy || isThunderstorm) && (
        <DynamicClouds coverage={cloudCoverage} isStormy={isThunderstorm} />
      )}
      {isThunderstorm && <Lightning active={true} />}
      {isFoggy && <FogEffect density={0.02} />}
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

      {/* Subtle background particles for atmosphere */}
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
    </Canvas>
  );
}
