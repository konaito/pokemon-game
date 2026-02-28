/**
 * 持ち物のバトル中効果処理 (#174)
 */
import type { MonsterInstance, MonsterSpecies, MoveDefinition, TypeId } from "@/types";
import { getHeldItemById, type HeldItemDefinition } from "@/data/items/held-items";
import { calcAllStats } from "@/engine/monster/stats";

/**
 * モンスターの持ち物定義を取得
 */
export function getHeldItem(monster: MonsterInstance): HeldItemDefinition | null {
  if (!monster.heldItem) return null;
  return getHeldItemById(monster.heldItem) ?? null;
}

/**
 * 攻撃側の持ち物によるダメージ倍率
 */
export function getHeldItemDamageMultiplier(
  heldItem: HeldItemDefinition | null,
  move: MoveDefinition,
): number {
  if (!heldItem) return 1.0;

  // タイプ強化アイテム
  if (heldItem.effectType === "type_boost" && heldItem.boostType === move.type) {
    return 1.2;
  }

  // こだわりハチマキ（物理技のみ）
  if (heldItem.effectType === "choice_atk" && move.category === "physical") {
    return 1.5;
  }

  // こだわりメガネ（特殊技のみ）
  if (heldItem.effectType === "choice_spatk" && move.category === "special") {
    return 1.5;
  }

  // いのちのたま
  if (heldItem.effectType === "life_orb" && move.power !== null) {
    return 1.3;
  }

  return 1.0;
}

/**
 * いのちのたまの反動ダメージ計算
 * @returns 反動ダメージ量（0ならなし）
 */
export function getLifeOrbRecoil(
  heldItem: HeldItemDefinition | null,
  attacker: MonsterInstance,
  attackerSpecies: MonsterSpecies,
  move: MoveDefinition,
): number {
  if (!heldItem || heldItem.effectType !== "life_orb") return 0;
  if (move.power === null || move.category === "status") return 0;

  const maxHp = calcAllStats(
    attackerSpecies.baseStats,
    attacker.ivs,
    attacker.evs,
    attacker.level,
    attacker.nature,
  ).hp;

  return Math.max(1, Math.floor(maxHp / 10));
}

/**
 * きあいのタスキ判定
 * @returns 補正後のダメージ
 */
export function focusSashCheck(
  heldItem: HeldItemDefinition | null,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  damage: number,
): { damage: number; consumed: boolean } {
  if (!heldItem || heldItem.effectType !== "focus_sash") {
    return { damage, consumed: false };
  }

  const maxHp = calcAllStats(
    defenderSpecies.baseStats,
    defender.ivs,
    defender.evs,
    defender.level,
    defender.nature,
  ).hp;

  if (defender.currentHp === maxHp && damage >= defender.currentHp) {
    return { damage: defender.currentHp - 1, consumed: true };
  }

  return { damage, consumed: false };
}

/**
 * オボンのみ判定（HP1/2以下で発動）
 * @returns 回復量と消費フラグ
 */
export function oranBerryCheck(
  heldItem: HeldItemDefinition | null,
  monster: MonsterInstance,
  monsterSpecies: MonsterSpecies,
): { healAmount: number; consumed: boolean } {
  if (!heldItem || heldItem.effectType !== "pinch_heal") {
    return { healAmount: 0, consumed: false };
  }

  const maxHp = calcAllStats(
    monsterSpecies.baseStats,
    monster.ivs,
    monster.evs,
    monster.level,
    monster.nature,
  ).hp;

  if (monster.currentHp <= Math.floor(maxHp / 2) && monster.currentHp > 0) {
    const heal = Math.max(1, Math.floor(maxHp / 4));
    return { healAmount: heal, consumed: true };
  }

  return { healAmount: 0, consumed: false };
}

/**
 * ラムのみ判定（状態異常時に発動）
 */
export function lumBerryCheck(
  heldItem: HeldItemDefinition | null,
  monster: MonsterInstance,
): { cured: boolean; consumed: boolean } {
  if (!heldItem || heldItem.effectType !== "status_cure") {
    return { cured: false, consumed: false };
  }

  if (monster.status !== null) {
    return { cured: true, consumed: true };
  }

  return { cured: false, consumed: false };
}

/**
 * たべのこし: 毎ターン最大HPの1/16回復
 */
export function leftoversHeal(
  heldItem: HeldItemDefinition | null,
  monster: MonsterInstance,
  monsterSpecies: MonsterSpecies,
): number {
  if (!heldItem || heldItem.effectType !== "leftovers") return 0;

  const maxHp = calcAllStats(
    monsterSpecies.baseStats,
    monster.ivs,
    monster.evs,
    monster.level,
    monster.nature,
  ).hp;

  if (monster.currentHp >= maxHp || monster.currentHp <= 0) return 0;

  return Math.max(1, Math.floor(maxHp / 16));
}

/**
 * しんかのきせき: 進化前のモンスターの防御・特防1.5倍
 */
export function evioliteMultiplier(
  heldItem: HeldItemDefinition | null,
  species: MonsterSpecies,
): number {
  if (!heldItem || heldItem.effectType !== "eviolite") return 1.0;
  // 進化先がある = 進化前
  if (species.evolvesTo && species.evolvesTo.length > 0) {
    return 1.5;
  }
  return 1.0;
}

/**
 * こだわりスカーフ: 素早さ1.5倍
 */
export function choiceScarfMultiplier(heldItem: HeldItemDefinition | null): number {
  if (!heldItem || heldItem.effectType !== "choice_speed") return 1.0;
  return 1.5;
}

/**
 * 持ち物効果のメッセージ生成
 */
export function getHeldItemMessage(
  effectType: string,
  monsterName: string,
  itemName: string,
): string {
  switch (effectType) {
    case "pinch_heal":
      return `${monsterName}は${itemName}でHPを回復した！`;
    case "status_cure":
      return `${monsterName}は${itemName}で状態異常が治った！`;
    case "focus_sash":
      return `${monsterName}は${itemName}でこらえた！`;
    case "life_orb":
      return `${monsterName}はいのちのたまで体力を削られた！`;
    case "leftovers":
      return `${monsterName}はたべのこしで少し回復した。`;
    default:
      return "";
  }
}
