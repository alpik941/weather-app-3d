import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * WeatherEffects - Дополнительные атмосферные эффекты для дождя
 * 
 * Включает:
 * - Динамический туман (fog particles)
 * - Молнии (lightning flashes)
 * - Облака (volumetric clouds)
 * - Лужи (puddle reflections)
 */

// === Компонент тумана (fog particles) ===
export const FogParticles = ({ 
  count = 100, 
  opacity = 0.15,
  speed = 0.05,
  color = '#aabbcc'
}) => {
  const fogRef = useRef();
  
  const fogData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      scales[i] = 2 + Math.random() * 3;
    }
    
    return { positions, scales };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(fogData.positions, 3));
    geo.setAttribute('scale', new THREE.BufferAttribute(fogData.scales, 1));
    return geo;
  }, [fogData]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 3,
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: createFogTexture(),
    });
  }, [color, opacity]);

  useFrame((state, delta) => {
    if (!fogRef.current) return;
    
    const positions = fogRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * speed * delta;
      positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i * 0.5) * speed * delta;
    }
    
    fogRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={fogRef} geometry={geometry} material={material} />;
};

// Создание текстуры тумана
function createFogTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  return new THREE.CanvasTexture(canvas);
}

// === Компонент молний ===
export const LightningFlash = ({ 
  frequency = 0.02, // Вероятность молнии каждый кадр
  duration = 0.15,
  intensity = 2.0,
  color = '#ffffff'
}) => {
  const lightRef = useRef();
  const flashTimeRef = useRef(0);
  const isFlashingRef = useRef(false);

  useFrame((state, delta) => {
    if (!lightRef.current) return;

    if (isFlashingRef.current) {
      flashTimeRef.current += delta;
      
      if (flashTimeRef.current >= duration) {
        isFlashingRef.current = false;
        lightRef.current.intensity = 0;
      } else {
        // Мерцающий эффект
        const flicker = Math.random() > 0.5 ? 1 : 0.7;
        lightRef.current.intensity = intensity * flicker;
      }
    } else if (Math.random() < frequency) {
      // Начало молнии
      isFlashingRef.current = true;
      flashTimeRef.current = 0;
      
      // Случайная позиция молнии
      lightRef.current.position.set(
        (Math.random() - 0.5) * 30,
        20 + Math.random() * 10,
        (Math.random() - 0.5) * 30
      );
    }
  });

  return (
    <pointLight
      ref={lightRef}
      color={color}
      intensity={0}
      distance={50}
      decay={2}
    />
  );
};

// === Компонент динамических облаков ===
export const DynamicClouds = ({
  count = 20,
  opacity = 0.3,
  speed = 0.03,
  height = 15
}) => {
  const cloudsRef = useRef();

  const cloudData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        x: (Math.random() - 0.5) * 60,
        y: height + Math.random() * 5,
        z: (Math.random() - 0.5) * 60,
        size: 3 + Math.random() * 4,
        speedX: (Math.random() - 0.5) * speed,
        speedZ: (Math.random() - 0.5) * speed,
      });
    }
    return data;
  }, [count, height, speed]);

  useFrame((state, delta) => {
    if (!cloudsRef.current) return;

    const dummy = new THREE.Object3D();

    cloudData.forEach((cloud, i) => {
      cloud.x += cloud.speedX * delta;
      cloud.z += cloud.speedZ * delta;

      // Wrap around
      if (cloud.x > 30) cloud.x = -30;
      if (cloud.x < -30) cloud.x = 30;
      if (cloud.z > 30) cloud.z = -30;
      if (cloud.z < -30) cloud.z = 30;

      dummy.position.set(cloud.x, cloud.y, cloud.z);
      dummy.scale.set(cloud.size, cloud.size * 0.5, cloud.size);
      dummy.updateMatrix();

      cloudsRef.current.setMatrixAt(i, dummy.matrix);
    });

    cloudsRef.current.instanceMatrix.needsUpdate = true;
  });

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#bbccdd',
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      fog: false,
    });
  }, [opacity]);

  return (
    <instancedMesh
      ref={cloudsRef}
      args={[geometry, material, count]}
      frustumCulled={true}
    />
  );
};

// === Компонент луж на земле ===
export const Puddles = ({
  count = 30,
  size = 1.5,
  opacity = 0.6
}) => {
  const puddlesRef = useRef();

  useMemo(() => {
    if (!puddlesRef.current) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const scale = size * (0.5 + Math.random() * 0.5);

      dummy.position.set(x, 0.01, z);
      dummy.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
      dummy.scale.set(scale, scale, 1);
      dummy.updateMatrix();

      puddlesRef.current.setMatrixAt(i, dummy.matrix);
    }

    puddlesRef.current.instanceMatrix.needsUpdate = true;
  }, [count, size]);

  const geometry = useMemo(() => new THREE.CircleGeometry(1, 16), []);
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#444455',
      transparent: true,
      opacity: opacity,
      roughness: 0.1,
      metalness: 0.8,
      envMapIntensity: 1.5,
    });
  }, [opacity]);

  return (
    <instancedMesh
      ref={puddlesRef}
      args={[geometry, material, count]}
      receiveShadow
    />
  );
};

// === Компонент звука дождя (визуализация) ===
export const RainSoundVisualizer = ({
  enabled = true,
  intensity = 1.0
}) => {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  
  // Placeholder для аудио-визуализации
  // Можно интегрировать с Tone.js или Web Audio API
  
  return null;
};

// === Главный компонент с всеми эффектами ===
const WeatherEffects = ({
  fogEnabled = true,
  fogParticleCount = 100,
  fogOpacity = 0.15,
  
  lightningEnabled = false,
  lightningFrequency = 0.02,
  lightningIntensity = 2.0,
  
  cloudsEnabled = true,
  cloudCount = 20,
  cloudOpacity = 0.3,
  cloudSpeed = 0.1,
  
  puddlesEnabled = true,
  puddleCount = 30,
  puddleSize = 1.5,
}) => {
  return (
    <group>
      {/* Туман */}
      {fogEnabled && (
        <FogParticles
          count={fogParticleCount}
          opacity={fogOpacity}
          speed={0.05}
        />
      )}

      {/* Молнии */}
      {lightningEnabled && (
        <LightningFlash
          frequency={lightningFrequency}
          intensity={lightningIntensity}
          duration={0.15}
        />
      )}

      {/* Облака */}
      {cloudsEnabled && (
        <DynamicClouds
          count={cloudCount}
          opacity={cloudOpacity}
          speed={cloudSpeed}
          height={15}
        />
      )}

      {/* Лужи */}
      {puddlesEnabled && (
        <Puddles
          count={puddleCount}
          size={puddleSize}
          opacity={0.6}
        />
      )}
    </group>
  );
};

export default WeatherEffects;
