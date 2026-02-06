import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SavedCitiesSection from './sections/SavedCitiesSection';
import UnitsSection from './sections/UnitsSection';
import FeedbackSection from './sections/FeedbackSection';

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
  const supportEmail = (import.meta.env && import.meta.env.VITE_SUPPORT_EMAIL) || 'alparslankurtoglu941@gmail.com';
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
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
    if (newCity.trim() && savedCities.length < 10 && !savedCities.includes(newCity.trim())) {
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
        className="fixed right-0 top-0 h-full w-80 z-50 overflow-y-auto backdrop-blur-xl bg-white/30 dark:bg-gray-900/40 border-l border-white/30 dark:border-white/20"
        style={{
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        }}
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

          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'saved', label: t('savedCities') },
                { key: 'units', label: t('units') || 'Units' },
                { key: 'feedback', label: t('support') }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'saved' && (
            <SavedCitiesSection
              t={t}
              savedCities={savedCities}
              newCity={newCity}
              setNewCity={setNewCity}
              onAddCity={handleAddCity}
              onRemoveCity={handleRemoveCity}
              onCityClick={handleCityClick}
            />
          )}

          {activeTab === 'units' && (
            <UnitsSection
              t={t}
              theme={theme}
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
              toggleTheme={toggleTheme}
              toggleTemperatureUnit={toggleTemperatureUnit}
              setWindSpeedUnit={setWindSpeedUnit}
              language={language}
              setLanguage={setLanguage}
              languages={languages}
              apiStatus={apiStatus}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackSection
              t={t}
              supportEmail={supportEmail}
              showFeedback={showFeedback}
              setShowFeedback={setShowFeedback}
              feedback={feedback}
              setFeedback={setFeedback}
              rating={rating}
              setRating={setRating}
              onContactDevelopers={handleContactDevelopers}
              onRateApp={handleRateApp}
              onSubmitFeedback={handleFeedbackSubmit}
            />
          )}
        </div>
      </motion.div>
    </>
  );
}
