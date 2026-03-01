import { describe, it, expect } from "vitest";
import { getStatusEffect, applyStatusDamage, canAct } from "../status";
import type { MonsterInstance } from "@/types";

function createMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    uid: "test-status",
    speciesId: "test-monster",
    level: 50,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [],
    status: null,
    ...overrides,
  };
}

describe("getStatusEffect", () => {
  it("毒: 1/8ダメージ、行動制限なし", () => {
    const effect = getStatusEffect("poison");
    expect(effect.turnDamageRatio).toBe(1 / 8);
    expect(effect.immobilizeChance).toBe(0);
    expect(effect.speedModifier).toBe(1);
    expect(effect.attackModifier).toBe(1);
  });

  it("火傷: 1/16ダメージ、攻撃半減", () => {
    const effect = getStatusEffect("burn");
    expect(effect.turnDamageRatio).toBe(1 / 16);
    expect(effect.immobilizeChance).toBe(0);
    expect(effect.attackModifier).toBe(0.5);
  });

  it("麻痺: ダメージなし、25%行動不能、素早さ半減", () => {
    const effect = getStatusEffect("paralysis");
    expect(effect.turnDamageRatio).toBe(0);
    expect(effect.immobilizeChance).toBe(0.25);
    expect(effect.speedModifier).toBe(0.5);
  });

  it("眠り: 確実行動不能（解除判定は別）", () => {
    const effect = getStatusEffect("sleep");
    expect(effect.immobilizeChance).toBe(1);
    expect(effect.turnDamageRatio).toBe(0);
  });

  it("氷: 確実行動不能（解凍判定は別）", () => {
    const effect = getStatusEffect("freeze");
    expect(effect.immobilizeChance).toBe(1);
    expect(effect.turnDamageRatio).toBe(0);
  });
});

describe("applyStatusDamage", () => {
  it("状態異常なし: HPそのまま", () => {
    const monster = createMonster({ currentHp: 100, status: null });
    expect(applyStatusDamage(monster, 200)).toBe(100);
  });

  it("毒: 最大HPの1/8ダメージ（maxHp=200→25ダメージ）", () => {
    const monster = createMonster({ currentHp: 100, status: "poison" });
    expect(applyStatusDamage(monster, 200)).toBe(75);
  });

  it("火傷: 最大HPの1/16ダメージ（maxHp=200→12ダメージ）", () => {
    const monster = createMonster({ currentHp: 100, status: "burn" });
    expect(applyStatusDamage(monster, 200)).toBe(88);
  });

  it("麻痺: ダメージなし", () => {
    const monster = createMonster({ currentHp: 100, status: "paralysis" });
    expect(applyStatusDamage(monster, 200)).toBe(100);
  });

  it("眠り: ダメージなし", () => {
    const monster = createMonster({ currentHp: 100, status: "sleep" });
    expect(applyStatusDamage(monster, 200)).toBe(100);
  });

  it("氷: ダメージなし", () => {
    const monster = createMonster({ currentHp: 100, status: "freeze" });
    expect(applyStatusDamage(monster, 200)).toBe(100);
  });

  it("HPが0未満にならない", () => {
    const monster = createMonster({ currentHp: 1, status: "poison" });
    expect(applyStatusDamage(monster, 200)).toBe(0);
  });

  it("ダメージは最低1", () => {
    const monster = createMonster({ currentHp: 50, status: "poison" });
    // maxHp=7 → floor(7/8)=0 → max(1,0)=1
    expect(applyStatusDamage(monster, 7)).toBe(49);
  });
});

describe("canAct", () => {
  it("状態異常なし: 常に行動可能", () => {
    const monster = createMonster({ status: null });
    expect(canAct(monster)).toBe(true);
  });

  it("毒: 常に行動可能", () => {
    const monster = createMonster({ status: "poison" });
    expect(canAct(monster)).toBe(true);
  });

  it("火傷: 常に行動可能", () => {
    const monster = createMonster({ status: "burn" });
    expect(canAct(monster)).toBe(true);
  });

  it("麻痺: 乱数 < 0.25 で行動不能", () => {
    const monster = createMonster({ status: "paralysis" });
    // rng() = 0.1 < 0.25 → 行動不能
    expect(canAct(monster, () => 0.1)).toBe(false);
    expect(monster.status).toBe("paralysis"); // ステータス残る
  });

  it("麻痺: 乱数 >= 0.25 で行動可能", () => {
    const monster = createMonster({ status: "paralysis" });
    expect(canAct(monster, () => 0.5)).toBe(true);
    expect(monster.status).toBe("paralysis"); // ステータス残る
  });

  it("眠り: 乱数 < 1/3 で起きる（ステータスクリア）", () => {
    const monster = createMonster({ status: "sleep" });
    expect(canAct(monster, () => 0.1)).toBe(true);
    expect(monster.status).toBeNull();
  });

  it("眠り: 乱数 >= 1/3 で行動不能", () => {
    const monster = createMonster({ status: "sleep" });
    expect(canAct(monster, () => 0.5)).toBe(false);
    expect(monster.status).toBe("sleep");
  });

  it("氷: 乱数 < 0.2 で解凍（ステータスクリア）", () => {
    const monster = createMonster({ status: "freeze" });
    expect(canAct(monster, () => 0.1)).toBe(true);
    expect(monster.status).toBeNull();
  });

  it("氷: 乱数 >= 0.2 で行動不能", () => {
    const monster = createMonster({ status: "freeze" });
    expect(canAct(monster, () => 0.5)).toBe(false);
    expect(monster.status).toBe("freeze");
  });
});
