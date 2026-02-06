# Тестирование системы классификации алертов

## Краткое введение

Файл `src/__mocks__/mockAlerts.js` содержит реалистичные примеры предупреждений о погоде для Ottawa, Canada с разными уровнями серьезности.

---

## Структура тестовых данных

### Yellow Level (Желтый) - Рекомендации и советы

```javascript
{
  sender_name: 'Environment Canada',
  event: 'Snowfall Warning',           // Тип события
  start: 1735468800,                   // UNIX timestamp начала
  end: 1735497600,                     // UNIX timestamp конца
  description: 'Snowfall accumulation...',  // Описание
  tags: ['Ottawa', 'Eastern Ontario'],  // Теги локаций
  severity: 'yellow'                   // ← УРОВЕНЬ СЕРЬЕЗНОСТИ
}
```

### Orange Level (Оранжевый) - Предупреждения

```javascript
{
  sender_name: 'Environment Canada',
  event: 'Heavy Snow Warning',
  start: 1735468800,
  end: 1735511200,
  description: 'Heavy snow expected with total accumulation of 25 to 35 cm...',
  tags: ['Ottawa'],
  severity: 'orange'                   // ← УРОВЕНЬ СЕРЬЕЗНОСТИ
}
```

### Red Level (Красный) - Критические предупреждения

```javascript
{
  sender_name: 'Environment Canada',
  event: 'Tornado Warning',
  start: 1735468800,
  end: 1735472400,
  description: 'A confirmed tornado is occurring...',
  tags: ['Ottawa'],
  severity: 'red'                      // ← УРОВЕНЬ СЕРЬЕЗНОСТИ
}
```

---

## Способы использования

### 1️⃣ Быстрое тестирование с готовыми данными

**Отредактируйте `src/App.jsx`:**

```jsx
import { ottawaTestAlerts } from './__mocks__/mockAlerts';

export default function App() {
  // const [alerts, setAlerts] = useState([]);  // ← закомментируйте
  const [alerts, setAlerts] = useState(ottawaTestAlerts);  // ← используйте тестовые данные
  
  // ... остальной код ...
}
```

**Результат:** Откройте приложение и сразу видите 3 тестовых алерта:
- 🟡 Snowfall Warning (желтый)
- 🟡 Wind Advisory (желтый)
- 🟠 Heavy Snow Warning (оранжевый)

---

### 2️⃣ Тестирование конкретного уровня серьезности

**Для тестирования ТОЛЬКО желтых алертов:**

```jsx
import { mockAlertsSeverity } from './__mocks__/mockAlerts';

export default function App() {
  const [alerts, setAlerts] = useState(mockAlertsSeverity.yellow);
  
  // ... остальной код ...
}
```

**Для тестирования ТОЛЬКО оранжевых алертов:**

```jsx
const [alerts, setAlerts] = useState(mockAlertsSeverity.orange);
```

**Для тестирования ВСЕХалертов (включая красные):**

```jsx
const [alerts, setAlerts] = useState(mockAlertsSeverity.all);
```

---

### 3️⃣ Динамическое переключение между наборами

**Создайте кнопки для переключения:**

```jsx
import { mockAlertsSeverity } from './__mocks__/mockAlerts';

export default function App() {
  const [alerts, setAlerts] = useState(mockAlertsSeverity.yellow);
  
  return (
    <div>
      {/* Кнопки для переключения */}
      <div className="p-4 space-x-2">
        <button 
          onClick={() => setAlerts(mockAlertsSeverity.yellow)}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Yellow Alerts Only
        </button>
        <button 
          onClick={() => setAlerts(mockAlertsSeverity.orange)}
          className="px-4 py-2 bg-orange-500 text-white rounded"
        >
          Orange Alerts Only
        </button>
        <button 
          onClick={() => setAlerts(mockAlertsSeverity.red)}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Red Alerts Only
        </button>
        <button 
          onClick={() => setAlerts(mockAlertsSeverity.all)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          All Alerts
        </button>
      </div>
      
      {/* Компонент алертов */}
      <WeatherAlerts alerts={alerts} onDismiss={dismissAlert} />
    </div>
  );
}
```

---

### 4️⃣ Тестирование с фильтром по локации

```jsx
import { getTestAlerts } from './__mocks__/mockAlerts';

export default function App() {
  const [alerts, setAlerts] = useState(
    getTestAlerts('Ottawa', 'yellow')  // Только желтые для Оттавы
  );
  
  // Переключение локаций:
  const handleLocationChange = (location) => {
    setAlerts(getTestAlerts(location, 'yellow'));
  };
  
  // ... остальной код ...
}
```

---

## Чек-лист для тестирования

### Visual Testing

- [ ] **Yellow Alert отображается желтой:**
  - [ ] Фон светло-желтый
  - [ ] Левая полоса желтая
  - [ ] Иконка (AlertTriangle) желтого цвета
  - [ ] Кнопка X желтого цвета

- [ ] **Orange Alert отображается оранжевой:**
  - [ ] Фон светло-оранжевый
  - [ ] Левая полоса оранжевая
  - [ ] Иконка оранжевого цвета
  - [ ] Кнопка X оранжевого цвета

- [ ] **Red Alert отображается красной:**
  - [ ] Фон светло-красный
  - [ ] Левая полоса красная
  - [ ] Иконка красного цвета
  - [ ] Кнопка X красного цвета

### Functionality Testing

- [ ] **Кнопка закрытия (X) работает:**
  - [ ] Клик закрывает алерт
  - [ ] При наведении изменяется цвет
  - [ ] Tooltip появляется при наведении

- [ ] **Информация отображается корректно:**
  - [ ] Название события видно
  - [ ] Описание видно (первые 2 строки)
  - [ ] Время окончания в правильном формате
    - [ ] < 12 часов: "Until Tonight"
    - [ ] < 24 часа: "Until Tomorrow"
    - [ ] > 24 часа: "Until Jan 13"

- [ ] **Тема работает:**
  - [ ] Light mode: яркие цвета
  - [ ] Dark mode: приглушенные цвета

### Responsive Testing

- [ ] **На мобильных устройствах:**
  - [ ] Алерты видны в правом верхнем углу
  - [ ] Кнопка X доступна (не скрыта)
  - [ ] Текст не обрезается

---

## Примеры вывода

### Yellow Alert (Snow Advisory)

```
┌──────────────────────────────────────────┬─────┐
│ ⚠ Snowfall Warning                       │  ×  │
│ Snowfall accumulation with rates of 2 to │     │
│ 🕐 Until Tonight                         │     │
└──────────────────────────────────────────┴─────┘
```

**Цвета:**
- 🟡 Фон: `bg-yellow-50/90`
- 🟡 Полоса: `border-l-4 border-yellow-500`
- 🟡 Иконка: `text-yellow-600`

---

### Orange Alert (Heavy Snow Warning)

```
┌──────────────────────────────────────────┬─────┐
│ ⚠ Heavy Snow Warning                     │  ×  │
│ Heavy snow expected with total           │     │
│ 🕐 Until Tomorrow                        │     │
└──────────────────────────────────────────┴─────┘
```

**Цвета:**
- 🟠 Фон: `bg-orange-50/90`
- 🟠 Полоса: `border-l-4 border-orange-500`
- 🟠 Иконка: `text-orange-500`

---

### Red Alert (Tornado Warning)

```
┌──────────────────────────────────────────┬─────┐
│ ⚠ Tornado Warning                        │  ×  │
│ A confirmed tornado is occurring. Take   │     │
│ 🕐 Until Tonight                         │     │
└──────────────────────────────────────────┴─────┘
```

**Цвета:**
- 🔴 Фон: `bg-red-50/90`
- 🔴 Полоса: `border-l-4 border-red-500`
- 🔴 Иконка: `text-red-500`

---

## Отладка проблем

### Алерты не отображаются

**Проверьте:**
1. Импортирован ли `mockAlerts.js`?
   ```jsx
   import { ottawaTestAlerts } from './__mocks__/mockAlerts';
   ```

2. Передан ли props правильно?
   ```jsx
   <WeatherAlerts alerts={alerts} onDismiss={dismissAlert} />
   ```

3. Функция `dismissAlert` определена?
   ```jsx
   const dismissAlert = (index) => {
     setAlerts(prev => prev.filter((_, i) => i !== index));
   };
   ```

### Цвета неправильные

**Проверьте:**
1. Установлена ли правильная версия Tailwind?
   ```bash
   npm install -D tailwindcss@latest
   ```

2. Перезагрузите dev server:
   ```bash
   npm run dev
   ```

3. Очистите кэш браузера (Ctrl+Shift+Delete)

### Кнопка X не работает

**Проверьте:**
1. Функция `onDismiss` правильно передана?
2. Индекс алерта правильно передается в onClick?
3. Нет ошибок в консоли браузера (F12)?

---

## Интеграция с реальными данными

Когда закончите тестирование, замените mock данные на реальные:

```jsx
// Было:
const [alerts, setAlerts] = useState(ottawaTestAlerts);

// Стало:
const [alerts, setAlerts] = useState([]);

useEffect(() => {
  const fetchAlerts = async () => {
    try {
      const data = await getWeatherAlerts(lat, lon);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };
  
  fetchAlerts();
}, [lat, lon]);
```

---

## Завершение

После успешного тестирования всех пунктов чек-листа система классификации алертов полностью готова к производству! ✅

Удалите тестовые кнопки и используйте реальные данные из API.
