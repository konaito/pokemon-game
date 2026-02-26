import type { MonsterInstance, MonsterSpecies } from "@/types";
import { calcHp } from "./stats";

/**
 * 進化条件をチェック（配列をイテレートし、条件を満たす最初の進化先を返す）
 * @returns 進化先のspeciesId、または null（進化しない場合）
 */
export function checkEvolution(monster: MonsterInstance, species: MonsterSpecies): string | null {
  if (!species.evolvesTo || species.evolvesTo.length === 0) return null;
  for (const evo of species.evolvesTo) {
    if (monster.level >= evo.level) {
      return evo.id;
    }
  }
  return null;
}

/**
 * 進化を実行する
 * - speciesIdを更新
 * - 最大HPの差分を現在HPに加算
 */
export function evolve(
  monster: MonsterInstance,
  oldSpecies: MonsterSpecies,
  newSpecies: MonsterSpecies,
): void {
  const oldMaxHp = calcHp(oldSpecies.baseStats.hp, monster.ivs.hp, monster.evs.hp, monster.level);
  const newMaxHp = calcHp(newSpecies.baseStats.hp, monster.ivs.hp, monster.evs.hp, monster.level);

  monster.speciesId = newSpecies.id;
  // 最大HPの増加分を現在HPに加算
  monster.currentHp = Math.min(newMaxHp, monster.currentHp + (newMaxHp - oldMaxHp));
}
