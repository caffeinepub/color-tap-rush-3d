import type { ReactElement } from "react";
import { useMemo } from "react";
import * as THREE from "three";

interface PlatformProps {
  background: number;
}

const BACKGROUND_PLATFORM_COLORS = {
  0: { base: "#0A0A1A", grid: "#1A1A4A", edge: "#2244AA" }, // Deep Space
  1: { base: "#001A1A", grid: "#003333", edge: "#00FFFF" }, // Neon Grid
  2: { base: "#1A0500", grid: "#3A0A00", edge: "#FF4500" }, // Volcano
  3: { base: "#001220", grid: "#002240", edge: "#00AAFF" }, // Ocean Depths
  4: { base: "#0D0010", grid: "#200020", edge: "#FF00AA" }, // Cyber City
};

export function Platform({ background }: PlatformProps) {
  const bgColors =
    BACKGROUND_PLATFORM_COLORS[
      background as keyof typeof BACKGROUND_PLATFORM_COLORS
    ] || BACKGROUND_PLATFORM_COLORS[0];

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
          <lineBasicMaterial color={bgColors.grid} transparent opacity={0.6} />
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
          <lineBasicMaterial color={bgColors.grid} transparent opacity={0.6} />
        </lineSegments>,
      );
    }

    return lines;
  }, [bgColors]);

  return (
    <group>
      {/* Main platform */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[6, 0.3, 6]} />
        <meshStandardMaterial
          color={bgColors.base}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Edge glow strips */}
      <mesh position={[0, 0.155, 3.0]}>
        <boxGeometry args={[6, 0.02, 0.05]} />
        <meshStandardMaterial
          color={bgColors.edge}
          emissive={bgColors.edge}
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[0, 0.155, -3.0]}>
        <boxGeometry args={[6, 0.02, 0.05]} />
        <meshStandardMaterial
          color={bgColors.edge}
          emissive={bgColors.edge}
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[3.0, 0.155, 0]}>
        <boxGeometry args={[0.05, 0.02, 6]} />
        <meshStandardMaterial
          color={bgColors.edge}
          emissive={bgColors.edge}
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[-3.0, 0.155, 0]}>
        <boxGeometry args={[0.05, 0.02, 6]} />
        <meshStandardMaterial
          color={bgColors.edge}
          emissive={bgColors.edge}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Grid lines */}
      {gridLines}
    </group>
  );
}
