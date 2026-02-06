import React from 'react';
import { AnimatePresence } from 'framer-motion';
import WeatherMap from '../WeatherMap';

export default function MapSection({ showMap, onClose, weatherData, cardClass, fontClass }) {
  return (
    <AnimatePresence>
      {showMap && weatherData && (
        <WeatherMap
          isOpen={showMap}
          onClose={onClose}
          lat={weatherData?.coord?.lat}
          lon={weatherData?.coord?.lon}
          city={weatherData?.name}
          cardClass={cardClass}
          fontClass={fontClass}
        />
      )}
    </AnimatePresence>
  );
}
