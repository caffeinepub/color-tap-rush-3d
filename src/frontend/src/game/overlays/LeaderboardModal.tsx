import { useEffect, useState } from "react";
import type { ScoreEntry } from "../../backend.d";
import { useActor } from "../../hooks/useActor";
import { useGameStore } from "../useGameStore";

export function LeaderboardModal() {
  const { showLeaderboard, setShowLeaderboard, playerName } = useGameStore();
  const { actor, isFetching } = useActor();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showLeaderboard || !actor) return;
    setLoading(true);
    setError("");
    actor
      .getTopScores()
      .then((result) => {
        setScores(result);
      })
      .catch(() => setError("Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, [showLeaderboard, actor]);

  if (!showLeaderboard) return null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
        background: "rgba(5,5,16,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && setShowLeaderboard(false)}
    >
      <div
        data-ocid="leaderboard.dialog"
        className="glass"
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "28px 28px 0 0",
          padding: "0 0 calc(24px + env(safe-area-inset-bottom)) 0",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "#FFD60A",
                textShadow: "0 0 10px rgba(255,214,10,0.5)",
              }}
            >
              🏆 Leaderboard
            </div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                marginTop: 2,
              }}
            >
              Top players worldwide
            </div>
          </div>
          <button
            type="button"
            data-ocid="leaderboard.close_button"
            onClick={() => setShowLeaderboard(false)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.7)",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          data-ocid="leaderboard.list"
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "12px 16px",
          }}
        >
          {(loading || isFetching) && (
            <div
              data-ocid="leaderboard.loading_state"
              style={{
                textAlign: "center",
                padding: "40px 0",
                fontFamily: "Outfit, sans-serif",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
              Loading...
            </div>
          )}

          {error && (
            <div
              data-ocid="leaderboard.error_state"
              style={{
                textAlign: "center",
                padding: "40px 0",
                fontFamily: "Outfit, sans-serif",
                color: "#FF2D55",
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && scores.length === 0 && (
            <div
              data-ocid="leaderboard.empty_state"
              style={{
                textAlign: "center",
                padding: "40px 0",
                fontFamily: "Outfit, sans-serif",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎮</div>
              No scores yet. Be the first!
            </div>
          )}

          {!loading &&
            scores.map((entry, index) => {
              const isCurrentPlayer =
                playerName && entry.playerName === playerName;
              const rank = index + 1;
              const rankEmoji =
                rank === 1
                  ? "🥇"
                  : rank === 2
                    ? "🥈"
                    : rank === 3
                      ? "🥉"
                      : `#${rank}`;

              return (
                <div
                  key={`${entry.playerName}-${index}`}
                  data-ocid={`leaderboard.item.${rank}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: 16,
                    marginBottom: 6,
                    background: isCurrentPlayer
                      ? "rgba(0,255,136,0.1)"
                      : "rgba(255,255,255,0.04)",
                    border: isCurrentPlayer
                      ? "1px solid rgba(0,255,136,0.3)"
                      : "1px solid transparent",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 800,
                      fontSize: rank <= 3 ? 22 : 16,
                      minWidth: 36,
                      textAlign: "center",
                      color:
                        rank === 1
                          ? "#FFD700"
                          : rank === 2
                            ? "#C0C0C0"
                            : rank === 3
                              ? "#CD7F32"
                              : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {rankEmoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: isCurrentPlayer
                          ? "#00FF88"
                          : "rgba(255,255,255,0.9)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entry.playerName || "Anonymous"}
                      {isCurrentPlayer && (
                        <span
                          style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}
                        >
                          (you)
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 900,
                      fontSize: 20,
                      color: "#FFD60A",
                      textShadow: "0 0 8px rgba(255,214,10,0.4)",
                    }}
                  >
                    {entry.score.toString()}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
