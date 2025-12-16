import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings, Sun, Moon, Thermometer, Globe, MessageSquare, Star, Send, User, LogOut, X, MapPin, Plus, Trash2, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from '../Auth/AuthPage';
import { useTime } from '../../contexts/TimeContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }
];

export default function SettingsPanel({ isOpen, onClose, onCitySelect }) {
  const { theme, temperatureUnit, windSpeedUnit, toggleTheme, toggleTemperatureUnit, setWindSpeedUnit } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut, isSupabaseConfigured } = useAuth();
  const supportEmail = (import.meta.env && import.meta.env.VITE_SUPPORT_EMAIL) || 'alparslankurtoglu941@gmail.com';
  const [showAuth, setShowAuth] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [savedCities, setSavedCities] = useState(() => {
    const saved = localStorage.getItem('weather-saved-cities');
    return saved ? JSON.parse(saved) : [];
  });
  const [newCity, setNewCity] = useState('');

  // New: 3D/stylish visualization toggles (persisted)
  const [enable3D, setEnable3D] = useState(() => {
    const v = localStorage.getItem('weather-enable-3d');
    return v ? v === 'true' : true; // default on
  });
  const [stylishViz, setStylishViz] = useState(() => {
    const v = localStorage.getItem('weather-stylish-viz');
    return v ? v === 'true' : true; // default on
  });

  // New: API key diagnostics
  const apiStatus = useMemo(() => {
    const weatherApi = !!(import.meta.env && import.meta.env.VITE_WEATHERAPI_KEY);
    const openWeather = !!(import.meta.env && import.meta.env.VITE_OPENWEATHER_API_KEY);
    return {
      weatherApi,
      openWeather,
      ok: weatherApi || openWeather,
    };
  }, []);

  if (!isOpen) return null;

  const handleAddCity = (e) => {
    e.preventDefault();
    if (newCity.trim() && savedCities.length < 3 && !savedCities.includes(newCity.trim())) {
      const updatedCities = [...savedCities, newCity.trim()];
      setSavedCities(updatedCities);
      localStorage.setItem('weather-saved-cities', JSON.stringify(updatedCities));
      setNewCity('');
    }
  };

  const handleRemoveCity = (cityToRemove) => {
    const updatedCities = savedCities.filter(city => city !== cityToRemove);
    setSavedCities(updatedCities);
    localStorage.setItem('weather-saved-cities', JSON.stringify(updatedCities));
  };

  const handleCityClick = (city) => {
    onCitySelect(city);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFeedbackSubmit = () => {
    // Send feedback via email link
    const to = supportEmail;
    const subject = encodeURIComponent('Weather App Feedback');
    const bodyLines = [
      `Rating: ${rating}/5`,
      '',
      'Feedback:',
      feedback,
      '',
      '— Sent from Settings > Feedback'
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    const href = `mailto:${to}?subject=${subject}&body=${body}`;
    window.open(href, '_blank');

    // Reset local UI state
    setFeedback('');
    setRating(0);
    setShowFeedback(false);
    alert(t('thankYouFeedback'));
  };

  const handleRateApp = () => {
    // In a real app, this would redirect to app store
    window.open('https://github.com/your-repo', '_blank');
  };

  const handleContactDevelopers = () => {
    const to = supportEmail;
    const subject = encodeURIComponent('Weather App Contact');
    const body = encodeURIComponent('Hello team,\n\n');
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
  };

  if (showAuth && !user) {
    return <AuthPage />;
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 z-50 overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300 mr-3" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('settings')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Saved Cities */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('savedCities')}</h3>
            
            {/* Add New City */}
            <form onSubmit={handleAddCity} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder={t('addCityPlaceholder')}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                  disabled={savedCities.length >= 3}
                />
                <button
                  type="submit"
                  disabled={!newCity.trim() || savedCities.length >= 3 || savedCities.includes(newCity.trim())}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {savedCities.length >= 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('maxCitiesHint')}
                </p>
              )}
            </form>
            
            {/* Saved Cities List */}
            <div className="space-y-2">
              {savedCities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  {t('noSavedCities')}
                </p>
              ) : (
                savedCities.map((city, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <button
                      onClick={() => handleCityClick(city)}
                      className="flex items-center flex-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-gray-800 dark:text-white font-medium">{city}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveCity(city)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* User Section */}
          {isSupabaseConfigured && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('accountAndSubscription')}</h3>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <User className="w-5 h-5 text-blue-500 mr-3" />
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-white font-medium">{user.name || t('user')}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  {/* Subscription Status */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">{t('freePlan')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('basicFeatures')}</p>
                      </div>
                      <div className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                        {t('currentPlan')}
                      </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                      {t('upgradeToPro')}
                    </button>
                  </div>
                  
                  {/* Pro Features Preview */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{t('proFeatures')}</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• {t('feature14Day')}</li>
                      <li>• {t('featureSevereAlerts')}</li>
                      <li>• {t('featureHistorical')}</li>
                      <li>• {t('featureMaps')}</li>
                      <li>• {t('featurePriorityApi')}</li>
                      <li>• {t('featureAdFree')}</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    {t('signOut')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 border border-blue-200 dark:border-blue-700"
                >
                  <User className="w-5 h-5 mr-2" />
                  {t('signInRegisterPro')}
                </button>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('appearance')}</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-yellow-500 mr-3" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-400 mr-3" />
                )}
                <span className="text-gray-700 dark:text-gray-300">
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

          {/* Temperature Unit */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('temperatureHeader')}</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center">
                <Thermometer className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
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

          {/* Wind Speed Unit */}
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
                  className={`w-full flex items-center p-3 rounded-xl transition-colors text-left ${
                    windSpeedUnit === unit.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{unit.label}</span>
                  {windSpeedUnit === unit.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* New: Visualization & API Diagnostics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('visualizations') || 'Visualizations'}</h3>
            <div className="space-y-3">
              {/* API key status */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('apiKeyStatus') || 'API Key Status'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${apiStatus.ok ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
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

          {/* Time Format (12/24h) */}
          <TimeFormatSection t={t} />

          {/* Time System Flags */}
          <TimeSystemFlags t={t} />

          {/* Language Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('language')}</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full flex items-center p-3 rounded-xl transition-colors ${
                    language === lang.code
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-xl mr-3">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <Globe className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('support')}</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.open(`mailto:${supportEmail}`,'_blank')}
                className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Mail className="w-5 h-5 mr-3" />
                <span>{t('supportEmail')}</span>
              </button>
              <button
                onClick={() => setShowFeedback(true)}
                className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                {t('feedback')}
              </button>
              
              <button
                onClick={handleContactDevelopers}
                className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Send className="w-5 h-5 mr-3" />
                {t('contactDevelopers')}
              </button>
              
              <button
                onClick={handleRateApp}
                className="w-full flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Star className="w-5 h-5 mr-3" />
                {t('rateApp')}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t('feedback')}</h3>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('rateExperience')}
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('yourFeedback')}
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t('feedbackPlaceholder')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim() || rating === 0}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {t('submitFeedback')}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

// Separate component for time format toggle to keep main panel clean
function TimeFormatSection({ t }) {
  const { hour12, toggleHour12, setHour12 } = useTime();
  // Interpret cycling states: true=12h, false=24h, undefined=auto
  const currentMode = hour12 === true ? '12h' : hour12 === false ? '24h' : 'auto';
  const nextLabel = currentMode === '12h' ? '24h' : currentMode === '24h' ? t('auto') : '12h';
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('timeFormat')}</h3>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-gray-700 dark:text-gray-300 font-medium">{t('timeDisplay')}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {currentMode === '12h' && t('timeFormat12hDesc')}
            {currentMode === '24h' && t('timeFormat24hDesc')}
            {currentMode === 'auto' && t('timeFormatAutoDesc')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleHour12}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
  const showRollback = (import.meta.env && import.meta.env.DEV) || rollback; // hide in production unless enabled
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('advancedTime')}</h3>
      <div className="space-y-3">
        {showRollback && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {t('rollbackMode')}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('rollbackDesc')}</div>
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