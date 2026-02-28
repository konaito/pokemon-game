/**
 * バトル報酬システム (#196)
 * トレーナー戦の賞金計算、敗北時のペナルティ、ショップ品揃え管理
 */

/** トレーナー種別 */
export type TrainerRank = "normal" | "gym_leader" | "elite_four" | "champion";

/** トレーナー種別ごとの賞金倍率 */
const PRIZE_MULTIPLIER: Record<TrainerRank, number> = {
  normal: 40,
  gym_leader: 200,
  elite_four: 300,
  champion: 500,
};

/**
 * 賞金を計算する
 * 賞金 = エースモンスターのレベル × トレーナー種別倍率
 * @param aceLevel エースモンスターのレベル
 * @param rank トレーナー種別
 * @param hasAmuletCoin おまもりこばん所持（2倍ボーナス）
 */
export function calculateRewardPrizeMoney(
  aceLevel: number,
  rank: TrainerRank,
  hasAmuletCoin: boolean = false,
): number {
  const base = aceLevel * PRIZE_MULTIPLIER[rank];
  return hasAmuletCoin ? base * 2 : base;
}

/**
 * 敗北時のペナルティ計算
 * 所持金の半分を失う（最低100円は残る）
 * @param currentMoney 現在の所持金
 * @returns { lostAmount, remainingMoney }
 */
export function calculateDefeatPenalty(currentMoney: number): {
  lostAmount: number;
  remainingMoney: number;
} {
  if (currentMoney <= 100) {
    return { lostAmount: 0, remainingMoney: currentMoney };
  }

  const lostAmount = Math.floor(currentMoney / 2);
  const remainingMoney = Math.max(100, currentMoney - lostAmount);

  return { lostAmount, remainingMoney };
}

/**
 * 勝利時の賞金獲得メッセージ
 */
export function getVictoryRewardMessage(prizeMoney: number): string {
  return `${prizeMoney}円 手に入れた！`;
}

/**
 * 敗北時のペナルティメッセージ
 */
export function getDefeatPenaltyMessage(lostAmount: number): string[] {
  if (lostAmount <= 0) return ["目の前が真っ暗になった…"];
  return ["目の前が真っ暗になった…", `${lostAmount}円を落としてしまった！`];
}

/** ショップ品揃えエントリ */
export interface ShopItem {
  itemId: string;
  requiredBadges: number;
}

/** バッジ数に応じたショップ品揃えテーブル */
export const SHOP_INVENTORY: ShopItem[] = [
  // バッジ0
  { itemId: "potion", requiredBadges: 0 },
  { itemId: "monster-ball", requiredBadges: 0 },
  { itemId: "antidote", requiredBadges: 0 },

  // バッジ2
  { itemId: "super-potion", requiredBadges: 2 },
  { itemId: "super-ball", requiredBadges: 2 },
  { itemId: "parlyz-heal", requiredBadges: 2 },
  { itemId: "burn-heal", requiredBadges: 2 },
  { itemId: "awakening", requiredBadges: 2 },

  // バッジ4
  { itemId: "hyper-potion", requiredBadges: 4 },
  { itemId: "hyper-ball", requiredBadges: 4 },
  { itemId: "revive", requiredBadges: 4 },
  { itemId: "full-heal", requiredBadges: 4 },

  // バッジ6
  { itemId: "full-restore", requiredBadges: 6 },
  { itemId: "net-ball", requiredBadges: 6 },
  { itemId: "dark-ball", requiredBadges: 6 },

  // バッジ8
  { itemId: "max-potion", requiredBadges: 8 },
  { itemId: "max-revive", requiredBadges: 8 },
  { itemId: "quick-ball", requiredBadges: 8 },
  { itemId: "timer-ball", requiredBadges: 8 },
  { itemId: "repeat-ball", requiredBadges: 8 },
];

/**
 * バッジ数に応じたショップで購入可能なアイテムIDリストを返す
 */
export function getShopItems(badgeCount: number): string[] {
  return SHOP_INVENTORY.filter((item) => badgeCount >= item.requiredBadges).map(
    (item) => item.itemId,
  );
}

/**
 * ジムリーダーの推定賞金一覧（バッジ番号→賞金額）
 */
export const GYM_PRIZE_TABLE: Record<number, number> = {
  1: calculateRewardPrizeMoney(15, "gym_leader"), // 3000
  2: calculateRewardPrizeMoney(20, "gym_leader"), // 4000
  3: calculateRewardPrizeMoney(25, "gym_leader"), // 5000
  4: calculateRewardPrizeMoney(30, "gym_leader"), // 6000
  5: calculateRewardPrizeMoney(35, "gym_leader"), // 7000
  6: calculateRewardPrizeMoney(40, "gym_leader"), // 8000
  7: calculateRewardPrizeMoney(45, "gym_leader"), // 9000
  8: calculateRewardPrizeMoney(50, "gym_leader"), // 10000
};
