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
    <div className={`${cardBg} backdrop-blur-md p-6 rounded-xl max-w-md mx-auto`}>
      <div className="text-center">
        {/* Местоположение */}
        <div className="flex items-center justify-center mb-3">
          <MapPin className={`w-6 h-6 mr-3 ${textAccent}`} />
          <p className={`text-lg ${textAccent}`}>{data.name}, {data.sys.country}</p>
        </div>

        {/* Current Local Time (time only) */}
        <div className="mb-4">
          <span className={`${textMain} font-semibold`}>
            {formatTime(now, true)}
          </span>
        </div>

        {/* Температура */}
        <div className="mb-6">
          <div className={`text-8xl mb-3 ${textMain}`}>{formatTemp(data.main.temp)}</div>
          <p className={`text-lg capitalize ${textAccent}`}>
            {translateWeatherDescription(data.weather[0]?.description)}
          </p>
        </div>

        {/* Погодная иконка */}
        <div className={`${textMain} mb-3`}>{icon}</div>

        {/* Диапазон температур */}
        <div className="flex justify-between items-center mb-8">
          <div className={`text-center ${cardBg} backdrop-blur-md p-4 rounded-lg flex-1 mr-2`}>
            <p className={`text-sm mb-1 ${textSubtle}`}>{t('high')}</p>
            <p className={`text-xl font ${textMain}`}>{formatTemp(data.main.temp_max)}</p>
          </div>
          <div className={`text-center ${cardBg} backdrop-blur-md p-4 rounded-lg flex-1 ml-2`}>
            <p className={`text-sm mb-1 ${textSubtle}`}>{t('low')}</p>
            <p className={`text-xl font ${textMain}`}>{formatTemp(data.main.temp_min)}</p>
          </div>
        </div>

        {/* Wind Speed & Direction */}
        {showWindBlock && data.wind?.speed != null && (
          <div className={`mb-8 ${cardBg} backdrop-blur-md p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${textSubtle}`}>{t('windSpeed')}</p>
                <p className={`text-2xl font-semibold ${textMain}`}>{formatWind(data.wind.speed)}</p>
                {typeof data.wind.deg === 'number' && (
                  <p className={`mt-1 text-sm ${textSubtle}`}>
                    {degToCardinal(data.wind.deg)} · {Math.round(data.wind.deg)}°
                  </p>
                )}
              </div>
              {typeof data.wind.deg === 'number' && (
                <div className="flex items-center">
                  {/* Compass */}
                  <div className={`relative w-24 h-24 rounded-full border border-white/30 ${textSubtle} flex items-center justify-center select-none`}>
                    {/* Cardinal labels */}
                    <span className="absolute top-1 text-xs">N</span>
                    <span className="absolute right-1 text-xs">E</span>
                    <span className="absolute bottom-1 text-xs">S</span>
                    <span className="absolute left-1 text-xs">W</span>
                    {/* Pointer (shows where wind comes FROM) */}
                    <Navigation
                      className={`w-7 h-7 ${textMain}`}
                      style={{ transform: `rotate(${data.wind.deg}deg)` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        

        {/* Продолжительность дня + крайние точки (объединённый контейнер) */}
        <div className="mt-8 pt-6 border-t border-white/30">
          <div className={`relative ${cardBg} backdrop-blur-md p-4 rounded-lg`}>
            {/* Контейнер дуги */}
            <div className="relative h-20 mx-4" ref={containerRef}>
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
                  <Sun className="w-8 h-8 text-yellow-300" />
                  <div className="absolute inset-0 w-8 h-8 bg-yellow-300 rounded-full opacity-40 blur-md" />
                </div>
              </div>
            </div>
            {/* Метки суток — снизу */}
            <div className="mt-3">
              <div className="grid grid-cols-3 gap-2 items-start">
                <div className="text-left">
                  <div className={`text-xs mb-0.5 ${textSubtle}`}>{t('sunrise')}</div>
                  <div className={`${textAccent} text-sm`}>{formatTime(data.sys.sunrise)}</div>
                </div>
                <div className="text-center">
                  <div className={`text-xs mb-0.5 ${textSubtle}`}>{t('dayLength')}</div>
                  <div className={`text-base ${textAccent}`}>
                    {Math.floor((data.sys.sunset - data.sys.sunrise) / 3600)}h {Math.floor(((data.sys.sunset - data.sys.sunrise) % 3600) / 60)}m
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs mb-0.5 ${textSubtle}`}>{t('sunset')}</div>
                  <div className={`${textAccent} text-sm`}>{formatTime(data.sys.sunset)}</div>
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
