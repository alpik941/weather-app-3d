import React, { useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sun, Navigation } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { convertWindSpeed, getWindSpeedUnit, formatWindSpeed } from '../utils/windSpeed';
import { useTranslateWeatherDescription } from '../utils/translateWeatherDescription';
import { convertTemperature, formatTemperatureDisplay } from '../services/weatherService';
import { useTime } from '../contexts/TimeContext';

const WeatherCard = React.memo(function WeatherCard({ data, icon }) {
  const { windSpeedUnit, temperatureUnit, theme } = useTheme();
  const { t } = useLanguage();
  const translateWeatherDescription = useTranslateWeatherDescription();
  const { timezone: tzFromCtx, hour12, formatTime: ctxFormatTime } = useTime();

  // Theme-aware text color
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSubtle = theme === 'dark' ? 'text-white/70' : 'text-gray-600';
  const textAccent = theme === 'dark' ? 'text-white/90' : 'text-gray-800';
  const cardBg = theme === 'dark' ? 'bg-white/10' : 'bg-white/90';

  const formatTemp = (tempC) => {
    const value = temperatureUnit === 'fahrenheit'
      ? convertTemperature(tempC, 'celsius', 'fahrenheit')
      : tempC;
    return formatTemperatureDisplay(temperatureUnit, value);
  };

  const timezone = useMemo(() => data.sys?.tz_id || data.timezone || tzFromCtx, [data?.sys?.tz_id, data?.timezone, tzFromCtx]);
  // Use TimeContext formatter so rollback applies; it will use context timezone, so nudge it by setting context tz in App.
  const formatTime = (timestamp, withSeconds = false) => ctxFormatTime(timestamp, { opts: withSeconds ? { second: '2-digit' } : undefined });

  const formatWind = (speedMs) => `${formatWindSpeed(speedMs, windSpeedUnit)} ${getWindSpeedUnit(windSpeedUnit)}`;

  // Map wind degrees (meteorological: where wind is coming FROM) to 16-point cardinal
  const degToCardinal = (deg) => {
    if (typeof deg !== 'number' || isNaN(deg)) return '';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N'];
    const idx = Math.round(((deg % 360) + 360) % 360 / 22.5);
    return dirs[idx] || 'N';
  };

  // Live local time (auto-updating every minute)
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Refs and anchors for sun alignment above sunrise/sunset labels
  const containerRef = useRef(null);
  const [sunAnchors, setSunAnchors] = useState({ start: null, end: null });
  useLayoutEffect(() => {
    const recalc = () => {
      try {
        const c = containerRef.current;
        if (!c) return;
        const cr = c.getBoundingClientRect();
        // Approximate arc endpoints using the SVG viewBox ratios (20 and 180 of width 200)
        const start = cr.width * 0.10;
        const end = cr.width * 0.90;
        setSunAnchors({ start, end });
      } catch {}
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // Rollback switch: set localStorage key 'weather-wind-block-disabled' = '1' to hide wind block (restores previous layout)
  const [showWindBlock] = useState(() => {
    try { return localStorage.getItem('weather-wind-block-disabled') !== '1'; } catch { return true; }
  });

  

  return (
    <div className={`${cardBg} mx-auto w-full max-w-md rounded-xl p-4 backdrop-blur-md sm:p-6`}>
      <div className="text-center">
        {/* Местоположение */}
        <div className="mb-3 flex items-center justify-center gap-2 sm:gap-3">
          <MapPin className={`h-5 w-5 sm:h-6 sm:w-6 ${textAccent}`} />
          <p className={`max-w-[220px] truncate text-base sm:max-w-none sm:text-lg ${textAccent}`}>{data.name}, {data.sys.country}</p>
        </div>

        {/* Current Local Time (time only) */}
        <div className="mb-3 sm:mb-4">
          <span className={`text-sm font-semibold sm:text-base ${textMain}`}>
            {formatTime(now, true)}
          </span>
        </div>

        {/* Температура */}
        <div className="mb-5 sm:mb-6">
          <div className={`mb-2 text-6xl sm:mb-3 sm:text-8xl ${textMain}`}>{formatTemp(data.main.temp)}</div>
          <p className={`text-base capitalize sm:text-lg ${textAccent}`}>
            {translateWeatherDescription(data.weather[0]?.description)}
          </p>
        </div>

        {/* Погодная иконка */}
        <div className={`mb-3 flex justify-center sm:mb-4 ${textMain}`}>{icon}</div>

        {/* Диапазон температур */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8">
          <div className={`flex-1 rounded-lg p-3 text-center backdrop-blur-md sm:p-4 ${cardBg}`}>
            <p className={`mb-1 text-xs sm:text-sm ${textSubtle}`}>{t('high')}</p>
            <p className={`text-lg sm:text-xl ${textMain}`}>{formatTemp(data.main.temp_max)}</p>
          </div>
          <div className={`flex-1 rounded-lg p-3 text-center backdrop-blur-md sm:p-4 ${cardBg}`}>
            <p className={`mb-1 text-xs sm:text-sm ${textSubtle}`}>{t('low')}</p>
            <p className={`text-lg sm:text-xl ${textMain}`}>{formatTemp(data.main.temp_min)}</p>
          </div>
        </div>

        {/* Wind Speed & Direction */}
        {showWindBlock && data.wind?.speed != null && (
          <div className={`mb-6 rounded-lg p-4 backdrop-blur-md sm:mb-8 ${cardBg}`}>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div>
                <p className={`mb-1 text-xs sm:text-sm ${textSubtle}`}>{t('windSpeed')}</p>
                <p className={`text-xl font-semibold sm:text-2xl ${textMain}`}>{formatWind(data.wind.speed)}</p>
                {typeof data.wind.deg === 'number' && (
                  <p className={`mt-1 text-xs sm:text-sm ${textSubtle}`}>
                    {degToCardinal(data.wind.deg)} · {Math.round(data.wind.deg)}°
                  </p>
                )}
              </div>
              {typeof data.wind.deg === 'number' && (
                <div className="flex items-center">
                  {/* Compass */}
                  <div className={`relative flex h-20 w-20 select-none items-center justify-center rounded-full border border-white/30 sm:h-24 sm:w-24 ${textSubtle}`}>
                    {/* Cardinal labels */}
                    <span className="absolute top-1 text-xs">N</span>
                    <span className="absolute right-1 text-xs">E</span>
                    <span className="absolute bottom-1 text-xs">S</span>
                    <span className="absolute left-1 text-xs">W</span>
                    {/* Pointer (shows where wind comes FROM) */}
                    <Navigation
                      className={`h-6 w-6 sm:h-7 sm:w-7 ${textMain}`}
                      style={{ transform: `rotate(${data.wind.deg}deg)` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        

        {/* Продолжительность дня + крайние точки (объединённый контейнер) */}
        <div className="mt-6 border-t border-white/30 pt-5 sm:mt-8 sm:pt-6">
          <div className={`relative rounded-lg p-4 backdrop-blur-md ${cardBg}`}>
            {/* Контейнер дуги */}
            <div className="relative mx-1 h-16 sm:mx-4 sm:h-20" ref={containerRef}>
              {/* Траектория дуги */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 80">
                <path
                  d="M 20 50 Q 100 5 180 50"
                  stroke="rgba(100, 100, 100, 0.4)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="6 6"
                />
              </svg>
              {/* Движущееся солнце */}
              <div
                className="absolute transition-all duration-1000 ease-in-out"
                style={{
                  left: (() => {
                    const nowSec = Date.now() / 1000;
                    const sunrise = data.sys.sunrise;
                    const sunset = data.sys.sunset;
                    let p = (nowSec - sunrise) / (sunset - sunrise);
                    p = Math.max(0, Math.min(1, p));
                    if (sunAnchors.start != null && sunAnchors.end != null) {
                      const px = sunAnchors.start + p * (sunAnchors.end - sunAnchors.start);
                      return `${px}px`;
                    }
                    // Fallback to percent if anchors not ready
                    return `${10 + (p * 80)}%`;
                  })(),
                  top: `${(() => {
                    const nowSec = Date.now() / 1000;
                    const sunrise = data.sys.sunrise;
                    const sunset = data.sys.sunset;
                    let p = (nowSec - sunrise) / (sunset - sunrise);
                    p = Math.max(0, Math.min(1, p));
                    // Smooth arc using sine: raise arc upward within container
                    const bottom = 70; // raise baseline so the arc sits higher
                    const peak = 16;   // slightly higher apex
                    const top = bottom - (bottom - peak) * Math.sin(Math.PI * p);
                    return top;
                  })()}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="relative">
                  <Sun className="h-6 w-6 text-yellow-300 sm:h-8 sm:w-8" />
                  <div className="absolute inset-0 h-6 w-6 rounded-full bg-yellow-300 opacity-40 blur-md sm:h-8 sm:w-8" />
                </div>
              </div>
            </div>
            {/* Метки суток — снизу */}
            <div className="mt-3">
              <div className="grid grid-cols-3 gap-2 items-start">
                <div className="text-left">
                  <div className={`mb-0.5 text-[11px] sm:text-xs ${textSubtle}`}>{t('sunrise')}</div>
                  <div className={`text-xs sm:text-sm ${textAccent}`}>{formatTime(data.sys.sunrise)}</div>
                </div>
                <div className="text-center">
                  <div className={`mb-0.5 text-[11px] sm:text-xs ${textSubtle}`}>{t('dayLength')}</div>
                  <div className={`text-sm sm:text-base ${textAccent}`}>
                    {Math.floor((data.sys.sunset - data.sys.sunrise) / 3600)}h {Math.floor(((data.sys.sunset - data.sys.sunrise) % 3600) / 60)}m
                  </div>
                </div>
                <div className="text-right">
                  <div className={`mb-0.5 text-[11px] sm:text-xs ${textSubtle}`}>{t('sunset')}</div>
                  <div className={`text-xs sm:text-sm ${textAccent}`}>{formatTime(data.sys.sunset)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini forecast removed as requested */}
      </div>
    </div>
  );
});

export default WeatherCard;
