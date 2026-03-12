import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Droplets } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { convertTemperature } from '../services/weatherService';
import { convertWindSpeed, getWindSpeedUnit, formatWindSpeed } from '../utils/windSpeed';
import { useTime } from '../contexts/TimeContext';
import { dayKey } from '../utils/timeFormat';

const HourlyForecast = React.memo(function HourlyForecast({ data, getWeatherIcon, cardClass, fontClass }) {
  const { temperatureUnit, windSpeedUnit, theme } = useTheme();
  const { t, language } = useLanguage();
  const { timezone, formatTime, formatDate, dayKey: ctxDayKey } = useTime();

  // Theme-aware text color
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSubtle = theme === 'dark' ? 'text-white/70' : 'text-gray-600';
  const textAccent = theme === 'dark' ? 'text-white/90' : 'text-gray-800';
  const cardBg = theme === 'dark' ? 'bg-white/10' : 'bg-white/90';

  // Group hourly data by target timezone day key (YYYY-MM-DD) for accurate cross-zone grouping
  const sortedDays = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const keyStr = ctxDayKey ? ctxDayKey(item.dt) : dayKey(item.dt, timezone);
      if (!acc[keyStr]) acc[keyStr] = [];
      acc[keyStr].push(item);
      return acc;
    }, {});
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 3);
  }, [data, timezone, ctxDayKey]);

  const formatTemp = (tempC) => {
    const value = temperatureUnit === 'fahrenheit'
      ? convertTemperature(tempC, 'celsius', 'fahrenheit')
      : tempC;
    return Math.round(value);
  };

  // Concise day header: Today, Tomorrow, or weekday name
  const formatDayLabel = (keyStr) => {
    if (!keyStr) return '';
    const nowSec = Math.floor(Date.now() / 1000);
    const todayKey = ctxDayKey ? ctxDayKey(nowSec) : dayKey(nowSec, timezone);
    if (keyStr === todayKey) return t('today');
    const tomorrowSec = nowSec + 86400;
    const tomorrowKey = ctxDayKey ? ctxDayKey(tomorrowSec) : dayKey(tomorrowSec, timezone);
    if (keyStr === tomorrowKey) return t('tomorrow');
    const [y, m, d] = keyStr.split('-').map(Number);
    const midnightUTC = Math.floor(Date.UTC(y, m - 1, d) / 1000);
    return formatDate(midnightUTC, { locale: language, opts: { weekday: 'long' } });
  };


  return (
    <div className="mb-8">
      {/* ── Title ── */}
      <h2 className={`text-2xl mb-8 text-center flex items-center justify-center ${fontClass || textMain}`}>
        <Clock className="w-7 h-7 mr-3" />
        {t('threeDayHourly')}
      </h2>

      {/* ── Day sections ── */}
      <div className="space-y-3 sm:space-y-4">
        {sortedDays.map(([keyStr, dayData], dayIndex) => (
          <motion.div
            key={keyStr}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: dayIndex * 0.08 }}
            className={`p-3 sm:p-6 rounded-xl backdrop-blur-md ${cardClass || cardBg}`}
          >
            {/* Day label */}
            <h3 className={`text-base sm:text-lg mb-3 sm:mb-4 ${fontClass || textMain}`}>
              {formatDayLabel(keyStr)}
            </h3>

            {/* Horizontal scroll row */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <div className="flex space-x-2 sm:space-x-5 pb-2" style={{ minWidth: 'max-content' }}>
                {dayData.map((item, index) => {
                  const nowSec = Math.floor(Date.now() / 1000);
                  const isCurrentHour = dayIndex === 0 && Math.abs(item.dt - nowSec) < 3600;

                  return (
                    <motion.div
                      key={`${keyStr}-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: dayIndex * 0.08 + index * 0.03 }}
                      className={`
                        flex-shrink-0 text-center rounded-xl transition-colors
                        p-3 sm:p-5
                        min-w-[80px] sm:min-w-[110px]
                        ${isCurrentHour
                          ? 'bg-white/20 ring-2 ring-white/30'
                          : 'bg-white/10 hover:bg-white/15'}
                      `}
                    >
                      {/* Time / Now */}
                      <p className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${textMain}`}>
                        {isCurrentHour ? t('now') : formatTime(item.dt)}
                      </p>

                      {/* Weather icon */}
                      <div className={`mb-2 sm:mb-4 flex justify-center ${textMain}`}>
                        {getWeatherIcon(item.weather[0]?.main)}
                      </div>

                      {/* Temperature */}
                      <p className={`text-base sm:text-lg font-bold mb-2 sm:mb-3 ${textMain}`}>
                        {formatTemp(item.temp)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
                      </p>

                      {/* Rain % */}
                      <div className="flex items-center justify-center text-blue-200 text-xs sm:text-sm mb-1 sm:mb-2">
                        <Droplets className="w-3 h-3 mr-2" />
                        <span>{Math.round(item.pop * 100)}%</span>
                      </div>

                      {/* Wind */}
                      <p className={`text-xs sm:text-sm ${textSubtle}`}>
                        {formatWindSpeed(item.wind_speed, windSpeedUnit)} {getWindSpeedUnit(windSpeedUnit)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export default HourlyForecast;