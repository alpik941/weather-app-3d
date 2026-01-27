import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { useTime } from '../contexts/TimeContext';
import { normalizeAlertsForDisplay } from '../services/weatherService';

/**
 * Format alert end time as human-readable string
 * Uses timezone-aware helpers from TimeContext
 */
const formatAlertTime = (endTimestamp, { formatTime, formatDate, dayKey }) => {
  if (!endTimestamp) return 'Unknown';

  const nowSeconds = Math.floor(Date.now() / 1000);
  const nowKey = dayKey(nowSeconds);
  const endKey = dayKey(endTimestamp);
  const secondsUntilEnd = endTimestamp - nowSeconds;

  if (!endKey) return 'Unknown';

  if (endKey === nowKey) {
    if (secondsUntilEnd <= 3 * 60 * 60) {
      return formatTime(endTimestamp);
    }
    const endDayLabel = formatDate(endTimestamp, { opts: { weekday: 'short' } });
    return `${endDayLabel} ${formatTime(endTimestamp)}`;
  }

  const endDayLabel = formatDate(endTimestamp, { opts: { weekday: 'short' } });
  const endTimeLabel = formatTime(endTimestamp);
  const tomorrowKey = dayKey(nowSeconds + 86400);

  if (endKey === tomorrowKey) {
    return `${endDayLabel} ${endTimeLabel}`;
  }

  const endDateLabel = formatDate(endTimestamp, { opts: { weekday: 'short', month: 'short', day: 'numeric' } });
  return `${endDateLabel} ${endTimeLabel}`;
};

/**
 * Get styling classes based on alert severity level
 */
const getAlertStyles = (severity = 'yellow') => {
  const styles = {
    red: {
      bg: 'bg-red-50/90 dark:bg-red-900/20',
      border: 'border-l-4 border-red-500',
      icon: 'text-red-500',
      title: 'text-red-800 dark:text-red-200',
      text: 'text-red-700 dark:text-red-300',
      time: 'text-red-600 dark:text-red-400',
      closeBtn: 'text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-800/30'
    },
    orange: {
      bg: 'bg-orange-50/90 dark:bg-orange-900/20',
      border: 'border-l-4 border-orange-500',
      icon: 'text-orange-500',
      title: 'text-orange-800 dark:text-orange-200',
      text: 'text-orange-700 dark:text-orange-300',
      time: 'text-orange-600 dark:text-orange-400',
      closeBtn: 'text-orange-500 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-800/30'
    },
    yellow: {
      bg: 'bg-yellow-50/90 dark:bg-yellow-900/20',
      border: 'border-l-4 border-yellow-500',
      icon: 'text-yellow-600',
      title: 'text-yellow-800 dark:text-yellow-200',
      text: 'text-yellow-700 dark:text-yellow-300',
      time: 'text-yellow-600 dark:text-yellow-400',
      closeBtn: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800/30'
    }
  };
  return styles[severity] || styles.yellow;
};

/**
 * WeatherAlerts component
 * Displays weather alerts/warnings with severity-based styling
 * 
 * @param {Object} props
 * @param {Array} props.alerts - array of alert objects
 * @param {function} props.onDismiss - callback when alert is closed (receives index)
 * @param {boolean} [props.showQueueInfo=false] - show queue length info
 * @param {function} [props.onAlertInteraction] - callback for analytics/logging
 */
export default function WeatherAlerts({ 
  alerts = [], 
  onDismiss,
  showQueueInfo = false,
  onAlertInteraction = null
}) {
  const { t } = useLanguage();
  const { formatDate, formatTime, dayKey } = useTime();

  const [localDismissedKeys, setLocalDismissedKeys] = useState([]);

  const getAlertKey = useCallback((alert) => {
    const eventKey = String(alert?.event ?? 'unknown');
    const endKey = alert?.end ?? 'noend';
    return `${eventKey}:${endKey}`;
  }, []);

  const displayAlerts = useMemo(() => {
    const normalized = normalizeAlertsForDisplay(alerts);
    if (!localDismissedKeys.length) return normalized;
    return normalized.filter((alert) => !localDismissedKeys.includes(getAlertKey(alert)));
  }, [alerts, localDismissedKeys, getAlertKey]);

  useEffect(() => {
    if (!localDismissedKeys.length) return;
    const currentKeys = new Set(alerts.map(getAlertKey));
    setLocalDismissedKeys((prev) => prev.filter((key) => currentKeys.has(key)));
  }, [alerts, localDismissedKeys.length, getAlertKey]);

  const handleDismiss = useCallback((alert, index) => {
    if (onAlertInteraction) {
      onAlertInteraction({ action: 'dismiss', index, alert });
    }
    const key = getAlertKey(alert);
    setLocalDismissedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    onDismiss?.(alert, index);
  }, [onDismiss, onAlertInteraction, getAlertKey]);

  const handleAlertClick = useCallback((index) => {
    if (onAlertInteraction) {
      onAlertInteraction({ action: 'view', index, alert: alerts[index] });
    }
  }, [alerts, onAlertInteraction]);

  if (!displayAlerts || displayAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-30 space-y-2 max-w-sm">
      <AnimatePresence>
        {displayAlerts.map((alert, index) => {
          const severity = alert.severity || 'yellow';
          const styles = getAlertStyles(severity);
          
          return (
            <motion.div
              key={`${alert.event}-${alert.end ?? 'noend'}`}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`${styles.bg} ${styles.border} backdrop-blur-xl p-5 rounded-lg relative cursor-pointer transition-shadow hover:shadow-lg`}
              onClick={() => handleAlertClick(index)}
            >
              {/* Кнопка закрытия в правом верхнем углу */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(alert, index);
                }}
                className={`${styles.closeBtn} absolute top-3 right-3 p-1.5 rounded-full transition-all flex-shrink-0 w-8 h-8 flex items-center justify-center`}
                aria-label="Close warning"
                title="Close warning"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start">
                <div className="flex items-start flex-1 pr-8">
                  <AlertTriangle className={`w-6 h-6 ${styles.icon} mr-4 mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <h4 className={`text-base font-bold ${styles.title}`}>
                      {alert.event}
                    </h4>
                    <p className={`text-sm ${styles.text} mt-2 line-clamp-2`}>
                      {alert.description}
                    </p>
                    <div className={`flex items-center mt-3 text-sm ${styles.time}`}>
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {t('until')} {formatAlertTime(alert.end, { formatTime, formatDate, dayKey })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional: Queue info */}
              {showQueueInfo && displayAlerts.length > 1 && (
                <div className={`mt-3 pt-3 border-t border-black/10 text-xs font-medium ${styles.time}`}>
                  {index + 1} of {displayAlerts.length} alerts
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}