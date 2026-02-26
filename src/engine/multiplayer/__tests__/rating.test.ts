import { describe, it, expect } from "vitest";
import {
  calculateExpectedScore,
  calculateNewRating,
  calculateRatingChange,
  getRank,
  seasonReset,
  createPlayerRating,
  applyBattleResult,
} from "../rating";

describe("レーティングシステム", () => {
  describe("calculateExpectedScore", () => {
    it("同レーティングなら期待勝率0.5", () => {
      const expected = calculateExpectedScore(1500, 1500);
      expect(expected).toBeCloseTo(0.5, 5);
    });

    it("レーティングが高い方の期待勝率が高い", () => {
      const expected = calculateExpectedScore(1700, 1500);
      expect(expected).toBeGreaterThan(0.5);
    });

    it("レーティングが低い方の期待勝率が低い", () => {
      const expected = calculateExpectedScore(1300, 1500);
      expect(expected).toBeLessThan(0.5);
    });

    it("400差で約76%の期待勝率", () => {
      const expected = calculateExpectedScore(1900, 1500);
      expect(expected).toBeCloseTo(0.909, 2);
    });

    it("期待勝率の合計は常に1", () => {
      const a = calculateExpectedScore(1600, 1400);
      const b = calculateExpectedScore(1400, 1600);
      expect(a + b).toBeCloseTo(1, 5);
    });
  });

  describe("calculateNewRating", () => {
    it("勝利するとレーティングが上がる", () => {
      const newRating = calculateNewRating(1500, 0.5, 1);
      expect(newRating).toBeGreaterThan(1500);
    });

    it("敗北するとレーティングが下がる", () => {
      const newRating = calculateNewRating(1500, 0.5, 0);
      expect(newRating).toBeLessThan(1500);
    });

    it("引き分けで期待通りならレーティング変動なし", () => {
      const newRating = calculateNewRating(1500, 0.5, 0.5);
      expect(newRating).toBe(1500);
    });

    it("最低レーティングの1000を下回らない", () => {
      const newRating = calculateNewRating(1000, 0.9, 0);
      expect(newRating).toBe(1000);
    });
  });

  describe("calculateRatingChange", () => {
    it("A勝利時、Aのレーティングが上がりBが下がる", () => {
      const [newA, newB] = calculateRatingChange(1500, 1500, "a_wins");
      expect(newA).toBeGreaterThan(1500);
      expect(newB).toBeLessThan(1500);
    });

    it("B勝利時、Bのレーティングが上がりAが下がる", () => {
      const [newA, newB] = calculateRatingChange(1500, 1500, "b_wins");
      expect(newA).toBeLessThan(1500);
      expect(newB).toBeGreaterThan(1500);
    });

    it("引き分け時、同レーティングなら変動なし", () => {
      const [newA, newB] = calculateRatingChange(1500, 1500, "draw");
      expect(newA).toBe(1500);
      expect(newB).toBe(1500);
    });

    it("弱者が強者に勝つと大きくレーティング変動する", () => {
      const [newA, newB] = calculateRatingChange(1300, 1700, "a_wins");
      // 1300が1700に勝つ = 期待値以上 = 大幅アップ
      expect(newA - 1300).toBeGreaterThan(20);
      expect(1700 - newB).toBeGreaterThan(20);
    });
  });

  describe("getRank", () => {
    it("1000でブロンズ", () => {
      expect(getRank(1000).tier).toBe("bronze");
    });

    it("1500でゴールド", () => {
      expect(getRank(1500).tier).toBe("gold");
    });

    it("2100でマスター", () => {
      expect(getRank(2100).tier).toBe("master");
    });

    it("1299でブロンズ（境界）", () => {
      expect(getRank(1299).tier).toBe("bronze");
    });

    it("1300でシルバー（境界）", () => {
      expect(getRank(1300).tier).toBe("silver");
    });
  });

  describe("seasonReset", () => {
    it("1500は1500のまま", () => {
      expect(seasonReset(1500)).toBe(1500);
    });

    it("2000は1750になる", () => {
      expect(seasonReset(2000)).toBe(1750);
    });

    it("1000は1250になる", () => {
      expect(seasonReset(1000)).toBe(1250);
    });
  });

  describe("createPlayerRating", () => {
    it("デフォルトレーティング1500で作成", () => {
      const player = createPlayerRating("player1", 1);
      expect(player.rating).toBe(1500);
      expect(player.wins).toBe(0);
      expect(player.losses).toBe(0);
      expect(player.draws).toBe(0);
      expect(player.season).toBe(1);
    });
  });

  describe("applyBattleResult", () => {
    it("勝利でレーティングが上がりwinsが増える", () => {
      const player = createPlayerRating("p1", 1);
      const updated = applyBattleResult(player, 1500, "win");
      expect(updated.rating).toBeGreaterThan(1500);
      expect(updated.wins).toBe(1);
      expect(updated.losses).toBe(0);
    });

    it("敗北でレーティングが下がりlossesが増える", () => {
      const player = createPlayerRating("p1", 1);
      const updated = applyBattleResult(player, 1500, "loss");
      expect(updated.rating).toBeLessThan(1500);
      expect(updated.wins).toBe(0);
      expect(updated.losses).toBe(1);
    });

    it("引き分けでdrawsが増える", () => {
      const player = createPlayerRating("p1", 1);
      const updated = applyBattleResult(player, 1500, "draw");
      expect(updated.draws).toBe(1);
    });
  });
});
