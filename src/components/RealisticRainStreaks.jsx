import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RealisticRainStreaks - Улучшенный 3D визуализатор дождя
 * 
 * Особенности:
 * - Реалистичные прозрачные капли с физикой
 * - Система брызг при приземлении
 * - Оптимизация через InstancedMesh
 * - Вариация размеров и скоростей
 * - Эффект ветра и турбулентности
 */
const RealisticRainStreaks = ({ 
  count = 800,              // Количество капель
  intensity = 1.0,          // Интенсивность дождя (0-2)
  windSpeed = 0.3,          // Сила бокового ветра
  windDirection = Math.PI / 4, // Направление ветра (радианы)
  enabled = true,
  area = { x: 40, z: 40, height: 25 }, // Область дождя
  splashEnabled = true,     // Включить брызги
  color = '#b8d4f0',       // Цвет капель
}) => {
  const rainRef = useRef();
  const splashRef = useRef();
  const timeRef = useRef(0);

  // Данные для каждой капли
  const rainData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        // Начальная позиция
        startX: (Math.random() - 0.5) * area.x,
        startZ: (Math.random() - 0.5) * area.z,
        startY: Math.random() * area.height + area.height * 0.5,
        
        // Текущая позиция
        x: 0,
        y: 0,
        z: 0,
        
        // Характеристики капли
        speed: 18 + Math.random() * 10, // Скорость падения
        size: 0.5 + Math.random() * 0.5, // Размер (для масштаба)
        rotation: Math.random() * Math.PI * 2, // Вращение
        offset: Math.random() * 100, // Временной сдвиг для турбулентности
      });
    }
    return data;
  }, [count, area]);

  // Данные для брызг
  const splashData = useMemo(() => {
    if (!splashEnabled) return [];
    
    const maxSplashes = Math.min(count * 6, 2000); // До 6 частиц брызг на каплю
    const data = [];
    
    for (let i = 0; i < maxSplashes; i++) {
      data.push({
        x: 0,
        y: -1000, // Изначально скрыты под землёй
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.2,
        size: 0.03 + Math.random() * 0.02,
      });
    }
    return data;
  }, [count, splashEnabled]);

  const splashIndex = useRef(0);

  // Геометрия капли (удлинённый цилиндр/конус)
  const dropletGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.015, 0.01, 0.6, 4, 1);
    geometry.translate(0, -0.3, 0); // Сдвигаем вниз для правильной ротации
    return geometry;
  }, []);

  // Материал с реалистичной прозрачностью
  const dropletMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.6,
      transmission: 0.95, // Высокая прозрачность
      thickness: 0.3,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  }, [color]);

  // Геометрия и материал для брызг
  const splashGeometry = useMemo(() => new THREE.SphereGeometry(0.02, 4, 4), []);
  const splashMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(1.2),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
  }, [color]);

  // Инициализация позиций
  useEffect(() => {
    if (!rainRef.current) return;

    const dummy = new THREE.Object3D();
    
    rainData.forEach((drop, i) => {
      // Инициализируем начальные позиции
      drop.x = drop.startX;
      drop.y = drop.startY;
      drop.z = drop.startZ;

      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.rotation.set(0, 0, drop.rotation);
      dummy.scale.set(drop.size, drop.size, drop.size);
      dummy.updateMatrix();
      
      rainRef.current.setMatrixAt(i, dummy.matrix);
    });

    rainRef.current.instanceMatrix.needsUpdate = true;
  }, [rainData]);

  // Создание брызг
  const createSplash = (x, y, z) => {
    if (!splashEnabled || !splashRef.current) return;

    const splashCount = 4 + Math.floor(Math.random() * 3); // 4-6 частиц
    
    for (let i = 0; i < splashCount; i++) {
      const idx = splashIndex.current % splashData.length;
      const splash = splashData[idx];
      
      const angle = (Math.PI * 2 * i) / splashCount;
      const speed = 0.5 + Math.random() * 1.0;
      
      splash.x = x;
      splash.y = y;
      splash.z = z;
      splash.vx = Math.cos(angle) * speed;
      splash.vy = 2 + Math.random() * 2; // Вверх
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

    // Анимация капель дождя
    rainData.forEach((drop, i) => {
      // Применяем гравитацию и ветер
      drop.y -= drop.speed * delta * intensity;
      
      // Турбулентность (лёгкое покачивание)
      const turbulence = Math.sin(timeRef.current * 2 + drop.offset) * 0.02;
      drop.x += turbulence + Math.cos(windDirection) * windSpeed * delta;
      drop.z += Math.sin(windDirection) * windSpeed * delta;

      // Проверка на касание земли
      if (drop.y < 0) {
        // Создаём брызги
        createSplash(drop.x, 0, drop.z);
        
        // Сброс капли наверх
        drop.y = drop.startY + Math.random() * 5;
        drop.x = drop.startX + (Math.random() - 0.5) * 2;
        drop.z = drop.startZ + (Math.random() - 0.5) * 2;
      }

      // Обновляем матрицу экземпляра
      dummy.position.set(drop.x, drop.y, drop.z);
      
      // Капля наклонена по направлению движения
      const angle = Math.atan2(
        Math.cos(windDirection) * windSpeed,
        drop.speed
      );
      dummy.rotation.set(angle, 0, drop.rotation);
      dummy.scale.set(drop.size, drop.size, drop.size);
      
      dummy.updateMatrix();
      rainRef.current.setMatrixAt(i, dummy.matrix);
    });

    rainRef.current.instanceMatrix.needsUpdate = true;

    // Анимация брызг
    if (splashEnabled && splashRef.current) {
      splashData.forEach((splash, i) => {
        if (splash.life < splash.maxLife) {
          splash.life += delta;
          
          // Физика брызг
          splash.x += splash.vx * delta;
          splash.y += splash.vy * delta;
          splash.z += splash.vz * delta;
          
          splash.vy -= 9.8 * delta; // Гравитация
          
          // Затухание
          const progress = splash.life / splash.maxLife;
          const scale = splash.size * (1 - progress);
          const opacity = 1 - progress;
          
          dummy.position.set(splash.x, splash.y, splash.z);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          
          splashRef.current.setMatrixAt(i, dummy.matrix);
          
          // Обновляем прозрачность (через цвет)
          if (splashRef.current.material) {
            splashRef.current.material.opacity = opacity * 0.8;
          }
        } else {
          // Скрываем отработанные брызги
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
