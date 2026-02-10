# ⚡ Шпаргалка для разработчиков

> **Быстрый справочник по системе визуальных стилей времени суток**

---

## 🎯 Импорты

```javascript
import { 
  getTimeOfDayVisuals,      // Все параметры
  getLightingParams,         // Только освещение
  getSkyColors,              // Только цвета неба
  getCloudParams,            // Только параметры облаков
  getCSSVars,                // Только CSS переменные
  getTimeOfDayFromHour,      // Определить время по часу
  applyCloudyModifier,       // Модификатор облачной погоды
  applyRainyModifier,        // Модификатор дождя
  applyMistyModifier         // Модификатор тумана
} from './utils/timeOfDayVisuals';
```

---

## 📅 Времена суток

| Название | Часы | Значение |
|----------|------|----------|
| `sunrise` | 5-7 | Рассвет |
| `day` | 7-17 | День |
| `sunset` | 17-19 | Закат |
| `night` | 19-5 | Ночь |

---

## 🎨 Цвета неба (hex)

```javascript
// Рассвет
{ top: '#FF6B6B', middle: '#FFB347', bottom: '#FFE4B5' }

// День
{ top: '#1E88E5', middle: '#42A5F5', bottom: '#90CAF9' }

// Закат  
{ top: '#FF6347', middle: '#FF8C42', bottom: '#FFD700' }

// Ночь
{ top: '#0B1026', middle: '#1A2238', bottom: '#2C3E50' }
```

---

## 💡 Освещение

```javascript
// Ambient Light (рассеянный)
sunrise: { intensity: 0.5,  color: '#FFD4A3' }
day:     { intensity: 0.7,  color: '#FFFFFF' }
sunset:  { intensity: 0.45, color: '#FFB347' }
night:   { intensity: 0.25, color: '#4A5568' }

// Directional Light (направленный)
sunrise: { intensity: 0.6, color: '#FF8C42', position: [-8, 4, 2] }
day:     { intensity: 1.0, color: '#FFFFFF', position: [10, 12, 5] }
sunset:  { intensity: 0.7, color: '#FF6347', position: [8, 3, -2] }
night:   { intensity: 0.35, color: '#9DB4C0', position: [-6, 10, 3] }
```

---

## ☁️ Облака

```javascript
sunrise: { opacity: 0.6,  density: 0.4, color: '#FFB6C1' }
day:     { opacity: 0.8,  density: 0.5, color: '#FFFFFF' }
sunset:  { opacity: 0.75, density: 0.6, color: '#FF7F50' }
night:   { opacity: 0.4,  density: 0.3, color: '#4A5568' }
```

---

## 🌫️ Туман

```javascript
sunrise: 0.015  // Средний
day:     0.005  // Минимальный
sunset:  0.012  // Средний
night:   0.008  // Легкий
```

---

## 📐 Глобальные параметры (0-1)

```javascript
//         Насыщ. Контр. Яркость Теплота
sunrise: { 0.80,  0.60,  0.85,    0.90 }
day:     { 1.00,  1.00,  1.00,    0.50 }
sunset:  { 0.95,  0.75,  0.80,    1.00 }
night:   { 0.50,  0.50,  0.40,    0.20 }
```

---

## 🌦️ Модификаторы

```javascript
// Cloudy (облачно)
ambient: ×0.7, directional: ×0.5, clouds: +50%

// Rainy (дождь)
ambient: ×0.5, directional: ×0.3, fog: ×2, saturation: ×0.7

// Misty (туман)
fog: ×4, visibility: 30%, contrast: ×0.5
```

---

## 💻 Быстрые примеры

### Three.js

```jsx
const { lighting } = getTimeOfDayVisuals('sunset');

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

### React/CSS

```jsx
const { cssVars } = getTimeOfDayVisuals('day');

<div style={{
  background: cssVars['--sky-gradient'],
  color: cssVars['--text-primary']
}}>
  Контент
</div>
```

### Автоопределение

```javascript
const hour = new Date().getHours();
const timeOfDay = getTimeOfDayFromHour(hour);
const visuals = getTimeOfDayVisuals(timeOfDay);
```

### С модификаторами

```javascript
let visuals = getTimeOfDayVisuals('day');

if (weather === 'rainy') {
  visuals = applyRainyModifier(visuals);
}
```

---

## 🎯 CSS переменные

```css
/* Автоматически применяются через TimeOfDayProvider */

--sky-gradient: /* Градиент неба */
--text-primary: /* Основной текст */
--text-secondary: /* Вторичный текст */
--overlay-bg: /* Фон оверлеев */
```

---

## 🔢 Позиции света [x, y, z]

```
Sunrise: [-8,  4,  2]   // Низко слева
Day:     [10, 12,  5]   // Высоко в зените
Sunset:  [ 8,  3, -2]   // Низко справа
Night:   [-6, 10,  3]   // Луна высоко
```

---

## ⚡ Производительность

✅ **DO**: Вызывайте `getTimeOfDayVisuals` один раз, сохраняйте результат  
❌ **DON'T**: Вызывайте в каждом компоненте отдельно

```javascript
// ✅ Хорошо
const visuals = getTimeOfDayVisuals(timeOfDay);
const lighting = visuals.lighting;
const colors = visuals.colors;

// ❌ Плохо
const lighting = getLightingParams(timeOfDay);
const colors = getSkyColors(timeOfDay);
const clouds = getCloudParams(timeOfDay);
```

---

## 🐛 Отладка

```javascript
// Вывести все параметры
const visuals = getTimeOfDayVisuals('sunset');
console.log(JSON.stringify(visuals, null, 2));

// Проверить модификатор
const rainy = applyRainyModifier(visuals);
console.table([
  { param: 'Ambient', base: visuals.lighting.ambient.intensity, modified: rainy.lighting.ambient.intensity },
  { param: 'Fog', base: visuals.atmosphere.fogDensity, modified: rainy.atmosphere.fogDensity }
]);
```

---

## 📚 Полная документация

- [TIME_OF_DAY_README.md](./TIME_OF_DAY_README.md) — Введение
- [TIME_OF_DAY_SYSTEM.md](./TIME_OF_DAY_SYSTEM.md) — Подробная документация
- [VISUAL_PARAMETERS_REFERENCE.md](./VISUAL_PARAMETERS_REFERENCE.md) — Справочник параметров
- [DIAGRAMS_AND_VISUALIZATIONS.md](./DIAGRAMS_AND_VISUALIZATIONS.md) — Диаграммы
- [examples/](./examples/) — Примеры кода

---

**Версия**: 1.0.0 | **Дата**: 2026 | [GitHub](https://github.com/Alpik941/weather-app)
