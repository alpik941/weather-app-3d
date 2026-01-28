import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RealisticRainStreaks - Улучшенный дождь с ПРАВИЛЬНОЙ длиной капель
 * 
 * ПРОБЛЕМА: Старые капли слишком длинные (0.6-0.8 единиц)
 * РЕШЕНИЕ: Короткие реалистичные капли (0.15-0.25 единиц)
 * 
 * Особенности:
 * - Короткие капли как в природе
 * - Физически корректная прозрачность
 * - Оптимизация через InstancedMesh
 * - Система брызг
 * - Эффект ветра
 */

const RealisticRainStreaks = ({ 
  count = 800,
  intensity = 1.0,
  windSpeed = 0.3,
  windDirection = Math.PI / 4,
  enabled = true,
  area = { x: 40, z: 40, height: 25 },
  splashEnabled = true,
  color = '#b8d4f0',
  // НОВЫЙ ПАРАМЕТР для контроля длины капель
  dropletLength = 0.2,  // 0.15-0.25 оптимально (было 0.6!)
}) => {
  const rainRef = useRef();
  const splashRef = useRef();
  const timeRef = useRef(0);

  // Данные для капель
  const rainData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        startX: (Math.random() - 0.5) * area.x,
        startZ: (Math.random() - 0.5) * area.z,
        startY: Math.random() * area.height + area.height * 0.5,
        x: 0,
        y: 0,
        z: 0,
        speed: 18 + Math.random() * 10,
        // Вариация длины капли ±20%
        length: dropletLength * (0.8 + Math.random() * 0.4),
        // Толщина капли (меньше = тоньше)
        thickness: 0.012 + Math.random() * 0.008,
        rotation: Math.random() * Math.PI * 2,
        offset: Math.random() * 100,
      });
    }
    return data;
  }, [count, area, dropletLength]);

  // Данные для брызг
  const splashData = useMemo(() => {
    if (!splashEnabled) return [];
    
    const maxSplashes = Math.min(count * 5, 2000);
    const data = [];
    
    for (let i = 0; i < maxSplashes; i++) {
      data.push({
        x: 0,
        y: -1000,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15,
        size: 0.025 + Math.random() * 0.015,
      });
    }
    return data;
  }, [count, splashEnabled]);

  const splashIndex = useRef(0);

  // ОПТИМИЗИРОВАННАЯ геометрия капли
  const dropletGeometry = useMemo(() => {
    // Создаём капельную форму вместо цилиндра
    const geometry = new THREE.BufferGeometry();
    
    // Вершины для тонкой вытянутой капли
    const vertices = new Float32Array([
      // Верх (острый)
      0, 0, 0,
      // Средние точки (расширение)
      -0.006, -0.3, 0,
      0.006, -0.3, 0,
      0, -0.3, -0.006,
      0, -0.3, 0.006,
      // Низ (расширенный)
      -0.01, -0.8, 0,
      0.01, -0.8, 0,
      0, -0.8, -0.01,
      0, -0.8, 0.01,
      // Самый низ (точка)
      0, -1, 0,
    ]);
    
    const indices = [
      // Верхняя часть
      0, 1, 2,
      0, 2, 3,
      0, 3, 4,
      0, 4, 1,
      // Средняя часть
      1, 5, 6, 1, 6, 2,
      2, 6, 7, 2, 7, 3,
      3, 7, 8, 3, 8, 4,
      4, 8, 5, 4, 5, 1,
      // Нижняя часть (к точке)
      5, 9, 6,
      6, 9, 7,
      7, 9, 8,
      8, 9, 5,
    ];
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  // Улучшенный материал с правильной прозрачностью
  const dropletMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.65,
      transmission: 0.92,
      thickness: 0.2,
      roughness: 0.08,
      metalness: 0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.8,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  }, [color]);

  // Геометрия и материал для брызг
  const splashGeometry = useMemo(() => new THREE.SphereGeometry(0.018, 4, 4), []);
  const splashMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(1.15),
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
  }, [color]);

  // Инициализация
  useEffect(() => {
    if (!rainRef.current) return;

    const dummy = new THREE.Object3D();
    
    rainData.forEach((drop, i) => {
      drop.x = drop.startX;
      drop.y = drop.startY;
      drop.z = drop.startZ;

      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.rotation.set(0, 0, drop.rotation);
      // Масштабируем по длине капли
      dummy.scale.set(drop.thickness * 10, drop.length, drop.thickness * 10);
      dummy.updateMatrix();
      
      rainRef.current.setMatrixAt(i, dummy.matrix);
    });

    rainRef.current.instanceMatrix.needsUpdate = true;
  }, [rainData]);

  // Создание брызг
  const createSplash = (x, y, z) => {
    if (!splashEnabled || !splashRef.current) return;

    const splashCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < splashCount; i++) {
      const idx = splashIndex.current % splashData.length;
      const splash = splashData[idx];
      
      const angle = (Math.PI * 2 * i) / splashCount;
      const speed = 0.4 + Math.random() * 0.8;
      
      splash.x = x;
      splash.y = y;
      splash.z = z;
      splash.vx = Math.cos(angle) * speed;
      splash.vy = 1.5 + Math.random() * 1.5;
      splash.vz = Math.sin(angle) * speed;
      splash.life = 0;
      
      splashIndex.current++;
    }
  };

  // Анимация
  useFrame((state, delta) => {
    if (!enabled || !rainRef.current) return;

    timeRef.current += delta;
    const dummy = new THREE.Object3D();

    // Анимация капель
    rainData.forEach((drop, i) => {
      // Падение
      drop.y -= drop.speed * delta * intensity;
      
      // Лёгкая турбулентность
      const turbulence = Math.sin(timeRef.current * 2 + drop.offset) * 0.015;
      drop.x += turbulence + Math.cos(windDirection) * windSpeed * delta;
      drop.z += Math.sin(windDirection) * windSpeed * delta;

      // Проверка касания земли
      if (drop.y < 0) {
        createSplash(drop.x, 0, drop.z);
        
        drop.y = drop.startY + Math.random() * 5;
        drop.x = drop.startX + (Math.random() - 0.5) * 2;
        drop.z = drop.startZ + (Math.random() - 0.5) * 2;
      }

      // Обновляем матрицу
      dummy.position.set(drop.x, drop.y, drop.z);
      
      // Наклон капли по направлению движения
      const velocityAngle = Math.atan2(
        Math.cos(windDirection) * windSpeed,
        drop.speed
      );
      dummy.rotation.set(velocityAngle * 0.5, 0, drop.rotation);
      dummy.scale.set(drop.thickness * 10, drop.length, drop.thickness * 10);
      
      dummy.updateMatrix();
      rainRef.current.setMatrixAt(i, dummy.matrix);
    });

    rainRef.current.instanceMatrix.needsUpdate = true;

    // Анимация брызг
    if (splashEnabled && splashRef.current) {
      splashData.forEach((splash, i) => {
        if (splash.life < splash.maxLife) {
          splash.life += delta;
          
          splash.x += splash.vx * delta;
          splash.y += splash.vy * delta;
          splash.z += splash.vz * delta;
          
          splash.vy -= 8 * delta; // Гравитация
          
          const progress = splash.life / splash.maxLife;
          const scale = splash.size * (1 - progress);
          
          dummy.position.set(splash.x, splash.y, splash.z);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          
          splashRef.current.setMatrixAt(i, dummy.matrix);
        } else {
          dummy.position.set(0, -1000, 0);
          dummy.scale.set(0.001, 0.001, 0.001);
          dummy.updateMatrix();
          splashRef.current.setMatrixAt(i, dummy.matrix);
        }
      });

      splashRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (!enabled) return null;

  return (
    <group>
      {/* Капли дождя */}
      <instancedMesh
        ref={rainRef}
        args={[dropletGeometry, dropletMaterial, count]}
        frustumCulled={true}
        castShadow
      />

      {/* Брызги */}
      {splashEnabled && (
        <instancedMesh
          ref={splashRef}
          args={[splashGeometry, splashMaterial, splashData.length]}
          frustumCulled={true}
        />
      )}
    </group>
  );
};

export default RealisticRainStreaks;
