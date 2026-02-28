/**
 * バトルタワーシステム (#185)
 * クリア後に解放されるエンドレスバトル施設
 */
import type { MonsterSpecies } from "@/types";

/** バトルタワーのトレーナー定義 */
export interface TowerTrainer {
  name: string;
  /** 使用するモンスターのspeciesId配列 */
  team: { speciesId: string; level: number }[];
}

/** バトルタワーの進行状態 */
export interface BattleTowerState {
  /** 現在の連勝数 */
  winStreak: number;
  /** 最高連勝記録 */
  bestStreak: number;
  /** 獲得済みBP */
  battlePoints: number;
  /** 現在のラウンドのトレーナーインデックス */
  currentRound: number;
}

/** バトルタワーの報酬定義 */
export interface TowerReward {
  streak: number;
  itemId: string;
  quantity: number;
  description: string;
}

/** バトルタワーの初期状態 */
export function createBattleTowerState(): BattleTowerState {
  return {
    winStreak: 0,
    bestStreak: 0,
    battlePoints: 0,
    currentRound: 0,
  };
}

/**
 * バトル勝利後の状態更新
 */
export function recordWin(state: BattleTowerState): BattleTowerState {
  const newStreak = state.winStreak + 1;
  const bp = getBpReward(newStreak);
  return {
    winStreak: newStreak,
    bestStreak: Math.max(state.bestStreak, newStreak),
    battlePoints: state.battlePoints + bp,
    currentRound: state.currentRound + 1,
  };
}

/**
 * バトル敗北後の状態更新
 */
export function recordLoss(state: BattleTowerState): BattleTowerState {
  return {
    ...state,
    winStreak: 0,
    currentRound: 0,
  };
}

/**
 * 連勝数に応じたBP報酬
 */
export function getBpReward(winStreak: number): number {
  if (winStreak >= 50) return 10;
  if (winStreak >= 20) return 5;
  if (winStreak >= 10) return 3;
  return 1;
}

/**
 * 連勝数に応じたトレーナーレベル補正
 * 連勝が伸びるほど相手が強くなる
 */
export function getTowerLevel(winStreak: number): number {
  const base = 50;
  const bonus = Math.min(50, Math.floor(winStreak / 5) * 2);
  return base + bonus;
}

/**
 * ボス戦か判定（10連勝ごとにボス）
 */
export function isBossRound(winStreak: number): boolean {
  return winStreak > 0 && winStreak % 10 === 0;
}

/** バトルタワー報酬一覧 */
export const TOWER_REWARDS: TowerReward[] = [
  { streak: 10, itemId: "rare_candy", quantity: 1, description: "10連勝達成" },
  { streak: 20, itemId: "pp_up", quantity: 1, description: "20連勝達成" },
  { streak: 30, itemId: "rare_candy", quantity: 3, description: "30連勝達成" },
  { streak: 50, itemId: "ability_capsule", quantity: 1, description: "50連勝達成" },
  { streak: 100, itemId: "gold_trophy", quantity: 1, description: "100連勝達成" },
];

/**
 * 連勝数で獲得可能な報酬を返す
 */
export function getAvailableRewards(winStreak: number): TowerReward[] {
  return TOWER_REWARDS.filter((r) => r.streak <= winStreak);
}

/**
 * 新しい報酬のみ返す（前回チェック時からの差分）
 */
export function getNewRewards(currentStreak: number, previousStreak: number): TowerReward[] {
  return TOWER_REWARDS.filter((r) => r.streak <= currentStreak && r.streak > previousStreak);
}

/** タワートレーナー名プール */
const TRAINER_NAMES = [
  "エリートトレーナー・カズマ",
  "エリートトレーナー・ミサキ",
  "エリートトレーナー・リョウ",
  "ベテラントレーナー・ユウキ",
  "ベテラントレーナー・サクラ",
  "エースのシンジ",
  "エースのアカネ",
  "チャンピオンのタツミ",
];

/**
 * ラウンドに応じたトレーナー名を返す
 */
export function getTrainerName(round: number): string {
  if (isBossRound(round)) {
    return TRAINER_NAMES[TRAINER_NAMES.length - 1];
  }
  return TRAINER_NAMES[round % (TRAINER_NAMES.length - 1)];
}
