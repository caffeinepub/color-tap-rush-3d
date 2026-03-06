import { useGameStore } from "./useGameStore";

export function GameHUD() {
  const { gameState, score, highScore, toggleMute, isMuted, coins } =
    useGameStore();

  if (gameState !== "playing") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "12px 16px",
        paddingTop: "calc(12px + env(safe-area-inset-top))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        pointerEvents: "none",
        background:
          "linear-gradient(to bottom, rgba(5,5,16,0.8) 0%, transparent 100%)",
      }}
    >
      {/* Mute button */}
      <button
        type="button"
        data-ocid="hud.mute_button"
        onClick={toggleMute}
        style={{
          pointerEvents: "auto",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "20px",
          backdropFilter: "blur(10px)",
          flexShrink: 0,
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Score */}
      <div
        data-ocid="hud.score_display"
        style={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(36px, 10vw, 56px)",
          color: "#00FF88",
          textShadow: "0 0 10px #00FF88, 0 0 20px #00FF88, 0 0 40px #00FF88",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textAlign: "center",
          flex: 1,
        }}
      >
        {score}
      </div>

      {/* Right side: BEST + coin balance */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          flexShrink: 0,
          gap: 4,
        }}
      >
        {/* High score */}
        <div
          data-ocid="hud.highscore_display"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(12px, 3vw, 16px)",
            color: "rgba(255,255,255,0.6)",
            textAlign: "right",
            lineHeight: 1.3,
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
            }}
          >
            BEST
          </div>
          <div>{highScore}</div>
        </div>

        {/* Coin counter badge */}
        <div
          data-ocid="hud.coins_display"
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(11px, 2.5vw, 13px)",
            color: "#FFD60A",
            background: "rgba(255,214,10,0.12)",
            border: "1px solid rgba(255,214,10,0.25)",
            borderRadius: 100,
            padding: "3px 8px",
            letterSpacing: "0.02em",
            textShadow: "0 0 8px rgba(255,214,10,0.5)",
          }}
        >
          🪙 {coins}
        </div>
      </div>
    </div>
  );
}
