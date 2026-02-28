import { describe, it, expect } from "vitest";
import {
  areCompatible,
  getEggChance,
  checkEggFound,
  inheritIVs,
  getInheritedMoves,
  generateEgg,
  processEggStep,
  hatchEgg,
  createDaycareState,
  depositMonster,
  withdrawMonster,
  collectEgg,
} from "../breeding";
import type { MonsterInstance, MonsterSpecies, MoveDefinition, TypeId, EggGroup } from "@/types";

function makeSpecies(overrides: Partial<MonsterSpecies> = {}): MonsterSpecies {
  return {
    id: "test_mon",
    name: "テストモン",
    types: ["normal"] as [TypeId],
    baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    baseExpYield: 100,
    expGroup: "medium_fast",
    learnset: [{ level: 1, moveId: "tackle" }],
    eggGroups: ["monster"] as EggGroup[],
    hatchSteps: 5120,
    ...overrides,
  };
}

function makeMonster(overrides: Partial<MonsterInstance> = {}): MonsterInstance {
  return {
    uid: "test-uid",
    speciesId: "test_mon",
    level: 30,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [
      { moveId: "tackle", currentPp: 35 },
      { moveId: "ember", currentPp: 25 },
    ],
    status: null,
    ...overrides,
  };
}

const MOVES: Record<string, MoveDefinition> = {
  tackle: {
    id: "tackle",
    name: "たいあたり",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  ember: {
    id: "ember",
    name: "ひのこ",
    type: "fire",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  dragon_dance: {
    id: "dragon_dance",
    name: "りゅうのまい",
    type: "dragon",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 20,
    priority: 0,
  },
};

const moveResolver = (id: string) => MOVES[id];

describe("areCompatible", () => {
  it("同じタマゴグループなら互換性あり", () => {
    const s1 = makeSpecies({ eggGroups: ["monster"] });
    const s2 = makeSpecies({ eggGroups: ["monster", "water"] });
    expect(areCompatible(s1, s2)).toBe(true);
  });

  it("異なるタマゴグループなら互換性なし", () => {
    const s1 = makeSpecies({ eggGroups: ["monster"] });
    const s2 = makeSpecies({ eggGroups: ["bug"] });
    expect(areCompatible(s1, s2)).toBe(false);
  });

  it("undiscoveredグループは互換性なし", () => {
    const s1 = makeSpecies({ eggGroups: ["undiscovered"] });
    const s2 = makeSpecies({ eggGroups: ["undiscovered"] });
    expect(areCompatible(s1, s2)).toBe(false);
  });

  it("eggGroupsが未設定なら互換性なし", () => {
    const s1 = makeSpecies({ eggGroups: undefined });
    const s2 = makeSpecies({ eggGroups: ["monster"] });
    expect(areCompatible(s1, s2)).toBe(false);
  });
});

describe("getEggChance", () => {
  it("同種族なら50%", () => {
    const s1 = makeSpecies({ id: "pikachu", eggGroups: ["field"] });
    const s2 = makeSpecies({ id: "pikachu", eggGroups: ["field"] });
    expect(getEggChance(s1, s2)).toBe(50);
  });

  it("異種族・同グループなら20%", () => {
    const s1 = makeSpecies({ id: "mon_a", eggGroups: ["field"] });
    const s2 = makeSpecies({ id: "mon_b", eggGroups: ["field"] });
    expect(getEggChance(s1, s2)).toBe(20);
  });

  it("互換性なしなら0%", () => {
    const s1 = makeSpecies({ eggGroups: ["monster"] });
    const s2 = makeSpecies({ eggGroups: ["bug"] });
    expect(getEggChance(s1, s2)).toBe(0);
  });
});

describe("checkEggFound", () => {
  it("確率以下のランダム値でtrue", () => {
    const s1 = makeSpecies({ id: "a", eggGroups: ["monster"] });
    const s2 = makeSpecies({ id: "a", eggGroups: ["monster"] });
    // 50%の場合、random()=0.1 → 10 < 50 → true
    expect(checkEggFound(s1, s2, () => 0.1)).toBe(true);
  });

  it("確率以上のランダム値でfalse", () => {
    const s1 = makeSpecies({ id: "a", eggGroups: ["monster"] });
    const s2 = makeSpecies({ id: "b", eggGroups: ["monster"] });
    // 20%の場合、random()=0.9 → 90 > 20 → false
    expect(checkEggFound(s1, s2, () => 0.9)).toBe(false);
  });
});

describe("inheritIVs", () => {
  it("親から3つのIVを遺伝する", () => {
    const parent1 = makeMonster({
      ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
    });
    const parent2 = makeMonster({
      ivs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    });

    let callCount = 0;
    const mockRandom = () => {
      callCount++;
      // ランダムIV生成用（最初の6回）→ 各15を返す
      // 遺伝選択用 → 0を返す（最初のステータスを選択、parent1を選択）
      if (callCount <= 6) return 15 / 32;
      return 0;
    };

    const result = inheritIVs(parent1, parent2, mockRandom);

    // 3つが親からの遺伝値（31 or 0）
    const stats = [result.hp, result.atk, result.def, result.spAtk, result.spDef, result.speed];
    const inherited = stats.filter((v) => v === 31 || v === 0);
    // 遺伝されたステータスが存在する
    expect(inherited.length).toBeGreaterThanOrEqual(3);
  });
});

describe("getInheritedMoves", () => {
  it("親の技から子のeggMovesに含まれるものを返す", () => {
    const result = getInheritedMoves(["tackle", "dragon_dance"], ["ember"], ["dragon_dance"]);
    expect(result).toEqual(["dragon_dance"]);
  });

  it("eggMovesが空なら空配列を返す", () => {
    const result = getInheritedMoves(["tackle"], ["ember"], []);
    expect(result).toEqual([]);
  });

  it("親がeggMoveを持っていなければ空配列", () => {
    const result = getInheritedMoves(["tackle"], ["ember"], ["dragon_dance"]);
    expect(result).toEqual([]);
  });
});

describe("generateEgg", () => {
  it("タマゴを正しく生成する", () => {
    const parent1 = makeMonster({ uid: "p1" });
    const parent2 = makeMonster({ uid: "p2" });
    const childSpecies = makeSpecies({
      learnset: [{ level: 1, moveId: "tackle" }],
      hatchSteps: 2560,
    });

    const egg = generateEgg(parent1, parent2, childSpecies, moveResolver, () => 0.5);

    expect(egg.isEgg).toBe(true);
    expect(egg.eggSteps).toBe(2560);
    expect(egg.level).toBe(1);
    expect(egg.speciesId).toBe("test_mon");
    expect(egg.moves.length).toBeGreaterThanOrEqual(1);
    expect(egg.evs).toEqual({ hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 });
  });

  it("遺伝技がある場合、技リストに含まれる", () => {
    const parent1 = makeMonster({
      moves: [{ moveId: "dragon_dance", currentPp: 20 }],
    });
    const parent2 = makeMonster();
    const childSpecies = makeSpecies({
      eggMoves: ["dragon_dance"],
      learnset: [{ level: 1, moveId: "tackle" }],
    });

    const egg = generateEgg(parent1, parent2, childSpecies, moveResolver, () => 0.5);

    const moveIds = egg.moves.map((m) => m.moveId);
    expect(moveIds).toContain("dragon_dance");
  });
});

describe("processEggStep", () => {
  it("歩数を減らす", () => {
    const egg = makeMonster({ isEgg: true, eggSteps: 100 });
    const result = processEggStep(egg, 10);
    expect(result.hatched).toBe(false);
    expect(result.remaining).toBe(90);
  });

  it("歩数が0になったら孵化", () => {
    const egg = makeMonster({ isEgg: true, eggSteps: 5 });
    const result = processEggStep(egg, 10);
    expect(result.hatched).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("タマゴでないモンスターには効果なし", () => {
    const monster = makeMonster({ isEgg: false });
    const result = processEggStep(monster, 10);
    expect(result.hatched).toBe(false);
  });
});

describe("hatchEgg", () => {
  it("タマゴフラグを解除しHPを設定する", () => {
    const egg = makeMonster({ isEgg: true, eggSteps: 0, currentHp: 1 });
    const species = makeSpecies();
    hatchEgg(egg, species, 50);
    expect(egg.isEgg).toBe(false);
    expect(egg.eggSteps).toBeUndefined();
    expect(egg.currentHp).toBe(50);
  });
});

describe("Daycare state management", () => {
  it("createDaycareState: 初期状態を生成", () => {
    const state = createDaycareState();
    expect(state.deposited).toEqual([null, null]);
    expect(state.pendingEgg).toBeNull();
  });

  it("depositMonster: 1体目を預けられる", () => {
    const state = createDaycareState();
    const monster = makeMonster();
    const result = depositMonster(state, monster);
    expect(result.success).toBe(true);
    expect(result.slot).toBe(0);
    expect(state.deposited[0]).toBe(monster);
  });

  it("depositMonster: 2体目を預けられる", () => {
    const state = createDaycareState();
    depositMonster(state, makeMonster({ uid: "a" }));
    const result = depositMonster(state, makeMonster({ uid: "b" }));
    expect(result.success).toBe(true);
    expect(result.slot).toBe(1);
  });

  it("depositMonster: 3体目は預けられない", () => {
    const state = createDaycareState();
    depositMonster(state, makeMonster({ uid: "a" }));
    depositMonster(state, makeMonster({ uid: "b" }));
    const result = depositMonster(state, makeMonster({ uid: "c" }));
    expect(result.success).toBe(false);
  });

  it("withdrawMonster: モンスターを引き取れる", () => {
    const state = createDaycareState();
    const monster = makeMonster();
    depositMonster(state, monster);
    const result = withdrawMonster(state, 0);
    expect(result.success).toBe(true);
    expect(result.monster).toBe(monster);
    expect(state.deposited[0]).toBeNull();
  });

  it("withdrawMonster: 空スロットからは引き取れない", () => {
    const state = createDaycareState();
    const result = withdrawMonster(state, 0);
    expect(result.success).toBe(false);
  });

  it("collectEgg: タマゴを受け取れる", () => {
    const state = createDaycareState();
    const egg = makeMonster({ isEgg: true });
    state.pendingEgg = egg;
    const result = collectEgg(state);
    expect(result.success).toBe(true);
    expect(result.egg).toBe(egg);
    expect(state.pendingEgg).toBeNull();
  });

  it("collectEgg: タマゴがないときは失敗", () => {
    const state = createDaycareState();
    const result = collectEgg(state);
    expect(result.success).toBe(false);
  });
});
