import { describe, it, expect } from "vitest";
import { getLearnableMoves, learnMove, replaceMove } from "../moves";
import type { MonsterSpecies, MonsterInstance, MoveDefinition } from "@/types";

function createDummyMonster(moves: { moveId: string; currentPp: number }[] = []): MonsterInstance {
  return {
    uid: "test-moves",
    speciesId: "test",
    level: 10,
    exp: 1000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 30,
    moves,
    status: null,
  };
}

const tackledef: MoveDefinition = {
  id: "tackle",
  name: "たいあたり",
  type: "normal",
  category: "physical",
  power: 40,
  accuracy: 100,
  pp: 35,
  priority: 0,
};

const ember: MoveDefinition = {
  id: "ember",
  name: "ひのこ",
  type: "fire",
  category: "special",
  power: 40,
  accuracy: 100,
  pp: 25,
  priority: 0,
};

const scratch: MoveDefinition = {
  id: "scratch",
  name: "ひっかく",
  type: "normal",
  category: "physical",
  power: 40,
  accuracy: 100,
  pp: 35,
  priority: 0,
};

const dummySpecies: MonsterSpecies = {
  id: "test",
  name: "テストモン",
  types: ["fire"],
  baseStats: { hp: 45, atk: 60, def: 40, spAtk: 70, spDef: 50, speed: 65 },
  baseExpYield: 62,
  expGroup: "medium_fast",
  learnset: [
    { level: 1, moveId: "tackle" },
    { level: 5, moveId: "ember" },
    { level: 10, moveId: "scratch" },
    { level: 15, moveId: "flamethrower" },
  ],
};

describe("技管理", () => {
  describe("getLearnableMoves", () => {
    it("レベルアップ範囲内の習得可能技を返す", () => {
      const moves = getLearnableMoves(dummySpecies, 3, 10);
      expect(moves).toHaveLength(2);
      expect(moves[0].moveId).toBe("ember");
      expect(moves[1].moveId).toBe("scratch");
    });

    it("範囲外の技は返さない", () => {
      const moves = getLearnableMoves(dummySpecies, 10, 14);
      expect(moves).toHaveLength(0);
    });

    it("oldLevelちょうどの技は含まない", () => {
      const moves = getLearnableMoves(dummySpecies, 5, 10);
      expect(moves.find((m) => m.moveId === "ember")).toBeUndefined();
    });
  });

  describe("learnMove", () => {
    it("技枠が空いていれば自動で覚える", () => {
      const monster = createDummyMonster([]);
      const result = learnMove(monster, "tackle", tackledef);
      expect(result).toBe("learned");
      expect(monster.moves).toHaveLength(1);
      expect(monster.moves[0].moveId).toBe("tackle");
      expect(monster.moves[0].currentPp).toBe(35);
    });

    it("既に覚えている技はスキップされる", () => {
      const monster = createDummyMonster([{ moveId: "tackle", currentPp: 35 }]);
      const result = learnMove(monster, "tackle", tackledef);
      expect(result).toBe("learned");
      expect(monster.moves).toHaveLength(1);
    });

    it("4枠満杯なら full を返す", () => {
      const monster = createDummyMonster([
        { moveId: "tackle", currentPp: 35 },
        { moveId: "ember", currentPp: 25 },
        { moveId: "scratch", currentPp: 35 },
        { moveId: "flamethrower", currentPp: 15 },
      ]);
      const result = learnMove(monster, "new-move", ember);
      expect(result).toBe("full");
      expect(monster.moves).toHaveLength(4);
    });
  });

  describe("replaceMove", () => {
    it("既存の技を忘れて新しい技を覚える", () => {
      const monster = createDummyMonster([
        { moveId: "tackle", currentPp: 35 },
        { moveId: "ember", currentPp: 25 },
      ]);
      const result = replaceMove(monster, 0, "scratch", scratch);
      expect(result.forgottenMoveId).toBe("tackle");
      expect(monster.moves[0].moveId).toBe("scratch");
      expect(monster.moves[0].currentPp).toBe(35);
    });

    it("無効なスロットインデックスでエラー", () => {
      const monster = createDummyMonster([{ moveId: "tackle", currentPp: 35 }]);
      expect(() => replaceMove(monster, -1, "ember", ember)).toThrow("無効な技スロット");
      expect(() => replaceMove(monster, 5, "ember", ember)).toThrow("無効な技スロット");
    });
  });
});
