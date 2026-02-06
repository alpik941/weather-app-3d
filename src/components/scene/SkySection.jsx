import React from 'react';
import { Sky, Stars } from '@react-three/drei';

export default function SkySection({
  isNight,
  isRaining,
  isSnowing,
  isCloudy,
  isMistyCondition,
  isGoldenHour
}) {
  return (
    <>
      {isNight && !isRaining && !isSnowing && !isCloudy && !isMistyCondition && (
        <Stars radius={100} depth={50} count={1200} factor={2.5} saturation={0} fade />
      )}
      {!isNight && !isCloudy && !isRaining && !isSnowing && !isMistyCondition && (
        <Sky
          distance={450000}
          sunPosition={[10, 10, -10]}
          inclination={0}
          azimuth={0.25}
          turbidity={isGoldenHour ? 8 : 10}
          rayleigh={isGoldenHour ? 2 : 1}
          mieCoefficient={isGoldenHour ? 0.005 : 0.002}
          mieDirectionalG={0.8}
        />
      )}
    </>
  );
}
