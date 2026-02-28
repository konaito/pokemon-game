import { describe, it, expect } from "vitest";
import {
  initDoubleBattle,
  getSpreadMoveMultiplier,
  determineDoubleActionOrder,
  getActiveMonsters,
  checkDoubleFaint,
  switchInDouble,
  checkDoubleResult,
  getValidTargets,
} from "../double-battle";
import type { MonsterInstance, MonsterSpecies, MoveDefinition, TypeId } from "@/types";

function makeSpecies(overrides: Partial<MonsterSpecies> = {}): MonsterSpecies {
  return {
    id: "test_mon",
    name: "テストモン",
    types: ["normal"] as [TypeId],
    baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    baseExpYield: 100,
    expGroup: "medium_fast",
    learnset: [],
    ...overrides,
  };
}

function makeMonster(overrides: Partial<MonsterInstance> = {}): MonsterInstance {
  return {
    uid: "uid-" + Math.random().toString(36).slice(2),
    speciesId: "test_mon",
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

describe("initDoubleBattle", () => {
  it("2体ずつ場に出す", () => {
    const playerParty = [makeMonster(), makeMonster(), makeMonster()];
    const opponentParty = [makeMonster(), makeMonster()];

    const state = initDoubleBattle(playerParty, opponentParty);

    expect(state.player.slots[0].monster).toBe(playerParty[0]);
    expect(state.player.slots[1].monster).toBe(playerParty[1]);
    expect(state.opponent.slots[0].monster).toBe(opponentParty[0]);
    expect(state.opponent.slots[1].monster).toBe(opponentParty[1]);
    expect(state.turnNumber).toBe(1);
  });

  it("1体しかいない場合、2番目スロットはnull", () => {
    const playerParty = [makeMonster()];
    const opponentParty = [makeMonster()];

    const state = initDoubleBattle(playerParty, opponentParty);

    expect(state.player.slots[0].monster).toBe(playerParty[0]);
    expect(state.player.slots[1].monster).toBeNull();
  });

  it("瀕死のモンスターはスキップされる", () => {
    const dead = makeMonster({ currentHp: 0 });
    const alive1 = makeMonster({ uid: "alive1" });
    const alive2 = makeMonster({ uid: "alive2" });
    const playerParty = [dead, alive1, alive2];
    const opponentParty = [makeMonster()];

    const state = initDoubleBattle(playerParty, opponentParty);

    expect(state.player.slots[0].monster).toBe(alive1);
    expect(state.player.slots[1].monster).toBe(alive2);
  });
});

describe("getSpreadMoveMultiplier", () => {
  it("全体技は0.75倍", () => {
    expect(getSpreadMoveMultiplier("all_opponents")).toBe(0.75);
    expect(getSpreadMoveMultiplier("all")).toBe(0.75);
  });

  it("単体技は1.0倍", () => {
    expect(getSpreadMoveMultiplier("single")).toBe(1.0);
    expect(getSpreadMoveMultiplier("self")).toBe(1.0);
    expect(getSpreadMoveMultiplier("ally")).toBe(1.0);
  });
});

describe("determineDoubleActionOrder", () => {
  it("優先度が高い技が先に行動する", () => {
    const actions = [
      {
        position: { side: "player" as const, slot: 0 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 100 },
        }),
        move: { priority: 0 } as MoveDefinition,
      },
      {
        position: { side: "opponent" as const, slot: 0 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 50 },
        }),
        move: { priority: 1 } as MoveDefinition,
      },
    ];

    const order = determineDoubleActionOrder(actions);
    // 優先度1の方（opponent）が先
    expect(order[0].position.side).toBe("opponent");
  });

  it("同優先度なら素早さ順", () => {
    const actions = [
      {
        position: { side: "player" as const, slot: 0 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 50 },
        }),
        move: { priority: 0 } as MoveDefinition,
      },
      {
        position: { side: "opponent" as const, slot: 0 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 100 },
        }),
        move: { priority: 0 } as MoveDefinition,
      },
    ];

    const order = determineDoubleActionOrder(actions);
    expect(order[0].position.side).toBe("opponent"); // 速い方が先
  });

  it("4体を正しくソートする", () => {
    const actions = [
      {
        position: { side: "player" as const, slot: 0 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 70 },
        }),
      },
      {
        position: { side: "player" as const, slot: 1 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 120 },
        }),
      },
      {
        position: { side: "opponent" as const, slot: 0 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 90 },
        }),
      },
      {
        position: { side: "opponent" as const, slot: 1 },
        monster: makeMonster(),
        species: makeSpecies({
          baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 40 },
        }),
      },
    ];

    const order = determineDoubleActionOrder(actions);
    expect(order[0].position).toEqual({ side: "player", slot: 1 }); // speed 120
    expect(order[1].position).toEqual({ side: "opponent", slot: 0 }); // speed 90
    expect(order[2].position).toEqual({ side: "player", slot: 0 }); // speed 70
    expect(order[3].position).toEqual({ side: "opponent", slot: 1 }); // speed 40
  });
});

describe("getActiveMonsters", () => {
  it("場のモンスターを返す", () => {
    const p1 = makeMonster();
    const p2 = makeMonster();
    const o1 = makeMonster();
    const state = initDoubleBattle([p1, p2], [o1]);

    const active = getActiveMonsters(state);
    expect(active.player[0]).toBe(p1);
    expect(active.player[1]).toBe(p2);
    expect(active.opponent[0]).toBe(o1);
  });
});

describe("checkDoubleFaint", () => {
  it("瀕死のモンスターを検出する", () => {
    const p1 = makeMonster({ currentHp: 50 });
    const p2 = makeMonster({ currentHp: 50 });
    const o1 = makeMonster({ currentHp: 50 });
    const o2 = makeMonster({ currentHp: 30 });
    const state = initDoubleBattle([p1, p2], [o1, o2]);

    // 初期化後にHPを0にする（バトル中にダメージを受けた想定）
    state.player.slots[0].monster!.currentHp = 0;
    state.opponent.slots[0].monster!.currentHp = 0;

    const fainted = checkDoubleFaint(state);
    expect(fainted).toHaveLength(2);
    expect(fainted).toContainEqual({ side: "player", slot: 0 });
    expect(fainted).toContainEqual({ side: "opponent", slot: 0 });
  });

  it("瀕死がなければ空配列", () => {
    const state = initDoubleBattle([makeMonster(), makeMonster()], [makeMonster()]);
    expect(checkDoubleFaint(state)).toHaveLength(0);
  });
});

describe("switchInDouble", () => {
  it("空いたスロットに控えのモンスターを出す", () => {
    const p1 = makeMonster({ uid: "p1" });
    const p2 = makeMonster({ uid: "p2" });
    const p3 = makeMonster({ uid: "p3" });
    const state = initDoubleBattle([p1, p2, p3], [makeMonster()]);

    // p1が瀕死になった想定でスロット0を交代
    state.player.slots[0].monster!.currentHp = 0;

    const result = switchInDouble(state, "player", 0, 2);
    expect(result).not.toBeNull();
    expect(state.player.slots[0].monster).toBe(p3);
    expect(state.player.slots[0].partyIndex).toBe(2);
  });

  it("瀕死のモンスターには交代できない", () => {
    const p1 = makeMonster({ uid: "p1" });
    const p2 = makeMonster({ uid: "p2" });
    const dead = makeMonster({ uid: "dead", currentHp: 0 });
    const state = initDoubleBattle([p1, p2, dead], [makeMonster()]);

    const result = switchInDouble(state, "player", 0, 2);
    expect(result).toBeNull();
  });

  it("既に場に出ているモンスターには交代できない", () => {
    const p1 = makeMonster({ uid: "p1" });
    const p2 = makeMonster({ uid: "p2" });
    const state = initDoubleBattle([p1, p2], [makeMonster()]);

    // p2（パーティindex 1）は既にslot 1に出ている
    const result = switchInDouble(state, "player", 0, 1);
    expect(result).toBeNull();
  });
});

describe("checkDoubleResult", () => {
  it("相手全滅で勝利", () => {
    const o1 = makeMonster({ currentHp: 0 });
    const state = initDoubleBattle([makeMonster()], [o1]);
    expect(checkDoubleResult(state)).toBe("win");
  });

  it("プレイヤー全滅で敗北", () => {
    const p1 = makeMonster({ currentHp: 0 });
    const state = initDoubleBattle([p1], [makeMonster()]);
    expect(checkDoubleResult(state)).toBe("lose");
  });

  it("両方生存ならnull", () => {
    const state = initDoubleBattle([makeMonster()], [makeMonster()]);
    expect(checkDoubleResult(state)).toBeNull();
  });
});

describe("getValidTargets", () => {
  it("single: 相手の場のモンスターを返す", () => {
    const state = initDoubleBattle([makeMonster(), makeMonster()], [makeMonster(), makeMonster()]);
    const targets = getValidTargets(state, "player", "single");
    expect(targets).toHaveLength(2);
    expect(targets[0]).toEqual({ side: "opponent", slot: 0 });
    expect(targets[1]).toEqual({ side: "opponent", slot: 1 });
  });

  it("all: 場の全モンスターを返す", () => {
    const state = initDoubleBattle([makeMonster(), makeMonster()], [makeMonster(), makeMonster()]);
    const targets = getValidTargets(state, "player", "all");
    expect(targets).toHaveLength(4);
  });

  it("self: 空配列を返す", () => {
    const state = initDoubleBattle([makeMonster()], [makeMonster()]);
    const targets = getValidTargets(state, "player", "self");
    expect(targets).toHaveLength(0);
  });

  it("瀕死のモンスターはターゲットに含まない", () => {
    const alive = makeMonster({ uid: "alive" });
    const dead = makeMonster({ uid: "dead", currentHp: 0 });
    const state = initDoubleBattle([makeMonster()], [alive, dead]);
    const targets = getValidTargets(state, "player", "single");
    expect(targets).toHaveLength(1);
    expect(targets[0]).toEqual({ side: "opponent", slot: 0 });
  });
});
