import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Languages, Clock, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTime } from '../contexts/TimeContext';

/**
 * Welcome Modal - First-time user greeting with settings
 * Features:
 * - Time format selection (12/24 hours + auto)
 * - Language selection
 * - Rollback Mode toggle
 * - Admin thank you message
 */
export default function WelcomeModal() {
  const { theme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { hour12, setHour12, ignoreDST } = useTime();
  
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const shown = localStorage.getItem('welcome-modal-shown');
      // Show modal if never shown before (null) or if explicitly set to false
      const shouldShow = shown === null || shown !== 'true';
      return shouldShow;
    } catch {
      return true;
    }
  });
  
  // Allow reset with Ctrl+Shift+W for testing
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        try {
          localStorage.removeItem('welcome-modal-shown');
          setIsOpen(true);
        } catch {}
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');
  const [timeFormat, setTimeFormat] = useState(hour12 ? '12' : '24');
  const [rollbackMode, setRollbackMode] = useState(() => {
    try {
      return localStorage.getItem('rollback-mode') === 'true';
    } catch {
      return false;
    }
  });

  const languages = [
    { code: 'en', name: '🇬🇧 English' },
    { code: 'es', name: '🇪🇸 Español' },
    { code: 'fr', name: '🇫🇷 Français' },
    { code: 'de', name: '🇩🇪 Deutsch' },
    { code: 'it', name: '🇮🇹 Italiano' },
    { code: 'pt', name: '🇵🇹 Português' },
    { code: 'ru', name: '🇷🇺 Русский' },
    { code: 'zh', name: '🇨🇳 中文' },
    { code: 'ja', name: '🇯🇵 日本語' },
    { code: 'ko', name: '🇰🇷 한국어' },
  ];

  const handleClose = () => {
    try {
      localStorage.setItem('welcome-modal-shown', 'true');
      localStorage.setItem('rollback-mode', String(rollbackMode));
    } catch (e) {
      console.error('[WelcomeModal] localStorage error:', e);
    }
    
    // Apply language if changed
    if (selectedLanguage !== language) {
      setLanguage(selectedLanguage);
    }
    
    // Apply time format (handle 'auto' as default system preference)
    if (timeFormat === 'auto') {
      // Auto-detect from browser locale
      const use12h = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' })
        .resolvedOptions().hour12 || false;
      setHour12(use12h);
    } else if (timeFormat === '12' || timeFormat === '24') {
      setHour12(timeFormat === '12');
    }
    
    setIsOpen(false);
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const bgColor = theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-xl border-white/10' : 'bg-white/90 backdrop-blur-md border-white/50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-white/50';
  const hoverBg = theme === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-white/80';
  const activeBg = theme === 'dark' ? 'bg-blue-900/60 border-blue-400/50' : 'bg-blue-50/80 border-blue-300/80';
  const buttonClass = 'transition-all duration-300 hover:shadow-lg';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none`}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md mx-4 glass-card-intense ${bgColor} rounded-2xl shadow-2xl border ${borderColor} overflow-hidden pointer-events-auto micro-bounce interactive-glow`}
            >
              {/* Header */}
              <div className="relative px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500">
              <h2 className="text-2xl font-bold text-white mb-1">
                👋 {t('welcome') || 'Welcome'}
              </h2>
              <p className="text-blue-100 text-sm">
                {t('welcomeSubtitle') || 'Configure your preferences'}
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                type="button"
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6 max-h-96 overflow-y-auto">
              
              {/* Language Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Languages className={`w-5 h-5 text-blue-500`} />
                  <label className={`font-semibold ${textColor}`}>
                    Language
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium micro-bounce ${
                        selectedLanguage === lang.code
                          ? `${activeBg}`
                          : `border-transparent ${hoverBg}`
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Format */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <label className={`font-semibold ${textColor}`}>
                    Time Format
                  </label>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: '24', label: '24 Hour' },
                    { value: '12', label: '12 Hour' },
                    { value: 'auto', label: 'Auto' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeFormat(option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 font-medium transition-all micro-bounce ${
                        timeFormat === option.value
                          ? `${activeBg}`
                          : `border-transparent ${hoverBg}`
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className={`text-xs ${secondaryText} mt-2`}>
                  {t('timeFormatDesc') || 'Auto: Uses your system settings'}
                </p>
              </div>

              {/* Rollback Mode */}
              <div>
                <div className={`flex items-center justify-between glass-card-intense p-3 rounded-lg border-2 border-transparent ${hoverBg} transition-all micro-bounce ${theme === 'dark' ? 'hover:border-yellow-400/50' : 'hover:border-yellow-300/50'}`}>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-yellow-500" />
                    <div>
                      <label className={`font-semibold block ${textColor}`}>
                        Rollback Mode
                      </label>
                      <p className={`text-xs ${secondaryText}`}>
                        {t('rollbackModeDesc') || 'Use fallback services'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRollbackMode(!rollbackMode)}
                    className={`px-3 py-1 rounded-full font-medium text-sm transition-all micro-bounce ${
                      rollbackMode
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg'
                        : 'bg-gray-300/50 text-gray-700 dark:bg-gray-600/50 dark:text-gray-300'
                    }`}
                  >
                    {rollbackMode ? t('on') || 'ON' : t('off') || 'OFF'}
                  </button>
                </div>
              </div>

              {/* Admin Thank You Message */}
              <div className={`glass-card-intense p-4 rounded-lg border-2 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-400/30' 
                  : 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 border-blue-200/50'
              } micro-bounce`}>
                <h3 className={`font-semibold ${textColor} mb-2 flex items-center gap-2`}>
                  <span className="text-lg">❤️</span>
                  {t('thanksFromAdmin') || 'Thanks from Admin'}
                </h3>
                <p className={`text-sm ${secondaryText} leading-relaxed`}>
                  {t('adminMessage') || 'Thank you for using Alpik941 Weather App! We appreciate your feedback and support. Enjoy accurate weather forecasts and beautiful 3D visualization!'}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${borderColor} flex gap-3`}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                type="button"
                className={`flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 micro-bounce interactive-glow hover:scale-105`}
              >
                {t('getStarted') || 'Get Started'} ✨
              </button>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
