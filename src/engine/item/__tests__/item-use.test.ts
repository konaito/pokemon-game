import { describe, it, expect } from "vitest";
import { useRevive, useHealHp, useHealPp, canUseLevelUp, canUseItem } from "../item-use";
import type { MonsterInstance } from "@/types";

/** テスト用モンスター生成 */
function createTestMonster(overrides: Partial<MonsterInstance> = {}): MonsterInstance {
  return {
    uid: "test-001",
    speciesId: "himori",
    nickname: "テスト",
    level: 25,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 15, attack: 15, defense: 15, spAttack: 15, spDefense: 15, speed: 15 },
    evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    currentHp: 80,
    maxHp: 80,
    status: null,
    moves: [
      { moveId: "tackle", currentPp: 35, maxPp: 35 },
      { moveId: "ember", currentPp: 20, maxPp: 25 },
    ],
    ...overrides,
  } as MonsterInstance;
}

describe("useRevive", () => {
  it("瀕死モンスターをHP半分で復活させる", () => {
    const monster = createTestMonster({ currentHp: 0 });
    const result = useRevive(monster, 50);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.currentHp).toBe(40); // 80 * 50% = 40
    expect(result.updatedMonster!.status).toBeNull();
  });

  it("瀕死モンスターをHP全回復で復活させる", () => {
    const monster = createTestMonster({ currentHp: 0 });
    const result = useRevive(monster, 100);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.currentHp).toBe(80);
    expect(result.message).toContain("全回復");
  });

  it("瀕死でないモンスターには使えない", () => {
    const monster = createTestMonster({ currentHp: 50 });
    const result = useRevive(monster, 50);
    expect(result.success).toBe(false);
    expect(result.message).toContain("瀕死ではない");
  });

  it("復活時に状態異常がクリアされる", () => {
    const monster = createTestMonster({ currentHp: 0, status: "poison" });
    const result = useRevive(monster, 50);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.status).toBeNull();
  });

  it("HP1のモンスターでも最低1は回復する", () => {
    const monster = createTestMonster({ currentHp: 0, maxHp: 1 });
    const result = useRevive(monster, 50);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.currentHp).toBe(1);
  });
});

describe("useHealHp", () => {
  it("HP回復アイテムを使用できる", () => {
    const monster = createTestMonster({ currentHp: 30, maxHp: 80 });
    const result = useHealHp(monster, 20);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.currentHp).toBe(50);
    expect(result.message).toContain("20回復");
  });

  it("HPが最大HPを超えない", () => {
    const monster = createTestMonster({ currentHp: 70, maxHp: 80 });
    const result = useHealHp(monster, 50);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.currentHp).toBe(80);
    expect(result.message).toContain("10回復");
  });

  it("瀕死モンスターには使えない", () => {
    const monster = createTestMonster({ currentHp: 0 });
    const result = useHealHp(monster, 20);
    expect(result.success).toBe(false);
  });

  it("HP満タン時は使えない", () => {
    const monster = createTestMonster({ currentHp: 80, maxHp: 80 });
    const result = useHealHp(monster, 20);
    expect(result.success).toBe(false);
    expect(result.message).toContain("満タン");
  });

  it("負数amountは割合回復として処理される（-25 = 25%回復）", () => {
    const monster = createTestMonster({ currentHp: 40, maxHp: 80 });
    const result = useHealHp(monster, -25);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.currentHp).toBe(60); // 40 + 20 (80*25%)
  });
});

describe("useHealPp", () => {
  it("単体技のPPを回復する", () => {
    const monster = createTestMonster();
    // ember: currentPp 20, maxPp 25
    const result = useHealPp(monster, 1, 10);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.moves[1].currentPp).toBe(25); // 20+10=30→上限25
  });

  it("単体技のPPを全回復する（amount=9999）", () => {
    const monster = createTestMonster({
      moves: [
        { moveId: "tackle", currentPp: 5, maxPp: 35 },
        { moveId: "ember", currentPp: 10, maxPp: 25 },
      ],
    });
    const result = useHealPp(monster, 0, 9999);
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.moves[0].currentPp).toBe(35);
    expect(result.updatedMonster!.moves[1].currentPp).toBe(10); // 他の技は変わらない
  });

  it("全技PP全回復（amount='all'）", () => {
    const monster = createTestMonster({
      moves: [
        { moveId: "tackle", currentPp: 5, maxPp: 35 },
        { moveId: "ember", currentPp: 10, maxPp: 25 },
      ],
    });
    const result = useHealPp(monster, -1, "all");
    expect(result.success).toBe(true);
    expect(result.updatedMonster!.moves[0].currentPp).toBe(35);
    expect(result.updatedMonster!.moves[1].currentPp).toBe(25);
  });

  it("PP全部満タンなら使えない", () => {
    const monster = createTestMonster({
      moves: [
        { moveId: "tackle", currentPp: 35, maxPp: 35 },
        { moveId: "ember", currentPp: 25, maxPp: 25 },
      ],
    });
    const result = useHealPp(monster, -1, "all");
    expect(result.success).toBe(false);
    expect(result.message).toContain("満タン");
  });

  it("瀕死モンスターには使えない", () => {
    const monster = createTestMonster({ currentHp: 0 });
    const result = useHealPp(monster, 0, 10);
    expect(result.success).toBe(false);
  });

  it("無効な技インデックスでは使えない", () => {
    const monster = createTestMonster();
    const result = useHealPp(monster, 5, 10);
    expect(result.success).toBe(false);
  });
});

describe("canUseLevelUp", () => {
  it("通常のモンスターにはtrue", () => {
    const monster = createTestMonster({ currentHp: 50, level: 25 });
    expect(canUseLevelUp(monster)).toBe(true);
  });

  it("瀕死モンスターにはfalse", () => {
    const monster = createTestMonster({ currentHp: 0, level: 25 });
    expect(canUseLevelUp(monster)).toBe(false);
  });

  it("最大レベルにはfalse", () => {
    const monster = createTestMonster({ currentHp: 50, level: 100 });
    expect(canUseLevelUp(monster)).toBe(false);
  });
});

describe("canUseItem", () => {
  it("reviveは瀕死のみ", () => {
    const fainted = createTestMonster({ currentHp: 0 });
    const alive = createTestMonster({ currentHp: 50 });
    expect(canUseItem({ type: "revive", hpPercent: 50 }, fainted)).toBe(true);
    expect(canUseItem({ type: "revive", hpPercent: 50 }, alive)).toBe(false);
  });

  it("heal_hpは生存中でHP未満", () => {
    const full = createTestMonster({ currentHp: 80, maxHp: 80 });
    const damaged = createTestMonster({ currentHp: 30, maxHp: 80 });
    const fainted = createTestMonster({ currentHp: 0 });
    expect(canUseItem({ type: "heal_hp", amount: 20 }, full)).toBe(false);
    expect(canUseItem({ type: "heal_hp", amount: 20 }, damaged)).toBe(true);
    expect(canUseItem({ type: "heal_hp", amount: 20 }, fainted)).toBe(false);
  });

  it("heal_statusは該当状態のみ", () => {
    const poisoned = createTestMonster({ status: "poison" });
    const healthy = createTestMonster({ status: null });
    expect(canUseItem({ type: "heal_status", status: "poison" }, poisoned)).toBe(true);
    expect(canUseItem({ type: "heal_status", status: "poison" }, healthy)).toBe(false);
    expect(canUseItem({ type: "heal_status", status: "all" }, poisoned)).toBe(true);
    expect(canUseItem({ type: "heal_status", status: "all" }, healthy)).toBe(false);
  });

  it("level_upは生存中かつレベル未満", () => {
    const normal = createTestMonster({ currentHp: 50, level: 25 });
    const maxLevel = createTestMonster({ currentHp: 50, level: 100 });
    const fainted = createTestMonster({ currentHp: 0, level: 25 });
    expect(canUseItem({ type: "level_up" }, normal)).toBe(true);
    expect(canUseItem({ type: "level_up" }, maxLevel)).toBe(false);
    expect(canUseItem({ type: "level_up" }, fainted)).toBe(false);
  });

  it("noneは常にfalse", () => {
    expect(canUseItem({ type: "none" }, createTestMonster())).toBe(false);
  });
});
