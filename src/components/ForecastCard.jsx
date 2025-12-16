import React from 'react';
import { useTranslateWeatherDescription } from '../utils/translateWeatherDescription';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { convertTemperature, formatTemperatureDisplay } from '../services/weatherService';
import { useTime } from '../contexts/TimeContext';

export default function ForecastCard({ data, icon, cardClass, fontClass }) {
  const { t, language } = useLanguage();
  const { theme, temperatureUnit } = useTheme();
  const { formatDate } = useTime();

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

  // Маппинг кодов языков для toLocaleDateString
  const localeMap = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-PT',
    ru: 'ru-RU',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR'
  };

  const locale = localeMap[language] || 'en-US';
  
  const dayName = formatDate(data.dt, { locale, opts: { weekday: 'short' } });

  const translateWeatherDescription = useTranslateWeatherDescription();

  return (
    <div
      className={`glass-card-intense micro-bounce interactive-glow border border-white/30 p-6 rounded-2xl text-center transition-all duration-300 ${cardBg} ${cardClass || ''}`}
    >
      <div className="mb-3">
        <p className={`text-lg ${textMain} font-medium ${fontClass || ''}`}>
          {dayName}
        </p>
      </div>
      
      <div className={`mb-4 ${textMain}`}>
        {icon}
      </div>
      
      <div className="mb-2">
        <p className={`text-xl font-bold ${textMain} ${fontClass || ''}`}>
          {formatTemp(data.main.temp)}
        </p>
      </div>
      
      <div className="flex justify-between text-sm mb-3">
        <span className={`font-medium ${textSubtle}`}>
          {t('low')}: {formatTemp(data.main.temp_min)}
        </span>
        <span className={`font-medium ${textSubtle}`}>
          {t('high')}: {formatTemp(data.main.temp_max)}
        </span>
      </div>
      
      <p className={`text-sm capitalize truncate ${textSubtle}`}>
        {data.weather[0]?.description ? translateWeatherDescription(data.weather[0].description) : ''}
      </p>
    </div>
  );
}