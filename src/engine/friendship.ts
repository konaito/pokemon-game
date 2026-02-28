import type { MonsterInstance, MonsterSpecies } from "@/types";

/** デフォルトの基本なつき度 */
export const DEFAULT_BASE_FRIENDSHIP = 70;

/** なつき度の最大値 */
export const MAX_FRIENDSHIP = 255;

/** なつき度の最小値 */
export const MIN_FRIENDSHIP = 0;

/** なつき度の段階 */
export type FriendshipLevel = "low" | "normal" | "high" | "max";

/**
 * なつき度の段階を取得
 */
export function getFriendshipLevel(friendship: number): FriendshipLevel {
  if (friendship >= 255) return "max";
  if (friendship >= 150) return "high";
  if (friendship >= 50) return "normal";
  return "low";
}

/**
 * なつき度の段階を日本語で取得
 */
export function getFriendshipText(friendship: number): string {
  const level = getFriendshipLevel(friendship);
  switch (level) {
    case "max":
      return "最高になついている！";
    case "high":
      return "とてもなついている";
    case "normal":
      return "ふつうになついている";
    case "low":
      return "まだ警戒している";
  }
}

/**
 * モンスターの現在のなつき度を取得（未設定時はデフォルト値）
 */
export function getFriendship(monster: MonsterInstance, species?: MonsterSpecies): number {
  if (monster.friendship !== undefined) return monster.friendship;
  return species?.baseFriendship ?? DEFAULT_BASE_FRIENDSHIP;
}

/**
 * なつき度を安全に変更（0-255にクランプ）
 */
function changeFriendship(monster: MonsterInstance, delta: number, species?: MonsterSpecies): void {
  const current = getFriendship(monster, species);
  monster.friendship = Math.max(MIN_FRIENDSHIP, Math.min(MAX_FRIENDSHIP, current + delta));
}

/**
 * レベルアップ時のなつき度上昇
 */
export function onLevelUp(monster: MonsterInstance, species?: MonsterSpecies): void {
  const current = getFriendship(monster, species);
  // なつき度が低いほど大きく上昇
  const delta = current < 100 ? 5 : current < 200 ? 3 : 2;
  changeFriendship(monster, delta, species);
}

/**
 * バトル勝利時のなつき度上昇
 */
export function onBattleWin(monster: MonsterInstance, species?: MonsterSpecies): void {
  const current = getFriendship(monster, species);
  const delta = current < 100 ? 3 : current < 200 ? 2 : 1;
  changeFriendship(monster, delta, species);
}

/**
 * 回復時のなつき度上昇
 */
export function onHeal(monster: MonsterInstance, species?: MonsterSpecies): void {
  changeFriendship(monster, 1, species);
}

/**
 * 瀕死時のなつき度低下
 */
export function onFaint(monster: MonsterInstance, species?: MonsterSpecies): void {
  changeFriendship(monster, -1, species);
}

/**
 * なつき度によるバトルボーナス: 急所率上昇
 * @returns 急所率のボーナス（0 or 追加確率）
 */
export function getCriticalRateBonus(monster: MonsterInstance, species?: MonsterSpecies): number {
  const friendship = getFriendship(monster, species);
  // なつき度220以上で急所率+1段階（+1/8）
  if (friendship >= 220) return 1 / 8;
  return 0;
}

/**
 * なつき度進化チェック: なつき度220以上で進化可能
 */
export function canEvolveByFriendship(
  monster: MonsterInstance,
  species: MonsterSpecies,
): string | null {
  if (!species.evolvesTo) return null;
  const friendship = getFriendship(monster, species);

  for (const evo of species.evolvesTo) {
    if (evo.condition === "friendship" && friendship >= 220) {
      return evo.id;
    }
  }
  return null;
}
