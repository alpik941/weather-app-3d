import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import RealisticRainStreaks from './RealisticRainStreaks';
import WeatherEffects from './WeatherEffects';

/**
 * CompleteRainScene - Полная сцена с дождём и всеми эффектами
 * 
 * Это финальный пример, объединяющий:
 * - Реалистичный дождь с брызгами
 * - Туман и облака
 * - Молнии (опционально)
 * - Лужи на земле
 * - Настройки интенсивности
 */
const CompleteRainScene = ({
  // Контроль сцены
  preset = 'light-rain', // 'light-rain' | 'heavy-rain' | 'storm' | 'drizzle' | 'custom'
  showStats = false,
  showControls = false,
  
  // Пользовательские настройки (если preset = 'custom')
  customSettings = null,
}) => {
  // Предустановленные конфигурации
  const presets = {
    'drizzle': {
      // Лёгкая морось
      rain: {
        count: 300,
        intensity: 0.5,
        windSpeed: 0.1,
        splashEnabled: false,
      },
      fog: { enabled: true, opacity: 0.08 },
      clouds: { enabled: true, count: 15, opacity: 0.2 },
      lightning: { enabled: false },
      puddles: { enabled: false },
      scene: {
        fogColor: '#c0d0e0',
        backgroundColor: '#e8f0f8',
        ambientLight: 0.6,
      }
    },
    
    'light-rain': {
      // Лёгкий дождь
      rain: {
        count: 500,
        intensity: 1.0,
        windSpeed: 0.3,
        splashEnabled: true,
      },
      fog: { enabled: true, opacity: 0.12 },
      clouds: { enabled: true, count: 20, opacity: 0.25 },
      lightning: { enabled: false },
      puddles: { enabled: true, count: 20 },
      scene: {
        fogColor: '#a8b8c8',
        backgroundColor: '#b8c8d8',
        ambientLight: 0.5,
      }
    },
    
    'heavy-rain': {
      // Сильный дождь
      rain: {
        count: 1000,
        intensity: 1.6,
        windSpeed: 0.6,
        splashEnabled: true,
      },
      fog: { enabled: true, opacity: 0.18 },
      clouds: { enabled: true, count: 30, opacity: 0.35 },
      lightning: { enabled: false },
      puddles: { enabled: true, count: 40 },
      scene: {
        fogColor: '#8898a8',
        backgroundColor: '#6878a8',
        ambientLight: 0.4,
      }
    },
    
    'storm': {
      // Шторм с молниями
      rain: {
        count: 1200,
        intensity: 2.0,
        windSpeed: 1.0,
        windDirection: Math.PI / 3,
        splashEnabled: true,
      },
      fog: { enabled: true, opacity: 0.22 },
      clouds: { enabled: true, count: 40, opacity: 0.45 },
      lightning: { enabled: true, frequency: 0.03, intensity: 3.0 },
      puddles: { enabled: true, count: 50 },
      scene: {
        fogColor: '#607080',
        backgroundColor: '#405060',
        ambientLight: 0.3,
      }
    },
  };

  // Получаем текущие настройки
  const settings = preset === 'custom' && customSettings 
    ? customSettings 
    : presets[preset] || presets['light-rain'];

  const [showUI, setShowUI] = useState(true);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Canvas с 3D сценой */}
      <Canvas
        camera={{
          position: [0, 5, 15],
          fov: 75,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
          background: settings.scene.backgroundColor,
        }}
      >
        {/* Туман для атмосферы */}
        <fog attach="fog" args={[settings.scene.fogColor, 5, 50]} />

        {/* Освещение */}
        <ambientLight intensity={settings.scene.ambientLight} color="#b8d4f0" />
        <directionalLight
          position={[10, 20, 5]}
          intensity={0.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Окружение для отражений */}
        <Environment preset="night" />

        {/* === ГЛАВНЫЙ ДОЖДЬ === */}
        <RealisticRainStreaks
          count={settings.rain.count}
          intensity={settings.rain.intensity}
          windSpeed={settings.rain.windSpeed}
          windDirection={settings.rain.windDirection || Math.PI / 4}
          enabled={true}
          splashEnabled={settings.rain.splashEnabled}
          color="#b8d4f0"
        />

        {/* === ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ === */}
        <WeatherEffects
          fogEnabled={settings.fog.enabled}
          fogOpacity={settings.fog.opacity}
          
          lightningEnabled={settings.lightning.enabled}
          lightningFrequency={settings.lightning.frequency}
          lightningIntensity={settings.lightning.intensity}
          
          cloudsEnabled={settings.clouds.enabled}
          cloudCount={settings.clouds.count}
          cloudOpacity={settings.clouds.opacity}
          
          puddlesEnabled={settings.puddles.enabled}
          puddleCount={settings.puddles.count}
        />

        {/* Земля */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color="#1a2332"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        {/* Контролы для навигации (отладка) */}
        {showControls && <OrbitControls />}
        
        {/* Статистика производительности */}
        {showStats && <Stats />}
      </Canvas>

      {/* UI панель управления */}
      {showUI && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          maxWidth: '250px',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🌧️ Настройки дождя</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Пресет:</strong> {preset}
          </div>
          
          <div style={{ marginBottom: '5px' }}>
            ⚡ Капель: {settings.rain.count}
          </div>
          <div style={{ marginBottom: '5px' }}>
            💨 Интенсивность: {settings.rain.intensity.toFixed(1)}
          </div>
          <div style={{ marginBottom: '5px' }}>
            🌪️ Ветер: {settings.rain.windSpeed.toFixed(1)}
          </div>
          <div style={{ marginBottom: '5px' }}>
            💦 Брызги: {settings.rain.splashEnabled ? '✅' : '❌'}
          </div>
          <div style={{ marginBottom: '5px' }}>
            ⚡ Молнии: {settings.lightning.enabled ? '✅' : '❌'}
          </div>
          
          <button
            onClick={() => setShowUI(false)}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#333',
              border: 'none',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Скрыть
          </button>
        </div>
      )}

      {/* Кнопка показа UI (если скрыто) */}
      {!showUI && (
        <button
          onClick={() => setShowUI(true)}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '10px 15px',
            background: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 100,
          }}
        >
          ⚙️
        </button>
      )}
    </div>
  );
};

// === Примеры использования ===

// Пример 1: Лёгкий дождь (по умолчанию)
export const LightRainExample = () => (
  <CompleteRainScene preset="light-rain" />
);

// Пример 2: Шторм с молниями
export const StormExample = () => (
  <CompleteRainScene 
    preset="storm" 
    showStats={true}
  />
);

// Пример 3: Пользовательские настройки
export const CustomRainExample = () => (
  <CompleteRainScene
    preset="custom"
    customSettings={{
      rain: {
        count: 600,
        intensity: 1.3,
        windSpeed: 0.4,
        splashEnabled: true,
      },
      fog: { enabled: true, opacity: 0.15 },
      clouds: { enabled: true, count: 25, opacity: 0.3 },
      lightning: { enabled: true, frequency: 0.01, intensity: 2.5 },
      puddles: { enabled: true, count: 35 },
      scene: {
        fogColor: '#90a0b0',
        backgroundColor: '#708090',
        ambientLight: 0.45,
      }
    }}
    showControls={true}
  />
);

// Пример 4: Интеграция в существующий компонент
export const IntegrationExample = () => {
  const [weatherPreset, setWeatherPreset] = useState('light-rain');

  return (
    <div>
      {/* Контролы переключения */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 200,
        display: 'flex',
        gap: '10px',
      }}>
        <button onClick={() => setWeatherPreset('drizzle')}>Морось</button>
        <button onClick={() => setWeatherPreset('light-rain')}>Лёгкий</button>
        <button onClick={() => setWeatherPreset('heavy-rain')}>Сильный</button>
        <button onClick={() => setWeatherPreset('storm')}>Шторм</button>
      </div>

      {/* Сцена */}
      <CompleteRainScene preset={weatherPreset} />
    </div>
  );
};

export default CompleteRainScene;
