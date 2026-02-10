import React from 'react';
import { Sky, Stars } from '@react-three/drei';

export default function SkySection({
  isNight,
  timeOfDay = 'day',
  isRaining,
  isSnowing,
  isCloudy,
  isMistyCondition,
  isGoldenHour
}) {
  // Sky parameters based on time of day
  const getSkyParams = () => {
    switch (timeOfDay) {
      case 'sunrise':
        return {
          turbidity: 10,
          rayleigh: 2.5,
          mieCoefficient: 0.005,
          mieDirectionalG: 0.82,
          sunPosition: [-8, 4, 2] // Low in the east
        };
      case 'sunset':
        return {
          turbidity: 12,
          rayleigh: 3,
          mieCoefficient: 0.008,
          mieDirectionalG: 0.85,
          sunPosition: [8, 3, -2] // Low in the west
        };
      case 'day':
        return {
          turbidity: 10,
          rayleigh: 1,
          mieCoefficient: 0.002,
          mieDirectionalG: 0.8,
          sunPosition: [10, 10, -10] // High in the sky
        };
      default: // night
        return null;
    }
  };
  
  const skyParams = getSkyParams();
  
  return (
    <>
      {isNight && !isRaining && !isSnowing && !isCloudy && !isMistyCondition && (
        <Stars radius={100} depth={50} count={1200} factor={2.5} saturation={0} fade />
      )}
      {!isNight && !isCloudy && !isRaining && !isSnowing && !isMistyCondition && skyParams && (
        <Sky
          distance={450000}
          sunPosition={skyParams.sunPosition}
          inclination={0}
          azimuth={0.25}
          turbidity={skyParams.turbidity}
          rayleigh={skyParams.rayleigh}
          mieCoefficient={skyParams.mieCoefficient}
          mieDirectionalG={skyParams.mieDirectionalG}
        />
      )}
    </>
  );
}
