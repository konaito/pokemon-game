import { describe, it, expect } from "vitest";
import { executeCaptureFlow } from "../capture-flow";
import { createPartyState, addMonster } from "../../monster/party";
import type { MonsterInstance } from "@/types";

function createDummyMonster(id: string = "wild"): MonsterInstance {
  return {
    uid: `test-${id}`,
    speciesId: id,
    level: 10,
    exp: 1000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 20,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

describe("捕獲フロー", () => {
  it("捕獲成功時にパーティに追加される", () => {
    const state = createPartyState();
    addMonster(state, createDummyMonster("ally"));
    const target = createDummyMonster("wild");

    const result = executeCaptureFlow(
      {
        maxHp: 40,
        currentHp: 20,
        baseCatchRate: 255,
        ballModifier: 2,
        status: null,
      },
      target,
      state,
      "モンスターボール",
      () => 0, // 確定捕獲
    );

    expect(result.catchResult.caught).toBe(true);
    expect(result.destination).toBe("party");
    expect(state.party).toHaveLength(2);
    expect(result.messages).toContain("やった！ 捕まえた！");
  });

  it("パーティが満杯ならボックスに送られる", () => {
    const state = createPartyState();
    for (let i = 0; i < 6; i++) {
      addMonster(state, createDummyMonster(`ally-${i}`));
    }
    const target = createDummyMonster("wild");

    const result = executeCaptureFlow(
      {
        maxHp: 40,
        currentHp: 20,
        baseCatchRate: 255,
        ballModifier: 2,
        status: null,
      },
      target,
      state,
      "モンスターボール",
      () => 0,
    );

    expect(result.catchResult.caught).toBe(true);
    expect(result.destination).toBe("box");
    expect(result.boxIndex).toBe(0);
    expect(state.boxes[0]).toHaveLength(1);
  });

  it("捕獲失敗時にパーティに追加されない", () => {
    const state = createPartyState();
    addMonster(state, createDummyMonster("ally"));
    const target = createDummyMonster("wild");

    const result = executeCaptureFlow(
      {
        maxHp: 100,
        currentHp: 100,
        baseCatchRate: 3,
        ballModifier: 1,
        status: null,
      },
      target,
      state,
      "モンスターボール",
      () => 65535, // 確定失敗
    );

    expect(result.catchResult.caught).toBe(false);
    expect(result.destination).toBeUndefined();
    expect(state.party).toHaveLength(1);
  });

  it("揺れ0回のメッセージが正しい", () => {
    const state = createPartyState();
    const target = createDummyMonster("wild");

    const result = executeCaptureFlow(
      {
        maxHp: 100,
        currentHp: 100,
        baseCatchRate: 3,
        ballModifier: 1,
        status: null,
      },
      target,
      state,
      "スーパーボール",
      () => 65535,
    );

    expect(result.messages[0]).toBe("スーパーボールを投げた！");
    expect(result.messages).toContain("だめだ！ ボールから出てしまった！");
  });

  it("揺れ途中失敗のメッセージが正しい", () => {
    const state = createPartyState();
    const target = createDummyMonster("wild");

    let callCount = 0;
    const result = executeCaptureFlow(
      {
        maxHp: 100,
        currentHp: 50,
        baseCatchRate: 100,
        ballModifier: 1,
        status: null,
      },
      target,
      state,
      "モンスターボール",
      () => {
        callCount++;
        return callCount <= 1 ? 0 : 65535;
      },
    );

    expect(result.catchResult.shakeCount).toBe(1);
    expect(result.messages).toContain("ぽん…");
    expect(result.messages).toContain("あっ！ もう少しだったのに！");
  });
});
