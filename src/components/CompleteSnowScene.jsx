import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import RealisticSnowfall from './RealisticSnowfall';

/**
 * CompleteSnowScene - Полная сцена со снегом и всеми настройками
 * 
 * Пресеты:
 * - 'light-snow' - Лёгкий снег
 * - 'moderate-snow' - Умеренный снегопад
 * - 'heavy-snow' - Сильная метель
 * - 'blizzard' - Буря
 */
const CompleteSnowScene = ({
  preset = 'moderate-snow',
  showStats = false,
  showControls = false,
  customSettings = null,
}) => {
  const presets = {
    'light-snow': {
      snow: {
        count: 300,
        intensity: 0.7,
        windSpeed: 0.05,
        accumulation: false,
        renderMode: 'detailed',
      },
      scene: {
        fogColor: '#e8f0f8',
        backgroundColor: '#f0f4f8',
        ambientLight: 0.7,
        temperature: -2,
      }
    },
    
    'moderate-snow': {
      snow: {
        count: 600,
        intensity: 1.0,
        windSpeed: 0.15,
        accumulation: true,
        renderMode: 'detailed',
      },
      scene: {
        fogColor: '#d8e4f0',
        backgroundColor: '#e0e8f0',
        ambientLight: 0.6,
        temperature: -5,
      }
    },
    
    'heavy-snow': {
      snow: {
        count: 900,
        intensity: 1.5,
        windSpeed: 0.3,
        accumulation: true,
        renderMode: 'simple',
      },
      scene: {
        fogColor: '#c8d8e8',
        backgroundColor: '#d0e0f0',
        ambientLight: 0.5,
        temperature: -10,
      }
    },
    
    'blizzard': {
      snow: {
        count: 1200,
        intensity: 2.0,
        windSpeed: 0.6,
        windDirection: Math.PI / 4,
        accumulation: true,
        renderMode: 'performance',
      },
      scene: {
        fogColor: '#b8c8d8',
        backgroundColor: '#c0d0e0',
        ambientLight: 0.4,
        temperature: -20,
      }
    },
  };

  const settings = preset === 'custom' && customSettings 
    ? customSettings 
    : presets[preset] || presets['moderate-snow'];

  const [showUI, setShowUI] = useState(true);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
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
        <fog attach="fog" args={[settings.scene.fogColor, 5, 45]} />

        {/* Освещение */}
        <ambientLight intensity={settings.scene.ambientLight} color="#e8f0ff" />
        <directionalLight
          position={[10, 20, 5]}
          intensity={0.4}
          color="#ffffff"
          castShadow
        />
        <hemisphereLight
          intensity={0.3}
          color="#ffffff"
          groundColor="#b0c4de"
        />

        <Environment preset="dawn" />

        {/* Снег */}
        <RealisticSnowfall
          count={settings.snow.count}
          intensity={settings.snow.intensity}
          windSpeed={settings.snow.windSpeed}
          windDirection={settings.snow.windDirection || 0}
          enabled={true}
          accumulation={settings.snow.accumulation}
          renderMode={settings.snow.renderMode}
          color="#ffffff"
        />

        {/* Земля со снегом */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial
            color={settings.scene.temperature < -10 ? '#f0f4f8' : '#e8eef4'}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {showControls && <OrbitControls />}
        {showStats && <Stats />}
      </Canvas>

      {/* UI панель */}
      {showUI && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#333',
          padding: '20px',
          borderRadius: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          maxWidth: '280px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ❄️ Snow Settings
          </h3>
          
          <div style={{ 
            background: '#f0f4f8',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              Preset: {preset}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              Temperature: {settings.scene.temperature}°C
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px',
              background: '#f8fafc',
              borderRadius: '4px'
            }}>
              <span>❄️ Flakes:</span>
              <span style={{ fontWeight: 'bold', color: '#4a90e2' }}>
                {settings.snow.count}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px',
              background: '#f8fafc',
              borderRadius: '4px'
            }}>
              <span>⚡ Intensity:</span>
              <span style={{ fontWeight: 'bold', color: '#4a90e2' }}>
                {settings.snow.intensity.toFixed(1)}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px',
              background: '#f8fafc',
              borderRadius: '4px'
            }}>
              <span>💨 Wind:</span>
              <span style={{ fontWeight: 'bold', color: '#4a90e2' }}>
                {settings.snow.windSpeed.toFixed(2)}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px',
              background: '#f8fafc',
              borderRadius: '4px'
            }}>
              <span>🏔️ Accumulation:</span>
              <span style={{ fontWeight: 'bold' }}>
                {settings.snow.accumulation ? '✅' : '❌'}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px',
              background: '#f8fafc',
              borderRadius: '4px'
            }}>
              <span>🎨 Mode:</span>
              <span style={{ 
                fontWeight: 'bold',
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#666'
              }}>
                {settings.snow.renderMode}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowUI(false)}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '12px',
            }}
          >
            Hide Panel
          </button>
        </div>
      )}

      {/* Кнопка показа UI */}
      {!showUI && (
        <button
          onClick={() => setShowUI(true)}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
          }}
        >
          ❄️
        </button>
      )}
    </div>
  );
};

// Примеры использования
export const LightSnowExample = () => (
  <CompleteSnowScene preset="light-snow" />
);

export const ModerateSnowExample = () => (
  <CompleteSnowScene preset="moderate-snow" />
);

export const HeavySnowExample = () => (
  <CompleteSnowScene preset="heavy-snow" />
);

export const BlizzardExample = () => (
  <CompleteSnowScene preset="blizzard" showStats={true} />
);

// Интеграция с переключением
export const WeatherIntegrationExample = () => {
  const [weather, setWeather] = useState('moderate-snow');

  return (
    <div>
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 200,
        display: 'flex',
        gap: '10px',
      }}>
        <button onClick={() => setWeather('light-snow')}>Light</button>
        <button onClick={() => setWeather('moderate-snow')}>Moderate</button>
        <button onClick={() => setWeather('heavy-snow')}>Heavy</button>
        <button onClick={() => setWeather('blizzard')}>Blizzard</button>
      </div>

      <CompleteSnowScene preset={weather} />
    </div>
  );
};

export default CompleteSnowScene;
