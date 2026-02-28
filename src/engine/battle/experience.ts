import type { MonsterInstance, MonsterSpecies, ExpGroup } from "@/types";

/**
 * 経験値計算
 * 基本式: (baseExpYield * defeatedLevel) / 7
 */
export function calcExpGain(
  defeatedSpecies: MonsterSpecies,
  defeatedLevel: number,
  isTrainerBattle: boolean,
): number {
  const baseExp = defeatedSpecies.baseExpYield;
  const trainerBonus = isTrainerBattle ? 1.5 : 1;
  return Math.floor((baseExp * defeatedLevel * trainerBonus) / 7);
}

/**
 * レベルアップに必要な累計経験値
 * @param level 目標レベル
 * @param group 経験値グループ（省略時は medium_fast）
 */
export function expForLevel(level: number, group: ExpGroup = "medium_fast"): number {
  const n = level;
  switch (group) {
    case "fast":
      return Math.floor(0.8 * n * n * n);
    case "medium_fast":
      return n * n * n;
    case "medium_slow":
      return Math.max(0, Math.floor(1.2 * n * n * n - 15 * n * n + 100 * n - 140));
    case "slow":
      return Math.floor(1.25 * n * n * n);
  }
}

/** 現在レベル内での経験値進捗率 (0〜100) */
export function expProgressPercent(currentExp: number, level: number, expGroup: ExpGroup): number {
  if (level >= 100) return 100;
  const currentLevelExp = expForLevel(level, expGroup);
  const nextLevelExp = expForLevel(level + 1, expGroup);
  const range = nextLevelExp - currentLevelExp;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, ((currentExp - currentLevelExp) / range) * 100));
}

/** 次のレベルまでの残り経験値 */
export function expToNextLevel(currentExp: number, level: number, expGroup: ExpGroup): number {
  if (level >= 100) return 0;
  const nextLevelExp = expForLevel(level + 1, expGroup);
  return Math.max(0, nextLevelExp - currentExp);
}

/**
 * 経験値を付与してレベルアップを処理
 * @param expGroup 経験値グループ（省略時は medium_fast）
 * @returns レベルアップした場合のレベル差（0=レベルアップなし）
 */
export function grantExp(
  monster: MonsterInstance,
  expGain: number,
  expGroup: ExpGroup = "medium_fast",
): { levelsGained: number; newLevel: number } {
  monster.exp += expGain;
  let levelsGained = 0;

  while (monster.level < 100 && monster.exp >= expForLevel(monster.level + 1, expGroup)) {
    monster.level++;
    levelsGained++;
  }

  return { levelsGained, newLevel: monster.level };
}
