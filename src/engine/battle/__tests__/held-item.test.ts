import { describe, it, expect } from "vitest";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";
import { ALL_HELD_ITEMS, getHeldItemById } from "@/data/items/held-items";
import {
  getHeldItem,
  getHeldItemDamageMultiplier,
  getLifeOrbRecoil,
  focusSashCheck,
  oranBerryCheck,
  lumBerryCheck,
  leftoversHeal,
  evioliteMultiplier,
  choiceScarfMultiplier,
  getHeldItemMessage,
} from "../held-item";

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

// Lv50, base80, IV15, EV0 → HP 147
const MAX_HP = 147;

describe("持ち物マスターデータ", () => {
  it("18個の持ち物が定義されている", () => {
    expect(ALL_HELD_ITEMS.length).toBe(18);
  });

  it("全持ち物にユニークなIDがある", () => {
    const ids = ALL_HELD_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getHeldItemByIdで取得できる", () => {
    const item = getHeldItemById("oran_berry");
    expect(item).toBeDefined();
    expect(item!.name).toBe("オボンのみ");
  });

  it("存在しないIDはundefined", () => {
    expect(getHeldItemById("nonexistent")).toBeUndefined();
  });
});

describe("getHeldItem", () => {
  it("持ち物を持っていれば取得", () => {
    const monster = makeMonster({ heldItem: "oran_berry" });
    const item = getHeldItem(monster);
    expect(item).toBeDefined();
    expect(item!.id).toBe("oran_berry");
  });

  it("持ち物なしはnull", () => {
    const monster = makeMonster();
    expect(getHeldItem(monster)).toBeNull();
  });
});

describe("getHeldItemDamageMultiplier", () => {
  it("タイプ強化: 対応タイプ1.2倍", () => {
    const item = getHeldItemById("charcoal")!;
    const move = makeMove({ type: "fire" });
    expect(getHeldItemDamageMultiplier(item, move)).toBe(1.2);
  });

  it("タイプ強化: 非対応タイプは等倍", () => {
    const item = getHeldItemById("charcoal")!;
    const move = makeMove({ type: "water" });
    expect(getHeldItemDamageMultiplier(item, move)).toBe(1.0);
  });

  it("こだわりハチマキ: 物理技1.5倍", () => {
    const item = getHeldItemById("choice_band")!;
    const move = makeMove({ category: "physical" });
    expect(getHeldItemDamageMultiplier(item, move)).toBe(1.5);
  });

  it("こだわりハチマキ: 特殊技は等倍", () => {
    const item = getHeldItemById("choice_band")!;
    const move = makeMove({ category: "special" });
    expect(getHeldItemDamageMultiplier(item, move)).toBe(1.0);
  });

  it("こだわりメガネ: 特殊技1.5倍", () => {
    const item = getHeldItemById("choice_specs")!;
    const move = makeMove({ category: "special" });
    expect(getHeldItemDamageMultiplier(item, move)).toBe(1.5);
  });

  it("いのちのたま: 攻撃技1.3倍", () => {
    const item = getHeldItemById("life_orb")!;
    const move = makeMove({ power: 80 });
    expect(getHeldItemDamageMultiplier(item, move)).toBe(1.3);
  });

  it("いのちのたま: ステータス技は等倍", () => {
    const item = getHeldItemById("life_orb")!;
    const move = makeMove({ power: null, category: "status" });
    expect(getHeldItemDamageMultiplier(item, move)).toBe(1.0);
  });

  it("持ち物なしは等倍", () => {
    const move = makeMove();
    expect(getHeldItemDamageMultiplier(null, move)).toBe(1.0);
  });
});

describe("getLifeOrbRecoil", () => {
  const species = makeSpecies();

  it("いのちのたまで反動ダメージ（HP1/10）", () => {
    const item = getHeldItemById("life_orb")!;
    const monster = makeMonster({ currentHp: MAX_HP });
    const move = makeMove({ power: 80 });
    const recoil = getLifeOrbRecoil(item, monster, species, move);
    expect(recoil).toBe(Math.floor(MAX_HP / 10));
  });

  it("ステータス技では反動なし", () => {
    const item = getHeldItemById("life_orb")!;
    const monster = makeMonster();
    const move = makeMove({ power: null, category: "status" });
    expect(getLifeOrbRecoil(item, monster, species, move)).toBe(0);
  });

  it("他の持ち物では反動なし", () => {
    const item = getHeldItemById("charcoal")!;
    const monster = makeMonster();
    const move = makeMove();
    expect(getLifeOrbRecoil(item, monster, species, move)).toBe(0);
  });
});

describe("focusSashCheck", () => {
  const species = makeSpecies();

  it("HP満タンから一撃KOをHP1で耐える", () => {
    const item = getHeldItemById("focus_sash")!;
    const monster = makeMonster({ currentHp: MAX_HP });
    const result = focusSashCheck(item, monster, species, 200);
    expect(result.damage).toBe(MAX_HP - 1);
    expect(result.consumed).toBe(true);
  });

  it("HP満タンでなければ通常ダメージ", () => {
    const item = getHeldItemById("focus_sash")!;
    const monster = makeMonster({ currentHp: 100 });
    const result = focusSashCheck(item, monster, species, 200);
    expect(result.damage).toBe(200);
    expect(result.consumed).toBe(false);
  });

  it("ダメージが足りなければ発動しない", () => {
    const item = getHeldItemById("focus_sash")!;
    const monster = makeMonster({ currentHp: MAX_HP });
    const result = focusSashCheck(item, monster, species, 50);
    expect(result.damage).toBe(50);
    expect(result.consumed).toBe(false);
  });

  it("持ち物なしは通常ダメージ", () => {
    const monster = makeMonster({ currentHp: MAX_HP });
    const result = focusSashCheck(null, monster, species, 200);
    expect(result.damage).toBe(200);
    expect(result.consumed).toBe(false);
  });
});

describe("oranBerryCheck", () => {
  const species = makeSpecies();

  it("HP1/2以下で発動（HP1/4回復）", () => {
    const item = getHeldItemById("oran_berry")!;
    const monster = makeMonster({ currentHp: 50 }); // 50 < 147/2 = 73
    const result = oranBerryCheck(item, monster, species);
    expect(result.healAmount).toBe(Math.floor(MAX_HP / 4));
    expect(result.consumed).toBe(true);
  });

  it("HP1/2超では発動しない", () => {
    const item = getHeldItemById("oran_berry")!;
    const monster = makeMonster({ currentHp: 100 }); // 100 > 73
    const result = oranBerryCheck(item, monster, species);
    expect(result.healAmount).toBe(0);
    expect(result.consumed).toBe(false);
  });

  it("HP0では発動しない", () => {
    const item = getHeldItemById("oran_berry")!;
    const monster = makeMonster({ currentHp: 0 });
    const result = oranBerryCheck(item, monster, species);
    expect(result.healAmount).toBe(0);
    expect(result.consumed).toBe(false);
  });
});

describe("lumBerryCheck", () => {
  it("状態異常時に発動", () => {
    const item = getHeldItemById("lum_berry")!;
    const monster = makeMonster({ status: "burn" });
    const result = lumBerryCheck(item, monster);
    expect(result.cured).toBe(true);
    expect(result.consumed).toBe(true);
  });

  it("状態異常なしでは発動しない", () => {
    const item = getHeldItemById("lum_berry")!;
    const monster = makeMonster({ status: null });
    const result = lumBerryCheck(item, monster);
    expect(result.cured).toBe(false);
    expect(result.consumed).toBe(false);
  });
});

describe("leftoversHeal", () => {
  const species = makeSpecies();

  it("毎ターンHP1/16回復", () => {
    const item = getHeldItemById("leftovers")!;
    const monster = makeMonster({ currentHp: 100 });
    const heal = leftoversHeal(item, monster, species);
    expect(heal).toBe(Math.floor(MAX_HP / 16));
  });

  it("HP満タンでは回復しない", () => {
    const item = getHeldItemById("leftovers")!;
    const monster = makeMonster({ currentHp: MAX_HP });
    expect(leftoversHeal(item, monster, species)).toBe(0);
  });

  it("HP0では回復しない", () => {
    const item = getHeldItemById("leftovers")!;
    const monster = makeMonster({ currentHp: 0 });
    expect(leftoversHeal(item, monster, species)).toBe(0);
  });
});

describe("evioliteMultiplier", () => {
  it("進化前のモンスターは1.5倍", () => {
    const item = getHeldItemById("eviolite")!;
    const species = makeSpecies({ evolvesTo: [{ id: "evolved", level: 36 }] });
    expect(evioliteMultiplier(item, species)).toBe(1.5);
  });

  it("最終進化形は等倍", () => {
    const item = getHeldItemById("eviolite")!;
    const species = makeSpecies({ evolvesTo: undefined });
    expect(evioliteMultiplier(item, species)).toBe(1.0);
  });

  it("持ち物なしは等倍", () => {
    const species = makeSpecies({ evolvesTo: [{ id: "evolved", level: 36 }] });
    expect(evioliteMultiplier(null, species)).toBe(1.0);
  });
});

describe("choiceScarfMultiplier", () => {
  it("こだわりスカーフで素早さ1.5倍", () => {
    const item = getHeldItemById("choice_scarf")!;
    expect(choiceScarfMultiplier(item)).toBe(1.5);
  });

  it("他の持ち物は等倍", () => {
    const item = getHeldItemById("charcoal")!;
    expect(choiceScarfMultiplier(item)).toBe(1.0);
  });

  it("持ち物なしは等倍", () => {
    expect(choiceScarfMultiplier(null)).toBe(1.0);
  });
});

describe("getHeldItemMessage", () => {
  it("オボンのみ回復メッセージ", () => {
    const msg = getHeldItemMessage("pinch_heal", "ヒモリ", "オボンのみ");
    expect(msg).toContain("ヒモリ");
    expect(msg).toContain("オボンのみ");
    expect(msg).toContain("回復");
  });

  it("ラムのみ回復メッセージ", () => {
    const msg = getHeldItemMessage("status_cure", "ヒモリ", "ラムのみ");
    expect(msg).toContain("状態異常が治った");
  });

  it("きあいのタスキメッセージ", () => {
    const msg = getHeldItemMessage("focus_sash", "ヒモリ", "きあいのタスキ");
    expect(msg).toContain("こらえた");
  });

  it("不明な効果は空文字", () => {
    expect(getHeldItemMessage("unknown", "テスト", "テスト")).toBe("");
  });
});
