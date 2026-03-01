import { describe, it, expect } from "vitest";
import { initBattle, getActiveMonster } from "../state-machine";
import { createStatStages } from "../stat-stage";
import type { MonsterInstance } from "@/types";

function createMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    uid: "test-sm",
    speciesId: "test-monster",
    level: 50,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [],
    status: null,
    ...overrides,
  };
}

describe("initBattle", () => {
  it("初期フェーズは action_select", () => {
    const state = initBattle([createMonster()], [createMonster()], "wild");
    expect(state.phase).toBe("action_select");
  });

  it("ターン番号は1から始まる", () => {
    const state = initBattle([createMonster()], [createMonster()], "wild");
    expect(state.turnNumber).toBe(1);
  });

  it("逃走試行回数は0", () => {
    const state = initBattle([createMonster()], [createMonster()], "wild");
    expect(state.escapeAttempts).toBe(0);
  });

  it("メッセージは空配列", () => {
    const state = initBattle([createMonster()], [createMonster()], "wild");
    expect(state.messages).toEqual([]);
  });

  it("結果はnull", () => {
    const state = initBattle([createMonster()], [createMonster()], "wild");
    expect(state.result).toBeNull();
  });

  it("能力変化ステージは初期値（全て0）", () => {
    const state = initBattle([createMonster()], [createMonster()], "wild");
    expect(state.player.statStages).toEqual(createStatStages());
    expect(state.opponent.statStages).toEqual(createStatStages());
  });

  it("battleType が正しく設定される", () => {
    const wild = initBattle([createMonster()], [createMonster()], "wild");
    expect(wild.battleType).toBe("wild");

    const trainer = initBattle([createMonster()], [createMonster()], "trainer");
    expect(trainer.battleType).toBe("trainer");
  });

  it("先頭が瀕死の場合、生存メンバーをアクティブにする", () => {
    const fainted = createMonster({ uid: "fainted", currentHp: 0 });
    const alive = createMonster({ uid: "alive", currentHp: 50 });
    const state = initBattle([fainted, alive], [createMonster()], "wild");
    expect(state.player.activeIndex).toBe(1);
  });

  it("全員が瀕死の場合でもインデックス0にフォールバック", () => {
    const fainted1 = createMonster({ uid: "f1", currentHp: 0 });
    const fainted2 = createMonster({ uid: "f2", currentHp: 0 });
    const state = initBattle([fainted1, fainted2], [createMonster()], "wild");
    expect(state.player.activeIndex).toBe(0);
  });

  it("相手側も先頭瀕死時に生存メンバーを選ぶ", () => {
    const fainted = createMonster({ uid: "opp-fainted", currentHp: 0 });
    const alive = createMonster({ uid: "opp-alive", currentHp: 80 });
    const state = initBattle([createMonster()], [fainted, alive], "wild");
    expect(state.opponent.activeIndex).toBe(1);
  });
});

describe("getActiveMonster", () => {
  it("アクティブインデックスのモンスターを返す", () => {
    const m1 = createMonster({ uid: "m1" });
    const m2 = createMonster({ uid: "m2" });
    const state = initBattle([m1, m2], [createMonster()], "wild");
    expect(getActiveMonster(state.player).uid).toBe("m1");
  });

  it("先頭瀕死時は生存メンバーを返す", () => {
    const fainted = createMonster({ uid: "fainted", currentHp: 0 });
    const alive = createMonster({ uid: "alive", currentHp: 50 });
    const state = initBattle([fainted, alive], [createMonster()], "wild");
    expect(getActiveMonster(state.player).uid).toBe("alive");
  });
});
