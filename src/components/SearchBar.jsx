import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Locate, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchBar({ onSearch, onLocationRequest }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const textMain = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSubtle = theme === 'dark' ? 'text-white/70' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-white/10' : 'bg-white/90';
  const border = theme === 'dark' ? 'border-white/30' : 'border-gray-300';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/20' : 'hover:bg-gray-200';
  const placeholderClass = theme === 'dark' ? 'placeholder-white/60' : 'placeholder-gray-400';
  // Theme-aware styles for suggestions dropdown and icons
  const panelBg = theme === 'dark' ? 'bg-white/20' : 'bg-white';
  const panelBorder = theme === 'dark' ? 'border-white/20' : 'border-gray-200';
  const panelText = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const panelSubtle = theme === 'dark' ? 'text-white/70' : 'text-gray-600';
  const itemHover = theme === 'dark' ? 'hover:bg-white/15' : 'hover:bg-gray-100';
  const iconMuted = theme === 'dark' ? 'text-white/50' : 'text-gray-500';
  const spinnerBorder = theme === 'dark' ? 'border-white border-t-transparent' : 'border-gray-500 border-t-transparent';
  const iconSearchBtn = theme === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-700 hover:text-blue-600';
  const iconActionBtn = theme === 'dark' ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700';

  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weather-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Fetch city suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = data.map((item) => ({
          name: item.name,
          country: item.country,
          state: item.state,
          lat: item.lat,
          lon: item.lon
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for API call
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleCitySelect(query.trim());
    }
  };

  const handleCitySelect = useCallback((cityName) => {
    onSearch(cityName);
    
    // Add to recent searches
    const updatedRecent = [cityName, ...recentSearches.filter(city => city !== cityName)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('weather-recent-searches', JSON.stringify(updatedRecent));
    
    // Reset state
    setQuery('');
    setIsExpanded(false);
    setShowSuggestions(false);
    setSuggestions([]);
  }, [onSearch, recentSearches]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleCollapse = useCallback(() => {
    if (!query) {
      setIsExpanded(false);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [query]);

  const formatCityDisplay = useCallback((suggestion) => {
    if (suggestion.state) {
      return `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`;
    }
    return `${suggestion.name}, ${suggestion.country}`;
  }, []);

  const [isHovered, setIsHovered] = useState(false); 
 return (
    <div className="max-w-lg mx-auto mb-8 relative">
      <motion.form
        onSubmit={handleSubmit}
        className="relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* ДОБАВЬТЕ ОБРАБОТЧИКИ HOVER ЗДЕСЬ */}
        <motion.div
          className={`glass-card-intense rounded-3xl overflow-hidden relative z-10 micro-glow ${cardBg} ${border}`}
          animate={{ 
            width: isExpanded ? '100%' : '280px',
            background: isExpanded ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            // Добавьте анимацию для hover эффекта
            scale: isHovered ? 1.02 : 1,
            boxShadow: isHovered ? 
              '0 0 20px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)' : 
              '0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleExpand}
              className={`p-4 ${iconSearchBtn} transition-colors flex-shrink-0`}
            >
              {/* ДОБАВЬТЕ АНИМАЦИЮ ДЛЯ ИКОНКИ ПРИ HOVER */}
              <motion.div
                animate={{ rotate: isHovered ? 5 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              >
                <Search className="w-6 h-6" />
              </motion.div>
            </button>
            
            {!isExpanded && (
              <div className={`flex-1 text-base ${textSubtle} px-10`}>
                {t('searchHint')}
              </div>
            )}
            
            <motion.input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onBlur={handleCollapse}
              onFocus={() => {
                if (query.length >= 2) {
                  setShowSuggestions(true);
                } else if (recentSearches.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder={t('searchPlaceholder')}
              className={`bg-transparent ${textMain} ${placeholderClass} border-none outline-none flex-1 pr-4 text-lg`}
              animate={{ 
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? '100%' : 0,
                display: isExpanded ? 'block' : 'none'
              }}
              transition={{ duration: 0.3 }}
            />
            
            {isExpanded && (
              <button
                type="button"
                onClick={onLocationRequest}
                className={`p-2 ${iconActionBtn} transition-colors flex-shrink-0 mr-2`}
                title={t('useMyLocation')}
              >
                <Locate className="w-5 h-5" />
              </button>
            )}
            
            {isExpanded && query && (
              <button
                type="button"
                onClick={handleClear}
                className={`p-2 ${iconActionBtn} transition-colors flex-shrink-0`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {isExpanded && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full left-0 right-0 mt-3 ${panelBg} backdrop-blur-md rounded-xl overflow-hidden z-20 max-h-80 overflow-y-auto border ${panelBorder}`}
            >
              {loading && (
                <div className={`p-6 text-center ${panelSubtle}`}>
                  <div className={`animate-spin rounded-full h-6 w-6 border-2 ${spinnerBorder} mx-auto mb-2`}></div>
                  <span className="text-sm">{t('searchingCities')}</span>
                </div>
              )}

              {!loading && query.length < 2 && recentSearches.length > 0 && (
                <div>
                  <div className={`px-6 py-3 ${panelSubtle} text-sm font-semibold border-b ${panelBorder} flex items-center`}>
                    <Clock className={`w-4 h-4 mr-3 ${iconMuted}`} />
                    {t('recentSearches')}
                  </div>
                  {recentSearches.map((city, index) => (
                    <button
                      key={index}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full px-6 py-4 text-left ${panelText} ${itemHover} transition-colors flex items-center`}
                    >
                      <Clock className={`w-4 h-4 mr-4 ${iconMuted}`} />
                      <span className="text-base">{city}</span>
                    </button>
                  ))}
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <div>
                  {query.length >= 2 && (
                    <div className={`px-6 py-3 ${panelSubtle} text-sm font-semibold border-b ${panelBorder}`}>
                      {t('citySuggestions')}
                    </div>
                  )}
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleCitySelect(suggestion.name)}
                      className={`w-full px-6 py-4 text-left ${panelText} ${itemHover} transition-colors flex items-center`}
                    >
                      <MapPin className={`w-4 h-4 mr-4 ${iconMuted}`} />
                      <div>
                        <div className="text-base font-semibold">{suggestion.name}</div>
                        <div className={`text-sm ${panelSubtle}`}>
                          {suggestion.state ? `${suggestion.state}, ` : ''}{suggestion.country}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && query.length >= 2 && suggestions.length === 0 && (
                <div className={`p-6 text-center typography-body ${panelSubtle}`}>
                  {t('noCitiesFound')} "{query}"
                </div>
              )}

              {!loading && query.length >= 2 && (
                <div className={`border-t ${panelBorder}`}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCitySelect(query)}
                    className={`w-full px-8 py-6 text-left ${panelSubtle} ${itemHover} transition-colors flex items-center`}
                  >
                    <Search className={`w-6 h-6 mr-6 ${iconMuted}`} />
                    <span className="text-base">{t('searchFor')} "{query}"</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}