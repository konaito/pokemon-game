import type { MoveDefinition, MonsterInstance, MonsterSpecies } from "@/types";
import { getMultiTypeEffectiveness } from "@/engine/type/effectiveness";
import { calcAllStats } from "@/engine/monster/stats";
import { getStatusEffect } from "./status";
import { getStageMultiplier, type StatStages } from "./stat-stage";
import { getHeldItemDamageModifiers } from "./held-item";

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
  /** 攻撃側の能力変化ステージ */
  attackerStages?: StatStages;
  /** 防御側の能力変化ステージ */
  defenderStages?: StatStages;
  /** 乱数生成器（テスト時に固定するため注入可能） */
  random?: () => number;
  /** 攻撃側の持ち物ID */
  attackerHeldItem?: string;
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
    attacker.nature,
  );
  const defenderStats = calcAllStats(
    defenderSpecies.baseStats,
    defender.ivs,
    defender.evs,
    defender.level,
    defender.nature,
  );

  // 物理 or 特殊に応じてA/Dを選択
  const atkKey = move.category === "physical" ? ("atk" as const) : ("spAtk" as const);
  const defKey = move.category === "physical" ? ("def" as const) : ("spDef" as const);

  let attackStat = attackerStats[atkKey];
  let defenseStat = defenderStats[defKey];

  // 能力変化ステージ適用
  if (ctx.attackerStages) {
    attackStat = Math.floor(attackStat * getStageMultiplier(ctx.attackerStages[atkKey]));
  }
  if (ctx.defenderStages) {
    defenseStat = Math.floor(defenseStat * getStageMultiplier(ctx.defenderStages[defKey]));
  }

  // やけど時の物理攻撃力半減
  if (attacker.status === "burn" && move.category === "physical") {
    attackStat = Math.floor(attackStat * getStatusEffect("burn").attackModifier);
  }

  // 持ち物による攻撃・特攻倍率
  const heldItemMods = getHeldItemDamageModifiers(
    ctx.attackerHeldItem,
    move.type,
    move.category,
    0, // effectiveness計算前なのでまず0を渡す（power/atk/spAtkの倍率のみ適用）
  );

  if (move.category === "physical") {
    attackStat = Math.floor(attackStat * heldItemMods.attackMultiplier);
  } else {
    attackStat = Math.floor(attackStat * heldItemMods.spAtkMultiplier);
  }

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

  // タイプ無効 → ダメージ0（最低保証なし）
  if (effectiveness === 0) {
    return { damage: 0, effectiveness: 0, isCritical: false, isStab };
  }

  // 持ち物による効果抜群時の追加倍率（effectivenessが判明した後に取得）
  const heldItemEffMods = getHeldItemDamageModifiers(
    ctx.attackerHeldItem,
    move.type,
    move.category,
    effectiveness,
  );

  // 急所判定（1/24の確率）
  const isCritical = random() < 1 / 24;
  const criticalModifier = isCritical ? 1.5 : 1;

  // 乱数補正（0.85 - 1.00の範囲）
  const randomModifier = 0.85 + random() * 0.15;

  // 持ち物倍率（威力倍率 + 効果抜群倍率）
  const heldItemMultiplier =
    heldItemMods.powerMultiplier * heldItemEffMods.superEffectiveMultiplier;

  // 最終ダメージ（等倍以上なら最低1保証）
  const damage = Math.max(
    1,
    Math.floor(
      baseDamage *
        stabModifier *
        effectiveness *
        criticalModifier *
        randomModifier *
        heldItemMultiplier,
    ),
  );

  return { damage, effectiveness, isCritical, isStab };
}
