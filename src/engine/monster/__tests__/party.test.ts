import { describe, it, expect } from "vitest";
import {
  createPartyState,
  addMonster,
  swapPartyOrder,
  depositToBox,
  withdrawFromBox,
  aliveCount,
  healParty,
} from "../party";
import type { MonsterInstance, MoveDefinition } from "@/types";

function createDummyMonster(id: string = "test"): MonsterInstance {
  return {
    speciesId: id,
    level: 10,
    exp: 1000,
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 30,
    moves: [{ moveId: "tackle", currentPp: 10 }],
    status: null,
  };
}

describe("パーティ管理", () => {
  it("パーティにモンスターを追加できる（6匹まで）", () => {
    const state = createPartyState();
    for (let i = 0; i < 6; i++) {
      const result = addMonster(state, createDummyMonster(`mon-${i}`));
      expect(result.destination).toBe("party");
    }
    expect(state.party).toHaveLength(6);
  });

  it("パーティが満杯ならボックスに送られる", () => {
    const state = createPartyState();
    for (let i = 0; i < 6; i++) {
      addMonster(state, createDummyMonster());
    }
    const result = addMonster(state, createDummyMonster("7th"));
    expect(result.destination).toBe("box");
    expect(result.boxIndex).toBe(0);
    expect(state.boxes[0]).toHaveLength(1);
  });

  it("パーティの並び替えができる", () => {
    const state = createPartyState();
    addMonster(state, createDummyMonster("a"));
    addMonster(state, createDummyMonster("b"));
    addMonster(state, createDummyMonster("c"));

    swapPartyOrder(state, 0, 2);
    expect(state.party[0].speciesId).toBe("c");
    expect(state.party[2].speciesId).toBe("a");
  });

  it("ボックスへ預けられる（パーティ2匹以上時）", () => {
    const state = createPartyState();
    addMonster(state, createDummyMonster("a"));
    addMonster(state, createDummyMonster("b"));

    depositToBox(state, 1, 0);
    expect(state.party).toHaveLength(1);
    expect(state.boxes[0]).toHaveLength(1);
  });

  it("パーティ1匹の時は預けられない", () => {
    const state = createPartyState();
    addMonster(state, createDummyMonster());

    expect(() => depositToBox(state, 0, 0)).toThrow("1匹の時は預けられません");
  });

  it("ボックスから引き出せる", () => {
    const state = createPartyState();
    addMonster(state, createDummyMonster("a"));
    addMonster(state, createDummyMonster("b"));
    depositToBox(state, 1, 0);

    withdrawFromBox(state, 0, 0);
    expect(state.party).toHaveLength(2);
    expect(state.boxes[0]).toHaveLength(0);
  });

  it("生存数を数える", () => {
    const state = createPartyState();
    const m1 = createDummyMonster();
    m1.currentHp = 30;
    const m2 = createDummyMonster();
    m2.currentHp = 0;
    state.party = [m1, m2];

    expect(aliveCount(state.party)).toBe(1);
  });

  it("全回復が正しく動作する", () => {
    const state = createPartyState();
    const m = createDummyMonster();
    m.currentHp = 5;
    m.status = "poison";
    m.moves[0].currentPp = 0;
    state.party = [m];

    const moveDef: MoveDefinition = {
      id: "tackle",
      name: "たいあたり",
      type: "normal",
      category: "physical",
      power: 40,
      accuracy: 100,
      pp: 35,
      priority: 0,
    };

    healParty(
      state.party,
      () => 50, // maxHp = 50
      () => moveDef,
    );

    expect(m.currentHp).toBe(50);
    expect(m.status).toBeNull();
    expect(m.moves[0].currentPp).toBe(35);
  });
});
