import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RealisticRainStreaks from './RealisticRainStreaks';

/**
 * WeatherRainScene - Полноценная 3D сцена с реалистичным дождём
 * 
 * Использование:
 * <WeatherRainScene 
 *   rainIntensity={1.5}
 *   windSpeed={0.5}
 *   fogEnabled={true}
 * />
 */
const WeatherRainScene = ({
  // Настройки дождя
  rainCount = 800,
  rainIntensity = 1.0,
  rainEnabled = true,
  splashEnabled = true,
  
  // Настройки ветра
  windSpeed = 0.3,
  windDirection = Math.PI / 4,
  
  // Настройки сцены
  fogEnabled = true,
  fogColor = '#a0b8c8',
  fogNear = 10,
  fogFar = 50,
  
  // Настройки камеры
  cameraPosition = [0, 5, 15],
  cameraFov = 75,
  
  // Окружение
  backgroundColor = '#1a1a2e',
  ambientLightIntensity = 0.4,
  directionalLightIntensity = 0.6,
  
  // Дополнительно
  showControls = false,
  showGround = true,
  children,
}) => {
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
      {/* Туман для атмосферы */}
      {fogEnabled && <fog attach="fog" args={[fogColor, fogNear, fogFar]} />}

      {/* Освещение */}
      <ambientLight intensity={ambientLightIntensity} color="#b8d4f0" />
      <directionalLight
        position={[10, 20, 5]}
        intensity={directionalLightIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Окружение для отражений */}
      <Suspense fallback={null}>
        <Environment preset="night" />
      </Suspense>

      {/* Основной дождь */}
      <Suspense fallback={null}>
        <RealisticRainStreaks
          count={rainCount}
          intensity={rainIntensity}
          windSpeed={windSpeed}
          windDirection={windDirection}
          enabled={rainEnabled}
          splashEnabled={splashEnabled}
          color="#b8d4f0"
        />
      </Suspense>

      {/* Земля/поверхность */}
      {showGround && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial
            color="#1a2332"
            roughness={0.8}
            metalness={0.2}
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

export default WeatherRainScene;
