import { describe, it, expect, beforeEach } from "vitest";
import {
  calculatePrizeMoney,
  getAceLevel,
  calculateLossPenalty,
  resolveTrainerClass,
  setGymLeaderNames,
} from "../prize-money";

describe("賞金計算", () => {
  beforeEach(() => {
    setGymLeaderNames(["マサキ", "カイコ", "ライゾウ", "カガリ"]);
  });

  describe("calculatePrizeMoney", () => {
    it("一般トレーナー: レベル×40", () => {
      expect(calculatePrizeMoney(12, "normal")).toBe(480);
    });

    it("ジムリーダー: レベル×200", () => {
      expect(calculatePrizeMoney(28, "gym_leader")).toBe(5600);
    });

    it("四天王: レベル×300", () => {
      expect(calculatePrizeMoney(50, "elite_four")).toBe(15000);
    });

    it("チャンピオン: レベル×500", () => {
      expect(calculatePrizeMoney(60, "champion")).toBe(30000);
    });
  });

  describe("getAceLevel", () => {
    it("パーティの最高レベルを返す", () => {
      expect(getAceLevel([10, 12, 8])).toBe(12);
    });

    it("1体のパーティ", () => {
      expect(getAceLevel([25])).toBe(25);
    });
  });

  describe("resolveTrainerClass", () => {
    it("チャンピオンを含む名前はchampion", () => {
      expect(resolveTrainerClass("チャンピオン アカツキ")).toBe("champion");
    });

    it("四天王を含む名前はelite_four", () => {
      expect(resolveTrainerClass("四天王 ツバサ")).toBe("elite_four");
    });

    it("登録済みジムリーダー名はgym_leader", () => {
      expect(resolveTrainerClass("マサキ")).toBe("gym_leader");
      expect(resolveTrainerClass("カイコ")).toBe("gym_leader");
    });

    it("未登録のトレーナー名はnormal", () => {
      expect(resolveTrainerClass("たんぱんこぞう")).toBe("normal");
    });
  });

  describe("calculateLossPenalty", () => {
    it("所持金の半分を失う", () => {
      expect(calculateLossPenalty(10000)).toBe(5000);
    });

    it("奇数の所持金は切り捨て", () => {
      expect(calculateLossPenalty(3001)).toBe(1500);
    });

    it("所持金100以下はペナルティなし", () => {
      expect(calculateLossPenalty(100)).toBe(0);
      expect(calculateLossPenalty(50)).toBe(0);
      expect(calculateLossPenalty(0)).toBe(0);
    });
  });
});
