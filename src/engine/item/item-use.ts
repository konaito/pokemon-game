/**
 * アイテム使用ロジック (#195)
 * 瀕死復活・PP回復・レベルアップなど新アイテム効果の処理
 */

import type { MonsterInstance, ItemEffect, MoveResolver } from "@/types";

/** アイテム使用結果 */
export interface ItemUseResult {
  success: boolean;
  message: string;
  updatedMonster?: MonsterInstance;
}

/**
 * 瀕死（HP0）のモンスターに復活アイテムを使用する
 * @param monster 対象モンスター
 * @param hpPercent 復活後のHP割合（50=半分、100=全回復）
 * @param maxHp 最大HP
 */
export function useRevive(
  monster: MonsterInstance,
  hpPercent: number,
  maxHp: number,
): ItemUseResult {
  if (monster.currentHp > 0) {
    return { success: false, message: "瀕死ではないモンスターには使えない！" };
  }

  const recoveredHp = Math.max(1, Math.floor((maxHp * hpPercent) / 100));
  const updated: MonsterInstance = {
    ...monster,
    currentHp: Math.min(maxHp, recoveredHp),
    status: null,
  };

  return {
    success: true,
    message:
      hpPercent >= 100
        ? `${monster.nickname ?? "モンスター"}は元気を取り戻した！HPが全回復した！`
        : `${monster.nickname ?? "モンスター"}は元気を取り戻した！`,
    updatedMonster: updated,
  };
}

/**
 * HPを回復するアイテムを使用する
 * @param monster 対象モンスター
 * @param amount 回復量（負数の場合は最大HPの割合として処理: -25 = 25%回復）
 * @param maxHp 最大HP
 */
export function useHealHp(monster: MonsterInstance, amount: number, maxHp: number): ItemUseResult {
  if (monster.currentHp <= 0) {
    return { success: false, message: "瀕死のモンスターには使えない！" };
  }
  if (monster.currentHp >= maxHp) {
    return { success: false, message: "HPはすでに満タンだ！" };
  }

  const healAmount =
    amount < 0 ? Math.max(1, Math.floor((maxHp * Math.abs(amount)) / 100)) : amount;

  const newHp = Math.min(maxHp, monster.currentHp + healAmount);
  const actualHeal = newHp - monster.currentHp;

  return {
    success: true,
    message: `HPが${actualHeal}回復した！`,
    updatedMonster: { ...monster, currentHp: newHp },
  };
}

/**
 * PP回復アイテムを使用する
 * @param monster 対象モンスター
 * @param moveIndex 技のインデックス（-1で全技対象）
 * @param amount 回復量（9999以上で全回復）
 * @param moveResolver 技定義リゾルバ（maxPp取得用）
 */
export function useHealPp(
  monster: MonsterInstance,
  moveIndex: number,
  amount: number | "all",
  moveResolver: MoveResolver,
): ItemUseResult {
  if (monster.currentHp <= 0) {
    return { success: false, message: "瀕死のモンスターには使えない！" };
  }

  const moves = [...monster.moves];

  if (amount === "all") {
    // 全技PP全回復
    let anyRecovered = false;
    for (let i = 0; i < moves.length; i++) {
      const maxPp = moveResolver(moves[i].moveId).pp;
      if (moves[i].currentPp < maxPp) {
        moves[i] = { ...moves[i], currentPp: maxPp };
        anyRecovered = true;
      }
    }
    if (!anyRecovered) {
      return { success: false, message: "PPはすべて満タンだ！" };
    }
    return {
      success: true,
      message: "すべての技のPPが回復した！",
      updatedMonster: { ...monster, moves },
    };
  }

  // 単体技PP回復
  if (moveIndex < 0 || moveIndex >= moves.length) {
    return { success: false, message: "技が見つからない！" };
  }

  const move = moves[moveIndex];
  const maxPp = moveResolver(move.moveId).pp;
  if (move.currentPp >= maxPp) {
    return { success: false, message: `${move.moveId}のPPは満タンだ！` };
  }

  const healAmount = amount >= 9999 ? maxPp : amount;
  const newPp = Math.min(maxPp, move.currentPp + healAmount);
  moves[moveIndex] = { ...move, currentPp: newPp };

  return {
    success: true,
    message: `PPが${newPp - move.currentPp}回復した！`,
    updatedMonster: { ...monster, moves },
  };
}

/**
 * ふしぎなアメ（レベルアップ）が使用可能か判定
 */
export function canUseLevelUp(monster: MonsterInstance, maxLevel: number = 100): boolean {
  return monster.currentHp > 0 && monster.level < maxLevel;
}

/**
 * アイテム効果が対象モンスターに適用可能か判定する
 * @param maxHp 最大HP
 * @param moveResolver 技定義リゾルバ（PP判定用）
 */
export function canUseItem(
  effect: ItemEffect,
  monster: MonsterInstance,
  maxHp: number,
  moveResolver?: MoveResolver,
): boolean {
  switch (effect.type) {
    case "revive":
      return monster.currentHp <= 0;
    case "heal_hp":
      return monster.currentHp > 0 && monster.currentHp < maxHp;
    case "heal_status":
      if (monster.currentHp <= 0) return false;
      if (effect.status === "all") return monster.status !== null;
      return monster.status === effect.status;
    case "heal_pp": {
      if (monster.currentHp <= 0) return false;
      if (!moveResolver) return false;
      return monster.moves.some((m) => m.currentPp < moveResolver(m.moveId).pp);
    }
    case "level_up":
      return canUseLevelUp(monster);
    default:
      return false;
  }
}
