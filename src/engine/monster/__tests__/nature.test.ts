import { describe, it, expect } from "vitest";
import { ALL_NATURES, getNatureModifiers, randomNature } from "../nature";

describe("ALL_NATURES", () => {
  it("25種類の性格が定義されている", () => {
    expect(ALL_NATURES).toHaveLength(25);
  });

  it("重複がない", () => {
    const unique = new Set(ALL_NATURES);
    expect(unique.size).toBe(25);
  });
});

describe("getNatureModifiers", () => {
  const neutralNatures = ["hardy", "docile", "serious", "bashful", "quirky"] as const;
  it.each(neutralNatures)("無補正性格(%s): 全ステータス1.0", (nature) => {
    const mods = getNatureModifiers(nature);
    expect(mods.atk).toBe(1.0);
    expect(mods.def).toBe(1.0);
    expect(mods.spAtk).toBe(1.0);
    expect(mods.spDef).toBe(1.0);
    expect(mods.speed).toBe(1.0);
  });

  const upDownPairs = [
    ["lonely", "atk", "def"],
    ["brave", "atk", "speed"],
    ["adamant", "atk", "spAtk"],
    ["naughty", "atk", "spDef"],
    ["bold", "def", "atk"],
    ["relaxed", "def", "speed"],
    ["impish", "def", "spAtk"],
    ["lax", "def", "spDef"],
    ["timid", "speed", "atk"],
    ["hasty", "speed", "def"],
    ["jolly", "speed", "spAtk"],
    ["naive", "speed", "spDef"],
    ["modest", "spAtk", "atk"],
    ["mild", "spAtk", "def"],
    ["quiet", "spAtk", "speed"],
    ["rash", "spAtk", "spDef"],
    ["calm", "spDef", "atk"],
    ["gentle", "spDef", "def"],
    ["sassy", "spDef", "speed"],
    ["careful", "spDef", "spAtk"],
  ] as const;

  it.each(upDownPairs)("%s: %s↑(1.1), %s↓(0.9)", (nature, up, down) => {
    const mods = getNatureModifiers(nature);
    expect(mods[up]).toBe(1.1);
    expect(mods[down]).toBe(0.9);
    // 他のステータスは1.0
    const stats = ["atk", "def", "spAtk", "spDef", "speed"] as const;
    for (const stat of stats) {
      if (stat !== up && stat !== down) {
        expect(mods[stat]).toBe(1.0);
      }
    }
  });
});

describe("randomNature", () => {
  it("有効な性格IDを返す", () => {
    const nature = randomNature(() => 0.5);
    expect(ALL_NATURES).toContain(nature);
  });

  it("乱数に応じて異なる性格を返す", () => {
    const first = randomNature(() => 0);
    const last = randomNature(() => 0.99);
    expect(first).toBe(ALL_NATURES[0]);
    expect(last).toBe(ALL_NATURES[ALL_NATURES.length - 1]);
  });
});
