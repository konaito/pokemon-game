import type { StatusCondition, MonsterInstance } from "@/types";

/** 状態異常の効果定義 */
export interface StatusEffect {
  /** ターン開始時のダメージ（最大HP比） */
  turnDamageRatio: number;
  /** 行動不能になる確率 */
  immobilizeChance: number;
  /** 素早さへの影響倍率 */
  speedModifier: number;
  /** 攻撃力への影響倍率 */
  attackModifier: number;
}

const statusEffects: Record<StatusCondition, StatusEffect> = {
  poison: {
    turnDamageRatio: 1 / 8,
    immobilizeChance: 0,
    speedModifier: 1,
    attackModifier: 1,
  },
  burn: {
    turnDamageRatio: 1 / 16,
    immobilizeChance: 0,
    speedModifier: 1,
    attackModifier: 0.5,
  },
  paralysis: {
    turnDamageRatio: 0,
    immobilizeChance: 0.25,
    speedModifier: 0.5,
    attackModifier: 1,
  },
  sleep: {
    turnDamageRatio: 0,
    immobilizeChance: 1, // 眠りは確実に行動不能（起きる判定は別）
    speedModifier: 1,
    attackModifier: 1,
  },
  freeze: {
    turnDamageRatio: 0,
    immobilizeChance: 1, // 氷も確実に行動不能（解凍判定は別）
    speedModifier: 1,
    attackModifier: 1,
  },
};

/** 状態異常の効果を取得 */
export function getStatusEffect(status: StatusCondition): StatusEffect {
  return statusEffects[status];
}

/**
 * ターン開始時の状態異常ダメージを適用
 * @returns 適用後のHP
 */
export function applyStatusDamage(monster: MonsterInstance, maxHp: number): number {
  if (!monster.status) return monster.currentHp;
  const effect = getStatusEffect(monster.status);
  if (effect.turnDamageRatio === 0) return monster.currentHp;
  const damage = Math.max(1, Math.floor(maxHp * effect.turnDamageRatio));
  return Math.max(0, monster.currentHp - damage);
}

/**
 * 行動可能かチェック（眠り・氷の解除判定含む）
 * 解除に成功した場合、monster.status を null にクリアする
 * @returns true = 行動可能
 */
export function canAct(monster: MonsterInstance, random?: () => number): boolean {
  if (!monster.status) return true;
  const rng = random ?? Math.random;
  const effect = getStatusEffect(monster.status);

  // 眠り: 33%で起きる → 成功時にステータスクリア
  if (monster.status === "sleep") {
    if (rng() < 1 / 3) {
      monster.status = null;
      return true;
    }
    return false;
  }

  // 氷: 20%で解凍 → 成功時にステータスクリア
  if (monster.status === "freeze") {
    if (rng() < 0.2) {
      monster.status = null;
      return true;
    }
    return false;
  }

  // 麻痺: 25%で行動不能（ステータスは残る）
  if (effect.immobilizeChance > 0) {
    return rng() >= effect.immobilizeChance;
  }

  return true;
}
