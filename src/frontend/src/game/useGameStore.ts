import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CubeColor = "red" | "blue" | "green" | "yellow";

export const CUBE_COLORS: Record<
  CubeColor,
  { hex: string; emissive: string; label: string }
> = {
  red: { hex: "#FF2D55", emissive: "#FF0040", label: "RED" },
  blue: { hex: "#007AFF", emissive: "#0055FF", label: "BLUE" },
  green: { hex: "#00FF88", emissive: "#00DD66", label: "GREEN" },
  yellow: { hex: "#FFD60A", emissive: "#FFBB00", label: "YELLOW" },
};

export type GameState = "menu" | "playing" | "gameover";

export interface Store {
  gameState: GameState;
  score: number;
  highScore: number;
  speed: number;
  currentColor: CubeColor | null;
  coins: number;
  activeTheme: number;
  activeSkin: number;
  isMuted: boolean;
  showLeaderboard: boolean;
  showShop: boolean;
  showDailyReward: boolean;
  playerName: string;
  cubeKey: number;
  isWrongTap: boolean;
  lastDailyClaim: number;
  unlockedThemes: number[];
  unlockedSkins: number[];

  // Actions
  startGame: () => void;
  restartGame: () => void;
  goToMenu: () => void;
  setGameOver: () => void;
  handleTap: (color: CubeColor) => boolean;
  spawnNextCube: () => void;
  setCurrentColor: (color: CubeColor) => void;
  incrementScore: () => void;
  setHighScore: (score: number) => void;
  toggleMute: () => void;
  setShowLeaderboard: (show: boolean) => void;
  setShowShop: (show: boolean) => void;
  setShowDailyReward: (show: boolean) => void;
  setPlayerName: (name: string) => void;
  addCoins: (amount: number) => void;
  setActiveTheme: (theme: number) => void;
  setActiveSkin: (skin: number) => void;
  unlockTheme: (themeId: number) => void;
  unlockSkin: (skinId: number) => void;
  setLastDailyClaim: (ts: number) => void;
  clearWrongTap: () => void;
}

const pickRandomColor = (): CubeColor => {
  const colors: CubeColor[] = ["red", "blue", "green", "yellow"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const computeSpeed = (score: number): number => {
  return Math.max(0.6, 3.0 - Math.floor(score / 10) * 0.15);
};

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      gameState: "menu",
      score: 0,
      highScore: 0,
      speed: 3.0,
      currentColor: null,
      coins: 0,
      activeTheme: 0,
      activeSkin: 0,
      isMuted: false,
      showLeaderboard: false,
      showShop: false,
      showDailyReward: false,
      playerName: "",
      cubeKey: 0,
      isWrongTap: false,
      lastDailyClaim: 0,
      unlockedThemes: [0],
      unlockedSkins: [0],

      startGame: () => {
        const color = pickRandomColor();
        set({
          gameState: "playing",
          score: 0,
          speed: 3.0,
          currentColor: color,
          cubeKey: 1,
          isWrongTap: false,
        });
      },

      restartGame: () => {
        const color = pickRandomColor();
        set((state) => ({
          gameState: "playing",
          score: 0,
          speed: 3.0,
          currentColor: color,
          cubeKey: state.cubeKey + 1,
          isWrongTap: false,
        }));
      },

      goToMenu: () => {
        set({ gameState: "menu", currentColor: null });
      },

      setGameOver: () => {
        const { score, highScore } = get();
        const newHighScore = score > highScore ? score : highScore;
        set({ gameState: "gameover", highScore: newHighScore });
      },

      handleTap: (color: CubeColor) => {
        const { currentColor, score, gameState } = get();
        if (gameState !== "playing" || currentColor === null) return false;

        if (color === currentColor) {
          const newScore = score + 1;
          const newSpeed = computeSpeed(newScore);
          const nextColor = pickRandomColor();
          set((state) => ({
            score: newScore,
            speed: newSpeed,
            currentColor: nextColor,
            cubeKey: state.cubeKey + 1,
            highScore: newScore > state.highScore ? newScore : state.highScore,
          }));
          return true;
        }
        // Wrong tap
        set({ isWrongTap: true });
        const { highScore } = get();
        const newHighScore = score > highScore ? score : highScore;
        set({ gameState: "gameover", highScore: newHighScore });
        return false;
      },

      spawnNextCube: () => {
        const color = pickRandomColor();
        set((state) => ({
          currentColor: color,
          cubeKey: state.cubeKey + 1,
        }));
      },

      setCurrentColor: (color: CubeColor) => {
        set({ currentColor: color });
      },

      incrementScore: () => {
        const { score } = get();
        const newScore = score + 1;
        const newSpeed = computeSpeed(newScore);
        set((state) => ({
          score: newScore,
          speed: newSpeed,
          highScore: newScore > state.highScore ? newScore : state.highScore,
        }));
      },

      setHighScore: (score: number) => {
        set({ highScore: score });
      },

      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }));
      },

      setShowLeaderboard: (show: boolean) => set({ showLeaderboard: show }),
      setShowShop: (show: boolean) => set({ showShop: show }),
      setShowDailyReward: (show: boolean) => set({ showDailyReward: show }),

      setPlayerName: (name: string) => set({ playerName: name }),

      addCoins: (amount: number) => {
        set((state) => ({ coins: state.coins + amount }));
      },

      setActiveTheme: (theme: number) => set({ activeTheme: theme }),
      setActiveSkin: (skin: number) => set({ activeSkin: skin }),

      unlockTheme: (themeId: number) => {
        set((state) => ({
          unlockedThemes: state.unlockedThemes.includes(themeId)
            ? state.unlockedThemes
            : [...state.unlockedThemes, themeId],
        }));
      },

      unlockSkin: (skinId: number) => {
        set((state) => ({
          unlockedSkins: state.unlockedSkins.includes(skinId)
            ? state.unlockedSkins
            : [...state.unlockedSkins, skinId],
        }));
      },

      setLastDailyClaim: (ts: number) => set({ lastDailyClaim: ts }),

      clearWrongTap: () => set({ isWrongTap: false }),
    }),
    {
      name: "color-tap-rush-storage",
      partialize: (state) => ({
        highScore: state.highScore,
        coins: state.coins,
        activeTheme: state.activeTheme,
        activeSkin: state.activeSkin,
        isMuted: state.isMuted,
        playerName: state.playerName,
        lastDailyClaim: state.lastDailyClaim,
        unlockedThemes: state.unlockedThemes,
        unlockedSkins: state.unlockedSkins,
      }),
    },
  ),
);
