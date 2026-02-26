import { describe, it, expect } from "vitest";
import { buyItem, sellItem } from "../shop";
import { createBag, getItemCount } from "../../item/bag";
import type { ItemDefinition } from "@/types";

const potion: ItemDefinition = {
  id: "potion",
  name: "キズぐすり",
  description: "HPを20回復する",
  category: "medicine",
  price: 300,
  usableInBattle: true,
  effect: { type: "heal_hp", amount: 20 },
};

const masterBall: ItemDefinition = {
  id: "master-ball",
  name: "マスターボール",
  description: "絶対に捕まえるボール",
  category: "ball",
  price: 0,
  usableInBattle: true,
  effect: { type: "ball", catchRateModifier: 255 },
};

describe("ショップシステム", () => {
  describe("buyItem", () => {
    it("所持金が足りれば購入できる", () => {
      const wallet = { money: 1000 };
      const bag = createBag();
      const result = buyItem(wallet, bag, potion, 2);
      expect(result.success).toBe(true);
      expect(wallet.money).toBe(400); // 1000 - 300*2
      expect(getItemCount(bag, "potion")).toBe(2);
    });

    it("所持金不足では購入できない", () => {
      const wallet = { money: 100 };
      const bag = createBag();
      const result = buyItem(wallet, bag, potion, 1);
      expect(result.success).toBe(false);
      expect(wallet.money).toBe(100);
      expect(getItemCount(bag, "potion")).toBe(0);
    });

    it("個数0以下では購入できない", () => {
      const wallet = { money: 1000 };
      const bag = createBag();
      const result = buyItem(wallet, bag, potion, 0);
      expect(result.success).toBe(false);
    });
  });

  describe("sellItem", () => {
    it("アイテムを半額で売却できる", () => {
      const wallet = { money: 0 };
      const bag = createBag();
      bag.items.push({ itemId: "potion", quantity: 3 });

      const result = sellItem(wallet, bag, potion, 2);
      expect(result.success).toBe(true);
      expect(wallet.money).toBe(300); // (300/2)*2 = 300
      expect(getItemCount(bag, "potion")).toBe(1);
    });

    it("所持していないアイテムは売れない", () => {
      const wallet = { money: 0 };
      const bag = createBag();
      const result = sellItem(wallet, bag, potion, 1);
      expect(result.success).toBe(false);
    });

    it("価格0のアイテムは売れない", () => {
      const wallet = { money: 0 };
      const bag = createBag();
      bag.items.push({ itemId: "master-ball", quantity: 1 });

      const result = sellItem(wallet, bag, masterBall, 1);
      expect(result.success).toBe(false);
      expect(getItemCount(bag, "master-ball")).toBe(1);
    });
  });
});
