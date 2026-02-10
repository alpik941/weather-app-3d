/**
 * ПРИМЕР: Рефакторинг LightingSection для использования единой системы
 * 
 * ДО: Хардкод значений в компоненте
 * ПОСЛЕ: Использование timeOfDayVisuals.js
 */

import React from 'react';
import { getLightingParams } from '../../utils/timeOfDayVisuals';

// ============================================================================
// СТАРЫЙ ПОДХОД (до рефакторинга)
// ============================================================================
/*
export default function LightingSection({
  isNight,
  isRaining,
  isGoldenHour,
  isMistyCondition
}) {
  return (
    <>
      <ambientLight
        intensity={isMistyCondition ? 0.25 : (isRaining ? 0.15 : isNight ? 0.2 : isGoldenHour ? 0.4 : 0.6)}
        color={isNight ? "#2f3545" : "#FFFFFF"}
      />
      <directionalLight
        position={isNight ? [-6, 12, 4] : [10, 10, 5]}
        intensity={isMistyCondition ? 0.2 : (isRaining ? 0.15 : isNight ? 0.3 : 1)}
        color={isGoldenHour ? "#FF8C42" : (isNight ? "#7586a3" : "#FFFFFF")}
        castShadow
      />
    </>
  );
}
*/

// ============================================================================
// НОВЫЙ ПОДХОД (с единой системой)
// ============================================================================

export default function LightingSection({
  timeOfDay = 'day', // 'sunrise' | 'day' | 'sunset' | 'night'
  weatherCondition = 'clear', // 'clear' | 'cloudy' | 'rainy' | 'misty'
}) {
  // Получаем параметры освещения из единой системы
  const lighting = getLightingParams(timeOfDay);

  // Модифицируем интенсивность на основе погодных условий
  const getWeatherModifier = () => {
    switch (weatherCondition) {
      case 'rainy': return 0.5;
      case 'cloudy': return 0.7;
      case 'misty': return 0.6;
      default: return 1.0;
    }
  };

  const weatherModifier = getWeatherModifier();

  return (
    <>
      {/* Рассеянный свет */}
      <ambientLight
        intensity={lighting.ambient.intensity * weatherModifier}
        color={lighting.ambient.color}
      />
      
      {/* Направленный свет (солнце/луна) */}
      <directionalLight
        position={lighting.directional.position}
        intensity={lighting.directional.intensity * weatherModifier}
        color={lighting.directional.color}
        castShadow
      />

      {/* Дополнительная подсветка для ночи (звездный свет) */}
      {timeOfDay === 'night' && (
        <hemisphereLight
          skyColor="#1A2238"
          groundColor="#0B1026"
          intensity={0.1}
        />
      )}
    </>
  );
}

// ============================================================================
// СРАВНЕНИЕ
// ============================================================================

/*
ПРЕИМУЩЕСТВА НОВОГО ПОДХОДА:

1. ✅ Консистентность
   - Старый: Цвета "#2f3545" и "#7586a3" не согласованы с другими частями приложения
   - Новый: Все цвета из единого источника timeOfDayVisuals.js

2. ✅ Читаемость
   - Старый: Тернарный оператор 4 уровня вложенности
   - Новый: Простой switch для модификатора

3. ✅ Масштабируемость
   - Старый: Добавить "golden hour" = добавить еще один условный оператор
   - Новый: Просто передать timeOfDay='goldenHour'

4. ✅ Поддерживаемость
   - Старый: Изменение цвета = редактировать каждый компонент
   - Новый: Изменение цвета = правка в одном месте (timeOfDayVisuals.js)

5. ✅ Тестируемость
   - Старый: Сложно протестировать все комбинации пропсов
   - Новый: Тестируем timeOfDayVisuals.js отдельно, компонент простой

6. ✅ DX (Developer Experience)
   - Старый: Разработчик не знает, какие значения использовать
   - Новый: Система подсказывает правильные параметры
*/
