import React from 'react';
import HourlyForecast from '../HourlyForecast';

export default function HourlySection({ hourlyData, currentView, getWeatherIcon, cardSecondary, cardTitle }) {
  if (!hourlyData || currentView !== 'hourly') return null;

  const hourlyList = Array.isArray(hourlyData) ? hourlyData : (hourlyData?.hourly || []);

  return (
    <HourlyForecast
      data={hourlyList}
      getWeatherIcon={getWeatherIcon}
      cardClass={cardSecondary}
      fontClass={cardTitle}
    />
  );
}
