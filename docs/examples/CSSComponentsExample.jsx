/**
 * ПРИМЕР: Применение единой системы в CSS/React компоненте
 * 
 * Демонстрирует использование визуальных параметров 
 * в обычных React компонентах (не Three.js)
 */

import React, { useEffect } from 'react';
import { 
  getCSSVars, 
  getTimeOfDayVisuals,
  applyRainyModifier,
  applyCloudyModifier 
} from '../../utils/timeOfDayVisuals';

// ============================================================================
// ПРИМЕР 1: Фоновый градиент WeatherCard
// ============================================================================

export function WeatherCard({ timeOfDay, weatherCondition, children }) {
  const cssVars = getCSSVars(timeOfDay);
  
  return (
    <div
      className="weather-card rounded-lg p-6 shadow-xl backdrop-blur-sm"
      style={{
        background: cssVars['--sky-gradient'],
        color: cssVars['--text-primary'],
        '--overlay': cssVars['--overlay-bg']
      }}
    >
      <div className="overlay" style={{ background: 'var(--overlay)' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// ПРИМЕР 2: Динамический фон с применением модификаторов
// ============================================================================

export function DynamicBackground({ timeOfDay, weatherCondition, children }) {
  // Получаем базовые визуальные параметры
  let visuals = getTimeOfDayVisuals(timeOfDay);
  
  // Применяем модификаторы погоды
  if (weatherCondition === 'rainy') {
    visuals = applyRainyModifier(visuals);
  } else if (weatherCondition === 'cloudy') {
    visuals = applyCloudyModifier(visuals);
  }
  
  const { colors, global, cssVars } = visuals;

  return (
    <div
      className="min-h-screen transition-all duration-1000"
      style={{
        background: cssVars['--sky-gradient'],
        filter: `
          saturate(${global.saturation}) 
          contrast(${global.contrast}) 
          brightness(${global.brightness})
        `
      }}
    >
      {/* Слой тумана (если применимо) */}
      {visuals.atmosphere.fogDensity > 0.01 && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              ${visuals.atmosphere.fogColor}${Math.floor(visuals.atmosphere.fogDensity * 255).toString(16)} 100%
            )`
          }}
        />
      )}
      
      {children}
    </div>
  );
}

// ============================================================================
// ПРИМЕР 3: Глобальное применение CSS переменных
// ============================================================================

export function TimeOfDayProvider({ timeOfDay, children }) {
  useEffect(() => {
    const cssVars = getCSSVars(timeOfDay);
    const root = document.documentElement;
    
    // Применяем CSS переменные глобально
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Дополнительные переменные из визуальных параметров
    const visuals = getTimeOfDayVisuals(timeOfDay);
    root.style.setProperty('--ambient-light', visuals.colors.ambient);
    root.style.setProperty('--fog-color', visuals.atmosphere.fogColor);
    root.style.setProperty('--saturation', visuals.global.saturation.toString());
    root.style.setProperty('--contrast', visuals.global.contrast.toString());
    
  }, [timeOfDay]);
  
  return <>{children}</>;
}

// ============================================================================
// ПРИМЕР 4: Адаптивный текст на основе времени суток
// ============================================================================

export function AdaptiveText({ timeOfDay, children, className = '' }) {
  const visuals = getTimeOfDayVisuals(timeOfDay);
  const cssVars = visuals.cssVars;
  
  // Автоматически выбираем контрастный цвет текста
  const isDarkBackground = ['night', 'sunset'].includes(timeOfDay);
  
  return (
    <p
      className={`transition-colors duration-500 ${className}`}
      style={{
        color: isDarkBackground ? cssVars['--text-primary'] : '#1A1A2E',
        textShadow: isDarkBackground 
          ? '0 2px 8px rgba(0, 0, 0, 0.5)' 
          : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </p>
  );
}

// ============================================================================
// ПРИМЕР 5: Иконки с динамической раскраской
// ============================================================================

export function WeatherIcon({ icon: Icon, timeOfDay }) {
  const visuals = getTimeOfDayVisuals(timeOfDay);
  const colors = visuals.colors;
  
  // Раскрашиваем иконки в соответствии с временем суток
  const getIconColor = () => {
    switch (timeOfDay) {
      case 'sunrise':
        return colors.clouds.highlight; // Розовато-золотой
      case 'day':
        return colors.sky.top; // Ярко-синий
      case 'sunset':
        return colors.clouds.base; // Оранжево-коралловый
      case 'night':
        return colors.clouds.highlight; // Серебристый
      default:
        return '#FFFFFF';
    }
  };
  
  return (
    <Icon
      className="transition-colors duration-500"
      style={{ color: getIconColor() }}
      size={48}
    />
  );
}

// ============================================================================
// ПРИМЕР 6: CSS-only подход (через Tailwind и CSS переменные)
// ============================================================================

/*
// В вашем root компоненте:
<TimeOfDayProvider timeOfDay={currentTimeOfDay}>
  <App />
</TimeOfDayProvider>

// В любом дочернем компоненте можно использовать CSS переменные:
<div className="bg-[var(--overlay-bg)] text-[var(--text-primary)]">
  <h1 className="text-2xl" style={{ color: 'var(--text-primary)' }}>
    Заголовок
  </h1>
  <p style={{ color: 'var(--text-secondary)' }}>
    Описание
  </p>
</div>

// В CSS/Tailwind:
.card {
  background: var(--sky-gradient);
  color: var(--text-primary);
  filter: saturate(var(--saturation)) contrast(var(--contrast));
}
*/

// ============================================================================
// ИСПОЛЬЗОВАНИЕ В APP
// ============================================================================

/*
import { getTimeOfDayFromHour } from '../utils/timeOfDayVisuals';

function App() {
  const currentHour = new Date().getHours();
  const timeOfDay = getTimeOfDayFromHour(currentHour);
  const weatherCondition = 'clear'; // Получить из API
  
  return (
    <TimeOfDayProvider timeOfDay={timeOfDay}>
      <DynamicBackground timeOfDay={timeOfDay} weatherCondition={weatherCondition}>
        <WeatherCard timeOfDay={timeOfDay}>
          <WeatherIcon icon={Sun} timeOfDay={timeOfDay} />
          <AdaptiveText timeOfDay={timeOfDay}>
            Сегодня солнечно!
          </AdaptiveText>
        </WeatherCard>
      </DynamicBackground>
    </TimeOfDayProvider>
  );
}
*/
