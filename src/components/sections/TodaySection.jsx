import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Droplets, Eye, Thermometer, Sun as SunIcon, Activity, Gauge } from 'lucide-react';
import WeatherCard from '../WeatherCard';
import ForecastCard from '../ForecastCard';
import AstronomyPanel from '../AstronomyPanel';
import { formatWindSpeed, getWindSpeedUnit } from '../../utils/windSpeed';

export default function TodaySection({
  weatherData,
  forecastData,
  weeklyData,
  airQuality,
  currentView,
  t,
  ctxDayKey,
  getWeatherIcon,
  cardSecondary,
  cardTitle,
  cardHeader,
  cardCaption,
  temperatureUnit,
  windSpeedUnit
}) {
  const formatTemp = (temp) => Math.round(temp);

  return (
    <>
      <AnimatePresence mode="wait">
        {weatherData && currentView === 'today' && (
          <motion.div
            key={weatherData.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-8"
          >
            <WeatherCard
              data={weatherData}
              icon={getWeatherIcon(weatherData.weather?.[0]?.main)}
              airQuality={airQuality}
              cardClass={cardSecondary}
              fontClass={cardTitle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {weatherData && currentView === 'today' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-7"
        >
          <div className={`card-secondary text-center micro-bounce interactive-glow rounded-2xl p-5 sm:p-6 ${cardSecondary}`}>
            <Wind className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
            <p className={`typography-caption mb-2 break-words ${cardCaption}`}>{t('windSpeed')}</p>
            <p className={`typography-title break-words ${cardTitle}`}>
              {formatWindSpeed(weatherData.wind?.speed ?? 0, windSpeedUnit)} {getWindSpeedUnit(windSpeedUnit)}
            </p>
          </div>
          <div className={`card-secondary text-center micro-bounce interactive-glow rounded-2xl p-5 sm:p-6 ${cardSecondary}`}>
            <Droplets className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
            <p className={`typography-caption mb-2 break-words ${cardCaption}`}>{t('humidity')}</p>
            <p className={`typography-title break-words ${cardTitle}`}>{weatherData.main?.humidity}%</p>
          </div>
          <div className={`card-secondary text-center micro-bounce interactive-glow rounded-2xl p-5 sm:p-6 ${cardSecondary}`}>
            <Eye className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
            <p className={`typography-caption mb-2 break-words ${cardCaption}`}>{t('visibility')}</p>
            <p className={`typography-title break-words ${cardTitle}`}>{(weatherData.visibility / 1000).toFixed(1)} km</p>
          </div>
          <div className={`card-secondary text-center micro-bounce interactive-glow rounded-2xl p-5 sm:p-6 ${cardSecondary}`}>
            <Thermometer className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
            <p className={`typography-caption mb-2 break-words ${cardCaption}`}>{t('feelsLike')}</p>
            <p className={`typography-title break-words ${cardTitle}`}>{formatTemp(weatherData.main?.feels_like)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}</p>
          </div>
          <div className={`card-secondary text-center micro-bounce interactive-glow rounded-2xl p-5 sm:p-6 ${cardSecondary}`}>
            <Gauge className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
            <p className={`typography-caption mb-2 break-words ${cardCaption}`}>{t('pressure')}</p>
            <p className={`typography-title break-words ${cardTitle}`}>{weatherData.main?.pressure} hPa</p>
          </div>
          {airQuality && (
            <div className={`card-secondary text-center micro-bounce interactive-glow rounded-2xl p-5 sm:p-6 ${cardSecondary}`}>
              <Activity className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
              <p className={`typography-title break-words ${cardTitle}`}>
                {(() => {
                  const cat = airQuality?.index?.category;
                  const labelMap = {
                    good: t('aqiGood'),
                    moderate: t('aqiModerate'),
                    usg: t('aqiUSG'),
                    unhealthy: t('aqiUnhealthy'),
                    veryUnhealthy: t('aqiVeryUnhealthy'),
                    hazardous: t('aqiHazardous')
                  };
                  const label = labelMap[cat] || t('aqiModerate');
                  const scale = airQuality?.index?.scale;
                  const idx = airQuality?.index?.value;
                  let pct = null;
                  if (typeof idx === 'number') {
                    if (scale === 'us-epa') {
                      pct = Math.round(((6 - idx) / 5) * 100);
                    } else if (scale === 'openweather') {
                      pct = Math.round(((5 - idx) / 4) * 100);
                    }
                    if (pct != null) pct = Math.max(0, Math.min(100, pct));
                  }
                  return pct != null
                    ? `${t('airQuality')} ${label}, ${pct}%`
                    : `${t('airQuality')} ${label}`;
                })()}
              </p>
            </div>
          )}
          {typeof weatherData?.uv === 'number' && (
            <div className={`card-secondary text-center micro-bounce interactive-glow rounded-2xl p-5 sm:p-6 ${cardSecondary}`}>
              <SunIcon className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
              <p className={`typography-caption mb-2 break-words ${cardCaption}`}>{t('uvIndex')}</p>
              <p className={`typography-title break-words ${cardTitle}`}>
                {(() => {
                  const v = weatherData.uv;
                  let catKey = 'uvLow';
                  if (v >= 11) catKey = 'uvExtreme';
                  else if (v >= 8) catKey = 'uvVeryHigh';
                  else if (v >= 6) catKey = 'uvHigh';
                  else if (v >= 3) catKey = 'uvModerate';
                  return `${t(catKey)} (${v})`;
                })()}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {forecastData && currentView === 'today' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className={`typography-title mb-8 text-center gradient-text ${cardTitle}`}>{t('fiveDayForecast')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(() => {
              const list = forecastData?.list || [];
              const byDay = new globalThis.Map();
              for (const it of list) {
                const k = ctxDayKey ? ctxDayKey(it.dt) : new Date(it.dt * 1000).toISOString().slice(0,10);
                if (!byDay.has(k)) byDay.set(k, []);
                byDay.get(k).push(it);
              }
              const todayKey = ctxDayKey ? ctxDayKey(Math.floor(Date.now()/1000)) : new Date().toISOString().slice(0,10);
              const allKeysSorted = Array.from(byDay.keys()).sort();
              let futureKeys = allKeysSorted.filter(k => k >= todayKey).slice(0,5);
              let days = futureKeys.length === 5 ? futureKeys : allKeysSorted.slice(0,5);
              let daily = days.map((k) => {
                const arr = byDay.get(k);
                return arr[Math.floor(arr.length / 2)] || arr[0];
              });
              if (daily.length < 5 && weeklyData?.daily?.length) {
                const haveKeys = new Set(days);
                const needed = 5 - daily.length;
                const fillers = [];
                for (const d of weeklyData.daily) {
                  const key = ctxDayKey ? ctxDayKey(d.dt) : new Date(d.dt * 1000).toISOString().slice(0,10);
                  if (key >= todayKey && !haveKeys.has(key)) {
                    const avgTemp = (d.temp.max + d.temp.min) / 2;
                    fillers.push({
                      dt: d.dt,
                      main: { temp: avgTemp, temp_min: d.temp.min, temp_max: d.temp.max },
                      weather: d.weather,
                      wind: { speed: d.wind_speed },
                      pop: d.pop,
                    });
                    haveKeys.add(key);
                    if (fillers.length >= needed) break;
                  }
                }
                daily = daily.concat(fillers).slice(0,5);
              }
              return daily.map((item) => (
                <ForecastCard
                  key={item.dt}
                  data={item}
                  icon={getWeatherIcon(item.weather?.[0]?.main)}
                  cardClass={cardSecondary}
                  fontClass={cardTitle}
                />
              ));
            })()}
          </div>
          <div className="mt-10">
            <AstronomyPanel
              lat={weatherData?.coord?.lat}
              lon={weatherData?.coord?.lon}
              sunrise={weatherData?.sys?.sunrise ? new Date(weatherData.sys.sunrise * 1000) : null}
              sunset={weatherData?.sys?.sunset ? new Date(weatherData.sys.sunset * 1000) : null}
              timezone={weatherData?.sys?.tz_id || weatherData?.timezone}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}
