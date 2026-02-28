/**
 * なつき度（友好度）システム (#177)
 * モンスターとの絆を数値化。バトルボーナスやなつき進化に影響。
 */
import type { MonsterInstance } from "@/types";

/** なつき度の範囲 */
export const MIN_FRIENDSHIP = 0;
export const MAX_FRIENDSHIP = 255;

/** デフォルト初期なつき度 */
export const BASE_FRIENDSHIP = 70;

/** なつき進化に必要な最低なつき度 */
export const FRIENDSHIP_EVOLUTION_THRESHOLD = 220;

/** バトルボーナスが発動するなつき度 */
export const FRIENDSHIP_BONUS_THRESHOLD = 220;

/** なつき度の段階 */
export type FriendshipLevel = "low" | "normal" | "high" | "max";

/**
 * なつき度から段階を返す
 */
export function getFriendshipLevel(friendship: number): FriendshipLevel {
  if (friendship >= 255) return "max";
  if (friendship >= 150) return "high";
  if (friendship >= 50) return "normal";
  return "low";
}

/**
 * なつき度を安全にクランプする
 */
function clamp(value: number): number {
  return Math.max(MIN_FRIENDSHIP, Math.min(MAX_FRIENDSHIP, value));
}

/**
 * モンスターの現在のなつき度を取得
 */
export function getFriendship(monster: MonsterInstance): number {
  return monster.friendship ?? BASE_FRIENDSHIP;
}

// ── なつき度変動イベント ──

/** なつき度変動イベントの種別 */
export type FriendshipEvent =
  | "level_up"
  | "battle_victory"
  | "healing"
  | "item_use"
  | "faint"
  | "bitter_medicine";

/** イベントごとの変動量 */
const FRIENDSHIP_DELTAS: Record<FriendshipEvent, { low: number; normal: number; high: number }> = {
  level_up: { low: 5, normal: 4, high: 3 },
  battle_victory: { low: 3, normal: 2, high: 1 },
  healing: { low: 1, normal: 1, high: 1 },
  item_use: { low: 3, normal: 2, high: 1 },
  faint: { low: -1, normal: -1, high: -1 },
  bitter_medicine: { low: -3, normal: -2, high: -1 },
};

/**
 * なつき度変動を適用する
 * @returns 新しいなつき度
 */
export function applyFriendshipEvent(currentFriendship: number, event: FriendshipEvent): number {
  const level = getFriendshipLevel(currentFriendship);
  const bracket = level === "max" ? "high" : level;
  const delta = FRIENDSHIP_DELTAS[event][bracket];
  return clamp(currentFriendship + delta);
}

/**
 * なつき度変動を MonsterInstance に適用した新しいインスタンスを返す
 */
export function applyFriendshipEventToMonster(
  monster: MonsterInstance,
  event: FriendshipEvent,
): MonsterInstance {
  const current = getFriendship(monster);
  const newFriendship = applyFriendshipEvent(current, event);
  return { ...monster, friendship: newFriendship };
}

// ── バトルボーナス ──

/**
 * なつき度によるバトルボーナスの有無
 */
export function hasFriendshipBonus(friendship: number): boolean {
  return friendship >= FRIENDSHIP_BONUS_THRESHOLD;
}

/**
 * なつき度による急所率ボーナス段階
 * 220以上で+1段階
 */
export function getFriendshipCritBonus(friendship: number): number {
  return friendship >= FRIENDSHIP_BONUS_THRESHOLD ? 1 : 0;
}

/**
 * なつき度による状態異常自然回復確率
 * 255で毎ターン10%
 */
export function getFriendshipStatusRecoveryChance(friendship: number): number {
  if (friendship >= MAX_FRIENDSHIP) return 0.1;
  return 0;
}

// ── 進化判定 ──

/**
 * なつき進化の条件を満たしているか
 */
export function canEvolveByFriendship(
  monster: MonsterInstance,
  requiredFriendship: number = FRIENDSHIP_EVOLUTION_THRESHOLD,
): boolean {
  return getFriendship(monster) >= requiredFriendship;
}

// ── 表示用 ──

/**
 * なつき度の段階に対応するテキスト
 */
export function getFriendshipDescription(friendship: number): string {
  const level = getFriendshipLevel(friendship);
  switch (level) {
    case "low":
      return "まだ警戒しているようだ。";
    case "normal":
      return "少し慣れてきたようだ。";
    case "high":
      return "とても懐いている！";
    case "max":
      return "最高の信頼関係だ！";
  }
}
