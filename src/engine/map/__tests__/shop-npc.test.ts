import { describe, it, expect } from "vitest";
import {
  SHOP_NPCS,
  getShopNpcByMapId,
  getShopNpcById,
  startShopSession,
  advanceShopSession,
  getShopMessage,
  getShopNpcCount,
} from "../shop-npc";

describe("ショップNPC定義", () => {
  it("7つ以上のショップNPCが定義されている", () => {
    expect(getShopNpcCount()).toBeGreaterThanOrEqual(7);
  });

  it("全ショップNPCに必須フィールドがある", () => {
    for (const shop of SHOP_NPCS) {
      expect(shop.npcId.length).toBeGreaterThan(0);
      expect(shop.mapId.length).toBeGreaterThan(0);
      expect(shop.shopName.length).toBeGreaterThan(0);
      expect(shop.greeting.length).toBeGreaterThan(0);
      expect(shop.purchaseMessage.length).toBeGreaterThan(0);
      expect(shop.exitMessage.length).toBeGreaterThan(0);
    }
  });

  it("NPC IDがユニーク", () => {
    const ids = SHOP_NPCS.map((s) => s.npcId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("マップIDがユニーク", () => {
    const mapIds = SHOP_NPCS.map((s) => s.mapId);
    expect(new Set(mapIds).size).toBe(mapIds.length);
  });
});

describe("ショップNPC検索", () => {
  it("マップIDで検索できる", () => {
    const shop = getShopNpcByMapId("wasuremachi");
    expect(shop).toBeDefined();
    expect(shop!.shopName).toContain("ワスレ町");
  });

  it("NPC IDで検索できる", () => {
    const shop = getShopNpcById("npc-shopkeeper-kawasemi");
    expect(shop).toBeDefined();
    expect(shop!.shopName).toContain("カワセミ");
  });

  it("存在しないマップIDはundefined", () => {
    expect(getShopNpcByMapId("nonexistent")).toBeUndefined();
  });

  it("存在しないNPC IDはundefined", () => {
    expect(getShopNpcById("nonexistent")).toBeUndefined();
  });
});

describe("買い物セッション", () => {
  const shopNpc = SHOP_NPCS[0];

  it("セッションを開始できる", () => {
    const session = startShopSession(shopNpc, 3);
    expect(session.phase).toBe("greeting");
    expect(session.badgeCount).toBe(3);
    expect(session.shopNpc.npcId).toBe(shopNpc.npcId);
  });

  it("買い物フェーズに移行できる", () => {
    const session = startShopSession(shopNpc, 3);
    const buySession = advanceShopSession(session, "buy");
    expect(buySession.phase).toBe("buy");
  });

  it("売却フェーズに移行できる", () => {
    const session = startShopSession(shopNpc, 3);
    const sellSession = advanceShopSession(session, "sell");
    expect(sellSession.phase).toBe("sell");
  });

  it("退出フェーズに移行できる", () => {
    const session = startShopSession(shopNpc, 3);
    const exitSession = advanceShopSession(session, "exit");
    expect(exitSession.phase).toBe("exit");
  });
});

describe("ショップメッセージ", () => {
  const shopNpc = SHOP_NPCS[0];

  it("greetingフェーズで挨拶メッセージ", () => {
    const session = startShopSession(shopNpc, 0);
    const msg = getShopMessage(session);
    expect(msg).toBe(shopNpc.greeting);
  });

  it("menuフェーズでメニューメッセージ", () => {
    const session = { ...startShopSession(shopNpc, 0), phase: "menu" as const };
    const msg = getShopMessage(session);
    expect(msg).toContain("何を");
  });

  it("exitフェーズで退出メッセージ", () => {
    const session = advanceShopSession(startShopSession(shopNpc, 0), "exit");
    const msg = getShopMessage(session);
    expect(msg).toBe(shopNpc.exitMessage);
  });

  it("各ショップの挨拶が異なる", () => {
    const greetings = SHOP_NPCS.map((s) => s.greeting);
    const uniqueGreetings = new Set(greetings);
    expect(uniqueGreetings.size).toBe(greetings.length);
  });
});
