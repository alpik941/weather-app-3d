import React, { useRef } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function Sun3D({ temperature, isVisible = true, isGoldenHour = false, isSunrise = false }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (ref.current && isVisible) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const sunColor = isGoldenHour
    ? "#FFB347"
    : (temperature > 30 ? "#FF6B35" : temperature > 20 ? "#FFD700" : "#FFA500");

  const yPosition = isGoldenHour ? 6 : 15;
  const xPosition = isSunrise ? 18 : 15;
  const intensity = isGoldenHour ? 2.5 : 0.5;

  if (!isVisible) return null;

  return (
    <Sphere
      ref={ref}
      args={[2, 64, 64]}
      position={[xPosition, yPosition, -20]}
    >
      <meshStandardMaterial
        color={sunColor}
        emissive={sunColor}
        emissiveIntensity={intensity}
        roughness={0.1}
        metalness={0.1}
      />
    </Sphere>
  );
}
