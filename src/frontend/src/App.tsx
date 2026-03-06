import { useEffect } from "react";
import { ColorButtons } from "./game/ColorButtons";
import { GameHUD } from "./game/GameHUD";
import { GameScene } from "./game/GameScene";
import { DailyRewardModal } from "./game/overlays/DailyRewardModal";
import { GameOverScreen } from "./game/overlays/GameOverScreen";
import { LeaderboardModal } from "./game/overlays/LeaderboardModal";
import { MainMenu } from "./game/overlays/MainMenu";
import { ThemeShop } from "./game/overlays/ThemeShop";
import { useGameStore } from "./game/useGameStore";
import { useSounds } from "./game/useSounds";

function SoundManager() {
  // This component just initializes the sound system
  useSounds();
  return null;
}

export default function App() {
  const { gameState } = useGameStore();

  // Prevent default touch behaviors that would interfere with gameplay
  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      // Only block touchmove (scrolling/pinching) — never block touchstart so buttons remain tappable
      e.preventDefault();
    };
    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });
    return () => {
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, []);

  // Set meta theme color for mobile browsers
  useEffect(() => {
    const meta = document.querySelector(
      'meta[name="theme-color"]',
    ) as HTMLMetaElement | null;
    if (meta) {
      meta.content = "#050510";
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "theme-color";
      newMeta.content = "#050510";
      document.head.appendChild(newMeta);
    }

    // Set page title
    document.title = "Color Tap Rush 3D";
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#050510",
      }}
    >
      {/* 3D Game Canvas — always rendered for seamless transitions */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          // Leave space for color buttons at bottom when playing
          bottom: gameState === "playing" ? "220px" : 0,
          transition: "bottom 0.3s ease",
        }}
      >
        <GameScene />
      </div>

      {/* Sound manager */}
      <SoundManager />

      {/* Game HUD (score, highscore, mute) */}
      <GameHUD />

      {/* Color tap buttons */}
      <ColorButtons />

      {/* Overlays */}
      <MainMenu />
      <GameOverScreen />
      <LeaderboardModal />
      <DailyRewardModal />
      <ThemeShop />
    </div>
  );
}
