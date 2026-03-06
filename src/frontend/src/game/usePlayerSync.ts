import { useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGameStore } from "./useGameStore";

/**
 * Syncs player data from the backend to local Zustand state on mount.
 * Takes the max of backend/local coins to avoid losing offline progress.
 * Merges unlocked items and applies equipped selections from backend.
 */
export function usePlayerSync() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const syncedRef = useRef(false);

  const {
    coins,
    addCoins,
    unlockedCubeStyles,
    unlockedBackgrounds,
    unlockCubeStyle,
    unlockBackground,
    setActiveCubeStyle,
    setActiveBackground,
  } = useGameStore();

  useEffect(() => {
    if (!identity || !actor || isFetching) return;
    if (syncedRef.current) return;

    syncedRef.current = true;

    actor
      .getPlayerData()
      .then((data) => {
        // Take the max of backend and local coins to preserve offline progress
        const backendCoins = Number(data.coins);
        if (backendCoins > coins) {
          addCoins(backendCoins - coins);
        }

        // Merge unlocked cube styles (union of local + backend)
        for (const styleId of data.unlockedCubeStyles) {
          const id = Number(styleId);
          if (!unlockedCubeStyles.includes(id)) {
            unlockCubeStyle(id);
          }
        }

        // Merge unlocked backgrounds (union of local + backend)
        for (const bgId of data.unlockedBackgrounds) {
          const id = Number(bgId);
          if (!unlockedBackgrounds.includes(id)) {
            unlockBackground(id);
          }
        }

        // Apply equipped selections from backend
        setActiveCubeStyle(Number(data.equippedCubeStyle));
        setActiveBackground(Number(data.equippedBackground));
      })
      .catch(console.error);
  }, [
    identity,
    actor,
    isFetching,
    coins,
    addCoins,
    unlockedCubeStyles,
    unlockedBackgrounds,
    unlockCubeStyle,
    unlockBackground,
    setActiveCubeStyle,
    setActiveBackground,
  ]);
}
