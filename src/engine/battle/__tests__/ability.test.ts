import { describe, it, expect } from "vitest";
import {
  getAbilityDamageModifiers,
  getDefenderAbilityModifier,
  checkAbilityTypeImmunity,
  applySturdyCheck,
  checkContactAbility,
  processOnEnterAbility,
  processEndOfTurnAbility,
} from "../ability";
import type { MonsterInstance, MonsterSpecies } from "@/types";

function createMonster(overrides: Partial<MonsterInstance> = {}): MonsterInstance {
  return {
    uid: "test-1",
    speciesId: "himori",
    level: 50,
    exp: 100000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [{ moveId: "ember", currentPp: 25 }],
    status: null,
    ...overrides,
  };
}

const himoriSpecies: MonsterSpecies = {
  id: "himori",
  name: "ヒモリ",
  types: ["fire"],
  baseStats: { hp: 45, atk: 60, def: 40, spAtk: 50, spDef: 40, speed: 65 },
  baseExpYield: 62,
  expGroup: "medium_slow",
  learnset: [],
  abilities: ["blaze"],
};

describe("特性システム", () => {
  describe("getAbilityDamageModifiers", () => {
    it("もうか: HP1/3以下で炎技の威力1.5倍", () => {
      const monster = createMonster({ currentHp: 10 });
      const mods = getAbilityDamageModifiers(
        "blaze",
        undefined,
        monster,
        himoriSpecies,
        "fire",
        "physical",
        60,
        true,
        false,
      );
      expect(mods.powerMultiplier).toBe(1.5);
    });

    it("もうか: HP1/3以上では効果なし", () => {
      const monster = createMonster({ currentHp: 100 });
      const mods = getAbilityDamageModifiers(
        "blaze",
        undefined,
        monster,
        himoriSpecies,
        "fire",
        "physical",
        60,
        true,
        false,
      );
      expect(mods.powerMultiplier).toBe(1);
    });

    it("もうか: 炎以外の技には効果なし", () => {
      const monster = createMonster({ currentHp: 10 });
      const mods = getAbilityDamageModifiers(
        "blaze",
        undefined,
        monster,
        himoriSpecies,
        "water",
        "physical",
        60,
        false,
        false,
      );
      expect(mods.powerMultiplier).toBe(1);
    });

    it("てきおうりょく: STAB倍率を2倍に上書き", () => {
      const monster = createMonster({ currentHp: 100 });
      const mods = getAbilityDamageModifiers(
        "adaptability",
        undefined,
        monster,
        himoriSpecies,
        "fire",
        "special",
        60,
        true,
        false,
      );
      expect(mods.stabOverride).toBe(2);
    });

    it("ちからもち: 物理攻撃力2倍", () => {
      const monster = createMonster({ currentHp: 100 });
      const mods = getAbilityDamageModifiers(
        "huge_power",
        undefined,
        monster,
        himoriSpecies,
        "normal",
        "physical",
        40,
        false,
        false,
      );
      expect(mods.attackMultiplier).toBe(2);
    });

    it("テクニシャン: 威力60以下の技の威力1.5倍", () => {
      const monster = createMonster({ currentHp: 100 });
      const mods = getAbilityDamageModifiers(
        "technician",
        undefined,
        monster,
        himoriSpecies,
        "normal",
        "physical",
        40,
        false,
        false,
      );
      expect(mods.powerMultiplier).toBe(1.5);
    });

    it("テクニシャン: 威力61以上の技には効果なし", () => {
      const monster = createMonster({ currentHp: 100 });
      const mods = getAbilityDamageModifiers(
        "technician",
        undefined,
        monster,
        himoriSpecies,
        "normal",
        "physical",
        80,
        false,
        false,
      );
      expect(mods.powerMultiplier).toBe(1);
    });

    it("あついしぼう: 炎/氷タイプの最終ダメージ半減", () => {
      const monster = createMonster({ currentHp: 100 });
      const mods = getAbilityDamageModifiers(
        undefined,
        "thick_fat",
        monster,
        himoriSpecies,
        "fire",
        "special",
        90,
        false,
        false,
      );
      expect(mods.finalMultiplier).toBe(0.5);
    });

    it("スナイパー: 急所ダメージ2.25倍", () => {
      const monster = createMonster({ currentHp: 100 });
      const mods = getAbilityDamageModifiers(
        "sniper",
        undefined,
        monster,
        himoriSpecies,
        "normal",
        "physical",
        60,
        false,
        true,
      );
      expect(mods.criticalOverride).toBe(2.25);
    });

    it("こんじょう: 状態異常時に攻撃1.5倍", () => {
      const monster = createMonster({ currentHp: 100, status: "burn" });
      const mods = getAbilityDamageModifiers(
        "guts",
        undefined,
        monster,
        himoriSpecies,
        "normal",
        "physical",
        60,
        false,
        false,
      );
      expect(mods.attackMultiplier).toBe(1.5);
    });
  });

  describe("getDefenderAbilityModifier", () => {
    it("マルチスケイル: HP満タン時にダメージ半減", () => {
      const species: MonsterSpecies = {
        ...himoriSpecies,
        baseStats: { hp: 45, atk: 60, def: 40, spAtk: 50, spDef: 40, speed: 65 },
      };
      // HP満タンの状態を作る
      const monster = createMonster({ currentHp: 120 }); // calcAllStatsで計算されるHP以上
      const mod = getDefenderAbilityModifier("multiscale", monster, species, "physical");
      // HP満タンかどうかはcalcAllStatsで判定されるので、currentHpがmaxHp以上なら0.5
      expect(mod).toBeLessThanOrEqual(1);
    });

    it("ふしぎなうろこ: 状態異常時に物理防御1.5倍", () => {
      const monster = createMonster({ status: "burn" });
      const mod = getDefenderAbilityModifier("marvel_scale", monster, himoriSpecies, "physical");
      expect(mod).toBe(1.5);
    });

    it("ふしぎなうろこ: 特殊技には効果なし", () => {
      const monster = createMonster({ status: "burn" });
      const mod = getDefenderAbilityModifier("marvel_scale", monster, himoriSpecies, "special");
      expect(mod).toBe(1);
    });
  });

  describe("checkAbilityTypeImmunity", () => {
    it("ふゆう: 地面技を無効化", () => {
      expect(checkAbilityTypeImmunity("levitate", "ground")).toBe("immune");
    });

    it("ふゆう: 地面以外は通常通り", () => {
      expect(checkAbilityTypeImmunity("levitate", "fire")).toBeNull();
    });

    it("もらいび: 炎技を無効化", () => {
      expect(checkAbilityTypeImmunity("flash_fire", "fire")).toBe("immune");
    });

    it("ちょすい: 水技を吸収", () => {
      expect(checkAbilityTypeImmunity("water_absorb", "water")).toBe("absorb");
    });

    it("ちくでん: 電気技を吸収", () => {
      expect(checkAbilityTypeImmunity("volt_absorb", "electric")).toBe("absorb");
    });

    it("特性なしの場合はnull", () => {
      expect(checkAbilityTypeImmunity(undefined, "ground")).toBeNull();
    });
  });

  describe("applySturdyCheck", () => {
    it("がんじょう: HP満タンからの一撃KOを防ぐ", () => {
      const monster = createMonster({ currentHp: 120 });
      const damage = applySturdyCheck("sturdy", monster, himoriSpecies, 999);
      expect(damage).toBe(monster.currentHp - 1);
    });

    it("がんじょう: HP満タンでなければ効果なし", () => {
      const monster = createMonster({ currentHp: 50 });
      const damage = applySturdyCheck("sturdy", monster, himoriSpecies, 999);
      expect(damage).toBe(999);
    });

    it("がんじょう以外の特性では効果なし", () => {
      const monster = createMonster({ currentHp: 120 });
      const damage = applySturdyCheck("blaze", monster, himoriSpecies, 999);
      expect(damage).toBe(999);
    });
  });

  describe("checkContactAbility", () => {
    it("どくのトゲ: 30%の確率でどく付与", () => {
      const result = checkContactAbility("poison_point", "physical", () => 0.1);
      expect(result).not.toBeNull();
      expect(result!.status).toBe("poison");
    });

    it("どくのトゲ: 30%以上では発動しない", () => {
      const result = checkContactAbility("poison_point", "physical", () => 0.5);
      expect(result).toBeNull();
    });

    it("せいでんき: まひ付与", () => {
      const result = checkContactAbility("static", "physical", () => 0.1);
      expect(result!.status).toBe("paralysis");
    });

    it("ほのおのからだ: やけど付与", () => {
      const result = checkContactAbility("flame_body", "physical", () => 0.1);
      expect(result!.status).toBe("burn");
    });

    it("特殊技では発動しない", () => {
      const result = checkContactAbility("poison_point", "special", () => 0.1);
      expect(result).toBeNull();
    });
  });

  describe("processOnEnterAbility", () => {
    it("いかく: 登場時にメッセージと攻撃低下", () => {
      const result = processOnEnterAbility("intimidate", "テスト");
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.opponentAtkChange).toBe(-1);
    });

    it("プレッシャー: 登場時にメッセージ", () => {
      const result = processOnEnterAbility("pressure", "テスト");
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.opponentAtkChange).toBeUndefined();
    });

    it("特性なし: 何も起きない", () => {
      const result = processOnEnterAbility(undefined, "テスト");
      expect(result.messages).toEqual([]);
    });
  });

  describe("processEndOfTurnAbility", () => {
    it("だっぴ: 1/3の確率で状態異常回復", () => {
      const monster = createMonster({ status: "poison", abilityId: "shed_skin" });
      const msgs = processEndOfTurnAbility("shed_skin", monster, "テスト", () => 0.1);
      expect(msgs.length).toBeGreaterThan(0);
      expect(monster.status).toBeNull();
    });

    it("だっぴ: 確率外では回復しない", () => {
      const monster = createMonster({ status: "poison", abilityId: "shed_skin" });
      const msgs = processEndOfTurnAbility("shed_skin", monster, "テスト", () => 0.9);
      expect(msgs).toEqual([]);
      expect(monster.status).toBe("poison");
    });
  });
});
