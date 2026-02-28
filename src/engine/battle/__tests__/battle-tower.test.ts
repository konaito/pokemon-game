import { describe, it, expect } from "vitest";
import {
  createBattleTowerState,
  recordWin,
  recordLoss,
  getBpReward,
  getTowerLevel,
  isBossRound,
  getAvailableRewards,
  getNewRewards,
  getTrainerName,
  TOWER_REWARDS,
} from "../battle-tower";

describe("BattleTowerState", () => {
  it("初期状態", () => {
    const state = createBattleTowerState();
    expect(state.winStreak).toBe(0);
    expect(state.bestStreak).toBe(0);
    expect(state.battlePoints).toBe(0);
    expect(state.currentRound).toBe(0);
  });

  it("勝利で連勝数とBPが増加", () => {
    let state = createBattleTowerState();
    state = recordWin(state);
    expect(state.winStreak).toBe(1);
    expect(state.battlePoints).toBe(1);
    expect(state.bestStreak).toBe(1);
  });

  it("連続勝利でBPが累積", () => {
    let state = createBattleTowerState();
    for (let i = 0; i < 5; i++) state = recordWin(state);
    expect(state.winStreak).toBe(5);
    expect(state.battlePoints).toBe(5);
  });

  it("敗北で連勝がリセット", () => {
    let state = createBattleTowerState();
    for (let i = 0; i < 5; i++) state = recordWin(state);
    state = recordLoss(state);
    expect(state.winStreak).toBe(0);
    expect(state.bestStreak).toBe(5);
    expect(state.battlePoints).toBe(5); // BPは保持
  });

  it("最高記録は更新され続ける", () => {
    let state = createBattleTowerState();
    for (let i = 0; i < 10; i++) state = recordWin(state);
    state = recordLoss(state);
    for (let i = 0; i < 5; i++) state = recordWin(state);
    expect(state.bestStreak).toBe(10);
  });
});

describe("getBpReward", () => {
  it("1-9連勝: 1BP", () => {
    expect(getBpReward(1)).toBe(1);
    expect(getBpReward(9)).toBe(1);
  });

  it("10-19連勝: 3BP", () => {
    expect(getBpReward(10)).toBe(3);
    expect(getBpReward(19)).toBe(3);
  });

  it("20-49連勝: 5BP", () => {
    expect(getBpReward(20)).toBe(5);
    expect(getBpReward(49)).toBe(5);
  });

  it("50連勝以上: 10BP", () => {
    expect(getBpReward(50)).toBe(10);
    expect(getBpReward(100)).toBe(10);
  });
});

describe("getTowerLevel", () => {
  it("初期はLv50", () => {
    expect(getTowerLevel(0)).toBe(50);
  });

  it("連勝で徐々に上昇", () => {
    expect(getTowerLevel(5)).toBe(52);
    expect(getTowerLevel(10)).toBe(54);
    expect(getTowerLevel(25)).toBe(60);
  });

  it("最大Lv100", () => {
    expect(getTowerLevel(200)).toBe(100);
  });
});

describe("isBossRound", () => {
  it("10の倍数がボス", () => {
    expect(isBossRound(10)).toBe(true);
    expect(isBossRound(20)).toBe(true);
    expect(isBossRound(50)).toBe(true);
  });

  it("10の倍数以外はボスでない", () => {
    expect(isBossRound(0)).toBe(false);
    expect(isBossRound(1)).toBe(false);
    expect(isBossRound(9)).toBe(false);
    expect(isBossRound(11)).toBe(false);
  });
});

describe("報酬", () => {
  it("TOWER_REWARDSに5つの報酬がある", () => {
    expect(TOWER_REWARDS).toHaveLength(5);
  });

  it("getAvailableRewards: 連勝数以下の報酬を返す", () => {
    expect(getAvailableRewards(0)).toHaveLength(0);
    expect(getAvailableRewards(10)).toHaveLength(1);
    expect(getAvailableRewards(50)).toHaveLength(4);
    expect(getAvailableRewards(100)).toHaveLength(5);
  });

  it("getNewRewards: 差分のみ返す", () => {
    const rewards = getNewRewards(20, 10);
    expect(rewards).toHaveLength(1);
    expect(rewards[0].streak).toBe(20);
  });

  it("getNewRewards: 変化なしなら空", () => {
    expect(getNewRewards(15, 10)).toHaveLength(0);
  });
});

describe("getTrainerName", () => {
  it("通常ラウンドのトレーナー名を返す", () => {
    const name = getTrainerName(1);
    expect(name.length).toBeGreaterThan(0);
  });

  it("ボスラウンドではチャンピオン名を返す", () => {
    const name = getTrainerName(10);
    expect(name).toContain("チャンピオン");
  });

  it("異なるラウンドで異なるトレーナー名", () => {
    const name1 = getTrainerName(1);
    const name2 = getTrainerName(2);
    expect(name1).not.toBe(name2);
  });
});
