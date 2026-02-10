/**
 * ЕДИНАЯ СИСТЕМА ВИЗУАЛЬНЫХ СТИЛЕЙ ДЛЯ ВРЕМЕНИ СУТОК
 * 
 * Эта система обеспечивает согласованность между:
 * - Three.js сценой (освещение, небо, облака)
 * - CSS/React стилями (фоны, цвета)
 * - UI компонентами
 * 
 * Философия: НЕ разные стили для каждого случая,
 * а ЕДИНЫЕ параметры, плавно меняющиеся по времени суток.
 */

// ============================================================================
// ДИЗАЙН-ТОКЕНЫ: Базовые параметры для каждого времени суток
// ============================================================================

export const TIME_OF_DAY_PRESETS = {
  // 🌅 РАССВЕТ (Sunrise) — 5:00-7:00
  // Теплые пастельные тона, низкая контрастность, мягкий свет
  sunrise: {
    // Цветовая палитра
    colors: {
      sky: {
        top: '#FF6B6B',        // Коралловый верх
        middle: '#FFB347',     // Оранжевый-персиковый центр
        bottom: '#FFE4B5',     // Светло-кремовый низ
        horizon: '#FFDAB9'     // Персиковый горизонт
      },
      fog: '#FFE4E1',          // Туманно-розовый
      clouds: {
        base: '#FFB6C1',       // Светло-розовый
        highlight: '#FFF5EE',  // Белый с розовинкой
        shadow: '#FF8C94'      // Темно-розовый
      },
      ground: '#4A4A5C',       // Темно-серо-синий (земля еще в тени)
      ambient: '#FFE4B5'       // Теплый окружающий свет
    },

    // Освещение (Three.js)
    lighting: {
      ambient: {
        intensity: 0.5,
        color: '#FFD4A3'       // Теплый рассеянный свет
      },
      directional: {
        intensity: 0.6,
        color: '#FF8C42',      // Золотисто-оранжевый прямой свет
        position: [-8, 4, 2]   // Низкое положение солнца слева
      },
      sunGlow: 1.2             // Интенсивность свечения солнца
    },

    // Туман и атмосфера
    atmosphere: {
      fogDensity: 0.015,       // Умеренный туман
      fogColor: '#FFE4E1',
      visibility: 0.75,        // Слегка размытая видимость
      haze: 0.3               // Дымка
    },

    // Облака
    clouds: {
      opacity: 0.6,            // Полупрозрачные
      density: 0.4,            // Средняя плотность
      color: '#FFB6C1',
      edgeSoftness: 0.8,       // Мягкие края
      contrast: 0.3            // Низкая контрастность
    },

    // Общие параметры
    global: {
      saturation: 0.8,         // Высокая насыщенность
      contrast: 0.6,           // Низкий контраст
      brightness: 0.85,        // Светло
      warmth: 0.9             // Очень теплые тона
    },

    // CSS переменные (для React/CSS)
    cssVars: {
      '--sky-gradient': 'linear-gradient(180deg, #FF6B6B 0%, #FFB347 40%, #FFE4B5 100%)',
      '--text-primary': '#2C2C3E',
      '--text-secondary': '#5A5A6E',
      '--overlay-bg': 'rgba(255, 228, 181, 0.15)'
    }
  },

  // ☀️ ДЕНЬ (Day) — 7:00-17:00
  // Яркие чистые цвета, высокая контрастность, четкость
  day: {
    colors: {
      sky: {
        top: '#1E88E5',        // Насыщенный синий
        middle: '#42A5F5',     // Средний голубой
        bottom: '#90CAF9',     // Светло-голубой
        horizon: '#B3E5FC'     // Почти белый у горизонта
      },
      fog: '#E3F2FD',          // Очень светлый голубой
      clouds: {
        base: '#FFFFFF',       // Чисто белые
        highlight: '#FFFFFF',
        shadow: '#D1E8F5'      // Легкая голубая тень
      },
      ground: '#8DB38B',       // Зеленоватый (освещенная земля)
      ambient: '#FFFFFF'       // Нейтральный белый свет
    },

    lighting: {
      ambient: {
        intensity: 0.7,
        color: '#FFFFFF'
      },
      directional: {
        intensity: 1.0,
        color: '#FFFFFF',
        position: [10, 12, 5]  // Высокое положение солнца
      },
      sunGlow: 1.5
    },

    atmosphere: {
      fogDensity: 0.005,       // Минимальный туман
      fogColor: '#E3F2FD',
      visibility: 1.0,         // Идеальная видимость
      haze: 0.1
    },

    clouds: {
      opacity: 0.8,
      density: 0.5,
      color: '#FFFFFF',
      edgeSoftness: 0.5,
      contrast: 0.7            // Четкие облака
    },

    global: {
      saturation: 1.0,
      contrast: 1.0,
      brightness: 1.0,
      warmth: 0.5              // Нейтрально
    },

    cssVars: {
      '--sky-gradient': 'linear-gradient(180deg, #1E88E5 0%, #42A5F5 40%, #90CAF9 100%)',
      '--text-primary': '#1A1A2E',
      '--text-secondary': '#4A4A5C',
      '--overlay-bg': 'rgba(255, 255, 255, 0.1)'
    }
  },

  // 🌇 ЗАКАТ (Sunset) — 17:00-19:00
  // Драматичные теплые тона, средняя контрастность
  sunset: {
    colors: {
      sky: {
        top: '#FF6347',        // Томатно-красный верх
        middle: '#FF8C42',     // Оранжево-золотой
        bottom: '#FFD700',     // Золотой
        horizon: '#FFA07A'     // Лососевый горизонт
      },
      fog: '#FFE4C4',          // Бисквитный туман
      clouds: {
        base: '#FF7F50',       // Коралловые облака
        highlight: '#FFD700',  // Золотые блики
        shadow: '#CD5C5C'      // Индийский красный
      },
      ground: '#5A5A6E',       // Серо-фиолетовый (начинает темнеть)
      ambient: '#FFD4A3'
    },

    lighting: {
      ambient: {
        intensity: 0.45,
        color: '#FFB347'
      },
      directional: {
        intensity: 0.7,
        color: '#FF6347',
        position: [8, 3, -2]   // Низкое положение справа
      },
      sunGlow: 1.3
    },

    atmosphere: {
      fogDensity: 0.012,
      fogColor: '#FFE4C4',
      visibility: 0.8,
      haze: 0.25
    },

    clouds: {
      opacity: 0.75,
      density: 0.6,
      color: '#FF7F50',
      edgeSoftness: 0.7,
      contrast: 0.5
    },

    global: {
      saturation: 0.95,
      contrast: 0.75,
      brightness: 0.8,
      warmth: 1.0              // Максимально теплые тона
    },

    cssVars: {
      '--sky-gradient': 'linear-gradient(180deg, #FF6347 0%, #FF8C42 40%, #FFD700 100%)',
      '--text-primary': '#2C2C3E',
      '--text-secondary': '#5A5A6E',
      '--overlay-bg': 'rgba(255, 212, 163, 0.2)'
    }
  },

  // 🌙 НОЧЬ (Night) — 19:00-5:00
  // Холодные темные тона, низкая контрастность, приглушенный свет
  night: {
    colors: {
      sky: {
        top: '#0B1026',        // Почти черный синий
        middle: '#1A2238',     // Темно-синий
        bottom: '#2C3E50',     // Синевато-серый
        horizon: '#34495E'     // Серо-синий горизонт
      },
      fog: '#2C3E50',
      clouds: {
        base: '#4A5568',       // Темно-серые облака
        highlight: '#718096',  // Светло-серые блики (от луны)
        shadow: '#2D3748'      // Почти черные
      },
      ground: '#1A1A2E',       // Очень темная земля
      ambient: '#4A5568'       // Холодный серый
    },

    lighting: {
      ambient: {
        intensity: 0.25,
        color: '#4A5568'       // Холодный серый свет
      },
      directional: {
        intensity: 0.35,
        color: '#9DB4C0',      // Холодный голубовато-серый (лунный свет)
        position: [-6, 10, 3]  // Луна высоко
      },
      sunGlow: 0,              // Нет солнца
      moonGlow: 0.8            // Свечение луны
    },

    atmosphere: {
      fogDensity: 0.008,
      fogColor: '#2C3E50',
      visibility: 0.6,         // Ограниченная видимость
      haze: 0.2
    },

    clouds: {
      opacity: 0.4,            // Полупрозрачные
      density: 0.3,
      color: '#4A5568',
      edgeSoftness: 0.9,       // Очень мягкие края
      contrast: 0.2            // Низкая контрастность
    },

    global: {
      saturation: 0.5,         // Приглушенные цвета
      contrast: 0.5,
      brightness: 0.4,
      warmth: 0.2              // Холодные тона
    },

    cssVars: {
      '--sky-gradient': 'linear-gradient(180deg, #0B1026 0%, #1A2238 40%, #2C3E50 100%)',
      '--text-primary': '#E2E8F0',
      '--text-secondary': '#A0AEC0',
      '--overlay-bg': 'rgba(26, 26, 46, 0.25)'
    }
  }
};

// ============================================================================
// УТИЛИТЫ: Получение параметров и плавные переходы
// ============================================================================

/**
 * Получить визуальные параметры для времени суток
 * @param {string} timeOfDay - 'sunrise' | 'day' | 'sunset' | 'night'
 * @returns {Object} Полный набор визуальных параметров
 */
export function getTimeOfDayVisuals(timeOfDay = 'day') {
  const preset = TIME_OF_DAY_PRESETS[timeOfDay];
  
  if (!preset) {
    console.warn(`Unknown timeOfDay: ${timeOfDay}, falling back to 'day'`);
    return TIME_OF_DAY_PRESETS.day;
  }
  
  return preset;
}

/**
 * Получить параметры освещения для Three.js
 * @param {string} timeOfDay
 * @returns {Object} Lighting parameters
 */
export function getLightingParams(timeOfDay = 'day') {
  const visuals = getTimeOfDayVisuals(timeOfDay);
  return visuals.lighting;
}

/**
 * Получить цвета неба для градиента
 * @param {string} timeOfDay
 * @returns {Object} Sky colors
 */
export function getSkyColors(timeOfDay = 'day') {
  const visuals = getTimeOfDayVisuals(timeOfDay);
  return visuals.colors.sky;
}

/**
 * Получить параметры облаков
 * @param {string} timeOfDay
 * @returns {Object} Cloud parameters
 */
export function getCloudParams(timeOfDay = 'day') {
  const visuals = getTimeOfDayVisuals(timeOfDay);
  return visuals.clouds;
}

/**
 * Получить CSS переменные для времени суток
 * @param {string} timeOfDay
 * @returns {Object} CSS variables object
 */
export function getCSSVars(timeOfDay = 'day') {
  const visuals = getTimeOfDayVisuals(timeOfDay);
  return visuals.cssVars;
}

/**
 * Применить CSS переменные к элементу
 * @param {HTMLElement} element
 * @param {string} timeOfDay
 */
export function applyCSSVars(element, timeOfDay = 'day') {
  if (!element) return;
  
  const vars = getCSSVars(timeOfDay);
  Object.entries(vars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Определить время суток по часу (0-23)
 * @param {number} hour - Hour of the day (0-23)
 * @returns {string} Time of day preset name
 */
export function getTimeOfDayFromHour(hour) {
  if (hour >= 5 && hour < 7) return 'sunrise';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'sunset';
  return 'night';
}

/**
 * Интерполяция между двумя пресетами (для плавных переходов)
 * @param {string} from - Starting time of day
 * @param {string} to - Ending time of day
 * @param {number} progress - Progress between 0 and 1
 * @returns {Object} Interpolated visual parameters
 */
export function interpolateTimeOfDay(from, to, progress) {
  const fromVisuals = getTimeOfDayVisuals(from);
  const toVisuals = getTimeOfDayVisuals(to);
  
  // Простая линейная интерполяция (можно улучшить easing функциями)
  const lerp = (a, b, t) => a + (b - a) * t;
  
  // Интерполяция цветов (упрощенная версия)
  const lerpColor = (color1, color2, t) => {
    // Эта функция требует парсинга hex -> rgb -> hex
    // Для продакшена используйте библиотеку типа chroma.js
    return t < 0.5 ? color1 : color2; // Fallback
  };
  
  return {
    lighting: {
      ambient: {
        intensity: lerp(fromVisuals.lighting.ambient.intensity, toVisuals.lighting.ambient.intensity, progress),
        color: lerpColor(fromVisuals.lighting.ambient.color, toVisuals.lighting.ambient.color, progress)
      },
      directional: {
        intensity: lerp(fromVisuals.lighting.directional.intensity, toVisuals.lighting.directional.intensity, progress),
        color: lerpColor(fromVisuals.lighting.directional.color, toVisuals.lighting.directional.color, progress),
        position: fromVisuals.lighting.directional.position.map((val, i) => 
          lerp(val, toVisuals.lighting.directional.position[i], progress)
        )
      }
    },
    // ... можно добавить интерполяцию других параметров
  };
}

// ============================================================================
// МОДИФИКАТОРЫ: Изменение параметров на основе погодных условий
// ============================================================================

/**
 * Модифицировать визуальные параметры для облачной погоды
 * @param {Object} baseVisuals - Base visual parameters
 * @returns {Object} Modified visuals
 */
export function applyCloudyModifier(baseVisuals) {
  return {
    ...baseVisuals,
    lighting: {
      ...baseVisuals.lighting,
      ambient: {
        ...baseVisuals.lighting.ambient,
        intensity: baseVisuals.lighting.ambient.intensity * 0.7 // Темнее
      },
      directional: {
        ...baseVisuals.lighting.directional,
        intensity: baseVisuals.lighting.directional.intensity * 0.5 // Рассеянный свет
      }
    },
    clouds: {
      ...baseVisuals.clouds,
      density: baseVisuals.clouds.density * 1.5, // Больше облаков
      opacity: Math.min(baseVisuals.clouds.opacity * 1.2, 0.9)
    },
    atmosphere: {
      ...baseVisuals.atmosphere,
      visibility: baseVisuals.atmosphere.visibility * 0.8
    }
  };
}

/**
 * Модифицировать для дождливой погоды
 */
export function applyRainyModifier(baseVisuals) {
  return {
    ...baseVisuals,
    lighting: {
      ...baseVisuals.lighting,
      ambient: {
        ...baseVisuals.lighting.ambient,
        intensity: baseVisuals.lighting.ambient.intensity * 0.5
      },
      directional: {
        ...baseVisuals.lighting.directional,
        intensity: baseVisuals.lighting.directional.intensity * 0.3
      }
    },
    atmosphere: {
      ...baseVisuals.atmosphere,
      fogDensity: baseVisuals.atmosphere.fogDensity * 2,
      visibility: baseVisuals.atmosphere.visibility * 0.6
    },
    global: {
      ...baseVisuals.global,
      saturation: baseVisuals.global.saturation * 0.7,
      contrast: baseVisuals.global.contrast * 0.8
    }
  };
}

/**
 * Модифицировать для тумана/мглы
 */
export function applyMistyModifier(baseVisuals) {
  return {
    ...baseVisuals,
    atmosphere: {
      ...baseVisuals.atmosphere,
      fogDensity: baseVisuals.atmosphere.fogDensity * 4,
      visibility: 0.3,
      haze: 0.8
    },
    lighting: {
      ...baseVisuals.lighting,
      ambient: {
        ...baseVisuals.lighting.ambient,
        intensity: baseVisuals.lighting.ambient.intensity * 0.6
      }
    },
    global: {
      ...baseVisuals.global,
      contrast: baseVisuals.global.contrast * 0.5,
      saturation: baseVisuals.global.saturation * 0.6
    }
  };
}

// ============================================================================
// ЭКСПОРТ ВСЕГО
// ============================================================================

export default {
  TIME_OF_DAY_PRESETS,
  getTimeOfDayVisuals,
  getLightingParams,
  getSkyColors,
  getCloudParams,
  getCSSVars,
  applyCSSVars,
  getTimeOfDayFromHour,
  interpolateTimeOfDay,
  applyCloudyModifier,
  applyRainyModifier,
  applyMistyModifier
};
