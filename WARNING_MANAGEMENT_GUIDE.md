# Warning Management System - Usage Guide

Полная система управления предупреждениями о погоде с поддержкой очередей и валидацией.

---

## 📋 Архитектура

### Компоненты системы

1. **`useWarningModal` hook** - управление состоянием модали и очередью
2. **`validateWarning()` - валидация структуры предупреждений
3. **`WarningManager` компонента - автоматическое управление предупреждениями
4. **`WarningModal` компонента - UI модали с поддержкой 3 уровней серьезности
5. **`WeatherAlerts` компонента - отображение предупреждений в правом углу

---

## 🚀 Быстрый старт

### 1. Использование в компоненте

```jsx
import { useWarningModal } from './hooks/useWarningModal';
import { validateWarning } from './services/weatherService';

export default function MyComponent() {
  const { isOpen, currentWarning, openWarning, closeWarning } = useWarningModal();

  const handleShowWarning = () => {
    const warning = {
      level: 'yellow',
      event: 'Snowfall Warning',
      description: 'Light snow expected',
      start: Math.floor(Date.now() / 1000),
      end: Math.floor(Date.now() / 1000) + 3600,
    };

    // Валидировать перед открытием
    const validation = validateWarning(warning);
    if (validation.isValid) {
      openWarning(warning);
    } else {
      console.error('Invalid warning:', validation.errors);
    }
  };

  return (
    <>
      <button onClick={handleShowWarning}>Show Warning</button>
      {isOpen && currentWarning && (
        <WarningModal warning={currentWarning} onClose={closeWarning} />
      )}
    </>
  );
}
```

### 2. Использование WarningManager (рекомендуется)

```jsx
import WarningManager from './components/WarningManager';

export default function App() {
  const [warnings, setWarnings] = useState([]);
  const [location, setLocation] = useState('Ottawa');

  useEffect(() => {
    const fetchWarnings = async () => {
      const data = await getWeatherAlerts(lat, lon);
      setWarnings(data.alerts);
    };
    fetchWarnings();
  }, [lat, lon]);

  return (
    <div>
      <WarningManager
        warnings={warnings}
        location={location}
        severityFilter={['red', 'orange', 'yellow']}
        autoShow={true}
        onWarningChange={(state) => {
          console.log('Current warning:', state.warning);
          console.log('Queue length:', state.queueLength);
        }}
      />
    </div>
  );
}
```

---

## 📝 Структура предупреждения

```typescript
interface Warning {
  // Обязательные поля
  level: 'red' | 'orange' | 'yellow';  // Уровень серьезности
  event: string;                        // Название события (например, "Tornado Warning")
  description: string;                  // Описание предупреждения

  // Опциональные поля
  start?: number;                       // Unix timestamp начала
  end?: number;                         // Unix timestamp конца
  tags?: string[];                      // Теги локаций (например, ['Ottawa', 'Eastern Ontario'])
  sender_name?: string;                 // Источник (например, 'Environment Canada')
}
```

### Пример полного предупреждения

```javascript
const redAlert = {
  level: 'red',
  event: 'Tornado Warning',
  description: 'A confirmed tornado is occurring. Take immediate shelter.',
  start: 1735468800,
  end: 1735472400,
  tags: ['Ottawa', 'Eastern Ontario'],
  sender_name: 'Environment Canada',
};
```

---

## ✅ Валидация

### Функция `validateWarning()`

```javascript
import { validateWarning } from './services/weatherService';

const warning = { level: 'yellow', event: 'Snow' };
const validation = validateWarning(warning);

console.log(validation);
// {
//   isValid: false,
//   errors: [
//     'Missing description',
//     'Description must be a non-empty string'
//   ]
// }
```

### Что проверяется

✅ Наличие обязательных полей (level, event, description)
✅ Валидность level ('yellow', 'orange', 'red')
✅ Корректность типов данных
✅ Валидность timestamp'ов (если указаны)
✅ Start < end (если оба указаны)
✅ Валидность массивов и строк

---

## 🎨 Уровни серьезности и стили

### Red (Критический)

```javascript
{ level: 'red', event: 'Tornado Warning', ... }
```

**Цвета:**
- Фон: `bg-red-50/90` (светло-красный)
- Полоса: `border-l-4 border-red-500`
- Иконка: `text-red-500`

**Примеры:**
- Tornado Warning
- Extreme Weather Warning
- Hurricane Warning

### Orange (Высокий)

```javascript
{ level: 'orange', event: 'Heavy Snow Warning', ... }
```

**Цвета:**
- Фон: `bg-orange-50/90` (светло-оранжевый)
- Полоса: `border-l-4 border-orange-500`
- Иконка: `text-orange-500`

**Примеры:**
- Heavy Snow Warning
- Ice Storm Warning
- Freezing Rain Warning

### Yellow (Рекомендация)

```javascript
{ level: 'yellow', event: 'Snowfall Warning', ... }
```

**Цвета:**
- Фон: `bg-yellow-50/90` (светло-жёлтый)
- Полоса: `border-l-4 border-yellow-500`
- Иконка: `text-yellow-600`

**Примеры:**
- Snowfall Advisory
- Wind Advisory
- Fog Advisory

---

## 🔄 API Hook'а `useWarningModal`

### Возвращаемые значения

```javascript
const {
  isOpen,           // boolean - открыта ли модаль
  currentWarning,   // object | null - текущее предупреждение
  warningQueue,     // array - очередь предупреждений
  openWarning,      // function(warning) - открыть предупреждение
  closeWarning,     // function() - закрыть и показать следующее
  clearQueue,       // function() - очистить всю очередь
  addWarnings,      // function(warnings[]) - добавить несколько сразу
  getQueueLength,   // function() => number - получить длину очереди
} = useWarningModal();
```

### Примеры использования

#### Открыть одно предупреждение

```javascript
openWarning({
  level: 'yellow',
  event: 'Snowfall Warning',
  description: 'Light snow expected',
});
```

#### Добавить несколько предупреждений

```javascript
addWarnings([
  { level: 'yellow', event: 'Snow', description: '...' },
  { level: 'orange', event: 'Heavy Snow', description: '...' },
  { level: 'red', event: 'Tornado', description: '...' },
]);
```

#### Обойти по всей очереди

```javascript
while (getQueueLength() > 0) {
  console.log('Current:', currentWarning);
  closeWarning();
}
```

---

## 🔍 Фильтрация и сортировка

### Фильтр по серьезности

```javascript
import { filterWarningsBySeverity } from './services/weatherService';

const warnings = [
  { level: 'yellow', event: 'Snow', ... },
  { level: 'orange', event: 'Heavy Snow', ... },
  { level: 'red', event: 'Tornado', ... },
];

// Только красные
const critical = filterWarningsBySeverity(warnings, 'red');

// Красные и оранжевые
const urgent = filterWarningsBySeverity(warnings, ['red', 'orange']);
```

### Сортировка по серьезности

```javascript
import { sortWarningsBySeverity } from './services/weatherService';

const sorted = sortWarningsBySeverity(warnings);
// Порядок: red > orange > yellow
```

---

## 📋 WarningManager Props

```typescript
interface WarningManagerProps {
  warnings: Warning[];           // Массив предупреждений
  location: string;              // Название локации
  severityFilter?: string[];     // По умолчанию: ['red', 'orange', 'yellow']
  autoShow?: boolean;            // По умолчанию: true - автоматически показывать
  onWarningChange?: Function;    // Callback при смене текущего предупреждения
}
```

### Пример с callback

```jsx
<WarningManager
  warnings={warnings}
  location="Ottawa"
  onWarningChange={(state) => {
    const { warning, isOpen, queueLength } = state;
    console.log(`Showing warning: ${warning?.event} (${queueLength} total)`);
  }}
/>
```

---

## 🧪 Тестирование

### Unit тесты включают

✅ Валидация структуры предупреждений
✅ Управление очередью
✅ Фильтрация по серьезности
✅ Сортировка
✅ Граничные случаи (null, undefined, пустые массивы)

### Запуск тестов

```bash
npm test -- src/services/weatherService.test.js
npm test -- src/hooks/useWarningModal.test.js
```

### Пример теста

```javascript
it('should sort by severity (red > orange > yellow)', () => {
  const warnings = [
    { level: 'yellow', event: 'Snow' },
    { level: 'red', event: 'Tornado' },
    { level: 'orange', event: 'Heavy Snow' },
  ];
  
  const result = sortWarningsBySeverity(warnings);
  
  expect(result[0].level).toBe('red');
  expect(result[1].level).toBe('orange');
  expect(result[2].level).toBe('yellow');
});
```

---

## 🎯 Best Practices

### ✅ Правильно

```javascript
// 1. Всегда валидировать перед открытием
const validation = validateWarning(warning);
if (validation.isValid) {
  openWarning(warning);
}

// 2. Использовать WarningManager для автоматического управления
<WarningManager warnings={data.alerts} location={location} />

// 3. Предоставлять полную информацию
const warning = {
  level: 'orange',
  event: 'Heavy Snow Warning',
  description: 'Heavy snow with accumulation up to 30cm',
  start: Math.floor(Date.now() / 1000),
  end: Math.floor(Date.now() / 1000) + 86400,
  tags: ['Ottawa'],
  sender_name: 'Environment Canada',
};

// 4. Обрабатывать ошибки валидации
const validation = validateWarning(warning);
if (!validation.isValid) {
  logger.error('Warning validation failed:', validation.errors);
  return;
}
```

### ❌ Неправильно

```javascript
// 1. Открывать без валидации
openWarning(unknownData);

// 2. Передавать неполные данные
openWarning({ level: 'yellow' }); // Missing required fields!

// 3. Игнорировать ошибки
validateWarning(warning); // Не проверяем результат

// 4. Использовать неправильные типы
openWarning('yellow'); // Передаём строку вместо объекта
```

---

## 📊 Примеры интеграции

### С WeatherAPI

```javascript
async function handleWeatherData(data) {
  const alerts = data.alerts || [];
  
  // Валидировать каждое предупреждение
  const validAlerts = alerts
    .filter(alert => validateWarning(alert).isValid)
    .map(alert => ({
      ...alert,
      level: classifyAlertSeverity(alert.event, alert.description),
    }));

  setAlerts(validAlerts);
}
```

### С реальными данными

```javascript
const weatherData = {
  alerts: [
    {
      level: 'yellow',
      event: 'Snowfall Warning',
      description: 'Snowfall with rates of 2 to 4 cm per hour...',
      start: 1735468800,
      end: 1735497600,
      tags: ['Ottawa', 'Eastern Ontario'],
      sender_name: 'Environment Canada',
    },
  ],
};

const manager = <WarningManager warnings={weatherData.alerts} location="Ottawa" />;
```

---

## 🐛 Отладка

### Включить логирование

```javascript
// В WarningManager.jsx добавить логирование
const { isOpen, currentWarning } = useWarningModal();

useEffect(() => {
  console.log('[WarningManager]', {
    isOpen,
    currentWarning: currentWarning?.event,
    queueLength: warningQueue.length,
  });
}, [isOpen, currentWarning, warningQueue]);
```

### Проверить валидацию

```javascript
const warning = {...};
const validation = validateWarning(warning);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  validation.errors.forEach(err => console.error(`  - ${err}`));
}
```

---

## 📈 Производительность

- **Hook**: Использует `useCallback` для оптимизации
- **Дедупликация**: Автоматически избегает дублей в очереди
- **Мемоизация**: Кэширует стили и форматирование

---

## ❓ FAQ

**Q: Как ограничить количество предупреждений в очереди?**
A: Используйте `severityFilter` в `WarningManager`:
```jsx
<WarningManager
  warnings={warnings}
  severityFilter={['red']} // Только критические
/>
```

**Q: Как сделать автоматическое закрытие?**
A: Передайте `autoCloseDelay` в `WarningModal`:
```jsx
<WarningModal warning={warning} onClose={closeWarning} autoCloseDelay={5000} />
```

**Q: Как перейти к следующему предупреждению?**
A: Нажмите кнопку "Next" в модали или вызовите `closeWarning()`:
```javascript
closeWarning(); // Закроет текущее, покажет следующее
```

**Q: Как очистить очередь?**
A: Используйте `clearQueue()`:
```javascript
clearQueue(); // Удалит все предупреждения
```

---

## ✨ Завершение

Система полностью реализована и протестирована! ✅

**Используйте:**
- `useWarningModal` для управления состоянием
- `validateWarning()` для проверки данных
- `WarningManager` для автоматического отображения
- `WarningModal` для кастомизации UI
- `WeatherAlerts` для отображения в углу

Happy coding! 🚀
