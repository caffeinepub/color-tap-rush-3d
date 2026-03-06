import type { ReactElement } from "react";
import { useMemo } from "react";
import * as THREE from "three";

interface PlatformProps {
  theme: number;
}

const THEME_PLATFORM_COLORS = {
  0: { base: "#0A0A1A", grid: "#1A1A4A", edge: "#2244AA" },
  1: { base: "#1A0A00", grid: "#3A1A00", edge: "#FF6600" },
  2: { base: "#0A0015", grid: "#150030", edge: "#6600FF" },
};

export function Platform({ theme }: PlatformProps) {
  const themeColors =
    THEME_PLATFORM_COLORS[theme as keyof typeof THEME_PLATFORM_COLORS] ||
    THEME_PLATFORM_COLORS[0];

  const gridLines = useMemo(() => {
    const lines: ReactElement[] = [];
    const size = 6;
    const divisions = 6;
    const step = size / divisions;

    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const z = -size / 2 + i * step;
      const points = [
        new THREE.Vector3(-size / 2, 0.16, z),
        new THREE.Vector3(size / 2, 0.16, z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(
        <lineSegments key={`h-${i}`} geometry={geo}>
          <lineBasicMaterial
            color={themeColors.grid}
            transparent
            opacity={0.6}
          />
        </lineSegments>,
      );
    }

    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = -size / 2 + i * step;
      const points = [
        new THREE.Vector3(x, 0.16, -size / 2),
        new THREE.Vector3(x, 0.16, size / 2),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(
        <lineSegments key={`v-${i}`} geometry={geo}>
          <lineBasicMaterial
            color={themeColors.grid}
            transparent
            opacity={0.6}
          />
        </lineSegments>,
      );
    }

    return lines;
  }, [themeColors]);

  return (
    <group>
      {/* Main platform */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[6, 0.3, 6]} />
        <meshStandardMaterial
          color={themeColors.base}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Edge glow strips */}
      <mesh position={[0, 0.155, 3.0]}>
        <boxGeometry args={[6, 0.02, 0.05]} />
        <meshStandardMaterial
          color={themeColors.edge}
          emissive={themeColors.edge}
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0, 0.155, -3.0]}>
        <boxGeometry args={[6, 0.02, 0.05]} />
        <meshStandardMaterial
          color={themeColors.edge}
          emissive={themeColors.edge}
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[3.0, 0.155, 0]}>
        <boxGeometry args={[0.05, 0.02, 6]} />
        <meshStandardMaterial
          color={themeColors.edge}
          emissive={themeColors.edge}
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[-3.0, 0.155, 0]}>
        <boxGeometry args={[0.05, 0.02, 6]} />
        <meshStandardMaterial
          color={themeColors.edge}
          emissive={themeColors.edge}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Grid lines */}
      {gridLines}
    </group>
  );
}
