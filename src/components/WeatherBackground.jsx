import React, { useContext } from 'react';
import { Cloud, Droplets, Snowflake } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * WeatherBackground - легковесный погодный фон без Three.js
 * 
 * Inline-стили ТОЛЬКО для:
 * - Динамические позиции (cloudOffset, animationDelay)
 * - Вычисляемые значения (%, времена анимаций)
 * - Уникальные параметры частиц (размер, скорость)
 * 
 * Все остальное - Tailwind utilities
 */
export default function WeatherBackground({
  condition = 'clear', // 'clear' | 'cloudy' | 'rainy' | 'snowy'
  children,
  className = ''
}) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Градиенты для слоёв (Tailwind only)
  const getLayerClasses = (layer) => {
    const base = "absolute inset-0 bg-gradient-to-b transition-all duration-1000";
    
    const gradients = {
      clear: {
        sky: isDark 
          ? "from-indigo-950 via-blue-900 to-indigo-800"
          : "from-blue-400 via-sky-300 to-cyan-200",
        horizon: isDark
          ? "from-indigo-800 via-purple-700 to-indigo-700"
          : "from-cyan-200 via-orange-200 to-amber-100",
        ground: isDark
          ? "from-indigo-700 via-slate-700 to-slate-800"
          : "from-amber-100 via-green-50 to-green-100"
      },
      cloudy: {
        sky: isDark
          ? "from-slate-900 via-slate-700 to-slate-600"
          : "from-gray-400 via-slate-300 to-blue-200",
        horizon: isDark
          ? "from-slate-600 via-gray-600 to-gray-500"
          : "from-blue-200 via-slate-200 to-gray-100",
        ground: isDark
          ? "from-gray-500 via-slate-700 to-slate-800"
          : "from-gray-100 via-green-50 to-slate-100"
      },
      rainy: {
        sky: isDark
          ? "from-slate-950 via-gray-800 to-slate-700"
          : "from-slate-600 via-gray-500 to-slate-400",
        horizon: isDark
          ? "from-slate-700 via-blue-900 to-gray-700"
          : "from-slate-400 via-blue-300 to-slate-300",
        ground: isDark
          ? "from-gray-700 via-slate-800 to-slate-900"
          : "from-slate-300 via-gray-200 to-blue-100"
      },
      snowy: {
        sky: isDark
          ? "from-slate-800 via-blue-900 to-indigo-900"
          : "from-slate-200 via-blue-50 to-white",
        horizon: isDark
          ? "from-indigo-900 via-slate-700 to-blue-800"
          : "from-white via-cyan-50 to-blue-50",
        ground: isDark
          ? "from-blue-800 via-slate-600 to-slate-700"
          : "from-blue-50 via-white to-slate-50"
      }
    };

    return `${base} ${gradients[condition]?.[layer] || gradients.clear[layer]}`;
  };

  // Рендер облаков
  const renderClouds = () => {
    if (condition === 'clear') return null;
    
    const cloudCount = condition === 'rainy' ? 6 : condition === 'cloudy' ? 8 : 4;
    const baseDuration = condition === 'rainy' ? 35 : condition === 'cloudy' ? 65 : 80;
    
    return Array.from({ length: cloudCount }, (_, i) => (
      <div
        key={i}
        className={`absolute animate-cloud-drift opacity-40 md:opacity-50
                   ${i >= 4 ? 'hidden lg:block' : ''}`}
        style={{
          top: `${8 + i * 6}%`,
          left: 0,
          '--cloud-drift-duration': `${baseDuration + i * 12}s`,
          '--cloud-drift-delay': `${-(i * 10)}s`,
          '--cloud-drift-direction': i % 2 === 0 ? 'normal' : 'reverse'
        }}
      >
        <div className="animate-cloud-appear">
          <div className="animate-float">
            <Cloud className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white dark:text-slate-200" />
          </div>
        </div>
      </div>
    ));
  };

  // Рендер дождя
  const renderRain = () => {
    if (condition !== 'rainy') return null;
    
    const dropCount = 40; // Меньше для производительности
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: dropCount }, (_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-6 md:h-8 bg-blue-300/40 dark:bg-blue-200/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`,
              animation: `fall ${0.6 + Math.random() * 0.4}s linear infinite ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    );
  };

  // Рендер снега
  const renderSnow = () => {
    if (condition !== 'snowy') return null;
    
    const flakeCount = 30;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: flakeCount }, (_, i) => {
          const size = 2 + Math.random() * 3;
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

  // Рендер звёзд (ночью)
  const renderStars = () => {
    if (!isDark || condition !== 'clear') return null;
    
    const starCount = 20;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: starCount }, (_, i) => (
          <div
            key={i}
            className={`absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full animate-pulse-slow
                       ${i >= 12 ? 'hidden md:block' : ''}`}
            style={{
              top: `${Math.random() * 35}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    );
  };

  // Рендер декоративных элементов
  const renderDecorations = () => {
    return (
      <>
        {/* Солнце (только день, ясная погода) */}
        {!isDark && condition === 'clear' && (
          <div 
            className="absolute top-[15%] left-[20%] 
                       w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                       bg-yellow-300 dark:bg-yellow-200 rounded-full 
                       animate-glow shadow-2xl
                       hidden sm:block xl:hover:scale-110 transition-transform duration-500"
            style={{
              boxShadow: '0 0 40px rgba(253, 224, 71, 0.6), 0 0 80px rgba(253, 224, 71, 0.4)'
            }}
          >
            {/* Лучи */}
            <div className="absolute inset-0 animate-spin-slow">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-0.5 md:w-1 h-6 md:h-8 bg-yellow-300 opacity-50"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${(360 / 8) * i}deg) translateY(-36px)`,
                    filter: 'blur(1px)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Луна (только ночь) */}
        {isDark && condition === 'clear' && (
          <div 
            className="absolute top-[12%] right-[18%]
                       w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16
                       bg-slate-200 rounded-full shadow-2xl animate-glow
                       xl:hover:scale-110 transition-transform duration-500"
            style={{
              boxShadow: '0 0 40px rgba(203, 213, 225, 0.5), 0 0 80px rgba(203, 213, 225, 0.3)'
            }}
          >
            {/* Кратеры */}
            <div className="absolute top-1 left-2 sm:top-2 sm:left-3 w-2 h-2 sm:w-3 sm:h-3 bg-slate-300 rounded-full opacity-40" />
            <div className="absolute top-4 right-2 sm:top-6 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 rounded-full opacity-30" />
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Layer 1 - SKY (45% mobile, 40% desktop) */}
      <div 
        className={`${getLayerClasses('sky')} 
                   h-[45%] sm:h-[40%]
                   xl:hover:scale-[1.02] xl:transition-transform xl:duration-700`}
        style={{ top: 0 }}
      >
        {renderStars()}
        {renderDecorations()}
      </div>

      {/* Layer 2 - HORIZON (25% mobile, 30% desktop) */}
      <div 
        className={`${getLayerClasses('horizon')} 
                   h-[25%] sm:h-[30%] cloud-edge-fade`}
        style={{ top: '45%', '@media (min-width: 640px)': { top: '40%' } }}
      >
        {renderClouds()}
      </div>

      {/* Layer 3 - GROUND (30%) */}
      <div 
        className={`${getLayerClasses('ground')} h-[30%]`}
        style={{ top: '70%' }}
      />

      {/* Погодные эффекты */}
      {renderRain()}
      {renderSnow()}

      {/* Контент с z-index */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* CSS анимация для падения */}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(110vh);
          }
        }
      `}</style>
    </div>
  );
}
