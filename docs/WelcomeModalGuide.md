# Welcome Modal — Компонент приветствия

## Описание

`WelcomeModal` — это модальное окно приветствия, которое показывается при первом посещении приложения. Оно предоставляет пользователю возможность сразу же настроить основные предпочтения.

## Возможности

### ✅ Выбор языка
- 10 языков (EN, ES, FR, DE, IT, PT, RU, ZH, JA, KO)
- Сохраняется в localStorage
- Отражается во всем приложении

### ⏰ Формат времени
- **24 Hour** - 24-часовой формат (0:00 - 23:59)
- **12 Hour** - 12-часовой формат с AM/PM
- **Auto** - Использует системные настройки браузера
- Сохраняется в TimeContext

### 🔄 Rollback Mode
- Переключатель ON/OFF
- Активирует использование резервных сервисов погоды при основном сервисе
- Сохраняется в localStorage

### ❤️ Благодарность администратора
- Профессиональное сообщение спасибо от администратора
- Переведено на все языки
- Напоминает о ценности приложения

## Визуальный дизайн

### Структура окна
```
┌─────────────────────────────────────┐
│  👋 Welcome - Configure preferences │ ← Header с градиентом
├─────────────────────────────────────┤
│                                     │
│ 🌐 Language                        │
│ [EN] [ES] [FR] [DE]               │
│ [IT] [PT] [RU] [ZH] [JA] [KO]    │
│                                     │
│ ⏰ Time Format                      │
│ [24 Hour] [12 Hour] [Auto]        │
│ Auto: Uses your system settings     │
│                                     │
│ 🔄 Rollback Mode                   │
│ Use fallback services      [ON/OFF] │
│                                     │
│ ❤️ Thanks from Admin               │
│ Thank you for using Alpik941...    │
│                                     │
├─────────────────────────────────────┤
│          [Get Started ✨]           │
└─────────────────────────────────────┘
```

### Темы
- **Светлая тема**: Белый фон, темный текст
- **Темная тема**: Темно-серый фон, светлый текст
- **Header**: Градиент голубой → фиолетовый
- **Интерактивные элементы**: Синие при выборе, серые по умолчанию

### Размеры
- **Ширина**: max-w-md (448px)
- **Высота**: Динамическая, max-height 384px (можно скролить внутри)
- **Расположение**: По центру экрана
- **Backdrop**: Полупрозрачный черный с размытием (backdrop-blur-sm)

## Использование

### В App.jsx
```jsx
import WelcomeModal from './components/WelcomeModal';

function App() {
  return (
    <>
      {/* Добавьте в верхнюю часть контейнера */}
      <WelcomeModal />
      {/* Остальное содержимое */}
    </>
  );
}
```

### Зависимости
- `useTheme()` - для получения текущей темы
- `useLanguage()` - для управления языком
- `useTime()` - для управления форматом времени
- `framer-motion` - для анимаций
- `lucide-react` - для иконок

## Как это работает

### Первый запуск
1. Пользователь впервые открывает приложение
2. localStorage не содержит `welcome-modal-shown`
3. Модальное окно отображается
4. Пользователь выбирает настройки

### Закрытие окна
1. При клике "Get Started" (или на backdrop)
2. Сохраняются все выбранные настройки
3. Устанавливается флаг `welcome-modal-shown = true`
4. Пользователь больше не увидит окно (пока не очистит localStorage)

### Сохранение настроек
```javascript
// Все сохраняется автоматически:
localStorage.setItem('welcome-modal-shown', 'true');
localStorage.setItem('rollback-mode', rollbackMode);
setLanguage(selectedLanguage);
setHour12(timeFormat === '12');
```

## Переводы

Все текстовые строки переведены на 10 языков через LanguageContext:

| Ключ | EN | RU | 
|------|----|----|
| welcome | Welcome | Добро пожаловать |
| welcomeSubtitle | Configure your preferences | Настройте ваши предпочтения |
| language | Language | Язык |
| timeFormat | Time Format | Формат времени |
| rollbackMode | Rollback Mode | Режим отката |
| thanksFromAdmin | Thanks from Admin | Спасибо от администратора |
| adminMessage | Thank you for using... | Спасибо за использование... |
| getStarted | Get Started | Начать |

**Полный список переводов**: [src/contexts/LanguageContext.jsx](src/contexts/LanguageContext.jsx)

## Анимации

### Вход (initial → animate)
- **Opacity**: 0 → 1
- **Scale**: 0.9 → 1
- **Y position**: -20px → 0px
- **Duration**: Spring animation (damping: 20, stiffness: 300)

### Выход (exit)
- Обратные анимации для плавного исчезновения

### Backdrop
- Fade in/out анимация

## Взаимодействие с контекстами

### ThemeContext
Используется для:
- Определения текущей темы (dark/light)
- Применения правильных цветов к компоненту

### LanguageContext
Используется для:
- Получения текущего языка
- Отображения переведенных текстов через `t()`
- Изменения языка при выборе нового

### TimeContext
Используется для:
- Получения текущего формата времени (`hour12`)
- Установки нового формата через `setHour12()`

## Кастомизация

### Изменить сообщение администратора
```jsx
// В LanguageContext.jsx
adminMessage: { 
  en: 'Ваше новое сообщение...',
  ru: 'Ваше новое сообщение на русском...',
  // ...
}
```

### Изменить количество языков
```jsx
// В WelcomeModal.jsx - обновить массив languages
const languages = [
  // Добавить/удалить языки
  { code: 'nl', name: '🇳🇱 Nederlands' },
];
```

### Изменить стили
```jsx
// Все классы Tailwind, легко изменить через props или CSS
const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
```

## Возможные улучшения

1. **Пропуск онбординга**
   ```jsx
   <button onClick={() => setIsOpen(false)}>Skip</button>
   ```

2. **Сохранение выбора в базу (если есть backend)**
   ```jsx
   await api.updateUserPreferences({ language, timeFormat });
   ```

3. **Дополнительные параметры**
   - Геолокация по умолчанию
   - Единицы измерения (Celsius/Fahrenheit)
   - Уведомления о погоде

4. **Навигация по шагам**
   - Превратить в пошаговый процесс
   - Каждый экран - отдельная настройка

5. **Видео-тур**
   - Добавить видео демонстрацию функций
   - Интерактивный тур по приложению

## Отладка

### Как всегда показывать окно
```javascript
// В консоли браузера:
localStorage.removeItem('welcome-modal-shown');
location.reload();
```

### Проверить сохраненные настройки
```javascript
// В консоли браузера:
localStorage.getItem('welcome-modal-shown');
localStorage.getItem('rollback-mode');
localStorage.getItem('weather-language');
```

## Файлы

- [src/components/WelcomeModal.jsx](src/components/WelcomeModal.jsx) - Основной компонент
- [src/contexts/LanguageContext.jsx](src/contexts/LanguageContext.jsx) - Переводы
- [src/App.jsx](src/App.jsx) - Использование в приложении

---

**Статус**: ✅ Готово к использованию

Компонент полностью функционален, протестирован и интегрирован в приложение!
