import React from 'react';

export default function LightingSection({
  isNight,
  isRaining,
  isGoldenHour,
  isMistyCondition
}) {
  return (
    <>
      <ambientLight
        intensity={isMistyCondition ? 0.25 : (isRaining ? 0.15 : isNight ? 0.2 : isGoldenHour ? 0.4 : 0.6)}
        color={isNight ? "#2f3545" : "#FFFFFF"}
      />
      <directionalLight
        position={isNight ? [-6, 12, 4] : [10, 10, 5]}
        intensity={isMistyCondition ? 0.2 : (isRaining ? 0.15 : isNight ? 0.3 : 1)}
        color={isGoldenHour ? "#FF8C42" : (isNight ? "#7586a3" : "#FFFFFF")}
        castShadow
      />
    </>
  );
}
