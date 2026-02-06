import React from 'react';
import WeatherAlerts from '../WeatherAlerts';

export default function WeatherAlertsSection({
  alerts = [],
  dismissedAlertsByLocation = {},
  locationKey,
  getAlertDismissKey,
  onDismiss,
  cardClass,
  fontClass
}) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const dismissed = dismissedAlertsByLocation[locationKey] || {};
  const visibleAlerts = alerts.filter((alert) => {
    const dismissKey = getAlertDismissKey(alert);
    const until = dismissed[dismissKey];
    return !(typeof until === 'number' && until > nowSeconds);
  });

  return (
    <WeatherAlerts
      alerts={visibleAlerts}
      onDismiss={onDismiss}
      cardClass={cardClass}
      fontClass={fontClass}
    />
  );
}
