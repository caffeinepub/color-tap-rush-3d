import { useEffect, useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGameStore } from "../useGameStore";

const DAILY_REWARD_AMOUNT = 50;
const CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function DailyRewardModal() {
  const {
    showDailyReward,
    setShowDailyReward,
    coins,
    addCoins,
    lastDailyClaim,
    setLastDailyClaim,
  } = useGameStore();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity;

  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [coinBurst, setCoinBurst] = useState(false);
  const [error, setError] = useState("");

  const now = Date.now();
  const canClaim = now - lastDailyClaim > CLAIM_COOLDOWN_MS;
  const nextClaimMs = lastDailyClaim + CLAIM_COOLDOWN_MS - now;
  const hoursLeft = Math.ceil(nextClaimMs / (1000 * 60 * 60));

  useEffect(() => {
    if (!showDailyReward) {
      setClaimed(false);
      setCoinBurst(false);
      setError("");
    }
  }, [showDailyReward]);

  const handleClaim = async () => {
    if (!canClaim || claiming) return;

    if (!isAuthenticated || !actor) {
      // Offline claim
      addCoins(DAILY_REWARD_AMOUNT);
      setLastDailyClaim(Date.now());
      setClaimed(true);
      setCoinBurst(true);
      setTimeout(() => setCoinBurst(false), 1000);
      return;
    }

    setClaiming(true);
    setError("");
    try {
      const earned = await actor.claimDailyReward();
      addCoins(Number(earned));
      setLastDailyClaim(Date.now());
      setClaimed(true);
      setCoinBurst(true);
      setTimeout(() => setCoinBurst(false), 1000);
    } catch (_) {
      setError("Failed to claim reward. Try again later.");
    } finally {
      setClaiming(false);
    }
  };

  if (!showDailyReward) return null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        background: "rgba(5,5,16,0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && setShowDailyReward(false)}
    >
      <div
        data-ocid="daily_reward.dialog"
        className="glass"
        style={{
          borderRadius: 28,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 340,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <button
          type="button"
          data-ocid="daily_reward.close_button"
          onClick={() => setShowDailyReward(false)}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.7)",
            fontSize: 16,
          }}
        >
          ✕
        </button>

        {/* Big coin icon with burst */}
        <div
          style={{
            fontSize: coinBurst ? 80 : 64,
            marginBottom: 16,
            transition: "font-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: coinBurst ? "drop-shadow(0 0 20px #FFD60A)" : "none",
          }}
        >
          🪙
        </div>

        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 900,
            fontSize: 24,
            color: "#FFD60A",
            textShadow: "0 0 10px rgba(255,214,10,0.6)",
            marginBottom: 4,
          }}
        >
          Daily Reward
        </div>

        {/* Coin balance */}
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 24,
          }}
        >
          Your balance:{" "}
          <span style={{ color: "#FFD60A", fontWeight: 700 }}>
            {coins} coins
          </span>
        </div>

        {/* Reward info */}
        <div
          style={{
            background: "rgba(255,214,10,0.08)",
            border: "1px solid rgba(255,214,10,0.2)",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: 36,
              color: "#FFD60A",
              textShadow: "0 0 10px rgba(255,214,10,0.5)",
            }}
          >
            +{DAILY_REWARD_AMOUNT}
          </div>
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            coins to collect today
          </div>
        </div>

        {error && (
          <div
            data-ocid="daily_reward.error_state"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "#FF2D55",
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {claimed && (
          <div
            data-ocid="daily_reward.success_state"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 14,
              color: "#00FF88",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            ✓ Claimed! Come back tomorrow.
          </div>
        )}

        {canClaim && !claimed ? (
          <button
            type="button"
            data-ocid="daily_reward.claim_button"
            onClick={handleClaim}
            disabled={claiming}
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: "0.08em",
              color: "#0A0A1A",
              background: claiming
                ? "rgba(255,214,10,0.5)"
                : "linear-gradient(135deg, #FFD60A, #FF9500)",
              boxShadow: claiming
                ? "none"
                : "0 0 20px rgba(255,214,10,0.5), 0 4px 15px rgba(255,214,10,0.3)",
              border: "none",
              borderRadius: 16,
              padding: "16px",
              cursor: claiming ? "not-allowed" : "pointer",
              width: "100%",
              touchAction: "manipulation",
              transition: "transform 0.1s ease",
            }}
          >
            {claiming ? "Claiming..." : "🎁 Claim Reward"}
          </button>
        ) : !claimed ? (
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              padding: "16px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 16,
            }}
          >
            ⏰ Next reward in {hoursLeft}h
          </div>
        ) : null}

        {!isAuthenticated && (
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              marginTop: 12,
            }}
          >
            Login to sync rewards across devices
          </div>
        )}
      </div>
    </div>
  );
}
