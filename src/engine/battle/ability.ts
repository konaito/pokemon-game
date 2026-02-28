/**
 * 特性（アビリティ）のバトル中効果処理 (#172)
 */
import type { AbilityId, MonsterInstance, MonsterSpecies, TypeId, MoveDefinition } from "@/types";
import { getAbilityById } from "@/data/abilities";
import { getSpeciesAbilities } from "@/data/abilities";
import { calcAllStats } from "@/engine/monster/stats";

/** ピンチ特性: HP1/3以下でブーストするタイプのマップ */
const PINCH_ABILITY_TYPE: Record<string, TypeId> = {
  blaze: "fire",
  torrent: "water",
  overgrow: "grass",
  swarm: "bug",
};

/** 吸収特性: 該当タイプの技を無効化するマップ */
const ABSORB_ABILITY_TYPE: Record<string, TypeId> = {
  water_absorb: "water",
  volt_absorb: "electric",
  flash_fire: "fire",
  levitate: "ground",
};

/** あついしぼう で半減するタイプ */
const THICK_FAT_TYPES: TypeId[] = ["fire", "ice"];

/**
 * モンスター個体の特性を取得する
 * instance.ability があればそれを使い、なければ種族デフォルトの最初の特性
 */
export function getMonsterAbility(
  monster: MonsterInstance,
  species?: MonsterSpecies,
): AbilityId | null {
  if (monster.ability) return monster.ability;
  const speciesAbilities = species?.abilities ?? getSpeciesAbilities(monster.speciesId);
  return speciesAbilities[0] ?? null;
}

/**
 * ダメージ計算時の特性倍率を返す
 * @returns 1.0 がデフォルト（倍率変更なし）
 */
export function getAbilityDamageMultiplier(
  attackerAbility: AbilityId | null,
  attacker: MonsterInstance,
  attackerSpecies: MonsterSpecies,
  move: MoveDefinition,
): number {
  if (!attackerAbility) return 1.0;

  // ピンチ特性（HP1/3以下でタイプ一致1.5倍）
  const pinchType = PINCH_ABILITY_TYPE[attackerAbility];
  if (pinchType && move.type === pinchType) {
    const maxHp = calcAllStats(
      attackerSpecies.baseStats,
      attacker.ivs,
      attacker.evs,
      attacker.level,
      attacker.nature,
    ).hp;
    if (attacker.currentHp <= Math.floor(maxHp / 3)) {
      return 1.5;
    }
  }

  // ちからもち（物理技2倍）
  if (attackerAbility === "huge_power" && move.category === "physical") {
    return 2.0;
  }

  // こんじょう（状態異常時攻撃1.5倍、物理のみ）
  if (attackerAbility === "guts" && attacker.status !== null && move.category === "physical") {
    return 1.5;
  }

  return 1.0;
}

/**
 * 防御側の特性によるダメージ軽減倍率を返す
 */
export function getAbilityDefenseMultiplier(
  defenderAbility: AbilityId | null,
  move: MoveDefinition,
): number {
  if (!defenderAbility) return 1.0;

  // あついしぼう（炎・氷半減）
  if (defenderAbility === "thick_fat" && THICK_FAT_TYPES.includes(move.type)) {
    return 0.5;
  }

  // こおりのりんぷん（特殊技半減）
  if (defenderAbility === "ice_scales" && move.category === "special") {
    return 0.5;
  }

  return 1.0;
}

/**
 * タイプ無効化特性チェック
 * @returns true = 技を無効化する
 */
export function doesAbilityBlockMove(
  defenderAbility: AbilityId | null,
  move: MoveDefinition,
): boolean {
  if (!defenderAbility) return false;

  const blockedType = ABSORB_ABILITY_TYPE[defenderAbility];
  if (blockedType && move.type === blockedType) {
    return true;
  }

  return false;
}

/**
 * STAB倍率を特性に基づいて調整する
 * @returns 通常1.5、てきおうりょくなら2.0
 */
export function getAbilityStabMultiplier(attackerAbility: AbilityId | null): number {
  if (attackerAbility === "adaptability") return 2.0;
  return 1.5;
}

/**
 * がんじょう判定
 * @returns true = HP満タンから一撃KOを防ぐ
 */
export function sturdyCheck(
  defenderAbility: AbilityId | null,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  damage: number,
): number {
  if (defenderAbility !== "sturdy") return damage;

  const maxHp = calcAllStats(
    defenderSpecies.baseStats,
    defender.ivs,
    defender.evs,
    defender.level,
    defender.nature,
  ).hp;

  // HPが満タンで、ダメージが現在HPを超える場合 → HP1で耐える
  if (defender.currentHp === maxHp && damage >= defender.currentHp) {
    return defender.currentHp - 1;
  }

  return damage;
}

/**
 * 登場時特性の効果メッセージを生成
 * @returns メッセージ配列（空なら効果なし）
 */
export function getOnEnterMessages(
  ability: AbilityId | null,
  monsterName: string,
  abilityName?: string,
): string[] {
  if (!ability) return [];
  const def = getAbilityById(ability);
  if (!def || def.trigger !== "on_enter") return [];

  const name = abilityName ?? def.name;

  switch (ability) {
    case "intimidate":
      return [`${monsterName}の${name}！`, `相手の攻撃が下がった！`];
    case "drizzle":
      return [`${monsterName}の${name}！`, `雨が降り始めた！`];
    case "drought":
      return [`${monsterName}の${name}！`, `日差しが強くなった！`];
    default:
      return [];
  }
}
