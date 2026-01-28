import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ImprovedRainStreaks - Улучшенная версия дождя с всплесками и физикой
 * @param {string} condition - 'light' | 'moderate' | 'heavy' | 'storm'
 * @param {number} windStrength - 0 to 1 (сила ветра)
 */
function RainStreaksWithSplashes({ condition = 'moderate', windStrength = 0.35 }) {
  const meshRef = useRef(null);
  const splashesRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const splashDummy = useMemo(() => new THREE.Object3D(), []);

  // Параметры в зависимости от условий
  const config = useMemo(() => {
    const configs = {
      light: { count: 600, area: 50, speed: 0.6, splashes: 100 },
      moderate: { count: 1400, area: 60, speed: 0.8, splashes: 200 },
      heavy: { count: 2400, area: 70, speed: 1.2, splashes: 400 },
      storm: { count: 3500, area: 80, speed: 1.6, splashes: 600 }
    };
    return configs[condition] || configs.moderate;
  }, [condition]);

  // Инициализация капель
  const { offsets, speeds, lengths } = useMemo(() => {
    const { count, area } = config;
    const offsets = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const lengths = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      offsets[i * 3] = (Math.random() - 0.5) * area;
      offsets[i * 3 + 1] = Math.random() * area * 0.8 + 10;
      offsets[i * 3 + 2] = (Math.random() - 0.5) * area;

      speeds[i] = config.speed + Math.random() * 0.6;
      lengths[i] = 0.6 + Math.random() * 0.7;
    }

    return { offsets, speeds, lengths };
  }, [config]);

  // Инициализация всплесков
  const splashData = useMemo(() => {
    const { splashes } = config;
    const positions = new Float32Array(splashes * 3);
    const velocities = new Float32Array(splashes * 3);
    const lifetimes = new Float32Array(splashes);
    const maxLifetimes = new Float32Array(splashes);

    for (let i = 0; i < splashes; i++) {
      positions[i * 3] = (Math.random() - 0.5) * config.area;
      positions[i * 3 + 1] = -10; // Начинаем под землёй
      positions[i * 3 + 2] = (Math.random() - 0.5) * config.area;

      velocities[i * 3] = (Math.random() - 0.5) * 0.8;
      velocities[i * 3 + 1] = Math.random() * 1.5 + 1.0; // Вверх
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

      lifetimes[i] = 0;
      maxLifetimes[i] = 0.3 + Math.random() * 0.3;
    }

    return { positions, velocities, lifetimes, maxLifetimes };
  }, [config]);

  useFrame((_, delta) => {
    const m = meshRef.current;
    const s = splashesRef.current;
    if (!m || !s) return;

    const { count } = config;
    const wind = windStrength;

    // Обновление капель дождя
    for (let i = 0; i < count; i++) {
      offsets[i * 3 + 1] -= speeds[i] * (delta * 60);
      offsets[i * 3] += wind * 0.03; // Сдвиг от ветра

      // Если капля достигла земли - создать всплеск
      if (offsets[i * 3 + 1] < -10) {
        // Найти свободный слот для всплеска
        for (let j = 0; j < config.splashes; j++) {
          if (splashData.lifetimes[j] <= 0) {
            splashData.positions[j * 3] = offsets[i * 3];
            splashData.positions[j * 3 + 1] = -9.8;
            splashData.positions[j * 3 + 2] = offsets[i * 3 + 2];
            
            splashData.velocities[j * 3] = (Math.random() - 0.5) * 0.8;
            splashData.velocities[j * 3 + 1] = Math.random() * 1.5 + 1.0;
            splashData.velocities[j * 3 + 2] = (Math.random() - 0.5) * 0.8;
            
            splashData.lifetimes[j] = splashData.maxLifetimes[j];
            break;
          }
        }

        // Сброс капли
        offsets[i * 3] = (Math.random() - 0.5) * config.area;
        offsets[i * 3 + 1] = Math.random() * config.area * 0.5 + 20;
        offsets[i * 3 + 2] = (Math.random() - 0.5) * config.area;
      }

      dummy.position.set(
        offsets[i * 3],
        offsets[i * 3 + 1],
        offsets[i * 3 + 2]
      );
      dummy.rotation.set(-Math.PI / 2 + 0.05, 0, wind * 0.1);
      dummy.scale.set(0.04, lengths[i], 0.04);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;

    // Обновление всплесков
    for (let i = 0; i < config.splashes; i++) {
      if (splashData.lifetimes[i] > 0) {
        // Физика всплеска
        splashData.positions[i * 3] += splashData.velocities[i * 3] * delta * 60;
        splashData.positions[i * 3 + 1] += splashData.velocities[i * 3 + 1] * delta * 60;
        splashData.positions[i * 3 + 2] += splashData.velocities[i * 3 + 2] * delta * 60;

        // Гравитация
        splashData.velocities[i * 3 + 1] -= 3.0 * delta * 60;

        // Уменьшение времени жизни
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
        // Скрываем мёртвые всплески
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
      {/* Капли дождя */}
      <instancedMesh ref={meshRef} args={[null, null, config.count]}>
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

      {/* Всплески */}
      <instancedMesh ref={splashesRef} args={[null, null, config.splashes]}>
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

/**
 * ImprovedRainStreaks - Обёртка с Canvas
 */
export default function ImprovedRainStreaks({ condition = 'moderate', windStrength = 0.35 }) {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.4} />
        <RainStreaksWithSplashes condition={condition} windStrength={windStrength} />
      </Canvas>
    </div>
  );
}
