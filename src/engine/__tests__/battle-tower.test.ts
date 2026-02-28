import { describe, it, expect } from "vitest";
import {
  createBattleTowerState,
  getDifficulty,
  generateTowerTrainer,
  generateTowerParty,
  calculateBpReward,
  isRestPoint,
  isBossBattle,
  startChallenge,
  recordWin,
  recordLoss,
  forfeitChallenge,
} from "../battle-tower";

describe("createBattleTowerState", () => {
  it("初期状態を正しく生成する", () => {
    const state = createBattleTowerState();
    expect(state.currentStreak).toBe(0);
    expect(state.bestStreak).toBe(0);
    expect(state.inChallenge).toBe(false);
    expect(state.currentFloor).toBe(0);
    expect(state.battlePoints).toBe(0);
  });
});

describe("getDifficulty", () => {
  it("1-10連勝: 基本難易度", () => {
    const diff = getDifficulty(5);
    expect(diff.level).toBe(50);
    expect(diff.ivRange).toEqual([0, 31]);
    expect(diff.aiType).toBe("basic");
  });

  it("11-20連勝: IV高め", () => {
    const diff = getDifficulty(15);
    expect(diff.ivRange).toEqual([20, 31]);
    expect(diff.aiType).toBe("basic");
  });

  it("21-49連勝: 最高IV + スマートAI", () => {
    const diff = getDifficulty(30);
    expect(diff.ivRange).toEqual([31, 31]);
    expect(diff.aiType).toBe("smart");
  });

  it("50連勝: ボス戦", () => {
    const diff = getDifficulty(50);
    expect(diff.ivRange).toEqual([31, 31]);
    expect(diff.aiType).toBe("smart_plus");
  });
});

describe("generateTowerTrainer", () => {
  it("3体のパーティを生成する", () => {
    const trainer = generateTowerTrainer(5, () => 0.5);
    expect(trainer.party.length).toBe(3);
    expect(trainer.name).toBeTruthy();
  });

  it("パーティに重複がない", () => {
    const trainer = generateTowerTrainer(5, () => 0.1);
    const unique = new Set(trainer.party);
    expect(unique.size).toBe(trainer.party.length);
  });

  it("50戦目（0-indexed 49）はボストレーナー", () => {
    const trainer = generateTowerTrainer(49, () => 0.5);
    expect(trainer.name).toContain("タイクーン");
  });
});

describe("generateTowerParty", () => {
  it("難易度に応じたレベルのパーティを生成する", () => {
    const trainer = generateTowerTrainer(5, () => 0.5);
    const difficulty = getDifficulty(5);
    const party = generateTowerParty(trainer, difficulty, () => 0.5);
    expect(party.length).toBe(3);
    party.forEach((m) => {
      expect(m.level).toBe(50);
    });
  });

  it("高難易度ではIVが高い", () => {
    const trainer = generateTowerTrainer(50, () => 0.5);
    const difficulty = getDifficulty(50);
    const party = generateTowerParty(trainer, difficulty, () => 0.5);
    party.forEach((m) => {
      expect(m.ivs.hp).toBe(31);
      expect(m.ivs.atk).toBe(31);
    });
  });
});

describe("calculateBpReward", () => {
  it("序盤は2BP", () => {
    expect(calculateBpReward(5)).toBe(2);
  });

  it("11連勝以降は3BP", () => {
    expect(calculateBpReward(15)).toBe(3);
  });

  it("21連勝以降は5BP", () => {
    expect(calculateBpReward(30)).toBe(5);
  });

  it("50連勝ボスは20BP", () => {
    expect(calculateBpReward(50)).toBe(20);
  });
});

describe("isRestPoint", () => {
  it("7の倍数は休憩ポイント", () => {
    expect(isRestPoint(7)).toBe(true);
    expect(isRestPoint(14)).toBe(true);
    expect(isRestPoint(21)).toBe(true);
  });

  it("0は休憩ポイントでない", () => {
    expect(isRestPoint(0)).toBe(false);
  });

  it("7の倍数以外は休憩ポイントでない", () => {
    expect(isRestPoint(5)).toBe(false);
    expect(isRestPoint(10)).toBe(false);
  });
});

describe("isBossBattle", () => {
  it("50はボス戦", () => {
    expect(isBossBattle(50)).toBe(true);
  });

  it("それ以外はボス戦でない", () => {
    expect(isBossBattle(49)).toBe(false);
    expect(isBossBattle(51)).toBe(false);
  });
});

describe("チャレンジフロー", () => {
  it("チャレンジ開始→勝利→連勝記録更新", () => {
    let state = createBattleTowerState();
    state = startChallenge(state);
    expect(state.inChallenge).toBe(true);
    expect(state.currentStreak).toBe(0);

    state = recordWin(state);
    expect(state.currentStreak).toBe(1);
    expect(state.bestStreak).toBe(1);
    expect(state.battlePoints).toBeGreaterThan(0);
  });

  it("敗北でチャレンジ終了、連勝記録は保持", () => {
    let state = createBattleTowerState();
    state = startChallenge(state);
    state = recordWin(state);
    state = recordWin(state);
    state = recordWin(state);
    expect(state.bestStreak).toBe(3);

    state = recordLoss(state);
    expect(state.inChallenge).toBe(false);
    expect(state.currentStreak).toBe(0);
    expect(state.bestStreak).toBe(3); // 最高記録は残る
  });

  it("リタイアで連勝記録は保持、チャレンジ終了", () => {
    let state = createBattleTowerState();
    state = startChallenge(state);
    state = recordWin(state);
    state = recordWin(state);

    state = forfeitChallenge(state);
    expect(state.inChallenge).toBe(false);
    expect(state.currentStreak).toBe(2); // リタイアでは連勝数リセットしない
    expect(state.bestStreak).toBe(2);
  });

  it("BPが蓄積される", () => {
    let state = createBattleTowerState();
    state = startChallenge(state);
    for (let i = 0; i < 10; i++) {
      state = recordWin(state);
    }
    expect(state.battlePoints).toBe(20); // 10 × 2BP
  });
});
