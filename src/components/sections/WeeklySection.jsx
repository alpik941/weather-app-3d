import React from 'react';
import WeeklyForecast from '../WeeklyForecast';

export default function WeeklySection({ weeklyData, currentView, getWeatherIcon, cardSecondary, cardTitle }) {
  if (!weeklyData || currentView !== 'weekly') return null;

  return (
    <WeeklyForecast
      data={weeklyData.daily}
      getWeatherIcon={getWeatherIcon}
      cardClass={cardSecondary}
      fontClass={cardTitle}
    />
  );
}
