# WeatherBackground Component

Легковесный погодный фон для React на чистом Tailwind CSS (без Three.js).

## 🎯 Основные принципы

### Стилизация
- ✅ **100% Tailwind utilities** - никаких отдельных CSS модулей
- ✅ **ThemeContext** для автоматического light/dark режима
- ✅ **Адаптивность** через xs/sm/md/lg/xl breakpoints
- ✅ **Backdrop-blur** для glassmorphism UI элементов

### Inline-стили ТОЛЬКО для:
1. **Динамические позиции**: `left: ${cloudOffset}%`
2. **Вычисляемые значения**: `animationDelay: ${i * 0.8}s`
3. **Уникальные параметры**: размер снежинок, скорость частиц
4. **Рандомные значения**: `top: ${Math.random() * 100}%`

## 📦 Быстрый старт

```jsx
import WeatherBackground from './components/WeatherBackground';

function App() {
  return (
    <WeatherBackground condition="clear">
      <YourContent />
    </WeatherBackground>
  );
}
```

## 🎨 Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `condition` | string | `'clear'` | Погодные условия |
| `children` | ReactNode | - | Контент поверх фона |
| `className` | string | `''` | Дополнительные классы |

### Погодные режимы

#### clear (Ясно)
- Солнце с лучами (только светлая тема)
- Луна с кратерами (только тёмная тема)
- Звёзды ночью
- Чистое небо

#### cloudy (Облачно)
- 8 плавающих облаков
- Серо-голубые оттенки
- Приглушённое освещение

#### rainy (Дождь)
- 40 анимированных капель
- 6 облаков
- Серо-синие тона

#### snowy (Снег)
- 30 падающих снежинок
- Бело-голубые градиенты
- Мягкие переходы

## 🏗️ Архитектура

### 3 слоя градиентов

```
┌─────────────────────────┐
│   SKY (45% → 40%)       │ ← Звёзды, солнце/луна
├─────────────────────────┤
│   HORIZON (25% → 30%)   │ ← Облака
├─────────────────────────┤
│   GROUND (30%)          │ ← Статичный слой
└─────────────────────────┘
```

**Mobile**: 45% / 25% / 30%  
**Desktop**: 40% / 30% / 30%

### Градиенты (Tailwind only)

```jsx
// Пример: Ясная погода, светлая тема
sky:     "from-blue-400 via-sky-300 to-cyan-200"
horizon: "from-cyan-200 via-orange-200 to-amber-100"
ground:  "from-amber-100 via-green-50 to-green-100"
```

## ✨ Анимации

### Кастомные (из tailwind.config.js)

```jsx
animate-float       // Плавающие облака (6s)
animate-glow        // Свечение солнца/луны (2s alternate)
animate-pulse-slow  // Медленное мерцание звёзд (3s)
animate-spin-slow   // Вращение лучей солнца (20s)
```

### CSS keyframes

```css
@keyframes fall {
  to { transform: translateY(110vh); }
}
```

Применяется через inline-стили для дождя.

## 📱 Адаптивность

### Mobile (xs, sm < 640px)
- Уменьшенные элементы
- Меньше декоративных частиц
- Скрыты дополнительные облака (lg:block)
- Скрыты дополнительные звёзды (md:block)

### Tablet (md, lg 640-1024px)
- Стандартные размеры
- Все элементы видимы

### Desktop (xl, 2xl > 1024px)
- Hover эффекты на слоях
- Параллакс: `xl:hover:scale-[1.02]`
- Увеличение небесных тел: `xl:hover:scale-110`

## 🎭 Glassmorphism UI

### 3 варианта размытия

```jsx
// Сильное размытие (главные карточки)
className="backdrop-blur-2xl bg-white/50 dark:bg-slate-900/60"

// Матовое стекло (секции, кнопки)
className="backdrop-blur-lg backdrop-saturate-150 bg-white/60"

// Лёгкое размытие (вторичные элементы)
className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80"
```

### Полный стек эффектов

```jsx
className="backdrop-blur-2xl bg-white/50 dark:bg-slate-900/60 
           rounded-3xl shadow-2xl shadow-black/10
           border border-white/20 dark:border-slate-700/50
           ring-1 ring-white/30 dark:ring-slate-600/30
           transition-all duration-300
           hover:bg-white/60 dark:hover:bg-slate-900/70
           hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]
           hover:scale-[1.01]"
```

### Интерактивные кнопки

```jsx
className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80
           shadow-lg shadow-black/5
           border border-white/30 dark:border-slate-600/50
           ring-1 ring-white/20 dark:ring-slate-700/30
           transition-all duration-300
           hover:scale-105 hover:bg-white/90
           hover:shadow-xl active:scale-95
           min-h-[48px]" // Touch target
```

## 🔧 Интеграция с проектом

### 1. ThemeContext

Компонент автоматически подключается к ThemeContext:

```jsx
import { ThemeContext } from '../contexts/ThemeContext';

const { theme } = useContext(ThemeContext);
const isDark = theme === 'dark';
```

### 2. Использование в App.jsx

```jsx
import WeatherBackground from './components/WeatherBackground';
import { useWeather } from './hooks/useWeather';

function App() {
  const { condition } = useWeather(); // ваш хук
  
  return (
    <WeatherBackground condition={condition}>
      <Header />
      <MainContent />
      <Footer />
    </WeatherBackground>
  );
}
```

### 3. С другими компонентами

```jsx
<WeatherBackground condition="rainy">
  <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 
                  rounded-3xl p-8 m-4">
    <WeatherCard data={weatherData} />
  </div>
</WeatherBackground>
```

## 🎨 Кастомизация

### Добавление нового погодного режима

```jsx
// В getLayerClasses()
foggy: {
  sky: isDark
    ? "from-slate-800 via-gray-700 to-slate-600"
    : "from-gray-300 via-slate-200 to-blue-100",
  horizon: isDark
    ? "from-slate-600 via-gray-600 to-gray-500"
    : "from-blue-100 via-gray-100 to-slate-100",
  ground: isDark
    ? "from-gray-500 via-slate-700 to-slate-800"
    : "from-slate-100 via-gray-50 to-white"
}
```

### Изменение скорости анимаций

```jsx
// В renderClouds()
animationDuration: `${8 + i * 3}s` // Медленнее
animationDuration: `${4 + i * 1}s` // Быстрее
```

## 🚀 Производительность

### Оптимизации
- ✅ GPU-ускорение через `transform`
- ✅ Меньше частиц на мобильных (40 капель вместо 100)
- ✅ Conditional rendering (`{condition === 'rainy' && ...}`)
- ✅ Скрытие декора на маленьких экранах
- ✅ `transition-all duration-300` вместо JS анимаций

### Сравнение с DynamicWeatherBackground

| Характеристика | WeatherBackground | DynamicWeatherBackground |
|----------------|-------------------|--------------------------|
| Three.js | ❌ Нет | ✅ Да |
| Размер bundle | ~5KB | ~150KB |
| Производительность | ⚡ Отличная | 🔥 Требовательная |
| Эффекты | CSS анимации | WebGL + частицы |
| Использование | Везде | Главная страница |

## 📝 Пример реального использования

```jsx
import React, { useState } from 'react';
import WeatherBackground from './components/WeatherBackground';
import { useTheme } from './contexts/ThemeContext';

export default function WeatherApp() {
  const { theme } = useTheme();
  const [condition, setCondition] = useState('clear');

  return (
    <WeatherBackground condition={condition} className="min-h-screen">
      
      {/* Главная карточка */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="backdrop-blur-2xl bg-white/50 dark:bg-slate-900/60
                        rounded-3xl shadow-2xl p-8 max-w-2xl w-full
                        border border-white/20 dark:border-slate-700/50
                        ring-1 ring-white/30">
          
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Погода сегодня
          </h1>

          <div className="grid grid-cols-2 gap-4">
            {['clear', 'cloudy', 'rainy', 'snowy'].map(cond => (
              <button
                key={cond}
                onClick={() => setCondition(cond)}
                className={`p-4 rounded-xl backdrop-blur-lg
                           transition-all duration-300
                           ${condition === cond 
                             ? 'bg-blue-500/90 text-white scale-105' 
                             : 'bg-white/60 dark:bg-slate-800/60 hover:scale-102'
                           }`}
              >
                {cond}
              </button>
            ))}
          </div>
          
        </div>
      </div>

    </WeatherBackground>
  );
}
```

## 🐛 Troubleshooting

**Проблема**: Градиенты не плавные  
**Решение**: Добавьте `transition-all duration-1000` на слои

**Проблема**: Облака не двигаются  
**Решение**: Проверьте что `animate-float` определена в tailwind.config.js

**Проблема**: Тёмная тема не работает  
**Решение**: Убедитесь что ThemeContext обёрнут вокруг компонента

**Проблема**: Низкая производительность на мобильных  
**Решение**: Используйте условный рендер для уменьшения частиц

## 📚 Связанные компоненты

- **DynamicWeatherBackground** - с Three.js для главной страницы
- **WeatherCard** - карточка погоды с glassmorphism
- **ThemeContext** - управление темой

---

Made with ❤️ for Alpik941 Weather App
