import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CUBE_COLORS, type CubeColor } from "./useGameStore";

// Theme color palettes for 3D scene
const THEME_COLORS = {
  0: {
    // Neon default
    red: { hex: "#FF2D55", emissive: "#FF0040" },
    blue: { hex: "#007AFF", emissive: "#0055FF" },
    green: { hex: "#00FF88", emissive: "#00DD66" },
    yellow: { hex: "#FFD60A", emissive: "#FFBB00" },
  },
  1: {
    // Cyberpunk
    red: { hex: "#FF6B00", emissive: "#FF4400" },
    blue: { hex: "#FF00FF", emissive: "#CC00CC" },
    green: { hex: "#00FFFF", emissive: "#00CCCC" },
    yellow: { hex: "#FF9900", emissive: "#FF6600" },
  },
  2: {
    // Galaxy
    red: { hex: "#9B30FF", emissive: "#7700FF" },
    blue: { hex: "#3060FF", emissive: "#1040FF" },
    green: { hex: "#00AAFF", emissive: "#0077FF" },
    yellow: { hex: "#FF30AA", emissive: "#FF0088" },
  },
};

interface FallingCubeProps {
  color: CubeColor;
  speed: number;
  skin: number;
  theme: number;
  onMissed: () => void;
  onReachBottom?: () => void;
}

export function FallingCube({
  color,
  speed,
  skin,
  theme,
  onMissed,
}: FallingCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);
  const startTime = useRef(0);
  const hasMissed = useRef(false);
  const startY = 14;
  const endY = 1;

  const { xPos, zPos } = useMemo(
    () => ({
      xPos: (Math.random() - 0.5) * 3,
      zPos: (Math.random() - 0.5) * 1,
    }),
    [],
  );

  const themeColors =
    THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS[0];
  const colorData = themeColors[color] || CUBE_COLORS[color];

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    if (startTime.current === 0) {
      startTime.current = clock.elapsedTime;
    }

    const elapsed = clock.elapsedTime - startTime.current;
    const progress = Math.min(elapsed / speed, 1);

    // Ease-in for more satisfying fall
    const easedProgress = progress * progress;
    const currentY = startY - (startY - endY) * easedProgress;

    meshRef.current.position.y = currentY;
    meshRef.current.position.x = xPos;
    meshRef.current.position.z = zPos;

    // Slow rotation for visual interest
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.015;
    meshRef.current.rotation.z += 0.008;

    if (wireRef.current) {
      wireRef.current.position.copy(meshRef.current.position);
      wireRef.current.rotation.copy(meshRef.current.rotation);
    }

    // Check if reached platform
    if (currentY <= endY + 0.1 && !hasMissed.current) {
      hasMissed.current = true;
      onMissed();
    }
  });

  // Wireframe geometry
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1.2, 1.2, 1.2), []);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);

  useEffect(() => {
    return () => {
      boxGeo.dispose();
      edgesGeo.dispose();
    };
  }, [boxGeo, edgesGeo]);

  const initialPos: [number, number, number] = [xPos, startY, zPos];

  if (skin === 2) {
    // Wireframe only
    return (
      <lineSegments ref={wireRef} position={initialPos}>
        <primitive object={edgesGeo} attach="geometry" />
        <lineBasicMaterial color={colorData.hex} linewidth={2} />
      </lineSegments>
    );
  }

  if (skin === 1) {
    // Crystal — transparent + wireframe overlay
    return (
      <>
        <mesh ref={meshRef} position={initialPos}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial
            color={colorData.hex}
            emissive={colorData.emissive}
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
            metalness={0.9}
            roughness={0.0}
            envMapIntensity={1}
          />
        </mesh>
        <lineSegments ref={wireRef} position={initialPos}>
          <primitive object={edgesGeo} attach="geometry" />
          <lineBasicMaterial color={colorData.hex} linewidth={2} />
        </lineSegments>
      </>
    );
  }

  // Normal skin
  return (
    <mesh ref={meshRef} position={initialPos} castShadow>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial
        color={colorData.hex}
        emissive={colorData.emissive}
        emissiveIntensity={1.5}
        metalness={0.3}
        roughness={0.2}
      />
    </mesh>
  );
}
