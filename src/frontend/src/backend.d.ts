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
    unlockedBackgrounds: Array<bigint>;
    equippedBackground: bigint;
    coins: bigint;
    unlockedCubeStyles: Array<bigint>;
    equippedCubeStyle: bigint;
    playerName: string;
    lastDailyClaim: bigint;
}
export interface ScoreEntry {
    score: bigint;
    timestamp: bigint;
    playerName: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardGameCoins(coinsEarned: bigint): Promise<bigint>;
    claimDailyReward(): Promise<bigint>;
    equipBackground(bgId: bigint): Promise<void>;
    equipCubeStyle(styleId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPlayerData(): Promise<PlayerData>;
    getTopScores(): Promise<Array<ScoreEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitScore(score: bigint, playerName: string): Promise<void>;
    unlockBackground(bgId: bigint): Promise<void>;
    unlockCubeStyle(styleId: bigint): Promise<void>;
}
