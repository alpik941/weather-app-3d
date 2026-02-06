import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Cloud, CloudRain, CloudSnow, Zap, Settings, Map as MapIcon, Locate } from 'lucide-react';
// Lazy-load WeatherScene to defer heavy three.js chunk until after initial UI
const WeatherSceneLazy = React.lazy(() => import('./components/WeatherScene'));
import SearchBar from './components/SearchBar';
import { getWeatherData, getForecastData, getHourlyForecast, getWeeklyForecast, getWeatherAlerts, getActivityForecast, getCurrentLocation, getWeatherDataByCoords, getForecastDataByCoords, getAirQuality, getValidationErrors, clearValidationErrors, validateAlertConsistency } from './services/weatherService';
import OnboardingOverlay from './components/Onboarding/OnboardingOverlay';
import ValidationErrorModal from './components/ValidationErrorModal';
import WeatherAlertsSection from './components/sections/WeatherAlertsSection';
import SettingsSection from './components/sections/SettingsSection';
import MapSection from './components/sections/MapSection';
import ViewToggle from './components/sections/ViewToggle';
import TodaySection from './components/sections/TodaySection';
import HourlySection from './components/sections/HourlySection';
import WeeklySection from './components/sections/WeeklySection';
import ActivitiesSection from './components/sections/ActivitiesSection';
import { putCache, getCache } from './utils/offlineCache';
import { useTheme } from './contexts/ThemeContext';
import { useTime } from './contexts/TimeContext';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const { theme, temperatureUnit, windSpeedUnit } = useTheme();
  const { t, language } = useLanguage();
  const { setTimezone, dayKey: ctxDayKey, timezone: appTimezone, formatTime, formatDate } = useTime();

  // When we set `city` as a display label from geolocation, we don't want to
  // immediately re-fetch by that string (it may include commas/state/country).
  const skipNextCityFetchRef = React.useRef(false);
  
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlertsByLocation, setDismissedAlertsByLocation] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
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

  const fetchWeatherData = React.useCallback(async (cityName) => {
    setLoading(true);
    setError(null);
    setOfflineUsed(false);
    setOfflineTs(null);
    clearValidationErrors(); // Clear previous validation errors
    
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
        
        // DEMO: Add rainfall warning for Vancouver
        const rainfallWarning = {
          event: 'Rainfall Warning',
          severity: 'orange',
          description: 'A long episode of rain, at times heavy, is expected. Total rainfall amounts of 80 to 120 mm. Rain will become heavy this evening, with 40 to 60 mm expected by Thursday morning. Rain will ease Thursday morning, then intensify again Thursday evening with an additional 40 to 60 mm expected by Friday afternoon. Water will likely pool on roads and in low-lying areas.',
          end: Math.floor(new Date('2026-01-29T21:06:00').getTime() / 1000), // ср 21:06
          start: Math.floor(Date.now() / 1000)
        };
        setAlerts([rainfallWarning, ...weatherAlerts]);
        
        setActivityData(activities);
        setAirQuality(aqi);

        // Validate alert consistency with current weather
        const validatedWeather = validateAlertConsistency(weather, weatherAlerts);
        if (validatedWeather !== weather) {
          setWeatherData(validatedWeather);
        }

        // Check for validation errors after all data is fetched
        const errors = getValidationErrors();
        if (errors.length > 0) {
          setValidationErrors(errors);
          // Show validation modal only in dev mode
          const isDev = import.meta.env.DEV || localStorage.getItem('dev-mode') === 'true';
          if (isDev) {
            setShowValidationModal(true);
          }
        }

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
          // Restore timezone from cached weather data
          try {
            const tzCandidate = weather?.sys?.tz_id ?? weather?.timezone;
            if (tzCandidate !== undefined && tzCandidate !== null) setTimezone(tzCandidate);
          } catch {}
          setForecastData(forecast || null);
          setHourlyData(hourly || null);
          setWeeklyData(weekly || null);
          
          // DEMO: Add rainfall warning for Vancouver
          const rainfallWarning = {
            event: 'Rainfall Warning',
            severity: 'orange',
            description: 'A long episode of rain, at times heavy, is expected. Total rainfall amounts of 80 to 120 mm. Rain will become heavy this evening, with 40 to 60 mm expected by Thursday morning. Rain will ease Thursday morning, then intensify again Thursday evening with an additional 40 to 60 mm expected by Friday afternoon. Water will likely pool on roads and in low-lying areas.',
            end: Math.floor(new Date('2026-01-29T21:06:00').getTime() / 1000), // ср 21:06
            start: Math.floor(Date.now() / 1000)
          };
          setAlerts([rainfallWarning, ...(weatherAlerts || [])]);
          
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
  }, [temperatureUnit, setTimezone, t]);

  useEffect(() => {
    if (skipNextCityFetchRef.current) {
      skipNextCityFetchRef.current = false;
      return;
    }
    fetchWeatherData(city);
  }, [city, fetchWeatherData]);

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

  const handleFindMe = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOfflineUsed(false);
      setOfflineTs(null);
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
        
        // DEMO: Add rainfall warning for Vancouver
        const rainfallWarning = {
          event: 'Rainfall Warning',
          severity: 'orange',
          description: 'A long episode of rain, at times heavy, is expected. Total rainfall amounts of 80 to 120 mm. Rain will become heavy this evening, with 40 to 60 mm expected by Thursday morning. Rain will ease Thursday morning, then intensify again Thursday evening with an additional 40 to 60 mm expected by Friday afternoon. Water will likely pool on roads and in low-lying areas.',
          end: Math.floor(new Date('2026-01-29T21:06:00').getTime() / 1000), // ср 21:06
          start: Math.floor(Date.now() / 1000)
        };
        setAlerts([rainfallWarning, ...weatherAlerts]);
        
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
            // Restore timezone from cached weather data
            try {
              const tzCandidate = p.weather?.sys?.tz_id ?? p.weather?.timezone;
              if (tzCandidate !== undefined && tzCandidate !== null) setTimezone(tzCandidate);
            } catch {}
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
      skipNextCityFetchRef.current = true;
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
      // Show the detailed error message from getCurrentLocation
      const errorMsg = error?.message || (t('locationError') || 'Unable to get your location. Please check your browser permissions.');
      alert(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [language, temperatureUnit, setTimezone, t]);

  const getWeatherIcon = React.useCallback((condition) => {
    const iconMap = {
      'clear': isNight ? <Moon className="w-8 h-8" /> : <Sun className="w-8 h-8" />,
      'clouds': <Cloud className="w-8 h-8" />,
      'rain': <CloudRain className="w-8 h-8" />,
      'snow': <CloudSnow className="w-8 h-8" />,
      'thunderstorm': <Zap className="w-8 h-8" />,
      'default': <Sun className="w-8 h-8" />
    };
    return iconMap[condition?.toLowerCase()] || iconMap['default'];
  }, [isNight]);

  const getBackgroundGradient = React.useCallback((condition) => {
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
  }, [theme]);

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

  const normalizeAlertType = (event) => {
    const s = String(event || '')
      .toLowerCase()
      .replace(/\b(warning|watch|advisory|statement|alert)\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    return s || 'unknown';
  };

  const getAlertDismissKey = (alert) => {
    const typeKey = normalizeAlertType(alert?.event);
    const endKey = typeof alert?.end === 'number' ? alert.end : 'noend';
    return `${typeKey}:${endKey}`;
  };

  const getAlertDismissExpiry = (alert, nowSeconds) => {
    if (typeof alert?.end === 'number') return alert.end;
    return nowSeconds + 6 * 60 * 60; // 6 hours fallback for alerts without end
  };

  // Map wind degrees to 16-point cardinal
  const degToCardinal = (deg) => {
    if (typeof deg !== 'number' || isNaN(deg)) return '';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N'];
    const idx = Math.round((((deg % 360) + 360) % 360) / 22.5);
    return dirs[idx] || 'N';
  };

  const getLocationKey = () => {
    // Use consistent location key: prefer weatherData.name, then city, then 'global'
    return (weatherData?.name || city || 'global').toLowerCase().trim();
  };

  const dismissAlert = (alert) => {
    const typeKey = normalizeAlertType(alert?.event);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const locationKey = getLocationKey();

    setDismissedAlertsByLocation((prev) => {
      const next = { ...prev };
      const current = next[locationKey] || {};
      const dismissKey = getAlertDismissKey(alert);
      current[dismissKey] = getAlertDismissExpiry(alert, nowSeconds);
      next[locationKey] = current;
      return next;
    });

    setAlerts(prev => prev.filter((a) => normalizeAlertType(a?.event) !== typeKey));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-all duration-1000" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl backdrop-blur-xl border border-white/30"
          style={{
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/70 border-t-white mx-auto"></div>
          <p className="text-white text-center mt-4 font-medium">{t('loading') || 'Loading weather data...'}</p>
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
      {/* Validation Error Modal */}
      <AnimatePresence>
        {showValidationModal && (
          <ValidationErrorModal
            errors={validationErrors}
            onClose={() => setShowValidationModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Weather Alerts */}
      <WeatherAlertsSection
        alerts={alerts}
        dismissedAlertsByLocation={dismissedAlertsByLocation}
        locationKey={getLocationKey()}
        getAlertDismissKey={getAlertDismissKey}
        onDismiss={dismissAlert}
        cardClass={cardBase}
        fontClass={cardTitle}
      />

      {/* Settings Panel */}
      <SettingsSection
        showSettings={showSettings}
        onClose={() => setShowSettings(false)}
        onCitySelect={setCity}
        cardClass={cardBase}
        fontClass={cardTitle}
      />

      {/* Weather Map */}
      <MapSection
        showMap={showMap}
        onClose={() => setShowMap(false)}
        weatherData={weatherData}
        cardClass={cardBase}
        fontClass={cardTitle}
      />

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
                {formatDate(Math.floor(offlineTs / 1000), { opts: { month: 'short', day: 'numeric' } })}
                {', '}
                {formatTime(Math.floor(offlineTs / 1000))}
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
              disabled={loading}
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
        <ViewToggle
          currentView={currentView}
          setCurrentView={setCurrentView}
          t={t}
          cardBase={cardBase}
          cardSecondary={cardSecondary}
          cardHeader={cardHeader}
        />

        <TodaySection
          weatherData={weatherData}
          forecastData={forecastData}
          weeklyData={weeklyData}
          airQuality={airQuality}
          currentView={currentView}
          t={t}
          ctxDayKey={ctxDayKey}
          getWeatherIcon={getWeatherIcon}
          cardSecondary={cardSecondary}
          cardTitle={cardTitle}
          cardHeader={cardHeader}
          cardCaption={cardCaption}
          temperatureUnit={temperatureUnit}
          windSpeedUnit={windSpeedUnit}
        />

        <HourlySection
          hourlyData={hourlyData}
          currentView={currentView}
          getWeatherIcon={getWeatherIcon}
          cardSecondary={cardSecondary}
          cardTitle={cardTitle}
        />

        <WeeklySection
          weeklyData={weeklyData}
          currentView={currentView}
          getWeatherIcon={getWeatherIcon}
          cardSecondary={cardSecondary}
          cardTitle={cardTitle}
        />

        <ActivitiesSection
          activityData={activityData}
          currentView={currentView}
          cardSecondary={cardSecondary}
          cardTitle={cardTitle}
        />
      </div>
    </div>
  );
}

export default App;