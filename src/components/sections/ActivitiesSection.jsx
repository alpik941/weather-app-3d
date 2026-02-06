import React from 'react';
import ActivityForecast from '../ActivityForecast';

export default function ActivitiesSection({ activityData, currentView, cardSecondary, cardTitle }) {
  if (!activityData || currentView !== 'activities') return null;

  return (
    <ActivityForecast data={activityData} cardClass={cardSecondary} fontClass={cardTitle} />
  );
}
