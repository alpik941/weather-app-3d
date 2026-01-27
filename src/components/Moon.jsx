// Moon.jsx
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Moon 3D object
 * Improvements:
 * - Removed hardcoded /Public path (Vite serves from /)
 * - Graceful fallback if textures fail to load
 * - Configurable size & rotation speed
 * - Reduced default geometry segments for performance (still detailed)
 * - Optional glow & atmosphere toggles
 */
export default function Moon({
  radius = 1,
  rotationSpeed = 0.05, // degrees per second equivalent factor
  quality = "high", // 'low' | 'medium' | 'high'
  showGlow = true,
  showAtmosphere = true,
  lightTheme = false,
  texturePath = "/textures/moon/Moon.jpg",
  bumpPath = "/textures/moon/moon_bump.jpg",
  specularPath = "/textures/moon/moon_specular.jpg"
}) {
  const moonRef = useRef();
  const [maps, setMaps] = useState({ color: null, bump: null, specular: null });

  // Segment resolution based on quality - increased for better bump visibility
  const segments = quality === 'low' ? 64 : quality === 'medium' ? 96 : 128;

  useEffect(() => {
    let mounted = true;
    const loader = new THREE.TextureLoader();

    // Fallback texture sources
    const textureSources = [
      texturePath,
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg',
      '/textures/2k_moon.jpg'
    ];

    const bumpSources = [
      bumpPath,
      '/textures/2k_moon_bump.jpg',
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg'
    ];

    const loadWithFallback = (sources, onSuccess, type = 'texture') => {
      let currentIndex = 0;
      const tryLoad = () => {
        if (currentIndex >= sources.length) {
          console.warn(`Failed to load ${type} from all sources`);
          return;
        }
        loader.load(
          sources[currentIndex],
          (tex) => {
            if (!mounted) return;
            // Enhance texture quality
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

    loadWithFallback(textureSources, (color) => setMaps(prev => ({ ...prev, color })), 'color map');
    loadWithFallback(bumpSources, (bump) => setMaps(prev => ({ ...prev, bump })), 'bump map');

    return () => { mounted = false; };
  }, [texturePath, bumpPath, specularPath]);

  // Smooth rotation
  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += rotationSpeed * 0.001 * delta * 60; // normalize for fps
    }
  });

  const materialProps = useMemo(() => ({
    map: maps.color || null,
    bumpMap: maps.bump || null,
    bumpScale: maps.bump ? 0.35 : 0, // Increased for visible relief
    normalMap: maps.bump || null,
    normalScale: maps.bump ? [0.8, 0.8] : [0, 0],
    roughness: lightTheme ? 0.9 : 0.95,
    metalness: 0.0,
    emissive: lightTheme ? "#8a8a82" : "#1a1a1a",
    emissiveIntensity: lightTheme ? 0.4 : 0.08,
    color: lightTheme ? "#a0a099" : "#ffffff",
  }), [maps, lightTheme]);

  return (
    <>
      <mesh ref={moonRef}>
        <sphereGeometry args={[radius, segments, segments]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {showGlow && (
        <mesh>
          <sphereGeometry args={[radius * 1.03, 48, 48]} />
          <meshBasicMaterial
            color={lightTheme ? "#9a9a92" : "white"}
            transparent
            opacity={lightTheme ? 0.12 : 0.04}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {showAtmosphere && (
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial
            color={lightTheme ? "#7d7d7a" : "#4a5a7a"}
            transparent
            opacity={lightTheme ? 0.06 : 0.025}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}