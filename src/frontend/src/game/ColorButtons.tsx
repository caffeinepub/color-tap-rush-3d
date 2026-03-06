import { useCallback } from "react";
import { type CubeColor, useGameStore } from "./useGameStore";
import { useSounds } from "./useSounds";

const BUTTONS: {
  color: CubeColor;
  label: string;
  className: string;
  ocid: string;
}[] = [
  {
    color: "red",
    label: "RED",
    className: "game-btn-red",
    ocid: "game.red_button",
  },
  {
    color: "blue",
    label: "BLUE",
    className: "game-btn-blue",
    ocid: "game.blue_button",
  },
  {
    color: "green",
    label: "GREEN",
    className: "game-btn-green",
    ocid: "game.green_button",
  },
  {
    color: "yellow",
    label: "YELLOW",
    className: "game-btn-yellow",
    ocid: "game.yellow_button",
  },
];

export function ColorButtons() {
  const { handleTap, gameState } = useGameStore();
  const { playTapSound, playCorrectSound, playErrorSound, vibrate } =
    useSounds();

  const onTap = useCallback(
    (color: CubeColor) => {
      if (gameState !== "playing") return;
      playTapSound();
      const correct = handleTap(color);
      if (correct) {
        playCorrectSound();
      } else {
        playErrorSound();
        vibrate([150, 50, 150]);
      }
    },
    [
      gameState,
      handleTap,
      playTapSound,
      playCorrectSound,
      playErrorSound,
      vibrate,
    ],
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "8px",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "8px",
        height: "220px",
        zIndex: 20,
        pointerEvents: gameState === "playing" ? "auto" : "none",
        opacity: gameState === "playing" ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {BUTTONS.map(({ color, label, className, ocid }) => (
        <button
          key={color}
          type="button"
          data-ocid={ocid}
          className={className}
          onPointerDown={(e) => {
            e.preventDefault();
            onTap(color);
          }}
          style={{
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(16px, 4vw, 22px)",
            letterSpacing: "0.1em",
            color:
              color === "green" || color === "yellow" ? "#0A0A1A" : "#FFFFFF",
            transition: "transform 0.1s ease, filter 0.1s ease",
            WebkitTransform: "translateZ(0)",
            transform: "translateZ(0)",
            userSelect: "none",
            WebkitUserSelect: "none",
            minHeight: "80px",
          }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            el.style.transform = "scale(0.95) translateZ(0)";
            el.style.filter = "brightness(0.85)";
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget;
            el.style.transform = "translateZ(0)";
            el.style.filter = "";
          }}
          onTouchStart={(e) => {
            const el = e.currentTarget;
            el.style.transform = "scale(0.95) translateZ(0)";
            el.style.filter = "brightness(0.85)";
          }}
          onTouchEnd={(e) => {
            const el = e.currentTarget;
            el.style.transform = "translateZ(0)";
            el.style.filter = "";
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
