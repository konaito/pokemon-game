import { describe, it, expect } from "vitest";
import {
  ALL_ABILITIES,
  getAbilityById,
  SPECIES_ABILITIES,
  getSpeciesAbilities,
} from "../abilities";
import type { AbilityTrigger } from "@/types";

const validTriggers: AbilityTrigger[] = [
  "on_damage_calc",
  "on_enter",
  "on_type_effectiveness",
  "on_stab",
];

describe("ALL_ABILITIES", () => {
  it("特性が定義されている", () => {
    expect(ALL_ABILITIES.length).toBeGreaterThan(0);
  });

  it("ID一意性", () => {
    const ids = ALL_ABILITIES.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it.each(ALL_ABILITIES.map((a) => [a.id, a]))("%s: 必須フィールドが存在する", (_id, ability) => {
    expect(ability.id).toBeTruthy();
    expect(ability.name).toBeTruthy();
    expect(ability.description).toBeTruthy();
    expect(ability.trigger).toBeTruthy();
  });

  it("全てのtrigger値が有効", () => {
    for (const ability of ALL_ABILITIES) {
      expect(validTriggers).toContain(ability.trigger);
    }
  });
});

describe("getAbilityById", () => {
  it("有効なIDで取得できる", () => {
    const ability = getAbilityById("blaze");
    expect(ability).toBeDefined();
    expect(ability!.name).toBe("もうか");
  });

  it("無効なIDでundefined", () => {
    expect(getAbilityById("nonexistent")).toBeUndefined();
  });
});

describe("SPECIES_ABILITIES", () => {
  it("全てのマッピングされた特性IDが有効", () => {
    const validIds = new Set(ALL_ABILITIES.map((a) => a.id));
    for (const [speciesId, abilityIds] of Object.entries(SPECIES_ABILITIES)) {
      for (const abilityId of abilityIds) {
        expect(validIds.has(abilityId)).toBe(true);
      }
    }
  });

  it("各種族に最低1つの特性がある", () => {
    for (const [speciesId, abilityIds] of Object.entries(SPECIES_ABILITIES)) {
      expect(abilityIds.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("getSpeciesAbilities", () => {
  it("登録済み種族の特性を返す", () => {
    const abilities = getSpeciesAbilities("himori");
    expect(abilities).toContain("blaze");
  });

  it("未登録種族は空配列を返す", () => {
    expect(getSpeciesAbilities("nonexistent")).toEqual([]);
  });
});
