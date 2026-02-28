import { describe, it, expect } from "vitest";
import {
  calculateRewardPrizeMoney,
  calculateDefeatPenalty,
  getVictoryRewardMessage,
  getDefeatPenaltyMessage,
  getShopItems,
  GYM_PRIZE_TABLE,
  SHOP_INVENTORY,
} from "../rewards";

describe("calculateRewardPrizeMoney", () => {
  it("一般トレーナー: レベル×40", () => {
    expect(calculateRewardPrizeMoney(10, "normal")).toBe(400);
    expect(calculateRewardPrizeMoney(30, "normal")).toBe(1200);
  });

  it("ジムリーダー: レベル×200", () => {
    expect(calculateRewardPrizeMoney(15, "gym_leader")).toBe(3000);
    expect(calculateRewardPrizeMoney(50, "gym_leader")).toBe(10000);
  });

  it("四天王: レベル×300", () => {
    expect(calculateRewardPrizeMoney(50, "elite_four")).toBe(15000);
  });

  it("チャンピオン: レベル×500", () => {
    expect(calculateRewardPrizeMoney(60, "champion")).toBe(30000);
  });

  it("おまもりこばん所持で2倍", () => {
    expect(calculateRewardPrizeMoney(30, "normal", true)).toBe(2400);
    expect(calculateRewardPrizeMoney(50, "gym_leader", true)).toBe(20000);
  });
});

describe("calculateDefeatPenalty", () => {
  it("所持金の半分を失う", () => {
    const result = calculateDefeatPenalty(1000);
    expect(result.lostAmount).toBe(500);
    expect(result.remainingMoney).toBe(500);
  });

  it("奇数の場合は切り捨て", () => {
    const result = calculateDefeatPenalty(1001);
    expect(result.lostAmount).toBe(500);
    expect(result.remainingMoney).toBe(501);
  });

  it("100円以下ではペナルティなし", () => {
    const result = calculateDefeatPenalty(100);
    expect(result.lostAmount).toBe(0);
    expect(result.remainingMoney).toBe(100);
  });

  it("0円ではペナルティなし", () => {
    const result = calculateDefeatPenalty(0);
    expect(result.lostAmount).toBe(0);
    expect(result.remainingMoney).toBe(0);
  });

  it("最低100円は残る", () => {
    const result = calculateDefeatPenalty(150);
    expect(result.remainingMoney).toBeGreaterThanOrEqual(100);
  });
});

describe("メッセージ生成", () => {
  it("勝利メッセージに賞金額が含まれる", () => {
    const msg = getVictoryRewardMessage(5000);
    expect(msg).toContain("5000");
    expect(msg).toContain("円");
  });

  it("敗北メッセージに損失額が含まれる", () => {
    const msgs = getDefeatPenaltyMessage(500);
    expect(msgs.length).toBe(2);
    expect(msgs[0]).toContain("真っ暗");
    expect(msgs[1]).toContain("500");
  });

  it("損失0の場合は暗転メッセージのみ", () => {
    const msgs = getDefeatPenaltyMessage(0);
    expect(msgs.length).toBe(1);
    expect(msgs[0]).toContain("真っ暗");
  });
});

describe("getShopItems", () => {
  it("バッジ0個では基本アイテムのみ", () => {
    const items = getShopItems(0);
    expect(items).toContain("potion");
    expect(items).toContain("monster-ball");
    expect(items).not.toContain("super-ball");
  });

  it("バッジ2個でスーパーボール解禁", () => {
    const items = getShopItems(2);
    expect(items).toContain("super-ball");
    expect(items).toContain("super-potion");
  });

  it("バッジ4個でハイパーボールとげんきのかけら解禁", () => {
    const items = getShopItems(4);
    expect(items).toContain("hyper-ball");
    expect(items).toContain("revive");
  });

  it("バッジ6個でかいふくのくすり解禁", () => {
    const items = getShopItems(6);
    expect(items).toContain("full-restore");
  });

  it("バッジ8個で全アイテム解禁", () => {
    const items = getShopItems(8);
    expect(items).toHaveLength(SHOP_INVENTORY.length);
  });

  it("バッジ数が増えると品揃えが増える", () => {
    const items0 = getShopItems(0);
    const items4 = getShopItems(4);
    const items8 = getShopItems(8);
    expect(items4.length).toBeGreaterThan(items0.length);
    expect(items8.length).toBeGreaterThan(items4.length);
  });
});

describe("GYM_PRIZE_TABLE", () => {
  it("8つのジムの賞金が定義されている", () => {
    expect(Object.keys(GYM_PRIZE_TABLE)).toHaveLength(8);
  });

  it("ジム番号が上がるほど賞金が高い", () => {
    for (let i = 1; i < 8; i++) {
      expect(GYM_PRIZE_TABLE[i + 1]).toBeGreaterThan(GYM_PRIZE_TABLE[i]);
    }
  });

  it("ジム1の賞金は3000円", () => {
    expect(GYM_PRIZE_TABLE[1]).toBe(3000);
  });

  it("ジム8の賞金は10000円", () => {
    expect(GYM_PRIZE_TABLE[8]).toBe(10000);
  });
});
