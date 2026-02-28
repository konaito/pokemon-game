import type { MoveDefinition, MonsterInstance, MonsterSpecies, AbilityId } from "@/types";
import { getMultiTypeEffectiveness } from "@/engine/type/effectiveness";
import { calcAllStats } from "@/engine/monster/stats";
import { getStatusEffect } from "./status";
import { getStageMultiplier, type StatStages } from "./stat-stage";
import {
  getAbilityDamageModifiers,
  getDefenderAbilityModifier,
  checkAbilityTypeImmunity,
  applySturdyCheck,
} from "./ability";

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
  /** 攻撃側の特性ID */
  attackerAbility?: AbilityId;
  /** 防御側の特性ID */
  defenderAbility?: AbilityId;
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

  // 特性によるタイプ無効化チェック
  const immunityCheck = checkAbilityTypeImmunity(ctx.defenderAbility, move.type);
  if (immunityCheck === "immune" || immunityCheck === "absorb") {
    return { damage: 0, effectiveness: 0, isCritical: false, isStab: false };
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

  // やけど時の物理攻撃力半減（こんじょうの場合は除外）
  if (
    attacker.status === "burn" &&
    move.category === "physical" &&
    ctx.attackerAbility !== "guts"
  ) {
    attackStat = Math.floor(attackStat * getStatusEffect("burn").attackModifier);
  }

  // STAB判定（特性倍率計算に必要なので先に）
  const isStab = attackerSpecies.types.includes(move.type);

  // 急所判定（特性倍率計算に必要なので先に）
  const isCritical = random() < 1 / 24;

  // 特性によるダメージ倍率
  const abilityMods = getAbilityDamageModifiers(
    ctx.attackerAbility,
    ctx.defenderAbility,
    attacker,
    attackerSpecies,
    move.type,
    move.category,
    move.power,
    isStab,
    isCritical,
  );

  // 防御側の特性による防御倍率
  const defenderAbilityMod = getDefenderAbilityModifier(
    ctx.defenderAbility,
    defender,
    defenderSpecies,
    move.category,
  );

  // 特性による攻撃/防御倍率を適用
  attackStat = Math.floor(attackStat * abilityMods.attackMultiplier);
  defenseStat = Math.floor(defenseStat * defenderAbilityMod);
  const effectivePower = Math.floor(move.power * abilityMods.powerMultiplier);

  // 基本ダメージ
  const baseDamage =
    Math.floor(
      (Math.floor((2 * attacker.level) / 5 + 2) * effectivePower * attackStat) / defenseStat / 50,
    ) + 2;

  // STAB（タイプ一致ボーナス）— 特性で上書き可能
  const stabModifier = isStab ? (abilityMods.stabOverride ?? 1.5) : 1;

  // タイプ相性
  const effectiveness = getMultiTypeEffectiveness(move.type, [...defenderSpecies.types]);

  // タイプ無効 → ダメージ0（最低保証なし）
  if (effectiveness === 0) {
    return { damage: 0, effectiveness: 0, isCritical: false, isStab };
  }

  // 急所倍率 — 特性で上書き可能
  const criticalModifier = isCritical ? (abilityMods.criticalOverride ?? 1.5) : 1;

  // 乱数補正（0.85 - 1.00の範囲）
  const randomModifier = 0.85 + random() * 0.15;

  // 最終ダメージ（等倍以上なら最低1保証）
  let damage = Math.max(
    1,
    Math.floor(
      baseDamage *
        stabModifier *
        effectiveness *
        criticalModifier *
        randomModifier *
        abilityMods.finalMultiplier,
    ),
  );

  // がんじょうチェック
  damage = applySturdyCheck(ctx.defenderAbility, defender, defenderSpecies, damage);

  return { damage, effectiveness, isCritical, isStab };
}
