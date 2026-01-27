# DynamicWeatherBackground Component

Динамический многослойный фон для погодного приложения Alpik941 с полной поддержкой Tailwind CSS и темной темы.

## 🎨 Архитектура

### Трёхслойная структура (100% высоты экрана):

1. **SKY** (40% высоты, top: 0)
   - Небо с градиентом
   - Звёзды (только ночью)
   - Солнце/Луна с анимацией glow

2. **HORIZON** (30% высоты, top: 40%)
   - Горизонт с переходными цветами
   - Облака с анимацией float

3. **GROUND** (30% высоты, top: 70%)
   - Земля/поверхность
   - Градиент к нижнему краю

## 📦 Установка

Компонент использует зависимости проекта:
```bash
# Уже установлены в проекте Alpik941
- react
- lucide-react
- tailwindcss
```

## 🚀 Быстрый старт

```jsx
import DynamicWeatherBackground from './components/DynamicWeatherBackground';

function App() {
  return (
    <DynamicWeatherBackground
      condition="clear"
      timeOfDay="day"
      temperature={22}
      windSpeed={10}
    >
      {/* Ваш контент здесь */}
      <div className="p-8">
        <h1 className="text-4xl text-white">Hello Weather!</h1>
      </div>
    </DynamicWeatherBackground>
  );
}
```

## 🎛️ Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `condition` | string | `'clear'` | Погодные условия: `'clear'`, `'cloudy'`, `'rainy'`, `'stormy'`, `'snowy'` |
| `timeOfDay` | string | `'day'` | Время суток: `'day'`, `'night'`, `'sunrise'`, `'sunset'` |
| `temperature` | number | `20` | Температура (влияет на цвет солнца) |
| `windSpeed` | number | `0` | Скорость ветра (для будущих эффектов) |
| `children` | ReactNode | - | Контент поверх фона |
| `className` | string | `''` | Дополнительные CSS-классы |

## 🌈 Погодные режимы

### Clear (Ясно)
**День:**
- Sky: `from-blue-400 via-blue-300 to-cyan-200`
- Horizon: `from-cyan-200 via-orange-200 to-amber-200`
- Ground: `from-amber-200 via-yellow-100 to-green-100`

**Ночь:**
- Sky: `from-indigo-950 via-blue-900 to-indigo-800`
- Horizon: `from-indigo-800 via-purple-700 to-indigo-600`
- Ground: `from-indigo-600 via-slate-700 to-slate-800`

### Cloudy (Облачно)
**День:**
- Sky: `from-gray-400 via-blue-200 to-slate-300`
- 3 плавающих облака

**Ночь:**
- Sky: `from-slate-900 via-slate-700 to-slate-600`
- Приглушённые облака

### Rainy (Дождь)
- 60 анимированных капель дождя
- 5 облаков с повышенной непрозрачностью
- Серо-синие оттенки

### Stormy (Гроза)
- 100 быстрых капель дождя
- Тёмные грозовые облака
- Драматичные серые градиенты

### Snowy (Снег)
- 50 падающих снежинок
- Холодные сине-белые тона
- Мягкие градиенты

## ⏰ Время суток

### Day (День)
- Яркое солнце с лучами
- Золотистое свечение
- Насыщенные цвета

### Night (Ночь)
- Луна с кратерами
- 12 мерцающих звёзд
- Глубокие синие/фиолетовые тона

### Sunrise (Рассвет)
- Оранжево-розовые градиенты
- Солнце низко на горизонте
- Мягкое свечение

### Sunset (Закат)
- Красно-пурпурные оттенки
- Солнце у горизонта
- Тёплое освещение

## 🎨 Стилизация

### 100% Tailwind Utilities
```jsx
// ✅ Правильно - Tailwind классы
<div className="bg-gradient-to-b from-blue-400 to-cyan-200 
                transition-all duration-1000" />

// ❌ Неправильно - отдельные CSS файлы
<div className="custom-gradient" /> // NO!
```

### Inline-стили только для динамики
```jsx
// ✅ Правильно - динамические значения
<div style={{ 
  top: `${sunPosition}%`,
  opacity: cloudDensity 
}} />

// ❌ Неправильно - статичные стили
<div style={{ position: 'absolute' }} /> // Используйте className="absolute"
```

## 🌙 Тёмная тема

Компонент автоматически интегрируется с `ThemeContext`:

```jsx
import { ThemeContext } from '../contexts/ThemeContext';

// В компоненте
const { theme } = useContext(ThemeContext);
const isDark = theme === 'dark';

// Использование в классах
<div className="bg-white dark:bg-slate-900 
                text-gray-800 dark:text-white" />
```

## 🎬 Анимации

### Встроенные Tailwind анимации:
- `animate-float` - плавающие облака (3s)
- `animate-glow` - свечение солнца/луны (2s)
- `animate-pulse` - мерцание звёзд (2s)
- `animate-spin-slow` - вращение лучей (20s)

### Кастомные анимации:
```css
/* В tailwind.config.js */
animation: {
  'float': 'float 3s ease-in-out infinite',
  'glow': 'glow 2s ease-in-out infinite',
  'spin-slow': 'spin 20s linear infinite',
}
```

## 🧩 Интеграция с существующим контентом

### Стеклянные карточки:
```jsx
<DynamicWeatherBackground condition="rainy" timeOfDay="night">
  <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 
                  rounded-3xl shadow-2xl p-8 
                  border border-white/30 dark:border-slate-700/30">
    <h2>Погодная карточка</h2>
  </div>
</DynamicWeatherBackground>
```

### Адаптивный текст:
```jsx
<h1 className="text-3xl font-bold 
               text-gray-800 dark:text-white 
               transition-colors duration-300">
  Responsive Title
</h1>
```

### Кнопки с hover эффектами:
```jsx
<button className="px-6 py-3 rounded-lg 
                   bg-white/90 dark:bg-slate-800/90 
                   shadow-lg transition-all 
                   hover:scale-105 active:scale-95">
  Click Me
</button>
```

## 📱 Responsive дизайн

Tailwind breakpoints:
- `xs`: 475px (кастомный)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Адаптивная сетка */}
</div>
```

## 🔧 Кастомизация

### Добавление новых погодных условий:

```jsx
// В DynamicWeatherBackground.jsx
const gradients = {
  // ... существующие
  foggy: {
    day: {
      sky: "from-gray-300 via-slate-200 to-blue-100",
      horizon: "from-blue-100 via-gray-100 to-slate-100",
      ground: "from-slate-100 via-gray-50 to-white"
    },
    night: {
      sky: "from-slate-700 via-gray-700 to-slate-600",
      horizon: "from-slate-600 via-gray-600 to-slate-500",
      ground: "from-slate-500 via-gray-500 to-slate-600"
    }
  }
};
```

### Добавление новых элементов:

```jsx
// Пример: молния для грозы
const renderLightning = () => {
  if (condition !== 'stormy') return null;
  
  return (
    <div className="absolute top-0 left-1/2 w-1 h-32 
                    bg-yellow-200 opacity-80 animate-pulse"
         style={{ animationDuration: '0.1s' }}>
    </div>
  );
};
```

## 📊 Производительность

- **CSS Transitions** вместо JS анимаций
- **GPU-ускорение** через transform/opacity
- **Conditional rendering** элементов
- **Lazy loading** для тяжёлых эффектов

```jsx
// Оптимизация рендера звёзд
{(isDark && timeOfDay === 'night') && renderStars()}
```

## 🐛 Troubleshooting

### Проблема: Темная тема не работает
**Решение:** Убедитесь что `ThemeContext` обёрнут вокруг App:
```jsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

### Проблема: Анимации не плавные
**Решение:** Добавьте `transition-all duration-1000` к элементам

### Проблема: Облака не анимируются
**Решение:** Проверьте что `animate-float` определён в tailwind.config.js

## 📚 Примеры использования

### Интеграция в главную страницу:
```jsx
// App.jsx
import DynamicWeatherBackground from './components/DynamicWeatherBackground';
import { useWeather } from './hooks/useWeather';

function App() {
  const { condition, temperature } = useWeather();
  
  return (
    <DynamicWeatherBackground 
      condition={condition}
      timeOfDay="day"
      temperature={temperature}
    >
      <YourWeatherApp />
    </DynamicWeatherBackground>
  );
}
```

### Демо страница:
Смотрите полный пример в `DynamicWeatherBackground.example.jsx`

## 🎯 Best Practices

1. **Всегда используйте Tailwind** для статичных стилей
2. **Inline-стили только для динамики** (вычисляемые значения)
3. **Добавляйте transitions** для плавности (duration-300/500/1000)
4. **Используйте backdrop-blur** для стеклянных эффектов
5. **Темная тема через dark:** префикс, не через JS
6. **Responsive через breakpoints**, не через media queries
7. **GPU-friendly анимации** (transform, opacity, filter)

## 📝 Лицензия

Часть проекта Alpik941 Weather App.

## 🤝 Contributing

При добавлении новых фич:
1. Следуйте Tailwind-only архитектуре
2. Поддерживайте темную тему
3. Добавляйте плавные transitions
4. Документируйте новые props
5. Тестируйте на всех breakpoints

---

Made with ❤️ for Alpik941 Weather App
