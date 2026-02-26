import { describe, it, expect } from "vitest";
import { checkEvolution, evolve } from "../evolution";
import type { MonsterInstance, MonsterSpecies } from "@/types";

function createDummyMonster(level: number = 10, currentHp: number = 30): MonsterInstance {
  return {
    speciesId: "charmander",
    level,
    exp: 1000,
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

const charmander: MonsterSpecies = {
  id: "charmander",
  name: "ヒトカゲ",
  types: ["fire"],
  baseStats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, speed: 65 },
  learnset: [],
  evolvesTo: { id: "charmeleon", level: 16 },
};

const charmeleon: MonsterSpecies = {
  id: "charmeleon",
  name: "リザード",
  types: ["fire"],
  baseStats: { hp: 58, atk: 64, def: 58, spAtk: 80, spDef: 65, speed: 80 },
  learnset: [],
  evolvesTo: { id: "charizard", level: 36 },
};

const noEvoSpecies: MonsterSpecies = {
  id: "pikachu",
  name: "ピカチュウ",
  types: ["electric"],
  baseStats: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, speed: 90 },
  learnset: [],
};

describe("進化システム", () => {
  describe("checkEvolution", () => {
    it("レベルが進化条件を満たしていれば進化先IDを返す", () => {
      const monster = createDummyMonster(16);
      const result = checkEvolution(monster, charmander);
      expect(result).toBe("charmeleon");
    });

    it("レベルが足りなければ null を返す", () => {
      const monster = createDummyMonster(15);
      const result = checkEvolution(monster, charmander);
      expect(result).toBeNull();
    });

    it("進化先がない種族は null を返す", () => {
      const monster = createDummyMonster(99);
      const result = checkEvolution(monster, noEvoSpecies);
      expect(result).toBeNull();
    });
  });

  describe("evolve", () => {
    it("speciesIdが更新される", () => {
      const monster = createDummyMonster(16, 30);
      evolve(monster, charmander, charmeleon);
      expect(monster.speciesId).toBe("charmeleon");
    });

    it("最大HPの増加分が現在HPに加算される", () => {
      // charmander base HP: 39, charmeleon base HP: 58
      // レベル16, IV=15, EV=0 での HP:
      // calcHp(39, 15, 0, 16) = ((2*39+15+0)*16/100) + 16 + 10 = (93*16/100)+26 = 14+26 = 40
      // calcHp(58, 15, 0, 16) = ((2*58+15+0)*16/100) + 16 + 10 = (131*16/100)+26 = 20+26 = 46
      // 差分 = 6
      const monster = createDummyMonster(16, 35);
      evolve(monster, charmander, charmeleon);
      expect(monster.currentHp).toBe(41); // 35 + 6
    });

    it("現在HPが新しい最大HPを超えない", () => {
      // 新maxHP = 46 の場合、currentHp=45 + 差分6 = 51 → min(46, 51) = 46
      const monster = createDummyMonster(16, 45);
      evolve(monster, charmander, charmeleon);
      expect(monster.currentHp).toBeLessThanOrEqual(46);
    });
  });
});
