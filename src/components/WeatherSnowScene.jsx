import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RealisticSnowfall from './RealisticSnowfall';

/**
 * WeatherSnowScene - Полноценная 3D сцена с реалистичным снегом
 * 
 * Использование:
 * <WeatherSnowScene 
 *   snowIntensity={1.0}
 *   windSpeed={0.2}
 *   temperature={-5}
 * />
 */
const WeatherSnowScene = ({
  // Настройки снега
  snowCount = 600,
  snowIntensity = 1.0,
  snowEnabled = true,
  snowAccumulation = false,
  
  // Настройки ветра
  windSpeed = 0.1,
  windDirection = 0,
  
  // Температура (влияет на визуал)
  temperature = -5,
  
  // Настройки сцены
  fogEnabled = true,
  fogColor = '#d0d8e0',
  fogNear = 5,
  fogFar = 45,
  
  // Настройки камеры
  cameraPosition = [0, 5, 15],
  cameraFov = 75,
  
  // Окружение
  backgroundColor = '#e8f0f8',
  ambientLightIntensity = 0.6,
  directionalLightIntensity = 0.4,
  
  // Режим рендеринга
  renderMode = 'detailed', // 'detailed' | 'simple' | 'performance'
  
  // Дополнительно
  showControls = false,
  showGround = true,
  children,
}) => {
  // Определяем режим рендеринга на основе температуры и количества
  const effectiveRenderMode = React.useMemo(() => {
    if (renderMode !== 'detailed') return renderMode;
    
    // Автоматический выбор режима
    if (snowCount > 800) return 'performance';
    if (snowCount > 500) return 'simple';
    return 'detailed';
  }, [renderMode, snowCount]);

  return (
    <Canvas
      camera={{
        position: cameraPosition,
        fov: cameraFov,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{
        width: '100%',
        height: '100%',
        background: backgroundColor,
      }}
    >
      {/* Туман для зимней атмосферы */}
      {fogEnabled && <fog attach="fog" args={[fogColor, fogNear, fogFar]} />}

      {/* Освещение (мягкое зимнее) */}
      <ambientLight intensity={ambientLightIntensity} color="#e8f0ff" />
      <directionalLight
        position={[10, 20, 5]}
        intensity={directionalLightIntensity}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Дополнительный заполняющий свет */}
      <hemisphereLight
        intensity={0.3}
        color="#ffffff"
        groundColor="#b0c4de"
      />

      {/* Окружение для отражений */}
      <Suspense fallback={null}>
        <Environment preset="dawn" />
      </Suspense>

      {/* Основной снег */}
      <Suspense fallback={null}>
        <RealisticSnowfall
          count={snowCount}
          intensity={snowIntensity}
          windSpeed={windSpeed}
          windDirection={windDirection}
          enabled={snowEnabled}
          accumulation={snowAccumulation}
          renderMode={effectiveRenderMode}
          color="#ffffff"
        />
      </Suspense>

      {/* Земля/поверхность со снегом */}
      {showGround && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color={temperature < -10 ? '#f0f4f8' : '#e8eef4'}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Дополнительные элементы сцены */}
      {children}

      {/* Контролы для отладки */}
      {showControls && <OrbitControls />}
    </Canvas>
  );
};

export default WeatherSnowScene;
