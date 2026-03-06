import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGameStore } from "../useGameStore";

export function MainMenu() {
  const {
    gameState,
    highScore,
    startGame,
    setShowLeaderboard,
    setShowShop,
    setShowDailyReward,
  } = useGameStore();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (gameState !== "menu") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(0,255,136,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(191,90,242,0.08) 0%, transparent 50%)",
        padding: "20px",
        paddingTop: "calc(20px + env(safe-area-inset-top))",
        paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
      }}
    >
      {/* Decorative scanlines */}
      <div
        className="scanline"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 8vw, 52px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#00FF88",
            textShadow:
              "0 0 10px #00FF88, 0 0 20px #00FF88, 0 0 60px #00FF88, 0 0 100px #00DD66",
            marginBottom: 4,
          }}
        >
          COLOR TAP
        </div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 8vw, 52px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#BF5AF2",
            textShadow: "0 0 10px #BF5AF2, 0 0 20px #BF5AF2, 0 0 60px #BF5AF2",
            marginBottom: 8,
          }}
        >
          RUSH 3D
        </div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 400,
            fontSize: "clamp(12px, 3vw, 15px)",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          Tap the matching color
        </div>
      </div>

      {/* High Score */}
      {highScore > 0 && (
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "10px 28px",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.2em",
              marginBottom: 2,
            }}
          >
            BEST SCORE
          </div>
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 6vw, 36px)",
              color: "#FFD60A",
              textShadow: "0 0 10px #FFD60A, 0 0 20px #FFD60A",
            }}
          >
            {highScore}
          </div>
        </div>
      )}

      {/* Play Button */}
      <button
        type="button"
        data-ocid="menu.play_button"
        onClick={startGame}
        style={{
          fontFamily: "Outfit, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(20px, 5vw, 26px)",
          letterSpacing: "0.15em",
          color: "#0A0A1A",
          background: "linear-gradient(135deg, #00FF88, #00CC66)",
          boxShadow:
            "0 0 30px rgba(0,255,136,0.7), 0 0 60px rgba(0,255,136,0.3), 0 8px 32px rgba(0,255,136,0.4)",
          border: "none",
          borderRadius: 20,
          padding: "18px 60px",
          cursor: "pointer",
          marginBottom: 20,
          width: "100%",
          maxWidth: 320,
          transition: "transform 0.1s ease, filter 0.1s ease",
          touchAction: "manipulation",
        }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            "scale(0.97)";
        }}
        onPointerUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
        }}
      >
        ▶ PLAY
      </button>

      {/* Secondary buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          width: "100%",
          maxWidth: 320,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          data-ocid="menu.leaderboard_button"
          onClick={() => setShowLeaderboard(true)}
          style={secondaryBtnStyle}
        >
          <span style={{ fontSize: 20 }}>🏆</span>
          <span>Ranks</span>
        </button>
        <button
          type="button"
          data-ocid="menu.shop_button"
          onClick={() => setShowShop(true)}
          style={secondaryBtnStyle}
        >
          <span style={{ fontSize: 20 }}>🛍️</span>
          <span>Shop</span>
        </button>
        <button
          type="button"
          data-ocid="menu.daily_reward_button"
          onClick={() => setShowDailyReward(true)}
          style={secondaryBtnStyle}
        >
          <span style={{ fontSize: 20 }}>🎁</span>
          <span>Daily</span>
        </button>
      </div>

      {/* Login prompt */}
      {!isAuthenticated && (
        <button
          type="button"
          onClick={login}
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 500,
            fontSize: "clamp(12px, 3vw, 14px)",
            color: "rgba(191,90,242,0.8)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            marginTop: 8,
            padding: "8px 16px",
          }}
        >
          Login to save scores & earn rewards
        </button>
      )}

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(16px + env(safe-area-inset-bottom))",
          fontFamily: "Outfit, sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(191,90,242,0.5)", textDecoration: "none" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}

const secondaryBtnStyle: React.CSSProperties = {
  fontFamily: "Outfit, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(10px, 2.5vw, 13px)",
  letterSpacing: "0.05em",
  color: "rgba(255,255,255,0.85)",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: "14px 8px 12px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  touchAction: "manipulation",
  transition: "background 0.15s ease",
};
