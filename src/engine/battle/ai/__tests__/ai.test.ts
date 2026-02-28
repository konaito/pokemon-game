import { describe, it, expect } from "vitest";
import { randomAi } from "../ai-random";
import { basicAi } from "../ai-basic";
import { smartAi } from "../ai-smart";
import { getAiStrategy } from "../index";
import type { AiContext } from "../ai-types";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";

function createTestMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    uid: "test",
    speciesId: "test",
    level: 30,
    exp: 1000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
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

function createTestSpecies(overrides?: Partial<MonsterSpecies>): MonsterSpecies {
  return {
    id: "test",
    name: "テスト",
    types: ["fire"],
    baseStats: { hp: 80, atk: 80, def: 70, spAtk: 80, spDef: 70, speed: 80 },
    baseExpYield: 100,
    expGroup: "medium_fast",
    learnset: [],
    ...overrides,
  };
}

const tackleDef: MoveDefinition = {
  id: "tackle",
  name: "たいあたり",
  type: "normal",
  category: "physical",
  power: 40,
  accuracy: 100,
  pp: 35,
  priority: 0,
};

const emberDef: MoveDefinition = {
  id: "ember",
  name: "ひのこ",
  type: "fire",
  category: "special",
  power: 40,
  accuracy: 100,
  pp: 25,
  priority: 0,
};

const waterGunDef: MoveDefinition = {
  id: "water-gun",
  name: "みずでっぽう",
  type: "water",
  category: "special",
  power: 40,
  accuracy: 100,
  pp: 25,
  priority: 0,
};

function createContext(overrides?: Partial<AiContext>): AiContext {
  const self = createTestMonster();
  const selfSpecies = createTestSpecies();
  return {
    self,
    selfSpecies,
    opponent: createTestMonster({ speciesId: "grass-mon" }),
    opponentSpecies: createTestSpecies({ id: "grass-mon", types: ["grass"] }),
    usableMoves: [
      { move: tackleDef, index: 0, currentPp: 35 },
      { move: emberDef, index: 1, currentPp: 25 },
    ],
    selfBattler: {
      party: [self],
      activeIndex: 0,
      statStages: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    },
    random: () => 0.5,
    ...overrides,
  };
}

describe("getAiStrategy", () => {
  it("randomレベルでランダムAIを返す", () => {
    const strategy = getAiStrategy("random");
    expect(strategy).toBe(randomAi);
  });

  it("basicレベルで基本AIを返す", () => {
    const strategy = getAiStrategy("basic");
    expect(strategy).toBe(basicAi);
  });

  it("smartレベルでスマートAIを返す", () => {
    const strategy = getAiStrategy("smart");
    expect(strategy).toBe(smartAi);
  });
});

describe("randomAi", () => {
  it("使用可能な技からランダムに選択する", () => {
    const context = createContext({ random: () => 0 });
    const action = randomAi.selectAction(context);
    expect(action.type).toBe("fight");
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(0);
    }
  });

  it("PPが0の技は使わない（わるあがき）", () => {
    const context = createContext({ usableMoves: [] });
    const action = randomAi.selectAction(context);
    expect(action.type).toBe("fight");
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(-1);
    }
  });
});

describe("basicAi", () => {
  it("タイプ相性で効果抜群の技を優先する", () => {
    // 相手が草タイプ → 炎技(ember)を優先
    const context = createContext({ random: () => 0.5 });
    const action = basicAi.selectAction(context);
    expect(action.type).toBe("fight");
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(1); // ember (fire vs grass = 2x)
    }
  });

  it("相性無効(0)の技は選ばない", () => {
    // 相手がゴーストタイプ → ノーマル技(tackle)は無効
    const context = createContext({
      opponentSpecies: createTestSpecies({ id: "ghost-mon", types: ["ghost"] }),
      random: () => 0.5,
    });
    const action = basicAi.selectAction(context);
    expect(action.type).toBe("fight");
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(1); // ember (fire vs ghost = 1x) not tackle (normal vs ghost = 0)
    }
  });

  it("STAB(タイプ一致)ボーナスを考慮する", () => {
    // 自分が水タイプ、相手がノーマル → 水技にSTABがつく
    const context = createContext({
      selfSpecies: createTestSpecies({ types: ["water"] }),
      opponentSpecies: createTestSpecies({ types: ["normal"] }),
      usableMoves: [
        { move: tackleDef, index: 0, currentPp: 35 }, // normal, power 40, no STAB
        { move: waterGunDef, index: 1, currentPp: 25 }, // water, power 40, STAB 1.5x
      ],
      random: () => 0.5,
    });
    const action = basicAi.selectAction(context);
    expect(action.type).toBe("fight");
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(1); // water-gun with STAB
    }
  });

  it("PPが尽きた場合はわるあがき", () => {
    const context = createContext({ usableMoves: [] });
    const action = basicAi.selectAction(context);
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(-1);
    }
  });
});

describe("smartAi", () => {
  it("タイプ相性で効果抜群の技を優先する", () => {
    const context = createContext({ random: () => 0.5 });
    const action = smartAi.selectAction(context);
    expect(action.type).toBe("fight");
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(1); // ember vs grass
    }
  });

  it("PPが尽きた場合はわるあがき", () => {
    const context = createContext({ usableMoves: [] });
    const action = smartAi.selectAction(context);
    if (action.type === "fight") {
      expect(action.moveIndex).toBe(-1);
    }
  });

  it("不利対面で交代を検討する（確率的）", () => {
    // random=0で交代検討ON、自分の技が全部いまひとつ
    const context = createContext({
      selfSpecies: createTestSpecies({ types: ["fire"] }),
      opponentSpecies: createTestSpecies({ types: ["water"] }),
      usableMoves: [
        { move: emberDef, index: 0, currentPp: 25 }, // fire vs water = 0.5x
      ],
      selfBattler: {
        party: [
          createTestMonster(), // active
          createTestMonster({ uid: "switch-target", currentHp: 50 }), // 交代先
        ],
        activeIndex: 0,
        statStages: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
      },
      random: () => 0, // 交代判定に入る（0 < 0.25）
    });
    const action = smartAi.selectAction(context);
    expect(action.type).toBe("switch");
    if (action.type === "switch") {
      expect(action.partyIndex).toBe(1);
    }
  });

  it("交代先がいない場合は技を選択する", () => {
    // 全員瀕死で交代先なし
    const context = createContext({
      selfSpecies: createTestSpecies({ types: ["fire"] }),
      opponentSpecies: createTestSpecies({ types: ["water"] }),
      usableMoves: [{ move: emberDef, index: 0, currentPp: 25 }],
      selfBattler: {
        party: [
          createTestMonster(), // active
          createTestMonster({ uid: "fainted", currentHp: 0 }), // 瀕死
        ],
        activeIndex: 0,
        statStages: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
      },
      random: () => 0,
    });
    const action = smartAi.selectAction(context);
    expect(action.type).toBe("fight");
  });
});
