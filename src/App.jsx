import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Droplets, Eye, Thermometer, Sun, Moon, Cloud, CloudRain, CloudSnow, Zap, Settings, Map as MapIcon, Locate, Activity, Gauge } from 'lucide-react';
import { formatWindSpeed, getWindSpeedUnit } from './utils/windSpeed';
// Lazy-load WeatherScene to defer heavy three.js chunk until after initial UI
const WeatherSceneLazy = React.lazy(() => import('./components/WeatherScene'));
import WeatherCard from './components/WeatherCard';
import ForecastCard from './components/ForecastCard';
import SearchBar from './components/SearchBar';
import HourlyForecast from './components/HourlyForecast';
import WeeklyForecast from './components/WeeklyForecast';
import WeatherAlerts from './components/WeatherAlerts';
import ActivityForecast from './components/ActivityForecast';
import WeatherMap from './components/WeatherMap';
import SettingsPanel from './components/Settings/SettingsPanel';
import AstronomyPanel from './components/AstronomyPanel';
import { getWeatherData, getForecastData, getHourlyForecast, getWeeklyForecast, getWeatherAlerts, getActivityForecast, getCurrentLocation, getWeatherDataByCoords, getForecastDataByCoords, getAirQuality } from './services/weatherService';
import OnboardingOverlay from './components/Onboarding/OnboardingOverlay';
import { putCache, getCache } from './utils/offlineCache';
import { useTheme } from './contexts/ThemeContext';
import { useTime } from './contexts/TimeContext';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { theme, temperatureUnit, windSpeedUnit } = useTheme();
  const { t, language } = useLanguage();
  const { setTimezone, dayKey: ctxDayKey, timezone: appTimezone, formatTime, formatDate } = useTime();
  
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('London');
  const [isNight, setIsNight] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Removed dev-only rainy preview feature
  const [showMap, setShowMap] = useState(false);
  const [currentView, setCurrentView] = useState('today');
  const [error, setError] = useState(null);
  const [offlineUsed, setOfflineUsed] = useState(false);
  const [offlineTs, setOfflineTs] = useState(null);
  const [showTimeDiag] = useState(() => {
    try { return localStorage.getItem('weather-time-diag') === '1'; } catch { return false; }
  });

  useEffect(() => {
    fetchWeatherData(city);
    // eslint-disable-next-line
  }, [city, temperatureUnit]);

  useEffect(() => {
    if (weatherData) {
      // Determine local hour at the forecast location using TimeContext (handles IANA tz or numeric offset)
      try {
        const hh = String(formatTime(Date.now(), { hour12: false })).split(':')[0];
        const hour = parseInt(hh, 10);
        if (!isNaN(hour)) setIsNight(hour < 6 || hour >= 18);
      } catch {
        const hour = new Date().getHours();
        setIsNight(hour < 6 || hour >= 18);
      }
    }
  }, [weatherData, appTimezone, formatTime]);

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError(null);
    setOfflineUsed(false);
    setOfflineTs(null);
    try {
      const units = temperatureUnit === 'celsius' ? 'metric' : 'imperial';
      const [weather, forecast] = await Promise.all([
        getWeatherData(cityName, units),
        getForecastData(cityName, units)
      ]);
      
      setWeatherData(weather);
      // Propagate timezone to TimeContext (IANA tz_id if present, else numeric offset seconds)
      try {
        const tzCandidate = weather?.sys?.tz_id ?? weather?.timezone; // OpenWeather: timezone is seconds offset
        if (tzCandidate !== undefined && tzCandidate !== null) setTimezone(tzCandidate);
      } catch {}
      setForecastData(forecast);

      if (weather?.coord) {
        const [hourly, weekly, weatherAlerts, activities, aqi] = await Promise.all([
          getHourlyForecast(weather.coord.lat, weather.coord.lon, units),
          getWeeklyForecast(weather.coord.lat, weather.coord.lon, units),
          getWeatherAlerts(weather.coord.lat, weather.coord.lon),
          getActivityForecast(weather.coord.lat, weather.coord.lon, units),
          getAirQuality(weather.coord.lat, weather.coord.lon)
        ]);
        
        setHourlyData(hourly);
        setWeeklyData(weekly);
        setAlerts(weatherAlerts);
        setActivityData(activities);
        setAirQuality(aqi);

        // Cache the successful bundle snapshot per city for offline fallback
        try {
          const id = (cityName || '').toLowerCase();
          putCache('bundle', id, { ts: Date.now(), weather, forecast, hourly, weekly, alerts: weatherAlerts, activities, airQuality: aqi });
        } catch {}
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Try offline fallback by city name
      try {
        const id = (cityName || '').toLowerCase();
        const cached = getCache('bundle', id);
        if (cached && cached.payload) {
          const { weather, forecast, hourly, weekly, alerts: weatherAlerts, activities, airQuality: aqi } = cached.payload;
          setWeatherData(weather || null);
          setForecastData(forecast || null);
          setHourlyData(hourly || null);
          setWeeklyData(weekly || null);
          setAlerts(weatherAlerts || []);
          setActivityData(activities || null);
          setAirQuality(aqi || null);
          setOfflineUsed(true);
          setOfflineTs(cached.ts || Date.now());
        } else {
          setError(t('fetchError') || 'Failed to load weather data.');
        }
      } catch {
        setError(t('fetchError') || 'Failed to load weather data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFindMe = async () => {
    try {
      setLoading(true);
      setError(null);
      const location = await getCurrentLocation();

      // 1) Always fetch weather by coordinates for accuracy and timezone propagation
      const units = temperatureUnit === 'celsius' ? 'metric' : 'imperial';
  let weather, forecast, hourly, weekly, weatherAlerts, activities, aqi;
      try {
        [weather, forecast] = await Promise.all([
          getWeatherDataByCoords(location.lat, location.lon, units),
          getForecastDataByCoords(location.lat, location.lon, units)
        ]);
        setWeatherData(weather);
        try {
          const tzCandidate = weather?.sys?.tz_id ?? weather?.timezone;
          if (tzCandidate !== undefined && tzCandidate !== null) setTimezone(tzCandidate);
        } catch {}
        setForecastData(forecast);

        // Also pull hourly/weekly/alerts/activities by coords
        [hourly, weekly, weatherAlerts, activities, aqi] = await Promise.all([
          getHourlyForecast(location.lat, location.lon, units),
          getWeeklyForecast(location.lat, location.lon, units),
          getWeatherAlerts(location.lat, location.lon),
          getActivityForecast(location.lat, location.lon, units),
          getAirQuality(location.lat, location.lon)
        ]);
        setHourlyData(hourly);
        setWeeklyData(weekly);
        setAlerts(weatherAlerts);
        setActivityData(activities);
        setAirQuality(aqi);

        // Cache snapshot by coords key
        try {
          const coordsKey = `coords:${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
          const payload = { ts: Date.now(), weather, forecast, hourly, weekly, alerts: weatherAlerts, activities, airQuality: aqi };
          putCache('bundle', coordsKey, payload);
        } catch {}
      } catch (netErr) {
        // Offline fallback: use cached snapshot by coords key
        try {
          const coordsKey = `coords:${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
          const cached = getCache('bundle', coordsKey);
          if (cached && cached.payload) {
            const p = cached.payload;
            setWeatherData(p.weather || null);
            setForecastData(p.forecast || null);
            setHourlyData(p.hourly || null);
            setWeeklyData(p.weekly || null);
            setAlerts(p.alerts || []);
            setActivityData(p.activities || null);
            setAirQuality(p.airQuality || null);
            setOfflineUsed(true);
            setOfflineTs(cached.ts || Date.now());
          } else {
            setError(t('fetchError') || 'Failed to load weather data.');
          }
        } catch {
          setError(t('fetchError') || 'Failed to load weather data.');
        }
      }

      // 2) Resolve a nice display name if OpenWeather reverse geocoding key is available; otherwise fall back
      let displayName = null;
      try {
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (apiKey) {
          const lang = language || 'en';
          const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${location.lat}&lon=${location.lon}&limit=1&appid=${apiKey}&lang=${encodeURIComponent(lang)}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const g = data[0];
              const localName = (g.local_names && g.local_names[lang]) ? g.local_names[lang] : g.name;
              const parts = [localName];
              if (g.state && g.state !== g.name) parts.push(g.state);
              if (g.country) parts.push(g.country);
              displayName = parts.filter(Boolean).join(', ');
            }
          }
        }
      } catch {}

      // Prefer reverse-geocoded label, else provider city name, else coordinates
      const label = displayName || weather?.name || `${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`;
      setCity(label);

      // Also cache snapshot by label key for fetch-by-city offline fallback
      try {
        const labelKey = (label || '').toLowerCase();
        // Only cache if we have payload from this run (either network or a previously set cache)
        const coordsKey = `coords:${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
        const cached = getCache('bundle', coordsKey);
        if (cached && cached.payload) {
          putCache('bundle', labelKey, cached.payload);
        } else if (weather && forecast && hourly && weekly) {
          putCache('bundle', labelKey, { ts: Date.now(), weather, forecast, hourly, weekly, alerts: weatherAlerts || [], activities: activities || null, airQuality: aqi || null });
        }
      } catch {}
    } catch (error) {
      console.error('Error getting location:', error);
      alert(t('locationError') || 'Unable to get your location. Please check your browser permissions.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'clear': isNight ? <Moon className="w-8 h-8" /> : <Sun className="w-8 h-8" />,
      'clouds': <Cloud className="w-8 h-8" />,
      'rain': <CloudRain className="w-8 h-8" />,
      'snow': <CloudSnow className="w-8 h-8" />,
      'thunderstorm': <Zap className="w-8 h-8" />,
      'default': <Sun className="w-8 h-8" />
    };
    return iconMap[condition?.toLowerCase()] || iconMap['default'];
  };

  const getBackgroundGradient = (condition) => {
    const hour = new Date().getHours();
    const isEarlyMorning = hour >= 5 && hour < 9;
    const isLateEvening = hour >= 18 && hour < 22;
    const isDayTime = hour >= 9 && hour < 18;

    // --- FIX: Always return a value in every branch ---
    const lightGradients = {
      'clear': (() => {
        if (isNight) {
          return 'from-indigo-900 via-purple-900 to-pink-800';
        } else if (isEarlyMorning) {
          return 'from-orange-200 via-yellow-100 to-blue-100';
        } else if (isLateEvening) {
          return 'from-orange-300 via-pink-200 to-purple-200';
        } else if (isDayTime) {
          return 'from-sky-100 via-blue-50 to-cyan-50';
        }
        return 'from-blue-100 via-sky-50 to-cyan-50';
      })(),
      'clouds': (() => {
        if (isDayTime) {
          return 'from-gray-100 via-slate-50 to-blue-50';
        } else if (isEarlyMorning || isLateEvening) {
          return 'from-gray-200 via-slate-100 to-blue-100';
        }
        return 'from-gray-300 via-gray-200 to-slate-100';
      })(),
      'rain': (() => {
        if (isDayTime) {
          return 'from-slate-200 via-gray-100 to-blue-100';
        } else if (isEarlyMorning || isLateEvening) {
          return 'from-slate-300 via-gray-200 to-blue-200';
        }
        return 'from-gray-400 via-slate-300 to-blue-200';
      })(),
      'snow': (() => {
        if (isDayTime) {
          return 'from-blue-50 via-white to-gray-50';
        } else if (isEarlyMorning || isLateEvening) {
          return 'from-blue-100 via-white to-gray-100';
        }
        return 'from-blue-100 via-white to-gray-100';
      })(),
      'thunderstorm': (() => {
        if (isDayTime) {
          return 'from-gray-300 via-slate-200 to-purple-100';
        } else if (isEarlyMorning || isLateEvening) {
          return 'from-gray-400 via-slate-300 to-purple-200';
        }
        return 'from-gray-500 via-slate-400 to-purple-300';
      })(),
      'default': 'from-sky-50 via-blue-25 to-cyan-25'
    };

    const darkGradients = {
      'clear': 'from-gray-900 via-blue-900 to-purple-900',
      'clouds': 'from-gray-800 via-gray-900 to-black',
      'rain': 'from-gray-900 via-blue-900 to-indigo-900',
      'snow': 'from-gray-700 via-gray-800 to-gray-900',
      'thunderstorm': 'from-black via-purple-900 to-indigo-900',
      'default': 'from-gray-900 via-blue-900 to-purple-900'
    };

    const gradients = theme === 'dark' ? darkGradients : lightGradients;
    return gradients[condition?.toLowerCase()] || gradients['default'];
  };

  // --- FIX: Card and font color for light theme ---
  // Add utility classes for light theme to ensure visibility
  const cardBase =
    theme === 'dark'
      ? 'bg-white/20 border-white/30 text-white'
      : 'bg-white/90 border-gray-200 text-gray-900 shadow-lg';

  const cardSecondary =
    theme === 'dark'
      ? 'bg-white/20 border-white/30 text-white'
      : 'bg-white/80 border-gray-200 text-gray-900 shadow';

  const cardHeader =
    theme === 'dark'
      ? 'text-gray-800 dark:text-white'
      : 'text-gray-900';

  const cardSubtitle =
    theme === 'dark'
      ? 'text-gray-600 dark:text-white/90'
      : 'text-gray-600';

  const cardCaption =
    theme === 'dark'
      ? 'text-gray-600 dark:text-white/80'
      : 'text-gray-700';

  const cardTitle =
    theme === 'dark'
      ? 'text-gray-800 dark:text-white'
      : 'text-gray-900';

  const formatTemp = (temp) => {
    return Math.round(temp);
  };

  // Map wind degrees to 16-point cardinal
  const degToCardinal = (deg) => {
    if (typeof deg !== 'number' || isNaN(deg)) return '';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N'];
    const idx = Math.round((((deg % 360) + 360) % 360) / 22.5);
    return dirs[idx] || 'N';
  };

  const dismissAlert = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient('clear')} flex items-center justify-center transition-all duration-1000`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/30"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/70 border-t-white mx-auto"></div>
          <p className="text-gray-700 dark:text-white text-center mt-4 font-medium">{t('loading') || 'Loading weather data...'}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300">
        <div className="p-8 bg-white rounded-xl shadow-lg">
          <p className="text-red-700 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient(weatherData?.weather?.[0]?.main || 'clear')} transition-all duration-1000`}>
      {/* Weather Alerts */}
      <WeatherAlerts alerts={alerts} onDismiss={dismissAlert} cardClass={cardBase} fontClass={cardTitle} />

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            onCitySelect={setCity}
            cardClass={cardBase}
            fontClass={cardTitle}
          />
        )}
      </AnimatePresence>

      {/* Weather Map */}
      <AnimatePresence>
        {showMap && weatherData && (
          <WeatherMap
            isOpen={showMap}
            onClose={() => setShowMap(false)}
            lat={weatherData?.coord?.lat}
            lon={weatherData?.coord?.lon}
            city={weatherData?.name}
            cardClass={cardBase}
            fontClass={cardTitle}
          />
        )}
      </AnimatePresence>

      {/* 3D Weather Scene Background (lazy) */}
      <div className="fixed inset-0 z-0">
        <React.Suspense fallback={null}>
          <WeatherSceneLazy 
            weather={weatherData?.weather?.[0]?.main}
            temperature={weatherData?.main?.temp}
            humidity={weatherData?.main?.humidity}
            windSpeed={weatherData?.wind?.speed}
            isNight={isNight}
            cloudCoverage={weatherData?.clouds?.all ? weatherData.clouds.all / 100 : 0}
            sunrise={weatherData?.sys?.sunrise ? weatherData.sys.sunrise * 1000 : undefined}
            sunset={weatherData?.sys?.sunset ? weatherData.sys.sunset * 1000 : undefined}
            currentTime={Date.now()}
          />
        </React.Suspense>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Onboarding overlay (one-time) */}
        <OnboardingOverlay />
        {/* Offline snapshot banner */}
        {offlineUsed && (
          <div className="mb-3 px-3 py-2 rounded bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs inline-flex items-center">
            <span className="mr-2">{t('offlineSnapshot') || 'Offline snapshot'}</span>
            {offlineTs && (
              <span>
                {formatDate(Math.floor(offlineTs/1000), { opts: { month: 'short', day: 'numeric' } })}
                {', '}
                {formatTime(Math.floor(offlineTs/1000))}
              </span>
            )}
          </div>
        )}
        {showTimeDiag && (
          <div className="fixed top-2 right-2 z-50 text-xs px-2 py-1 rounded bg-black/50 text-white">
            tz: {String(appTimezone || '')}
          </div>
        )}
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="text-center flex-1">
            <h1 className={`typography-hero mb-4 drop-shadow-2xl micro-pulse ${cardHeader}`}>
              {t('appTitle')}
            </h1>
            <p className={`typography-subtitle ${cardSubtitle} shimmer-effect`}>{t('subtitle') || 'Advanced 3D Weather Experience'}</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleFindMe}
              className={`neuro-button p-4 micro-bounce interactive-glow ${theme === 'dark' ? 'bg-white/20 border-white/30 text-white' : 'bg-white/90 border-gray-200 text-gray-900'} hover:bg-white/70 transition-all duration-300`}
              title={t('findLocation') || 'Find My Location'}
              aria-label={t('findLocation') || 'Find My Location'}
            >
              <Locate className={`w-6 h-6 weather-icon ${cardHeader}`} />
            </button>
            
            {weatherData && (
              <button
                onClick={() => setShowMap(true)}
                className={`neuro-button p-4 micro-bounce interactive-glow ${theme === 'dark' ? 'bg-white/20 border-white/30 text-white' : 'bg-white/90 border-gray-200 text-gray-900'} hover:bg-white/70 transition-all duration-300`}
                title={t('showOnMap') || 'Show on Map'}
                aria-label={t('showOnMap') || 'Show on Map'}
              >
                <MapIcon className={`w-6 h-6 weather-icon ${cardHeader}`} />
              </button>
            )}
            
            <button
              onClick={() => setShowSettings(true)}
              className={`neuro-button p-4 micro-bounce interactive-glow ${cardBase} hover:bg-white/70 transition-all duration-300`}
              title={t('settings') || 'Settings'}
              aria-label={t('settings') || 'Settings'}
            >
              <Settings className={`w-6 h-6 weather-icon ${cardHeader}`} />
            </button>
          </div>
        </motion.header>

        {/* RainyPreview removed */}

        {/* Search Bar */}
        <SearchBar onSearch={setCity} onLocationRequest={handleFindMe} cardClass={cardBase} fontClass={cardTitle} />

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className={`glass-card-intense p-3 rounded-3xl flex space-x-3 overflow-x-auto ${cardBase}`}>
            {[
              { key: 'today', label: t('today'), icon: Sun },
              { key: 'hourly', label: t('hourly'), icon: Activity },
              { key: 'weekly', label: t('weekly'), icon: Cloud },
              { key: 'activities', label: t('activities'), icon: Activity }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`flex items-center px-6 py-3 rounded-2xl transition-all duration-400 whitespace-nowrap micro-bounce ${
                  currentView === key
                    ? `${cardBase} shadow-lg glow-animation backdrop-blur-sm`
                    : `${cardSecondary} hover:bg-white/60 interactive-scale`
                }`}
                aria-label={label}
              >
                <Icon className={`w-5 h-5 mr-3 weather-icon ${cardHeader}`} />
                <span className="typography-caption font-semi">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Weather Card */}
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
                cardClass={cardBase}
                fontClass={cardTitle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weather Details Grid - Today View */}
        {weatherData && currentView === 'today' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8"
          >
            <div className={`card-secondary text-center micro-bounce interactive-glow p-6 rounded-2xl ${cardSecondary}`}>
              <Wind className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
              <p className={`typography-caption mb-2 ${cardCaption}`}>{t('windSpeed')}</p>
              <p className={`typography-title ${cardTitle}`}>
                {formatWindSpeed(weatherData.wind?.speed ?? 0, windSpeedUnit)} {getWindSpeedUnit(windSpeedUnit)}
              </p>
              {/* Wind direction removed per request */}
            </div>
            <div className={`card-secondary text-center micro-bounce interactive-glow p-6 rounded-2xl ${cardSecondary}`}>
              <Droplets className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
              <p className={`typography-caption mb-2 ${cardCaption}`}>{t('humidity')}</p>
              <p className={`typography-title ${cardTitle}`}>{weatherData.main?.humidity}%</p>
            </div>
            <div className={`card-secondary text-center micro-bounce interactive-glow p-6 rounded-2xl ${cardSecondary}`}>
              <Eye className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
              <p className={`typography-caption mb-2 ${cardCaption}`}>{t('visibility')}</p>
              <p className={`typography-title ${cardTitle}`}>{(weatherData.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div className={`card-secondary text-center micro-bounce interactive-glow p-6 rounded-2xl ${cardSecondary}`}>
              <Thermometer className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
              <p className={`typography-caption mb-2 ${cardCaption}`}>{t('feelsLike')}</p>
              <p className={`typography-title ${cardTitle}`}>{formatTemp(weatherData.main?.feels_like)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}</p>
            </div>
            <div className={`card-secondary text-center micro-bounce interactive-glow p-6 rounded-2xl ${cardSecondary}`}>
              <Gauge className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
              <p className={`typography-caption mb-2 ${cardCaption}`}>{t('pressure')}</p>
              <p className={`typography-title ${cardTitle}`}>{weatherData.main?.pressure} hPa</p>
            </div>
            {airQuality && (
              <div className={`card-secondary text-center micro-bounce interactive-glow p-6 rounded-2xl ${cardSecondary}`}>
                <Activity className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
                <p className={`typography-title ${cardTitle}`}>
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
                    // Derive a user-friendly percentage: 100% = best air, 0% = worst
                    const scale = airQuality?.index?.scale;
                    const idx = airQuality?.index?.value;
                    let pct = null;
                    if (typeof idx === 'number') {
                      if (scale === 'us-epa') {
                        // 1 (best) .. 6 (worst)
                        pct = Math.round(((6 - idx) / 5) * 100);
                      } else if (scale === 'openweather') {
                        // 1 (best) .. 5 (worst)
                        pct = Math.round(((5 - idx) / 4) * 100);
                      }
                      // clamp
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
              <div className={`card-secondary text-center micro-bounce interactive-glow p-6 rounded-2xl ${cardSecondary}`}>
                <Sun className={`w-10 h-10 mx-auto mb-3 weather-icon micro-rotate ${cardHeader}`} />
                <p className={`typography-caption mb-2 ${cardCaption}`}>{t('uvIndex')}</p>
                <p className={`typography-title ${cardTitle}`}>
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

        {/* 5-Day Forecast - Today View */}
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
                // Group by forecast-location day key using TimeContext (handles IANA or numeric offset)
                const byDay = new globalThis.Map();
                for (const it of list) {
                  const k = ctxDayKey ? ctxDayKey(it.dt) : new Date(it.dt * 1000).toISOString().slice(0,10);
                  if (!byDay.has(k)) byDay.set(k, []);
                  byDay.get(k).push(it);
                }
                // Pick a representative item per day (middle 3-hour slot)
                // Prefer days from today forward in target timezone
                const todayKey = ctxDayKey ? ctxDayKey(Math.floor(Date.now()/1000)) : new Date().toISOString().slice(0,10);
                const allKeysSorted = Array.from(byDay.keys()).sort();
                let futureKeys = allKeysSorted.filter(k => k >= todayKey).slice(0,5);
                let days = futureKeys.length === 5 ? futureKeys : allKeysSorted.slice(0,5);
                let daily = days.map((k) => {
                  const arr = byDay.get(k);
                  return arr[Math.floor(arr.length / 2)] || arr[0];
                });
                // If we still have fewer than 5 days (e.g., free WeatherAPI returns only 3),
                // backfill using weeklyData.daily where available.
                if (daily.length < 5 && weeklyData?.daily?.length) {
                  const haveKeys = new Set(days);
                  const needed = 5 - daily.length;
                  const fillers = [];
                  for (const d of weeklyData.daily) {
                    const key = ctxDayKey ? ctxDayKey(d.dt) : new Date(d.dt * 1000).toISOString().slice(0,10);
                    if (key >= todayKey && !haveKeys.has(key)) {
                      // Synthesize an OW-like list item from weekly daily data
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
            {/* Astronomy Panel */}
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

        {/* Hourly Forecast View */}
        {hourlyData && currentView === 'hourly' && (
          (() => {
            // hourlyData may be either { hourly: [...] , timezone } or directly an array (from some cached payloads).
            const hourlyList = Array.isArray(hourlyData) ? hourlyData : (hourlyData?.hourly || []);
            return (
              <HourlyForecast
                data={hourlyList}
                getWeatherIcon={getWeatherIcon}
                cardClass={cardSecondary}
                fontClass={cardTitle}
              />
            );
          })()
        )}

        {/* Weekly Forecast View */}
        {weeklyData && currentView === 'weekly' && (
          <WeeklyForecast
            data={weeklyData.daily}
            getWeatherIcon={getWeatherIcon}
            cardClass={cardSecondary}
            fontClass={cardTitle}
          />
        )}

        {/* Activity Forecast View */}
        {activityData && currentView === 'activities' && (
          <ActivityForecast data={activityData} cardClass={cardSecondary} fontClass={cardTitle} />
        )}
      </div>
    </div>
  );
}

export default App;