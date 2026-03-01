import { describe, it, expect } from "vitest";
import {
  calcExpGain,
  expForLevel,
  expProgressPercent,
  expToNextLevel,
  grantExp,
} from "../experience";
import type { MonsterInstance, MonsterSpecies } from "@/types";

function createSpecies(overrides?: Partial<MonsterSpecies>): MonsterSpecies {
  return {
    id: "test-monster",
    name: "テストモンスター",
    types: ["normal"],
    baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    baseExpYield: 80,
    expGroup: "medium_fast",
    learnset: [],
    ...overrides,
  };
}

function createMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    uid: "test-exp",
    speciesId: "test-monster",
    level: 50,
    exp: 125000, // expForLevel(50, "medium_fast") = 50^3 = 125000
    nature: "hardy",
    ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [],
    status: null,
    ...overrides,
  };
}

describe("calcExpGain", () => {
  it("野生バトル: (baseExpYield * level) / 7", () => {
    const species = createSpecies({ baseExpYield: 80 });
    const result = calcExpGain(species, 10, false);
    expect(result).toBe(Math.floor((80 * 10) / 7)); // 114
  });

  it("トレーナーバトル: 1.5倍ボーナス", () => {
    const species = createSpecies({ baseExpYield: 80 });
    const wild = calcExpGain(species, 10, false);
    const trainer = calcExpGain(species, 10, true);
    expect(trainer).toBe(Math.floor((80 * 10 * 1.5) / 7)); // 171
    expect(trainer).toBeGreaterThan(wild);
  });

  it("高レベル倒すほど経験値が多い", () => {
    const species = createSpecies({ baseExpYield: 80 });
    const low = calcExpGain(species, 5, false);
    const high = calcExpGain(species, 50, false);
    expect(high).toBeGreaterThan(low);
  });
});

describe("expForLevel", () => {
  it("medium_fast: n^3", () => {
    expect(expForLevel(10, "medium_fast")).toBe(1000);
    expect(expForLevel(50, "medium_fast")).toBe(125000);
    expect(expForLevel(100, "medium_fast")).toBe(1000000);
  });

  it("fast: 0.8 * n^3", () => {
    expect(expForLevel(10, "fast")).toBe(Math.floor(0.8 * 1000));
    expect(expForLevel(50, "fast")).toBe(Math.floor(0.8 * 125000));
  });

  it("medium_slow: 1.2n^3 - 15n^2 + 100n - 140", () => {
    const n = 10;
    const expected = Math.max(0, Math.floor(1.2 * n * n * n - 15 * n * n + 100 * n - 140));
    expect(expForLevel(10, "medium_slow")).toBe(expected);
  });

  it("slow: 1.25 * n^3", () => {
    expect(expForLevel(10, "slow")).toBe(Math.floor(1.25 * 1000));
    expect(expForLevel(50, "slow")).toBe(Math.floor(1.25 * 125000));
  });

  it("デフォルトは medium_fast", () => {
    expect(expForLevel(10)).toBe(expForLevel(10, "medium_fast"));
  });

  it("全グループで経験値はレベルとともに増加", () => {
    const groups = ["fast", "medium_fast", "medium_slow", "slow"] as const;
    for (const group of groups) {
      const low = expForLevel(10, group);
      const mid = expForLevel(50, group);
      const high = expForLevel(100, group);
      expect(mid).toBeGreaterThan(low);
      expect(high).toBeGreaterThan(mid);
    }
  });
});

describe("expProgressPercent", () => {
  it("レベル開始時は0%", () => {
    const exp = expForLevel(50, "medium_fast");
    expect(expProgressPercent(exp, 50, "medium_fast")).toBe(0);
  });

  it("Lv100では常に100%", () => {
    expect(expProgressPercent(0, 100, "medium_fast")).toBe(100);
  });

  it("中間の経験値で0〜100の範囲", () => {
    const current = expForLevel(50, "medium_fast");
    const next = expForLevel(51, "medium_fast");
    const midExp = current + Math.floor((next - current) / 2);
    const percent = expProgressPercent(midExp, 50, "medium_fast");
    expect(percent).toBeGreaterThan(0);
    expect(percent).toBeLessThan(100);
  });
});

describe("expToNextLevel", () => {
  it("レベル開始時は次レベルまでの全経験値", () => {
    const current = expForLevel(50, "medium_fast");
    const next = expForLevel(51, "medium_fast");
    expect(expToNextLevel(current, 50, "medium_fast")).toBe(next - current);
  });

  it("Lv100では0", () => {
    expect(expToNextLevel(999999, 100, "medium_fast")).toBe(0);
  });
});

describe("grantExp", () => {
  it("レベルアップなし: 経験値のみ増加", () => {
    const monster = createMonster({ level: 50, exp: 125000 });
    const result = grantExp(monster, 10, "medium_fast");
    expect(result.levelsGained).toBe(0);
    expect(result.newLevel).toBe(50);
    expect(monster.exp).toBe(125010);
  });

  it("1レベルアップ", () => {
    const monster = createMonster({ level: 50, exp: 125000 });
    const needed = expForLevel(51, "medium_fast") - 125000;
    const result = grantExp(monster, needed, "medium_fast");
    expect(result.levelsGained).toBe(1);
    expect(result.newLevel).toBe(51);
    expect(monster.level).toBe(51);
  });

  it("複数レベルアップ", () => {
    const monster = createMonster({ level: 10, exp: 1000 });
    const bigExp = expForLevel(15, "medium_fast") - 1000;
    const result = grantExp(monster, bigExp, "medium_fast");
    expect(result.levelsGained).toBe(5);
    expect(result.newLevel).toBe(15);
  });

  it("Lv100上限: 100を超えない", () => {
    const monster = createMonster({ level: 99, exp: expForLevel(99, "medium_fast") });
    const result = grantExp(monster, 999999, "medium_fast");
    expect(result.newLevel).toBe(100);
    expect(monster.level).toBe(100);
  });
});
