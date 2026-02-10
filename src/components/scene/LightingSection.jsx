import React from 'react';
import { getLightingParams, applyRainyModifier, applyMistyModifier, getTimeOfDayVisuals } from '../../utils/timeOfDayVisuals';

export default function LightingSection({
  timeOfDay = 'day',
  weatherCondition = 'clear',
  isRaining = false,
  isMistyCondition = false
}) {
  // Get base lighting parameters from unified system
  let visuals = getTimeOfDayVisuals(timeOfDay);
  
  // Apply weather modifiers
  if (isMistyCondition) {
    visuals = applyMistyModifier(visuals);
  } else if (isRaining) {
    visuals = applyRainyModifier(visuals);
  }
  
  const { lighting } = visuals;
  
  return (
    <>
      <ambientLight
        intensity={lighting.ambient.intensity}
        color={lighting.ambient.color}
      />
      <directionalLight
        position={lighting.directional.position}
        intensity={lighting.directional.intensity}
        color={lighting.directional.color}
        castShadow
      />
      
      {/* Дополнительная подсветка для ночи (звездный свет) */}
      {timeOfDay === 'night' && (
        <hemisphereLight
          skyColor="#1A2238"
          groundColor="#0B1026"
          intensity={0.1}
        />
      )}
    </>
  );
}
