import React from 'react';
import RealisticRainStreaks from '../RealisticRainStreaks';
import RealisticSnowfall from '../RealisticSnowfall';
import WeatherEffects from '../WeatherEffects';

export default function WeatherEffectsSection({
  isRaining,
  isSnowing,
  isThunderstorm,
  isFoggy,
  isCloudy,
  isWindy,
  temperature,
  windSpeed,
  renderClouds,
  renderFog,
  renderLightning,
  renderWind
}) {
  return (
    <>
      {isRaining && (
        <>
          <RealisticRainStreaks
            count={isThunderstorm ? 1200 : 800}
            intensity={isThunderstorm ? 2.0 : 1.2}
            windSpeed={Math.min(windSpeed / 15, 0.6)}
            windDirection={Math.PI / 4}
            enabled={true}
            splashEnabled={!isThunderstorm || windSpeed < 25}
            color="#b8d4f0"
            area={{ x: 40, z: 40, height: 25 }}
          />
          <WeatherEffects
            fogEnabled={true}
            fogOpacity={isThunderstorm ? 0.2 : 0.12}
            lightningEnabled={isThunderstorm}
            lightningFrequency={0.025}
            cloudsEnabled={false}
            puddlesEnabled={false}
          />
          {renderFog()}
        </>
      )}
      {isSnowing && (
        <RealisticSnowfall
          count={temperature < -15 ? 900 : temperature < -5 ? 600 : 400}
          intensity={temperature < -15 ? 1.5 : temperature < -5 ? 1.0 : 0.7}
          windSpeed={Math.min(windSpeed / 50, 0.3)}
          windDirection={Math.PI / 6}
          enabled={true}
          renderMode={temperature < -15 ? 'simple' : 'detailed'}
          accumulation={temperature < -5}
          snowflakeSize={0.15}
          color="#ffffff"
          area={{ x: 50, z: 50, height: 30 }}
        />
      )}
      {(isCloudy || isThunderstorm || isRaining) && renderClouds()}
      {isThunderstorm && renderLightning()}
      {isFoggy && !isRaining && renderFog()}
      {isWindy && renderWind()}
    </>
  );
}
