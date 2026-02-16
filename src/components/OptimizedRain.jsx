import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * OptimizedRain - Оптимизированный компонент дождя с правильной длиной капель
 * 
 * КЛЮЧЕВЫЕ УЛУЧШЕНИЯ:
 * - Правильная длина капель: 0.18-0.28 единиц (вместо 0.6-1.3)
 * - Баланс между производительностью и визуальным качеством
 * - Оптимизация через InstancedMesh
 * - Система брызг при приземлении
 * - Покачивание от ветра с турбулентностью
 * 
 * @param {number} count - Количество капель (400-1200)
 * @param {number} intensity - Интенсивность дождя (0.5-2.0)
 * @param {number} windSpeed - Скорость ветра (0-1.0)
 * @param {number} windDirection - Направление ветра в радианах
 * @param {boolean} enabled - Включить/выключить дождь
 * @param {object} area - Область дождя {x, z, height}
 * @param {boolean} splashEnabled - Включить брызги
 * @param {string} color - Цвет капель
 * @param {number} dropletLength - Базовая длина капли (0.18-0.28)
 */
const OptimizedRain = ({ 
  count = 800,
  intensity = 1.0,
  windSpeed = 0.3,
  windDirection = Math.PI / 4,
  enabled = true,
  area = { x: 40, z: 40, height: 25 },
  splashEnabled = true,
  color = '#b8d4f0',
  dropletLength = 0.23,  // ПРАВИЛЬНАЯ ДЛИНА: 0.18-0.28
}) => {
  const rainRef = useRef();
  const splashRef = useRef();
  const timeRef = useRef(0);

  // Данные для капель с правильными параметрами
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
        // Скорость падения: 15-25 м/с (реалистично)
        speed: 15 + Math.random() * 10,
        // КРИТИЧЕСКИ ВАЖНО: Короткие капли (0.18-0.28)
        length: dropletLength * (0.8 + Math.random() * 0.4),
        // Толщина капли (тонкие, как в природе)
        thickness: 0.012 + Math.random() * 0.008,
        rotation: Math.random() * Math.PI * 2,
        // Временной сдвиг для покачивания
        offset: Math.random() * 100,
      });
    }
    return data;
  }, [count, area, dropletLength]);

  // Данные для брызг (пул объектов для переиспользования)
  const splashData = useMemo(() => {
    if (!splashEnabled) return [];
    
    // 4-5 брызг на каплю максимум
    const maxSplashes = Math.min(count * 5, 2500);
    const data = [];
    
    for (let i = 0; i < maxSplashes; i++) {
      data.push({
        x: 0,
        y: -1000, // Скрываем неактивные брызги
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15, // 0.25-0.4 секунды
        size: 0.018 + Math.random() * 0.012, // Небольшие брызги
      });
    }
    return data;
  }, [count, splashEnabled]);

  const splashIndex = useRef(0);

  // ГЕОМЕТРИЯ: Цилиндр - лучший баланс производительности и реализма
  const dropletGeometry = useMemo(() => {
    // Цилиндр с заострённым низом и слегка расширенным верхом
    return new THREE.CylinderGeometry(
      0.01,   // Радиус верха (острый)
      0.008,  // Радиус низа (чуть тоньше)
      1,      // Высота (будет масштабироваться по length)
      4,      // Радиальные сегменты (минимум для производительности)
      1       // Вертикальные сегменты
    );
  }, []);

  // МАТЕРИАЛ: MeshStandardMaterial - хороший баланс
  const dropletMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.6,          // Полупрозрачность
      roughness: 0.15,       // Гладкая, но не идеальная
      metalness: 0.05,       // Минимальная металличность
      envMapIntensity: 1.2,  // Отражения окружения
      depthWrite: true,      // Правильная глубина
      side: THREE.DoubleSide,
    });
  }, [color]);

  // Геометрия и материал для брызг
  const splashGeometry = useMemo(() => 
    new THREE.SphereGeometry(1, 4, 4), // Низкополигональная сфера
  []);

  const splashMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(1.15), // Светлее капель
      transparent: true,
      opacity: 0.7,
      depthWrite: false, // Не пишем в буфер глубины для прозрачности
    });
  }, [color]);

  // Инициализация позиций капель
  useEffect(() => {
    if (!rainRef.current) return;

    const dummy = new THREE.Object3D();
    
    rainData.forEach((drop, i) => {
      drop.x = drop.startX;
      drop.y = drop.startY;
      drop.z = drop.startZ;

      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.rotation.set(0, 0, drop.rotation);
      // Масштабируем по длине капли (ПРАВИЛЬНАЯ ДЛИНА!)
      dummy.scale.set(drop.thickness * 100, drop.length, drop.thickness * 100);
      dummy.updateMatrix();
      
      rainRef.current.setMatrixAt(i, dummy.matrix);
    });

    rainRef.current.instanceMatrix.needsUpdate = true;
  }, [rainData]);

  // Создание брызг при приземлении капли
  const createSplash = (x, y, z) => {
    if (!splashEnabled || !splashRef.current) return;

    // 4-6 частиц на каплю
    const splashCount = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < splashCount; i++) {
      const idx = splashIndex.current % splashData.length;
      const splash = splashData[idx];
      
      // Радиальное распределение
      const angle = (Math.PI * 2 * i) / splashCount + Math.random() * 0.3;
      const speed = 0.5 + Math.random() * 0.6;
      
      splash.x = x + (Math.random() - 0.5) * 0.05;
      splash.y = y + 0.02;
      splash.z = z + (Math.random() - 0.5) * 0.05;
      splash.vx = Math.cos(angle) * speed;
      splash.vy = 1.2 + Math.random() * 1.0; // Прыжок вверх
      splash.vz = Math.sin(angle) * speed;
      splash.life = 0;
      
      splashIndex.current++;
    }
  };

  // Главная анимация (60 FPS оптимизирована)
  useFrame((state, delta) => {
    if (!enabled || !rainRef.current) return;

    timeRef.current += delta;
    const dummy = new THREE.Object3D();

    // Анимация капель дождя
    rainData.forEach((drop, i) => {
      // === ФИЗИКА ПАДЕНИЯ ===
      drop.y -= drop.speed * delta * intensity;
      
      // === ПОКАЧИВАНИЕ (турбулентность) ===
      const turbulence = Math.sin(timeRef.current * 2 + drop.offset) * 0.015;
      const turbulenceZ = Math.cos(timeRef.current * 1.7 + drop.offset) * 0.01;
      
      // === ВЛИЯНИЕ ВЕТРА ===
      drop.x += (turbulence + Math.cos(windDirection) * windSpeed * delta * 2);
      drop.z += (turbulenceZ + Math.sin(windDirection) * windSpeed * delta * 2);

      // === ПРОВЕРКА КАСАНИЯ ЗЕМЛИ ===
      if (drop.y < 0) {
        // Создать брызги
        createSplash(drop.x, 0, drop.z);
        
        // Сброс капли наверх с небольшой вариацией позиции
        drop.y = drop.startY + Math.random() * 5;
        drop.x = drop.startX + (Math.random() - 0.5) * 3;
        drop.z = drop.startZ + (Math.random() - 0.5) * 3;
      }

      // === ОБНОВЛЕНИЕ МАТРИЦЫ КАПЛИ ===
      dummy.position.set(drop.x, drop.y, drop.z);
      
      // Наклон капли по направлению движения (реализм)
      const velocityAngle = Math.atan2(
        Math.cos(windDirection) * windSpeed,
        drop.speed * 0.1
      );
      dummy.rotation.set(velocityAngle * 0.3, 0, drop.rotation);
      
      // Масштаб: тонкие короткие капли
      dummy.scale.set(drop.thickness * 100, drop.length, drop.thickness * 100);
      
      dummy.updateMatrix();
      rainRef.current.setMatrixAt(i, dummy.matrix);
    });

    rainRef.current.instanceMatrix.needsUpdate = true;

    // === АНИМАЦИЯ БРЫЗГ ===
    if (splashEnabled && splashRef.current) {
      splashData.forEach((splash, i) => {
        if (splash.life < splash.maxLife) {
          // Обновление времени жизни
          splash.life += delta;
          
          // Физика движения
          splash.x += splash.vx * delta;
          splash.y += splash.vy * delta;
          splash.z += splash.vz * delta;
          
          // Гравитация
          splash.vy -= 9.8 * delta;
          
          // Затухание размера и прозрачности
          const progress = splash.life / splash.maxLife;
          const scale = splash.size * (1 - progress * 0.8);
          
          dummy.position.set(splash.x, Math.max(splash.y, 0), splash.z);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          
          splashRef.current.setMatrixAt(i, dummy.matrix);
        } else {
          // Скрываем мёртвые брызги
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
      {/* Капли дождя - КОРОТКИЕ И РЕАЛИСТИЧНЫЕ */}
      <instancedMesh
        ref={rainRef}
        args={[dropletGeometry, dropletMaterial, count]}
        frustumCulled={true}
        castShadow
      />

      {/* Брызги при приземлении */}
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

export default OptimizedRain;
