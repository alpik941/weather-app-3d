import React from 'react';
import { Sphere } from '@react-three/drei';
import Moon from '../Moon';
import Sun3D from './Sun3D';

export default function CelestialBodiesSection({
  isNight,
  shouldObscureSun,
  isSnowing,
  isCloudy,
  isRaining,
  isMistyCondition,
  theme,
  temperature,
  isGoldenHour,
  isSunrise
}) {
  return (
    <>
      {isNight ? (
        shouldObscureSun ? (
          <group position={[-12, 12, -18]}>
            <Sphere args={[1.5, 32, 32]}>
              <meshStandardMaterial
                color="#cfd8e3"
                emissive="#9aa5b5"
                emissiveIntensity={isSnowing ? 0.12 : 0.1}
                transparent
                opacity={isMistyCondition ? 0.3 : (isSnowing ? 0.2 : isCloudy ? 0.3 : 0.35)}
                roughness={1}
                metalness={0}
              />
            </Sphere>
          </group>
        ) : (
          <group position={[-15, 14, -20]}>
            <Moon
              radius={1.5}
              lightTheme={theme === 'light'}
              quality="high"
              showGlow={true}
              showAtmosphere={true}
            />
          </group>
        )
      ) : (
        shouldObscureSun ? (
          <group position={[12, 12, -18]}>
            <Sphere args={[2, 32, 32]}>
              <meshBasicMaterial
                color="#fff5e1"
                transparent
                opacity={isMistyCondition ? 0.3 : (isSnowing ? 0.15 : isRaining ? 0.2 : 0.25)}
              />
            </Sphere>
          </group>
        ) : (
          <Sun3D
            temperature={temperature}
            isVisible={true}
            isGoldenHour={isGoldenHour}
            isSunrise={isSunrise}
          />
        )
      )}
    </>
  );
}
