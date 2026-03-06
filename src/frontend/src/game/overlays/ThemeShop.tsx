import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGameStore } from "../useGameStore";

interface ShopItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon: string;
  preview: string;
}

const THEMES: ShopItem[] = [
  {
    id: 0,
    name: "Neon",
    description: "Classic neon palette",
    cost: 0,
    icon: "💚",
    preview: "linear-gradient(135deg, #00FF88, #007AFF)",
  },
  {
    id: 1,
    name: "Cyberpunk",
    description: "Orange & magenta",
    cost: 100,
    icon: "🔶",
    preview: "linear-gradient(135deg, #FF6B00, #FF00FF)",
  },
  {
    id: 2,
    name: "Galaxy",
    description: "Deep space purple",
    cost: 200,
    icon: "🌌",
    preview: "linear-gradient(135deg, #9B30FF, #3060FF)",
  },
];

const SKINS: ShopItem[] = [
  {
    id: 0,
    name: "Standard",
    description: "Solid neon cube",
    cost: 0,
    icon: "🟦",
    preview: "linear-gradient(135deg, #007AFF, #0055FF)",
  },
  {
    id: 1,
    name: "Crystal",
    description: "Transparent + wireframe",
    cost: 150,
    icon: "💎",
    preview:
      "linear-gradient(135deg, rgba(0,255,255,0.3), rgba(255,255,255,0.1))",
  },
  {
    id: 2,
    name: "Wireframe",
    description: "Edge lines only",
    cost: 80,
    icon: "🔲",
    preview: "linear-gradient(135deg, #333366, #111133)",
  },
];

export function ThemeShop() {
  const {
    showShop,
    setShowShop,
    coins,
    activeTheme,
    activeSkin,
    unlockedThemes,
    unlockedSkins,
    setActiveTheme,
    setActiveSkin,
    addCoins,
    unlockTheme,
    unlockSkin,
  } = useGameStore();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity;

  const [activeTab, setActiveTab] = useState<"themes" | "skins">("themes");
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleUnlockTheme = async (item: ShopItem) => {
    if (coins < item.cost) {
      setError("Not enough coins!");
      setTimeout(() => setError(""), 2000);
      return;
    }
    setPurchasing(item.id);
    try {
      if (isAuthenticated && actor) {
        await actor.unlockTheme(BigInt(item.id));
      }
      addCoins(-item.cost);
      unlockTheme(item.id);
    } catch (_) {
      setError("Purchase failed. Try again.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleUnlockSkin = async (item: ShopItem) => {
    if (coins < item.cost) {
      setError("Not enough coins!");
      setTimeout(() => setError(""), 2000);
      return;
    }
    setPurchasing(item.id + 100);
    try {
      if (isAuthenticated && actor) {
        await actor.unlockSkin(BigInt(item.id));
      }
      addCoins(-item.cost);
      unlockSkin(item.id);
    } catch (_) {
      setError("Purchase failed. Try again.");
    } finally {
      setPurchasing(null);
    }
  };

  if (!showShop) return null;

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
      onClick={(e) => e.target === e.currentTarget && setShowShop(false)}
    >
      <div
        data-ocid="shop.dialog"
        className="glass"
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "28px 28px 0 0",
          padding: "0 0 calc(20px + env(safe-area-inset-bottom)) 0",
          maxHeight: "90vh",
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
                color: "#BF5AF2",
                textShadow: "0 0 10px rgba(191,90,242,0.5)",
              }}
            >
              🛍️ Theme Shop
            </div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
                color: "#FFD60A",
                marginTop: 2,
              }}
            >
              🪙 {coins} coins
            </div>
          </div>
          <button
            type="button"
            data-ocid="shop.close_button"
            onClick={() => setShowShop(false)}
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

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            padding: "12px 16px 0",
            gap: 8,
          }}
        >
          {(["themes", "skins"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              data-ocid={`shop.${tab}.tab`}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.05em",
                textTransform: "capitalize",
                color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.4)",
                background:
                  activeTab === tab
                    ? "rgba(191,90,242,0.25)"
                    : "rgba(255,255,255,0.05)",
                border:
                  activeTab === tab
                    ? "1px solid rgba(191,90,242,0.5)"
                    : "1px solid transparent",
                borderRadius: 12,
                padding: "10px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab === "themes" ? "🎨 Themes" : "🧊 Skins"}
            </button>
          ))}
        </div>

        {error && (
          <div
            data-ocid="shop.error_state"
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "#FF2D55",
              textAlign: "center",
              padding: "8px",
            }}
          >
            {error}
          </div>
        )}

        {/* Items */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {activeTab === "themes" &&
            THEMES.map((item, index) => {
              const isUnlocked = unlockedThemes.includes(item.id);
              const isActive = activeTheme === item.id;
              const isPurchasing = purchasing === item.id;

              return (
                <div
                  key={item.id}
                  data-ocid={`shop.theme_item.${index + 1}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: 18,
                    background: isActive
                      ? "rgba(191,90,242,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: isActive
                      ? "1px solid rgba(191,90,242,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    gap: 14,
                  }}
                >
                  {/* Preview */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: item.preview,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: isActive ? "#BF5AF2" : "rgba(255,255,255,0.9)",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {item.description}
                    </div>
                  </div>

                  {/* Action */}
                  {isActive ? (
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#BF5AF2",
                        background: "rgba(191,90,242,0.15)",
                        border: "1px solid rgba(191,90,242,0.3)",
                        borderRadius: 10,
                        padding: "6px 12px",
                      }}
                    >
                      Active
                    </div>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => setActiveTheme(item.id)}
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#fff",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Use
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleUnlockTheme(item)}
                      disabled={isPurchasing || coins < item.cost}
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color:
                          coins >= item.cost
                            ? "#0A0A1A"
                            : "rgba(255,255,255,0.4)",
                        background:
                          coins >= item.cost
                            ? "linear-gradient(135deg, #FFD60A, #FF9500)"
                            : "rgba(255,255,255,0.05)",
                        border: "none",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: coins >= item.cost ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        opacity: isPurchasing ? 0.7 : 1,
                      }}
                    >
                      {coins < item.cost ? "🔒" : "🪙"} {item.cost}
                    </button>
                  )}
                </div>
              );
            })}

          {activeTab === "skins" &&
            SKINS.map((item, index) => {
              const isUnlocked = unlockedSkins.includes(item.id);
              const isActive = activeSkin === item.id;
              const isPurchasing = purchasing === item.id + 100;

              return (
                <div
                  key={item.id}
                  data-ocid={`shop.skin_item.${index + 1}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: 18,
                    background: isActive
                      ? "rgba(0,255,136,0.08)"
                      : "rgba(255,255,255,0.04)",
                    border: isActive
                      ? "1px solid rgba(0,255,136,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                    gap: 14,
                  }}
                >
                  {/* Preview */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: item.preview,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      border:
                        item.id === 1
                          ? "1px solid rgba(0,255,255,0.3)"
                          : "none",
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                        color: isActive ? "#00FF88" : "rgba(255,255,255,0.9)",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {item.description}
                    </div>
                  </div>

                  {/* Action */}
                  {isActive ? (
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#00FF88",
                        background: "rgba(0,255,136,0.1)",
                        border: "1px solid rgba(0,255,136,0.2)",
                        borderRadius: 10,
                        padding: "6px 12px",
                      }}
                    >
                      Active
                    </div>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => setActiveSkin(item.id)}
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: "#fff",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      Use
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleUnlockSkin(item)}
                      disabled={isPurchasing || coins < item.cost}
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color:
                          coins >= item.cost
                            ? "#0A0A1A"
                            : "rgba(255,255,255,0.4)",
                        background:
                          coins >= item.cost
                            ? "linear-gradient(135deg, #FFD60A, #FF9500)"
                            : "rgba(255,255,255,0.05)",
                        border: "none",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: coins >= item.cost ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        opacity: isPurchasing ? 0.7 : 1,
                      }}
                    >
                      {coins < item.cost ? "🔒" : "🪙"} {item.cost}
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
