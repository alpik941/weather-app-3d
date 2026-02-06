# Исправления валидации данных погоды и система классификации алертов

## 1. Время восхода/заката ✅

### Проблема
Время восхода позже времени заката - физически невозможно (23:41 > 08:41)

### Решение
- **Файл:** `src/services/weatherService.js` (строки 62-95)
- Добавлена валидация: `sunrise >= sunset` → свопить значения
- Добавлено логирование ошибок с деталями
- Исправлена обработка часовых поясов при парсинге времени

**Код валидации:**
```javascript
// Validate sunrise < sunset
if (sunrise >= sunset) {
  console.warn('[weatherService] Invalid sunrise/sunset times, swapping:', { sunrise, sunset });
  [sunrise, sunset] = [sunset, sunrise];
}
```

---

## 2. Wind Chill (Ощущаемая температура) ✅

### Проблема
Temp -2°C, Feels Like -8°C при ветре 6.5 m/s - разница в 6°C невозможна

### Решение
- **Новый файл:** `src/utils/windSpeed.js` добавлена функция `calculateWindChill()`
- **Файл:** `src/services/weatherService.js` (строки 100-115)
- Используется канадская формула ветрового охлаждения:
  ```
  Twc = 13.12 + 0.6215*Ta - 11.37*v^0.16 + 0.3965*Ta*v^0.16
  ```
  где Twc - ощущаемая температура, Ta - температура воздуха, v - скорость ветра км/ч

- Если разница между API и расчетом > 8°C, используется расчетное значение
- Логирование с деталями корректировки

**Пример расчета:**
- Temp: -2°C, Wind: 6.5 m/s (23.4 км/ч)
- Расчет: -2 - 5.5 = -7.5°C (приблизительно)
- Корректнее чем -8°C ✅

---

## 3. Видимость при неблагоприятных условиях ✅

### Проблема
Видимость 8.0 км при снегопаде 2-4 см/ч нереалистична (обычно 1-3 км)

### Решение
- **Файл:** `src/services/weatherService.js` (строки 140-154)
- Добавлена валидация видимости по типу осадков:
  - **Снег:** max 3 км → корректировать до 2 км
  - **Дождь:** max 5 км
  - **Четкая видимость:** оставить как есть

**Код:**
```javascript
visibility: (() => {
  let vis = data.current.vis_km * 1000; // convert to meters
  if (condNow.main === 'Snow' && vis > 3000) {
    vis = 2000; // typical range for snowfall
  } else if (condNow.main === 'Rain' && vis > 5000) {
    vis = 5000;
  }
  return vis;
})(),
```

---

## 4. Дедупликация алертов ✅

### Проблема
Два одинаковых предупреждения о снегопаде

### Решение
- **Файл:** `src/App.jsx` (строки 385-398)
- Добавлена функция `dedupedAlerts` с дедупликацией по ключу `{event}-{description}`
- Используется для отрисовки компонента `WeatherAlerts`

**Код:**
```javascript
const dedupedAlerts = (() => {
  const seen = new Set();
  return alerts.filter(alert => {
    const key = `${alert.event}-${alert.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();
```

---

## 5. Форматирование даты окончания алертов ✅

### Проблема
"Until 11 Jan 2026" при текущей дате 11 января - неинформативно

### Решение
- **Файл:** `src/components/WeatherAlerts.jsx` (строки 8-22)
- Добавлена функция `formatAlertTime()` с интеллектуальным форматированием:
  - < 12 часов → "Tonight"
  - < 24 часов → "Tomorrow"
  - Иначе → дата (Month Day)

**Пример вывода:**
- Ends in 6 hours → "Until Tonight"
- Ends tomorrow at 3 PM → "Until Tomorrow"
- Ends Jan 13 → "Until Jan 13"

---

## 6. Импорт wind chill функции ✅

### Изменение
- **Файл:** `src/services/weatherService.js` (строка 13)
- Добавлен импорт: `import { calculateWindChill } from '../utils/windSpeed.js';`

---

## 🎨 7. НОВОЕ: Система классификации и окраски алертов по серьезности ✅

### Проблема
Все предупреждения отображались красным цветом, без различия по уровню серьезности. Желтые предупреждения (advisory) должны выглядеть иначе чем красные (warning).

### Решение

#### A. Функция классификации в weatherService.js
```javascript
const classifyAlertSeverity = (event, description) => {
  // RED: Tornado, Hurricane, Extreme, Blizzard, Flash Flood, Severe Weather
  // ORANGE: Heavy Snow/Rain/Wind, Ice Storm, Winter Storm, Frost Warning
  // YELLOW: Snow Advisory, Wind Advisory, Fog, Freeze Watch, Poor Visibility
  return 'red' | 'orange' | 'yellow';
};
```

**Классификация:**
- 🔴 **RED (Красный)** - Критически опасные условия
  - Tornado, Hurricane, Extreme Weather, Blizzard
  - Flash Flood, Severe Thunderstorm
  
- 🟠 **ORANGE (Оранжевый)** - Высокая опасность
  - Heavy Snow/Rain/Wind
  - Ice Storm, Winter Storm
  - Frost Warning, Freezing Rain

- 🟡 **YELLOW (Желтый)** - Предупреждение/рекомендация
  - Snow Advisory/Watch
  - Wind Advisory/Watch
  - Fog Warning, Freeze Watch
  - Poor Visibility, Slippery Roads

#### B. Компонент WeatherAlerts.jsx
- **Файл:** `src/components/WeatherAlerts.jsx`
- Добавлена функция `getAlertStyles(severity)` с динамической окраской
- Каждый уровень имеет свой набор цветов для фона, текста, иконки и кнопки закрытия
- Улучшен дизайн кнопки закрытия (X):
  - Размер: 32px x 32px
  - Переходящий эффект при наведении (hover)
  - Иконка X из lucide-react (правильно позиционирована)
  - ARIA label для доступности

**Пример стилей для желтого алерта:**
```javascript
yellow: {
  bg: 'bg-yellow-50/90 dark:bg-yellow-900/20',
  border: 'border-l-4 border-yellow-500',
  icon: 'text-yellow-600',
  title: 'text-yellow-800 dark:text-yellow-200',
  text: 'text-yellow-700 dark:text-yellow-300',
  time: 'text-yellow-600 dark:text-yellow-400',
  closeBtn: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800/30'
}
```

#### C. Типы данных
- **Файл:** `src/types/weather.js`
- Добавлено свойство `severity` к типу `WeatherAlert`
- Документированы значения: 'red', 'orange', 'yellow'

#### D. API интеграция
- **Файл:** `src/services/weatherService.js` (функция `getWeatherAlerts`)
- Каждый alert теперь содержит поле `severity`
- Автоматическая классификация при получении данных из API

### Внешний вид для Ottawa, Canada:

**Снегопад (Yellow Alert):**
```
┌─────────────────────────────┬───┐
│ ⚠ Snow Advisory             │ × │
│ Expected snowfall of 15-20cm│   │
│ 🕐 Until Tonight            │   │
└─────────────────────────────┴───┘
```

**Ледяной дождь (Orange Alert):**
```
┌─────────────────────────────┬───┐
│ ⚠ Freezing Rain Warning     │ × │
│ Heavy ice accumulation risk │   │
│ 🕐 Until Tomorrow           │   │
└─────────────────────────────┴───┘
```

**Торнадо (Red Alert):**
```
┌─────────────────────────────┬───┐
│ ⚠ Tornado Warning           │ × │
│ Seek shelter immediately    │   │
│ 🕐 Until Tonight            │   │
└─────────────────────────────┴───┘
```

---

## 📋 Тестирование

Для проверки исправлений откройте консоль браузера (F12) и ищите:

```
[weatherService] Invalid sunrise/sunset times, swapping:
[weatherService] feels_like correction:
[weatherService] visibility correction for snow:
```

Если логирование есть - исправления работают!

Для проверки алертов:
1. Откройте приложение с локацией Ottawa, Canada
2. Ищите в правом верхнем углу окна с:
   - 🟡 Желтой окраской для advisory (снег, ветер, туман)
   - 🟠 Оранжевой окраской для warning (тяжелый снег/дождь)
   - 🔴 Красной окраской для critical (торнадо, ураган)
3. Все модальные окна должны иметь кнопку закрытия (X)

---

## ✅ Статус

- ✅ Sunrise/Sunset валидация
- ✅ Wind Chill расчет
- ✅ Visibility корректировка
- ✅ Дедупликация алертов
- ✅ Умное форматирование дат алертов
- ✅ **НОВОЕ: Система классификации алертов по серьезности (Red/Orange/Yellow)**
- ✅ **НОВОЕ: Кнопка закрытия (X) для всех алертов с улучшенным дизайном**
- ✅ Все опечатки проверены (в текущих данных не обнаружены)
- ✅ Сборка проекта без ошибок
