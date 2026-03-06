import { useEffect, useRef, useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGameStore } from "../useGameStore";
import { RewardedAdModal } from "./RewardedAdModal";

export function GameOverScreen() {
  const {
    gameState,
    score,
    highScore,
    restartGame,
    setShowLeaderboard,
    playerName,
    setPlayerName,
    coinsEarnedThisRound,
    canContinue,
    setShowRewardedAd,
  } = useGameStore();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity;
  const [submitted, setSubmitted] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [showNameInput, setShowNameInput] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const scoreSubmittedRef = useRef(false);
  const coinsAwardedRef = useRef(false);
  const isNewHighScore = score > 0 && score >= highScore;

  // Auto-submit score
  useEffect(() => {
    if (gameState !== "gameover") {
      setSubmitted(false);
      scoreSubmittedRef.current = false;
      coinsAwardedRef.current = false;
      return;
    }
    if (!isAuthenticated || !actor || score === 0) return;
    if (scoreSubmittedRef.current) return;

    if (!playerName) {
      setShowNameInput(true);
      return;
    }

    scoreSubmittedRef.current = true;
    actor
      .submitScore(BigInt(score), playerName)
      .then(() => setSubmitted(true))
      .catch(console.error);
  }, [gameState, isAuthenticated, actor, score, playerName]);

  // Award coins to backend once per game over
  useEffect(() => {
    if (gameState !== "gameover") return;
    if (!isAuthenticated || !actor) return;
    if (coinsAwardedRef.current) return;
    if (coinsEarnedThisRound <= 0) return;

    coinsAwardedRef.current = true;
    actor.awardGameCoins(BigInt(coinsEarnedThisRound)).catch(console.error);
  }, [gameState, isAuthenticated, actor, coinsEarnedThisRound]);

  const handleSubmitWithName = () => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    setPlayerName(name);
    setShowNameInput(false);
    if (actor && !scoreSubmittedRef.current) {
      scoreSubmittedRef.current = true;
      actor
        .submitScore(BigInt(score), name)
        .then(() => setSubmitted(true))
        .catch(console.error);
    }
  };

  const handleShare = async () => {
    const text = `I scored ${score} on Color Tap Rush 3D! Can you beat me? 🎮🔥`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Color Tap Rush 3D", text });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      setShareMsg("Score copied to clipboard! 📋");
      setTimeout(() => setShareMsg(""), 2500);
    }
  };

  if (gameState !== "gameover") return null;

  return (
    <>
      <RewardedAdModal />
      <div
        data-ocid="gameover.dialog"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 40,
          background: "rgba(5,5,16,0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: "20px",
        }}
      >
        <div
          className="glass"
          style={{
            borderRadius: 28,
            padding: "36px 28px",
            width: "100%",
            maxWidth: 360,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,45,85,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Game Over title */}
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(28px, 8vw, 40px)",
              color: "#FF2D55",
              textShadow:
                "0 0 10px #FF2D55, 0 0 20px #FF2D55, 0 0 40px #FF0040",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            GAME OVER
          </div>

          {/* Score */}
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(56px, 15vw, 80px)",
              color: "#FFD60A",
              textShadow:
                "0 0 10px #FFD60A, 0 0 20px #FFD60A, 0 0 40px #FFAA00",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {score}
          </div>

          {/* New high score badge */}
          {isNewHighScore && (
            <div
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #FFD60A, #FF9500)",
                borderRadius: 100,
                padding: "6px 20px",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: "#0A0A1A",
                letterSpacing: "0.1em",
                marginBottom: 12,
                boxShadow: "0 0 20px rgba(255,214,10,0.5)",
              }}
            >
              ⭐ NEW HIGH SCORE!
            </div>
          )}

          {/* Coins earned this round */}
          {coinsEarnedThisRound > 0 && (
            <div
              data-ocid="gameover.coins_earned"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,214,10,0.1)",
                border: "1px solid rgba(255,214,10,0.25)",
                borderRadius: 100,
                padding: "6px 16px",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#FFD60A",
                textShadow: "0 0 8px rgba(255,214,10,0.5)",
                marginBottom: 16,
              }}
            >
              <span>+{coinsEarnedThisRound}</span>
              <span>🪙</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
                earned
              </span>
            </div>
          )}

          {/* Name input for score submission */}
          {showNameInput && isAuthenticated && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 8,
                }}
              >
                Enter your name to save score:
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  data-ocid="gameover.name_input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitWithName()}
                  placeholder="Your name"
                  maxLength={20}
                  style={{
                    flex: 1,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 15,
                    color: "#fff",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  data-ocid="gameover.save_button"
                  onClick={handleSubmitWithName}
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#0A0A1A",
                    background: "linear-gradient(135deg, #00FF88, #00CC66)",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Submitted indicator */}
          {submitted && (
            <div
              data-ocid="gameover.success_state"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
                color: "#00FF88",
                marginBottom: 12,
              }}
            >
              ✓ Score saved to leaderboard
            </div>
          )}

          {/* Share message */}
          {shareMsg && (
            <div
              data-ocid="gameover.toast"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
                color: "#BF5AF2",
                marginBottom: 12,
              }}
            >
              {shareMsg}
            </div>
          )}

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 8,
            }}
          >
            {/* Rewarded ad: Watch Ad to Continue */}
            {canContinue && (
              <button
                type="button"
                data-ocid="gameover.watch_ad_button"
                onClick={() => setShowRewardedAd(true)}
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(15px, 3.8vw, 18px)",
                  letterSpacing: "0.06em",
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, rgba(0,122,255,0.25), rgba(90,200,250,0.15))",
                  border: "1.5px solid rgba(0,122,255,0.6)",
                  boxShadow:
                    "0 0 18px rgba(0,122,255,0.3), inset 0 0 10px rgba(0,122,255,0.05)",
                  borderRadius: 16,
                  padding: "15px",
                  cursor: "pointer",
                  touchAction: "manipulation",
                  transition: "transform 0.1s ease, box-shadow 0.2s ease",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(0.97)";
                }}
                onPointerUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "";
                }}
              >
                <span style={{ fontSize: 18 }}>▶</span>
                <span>WATCH AD TO CONTINUE</span>
              </button>
            )}

            <button
              type="button"
              data-ocid="gameover.restart_button"
              onClick={restartGame}
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(16px, 4vw, 20px)",
                letterSpacing: "0.1em",
                color: "#0A0A1A",
                background: "linear-gradient(135deg, #00FF88, #00CC66)",
                boxShadow:
                  "0 0 20px rgba(0,255,136,0.5), 0 4px 15px rgba(0,255,136,0.3)",
                border: "none",
                borderRadius: 16,
                padding: "16px",
                cursor: "pointer",
                touchAction: "manipulation",
                transition: "transform 0.1s ease",
                width: "100%",
              }}
              onPointerDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(0.97)";
              }}
              onPointerUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
              }}
            >
              ↩ PLAY AGAIN
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                data-ocid="gameover.share_button"
                onClick={handleShare}
                style={{
                  flex: 1,
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(13px, 3vw, 15px)",
                  color: "#fff",
                  background: "rgba(191,90,242,0.2)",
                  border: "1px solid rgba(191,90,242,0.4)",
                  borderRadius: 14,
                  padding: "13px",
                  cursor: "pointer",
                  touchAction: "manipulation",
                }}
              >
                📤 Share
              </button>
              <button
                type="button"
                data-ocid="gameover.leaderboard_button"
                onClick={() => setShowLeaderboard(true)}
                style={{
                  flex: 1,
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(13px, 3vw, 15px)",
                  color: "#fff",
                  background: "rgba(255,214,10,0.15)",
                  border: "1px solid rgba(255,214,10,0.3)",
                  borderRadius: 14,
                  padding: "13px",
                  cursor: "pointer",
                  touchAction: "manipulation",
                }}
              >
                🏆 Ranks
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
