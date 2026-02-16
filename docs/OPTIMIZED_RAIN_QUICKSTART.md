# ⚡ OptimizedRain — Быстрый старт

## 🎯 Главное отличие

**Правильная длина капель:** 0.18-0.28 единиц (вместо 0.6-1.3 в ImprovedRainStreaks)

## 📦 Использование

```jsx
import { Canvas } from '@react-three/fiber';
import OptimizedRain from './components/OptimizedRain';

function App() {
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      
      <OptimizedRain />
    </Canvas>
  );
}
```

## 🎨 Примеры

### Лёгкий дождь
```jsx
<OptimizedRain count={400} intensity={0.7} windSpeed={0.2} />
```

### Сильный ливень
```jsx
<OptimizedRain count={1200} intensity={1.8} windSpeed={0.6} />
```

### Шторм
```jsx
<OptimizedRain 
  count={1000} 
  intensity={2.0} 
  windSpeed={0.9}
  windDirection={Math.PI / 3}
/>
```

## 🧪 Демо

Откройте в браузере:
```
public/OptimizedRainDemo.html
```

Или перейдите по адресу:
```
http://localhost:5173/OptimizedRainDemo.html
```

## 📊 Параметры

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| `count` | `800` | Количество капель |
| `intensity` | `1.0` | Интенсивность дождя |
| `windSpeed` | `0.3` | Скорость ветра |
| `dropletLength` | `0.23` | Длина капли (0.18-0.28) |
| `color` | `'#b8d4f0'` | Цвет капель |

## 📚 Полная документация

См. [OPTIMIZED_RAIN_GUIDE.md](./OPTIMIZED_RAIN_GUIDE.md)

## ✅ Сравнение с другими компонентами

| Компонент | Длина капель | FPS | Рекомендация |
|-----------|--------------|-----|--------------|
| **OptimizedRain** | 0.18-0.28 ✅ | 58-60 | **Используйте этот** |
| RealisticRainStreaks | 0.15-0.25 ✅ | 45-55 | Для максимального реализма |
| ImprovedRainStreaks | 0.6-1.3 ❌ | 55-60 | Устарел |
