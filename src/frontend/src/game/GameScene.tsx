import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useRef } from "react";
import * as THREE from "three";
import { FallingCube } from "./FallingCube";
import { Platform } from "./Platform";
import { useGameStore } from "./useGameStore";
import { useSounds } from "./useSounds";

function SceneContent() {
  const {
    gameState,
    currentColor,
    speed,
    cubeKey,
    activeSkin,
    activeTheme,
    setGameOver,
  } = useGameStore();
  const { playErrorSound, vibrate } = useSounds();
  const missedRef = useRef(false);

  const handleMissed = useCallback(() => {
    if (missedRef.current) return;
    missedRef.current = true;
    playErrorSound();
    vibrate([100, 50, 100]);
    setGameOver();
    // Reset for next game
    setTimeout(() => {
      missedRef.current = false;
    }, 500);
  }, [playErrorSound, vibrate, setGameOver]);

  return (
    <>
      {/* Scene background */}
      <color attach="background" args={["#050510"]} />
      <fog attach="fog" args={["#050510", 20, 40]} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#4444ff" />
      <pointLight position={[5, 5, -5]} intensity={0.8} color="#ff00aa" />

      {/* Dynamic colored light matching cube */}
      {currentColor === "red" && (
        <pointLight
          position={[0, 8, 0]}
          intensity={3}
          color="#FF2D55"
          distance={15}
        />
      )}
      {currentColor === "blue" && (
        <pointLight
          position={[0, 8, 0]}
          intensity={3}
          color="#007AFF"
          distance={15}
        />
      )}
      {currentColor === "green" && (
        <pointLight
          position={[0, 8, 0]}
          intensity={3}
          color="#00FF88"
          distance={15}
        />
      )}
      {currentColor === "yellow" && (
        <pointLight
          position={[0, 8, 0]}
          intensity={3}
          color="#FFD60A"
          distance={15}
        />
      )}

      {/* Platform */}
      <Platform theme={activeTheme} />

      {/* Falling cube */}
      {gameState === "playing" && currentColor && (
        <FallingCube
          key={cubeKey}
          color={currentColor}
          speed={speed}
          skin={activeSkin}
          theme={activeTheme}
          onMissed={handleMissed}
        />
      )}

      {/* Decorative background stars */}
      <Stars />
    </>
  );
}

function Stars() {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 200; i++) {
    pts.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        Math.random() * 30 - 5,
        (Math.random() - 0.5) * 60,
      ),
    );
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);

  return (
    <points>
      <primitive object={geo} attach="geometry" />
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.6} />
    </points>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#111122" />
    </mesh>
  );
}

export function GameScene() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 8, 12], fov: 50 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      onCreated={({ camera }) => {
        camera.lookAt(0, 2, 0);
      }}
      shadows
    >
      <Suspense fallback={<LoadingFallback />}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
