import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Cloud, Sun, Moon, CloudRain, Wind } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import * as THREE from 'three';

/**
 * DynamicWeatherBackground - многослойный фон для погодного приложения
 * 
 * Архитектура: 3 слоя (Sky 40%, Horizon 30%, Ground 30%)
 * Стилизация: 100% Tailwind utilities + inline только для динамики
 * Темы: light/dark через ThemeContext
 */
export default function DynamicWeatherBackground({
  condition = 'clear', // 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'
  timeOfDay = 'day', // 'day' | 'night' | 'sunrise' | 'sunset'
  temperature = 20,
  windSpeed = 0,
  children,
  className = ''
}) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  
  // Динамические состояния
  const [sunPosition, setSunPosition] = useState(50); // 0-100%
  const [moonPhase, setMoonPhase] = useState(0.5); // 0-1

  // Three.js refs
  const threeContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);
  const weatherObjectsRef = useRef([]);

  // Three.js геометрии (memoized)
  const geometries = useMemo(() => ({
    cloud: new THREE.SphereGeometry(0.5, 16, 16),
    raindrop: new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
    snowflake: new THREE.BufferGeometry()
  }), []);

  // Инициализация Three.js сцены
  useEffect(() => {
    if (!threeContainerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Resize handler with throttle
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!cameraRef.current || !rendererRef.current) return;
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Animate weather objects
      weatherObjectsRef.current.forEach((obj) => {
        if (obj.userData.isRaindrop) {
          obj.position.y -= 0.1;
          if (obj.position.y < -10) obj.position.y = 10;
        }
        if (obj.userData.isSnowflake) {
          obj.position.y -= 0.02;
          obj.position.x += Math.sin(obj.position.y * 0.1) * 0.01;
          if (obj.position.y < -10) obj.position.y = 10;
        }
        if (obj.userData.isCloud) {
          obj.position.x += 0.001;
          if (obj.position.x > 10) obj.position.x = -10;
        }
      });

      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && threeContainerRef.current) {
        threeContainerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      weatherObjectsRef.current = [];
    };
  }, []);

  // Update weather effects based on condition
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous weather objects
    weatherObjectsRef.current.forEach((obj) => {
      sceneRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    weatherObjectsRef.current = [];

    // Add weather effects based on condition
    if (condition === 'clear' || condition === 'cloudy') {
      // Floating clouds
      const cloudCount = condition === 'cloudy' ? 8 : 3;
      for (let i = 0; i < cloudCount; i++) {
        const cloudGroup = new THREE.Group();
        
        // Multiple spheres for cloud shape
        for (let j = 0; j < 5; j++) {
          const sphere = new THREE.Mesh(
            geometries.cloud,
            new THREE.MeshPhongMaterial({ 
              color: 0xffffff, 
              transparent: true, 
              opacity: 0.4 
            })
          );
          sphere.position.set(
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          );
          sphere.scale.set(
            0.5 + Math.random() * 0.5,
            0.3 + Math.random() * 0.3,
            0.5 + Math.random() * 0.5
          );
          cloudGroup.add(sphere);
        }
        
        cloudGroup.position.set(
          (Math.random() - 0.5) * 20,
          2 + Math.random() * 3,
          -5 + Math.random() * 5
        );
        cloudGroup.userData.isCloud = true;
        sceneRef.current.add(cloudGroup);
        weatherObjectsRef.current.push(cloudGroup);
      }
    }

    if (condition === 'rainy' || condition === 'stormy') {
      // Raindrops (InstancedMesh)
      const raindropCount = condition === 'stormy' ? 500 : 300;
      const instancedRain = new THREE.InstancedMesh(
        geometries.raindrop,
        new THREE.MeshPhongMaterial({ 
          color: 0x88ccff, 
          transparent: true, 
          opacity: 0.3 
        }),
        raindropCount
      );

      const matrix = new THREE.Matrix4();
      for (let i = 0; i < raindropCount; i++) {
        const x = (Math.random() - 0.5) * 30;
        const y = Math.random() * 20 - 5;
        const z = (Math.random() - 0.5) * 20;
        matrix.setPosition(x, y, z);
        instancedRain.setMatrixAt(i, matrix);
      }
      instancedRain.userData.isRaindrop = true;
      sceneRef.current.add(instancedRain);
      weatherObjectsRef.current.push(instancedRain);
    }

    if (condition === 'snowy') {
      // Snowflakes (Points)
      const snowflakeCount = 1000;
      const positions = new Float32Array(snowflakeCount * 3);
      
      for (let i = 0; i < snowflakeCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 20 - 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }

      geometries.snowflake.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );

      const snowMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
      });

      const snow = new THREE.Points(geometries.snowflake, snowMaterial);
      snow.userData.isSnowflake = true;
      sceneRef.current.add(snow);
      weatherObjectsRef.current.push(snow);
    }
  }, [condition, geometries]);

  // Функция получения классов для слоёв
  const getBackgroundClasses = (layer) => {
    const base = "absolute inset-0 bg-gradient-to-b transition-all duration-1000";
    
    const gradients = {
      clear: {
        day: {
          sky: "from-blue-400 via-blue-300 to-cyan-200",
          horizon: "from-cyan-200 via-orange-200 to-amber-200",
          ground: "from-amber-200 via-yellow-100 to-green-100"
        },
        night: {
          sky: "from-indigo-950 via-blue-900 to-indigo-800",
          horizon: "from-indigo-800 via-purple-700 to-indigo-600",
          ground: "from-indigo-600 via-slate-700 to-slate-800"
        }
      },
      cloudy: {
        day: {
          sky: "from-gray-400 via-blue-200 to-slate-300",
          horizon: "from-slate-300 via-slate-200 to-gray-200",
          ground: "from-gray-200 via-green-50 to-green-100"
        },
        night: {
          sky: "from-slate-900 via-slate-700 to-slate-600",
          horizon: "from-slate-600 via-gray-600 to-gray-500",
          ground: "from-gray-500 via-slate-700 to-slate-800"
        }
      },
      rainy: {
        day: {
          sky: "from-slate-600 via-gray-500 to-blue-400",
          horizon: "from-blue-400 via-gray-400 to-blue-300",
          ground: "from-blue-300 via-gray-200 to-slate-200"
        },
        night: {
          sky: "from-slate-950 via-slate-800 to-gray-800",
          horizon: "from-gray-800 via-blue-900 to-slate-700",
          ground: "from-slate-700 via-slate-800 to-slate-900"
        }
      },
      stormy: {
        day: {
          sky: "from-gray-700 via-slate-600 to-slate-500",
          horizon: "from-slate-500 via-gray-500 to-slate-400",
          ground: "from-slate-400 via-gray-400 to-slate-300"
        },
        night: {
          sky: "from-slate-950 via-gray-900 to-slate-800",
          horizon: "from-slate-800 via-gray-800 to-slate-700",
          ground: "from-slate-700 via-gray-700 to-slate-800"
        }
      },
      snowy: {
        day: {
          sky: "from-slate-300 via-blue-100 to-cyan-50",
          horizon: "from-cyan-50 via-slate-100 to-blue-50",
          ground: "from-blue-50 via-white to-slate-50"
        },
        night: {
          sky: "from-slate-800 via-blue-900 to-indigo-900",
          horizon: "from-indigo-900 via-slate-700 to-blue-800",
          ground: "from-blue-800 via-slate-600 to-slate-700"
        }
      },
      sunrise: {
        day: {
          sky: "from-orange-300 via-pink-300 to-purple-200",
          horizon: "from-purple-200 via-rose-300 to-orange-300",
          ground: "from-orange-300 via-amber-200 to-yellow-100"
        },
        night: {
          sky: "from-indigo-900 via-purple-800 to-pink-700",
          horizon: "from-pink-700 via-orange-600 to-amber-600",
          ground: "from-amber-600 via-yellow-700 to-slate-700"
        }
      },
      sunset: {
        day: {
          sky: "from-orange-400 via-red-300 to-purple-300",
          horizon: "from-purple-300 via-pink-400 to-orange-400",
          ground: "from-orange-400 via-amber-300 to-yellow-200"
        },
        night: {
          sky: "from-purple-900 via-pink-800 to-orange-700",
          horizon: "from-orange-700 via-red-700 to-purple-700",
          ground: "from-purple-700 via-indigo-700 to-slate-800"
        }
      }
    };

    const weatherCondition = condition in gradients ? condition : 'clear';
    const time = timeOfDay === 'sunrise' || timeOfDay === 'sunset' ? timeOfDay : (isDark || timeOfDay === 'night' ? 'night' : 'day');
    
    const gradient = gradients[weatherCondition]?.[time]?.[layer] || gradients.clear.day[layer];
    
    return `${base} ${gradient}`;
  };

  // Рендер звёзд (только ночью) - адаптивно
  const renderStars = () => {
    if ((!isDark && timeOfDay !== 'night') || condition !== 'clear') return null;
    
    const starPositions = [
      { top: '10%', left: '20%', delay: '0s', mobile: true },
      { top: '20%', right: '40%', delay: '0.1s', mobile: true },
      { top: '15%', left: '60%', delay: '0.2s', mobile: true },
      { top: '25%', right: '20%', delay: '0.3s', mobile: true },
      { top: '8%', left: '45%', delay: '0.4s', mobile: true },
      { top: '30%', left: '15%', delay: '0.5s', mobile: true },
      { top: '12%', right: '55%', delay: '0.6s', mobile: false },
      { top: '22%', left: '75%', delay: '0.7s', mobile: false },
      { top: '18%', right: '10%', delay: '0.8s', mobile: false },
      { top: '28%', left: '35%', delay: '0.9s', mobile: false },
      { top: '5%', right: '65%', delay: '1s', mobile: false },
      { top: '35%', left: '50%', delay: '1.1s', mobile: false }
    ];

    return (
      <div className="absolute inset-0 pointer-events-none h-[45%] sm:h-[40%]">
        {starPositions.map((pos, i) => (
          <div
            key={i}
            className={`absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full animate-pulse ${
              pos.mobile ? '' : 'hidden md:block'
            }`}
            style={{ 
              top: pos.top, 
              left: pos.left, 
              right: pos.right,
              animationDelay: pos.delay,
              animationDuration: `${2 + Math.random()}s`
            }}
          />
        ))}
      </div>
    );
  };

  // Рендер облаков - адаптивно
  const renderClouds = () => {
    if (condition === 'clear' && timeOfDay !== 'cloudy') return null;

    const cloudCount = condition === 'rainy' || condition === 'stormy' ? 5 : 3;
    const baseDuration =
      condition === 'stormy' ? 28 :
      condition === 'rainy' ? 40 :
      condition === 'cloudy' ? 70 :
      80;

    const windBoost = Math.min(Math.max(windSpeed, 0), 25);
    const durationFactor = 1 - windBoost / 80;

    const clouds = Array.from({ length: cloudCount }, (_, i) => ({
      size: 28 + i * 10,
      top: `${10 + i * 8}%`,
      opacity: condition === 'rainy' ? 'opacity-60' : 'opacity-30',
      delay: -(i * 8),
      duration: Math.max(18, (baseDuration + i * 10) * durationFactor),
      direction: i % 2 === 0 ? 'normal' : 'reverse',
      desktop: i >= 2 // Декоративные облака только на desktop
    }));

    return clouds.map((cloud, i) => (
      <div
        key={i}
        className={`absolute animate-cloud-drift pointer-events-none ${
          cloud.desktop ? 'hidden lg:block' : ''
        }`}
        style={{
          top: cloud.top,
          left: 0,
          '--cloud-drift-duration': `${cloud.duration}s`,
          '--cloud-drift-delay': `${cloud.delay}s`,
          '--cloud-drift-direction': cloud.direction
        }}
      >
        <div className="animate-cloud-appear">
          <div
            className={`animate-float ${cloud.opacity} transition-opacity duration-1000`}
            style={{
              animationDelay: `${Math.abs(cloud.delay) * 0.05}s`
            }}
          >
            <Cloud size={cloud.size} className="text-white dark:text-slate-300" />
          </div>
        </div>
      </div>
    ));
  };

  // Рендер солнца/луны - адаптивно
  const renderCelestialBody = () => {
    const isNight = isDark || timeOfDay === 'night';
    const isSunriseOrSunset = timeOfDay === 'sunrise' || timeOfDay === 'sunset';

    // Don't show the moon through precipitation/heavy weather
    if (isNight && condition !== 'clear') return null;

    if (isNight) {
      return (
        <div 
          className="absolute animate-glow transition-all duration-1000 xl:hover:scale-110"
          style={{ 
            top: '15%', 
            right: '20%',
            transform: 'translate(50%, -50%)'
          }}
        >
          <div className="relative">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-slate-200 rounded-full shadow-2xl"
              style={{
                boxShadow: '0 0 40px rgba(203, 213, 225, 0.6), 0 0 80px rgba(203, 213, 225, 0.3)'
              }}
            />
            {/* Кратеры луны */}
            <div className="absolute top-1 left-2 sm:top-2 sm:left-3 w-2 h-2 sm:w-3 sm:h-3 bg-slate-300 rounded-full opacity-40" />
            <div className="absolute top-4 right-2 sm:top-6 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-300 rounded-full opacity-30" />
            <div className="absolute bottom-2 left-3 sm:bottom-3 sm:left-5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-300 rounded-full opacity-35 hidden sm:block" />
          </div>
        </div>
      );
    }

    // Солнце (день, рассвет, закат)
    const sunColor = isSunriseOrSunset 
      ? 'bg-orange-400' 
      : 'bg-yellow-300';
    const glowColor = isSunriseOrSunset
      ? 'rgba(251, 146, 60, 0.6)'
      : 'rgba(253, 224, 71, 0.6)';

    return (
      <div 
        className="absolute animate-glow transition-all duration-1000 xl:hover:scale-110"
        style={{ 
          top: isSunriseOrSunset ? '25%' : '12%', 
          left: isSunriseOrSunset ? '15%' : '25%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="relative">
          <div 
            className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${sunColor} rounded-full shadow-2xl`}
            style={{
              boxShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`
            }}
          />
          {/* Лучи солнца */}
          <div className="absolute inset-0 animate-spin hidden sm:block" style={{ animationDuration: '20s' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`absolute left-1/2 top-1/2 w-0.5 h-6 sm:w-1 sm:h-8 ${sunColor} opacity-50`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${(360 / 8) * i}deg) translateY(-40px)`,
                  filter: 'blur(1px)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Рендер дождя - реалистичные капли с брызгами
  const renderRain = () => {
    if (condition !== 'rainy' && condition !== 'stormy') return null;

    // Меньше капель на мобильных для производительности
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const baseCount = condition === 'stormy' ? 150 : 80;
    const dropCount = isMobile ? Math.floor(baseCount * 0.4) : baseCount;
    const drops = Array.from({ length: dropCount }, (_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = condition === 'stormy' ? (0.4 + Math.random() * 0.2) : (0.7 + Math.random() * 0.3);
      const opacity = 0.3 + Math.random() * 0.4;
      const length = condition === 'stormy' ? (6.67 + Math.random() * 5) : (5 + Math.random() * 3.33);
      
      return {
        left: `${left}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        opacity,
        length: `${length}px`,
        splashDelay: `${delay + duration}s`
      };
    });

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {drops.map((drop, i) => (
          <div key={i} style={{ position: 'absolute', left: drop.left, top: '-5%' }}>
            {/* Капля дождя */}
            <div
              className="absolute bg-gradient-to-b from-transparent via-blue-100 to-blue-200"
              style={{
                width: '1.5px',
                height: drop.length,
                opacity: drop.opacity,
                boxShadow: `0 0 3px rgba(147, 197, 253, ${drop.opacity * 0.5})`,
                animation: `fall ${drop.duration} linear infinite ${drop.delay}`,
                borderRadius: '0 0 50% 50%'
              }}
            />
            {/* Брызги при падении */}
            <div
              className="absolute"
              style={{
                width: '8px',
                height: '8px',
                left: '-3px',
                top: '100vh',
                opacity: drop.opacity * 0.6,
                animation: `splash 0.3s ease-out infinite ${drop.splashDelay}`,
                pointerEvents: 'none'
              }}
            >
              <div className="absolute w-full h-0.5 bg-blue-200/60 rounded-full transform -rotate-45"></div>
              <div className="absolute w-full h-0.5 bg-blue-200/60 rounded-full transform rotate-45"></div>
            </div>
          </div>
        ))}
        <style jsx>{`
          @keyframes splash {
            0% {
              transform: scale(0);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.3;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  };

  // Рендер снега - реалистичные снежинки
  const renderSnow = () => {
    if (condition !== 'snowy') return null;

    // Меньше снежинок на мобильных
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

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* СЕКЦИЯ 1 - НЕБО (Sky) - 40% высоты */}
      <div 
        className="absolute inset-x-0 top-0 h-[45%] sm:h-[40%]
                   bg-gradient-to-b 
                   transition-all duration-1000
                   xl:hover:scale-[1.02] xl:transition-transform xl:duration-700"
        style={{ 
          backgroundImage: isDark 
            ? 'linear-gradient(to bottom, #1e1b4b 0%, #1e3a8a 50%, #312e81 100%)'
            : 'linear-gradient(to bottom, #60a5fa 0%, #7dd3fc 50%, #67e8f9 100%)'
        }}
      >
        {/* Three.js контейнер для неба (звёзды, небесные тела) */}
        <div 
          ref={threeContainerRef}
          className="absolute inset-0 opacity-60 md:opacity-80 transition-opacity duration-1000"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        />
        
        {/* Старые элементы неба */}
        {renderStars()}
        {renderCelestialBody()}
      </div>

      {/* СЕКЦИЯ 2 - ГОРИЗОНТ (Horizon) - 30% высоты */}
      <div 
        className="absolute inset-x-0 h-[25%] sm:h-[30%] cloud-edge-fade
                   bg-gradient-to-b
                   transition-all duration-1000
                   xl:hover:scale-[1.01] xl:transition-transform xl:duration-500"
        style={{ 
          top: '45%',
          backgroundImage: isDark
            ? 'linear-gradient(to bottom, #312e81 0%, #6b21a8 50%, #581c87 100%)'
            : 'linear-gradient(to bottom, #67e8f9 0%, #fed7aa 50%, #fbbf24 100%)'
        }}
      >
        {/* Облака из CSS рендера (не Three.js) */}
        {renderClouds()}
      </div>

      {/* СЕКЦИЯ 3 - ЗЕМЛЯ (Ground) - 30% высоты */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[30%]
                   bg-gradient-to-b
                   transition-all duration-1000"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(to bottom, #581c87 0%, #475569 50%, #1e293b 100%)'
            : 'linear-gradient(to bottom, #fbbf24 0%, #bef264 50%, #86efac 100%)'
        }}
      />

      {/* Погодные эффекты */}
      {renderRain()}
      {renderSnow()}

      {/* Контент поверх фона */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* CSS анимации для дождя/снега */}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}
