import type { MoveDefinition, MonsterInstance, MonsterSpecies } from "@/types";
import { getMultiTypeEffectiveness } from "@/engine/type/effectiveness";
import { calcAllStats } from "@/engine/monster/stats";

/** ダメージ計算結果 */
export interface DamageResult {
  damage: number;
  effectiveness: number;
  isCritical: boolean;
  isStab: boolean;
}

/** ダメージ計算に必要なコンテキスト */
export interface DamageContext {
  attacker: MonsterInstance;
  attackerSpecies: MonsterSpecies;
  defender: MonsterInstance;
  defenderSpecies: MonsterSpecies;
  move: MoveDefinition;
  /** 乱数生成器（テスト時に固定するため注入可能） */
  random?: () => number;
}

/**
 * ダメージ計算エンジン
 *
 * 基本式: ((2*Level/5+2) * Power * A/D) / 50 + 2
 * × STAB(1.5) × タイプ相性 × 乱数(0.85-1.00) × 急所(1.5)
 */
export function calculateDamage(ctx: DamageContext): DamageResult {
  const random = ctx.random ?? Math.random;
  const { attacker, attackerSpecies, defender, defenderSpecies, move } = ctx;

  // ステータス技はダメージ0
  if (move.category === "status" || move.power === null) {
    return { damage: 0, effectiveness: 1, isCritical: false, isStab: false };
  }

  const attackerStats = calcAllStats(
    attackerSpecies.baseStats,
    attacker.ivs,
    attacker.evs,
    attacker.level,
  );
  const defenderStats = calcAllStats(
    defenderSpecies.baseStats,
    defender.ivs,
    defender.evs,
    defender.level,
  );

  // 物理 or 特殊に応じてA/Dを選択
  const attackStat = move.category === "physical" ? attackerStats.atk : attackerStats.spAtk;
  const defenseStat = move.category === "physical" ? defenderStats.def : defenderStats.spDef;

  // 基本ダメージ
  const baseDamage =
    Math.floor(
      (Math.floor((2 * attacker.level) / 5 + 2) * move.power * attackStat) / defenseStat / 50,
    ) + 2;

  // STAB（タイプ一致ボーナス）
  const isStab = attackerSpecies.types.includes(move.type);
  const stabModifier = isStab ? 1.5 : 1;

  // タイプ相性
  const effectiveness = getMultiTypeEffectiveness(move.type, [...defenderSpecies.types]);

  // 急所判定（1/24の確率）
  const isCritical = random() < 1 / 24;
  const criticalModifier = isCritical ? 1.5 : 1;

  // 乱数補正（0.85 - 1.00の範囲）
  const randomModifier = 0.85 + random() * 0.15;

  // 最終ダメージ
  const damage = Math.max(
    1,
    Math.floor(baseDamage * stabModifier * effectiveness * criticalModifier * randomModifier),
  );

  return { damage, effectiveness, isCritical, isStab };
}
