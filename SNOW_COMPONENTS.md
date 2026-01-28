# ❄️ Компоненты снежинок в проекте

## 📦 Доступные визуализаторы снега

В проекте есть **3 варианта** визуализации снега:

### 1. **SnowParticles** (3D Three.js) — WeatherScene.jsx
**Основной компонент для 3D сцены**

```jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function SnowParticles({ intensity = 800 }) {
  const ref = useRef(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(intensity * 3);
    const velocities = new Float32Array(intensity * 3);
    const sizes = new Float32Array(intensity);
    
    for (let i = 0; i < intensity; i++) {
      // Начальная позиция
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 40 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      // Скорость падения
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = -Math.random() * 0.2 - 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      
      // Размер снежинки
      sizes[i] = Math.random() * 0.3 + 0.1;
    }
    
    return { positions, velocities, sizes };
  }, [intensity]);

  useFrame((state) => {
    if (ref.current) {
      const positions = ref.current.geometry.attributes.position.array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < intensity; i++) {
        // Движение с покачиванием
        positions[i * 3] += particles.velocities[i * 3] + Math.sin(time + i) * 0.01;
        positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
        
        // Сброс снежинки наверх при достижении земли
        if (positions[i * 3 + 1] < -10) {
          positions[i * 3] = (Math.random() - 0.5) * 40;
          positions[i * 3 + 1] = 40;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={particles.positions}>
      <PointMaterial
        transparent
        size={0.2}
        sizeAttenuation={true}
        color="#FFFFFF"
        opacity={0.9}
        depthWrite={false}
      />
    </Points>
  );
}

export default SnowParticles;
```

**Использование:**
```jsx
import SnowParticles from './SnowParticles';

// В Canvas сцене
{isSnowing && <SnowParticles intensity={800} />}
```

**Параметры:**
- `intensity` (number, default: 800) — количество снежинок

**Где используется:**
- [WeatherScene.jsx](src/components/WeatherScene.jsx#L380) — строка 380

---

### 2. **renderSnow** (CSS + DOM) — DynamicWeatherBackground.jsx
**Реалистичные CSS снежинки с формой и вращением**

```jsx
const renderSnow = () => {
  if (condition !== 'snowy') return null;

  // Меньше снежинок на мобильных для производительности
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const flakeCount = isMobile ? 40 : 70;
  
  const flakes = Array.from({ length: flakeCount }, (_, i) => {
    const size = 3 + Math.random() * 6; // 3-9px
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = 8 + Math.random() * 7; // 8-15 секунд
    const opacity = 0.5 + Math.random() * 0.5;
    const swingIntensity = 20 + Math.random() * 30; // Амплитуда покачивания
    const rotationSpeed = 10 + Math.random() * 20; // Скорость вращения
    
    return {
      left: `${left}%`,
      delay: `${delay}s`,
      duration: `${duration}s`,
      size,
      opacity,
      swingIntensity,
      rotationSpeed
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flakes.map((flake, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: flake.left,
            top: '-10%',
            animation: `snowfall ${flake.duration} linear infinite ${flake.delay}`,
            '--swing-intensity': `${flake.swingIntensity}px`
          }}
        >
          {/* Снежинка с формой */}
          <div
            className="relative"
            style={{
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              animation: `snowRotate ${flake.rotationSpeed}s linear infinite ${flake.delay}`
            }}
          >
            {/* Центр снежинки */}
            <div 
              className="absolute inset-0 bg-white rounded-full"
              style={{
                opacity: flake.opacity,
                boxShadow: `0 0 ${flake.size}px rgba(255, 255, 255, ${flake.opacity * 0.8})`
              }}
            />
            
            {/* Лучи снежинки */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ opacity: flake.opacity * 0.9 }}
            >
              {/* Вертикальная линия */}
              <div className="absolute w-0.5 h-full bg-white/90"></div>
              {/* Горизонтальная линия */}
              <div className="absolute w-full h-0.5 bg-white/90"></div>
              {/* Диагональ 1 */}
              <div className="absolute w-0.5 h-full bg-white/80 transform rotate-45"></div>
              {/* Диагональ 2 */}
              <div className="absolute w-0.5 h-full bg-white/80 transform -rotate-45"></div>
            </div>
          </div>
        </div>
      ))}
      
      {/* CSS анимации */}
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(25vh) translateX(var(--swing-intensity));
          }
          50% {
            transform: translateY(50vh) translateX(0);
          }
          75% {
            transform: translateY(75vh) translateX(calc(var(--swing-intensity) * -1));
          }
          100% {
            transform: translateY(110vh) translateX(0);
          }
        }
        
        @keyframes snowRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
```

**Где используется:**
- [DynamicWeatherBackground.jsx](src/components/DynamicWeatherBackground.jsx#L751) — строка 751

**Особенности:**
- ✅ Реалистичная форма снежинки (центр + 6 лучей)
- ✅ Вращение во время падения
- ✅ Покачивание влево-вправо (swing)
- ✅ Свечение (box-shadow)
- ✅ Адаптивное количество (40 на mobile, 70 на desktop)
- ✅ Вариация размеров (3-9px)

---

### 3. **renderSnow** (CSS простой) — WeatherBackground.jsx
**Лёгкий вариант для производительности**

```jsx
const renderSnow = () => {
  if (condition !== 'snowy') return null;
  
  const flakeCount = 30; // Меньше снежинок для производительности
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: flakeCount }, (_, i) => {
        const size = 2 + Math.random() * 3; // 2-5px
        return (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-70 md:opacity-80 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 6}s`
            }}
          />
        );
      })}
    </div>
  );
};
```

**Где используется:**
- [WeatherBackground.jsx](src/components/WeatherBackground.jsx#L266) — строка 266

**Особенности:**
- ✅ Простые круглые снежинки
- ✅ Минимальная нагрузка
- ✅ Использует Tailwind класс `animate-float`
- ✅ Всего 30 снежинок

---

## 🎨 Стили и анимации

### Tailwind конфигурация (tailwind.config.js)

```javascript
export default {
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
};
```

### CSS классы для снега

**Базовые классы:**
```css
/* Белая снежинка */
.bg-white

/* Прозрачность */
.opacity-70 md:opacity-80

/* Круглая форма */
.rounded-full

/* Анимация плавающего движения */
.animate-float

/* Убрать взаимодействие */
.pointer-events-none

/* Скрыть overflow */
.overflow-hidden
```

**Inline стили для вариации:**
```jsx
style={{
  left: `${Math.random() * 100}%`,      // Случайная позиция X
  top: '-5%',                            // Начало сверху экрана
  width: `${size}px`,                    // Размер снежинки
  height: `${size}px`,
  animationDelay: `${delay}s`,           // Задержка старта
  animationDuration: `${duration}s`      // Длительность анимации
}}
```

---

## 📊 Сравнение визуализаторов

| Параметр | SnowParticles (3D) | renderSnow (DynamicBG) | renderSnow (WeatherBG) |
|----------|-------------------|----------------------|---------------------|
| **Технология** | Three.js Points | CSS + DOM | CSS + DOM |
| **Количество** | 800 | 40-70 | 30 |
| **Форма** | Точки | 6 лучей | Круги |
| **Вращение** | ❌ | ✅ | ❌ |
| **Покачивание** | ✅ (sin wave) | ✅ (swing) | ✅ (float) |
| **Производительность** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Реализм** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **3D интеграция** | ✅ | ❌ | ❌ |

---

## 🚀 Использование в проекте

### В WeatherScene.jsx (3D)

```jsx
import SnowParticles from './SnowParticles';

const isSnowing = weatherCondition.includes('snow');

return (
  <Canvas>
    {/* Другие элементы сцены */}
    
    {/* Снег */}
    {isSnowing && <SnowParticles intensity={800} />}
  </Canvas>
);
```

### В DynamicWeatherBackground.jsx (CSS)

```jsx
export default function DynamicWeatherBackground({ condition }) {
  const renderSnow = () => {
    if (condition !== 'snowy') return null;
    // ... код из примера выше
  };

  return (
    <div className="relative w-full h-full">
      {/* Фон */}
      
      {/* Снег */}
      {renderSnow()}
    </div>
  );
}
```

---

## 🎯 Создание нового компонента снега

Если хочешь создать свой компонент снега, вот шаблон:

```jsx
import React from 'react';

const CustomSnow = ({ count = 50 }) => {
  const snowflakes = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 5 + Math.random() * 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-white rounded-full animate-float"
          style={{
            left: `${flake.left}%`,
            top: '-10px',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default CustomSnow;
```

---

## 📝 Рекомендации

### Для лучшей производительности:
1. Используй **WeatherBackground.jsx** версию (30 снежинок)
2. Отключи вращение и сложные формы
3. Уменьши количество снежинок на мобильных

### Для максимального реализма:
1. Используй **DynamicWeatherBackground.jsx** версию
2. Добавь box-shadow для свечения
3. Используй CSS переменные для покачивания

### Для 3D интеграции:
1. Используй **SnowParticles** (Three.js)
2. Настрой размер и скорость под свою сцену
3. Комбинируй с туманом (FogEffect)

---

**Все компоненты готовы к использованию! ❄️**

Выбери подходящий для твоего проекта или комбинируй несколько.
