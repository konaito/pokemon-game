import type { MonsterInstance, MonsterSpecies } from "@/types";

/**
 * 経験値計算（簡易版）
 * 基本式: (baseExp * defeatedLevel) / 7
 *
 * baseExp は倒したモンスターの種族による基礎経験値
 * （現時点では種族値合計 / 4 で代用）
 */
export function calcExpGain(
  defeatedSpecies: MonsterSpecies,
  defeatedLevel: number,
  isTrainerBattle: boolean,
): number {
  const { hp, atk, def, spAtk, spDef, speed } = defeatedSpecies.baseStats;
  const baseExp = Math.floor((hp + atk + def + spAtk + spDef + speed) / 4);
  const trainerBonus = isTrainerBattle ? 1.5 : 1;
  return Math.floor((baseExp * defeatedLevel * trainerBonus) / 7);
}

/**
 * レベルアップに必要な累計経験値（中速グループ）
 * 公式: n^3
 */
export function expForLevel(level: number): number {
  return level * level * level;
}

/**
 * 経験値を付与してレベルアップを処理
 * @returns レベルアップした場合のレベル差（0=レベルアップなし）
 */
export function grantExp(
  monster: MonsterInstance,
  expGain: number,
): { levelsGained: number; newLevel: number } {
  monster.exp += expGain;
  let levelsGained = 0;

  while (monster.level < 100 && monster.exp >= expForLevel(monster.level + 1)) {
    monster.level++;
    levelsGained++;
  }

  return { levelsGained, newLevel: monster.level };
}
