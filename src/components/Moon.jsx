// Moon.jsx
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Unified Moon 3D component для всего проекта
 * Используется в WeatherScene и SolarScene
 * 
 * Improvements:
 * - Единая логика для всех сцен
 * - Graceful fallback с множественными источниками текстур
 * - Configurable size, rotation speed, quality
 * - Optional glow & atmosphere
 * - Light theme support (emissive boost для видимости)
 */
export default function Moon({
  radius = 1,
  rotationSpeed = 0.05,
  quality = "high", // 'low' | 'medium' | 'high'
  showGlow = true,
  showAtmosphere = true,
  lightTheme = false,
  // Основные пути текстур
  colorMapUrl = '/textures/2k_moon.jpg',
  bumpMapUrl = '/textures/2k_moon_bump.jpg',
  // Legacy props для совместимости
  texturePath,
  bumpPath,
  specularPath
}) {
  const moonRef = useRef();
  const [maps, setMaps] = useState({ color: null, bump: null });

  // Используем новые или legacy prop names
  const finalColorPath = colorMapUrl || texturePath || '/textures/2k_moon.jpg';
  const finalBumpPath = bumpMapUrl || bumpPath || '/textures/2k_moon_bump.jpg';

  // Segment resolution based on quality
  const segments = quality === 'low' ? 48 : quality === 'medium' ? 64 : 96;

  useEffect(() => {
    let mounted = true;
    const loader = new THREE.TextureLoader();

    // Множественные fallback источники текстур
    const colorSources = [
      finalColorPath,
      '/textures/moon/Moon.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg',
      '/textures/2k_moon.jpg'
    ];

    const bumpSources = [
      finalBumpPath,
      '/textures/moon/moon_bump.jpg',
      '/textures/2k_moon_bump.jpg',
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg'
    ];

    const loadWithFallback = (sources, onSuccess, type = 'texture') => {
      let currentIndex = 0;
      const tryLoad = () => {
        if (currentIndex >= sources.length) {
          console.warn(`Moon: Failed to load ${type} from all sources`);
          return;
        }
        loader.load(
          sources[currentIndex],
          (tex) => {
            if (!mounted) return;
            // Enhance texture quality
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.anisotropy = 16;
            tex.minFilter = THREE.LinearMipMapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            onSuccess(tex);
          },
          undefined,
          () => {
            currentIndex++;
            tryLoad();
          }
        );
      };
      tryLoad();
    };

    loadWithFallback(colorSources, (color) => setMaps(prev => ({ ...prev, color })), 'color map');
    loadWithFallback(bumpSources, (bump) => setMaps(prev => ({ ...prev, bump })), 'bump map');

    return () => { mounted = false; };
  }, [finalColorPath, finalBumpPath]);

  // Smooth rotation
  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += rotationSpeed * 0.001 * delta * 60;
    }
  });

  // Unified material properties для обеих тем
  const materialProps = useMemo(() => ({
    map: maps.color || null,
    bumpMap: maps.bump || null,
    bumpScale: maps.bump ? 0.3 : 0,
    roughness: lightTheme ? 0.85 : 0.95,
    metalness: 0.0,
    // Light theme: увеличиваем emissive для видимости на светлом фоне
    emissive: lightTheme ? "#9fb3ff" : "#1a1a1a",
    emissiveIntensity: lightTheme ? 0.25 : 0.05,
    color: maps.color ? "#ffffff" : (lightTheme ? "#a0a099" : "#d0d0d0"),
  }), [maps, lightTheme]);

  return (
    <group>
      {/* Main moon mesh */}
      <mesh ref={moonRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, segments, segments]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Subtle glow around the moon */}
      {showGlow && (
        <mesh scale={[1.12, 1.12, 1.12]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color="#9fb3ff"
            transparent
            opacity={lightTheme ? 0.15 : 0.12}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Optional atmosphere */}
      {showAtmosphere && (
        <mesh scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={lightTheme ? "#7d7d7a" : "#4a5a7a"}
            transparent
            opacity={lightTheme ? 0.08 : 0.04}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Cool point light to give the moon rim lighting */}
      <pointLight 
        color="#9fb3ff" 
        intensity={0.8} 
        distance={radius * 12} 
        decay={2} 
      />
    </group>
  );
}