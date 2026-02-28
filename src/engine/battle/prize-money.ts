/**
 * トレーナー戦の賞金計算
 *
 * 賞金 = エースのレベル × 倍率
 * 倍率はトレーナー種別によって異なる
 */

/** トレーナー種別 */
export type TrainerClass = "normal" | "gym_leader" | "elite_four" | "champion";

/** トレーナー種別ごとの賞金倍率 */
const PRIZE_MULTIPLIER: Record<TrainerClass, number> = {
  normal: 40,
  gym_leader: 200,
  elite_four: 300,
  champion: 500,
};

/** ジムリーダー名として登録する名前セット（外部から設定可能） */
let gymLeaderNames: Set<string> = new Set();

/**
 * ジムリーダー名リストを設定（アプリ初期化時に呼び出す）
 */
export function setGymLeaderNames(names: string[]): void {
  gymLeaderNames = new Set(names);
}

/**
 * トレーナー名からトレーナー種別を判定
 */
export function resolveTrainerClass(trainerName: string): TrainerClass {
  if (trainerName.includes("チャンピオン")) return "champion";
  if (trainerName.includes("四天王")) return "elite_four";
  if (gymLeaderNames.has(trainerName)) return "gym_leader";
  return "normal";
}

/**
 * トレーナー戦の賞金を計算
 * @param aceLevel エース（最高レベル）モンスターのレベル
 * @param trainerClass トレーナー種別
 * @returns 賞金額
 */
export function calculatePrizeMoney(aceLevel: number, trainerClass: TrainerClass): number {
  return aceLevel * PRIZE_MULTIPLIER[trainerClass];
}

/**
 * パーティからエースレベルを取得
 * @param party パーティのレベル配列
 * @returns 最高レベル
 */
export function getAceLevel(partyLevels: number[]): number {
  return Math.max(...partyLevels);
}

/**
 * 敗北時の所持金ペナルティを計算
 * 所持金の半分を失う（最低100円は残る）
 * @param currentMoney 現在の所持金
 * @returns 失う金額
 */
export function calculateLossPenalty(currentMoney: number): number {
  if (currentMoney <= 100) return 0;
  return Math.floor(currentMoney / 2);
}
