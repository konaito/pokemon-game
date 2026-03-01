import { describe, it, expect } from "vitest";
import { ALL_ITEMS, getItemById, getAllItemIds } from "../items";
import { getShopItems } from "../items/shop-inventory";
import type { ItemCategory } from "@/types";

const validCategories: ItemCategory[] = ["ball", "medicine", "battle", "key"];

describe("ALL_ITEMS", () => {
  const items = Object.values(ALL_ITEMS);
  const itemIds = Object.keys(ALL_ITEMS);

  it("アイテムが定義されている", () => {
    expect(items.length).toBeGreaterThan(0);
  });

  it("IDとキーが一致する", () => {
    for (const [key, item] of Object.entries(ALL_ITEMS)) {
      expect(item.id).toBe(key);
    }
  });

  it.each(items.map((i) => [i.id, i]))("%s: 必須フィールドが存在する", (_id, item) => {
    expect(item.id).toBeTruthy();
    expect(item.name).toBeTruthy();
    expect(item.description).toBeTruthy();
    expect(validCategories).toContain(item.category);
    expect(typeof item.price).toBe("number");
    expect(item.price).toBeGreaterThanOrEqual(0);
    expect(typeof item.usableInBattle).toBe("boolean");
    expect(item.effect).toBeDefined();
  });

  it("effect typeが有効な値", () => {
    const validEffectTypes = [
      "heal_hp",
      "heal_status",
      "heal_pp",
      "heal_pp_one",
      "revive",
      "revive_full",
      "level_up",
      "ball",
      "none",
    ];
    for (const item of items) {
      expect(validEffectTypes).toContain(item.effect.type);
    }
  });
});

describe("getItemById", () => {
  it("有効なIDで取得できる", () => {
    const item = getItemById("potion");
    expect(item).toBeDefined();
    expect(item!.name).toBe("キズぐすり");
  });

  it("無効なIDでundefined", () => {
    expect(getItemById("nonexistent")).toBeUndefined();
  });
});

describe("getAllItemIds", () => {
  it("全アイテムIDの一覧を返す", () => {
    const ids = getAllItemIds();
    expect(ids.length).toBe(Object.keys(ALL_ITEMS).length);
  });
});

describe("getShopItems", () => {
  it("バッジ0で初期アイテムが買える", () => {
    const items = getShopItems(0);
    expect(items).toContain("potion");
    expect(items).toContain("monster-ball");
  });

  it("バッジ数増加で品揃えが増える", () => {
    const badge0 = getShopItems(0);
    const badge3 = getShopItems(3);
    expect(badge3.length).toBeGreaterThan(badge0.length);
  });

  it("ショップアイテムが全てALL_ITEMSに存在する", () => {
    const shopItems = getShopItems(8);
    for (const itemId of shopItems) {
      expect(ALL_ITEMS[itemId]).toBeDefined();
    }
  });
});
