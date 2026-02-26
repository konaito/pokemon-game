import { describe, it, expect } from "vitest";
import {
  createBag,
  addItem,
  removeItem,
  getItemCount,
  getItemsByCategory,
  useHealItem,
} from "../bag";
import type { ItemDefinition, MonsterInstance } from "@/types";

function createDummyMonster(hp: number = 30): MonsterInstance {
  return {
    uid: "test-bag",
    speciesId: "test",
    level: 10,
    exp: 1000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: hp,
    moves: [{ moveId: "tackle", currentPp: 10 }],
    status: null,
  };
}

const potion: ItemDefinition = {
  id: "potion",
  name: "キズぐすり",
  description: "HPを20回復する",
  category: "medicine",
  price: 300,
  usableInBattle: true,
  effect: { type: "heal_hp", amount: 20 },
};

const antidote: ItemDefinition = {
  id: "antidote",
  name: "どくけし",
  description: "毒を治す",
  category: "medicine",
  price: 100,
  usableInBattle: true,
  effect: { type: "heal_status", status: "poison" },
};

const fullHeal: ItemDefinition = {
  id: "full-heal",
  name: "なんでもなおし",
  description: "状態異常を全て治す",
  category: "medicine",
  price: 600,
  usableInBattle: true,
  effect: { type: "heal_status", status: "all" },
};

const monsterBall: ItemDefinition = {
  id: "monster-ball",
  name: "モンスターボール",
  description: "モンスターを捕まえるボール",
  category: "ball",
  price: 200,
  usableInBattle: true,
  effect: { type: "ball", catchRateModifier: 1 },
};

const itemResolver = (id: string): ItemDefinition => {
  const map: Record<string, ItemDefinition> = {
    potion,
    antidote,
    "full-heal": fullHeal,
    "monster-ball": monsterBall,
  };
  return map[id];
};

describe("バッグ管理", () => {
  it("空のバッグを作成できる", () => {
    const bag = createBag();
    expect(bag.items).toHaveLength(0);
  });

  it("アイテムを追加できる", () => {
    const bag = createBag();
    addItem(bag, "potion", 3);
    expect(getItemCount(bag, "potion")).toBe(3);
  });

  it("同じアイテムを追加すると個数が加算される", () => {
    const bag = createBag();
    addItem(bag, "potion", 2);
    addItem(bag, "potion", 5);
    expect(getItemCount(bag, "potion")).toBe(7);
  });

  it("アイテムを消費できる", () => {
    const bag = createBag();
    addItem(bag, "potion", 3);
    const result = removeItem(bag, "potion", 1);
    expect(result).toBe(true);
    expect(getItemCount(bag, "potion")).toBe(2);
  });

  it("個数が0になったらアイテムが削除される", () => {
    const bag = createBag();
    addItem(bag, "potion", 1);
    removeItem(bag, "potion", 1);
    expect(getItemCount(bag, "potion")).toBe(0);
    expect(bag.items).toHaveLength(0);
  });

  it("所持数不足の場合は消費できない", () => {
    const bag = createBag();
    addItem(bag, "potion", 1);
    const result = removeItem(bag, "potion", 2);
    expect(result).toBe(false);
    expect(getItemCount(bag, "potion")).toBe(1);
  });

  it("カテゴリでフィルタできる", () => {
    const bag = createBag();
    addItem(bag, "potion", 1);
    addItem(bag, "antidote", 1);
    addItem(bag, "monster-ball", 5);

    const medicine = getItemsByCategory(bag, "medicine", itemResolver);
    expect(medicine).toHaveLength(2);

    const balls = getItemsByCategory(bag, "ball", itemResolver);
    expect(balls).toHaveLength(1);
  });

  describe("回復アイテム使用", () => {
    it("HPを回復できる", () => {
      const monster = createDummyMonster(10);
      const result = useHealItem(potion, monster, 50);
      expect(result.used).toBe(true);
      expect(monster.currentHp).toBe(30);
    });

    it("HP回復は最大HPを超えない", () => {
      const monster = createDummyMonster(45);
      const result = useHealItem(potion, monster, 50);
      expect(result.used).toBe(true);
      expect(monster.currentHp).toBe(50);
    });

    it("HP満タンなら使えない", () => {
      const monster = createDummyMonster(50);
      const result = useHealItem(potion, monster, 50);
      expect(result.used).toBe(false);
    });

    it("瀕死のモンスターには使えない", () => {
      const monster = createDummyMonster(0);
      const result = useHealItem(potion, monster, 50);
      expect(result.used).toBe(false);
    });

    it("毒を治せる", () => {
      const monster = createDummyMonster(30);
      monster.status = "poison";
      const result = useHealItem(antidote, monster, 50);
      expect(result.used).toBe(true);
      expect(monster.status).toBeNull();
    });

    it("対象外の状態異常には使えない", () => {
      const monster = createDummyMonster(30);
      monster.status = "burn";
      const result = useHealItem(antidote, monster, 50);
      expect(result.used).toBe(false);
      expect(monster.status).toBe("burn");
    });

    it("なんでもなおしで任意の状態異常を治せる", () => {
      const monster = createDummyMonster(30);
      monster.status = "paralysis";
      const result = useHealItem(fullHeal, monster, 50);
      expect(result.used).toBe(true);
      expect(monster.status).toBeNull();
    });

    it("状態異常がない場合は使えない", () => {
      const monster = createDummyMonster(30);
      const result = useHealItem(antidote, monster, 50);
      expect(result.used).toBe(false);
    });
  });
});
