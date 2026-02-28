/**
 * バトル報酬モジュール: 賞金計算・敗北ペナルティ
 */

/** トレーナー種別 */
export type TrainerClass = "normal" | "gym_leader" | "elite_four" | "champion";

/**
 * トレーナー種別ごとの賞金倍率
 */
const PRIZE_MULTIPLIER: Record<TrainerClass, number> = {
  normal: 40,
  gym_leader: 200,
  elite_four: 300,
  champion: 500,
};

/**
 * 賞金を計算
 * @param aceLevel トレーナーのエースモンスターのレベル
 * @param trainerClass トレーナー種別
 * @returns 賞金額
 */
export function calculatePrizeMoney(
  aceLevel: number,
  trainerClass: TrainerClass = "normal",
): number {
  return aceLevel * PRIZE_MULTIPLIER[trainerClass];
}

/**
 * 敗北時のペナルティ（所持金の半分を失う、最低100円は残る）
 * @param currentMoney 現在の所持金
 * @returns 失う金額
 */
export function calculateDefeatPenalty(currentMoney: number): number {
  if (currentMoney <= 100) return 0;
  const lostAmount = Math.floor(currentMoney / 2);
  // 最低100円は残す
  return Math.min(lostAmount, currentMoney - 100);
}

/**
 * バッジ数に応じたショップ品揃えティアを取得
 */
export function getShopTier(badgeCount: number): number {
  if (badgeCount >= 8) return 5;
  if (badgeCount >= 6) return 4;
  if (badgeCount >= 4) return 3;
  if (badgeCount >= 2) return 2;
  return 1;
}

/** ショップティアごとの販売アイテム */
export const SHOP_ITEMS_BY_TIER: Record<number, string[]> = {
  1: ["potion", "monster-ball"],
  2: ["potion", "super-potion", "monster-ball", "super-ball", "antidote"],
  3: ["super-potion", "hyper-potion", "super-ball", "hyper-ball", "revive"],
  4: [
    "hyper-potion",
    "full-restore",
    "hyper-ball",
    "net-ball",
    "antidote",
    "paralyze-heal",
    "burn-heal",
    "ice-heal",
    "awakening",
  ],
  5: ["full-restore", "max-potion", "hyper-ball", "ultra-ball", "revive", "max-revive"],
};

/**
 * バッジ数に応じたショップ販売アイテムを取得
 */
export function getAvailableShopItems(badgeCount: number): string[] {
  const tier = getShopTier(badgeCount);
  return SHOP_ITEMS_BY_TIER[tier] ?? SHOP_ITEMS_BY_TIER[1];
}
