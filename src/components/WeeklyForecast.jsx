import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Droplets, Wind } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { convertTemperature } from '../services/weatherService';
import { useTranslateWeatherDescription } from '../utils/translateWeatherDescription';
import { convertWindSpeed, getWindSpeedUnit, formatWindSpeed } from '../utils/windSpeed';
import { useTime } from '../contexts/TimeContext';
import { dayKey } from '../utils/timeFormat';

const WeeklyForecast = React.memo(function WeeklyForecast({ data, getWeatherIcon, fontClass }) {
  const { temperatureUnit, windSpeedUnit, theme } = useTheme();
  const { t, language } = useLanguage();
  const translateWeatherDescription = useTranslateWeatherDescription();
  const { timezone, formatDate, dayKey: ctxDayKey } = useTime();

  // Theme-aware text color
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSubtle = theme === 'dark' ? 'text-white/70' : 'text-gray-600';
  const textAccent = theme === 'dark' ? 'text-white/90' : 'text-gray-800';
  const cardBg = theme === 'dark' ? 'bg-white/10' : 'bg-white/90';

  // Map app language to a BCP-47 locale for consistent i18n formatting
  const localeMap = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    ru: 'ru-RU',
    tr: 'tr-TR',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
  };
  const locale = localeMap[language] || language || undefined;

  const todayKey = useMemo(() => (ctxDayKey ? ctxDayKey(Date.now()/1000) : dayKey(Date.now()/1000, timezone)), [ctxDayKey, timezone]);
  const tomorrowKey = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return ctxDayKey ? ctxDayKey(Math.floor(tomorrow.getTime()/1000)) : dayKey(Math.floor(tomorrow.getTime()/1000), timezone);
  }, [ctxDayKey, timezone]);

  const labelForDay = (tsSeconds) => {
    const key = ctxDayKey ? ctxDayKey(tsSeconds) : dayKey(tsSeconds, timezone);
    if (key === todayKey) return t('today');
    if (key === tomorrowKey) return t('tomorrow');
    // derive weekday in target tz by formatting date only
    return formatDate(tsSeconds, { locale, opts: { weekday: 'long' } });
  };

  // Single, localized date label: Friday, October 24
  const fullDateLabel = (tsSeconds) => {
    const weekday = formatDate(tsSeconds, { locale, opts: { weekday: 'long' } });
    const monthDay = formatDate(tsSeconds, { locale, opts: { month: 'long', day: 'numeric' } });
    return `${weekday}, ${monthDay}`;
  };

  const formatTemp = (temp) => {
    const converted = temperatureUnit === 'fahrenheit' 
      ? convertTemperature(temp, 'celsius', 'fahrenheit')
      : temp;
    return Math.round(converted);
  };

  return (
    <div className="mb-8">
      <h2 className={`text-2xl mb-8 text-center flex items-center justify-center ${fontClass || textMain}`}>
        <Calendar className="w-7 h-7 mr-3" />
        {t('sevenDayForecast')}
      </h2>
      
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl">
        <div className="space-y-4">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`rounded-lg bg-white/10 backdrop-blur-md p-3 transition-colors hover:bg-white/15 sm:flex sm:items-center sm:justify-between sm:p-5 ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-3 sm:hidden">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`shrink-0 text-white ${textMain}`}>
                    {getWeatherIcon(item.weather[0]?.main)}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className={`text-xs sm:text-sm ${textSubtle}`}>
                      {fullDateLabel(item.dt)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center space-x-2">
                    <span className={`text-base font-bold sm:text-lg ${textMain}`}>
                      {formatTemp(item.temp.max)}°
                    </span>
                    <span className={`text-sm sm:text-base ${textSubtle}`}>
                      {formatTemp(item.temp.min)}°
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm capitalize ${textMain}`}>
                    {translateWeatherDescription(item.weather[0]?.description)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center space-x-3">
                  <div className="flex items-center text-xs text-blue-200">
                    <Droplets className="mr-1 h-3 w-3" />
                    <span>{Math.round(item.pop * 100)}%</span>
                  </div>
                  <div className="flex items-center text-xs text-white/70">
                    <Wind className="mr-1 h-3 w-3" />
                    <span>{formatWindSpeed(item.wind_speed, windSpeedUnit)} {getWindSpeedUnit(windSpeedUnit)}</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex sm:items-center sm:flex-1">
                <div className="text-left min-w-[180px]">
                  <p className={`text-sm ${textSubtle}`}>
                    {fullDateLabel(item.dt)}
                  </p>
                </div>
                
                <div className={`text-white mx-6 ${textMain}`}>
                  {getWeatherIcon(item.weather[0]?.main)}
                </div>
                
                <div className="flex-1 text-center">
                  <p className={`text-base capitalize ${textMain}`}>
                    {translateWeatherDescription(item.weather[0]?.description)}
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex sm:items-center sm:space-x-6">
                <div className="flex items-center text-blue-200 text-sm">
                  <Droplets className="w-4 h-4 mr-2" />
                  <span>{Math.round(item.pop * 100)}%</span>
                </div>
                
                <div className="flex items-center text-white/70 text-sm">
                  <Wind className="w-4 h-4 mr-2" />
                  <span>{formatWindSpeed(item.wind_speed, windSpeedUnit)} {getWindSpeedUnit(windSpeedUnit)}</span>
                </div>
                
                <div className="text-right min-w-[80px]">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${textMain}`}>
                      {formatTemp(item.temp.max)}°
                    </span>
                    <span className={`text-base ${textSubtle}`}>
                      {formatTemp(item.temp.min)}°
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default WeeklyForecast;