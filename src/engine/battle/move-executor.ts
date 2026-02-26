import type {
  MonsterInstance,
  MonsterSpecies,
  MoveDefinition,
  StatusCondition,
  BaseStats,
} from "@/types";
import { calculateDamage, type DamageResult } from "./damage";
import { canAct } from "./status";
import type { StatStages } from "./stat-stage";

/** 技実行の結果 */
export interface MoveExecutionResult {
  hit: boolean;
  damage: DamageResult | null;
  defenderHpAfter: number;
  statusApplied: StatusCondition | null;
  /** 能力変化（自身 or 相手に適用） */
  statChanges?: {
    target: "self" | "opponent";
    changes: Partial<Record<keyof BaseStats, number>>;
  };
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
  attackerStages?: StatStages,
  defenderStages?: StatStages,
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

  // PP確認 & 消費
  const moveInstance = attacker.moves.find((m) => m.moveId === move.id);
  if (moveInstance) {
    if (moveInstance.currentPp <= 0) {
      messages.push("しかし技のPPが足りない！");
      return {
        hit: false,
        damage: null,
        defenderHpAfter: defender.currentHp,
        statusApplied: null,
        messages,
      };
    }
    moveInstance.currentPp--;
  }

  messages.push(`${attackerSpecies.name}の${move.name}！`);

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

  // 3. ステータス技の処理（ダメージなし、効果のみ）
  if (move.category === "status") {
    let statusApplied: StatusCondition | null = null;
    let statChangeResult: MoveExecutionResult["statChanges"] | undefined;
    let hadEffect = false;

    // 状態異常付与
    if (move.effect?.statusCondition && defender.status === null) {
      const chance = move.effect.statusChance ?? 100;
      if (rng() * 100 < chance) {
        statusApplied = move.effect.statusCondition;
        messages.push(`${defenderSpecies.name}は${getStatusMessage(statusApplied)}`);
        hadEffect = true;
      }
    }

    // 能力変化
    if (move.effect?.statChanges) {
      const isDebuff = Object.values(move.effect.statChanges).some((v) => v !== undefined && v < 0);
      statChangeResult = {
        target: isDebuff ? "opponent" : "self",
        changes: move.effect.statChanges,
      };
      hadEffect = true;
    }

    if (!hadEffect) {
      messages.push("しかし効果がなかった！");
    }

    return {
      hit: true,
      damage: null,
      defenderHpAfter: defender.currentHp,
      statusApplied,
      statChanges: statChangeResult,
      messages,
    };
  }

  // 4. ダメージ計算
  const damageResult = calculateDamage({
    attacker,
    attackerSpecies,
    defender,
    defenderSpecies,
    move,
    attackerStages,
    defenderStages,
    random: () => rng(),
  });

  // 5. HP更新
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

  // 6. 追加効果（状態異常付与 — ダメージ技の追加効果）
  let statusApplied: StatusCondition | null = null;
  if (
    move.effect?.statusCondition &&
    move.effect.statusChance !== undefined &&
    defender.status === null &&
    defenderHpAfter > 0
  ) {
    if (rng() * 100 < move.effect.statusChance) {
      statusApplied = move.effect.statusCondition;
      messages.push(`${defenderSpecies.name}は${getStatusMessage(statusApplied)}`);
    }
  }

  // 7. 追加効果（能力変化 — ダメージ技の追加効果）
  let statChangeResult: MoveExecutionResult["statChanges"] | undefined;
  if (move.effect?.statChanges && defenderHpAfter > 0) {
    const isDebuff = Object.values(move.effect.statChanges).some((v) => v !== undefined && v < 0);
    statChangeResult = {
      target: isDebuff ? "opponent" : "self",
      changes: move.effect.statChanges,
    };
  }

  return {
    hit: true,
    damage: damageResult,
    defenderHpAfter,
    statusApplied,
    statChanges: statChangeResult,
    messages,
  };
}

/**
 * わるあがき（Struggle）の実行
 * PP全消費時に使用される。タイプレスでダメージを与え、最大HPの1/4の反動ダメージを受ける。
 */
export function executeStruggle(
  attacker: MonsterInstance,
  attackerSpecies: MonsterSpecies,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  maxHp: number,
  random?: () => number,
): MoveExecutionResult {
  const rng = random ?? Math.random;
  const messages: string[] = [];

  // 行動可能判定
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

  messages.push(`${attackerSpecies.name}のわるあがき！`);

  // 固定ダメージ: レベルベースの簡易計算
  const damage = Math.max(1, Math.floor(attacker.level * 2));
  const defenderHpAfter = Math.max(0, defender.currentHp - damage);

  // 反動ダメージ: 最大HPの1/4
  const recoilDamage = Math.max(1, Math.floor(maxHp / 4));
  attacker.currentHp = Math.max(0, attacker.currentHp - recoilDamage);
  messages.push(`${attackerSpecies.name}は反動でダメージを受けた！`);

  return {
    hit: true,
    damage: { damage, effectiveness: 1, isCritical: false, isStab: false },
    defenderHpAfter,
    statusApplied: null,
    messages,
  };
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
