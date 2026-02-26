import type { BaseStats, IVs, EVs, NatureId } from "@/types";
import { getNatureModifiers } from "./nature";

/**
 * HPの実数値を計算
 * 公式: ((2 * base + iv + ev/4) * level / 100) + level + 10
 */
export function calcHp(base: number, iv: number, ev: number, level: number): number {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

/**
 * HP以外のステータスの実数値を計算
 * 公式: (((2 * base + iv + ev/4) * level / 100) + 5) * nature
 * ※ 性格補正は現時点では1.0固定（将来拡張）
 */
export function calcStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  natureModifier: number = 1.0,
): number {
  return Math.floor(
    (Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureModifier,
  );
}

/**
 * 全ステータスの実数値を一括計算
 * @param nature 性格（省略時は補正なし）
 */
export function calcAllStats(
  baseStats: BaseStats,
  ivs: IVs,
  evs: EVs,
  level: number,
  nature?: NatureId,
): BaseStats & { hp: number } {
  const mods = nature ? getNatureModifiers(nature) : undefined;
  return {
    hp: calcHp(baseStats.hp, ivs.hp, evs.hp, level),
    atk: calcStat(baseStats.atk, ivs.atk, evs.atk, level, mods?.atk),
    def: calcStat(baseStats.def, ivs.def, evs.def, level, mods?.def),
    spAtk: calcStat(baseStats.spAtk, ivs.spAtk, evs.spAtk, level, mods?.spAtk),
    spDef: calcStat(baseStats.spDef, ivs.spDef, evs.spDef, level, mods?.spDef),
    speed: calcStat(baseStats.speed, ivs.speed, evs.speed, level, mods?.speed),
  };
}
