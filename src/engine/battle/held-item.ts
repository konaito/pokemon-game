import type { MonsterInstance, MonsterSpecies, TypeId, HeldItemEffectType } from "@/types";
import { getHeldItemById } from "@/data/items/held-items";
import { calcAllStats } from "@/engine/monster/stats";

/** 持ち物によるダメージ倍率 */
export interface HeldItemDamageModifiers {
  powerMultiplier: number;
  attackMultiplier: number;
  spAtkMultiplier: number;
  /** 効果抜群時の追加倍率 */
  superEffectiveMultiplier: number;
}

/**
 * ダメージ計算時の持ち物効果を取得
 */
export function getHeldItemDamageModifiers(
  attackerHeldItem: string | undefined,
  moveType: TypeId,
  moveCategory: "physical" | "special" | "status",
  effectiveness: number,
): HeldItemDamageModifiers {
  const mods: HeldItemDamageModifiers = {
    powerMultiplier: 1,
    attackMultiplier: 1,
    spAtkMultiplier: 1,
    superEffectiveMultiplier: 1,
  };

  if (!attackerHeldItem) return mods;
  const item = getHeldItemById(attackerHeldItem);
  if (!item) return mods;

  switch (item.effect) {
    case "type_boost":
      if (item.boostType === moveType) {
        mods.powerMultiplier = 1.2;
      }
      break;
    case "life_orb":
      mods.powerMultiplier = 1.3;
      break;
    case "choice_band":
      if (moveCategory === "physical") {
        mods.attackMultiplier = 1.5;
      }
      break;
    case "choice_specs":
      if (moveCategory === "special") {
        mods.spAtkMultiplier = 1.5;
      }
      break;
    case "expert_belt":
      if (effectiveness > 1) {
        mods.superEffectiveMultiplier = 1.2;
      }
      break;
  }

  return mods;
}

/**
 * きあいのタスキ: HP満タンからの一撃KOを防ぐ
 * @returns [調整後ダメージ, 消費されたか]
 */
export function applyFocusSash(
  defenderHeldItem: string | undefined,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  damage: number,
): [number, boolean] {
  if (!defenderHeldItem) return [damage, false];
  const item = getHeldItemById(defenderHeldItem);
  if (!item || item.effect !== "focus_sash") return [damage, false];

  const maxHp = calcAllStats(
    defenderSpecies.baseStats,
    defender.ivs,
    defender.evs,
    defender.level,
    defender.nature,
  ).hp;

  if (defender.currentHp >= maxHp && damage >= defender.currentHp) {
    return [defender.currentHp - 1, true];
  }

  return [damage, false];
}

/**
 * いのちのたまの反動ダメージ
 * @returns 反動ダメージ量（0なら反動なし）
 */
export function getLifeOrbRecoil(
  attackerHeldItem: string | undefined,
  attacker: MonsterInstance,
  attackerSpecies: MonsterSpecies,
  didDamage: boolean,
): number {
  if (!attackerHeldItem || !didDamage) return 0;
  const item = getHeldItemById(attackerHeldItem);
  if (!item || item.effect !== "life_orb") return 0;

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
 * ターン終了時のHP回復チェック（たべのこし）
 * @returns [回復量, メッセージ]
 */
export function applyEndOfTurnHeldItem(
  monster: MonsterInstance,
  species: MonsterSpecies,
): { healed: number; message: string | null } {
  if (!monster.heldItem || monster.currentHp <= 0) return { healed: 0, message: null };
  const item = getHeldItemById(monster.heldItem);
  if (!item) return { healed: 0, message: null };

  if (item.effect === "leftovers") {
    const maxHp = calcAllStats(
      species.baseStats,
      monster.ivs,
      monster.evs,
      monster.level,
      monster.nature,
    ).hp;
    if (monster.currentHp < maxHp) {
      const healAmount = Math.max(1, Math.floor(maxHp / 16));
      const actualHeal = Math.min(healAmount, maxHp - monster.currentHp);
      monster.currentHp += actualHeal;
      return { healed: actualHeal, message: `${species.name}はたべのこしで少し回復した！` };
    }
  }

  return { healed: 0, message: null };
}

/**
 * ダメージ受けた後のきのみチェック（オボンのみ等）
 * @returns メッセージ配列（消費された場合はheldItemをnullに）
 */
export function checkBerryAfterDamage(monster: MonsterInstance, species: MonsterSpecies): string[] {
  if (!monster.heldItem || monster.currentHp <= 0) return [];
  const item = getHeldItemById(monster.heldItem);
  if (!item) return [];

  const maxHp = calcAllStats(
    species.baseStats,
    monster.ivs,
    monster.evs,
    monster.level,
    monster.nature,
  ).hp;

  // オボンのみ: HP1/2以下でHP1/4回復
  if (item.effect === "berry_sitrus" && monster.currentHp <= maxHp / 2) {
    const healAmount = Math.max(1, Math.floor(maxHp / 4));
    monster.currentHp = Math.min(maxHp, monster.currentHp + healAmount);
    monster.heldItem = undefined;
    return [`${species.name}はオボンのみでHPを回復した！`];
  }

  return [];
}

/**
 * 状態異常付与後のラムのみチェック
 */
export function checkLumBerry(monster: MonsterInstance, speciesName: string): string[] {
  if (!monster.heldItem || !monster.status) return [];
  const item = getHeldItemById(monster.heldItem);
  if (!item || item.effect !== "berry_lum") return [];

  monster.status = null;
  monster.heldItem = undefined;
  return [`${speciesName}はラムのみで状態異常が治った！`];
}
