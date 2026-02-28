import { describe, it, expect } from "vitest";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";
import {
  getMonsterAbility,
  getAbilityDamageMultiplier,
  getAbilityDefenseMultiplier,
  doesAbilityBlockMove,
  getAbilityStabMultiplier,
  sturdyCheck,
  getOnEnterMessages,
} from "../ability";
import {
  ALL_ABILITIES,
  getAbilityById,
  getSpeciesAbilities,
  SPECIES_ABILITIES,
} from "@/data/abilities";

// ── テスト用ヘルパー ──

function makeSpecies(overrides: Partial<MonsterSpecies> = {}): MonsterSpecies {
  return {
    id: "test_species",
    name: "テスト",
    types: ["fire"],
    baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    baseExpYield: 100,
    expGroup: "medium_fast",
    learnset: [],
    ...overrides,
  };
}

function makeMonster(overrides: Partial<MonsterInstance> = {}): MonsterInstance {
  return {
    uid: "test-1",
    speciesId: "test_species",
    level: 50,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
    ...overrides,
  };
}

function makeMove(overrides: Partial<MoveDefinition> = {}): MoveDefinition {
  return {
    id: "test_move",
    name: "テスト技",
    type: "fire",
    category: "physical",
    power: 80,
    accuracy: 100,
    pp: 15,
    priority: 0,
    ...overrides,
  };
}

// ── 特性データテスト ──

describe("特性マスターデータ", () => {
  it("30個の特性が定義されている", () => {
    expect(ALL_ABILITIES.length).toBe(30);
  });

  it("全特性にユニークなIDがある", () => {
    const ids = ALL_ABILITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getAbilityByIdで特性を取得できる", () => {
    const blaze = getAbilityById("blaze");
    expect(blaze).toBeDefined();
    expect(blaze!.name).toBe("もうか");
  });

  it("存在しないIDはundefined", () => {
    expect(getAbilityById("nonexistent")).toBeUndefined();
  });
});

describe("種族→特性マッピング", () => {
  it("全50種族に特性が割り当てられている", () => {
    expect(Object.keys(SPECIES_ABILITIES).length).toBe(50);
  });

  it("各種族に少なくとも1つの特性がある", () => {
    for (const [speciesId, abilities] of Object.entries(SPECIES_ABILITIES)) {
      expect(abilities.length, `${speciesId}に特性がない`).toBeGreaterThanOrEqual(1);
    }
  });

  it("getSpeciesAbilitiesで取得できる", () => {
    expect(getSpeciesAbilities("himori")).toEqual(["blaze"]);
    expect(getSpeciesAbilities("enjuu")).toEqual(["blaze", "iron_fist"]);
  });

  it("未登録の種族IDは空配列を返す", () => {
    expect(getSpeciesAbilities("unknown")).toEqual([]);
  });

  it("マッピングで参照される特性IDは全てALL_ABILITIESに存在する", () => {
    const validIds = new Set(ALL_ABILITIES.map((a) => a.id));
    for (const [speciesId, abilities] of Object.entries(SPECIES_ABILITIES)) {
      for (const abilityId of abilities) {
        expect(validIds.has(abilityId), `${speciesId}の特性${abilityId}が未定義`).toBe(true);
      }
    }
  });
});

// ── getMonsterAbility ──

describe("getMonsterAbility", () => {
  it("個体に特性が設定されていればそれを返す", () => {
    const monster = makeMonster({ ability: "intimidate" });
    expect(getMonsterAbility(monster)).toBe("intimidate");
  });

  it("個体に特性がなければ種族デフォルトの最初を返す", () => {
    const monster = makeMonster({ speciesId: "himori" });
    expect(getMonsterAbility(monster)).toBe("blaze");
  });

  it("speciesの.abilitiesがあればそちらを使う", () => {
    const monster = makeMonster({ speciesId: "unknown_species" });
    const species = makeSpecies({ abilities: ["levitate", "intimidate"] });
    expect(getMonsterAbility(monster, species)).toBe("levitate");
  });

  it("特性がない場合はnullを返す", () => {
    const monster = makeMonster({ speciesId: "unknown_species" });
    expect(getMonsterAbility(monster)).toBeNull();
  });
});

// ── ダメージ倍率 ──

describe("getAbilityDamageMultiplier", () => {
  const species = makeSpecies();

  it("もうか: HP1/3以下で炎技1.5倍", () => {
    // HP155のモンスター（Lv50, base80, IV15, EV0, hardy）→ 155
    // HP 1/3 = 51以下
    const monster = makeMonster({ currentHp: 30 });
    const move = makeMove({ type: "fire" });
    expect(getAbilityDamageMultiplier("blaze", monster, species, move)).toBe(1.5);
  });

  it("もうか: HP1/3超では等倍", () => {
    const monster = makeMonster({ currentHp: 100 });
    const move = makeMove({ type: "fire" });
    expect(getAbilityDamageMultiplier("blaze", monster, species, move)).toBe(1.0);
  });

  it("もうか: 非炎技には適用されない", () => {
    const monster = makeMonster({ currentHp: 1 });
    const move = makeMove({ type: "water" });
    expect(getAbilityDamageMultiplier("blaze", monster, species, move)).toBe(1.0);
  });

  it("げきりゅう: HP1/3以下で水技1.5倍", () => {
    const monster = makeMonster({ currentHp: 1 });
    const move = makeMove({ type: "water" });
    expect(getAbilityDamageMultiplier("torrent", monster, species, move)).toBe(1.5);
  });

  it("しんりょく: HP1/3以下で草技1.5倍", () => {
    const monster = makeMonster({ currentHp: 1 });
    const move = makeMove({ type: "grass" });
    expect(getAbilityDamageMultiplier("overgrow", monster, species, move)).toBe(1.5);
  });

  it("むしのしらせ: HP1/3以下で虫技1.5倍", () => {
    const monster = makeMonster({ currentHp: 1 });
    const move = makeMove({ type: "bug" });
    expect(getAbilityDamageMultiplier("swarm", monster, species, move)).toBe(1.5);
  });

  it("ちからもち: 物理技2倍", () => {
    const monster = makeMonster({ currentHp: 100 });
    const move = makeMove({ category: "physical" });
    expect(getAbilityDamageMultiplier("huge_power", monster, species, move)).toBe(2.0);
  });

  it("ちからもち: 特殊技には適用されない", () => {
    const monster = makeMonster({ currentHp: 100 });
    const move = makeMove({ category: "special" });
    expect(getAbilityDamageMultiplier("huge_power", monster, species, move)).toBe(1.0);
  });

  it("こんじょう: 状態異常時に物理技1.5倍", () => {
    const monster = makeMonster({ currentHp: 100, status: "burn" });
    const move = makeMove({ category: "physical" });
    expect(getAbilityDamageMultiplier("guts", monster, species, move)).toBe(1.5);
  });

  it("こんじょう: 状態異常なしでは等倍", () => {
    const monster = makeMonster({ currentHp: 100, status: null });
    const move = makeMove({ category: "physical" });
    expect(getAbilityDamageMultiplier("guts", monster, species, move)).toBe(1.0);
  });

  it("特性なしは等倍", () => {
    const monster = makeMonster();
    const move = makeMove();
    expect(getAbilityDamageMultiplier(null, monster, species, move)).toBe(1.0);
  });
});

// ── 防御側倍率 ──

describe("getAbilityDefenseMultiplier", () => {
  it("あついしぼう: 炎技半減", () => {
    const move = makeMove({ type: "fire" });
    expect(getAbilityDefenseMultiplier("thick_fat", move)).toBe(0.5);
  });

  it("あついしぼう: 氷技半減", () => {
    const move = makeMove({ type: "ice" });
    expect(getAbilityDefenseMultiplier("thick_fat", move)).toBe(0.5);
  });

  it("あついしぼう: 他タイプは等倍", () => {
    const move = makeMove({ type: "water" });
    expect(getAbilityDefenseMultiplier("thick_fat", move)).toBe(1.0);
  });

  it("こおりのりんぷん: 特殊技半減", () => {
    const move = makeMove({ category: "special" });
    expect(getAbilityDefenseMultiplier("ice_scales", move)).toBe(0.5);
  });

  it("こおりのりんぷん: 物理技は等倍", () => {
    const move = makeMove({ category: "physical" });
    expect(getAbilityDefenseMultiplier("ice_scales", move)).toBe(1.0);
  });

  it("特性なしは等倍", () => {
    const move = makeMove();
    expect(getAbilityDefenseMultiplier(null, move)).toBe(1.0);
  });
});

// ── タイプ無効化 ──

describe("doesAbilityBlockMove", () => {
  it("ふゆう: 地面技を無効化", () => {
    const move = makeMove({ type: "ground" });
    expect(doesAbilityBlockMove("levitate", move)).toBe(true);
  });

  it("ふゆう: 他タイプは通常", () => {
    const move = makeMove({ type: "fire" });
    expect(doesAbilityBlockMove("levitate", move)).toBe(false);
  });

  it("もらいび: 炎技を無効化", () => {
    const move = makeMove({ type: "fire" });
    expect(doesAbilityBlockMove("flash_fire", move)).toBe(true);
  });

  it("ちょすい: 水技を無効化", () => {
    const move = makeMove({ type: "water" });
    expect(doesAbilityBlockMove("water_absorb", move)).toBe(true);
  });

  it("ちくでん: 電気技を無効化", () => {
    const move = makeMove({ type: "electric" });
    expect(doesAbilityBlockMove("volt_absorb", move)).toBe(true);
  });

  it("特性なしは無効化しない", () => {
    const move = makeMove({ type: "ground" });
    expect(doesAbilityBlockMove(null, move)).toBe(false);
  });
});

// ── STAB ──

describe("getAbilityStabMultiplier", () => {
  it("てきおうりょく: STAB 2.0倍", () => {
    expect(getAbilityStabMultiplier("adaptability")).toBe(2.0);
  });

  it("通常特性: STAB 1.5倍", () => {
    expect(getAbilityStabMultiplier("blaze")).toBe(1.5);
  });

  it("特性なし: STAB 1.5倍", () => {
    expect(getAbilityStabMultiplier(null)).toBe(1.5);
  });
});

// ── がんじょう ──

describe("sturdyCheck", () => {
  const species = makeSpecies();

  it("HP満タンから一撃KOを防ぐ（HP1で耐える）", () => {
    // Lv50, base80, IV15, EV0 → HP = ((2*80+15)*50/100) + 50 + 10 = 147
    const maxHp = 147;
    const monster = makeMonster({ currentHp: maxHp });
    const result = sturdyCheck("sturdy", monster, species, 200);
    expect(result).toBe(maxHp - 1);
  });

  it("HP満タンでないなら通常通りダメージ", () => {
    const monster = makeMonster({ currentHp: 100 });
    const result = sturdyCheck("sturdy", monster, species, 200);
    expect(result).toBe(200);
  });

  it("特性なしなら通常ダメージ", () => {
    const maxHp = 147;
    const monster = makeMonster({ currentHp: maxHp });
    const result = sturdyCheck(null, monster, species, 200);
    expect(result).toBe(200);
  });

  it("HP満タンでもダメージが足りないなら変化なし", () => {
    const maxHp = 147;
    const monster = makeMonster({ currentHp: maxHp });
    const result = sturdyCheck("sturdy", monster, species, 100);
    expect(result).toBe(100);
  });
});

// ── 登場時メッセージ ──

describe("getOnEnterMessages", () => {
  it("いかく: メッセージを返す", () => {
    const msgs = getOnEnterMessages("intimidate", "カエンジシ");
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toContain("カエンジシ");
    expect(msgs[0]).toContain("いかく");
    expect(msgs[1]).toContain("攻撃が下がった");
  });

  it("あめふらし: 天候メッセージ", () => {
    const msgs = getOnEnterMessages("drizzle", "タイカイオウ");
    expect(msgs).toHaveLength(2);
    expect(msgs[1]).toContain("雨");
  });

  it("ひでり: 天候メッセージ", () => {
    const msgs = getOnEnterMessages("drought", "カエンジシ");
    expect(msgs).toHaveLength(2);
    expect(msgs[1]).toContain("日差し");
  });

  it("ダメージ計算系特性は登場時メッセージなし", () => {
    const msgs = getOnEnterMessages("blaze", "ヒモリ");
    expect(msgs).toHaveLength(0);
  });

  it("特性なしは空配列", () => {
    const msgs = getOnEnterMessages(null, "テスト");
    expect(msgs).toHaveLength(0);
  });
});
