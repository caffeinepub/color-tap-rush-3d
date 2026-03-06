import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlayerData {
    coins: bigint;
    unlockedThemes: Array<ThemeId>;
    playerName: string;
    lastDailyClaim: bigint;
    unlockedSkins: Array<SkinId>;
}
export type Timestamp = bigint;
export type ThemeId = bigint;
export interface ScoreEntry {
    score: bigint;
    timestamp: Timestamp;
    playerName: string;
}
export type SkinId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimDailyReward(): Promise<bigint>;
    getCallerUserRole(): Promise<UserRole>;
    getPlayerData(): Promise<PlayerData>;
    getTopScores(): Promise<Array<ScoreEntry>>;
    isCallerAdmin(): Promise<boolean>;
    submitScore(score: bigint, playerName: string): Promise<void>;
    unlockSkin(skinId: SkinId): Promise<void>;
    unlockTheme(themeId: ThemeId): Promise<void>;
}
