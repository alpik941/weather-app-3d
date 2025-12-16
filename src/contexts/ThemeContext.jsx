import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('weather-theme');
    return saved || 'light';
  });

  const [temperatureUnit, setTemperatureUnit] = useState(() => {
    const saved = localStorage.getItem('weather-temp-unit');
    return saved || 'celsius';
  });

  const [windSpeedUnit, setWindSpeedUnitState] = useState(() => {
    const saved = localStorage.getItem('weather-wind-unit');
    return saved || 'ms';
  });

  useEffect(() => {
    localStorage.setItem('weather-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('weather-temp-unit', temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    localStorage.setItem('weather-wind-unit', windSpeedUnit);
  }, [windSpeedUnit]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const setWindSpeedUnit = (unit) => {
    setWindSpeedUnitState(unit);
  };

  const value = {
    theme,
    temperatureUnit,
    windSpeedUnit,
    toggleTheme,
    toggleTemperatureUnit,
    setWindSpeedUnit,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};