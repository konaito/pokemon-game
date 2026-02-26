import type { MonsterInstance, MonsterSpecies, MoveDefinition, StatusCondition } from "@/types";
import { calculateDamage, type DamageResult } from "./damage";
import { canAct } from "./status";

/** 技実行の結果 */
export interface MoveExecutionResult {
  hit: boolean;
  damage: DamageResult | null;
  defenderHpAfter: number;
  statusApplied: StatusCondition | null;
  messages: string[];
}

/**
 * 技の実行フロー:
 * 1. 行動可能判定（状態異常チェック）
 * 2. 命中判定
 * 3. ダメージ計算
 * 4. 追加効果（状態異常付与）
 * 5. HP更新
 */
export function executeMove(
  attacker: MonsterInstance,
  attackerSpecies: MonsterSpecies,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  move: MoveDefinition,
  random?: () => number,
): MoveExecutionResult {
  const rng = random ?? Math.random;
  const messages: string[] = [];

  // 1. 行動可能判定
  if (!canAct(attacker, () => rng())) {
    if (attacker.status === "sleep") {
      messages.push(`${attackerSpecies.name}はぐうぐう眠っている！`);
    } else if (attacker.status === "freeze") {
      messages.push(`${attackerSpecies.name}は凍って動けない！`);
    } else if (attacker.status === "paralysis") {
      messages.push(`${attackerSpecies.name}は痺れて動けない！`);
    }
    return {
      hit: false,
      damage: null,
      defenderHpAfter: defender.currentHp,
      statusApplied: null,
      messages,
    };
  }

  messages.push(`${attackerSpecies.name}の${move.name}！`);

  // PP消費
  const moveInstance = attacker.moves.find((m) => m.moveId === move.id);
  if (moveInstance && moveInstance.currentPp > 0) {
    moveInstance.currentPp--;
  }

  // 2. 命中判定
  const hitRoll = rng() * 100;
  if (hitRoll >= move.accuracy) {
    messages.push("しかし攻撃は外れた！");
    return {
      hit: false,
      damage: null,
      defenderHpAfter: defender.currentHp,
      statusApplied: null,
      messages,
    };
  }

  // 3. ダメージ計算
  const damageResult = calculateDamage({
    attacker,
    attackerSpecies,
    defender,
    defenderSpecies,
    move,
    random: () => rng(),
  });

  // 4. HP更新
  const defenderHpAfter = Math.max(0, defender.currentHp - damageResult.damage);

  // メッセージ生成
  if (damageResult.effectiveness > 1) {
    messages.push("効果は抜群だ！");
  } else if (damageResult.effectiveness > 0 && damageResult.effectiveness < 1) {
    messages.push("効果はいまひとつのようだ...");
  } else if (damageResult.effectiveness === 0) {
    messages.push("効果がないようだ...");
  }

  if (damageResult.isCritical) {
    messages.push("急所に当たった！");
  }

  // 5. 追加効果（状態異常付与）
  let statusApplied: StatusCondition | null = null;
  if (
    move.effect?.statusCondition &&
    move.effect.statusChance &&
    defender.status === null &&
    defenderHpAfter > 0
  ) {
    if (rng() * 100 < move.effect.statusChance) {
      statusApplied = move.effect.statusCondition;
      messages.push(`${defenderSpecies.name}は${getStatusMessage(statusApplied)}`);
    }
  }

  return { hit: true, damage: damageResult, defenderHpAfter, statusApplied, messages };
}

function getStatusMessage(status: StatusCondition): string {
  switch (status) {
    case "poison":
      return "毒を受けた！";
    case "burn":
      return "やけどを負った！";
    case "paralysis":
      return "痺れて動けなくなった！";
    case "sleep":
      return "眠りに落ちた！";
    case "freeze":
      return "凍りついた！";
  }
}
