# Руководство по системе классификации алертов

## Обзор

Система классификации алертов автоматически определяет уровень серьезности на основе типа события и отображает его с соответствующей цветовой схемой.

## Уровни серьезности и их цвета

### 🔴 RED (Красный) - КРИТИЧЕСКИ ОПАСНЫЕ УСЛОВИЯ
**Используется для:** Самые опасные погодные явления, требующие немедленных действий

| Событие | Примеры |
|---------|---------|
| Tornado | Tornado Warning, Tornado Watch |
| Hurricane/Typhoon | Hurricane Warning, Typhoon Alert |
| Extreme Weather | Extreme Cold Warning, Extreme Heat Warning |
| Blizzard | Blizzard Warning |
| Flash Flood | Flash Flood Warning |
| Severe Thunderstorm | Severe Thunderstorm Warning |

**Визуальные свойства:**
- Фон: ярко-красный (bg-red-50 light / bg-red-900/20 dark)
- Левая полоса: красная
- Иконка: красная
- Кнопка закрытия: красная с hover-эффектом

---

### 🟠 ORANGE (Оранжевый) - ВЫСОКАЯ ОПАСНОСТЬ
**Используется для:** Значительные погодные угрозы, требующие подготовки

| Событие | Примеры |
|---------|---------|
| Heavy Snow | Heavy Snow Warning, Heavy Snowfall Alert |
| Heavy Rain | Heavy Rain Warning, Heavy Rainfall |
| Heavy Wind | High Wind Warning, Strong Wind Advisory |
| Ice Storm | Ice Storm Warning, Freezing Rain Warning |
| Winter Storm | Winter Storm Warning |
| Frost | Frost Warning, Freeze Warning |

**Визуальные свойства:**
- Фон: оранжевый (bg-orange-50 light / bg-orange-900/20 dark)
- Левая полоса: оранжевая
- Иконка: оранжевая
- Кнопка закрытия: оранжевая с hover-эффектом

---

### 🟡 YELLOW (Желтый) - ПРЕДУПРЕЖДЕНИЕ/РЕКОМЕНДАЦИЯ
**Используется для:** Менее опасные условия, требующие внимания или подготовки

| Событие | Примеры |
|---------|---------|
| Snow Advisory | Snow Advisory, Light Snow Watch |
| Wind Advisory | Wind Advisory, Wind Watch |
| Fog Warning | Dense Fog Advisory, Fog Advisory |
| Freeze Watch | Freeze Watch, Frost Advisory |
| Visibility | Poor Visibility Advisory, Slippery Roads |
| Drifting | Blowing Snow Advisory, Drifting Snow |

**Визуальные свойства:**
- Фон: светло-желтый (bg-yellow-50 light / bg-yellow-900/20 dark)
- Левая полоса: желтая
- Иконка: темно-желтая (yellow-600)
- Кнопка закрытия: темно-желтая с hover-эффектом

---

## Техническая реализация

### 1. Классификация в weatherService.js

```javascript
const classifyAlertSeverity = (event, description) => {
  const text = `${event} ${description}`.toLowerCase();
  
  // Ключевые слова для каждого уровня
  const redKeywords = ['tornado', 'extreme', 'hurricane', 'blizzard', 'flash flood'];
  const orangeKeywords = ['heavy snow', 'heavy rain', 'ice storm', 'frost warning'];
  const yellowKeywords = ['snow', 'wind', 'fog', 'freeze', 'advisory', 'watch'];
  
  if (redKeywords.some(kw => text.includes(kw))) return 'red';
  if (orangeKeywords.some(kw => text.includes(kw))) return 'orange';
  if (yellowKeywords.some(kw => text.includes(kw))) return 'yellow';
  
  return 'yellow'; // Значение по умолчанию
};
```

### 2. Отрисовка в WeatherAlerts.jsx

```javascript
const getAlertStyles = (severity = 'yellow') => {
  const styles = {
    red: { /* красные стили */ },
    orange: { /* оранжевые стили */ },
    yellow: { /* желтые стили */ }
  };
  return styles[severity] || styles.yellow;
};
```

### 3. Кнопка закрытия (X)

```jsx
<button
  onClick={() => onDismiss(index)}
  className={`${styles.closeBtn} ml-3 p-1 rounded-full transition-all`}
  aria-label="Close warning"
  title="Close warning"
>
  <X className="w-5 h-5" />
</button>
```

---

## Примеры для Ottawa, Canada (январь)

### Пример 1: Предупреждение о снеге (Yellow)

```
WeatherAPI Data:
{
  "event": "Snowfall",
  "description": "Expected snowfall of 15-20 cm with accumulation"
}

Classification: YELLOW
```

```
┌─────────────────────────────────────┬─────┐
│ ⚠ Snowfall                          │  ×  │
│ Expected snowfall of 15-20 cm       │     │
│ 🕐 Until Tonight                    │     │
└─────────────────────────────────────┴─────┘
  ← Yellow border / Yellow background
```

---

### Пример 2: Ледяной дождь (Orange)

```
WeatherAPI Data:
{
  "event": "Freezing Rain",
  "description": "Heavy freezing rain warning with ice accumulation"
}

Classification: ORANGE
```

```
┌─────────────────────────────────────┬─────┐
│ ⚠ Freezing Rain                     │  ×  │
│ Heavy freezing rain warning         │     │
│ 🕐 Until Tomorrow                   │     │
└─────────────────────────────────────┴─────┘
  ← Orange border / Orange background
```

---

### Пример 3: Торнадо (Red)

```
WeatherAPI Data:
{
  "event": "Tornado Warning",
  "description": "A tornado is occurring"
}

Classification: RED
```

```
┌─────────────────────────────────────┬─────┐
│ ⚠ Tornado Warning                   │  ×  │
│ A tornado is occurring              │     │
│ 🕐 Until Tonight                    │     │
└─────────────────────────────────────┴─────┘
  ← Red border / Red background
```

---

## Тестирование системы

### 1. Локальное тестирование (Ottawa, Canada)

```bash
# Откройте приложение
npm run dev

# В браузере введите: Ottawa, Canada

# Проверьте в консоли браузера (F12):
# Ищите логирование вида:
# [weatherService] Alert severity classification: { event: "...", severity: "red|orange|yellow" }
```

### 2. Проверка цветов алертов

**Откройте инструменты разработчика (F12) → Elements:**

```html
<!-- RED Alert -->
<div class="bg-red-50/90 dark:bg-red-900/20 border-l-4 border-red-500">
  <!-- ...содержимое... -->
</div>

<!-- ORANGE Alert -->
<div class="bg-orange-50/90 dark:bg-orange-900/20 border-l-4 border-orange-500">
  <!-- ...содержимое... -->
</div>

<!-- YELLOW Alert -->
<div class="bg-yellow-50/90 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
  <!-- ...содержимое... -->
</div>
```

### 3. Проверка кнопки закрытия

1. Откройте любой алерт
2. Наведите мышь на кнопку X в правом верхнем углу
3. Проверьте:
   - 🔵 Кнопка меняет цвет при наведении (hover)
   - ✓ Клик закрывает алерт
   - ✓ Кнопка имеет правильный размер (32x32px)

---

## Настройка ключевых слов для классификации

Для добавления нового типа алерта отредактируйте `classifyAlertSeverity()` в `src/services/weatherService.js`:

```javascript
const classifyAlertSeverity = (event, description) => {
  const text = `${event} ${description}`.toLowerCase();
  
  // Добавьте новые ключевые слова в соответствующие массивы:
  const redKeywords = [
    'tornado',           // существующее
    'my_new_condition'   // новое условие
  ];
  
  // ... остальной код ...
};
```

---

## Доступность (a11y)

Все кнопки закрытия имеют:
- ✅ `aria-label="Close warning"` - для читалок
- ✅ `title="Close warning"` - для всплывающей подсказки
- ✅ Видимый фокус при табуляции
- ✅ Контрастный цвет текста

---

## Совместимость с темами

Система работает как в светлой, так и в темной теме:

**Светлая тема (Light Mode):**
- Более яркие цвета для контрастности
- Прозрачный фон (50/90)

**Темная тема (Dark Mode):**
- Приглушенные цвета для комфорта
- Более прозрачный фон (900/20)

---

## Статус реализации

- ✅ Классификация по 3 уровням (Red/Orange/Yellow)
- ✅ Автоматическое определение уровня по ключевым словам
- ✅ Дизайн адаптирован для светлой и темной темы
- ✅ Кнопка закрытия для всех алертов
- ✅ Доступность (a11y) соблюдена
- ✅ Полная интеграция с WeatherAPI.com
