import { useEffect, useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGameStore } from "../useGameStore";

interface CubePack {
  id: number;
  name: string;
  description: string;
  cost: number;
  previewColors: string[];
}

interface BackgroundPack {
  id: number;
  name: string;
  description: string;
  cost: number;
  previewGradient: string;
}

const CUBE_PACKS: CubePack[] = [
  {
    id: 0,
    name: "Default Neon",
    description: "Classic neon palette",
    cost: 0,
    previewColors: ["#FF2D55", "#007AFF", "#00FF88", "#FFD60A"],
  },
  {
    id: 1,
    name: "Pastel Pack",
    description: "Soft dreamy pastels",
    cost: 80,
    previewColors: ["#FF8FA3", "#74B9FF", "#A8E6CF", "#FFE08A"],
  },
  {
    id: 2,
    name: "Fire Pack",
    description: "Blazing warm tones",
    cost: 120,
    previewColors: ["#FF4500", "#FF6B00", "#FF8C00", "#FFD700"],
  },
  {
    id: 3,
    name: "Ice Pack",
    description: "Frosty cool hues",
    cost: 150,
    previewColors: ["#E0F7FF", "#00CFFF", "#AAFFEE", "#F0F0FF"],
  },
  {
    id: 4,
    name: "Candy Pack",
    description: "Sweet vibrant colors",
    cost: 200,
    previewColors: ["#FF69B4", "#00BFFF", "#7FFF00", "#FF7F50"],
  },
  {
    id: 5,
    name: "Dark Matter",
    description: "Deep dark hues",
    cost: 250,
    previewColors: ["#8B0000", "#00008B", "#006400", "#B8860B"],
  },
];

const BACKGROUND_PACKS: BackgroundPack[] = [
  {
    id: 0,
    name: "Deep Space",
    description: "Dark starfield default",
    cost: 0,
    previewGradient: "linear-gradient(135deg, #050510, #0A0A2A)",
  },
  {
    id: 1,
    name: "Neon Grid",
    description: "Cyan neon cyber grid",
    cost: 100,
    previewGradient: "linear-gradient(135deg, #001A1A, #003333)",
  },
  {
    id: 2,
    name: "Volcano",
    description: "Fiery lava environment",
    cost: 175,
    previewGradient: "linear-gradient(135deg, #1A0500, #3A0A00)",
  },
  {
    id: 3,
    name: "Ocean Depths",
    description: "Deep underwater world",
    cost: 225,
    previewGradient: "linear-gradient(135deg, #001220, #002240)",
  },
  {
    id: 4,
    name: "Cyber City",
    description: "Neon city at night",
    cost: 300,
    previewGradient: "linear-gradient(135deg, #0D0010, #200020)",
  },
];

type TabType = "cubes" | "backgrounds";

export function ThemeShop() {
  const {
    showShop,
    setShowShop,
    coins,
    activeCubeStyle,
    activeBackground,
    unlockedCubeStyles,
    unlockedBackgrounds,
    setActiveCubeStyle,
    setActiveBackground,
    addCoins,
    unlockCubeStyle,
    unlockBackground,
  } = useGameStore();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity;

  const [activeTab, setActiveTab] = useState<TabType>("cubes");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Sync from backend on open
  useEffect(() => {
    if (!showShop || !isAuthenticated || !actor) return;
    actor
      .getPlayerData()
      .then((data) => {
        // Sync unlocked items from backend
        for (const styleId of data.unlockedCubeStyles) {
          unlockCubeStyle(Number(styleId));
        }
        for (const bgId of data.unlockedBackgrounds) {
          unlockBackground(Number(bgId));
        }
      })
      .catch(console.error);
  }, [showShop, isAuthenticated, actor, unlockCubeStyle, unlockBackground]);

  const handleBuyCube = async (pack: CubePack) => {
    if (coins < pack.cost) {
      setError("Not enough coins!");
      setTimeout(() => setError(""), 2000);
      return;
    }
    const key = `cube-${pack.id}`;
    setPurchasing(key);
    try {
      addCoins(-pack.cost);
      unlockCubeStyle(pack.id);
      if (isAuthenticated && actor) {
        await actor.unlockCubeStyle(BigInt(pack.id));
      }
    } catch (_) {
      setError("Purchase failed. Try again.");
      // Refund on failure
      addCoins(pack.cost);
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquipCube = async (pack: CubePack) => {
    setActiveCubeStyle(pack.id);
    if (isAuthenticated && actor) {
      actor.equipCubeStyle(BigInt(pack.id)).catch(console.error);
    }
  };

  const handleBuyBackground = async (pack: BackgroundPack) => {
    if (coins < pack.cost) {
      setError("Not enough coins!");
      setTimeout(() => setError(""), 2000);
      return;
    }
    const key = `bg-${pack.id}`;
    setPurchasing(key);
    try {
      addCoins(-pack.cost);
      unlockBackground(pack.id);
      if (isAuthenticated && actor) {
        await actor.unlockBackground(BigInt(pack.id));
      }
    } catch (_) {
      setError("Purchase failed. Try again.");
      addCoins(pack.cost);
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquipBackground = async (pack: BackgroundPack) => {
    setActiveBackground(pack.id);
    if (isAuthenticated && actor) {
      actor.equipBackground(BigInt(pack.id)).catch(console.error);
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
              🛍️ Shop
            </div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
                color: "#FFD60A",
                marginTop: 2,
                fontWeight: 600,
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
          {(["cubes", "backgrounds"] as const).map((tab) => (
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
                letterSpacing: "0.04em",
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
              {tab === "cubes" ? "🎲 Cube Colors" : "🌌 Backgrounds"}
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
          {/* Cube Colors Tab */}
          {activeTab === "cubes" &&
            CUBE_PACKS.map((pack, index) => {
              const isOwned = unlockedCubeStyles.includes(pack.id);
              const isActive = activeCubeStyle === pack.id;
              const isPurchasing = purchasing === `cube-${pack.id}`;
              const canAfford = coins >= pack.cost;

              return (
                <div
                  key={pack.id}
                  data-ocid={`shop.cube_item.${index + 1}`}
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
                  {/* 2x2 Color Preview Grid */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gridTemplateRows: "1fr 1fr",
                      gap: 2,
                      padding: 4,
                      background: "rgba(0,0,0,0.3)",
                    }}
                  >
                    {pack.previewColors.map((c) => (
                      <div
                        key={c}
                        style={{
                          background: c,
                          borderRadius: 3,
                          boxShadow: `0 0 6px ${c}88`,
                        }}
                      />
                    ))}
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
                      {pack.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {pack.description}
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✓ Active
                    </div>
                  ) : isOwned ? (
                    <button
                      type="button"
                      data-ocid={`shop.cube_equip.${index + 1}`}
                      onClick={() => void handleEquipCube(pack)}
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`shop.cube_buy.${index + 1}`}
                      onClick={() => void handleBuyCube(pack)}
                      disabled={isPurchasing || !canAfford}
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: canAfford ? "#0A0A1A" : "rgba(255,255,255,0.4)",
                        background: canAfford
                          ? "linear-gradient(135deg, #FFD60A, #FF9500)"
                          : "rgba(255,255,255,0.05)",
                        border: "none",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: canAfford ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        opacity: isPurchasing ? 0.7 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {canAfford ? "🪙" : "🔒"} {pack.cost}
                    </button>
                  )}
                </div>
              );
            })}

          {/* Backgrounds Tab */}
          {activeTab === "backgrounds" &&
            BACKGROUND_PACKS.map((pack, index) => {
              const isOwned = unlockedBackgrounds.includes(pack.id);
              const isActive = activeBackground === pack.id;
              const isPurchasing = purchasing === `bg-${pack.id}`;
              const canAfford = coins >= pack.cost;

              return (
                <div
                  key={pack.id}
                  data-ocid={`shop.bg_item.${index + 1}`}
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
                  {/* Gradient Preview */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: pack.previewGradient,
                      flexShrink: 0,
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isActive
                        ? "0 0 12px rgba(0,255,136,0.3)"
                        : "none",
                    }}
                  />

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
                      {pack.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {pack.description}
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✓ Active
                    </div>
                  ) : isOwned ? (
                    <button
                      type="button"
                      data-ocid={`shop.bg_equip.${index + 1}`}
                      onClick={() => void handleEquipBackground(pack)}
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`shop.bg_buy.${index + 1}`}
                      onClick={() => void handleBuyBackground(pack)}
                      disabled={isPurchasing || !canAfford}
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        color: canAfford ? "#0A0A1A" : "rgba(255,255,255,0.4)",
                        background: canAfford
                          ? "linear-gradient(135deg, #FFD60A, #FF9500)"
                          : "rgba(255,255,255,0.05)",
                        border: "none",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: canAfford ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        opacity: isPurchasing ? 0.7 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {canAfford ? "🪙" : "🔒"} {pack.cost}
                    </button>
                  )}
                </div>
              );
            })}
        </div>

        {/* Earn hint */}
        <div
          style={{
            padding: "8px 24px 4px",
            fontFamily: "Outfit, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
          }}
        >
          Earn 🪙 1 coin per correct tap in-game
        </div>
      </div>
    </div>
  );
}
