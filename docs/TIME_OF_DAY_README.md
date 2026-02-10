# 🎨 Единая система визуальных стилей

## 📖 Введение

Это **централизованная система дизайн-токенов** для управления визуальными стилями погодного приложения в зависимости от времени суток.

### 🎯 Цель

Обеспечить **единообразие** визуального стиля между:
- Three.js 3D сценой (освещение, небо, облака)
- CSS/React компонентами (градиенты, цвета, фильтры)
- UI элементами (текст, иконки, оверлеи)

### ✨ Философия

❌ **НЕ**: Создавать разные стили для каждого сценария  
✅ **ДА**: Использовать единые параметры (токены), плавно меняющиеся по времени суток

---

## 🚀 Быстрый старт

### 1. Импортируйте систему

```javascript
import { 
  getTimeOfDayVisuals,
  getLightingParams,
  getSkyColors,
  getCloudParams,
  getCSSVars,
  getTimeOfDayFromHour
} from './utils/timeOfDayVisuals';
```

### 2. Получите параметры для текущего времени

```javascript
// Автоматически определить время суток
const currentHour = new Date().getHours();
const timeOfDay = getTimeOfDayFromHour(currentHour);
// Результат: 'sunrise' | 'day' | 'sunset' | 'night'

// Получить все визуальные параметры
const visuals = getTimeOfDayVisuals(timeOfDay);
```

### 3. Используйте в компонентах

**Three.js (освещение):**
```javascript
const lighting = getLightingParams(timeOfDay);

<ambientLight 
  intensity={lighting.ambient.intensity}
  color={lighting.ambient.color}
/>
<directionalLight
  position={lighting.directional.position}
  intensity={lighting.directional.intensity}
  color={lighting.directional.color}
/>
```

**React/CSS (фоновый градиент):**
```javascript
const cssVars = getCSSVars(timeOfDay);

<div style={{
  background: cssVars['--sky-gradient'],
  color: cssVars['--text-primary']
}}>
  Контент
</div>
```

---

## 📂 Структура файлов

```
src/
├── utils/
│   └── timeOfDayVisuals.js    ← 🎨 Основной файл с токенами
│
docs/
├── TIME_OF_DAY_SYSTEM.md      ← 📚 Полная документация
├── VISUAL_PARAMETERS_REFERENCE.md  ← 📊 Таблицы всех параметров
└── examples/
    ├── LightingSection.example.jsx     ← Пример Three.js
    └── CSSComponentsExample.jsx        ← Пример React/CSS
```

---

## 🌅 Времена суток

### 4 базовых пресета

| Время | Часы | Палитра | Настроение |
|-------|------|---------|------------|
| 🌅 **Sunrise** | 5:00-7:00 | Розово-оранжевая | Романтичное, мягкое |
| ☀️ **Day** | 7:00-17:00 | Ярко-синяя | Энергичное, четкое |
| 🌇 **Sunset** | 17:00-19:00 | Красно-золотая | Драматичное, теплое |
| 🌙 **Night** | 19:00-5:00 | Темно-синяя | Таинственное, спокойное |

---

## 🌦️ Модификаторы погоды

Применяются поверх базовых пресетов для разных погодных условий:

```javascript
import { 
  applyCloudyModifier, 
  applyRainyModifier, 
  applyMistyModifier 
} from './utils/timeOfDayVisuals';

let visuals = getTimeOfDayVisuals('day');

if (weatherCondition === 'rainy') {
  visuals = applyRainyModifier(visuals);
}
```

### Эффекты модификаторов

| Модификатор | Освещение | Видимость | Контраст | Насыщенность |
|-------------|-----------|-----------|----------|--------------|
| **Cloudy** | -30% | -20% | = | = |
| **Rainy** | -50-70% | -40% | -20% | -30% |
| **Misty** | -40% | -70% | -50% | -40% |

---

## 🎨 Ключевые параметры

### Цвета неба (Sky)

```javascript
const skyColors = getSkyColors('sunset');
// {
//   top: '#FF6347',      // Томатно-красный
//   middle: '#FF8C42',   // Оранжево-золотой
//   bottom: '#FFD700',   // Золотой
//   horizon: '#FFA07A'   // Лососевый
// }
```

### Освещение (Lighting)

```javascript
const lighting = getLightingParams('day');
// {
//   ambient: { intensity: 0.7, color: '#FFFFFF' },
//   directional: { 
//     intensity: 1.0, 
//     color: '#FFFFFF',
//     position: [10, 12, 5]
//   },
//   sunGlow: 1.5
// }
```

### Облака (Clouds)

```javascript
const clouds = getCloudParams('sunrise');
// {
//   opacity: 0.6,
//   density: 0.4,
//   color: '#FFB6C1',
//   edgeSoftness: 0.8,
//   contrast: 0.3
// }
```

---

## 💡 Примеры использования

### Пример 1: Three.js компонент с освещением

```jsx
import { getLightingParams } from '../utils/timeOfDayVisuals';

function WeatherScene({ timeOfDay }) {
  const lighting = getLightingParams(timeOfDay);
  
  return (
    <Canvas>
      <ambientLight 
        intensity={lighting.ambient.intensity}
        color={lighting.ambient.color}
      />
      <directionalLight
        position={lighting.directional.position}
        intensity={lighting.directional.intensity}
        color={lighting.directional.color}
        castShadow
      />
      {/* Остальная сцена */}
    </Canvas>
  );
}
```

### Пример 2: React компонент с градиентом

```jsx
import { getCSSVars } from '../utils/timeOfDayVisuals';

function WeatherBackground({ timeOfDay, children }) {
  const cssVars = getCSSVars(timeOfDay);
  
  return (
    <div style={{ 
      background: cssVars['--sky-gradient'],
      color: cssVars['--text-primary'],
      minHeight: '100vh'
    }}>
      {children}
    </div>
  );
}
```

### Пример 3: Комплексное использование с модификаторами

```jsx
import { 
  getTimeOfDayVisuals, 
  getTimeOfDayFromHour,
  applyRainyModifier,
  applyCloudyModifier
} from '../utils/timeOfDayVisuals';

function App({ weatherData }) {
  // 1. Определить время суток
  const currentHour = new Date().getHours();
  const timeOfDay = getTimeOfDayFromHour(currentHour);
  
  // 2. Получить базовые параметры
  let visuals = getTimeOfDayVisuals(timeOfDay);
  
  // 3. Применить модификаторы погоды
  if (weatherData.condition === 'rainy') {
    visuals = applyRainyModifier(visuals);
  } else if (weatherData.condition === 'cloudy') {
    visuals = applyCloudyModifier(visuals);
  }
  
  // 4. Использовать параметры
  const { lighting, colors, cssVars } = visuals;
  
  return (
    <div style={{ background: cssVars['--sky-gradient'] }}>
      <WeatherScene lighting={lighting} />
      {/* UI компоненты */}
    </div>
  );
}
```

---

## 📚 Полная документация

- **[TIME_OF_DAY_SYSTEM.md](./TIME_OF_DAY_SYSTEM.md)** — Подробное описание системы и принципов
- **[VISUAL_PARAMETERS_REFERENCE.md](./VISUAL_PARAMETERS_REFERENCE.md)** — Справочник всех параметров в таблицах
- **[examples/](./examples/)** — Примеры рефакторинга компонентов

---

## ✅ Преимущества

### 1. **Консистентность**
Один источник правды для всех визуальных параметров

### 2. **Масштабируемость**
Легко добавить новое время суток или модификатор

### 3. **Поддерживаемость**
Все параметры в одном файле, легко обновлять

### 4. **Производительность**
Пресеты вычисляются один раз, переиспользуются везде

### 5. **DX (Developer Experience)**
Простое API, автокомплит, типизация

### 6. **Гибкость**
Модификаторы для погодных условий, интерполация для плавных переходов

---

## 🔮 Будущие улучшения

- [ ] TypeScript типы
- [ ] Интерполяция цветов (chroma.js)
- [ ] Easing функции для анимаций
- [ ] Сезонные вариации
- [ ] Географические модификаторы
- [ ] A/B тестирование палитр
- [ ] "Golden Hour" пресет (17:30-18:00, 6:00-6:30)

---

## 🤝 Вклад

При добавлении новых визуальных параметров:

1. Обновите `timeOfDayVisuals.js`
2. Добавьте документацию в `VISUAL_PARAMETERS_REFERENCE.md`
3. Создайте пример использования в `examples/`
4. Убедитесь в консистентности с существующими пресетами

---

## 📝 Лицензия

Часть проекта Alpik941 Weather App

---

**Автор**: AI/UX Design System  
**Дата**: 2026  
**Версия**: 1.0.0
