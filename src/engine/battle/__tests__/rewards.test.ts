import { describe, it, expect } from "vitest";
import {
  calculatePrizeMoney,
  calculateDefeatPenalty,
  getShopTier,
  getAvailableShopItems,
} from "../rewards";

describe("calculatePrizeMoney", () => {
  it("一般トレーナー: レベル × 40", () => {
    expect(calculatePrizeMoney(30, "normal")).toBe(1200);
  });

  it("ジムリーダー: レベル × 200", () => {
    expect(calculatePrizeMoney(30, "gym_leader")).toBe(6000);
  });

  it("四天王: レベル × 300", () => {
    expect(calculatePrizeMoney(50, "elite_four")).toBe(15000);
  });

  it("チャンピオン: レベル × 500", () => {
    expect(calculatePrizeMoney(60, "champion")).toBe(30000);
  });

  it("デフォルトは一般トレーナー", () => {
    expect(calculatePrizeMoney(10)).toBe(400);
  });

  it("レベル1のトレーナー", () => {
    expect(calculatePrizeMoney(1, "normal")).toBe(40);
  });
});

describe("calculateDefeatPenalty", () => {
  it("所持金の半分を失う", () => {
    expect(calculateDefeatPenalty(1000)).toBe(500);
  });

  it("最低100円は残る", () => {
    expect(calculateDefeatPenalty(150)).toBe(50); // 150 - 50 = 100残る
  });

  it("所持金100円以下ではペナルティなし", () => {
    expect(calculateDefeatPenalty(100)).toBe(0);
    expect(calculateDefeatPenalty(50)).toBe(0);
    expect(calculateDefeatPenalty(0)).toBe(0);
  });

  it("奇数の所持金は切り捨て", () => {
    expect(calculateDefeatPenalty(1001)).toBe(500); // floor(1001/2) = 500
  });
});

describe("getShopTier", () => {
  it("バッジ0個はティア1", () => {
    expect(getShopTier(0)).toBe(1);
  });

  it("バッジ1個はティア1", () => {
    expect(getShopTier(1)).toBe(1);
  });

  it("バッジ2個はティア2", () => {
    expect(getShopTier(2)).toBe(2);
  });

  it("バッジ4個はティア3", () => {
    expect(getShopTier(4)).toBe(3);
  });

  it("バッジ6個はティア4", () => {
    expect(getShopTier(6)).toBe(4);
  });

  it("バッジ8個はティア5", () => {
    expect(getShopTier(8)).toBe(5);
  });
});

describe("getAvailableShopItems", () => {
  it("バッジ0個は基本アイテムのみ", () => {
    const items = getAvailableShopItems(0);
    expect(items).toContain("potion");
    expect(items).toContain("monster-ball");
    expect(items).not.toContain("super-ball");
  });

  it("バッジ2個でスーパーボール追加", () => {
    const items = getAvailableShopItems(2);
    expect(items).toContain("super-ball");
  });

  it("バッジ4個でハイパーボール追加", () => {
    const items = getAvailableShopItems(4);
    expect(items).toContain("hyper-ball");
  });

  it("バッジ8個で最上位アイテム", () => {
    const items = getAvailableShopItems(8);
    expect(items).toContain("full-restore");
    expect(items).toContain("max-revive");
  });
});
