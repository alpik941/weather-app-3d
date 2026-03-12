import React from 'react';
import { Sun, Moon, Thermometer, Globe } from 'lucide-react';
import { useTime } from '../../../contexts/TimeContext';

export default function UnitsSection({
  t,
  theme,
  temperatureUnit,
  windSpeedUnit,
  toggleTheme,
  toggleTemperatureUnit,
  setWindSpeedUnit,
  language,
  setLanguage,
  languages,
  apiStatus
}) {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('appearance')}</h3>
        <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-yellow-500 mr-3" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400 mr-3" />
            )}
            <span className="min-w-0 break-words text-gray-700 dark:text-gray-300">
              {theme === 'light' ? t('lightMode') : t('darkMode')}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('temperatureHeader')}</h3>
        <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center">
            <Thermometer className="w-5 h-5 text-red-500 mr-3" />
            <span className="min-w-0 break-words text-gray-700 dark:text-gray-300">
              {temperatureUnit === 'celsius' ? t('celsiusUnit') : t('fahrenheitUnit')}
            </span>
          </div>
          <button
            onClick={toggleTemperatureUnit}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              temperatureUnit === 'fahrenheit' ? 'bg-red-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                temperatureUnit === 'fahrenheit' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('windSpeed')}</h3>
        <div className="space-y-2">
          {[
            { value: 'ms', label: t('wind_ms_label') },
            { value: 'kmh', label: t('wind_kmh_label') },
            { value: 'mph', label: t('wind_mph_label') },
            { value: 'kn', label: t('wind_kn_label') },
            { value: 'points', label: t('wind_points_label') }
          ].map((unit) => (
            <button
              key={unit.value}
              onClick={() => setWindSpeedUnit(unit.value)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left ${
                windSpeedUnit === unit.value
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <span className="min-w-0 flex-1 break-words text-sm sm:text-base">{unit.label}</span>
              {windSpeedUnit === unit.value && (
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('visualizations') || 'Visualizations'}</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 break-words">{t('apiKeyStatus') || 'API Key Status'}</span>
              <span className={`inline-flex w-fit px-2 py-1 rounded-full text-xs ${apiStatus.ok ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {apiStatus.ok ? (t('apiOk') || 'OK') : (t('apiMissing') || 'Missing')}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${apiStatus.weatherApi ? 'bg-green-500' : 'bg-red-500'}`} />
                WeatherAPI.com
              </div>
              <div className="flex items-center mt-1">
                <span className={`w-2 h-2 rounded-full mr-2 ${apiStatus.openWeather ? 'bg-green-500' : 'bg-red-500'}`} />
                OpenWeatherMap
              </div>
            </div>
          </div>
        </div>
      </div>

      <TimeFormatSection t={t} />
      <TimeSystemFlags t={t} />

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('language')}</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                language === lang.code
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <span className="text-xl shrink-0">{lang.flag}</span>
              <span className="min-w-0 flex-1 break-words text-left">{lang.name}</span>
              {language === lang.code && (
                <Globe className="ml-auto h-4 w-4 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function TimeFormatSection({ t }) {
  const { hour12, toggleHour12, setHour12 } = useTime();
  const currentMode = hour12 === true ? '12h' : hour12 === false ? '24h' : 'auto';
  const nextLabel = currentMode === '12h' ? '24h' : currentMode === '24h' ? t('auto') : '12h';
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('timeFormat')}</h3>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col">
          <span className="text-gray-700 dark:text-gray-300 font-medium">{t('timeDisplay')}</span>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 break-words">
            {currentMode === '12h' && t('timeFormat12hDesc')}
            {currentMode === '24h' && t('timeFormat24hDesc')}
            {currentMode === 'auto' && t('timeFormatAutoDesc')}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2 sm:gap-2">
          <button
            onClick={toggleHour12}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-normal break-words"
          >
            {t('cycle')} ({nextLabel})
          </button>
          <select
            value={currentMode}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '12h') setHour12(true); else if (v === '24h') setHour12(false); else setHour12(undefined);
            }}
            className="p-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
          >
            <option value="auto">{t('auto')}</option>
            <option value="12h">12h</option>
            <option value="24h">24h</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function TimeSystemFlags({ t }) {
  const { rollback, setRollback } = useTime();
  const showRollback = (import.meta.env && import.meta.env.DEV) || rollback;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('advancedTime')}</h3>
      <div className="space-y-3">
        {showRollback && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300 min-w-0">
              {t('rollbackMode')}
              <div className="mt-1 break-words text-xs text-gray-500 dark:text-gray-400">{t('rollbackDesc')}</div>
            </div>
            <button
              onClick={() => setRollback(!rollback)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rollback ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rollback ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
