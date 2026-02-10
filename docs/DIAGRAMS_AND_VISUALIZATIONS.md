# 📊 Визуальная документация: Диаграммы и схемы

## 🏗️ Архитектура системы

### Общая архитектура

Система состоит из трех основных слоев:

1. **Входной слой** — Получение данных (час, погода, тема)
2. **Ядро системы** — Обработка и формирование параметров
3. **Выходной слой** — Применение к компонентам

```
📥 Входные данные → 🎨 Ядро системы → 📤 Параметры → ⚛️ Компоненты
```

### Детальная схема

```mermaid
graph TB
    subgraph Input["📥 Входные данные"]
        Hour[Текущий час 0-23]
        Weather[Погодные условия]
        Theme[Тема light/dark]
    end

    subgraph Core["🎨 Ядро системы - timeOfDayVisuals.js"]
        Presets[Базовые пресеты<br/>sunrise/day/sunset/night]
        Modifiers[Модификаторы<br/>cloudy/rainy/misty]
        Utils[Утилиты<br/>getLighting/getColors/getCSSVars]
    end

    subgraph Output["📤 Выходные данные"]
        ThreeJS[Three.js параметры<br/>- Освещение<br/>- Позиции<br/>- Цвета материалов]
        CSS[CSS переменные<br/>- Градиенты<br/>- Цвета текста<br/>- Оверлеи]
        Visual[Визуальные параметры<br/>- Насыщенность<br/>- Контраст<br/>- Туман]
    end

    subgraph Components["⚛️ Компоненты приложения"]
        Scene[WeatherScene<br/>Three.js Canvas]
        Lighting[LightingSection<br/>Lights]
        Sky[SkySection<br/>Sky/Stars]
        Background[DynamicBackground<br/>CSS градиент]
        UI[UI компоненты<br/>Текст, иконки]
    end

    Hour --> Utils
    Weather --> Modifiers
    Theme --> Utils
    
    Utils --> Presets
    Presets --> Modifiers
    
    Modifiers --> ThreeJS
    Modifiers --> CSS
    Modifiers --> Visual
    
    ThreeJS --> Scene
    ThreeJS --> Lighting
    ThreeJS --> Sky
    
    CSS --> Background
    CSS --> UI
    
    Visual --> Scene
    Visual --> Background
```

---

## 🔄 Процесс применения стилей

### Пошаговый flow

```mermaid
flowchart TD
    Start([Запуск приложения]) --> GetHour[Получить текущий час]
    GetHour --> DetermineTime{Определить<br/>время суток}
    
    DetermineTime -->|5-7| Sunrise[🌅 Рассвет]
    DetermineTime -->|7-17| Day[☀️ День]
    DetermineTime -->|17-19| Sunset[🌇 Закат]
    DetermineTime -->|19-5| Night[🌙 Ночь]
    
    Sunrise --> GetPreset[Получить базовый пресет]
    Day --> GetPreset
    Sunset --> GetPreset
    Night --> GetPreset
    
    GetPreset --> CheckWeather{Погодные условия?}
    
    CheckWeather -->|Облачно| ApplyCloudy[Применить<br/>CloudyModifier]
    CheckWeather -->|Дождь| ApplyRain[Применить<br/>RainyModifier]
    CheckWeather -->|Туман| ApplyMist[Применить<br/>MistyModifier]
    CheckWeather -->|Ясно| NoModifier[Без модификаторов]
    
    ApplyCloudy --> FinalVisuals[Финальные<br/>визуальные параметры]
    ApplyRain --> FinalVisuals
    ApplyMist --> FinalVisuals
    NoModifier --> FinalVisuals
    
    FinalVisuals --> Split{Разделение<br/>по компонентам}
    
    Split --> ThreeScene[Three.js сцена]
    Split --> ReactCSS[React/CSS компоненты]
    
    ThreeScene --> ApplyLighting[Применить освещение]
    ThreeScene --> ApplySky[Применить небо]
    ThreeScene --> ApplyClouds[Применить облака]
    
    ReactCSS --> ApplyGradient[Применить градиент]
    ReactCSS --> ApplyColors[Применить цвета]
    ReactCSS --> ApplyFilters[Применить фильтры]
    
    ApplyLighting --> Render[Рендер сцены]
    ApplySky --> Render
    ApplyClouds --> Render
    ApplyGradient --> Render
    ApplyColors --> Render
    ApplyFilters --> Render
    
    Render --> Monitor{Изменения?}
    Monitor -->|Время изменилось| GetHour
    Monitor -->|Погода изменилась| CheckWeather
    Monitor -->|Нет изменений| Monitor
```

---

## 🌈 Цветовые палитры

### Градиентные палитры по времени суток

#### 🌅 Рассвет (Sunrise)
```
┌─────────────────────────────────────────┐
│ #FF6B6B (Коралловый)                    │ ← Верх
├─────────────────────────────────────────┤
│                                         │
│ #FFB347 (Оранжево-персиковый)          │ ← Середина
│                                         │
├─────────────────────────────────────────┤
│ #FFE4B5 (Кремовый)                      │ ← Низ
└─────────────────────────────────────────┘
```

#### ☀️ День (Day)
```
┌─────────────────────────────────────────┐
│ #1E88E5 (Насыщенный синий)              │ ← Верх
├─────────────────────────────────────────┤
│                                         │
│ #42A5F5 (Средний голубой)               │ ← Середина
│                                         │
├─────────────────────────────────────────┤
│ #90CAF9 (Светло-голубой)                │ ← Низ
└─────────────────────────────────────────┘
```

#### 🌇 Закат (Sunset)
```
┌─────────────────────────────────────────┐
│ #FF6347 (Томатно-красный)               │ ← Верх
├─────────────────────────────────────────┤
│                                         │
│ #FF8C42 (Оранжево-золотой)              │ ← Середина
│                                         │
├─────────────────────────────────────────┤
│ #FFD700 (Золотой)                       │ ← Низ
└─────────────────────────────────────────┘
```

#### 🌙 Ночь (Night)
```
┌─────────────────────────────────────────┐
│ #0B1026 (Почти черный синий)            │ ← Верх
├─────────────────────────────────────────┤
│                                         │
│ #1A2238 (Темно-синий)                   │ ← Середина
│                                         │
├─────────────────────────────────────────┤
│ #2C3E50 (Синевато-серый)                │ ← Низ
└─────────────────────────────────────────┘
```

---

## 💡 Интенсивность освещения

### Сравнительная диаграмма

```
Яркость освещения по времени суток
┌────────────────────────────────────────────────────────┐
│ 1.0 │                  ████████████                    │ День
│     │                  ████████████                    │
│ 0.9 │                  ████████████                    │
│     │                                                  │
│ 0.8 │                                                  │
│     │      ██████                       ██████         │ Закат
│ 0.7 │      ██████                       ██████         │
│     │      ██████                       ██████         │
│ 0.6 │      ██████                       ██████         │ Рассвет
│     │                                                  │
│ 0.5 │                                                  │
│     │                                                  │
│ 0.4 │                                                  │
│     │                                                  │
│ 0.3 │                                                  │ Ночь
│     │  ███                                       ███   │
│ 0.2 │  ███                                       ███   │
│     │  ███                                       ███   │
│ 0.1 │  ███                                       ███   │
│     │                                                  │
│ 0.0 └──┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┘
│      0   2   4   6   8  10  12  14  16  18  20  22   │
│                        Часы (0-23)                    │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Модификаторы погоды

### Влияние модификаторов на параметры

```mermaid
graph LR
    Base[Базовый пресет<br/>Day/Sunset/etc] --> Cloudy{Cloudy?}
    Cloudy -->|Да| C1[Освещение -30%]
    Cloudy -->|Нет| Rainy{Rainy?}
    
    C1 --> C2[Облаков +50%]
    C2 --> C3[Видимость -20%]
    C3 --> Result1[Облачный результат]
    
    Rainy -->|Да| R1[Освещение -50-70%]
    Rainy -->|Нет| Misty{Misty?}
    
    R1 --> R2[Туман ×2]
    R2 --> R3[Насыщенность -30%]
    R3 --> R4[Контраст -20%]
    R4 --> Result2[Дождливый результат]
    
    Misty -->|Да| M1[Туман ×4]
    Misty -->|Нет| Result3[Чистый результат]
    
    M1 --> M2[Видимость = 30%]
    M2 --> M3[Контраст -50%]
    M3 --> Result4[Туманный результат]
    
    style Base fill:#42A5F5,color:#fff
    style Result1 fill:#90A4AE,color:#fff
    style Result2 fill:#546E7A,color:#fff
    style Result3 fill:#66BB6A,color:#fff
    style Result4 fill:#78909C,color:#fff
```

---

## 🎯 Применение в компонентах

### Структура использования

```mermaid
graph TD
    System[timeOfDayVisuals.js] --> API{API методы}
    
    API --> Method1[getTimeOfDayVisuals]
    API --> Method2[getLightingParams]
    API --> Method3[getSkyColors]
    API --> Method4[getCloudParams]
    API --> Method5[getCSSVars]
    
    Method1 --> Comp1[WeatherScene]
    Method2 --> Comp2[LightingSection]
    Method3 --> Comp3[SkySection]
    Method4 --> Comp4[CloudSection]
    Method5 --> Comp5[DynamicBackground]
    
    Comp1 --> Render[Финальный рендер]
    Comp2 --> Render
    Comp3 --> Render
    Comp4 --> Render
    Comp5 --> Render
    
    style System fill:#42A5F5,color:#fff
    style Render fill:#9C27B0,color:#fff
```

---

## 📐 Параметры в числах

### Таймлайн времени суток

```
00:00 ────────────────────────────────────────────── 24:00
  │                                                    │
  ├─── 🌙 НОЧЬ ───┬─── 🌅 РАССВЕТ ───┬─── ☀️ ДЕНЬ ───┬─── 🌇 ЗАКАТ ───┬─── 🌙 НОЧЬ ───┤
  0              5                  7                17               19             24
  
Параметры:
  🌙 Ночь:    Освещение: 0.25 | Теплота: 20%  | Контраст: 50%
  🌅 Рассвет: Освещение: 0.50 | Теплота: 90%  | Контраст: 60%
  ☀️ День:    Освещение: 1.00 | Теплота: 50%  | Контраст: 100%
  🌇 Закат:   Освещение: 0.70 | Теплота: 100% | Контраст: 75%
```

---

## 🔍 Детальный разбор пресета

### Пример: Sunset (Закат)

```
┌─────────────────────────────────────────────────────────────┐
│ SUNSET PRESET                                               │
├─────────────────────────────────────────────────────────────┤
│ 🎨 ЦВЕТА                                                    │
│   Sky Top:     #FF6347 (Томатно-красный)                   │
│   Sky Middle:  #FF8C42 (Оранжево-золотой)                  │
│   Sky Bottom:  #FFD700 (Золотой)                            │
│   Clouds:      #FF7F50 (Коралловый)                         │
│   Fog:         #FFE4C4 (Бисквитный)                         │
├─────────────────────────────────────────────────────────────┤
│ 💡 ОСВЕЩЕНИЕ                                                │
│   Ambient:     0.45 intensity, #FFB347 color                │
│   Directional: 0.70 intensity, #FF6347 color                │
│   Position:    [8, 3, -2] (низко справа)                    │
│   Sun Glow:    1.3x                                         │
├─────────────────────────────────────────────────────────────┤
│ ☁️ ОБЛАКА & АТМОСФЕРА                                       │
│   Opacity:     75%                                          │
│   Density:     60%                                          │
│   Fog Density: 0.012                                        │
│   Visibility:  80%                                          │
├─────────────────────────────────────────────────────────────┤
│ 🎭 ГЛОБАЛЬНЫЕ ПАРАМЕТРЫ                                     │
│   Saturation:  95%                                          │
│   Contrast:    75%                                          │
│   Brightness:  80%                                          │
│   Warmth:      100% (максимально теплые тона)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Легенда цветов

### Цветовая кодировка в диаграммах

| Цвет | Значение |
|------|----------|
| 🔴 Красный | Входные данные |
| 🔵 Синий | Ядро системы |
| 🟢 Зеленый | Выходные данные |
| 🟠 Оранжевый | Компоненты |
| 🟣 Фиолетовый | Рендер/Результат |
| ⚫ Серый | Модификаторы |

---

## 🚀 Быстрая навигация

- [← Назад к README](./TIME_OF_DAY_README.md)
- [Полная документация →](./TIME_OF_DAY_SYSTEM.md)
- [Справочник параметров →](./VISUAL_PARAMETERS_REFERENCE.md)
- [Примеры кода →](./examples/)

---

**Дата обновления**: 2026  
**Версия**: 1.0.0
