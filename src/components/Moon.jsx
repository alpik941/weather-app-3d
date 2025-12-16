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
  texturePath = "/textures/moon/Moon.jpg",
  bumpPath = "/textures/moon/moon_bump.jpg",
  specularPath = "/textures/moon/moon_specular.jpg"
}) {
  const moonRef = useRef();
  const [maps, setMaps] = useState({ color: null, bump: null, specular: null });

  // Segment resolution based on quality
  const segments = quality === 'low' ? 48 : quality === 'medium' ? 64 : 96;

  useEffect(() => {
    let mounted = true;
    const loader = new THREE.TextureLoader();

    const safeLoad = (url, onSuccess) => {
      loader.load(
        url,
        (tex) => { if (mounted) onSuccess(tex); },
        undefined,
        () => { /* silent fail, keep null */ }
      );
    };

    safeLoad(texturePath, (color) => setMaps(prev => ({ ...prev, color })));
    safeLoad(bumpPath, (bump) => setMaps(prev => ({ ...prev, bump })));
    safeLoad(specularPath, (specular) => setMaps(prev => ({ ...prev, specular })));

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
    bumpScale: maps.bump ? 0.08 : 0,
    roughness: 0.9,
    metalness: 0.1,
    emissive: "#2a2a2a",
    emissiveIntensity: 0.12,
  }), [maps]);

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
            color="white"
            transparent
            opacity={0.04}
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
            color="#4a5a7a"
            transparent
            opacity={0.025}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}