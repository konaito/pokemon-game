import type { MonsterInstance, MonsterSpecies, TypeId, AbilityId } from "@/types";
import { calcAllStats } from "@/engine/monster/stats";

/**
 * 特性によるダメージ倍率計算の結果
 */
export interface AbilityDamageModifiers {
  /** 攻撃力倍率 */
  attackMultiplier: number;
  /** 防御力倍率 */
  defenseMultiplier: number;
  /** STAB倍率の上書き（undefinedなら通常の1.5倍） */
  stabOverride?: number;
  /** 技威力倍率 */
  powerMultiplier: number;
  /** 急所ダメージ倍率の上書き */
  criticalOverride?: number;
  /** 最終ダメージ倍率 */
  finalMultiplier: number;
}

/**
 * 攻撃側と防御側の特性を考慮してダメージ倍率を計算する
 */
export function getAbilityDamageModifiers(
  attackerAbility: AbilityId | undefined,
  defenderAbility: AbilityId | undefined,
  attacker: MonsterInstance,
  attackerSpecies: MonsterSpecies,
  moveType: TypeId,
  moveCategory: "physical" | "special" | "status",
  movePower: number | null,
  isStab: boolean,
  isCritical: boolean,
): AbilityDamageModifiers {
  const mods: AbilityDamageModifiers = {
    attackMultiplier: 1,
    defenseMultiplier: 1,
    powerMultiplier: 1,
    finalMultiplier: 1,
  };

  if (moveCategory === "status" || movePower === null) return mods;

  const maxHp = calcAllStats(
    attackerSpecies.baseStats,
    attacker.ivs,
    attacker.evs,
    attacker.level,
    attacker.nature,
  ).hp;
  const hpRatio = attacker.currentHp / maxHp;

  // ── 攻撃側の特性 ──

  // もうか / げきりゅう / しんりょく: HP1/3以下で対応タイプの技威力1.5倍
  if (attackerAbility === "blaze" && hpRatio <= 1 / 3 && moveType === "fire") {
    mods.powerMultiplier *= 1.5;
  }
  if (attackerAbility === "torrent" && hpRatio <= 1 / 3 && moveType === "water") {
    mods.powerMultiplier *= 1.5;
  }
  if (attackerAbility === "overgrow" && hpRatio <= 1 / 3 && moveType === "grass") {
    mods.powerMultiplier *= 1.5;
  }

  // てきおうりょく: STAB 2倍
  if (attackerAbility === "adaptability" && isStab) {
    mods.stabOverride = 2;
  }

  // ちからもち: 物理攻撃力2倍
  if (attackerAbility === "huge_power" && moveCategory === "physical") {
    mods.attackMultiplier *= 2;
  }

  // テクニシャン: 威力60以下の技の威力1.5倍
  if (attackerAbility === "technician" && movePower !== null && movePower <= 60) {
    mods.powerMultiplier *= 1.5;
  }

  // こんじょう: 状態異常時の攻撃1.5倍
  if (attackerAbility === "guts" && attacker.status !== null && moveCategory === "physical") {
    mods.attackMultiplier *= 1.5;
  }

  // スナイパー: 急所ダメージ2.25倍
  if (attackerAbility === "sniper" && isCritical) {
    mods.criticalOverride = 2.25;
  }

  // もらいび（攻撃側にフラグが立っている場合）は呼び出し側で処理
  // ここでは炎技の威力1.5倍のみ
  // (flashFireActivated は外部から注入する必要があるため、将来の拡張とする)

  // ── 防御側の特性 ──

  // あついしぼう: ほのお/こおり技のダメージ半減
  if (defenderAbility === "thick_fat" && (moveType === "fire" || moveType === "ice")) {
    mods.finalMultiplier *= 0.5;
  }

  // ふしぎなうろこ: 状態異常時の防御1.5倍（物理のみ）
  // defenderの情報は呼び出し側で渡す必要があるが、ここでは簡略化

  // マルチスケイル: HPが満タンのとき受けるダメージ半減
  // (defender情報が必要なので、別途処理)

  return mods;
}

/**
 * 防御側の特性によるダメージ軽減を計算
 */
export function getDefenderAbilityModifier(
  defenderAbility: AbilityId | undefined,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  moveCategory: "physical" | "special" | "status",
): number {
  if (!defenderAbility) return 1;

  // ふしぎなうろこ: 状態異常時の物理防御1.5倍
  if (
    defenderAbility === "marvel_scale" &&
    defender.status !== null &&
    moveCategory === "physical"
  ) {
    return 1.5;
  }

  // マルチスケイル: HP満タン時のダメージ半減
  if (defenderAbility === "multiscale") {
    const maxHp = calcAllStats(
      defenderSpecies.baseStats,
      defender.ivs,
      defender.evs,
      defender.level,
      defender.nature,
    ).hp;
    if (defender.currentHp >= maxHp) {
      return 0.5;
    }
  }

  return 1;
}

/**
 * 特性によるタイプ無効化チェック
 * @returns "immune" = 無効化, "absorb" = 吸収して回復, null = 通常処理
 */
export function checkAbilityTypeImmunity(
  defenderAbility: AbilityId | undefined,
  moveType: TypeId,
): "immune" | "absorb" | null {
  if (!defenderAbility) return null;

  // ふゆう: じめん技無効
  if (defenderAbility === "levitate" && moveType === "ground") {
    return "immune";
  }

  // もらいび: ほのお技無効
  if (defenderAbility === "flash_fire" && moveType === "fire") {
    return "immune";
  }

  // ちょすい: みず技を吸収してHP回復
  if (defenderAbility === "water_absorb" && moveType === "water") {
    return "absorb";
  }

  // ちくでん: でんき技を吸収してHP回復
  if (defenderAbility === "volt_absorb" && moveType === "electric") {
    return "absorb";
  }

  return null;
}

/**
 * がんじょう（sturdy）チェック: HPが満タンのとき一撃KOを防ぐ
 * @returns 補正後のダメージ
 */
export function applySturdyCheck(
  defenderAbility: AbilityId | undefined,
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

  if (defender.currentHp >= maxHp && damage >= defender.currentHp) {
    return defender.currentHp - 1;
  }

  return damage;
}

/**
 * 接触技を受けた後の反撃特性チェック
 * @returns 付与する状態異常とメッセージ、またはnull
 */
export function checkContactAbility(
  defenderAbility: AbilityId | undefined,
  moveCategory: "physical" | "special" | "status",
  random: () => number,
): { status: "poison" | "burn" | "paralysis"; message: string } | null {
  if (!defenderAbility || moveCategory !== "physical") return null;

  const chance = random();

  if (defenderAbility === "poison_point" && chance < 0.3) {
    return { status: "poison", message: "どくのトゲでどく状態になった！" };
  }
  if (defenderAbility === "static" && chance < 0.3) {
    return { status: "paralysis", message: "せいでんきでまひ状態になった！" };
  }
  if (defenderAbility === "flame_body" && chance < 0.3) {
    return { status: "burn", message: "ほのおのからだでやけど状態になった！" };
  }

  return null;
}

/**
 * 場に出たとき（on_enter）の特性処理
 * @returns メッセージ配列と、相手の攻撃変化ステージ
 */
export function processOnEnterAbility(
  abilityId: AbilityId | undefined,
  monsterName: string,
): { messages: string[]; opponentAtkChange?: number } {
  if (!abilityId) return { messages: [] };

  if (abilityId === "intimidate") {
    return {
      messages: [`${monsterName}のいかく！`, `相手の攻撃が下がった！`],
      opponentAtkChange: -1,
    };
  }

  if (abilityId === "pressure") {
    return {
      messages: [`${monsterName}はプレッシャーを放っている！`],
    };
  }

  return { messages: [] };
}

/**
 * ターン終了時の特性処理（だっぴ）
 */
export function processEndOfTurnAbility(
  abilityId: AbilityId | undefined,
  monster: MonsterInstance,
  monsterName: string,
  random: () => number,
): string[] {
  if (!abilityId) return [];

  // だっぴ: 1/3の確率で状態異常回復
  if (abilityId === "shed_skin" && monster.status !== null) {
    if (random() < 1 / 3) {
      monster.status = null;
      return [`${monsterName}はだっぴで状態異常が治った！`];
    }
  }

  // しぜんかいふく: 交代時に発動するので、ここでは不要

  return [];
}
