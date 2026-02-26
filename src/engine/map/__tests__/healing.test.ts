import { describe, it, expect } from "vitest";
import { needsHealing, useHealingCenter } from "../healing";
import type { MonsterInstance, MoveDefinition } from "@/types";

function createDummyMonster(hp: number = 30): MonsterInstance {
  return {
    speciesId: "test",
    level: 10,
    exp: 1000,
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: hp,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

const moveDef: MoveDefinition = {
  id: "tackle",
  name: "たいあたり",
  type: "normal",
  category: "physical",
  power: 40,
  accuracy: 100,
  pp: 35,
  priority: 0,
};

const maxHpCalc = () => 50;
const moveResolver = () => moveDef;

describe("回復施設", () => {
  describe("needsHealing", () => {
    it("HP減少があれば true", () => {
      const party = [createDummyMonster(30)];
      expect(needsHealing(party, maxHpCalc, moveResolver)).toBe(true);
    });

    it("状態異常があれば true", () => {
      const m = createDummyMonster(50);
      m.status = "poison";
      expect(needsHealing([m], maxHpCalc, moveResolver)).toBe(true);
    });

    it("PP減少があれば true", () => {
      const m = createDummyMonster(50);
      m.moves[0].currentPp = 10;
      expect(needsHealing([m], maxHpCalc, moveResolver)).toBe(true);
    });

    it("全員満タンなら false", () => {
      const m = createDummyMonster(50);
      expect(needsHealing([m], maxHpCalc, moveResolver)).toBe(false);
    });
  });

  describe("useHealingCenter", () => {
    it("回復が必要な場合、全回復して適切なメッセージ", () => {
      const m = createDummyMonster(10);
      m.status = "burn";
      m.moves[0].currentPp = 0;

      const result = useHealingCenter([m], maxHpCalc, moveResolver);
      expect(result.wasNeeded).toBe(true);
      expect(m.currentHp).toBe(50);
      expect(m.status).toBeNull();
      expect(m.moves[0].currentPp).toBe(35);
    });

    it("回復不要の場合でも全回復は実行される", () => {
      const m = createDummyMonster(50);
      const result = useHealingCenter([m], maxHpCalc, moveResolver);
      expect(result.wasNeeded).toBe(false);
      expect(m.currentHp).toBe(50);
    });
  });
});
