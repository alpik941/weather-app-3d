import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RealisticSnowfall - Улучшенный 3D визуализатор снега
 * 
 * Особенности:
 * - Реалистичные снежинки с формой (6 лучей)
 * - Физика: плавное падение + покачивание + вращение
 * - Оптимизация через InstancedMesh + Points
 * - Вариация размеров и скоростей
 * - Эффект ветра и турбулентности
 * - Накопление снега на земле (опционально)
 */

// Создание текстуры снежинки
const createSnowflakeTexture = () => {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const center = size / 2;
  
  // Прозрачный фон
  ctx.clearRect(0, 0, size, size);
  
  // Стиль для снежинки
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Центральный круг
  ctx.beginPath();
  ctx.arc(center, center, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // 6 лучей снежинки
  const rays = 6;
  const rayLength = 24;
  const rayWidth = 2;
  
  for (let i = 0; i < rays; i++) {
    const angle = (Math.PI * 2 * i) / rays;
    const x = center + Math.cos(angle) * rayLength;
    const y = center + Math.sin(angle) * rayLength;
    
    // Основной луч
    ctx.beginPath();
    ctx.lineWidth = rayWidth;
    ctx.moveTo(center, center);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Боковые веточки
    const branchLength = 8;
    const branchAngle1 = angle - Math.PI / 4;
    const branchAngle2 = angle + Math.PI / 4;
    
    const midX = center + Math.cos(angle) * (rayLength * 0.6);
    const midY = center + Math.sin(angle) * (rayLength * 0.6);
    
    ctx.lineWidth = 1;
    
    // Левая веточка
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(
      midX + Math.cos(branchAngle1) * branchLength,
      midY + Math.sin(branchAngle1) * branchLength
    );
    ctx.stroke();
    
    // Правая веточка
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(
      midX + Math.cos(branchAngle2) * branchLength,
      midY + Math.sin(branchAngle2) * branchLength
    );
    ctx.stroke();
  }
  
  // Добавляем мягкое свечение
  ctx.globalCompositeOperation = 'destination-over';
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  return new THREE.CanvasTexture(canvas);
};

const RealisticSnowfall = ({ 
  count = 600,              // Количество снежинок
  intensity = 1.0,          // Интенсивность снега (скорость падения)
  windSpeed = 0.1,          // Сила ветра
  windDirection = 0,        // Направление ветра (радианы)
  enabled = true,
  area = { x: 50, z: 50, height: 30 }, // Область снега
  snowflakeSize = 0.15,     // Размер снежинок
  accumulation = false,     // Накопление снега на земле
  color = '#ffffff',        // Цвет снега
  renderMode = 'detailed',  // 'detailed' | 'simple' | 'performance'
}) => {
  const snowRef = useRef();
  const accumulationRef = useRef();
  const timeRef = useRef(0);

  // Данные для каждой снежинки
  const snowData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        // Начальная позиция
        startX: (Math.random() - 0.5) * area.x,
        startZ: (Math.random() - 0.5) * area.z,
        startY: Math.random() * area.height + area.height * 0.3,
        
        // Текущая позиция
        x: 0,
        y: 0,
        z: 0,
        
        // Характеристики снежинки
        speed: 0.3 + Math.random() * 0.4, // Медленное падение
        size: snowflakeSize * (0.7 + Math.random() * 0.6), // Вариация размера
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5, // Скорость вращения
        swingAmplitude: 0.5 + Math.random() * 1.0, // Амплитуда покачивания
        swingSpeed: 0.5 + Math.random() * 0.5, // Частота покачивания
        offset: Math.random() * 100, // Временной сдвиг
      });
    }
    return data;
  }, [count, area, snowflakeSize]);

  // Данные для накопленного снега
  const accumulationData = useMemo(() => {
    if (!accumulation) return [];
    
    const data = [];
    const pileCount = Math.min(count, 200);
    
    for (let i = 0; i < pileCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * area.x * 0.8,
        y: 0,
        z: (Math.random() - 0.5) * area.z * 0.8,
        size: 0.05 + Math.random() * 0.1,
        visible: false,
      });
    }
    return data;
  }, [accumulation, count, area]);

  const accumulationIndex = useRef(0);

  // Текстура снежинки
  const snowflakeTexture = useMemo(() => createSnowflakeTexture(), []);

  // Материал в зависимости от режима
  const snowMaterial = useMemo(() => {
    if (renderMode === 'performance') {
      // Простые точки для производительности
      return new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: snowflakeSize * 2,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: snowflakeTexture,
      });
    } else {
      // Детальные спрайты
      return new THREE.SpriteMaterial({
        map: snowflakeTexture,
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: renderMode === 'detailed' ? THREE.NormalBlending : THREE.AdditiveBlending,
      });
    }
  }, [color, snowflakeSize, snowflakeTexture, renderMode]);

  // Геометрия для накопления
  const accumulationGeometry = useMemo(() => new THREE.SphereGeometry(0.08, 6, 6), []);
  const accumulationMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.9,
      metalness: 0.1,
    });
  }, [color]);

  // Инициализация позиций
  useEffect(() => {
    if (!snowRef.current) return;

    if (renderMode === 'performance') {
      // Points mode
      const positions = new Float32Array(count * 3);
      snowData.forEach((flake, i) => {
        flake.x = flake.startX;
        flake.y = flake.startY;
        flake.z = flake.startZ;
        
        positions[i * 3] = flake.x;
        positions[i * 3 + 1] = flake.y;
        positions[i * 3 + 2] = flake.z;
      });
      
      snowRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
    } else {
      // Sprite mode - handled in useFrame
      snowData.forEach((flake) => {
        flake.x = flake.startX;
        flake.y = flake.startY;
        flake.z = flake.startZ;
      });
    }
  }, [snowData, renderMode, count]);

  // Добавление снега на землю
  const addSnowPile = (x, z) => {
    if (!accumulation || !accumulationRef.current) return;

    const idx = accumulationIndex.current % accumulationData.length;
    const pile = accumulationData[idx];
    
    pile.x = x;
    pile.z = z;
    pile.visible = true;
    
    accumulationIndex.current++;
  };

  // Анимация
  useFrame((state, delta) => {
    if (!enabled || !snowRef.current) return;

    timeRef.current += delta;

    if (renderMode === 'performance') {
      // Points animation
      const positions = snowRef.current.geometry.attributes.position.array;

      snowData.forEach((flake, i) => {
        // Падение
        flake.y -= flake.speed * delta * intensity;
        
        // Покачивание (синусоида)
        const swingX = Math.sin(timeRef.current * flake.swingSpeed + flake.offset) * flake.swingAmplitude * delta;
        const swingZ = Math.cos(timeRef.current * flake.swingSpeed * 0.7 + flake.offset) * flake.swingAmplitude * 0.5 * delta;
        
        flake.x += swingX + Math.cos(windDirection) * windSpeed * delta;
        flake.z += swingZ + Math.sin(windDirection) * windSpeed * delta;

        // Проверка на касание земли
        if (flake.y < 0) {
          addSnowPile(flake.x, flake.z);
          
          // Сброс наверх
          flake.y = flake.startY + Math.random() * 5;
          flake.x = flake.startX + (Math.random() - 0.5) * 3;
          flake.z = flake.startZ + (Math.random() - 0.5) * 3;
        }

        positions[i * 3] = flake.x;
        positions[i * 3 + 1] = flake.y;
        positions[i * 3 + 2] = flake.z;
      });

      snowRef.current.geometry.attributes.position.needsUpdate = true;
    } else {
      // Sprite animation (более детальная)
      snowData.forEach((flake, i) => {
        // Падение
        flake.y -= flake.speed * delta * intensity;
        
        // Покачивание
        const swingX = Math.sin(timeRef.current * flake.swingSpeed + flake.offset) * flake.swingAmplitude * delta;
        const swingZ = Math.cos(timeRef.current * flake.swingSpeed * 0.7 + flake.offset) * flake.swingAmplitude * 0.5 * delta;
        
        flake.x += swingX + Math.cos(windDirection) * windSpeed * delta;
        flake.z += swingZ + Math.sin(windDirection) * windSpeed * delta;
        
        // Вращение
        flake.rotation += flake.rotationSpeed * delta;

        // Проверка на касание земли
        if (flake.y < 0) {
          addSnowPile(flake.x, flake.z);
          
          flake.y = flake.startY + Math.random() * 5;
          flake.x = flake.startX + (Math.random() - 0.5) * 3;
          flake.z = flake.startZ + (Math.random() - 0.5) * 3;
        }

        // Обновляем спрайт
        if (snowRef.current.children[i]) {
          const sprite = snowRef.current.children[i];
          sprite.position.set(flake.x, flake.y, flake.z);
          sprite.material.rotation = flake.rotation;
          sprite.scale.setScalar(flake.size);
        }
      });
    }

    // Анимация накопленного снега
    if (accumulation && accumulationRef.current) {
      const dummy = new THREE.Object3D();

      accumulationData.forEach((pile, i) => {
        if (pile.visible) {
          dummy.position.set(pile.x, pile.y, pile.z);
          dummy.scale.set(pile.size, pile.size * 0.5, pile.size);
          dummy.updateMatrix();
          accumulationRef.current.setMatrixAt(i, dummy.matrix);
        } else {
          dummy.position.set(0, -100, 0);
          dummy.scale.set(0.001, 0.001, 0.001);
          dummy.updateMatrix();
          accumulationRef.current.setMatrixAt(i, dummy.matrix);
        }
      });

      accumulationRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (!enabled) return null;

  return (
    <group>
      {/* Падающие снежинки */}
      {renderMode === 'performance' ? (
        <points ref={snowRef} frustumCulled={true}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={count}
              array={new Float32Array(count * 3)}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial attach="material" {...snowMaterial} />
        </points>
      ) : (
        <group ref={snowRef}>
          {snowData.map((flake, i) => (
            <sprite key={i} material={snowMaterial.clone()} scale={[flake.size, flake.size, 1]} />
          ))}
        </group>
      )}

      {/* Накопленный снег */}
      {accumulation && (
        <instancedMesh
          ref={accumulationRef}
          args={[accumulationGeometry, accumulationMaterial, accumulationData.length]}
          receiveShadow
        />
      )}
    </group>
  );
};

export default RealisticSnowfall;
