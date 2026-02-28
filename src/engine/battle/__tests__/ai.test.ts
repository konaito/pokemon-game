import { describe, it, expect } from "vitest";
import { selectAiMove, type AiLevel } from "../ai";
import type { MonsterInstance, MonsterSpecies, MoveDefinition, TypeId } from "@/types";

/** テスト用のモンスター種族データ */
function makeSpecies(overrides: Partial<MonsterSpecies> = {}): MonsterSpecies {
  return {
    id: "test_monster",
    name: "テストモン",
    types: ["normal"] as [TypeId],
    baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    baseExpYield: 100,
    expGroup: "medium_fast",
    learnset: [],
    ...overrides,
  };
}

/** テスト用のモンスター個体 */
function makeMonster(overrides: Partial<MonsterInstance> = {}): MonsterInstance {
  return {
    uid: "test-uid",
    speciesId: "test_monster",
    level: 50,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [
      { moveId: "tackle", currentPp: 35 },
      { moveId: "ember", currentPp: 25 },
      { moveId: "water_gun", currentPp: 25 },
      { moveId: "growl", currentPp: 40 },
    ],
    status: null,
    ...overrides,
  };
}

/** テスト用の技データ */
const MOVES: Record<string, MoveDefinition> = {
  tackle: {
    id: "tackle",
    name: "たいあたり",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  ember: {
    id: "ember",
    name: "ひのこ",
    type: "fire",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  water_gun: {
    id: "water_gun",
    name: "みずでっぽう",
    type: "water",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  growl: {
    id: "growl",
    name: "なきごえ",
    type: "normal",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 40,
    priority: 0,
    effect: { statChanges: { atk: -1 } },
  },
  thunder: {
    id: "thunder",
    name: "かみなり",
    type: "electric",
    category: "special",
    power: 110,
    accuracy: 70,
    pp: 10,
    priority: 0,
  },
  toxic: {
    id: "toxic",
    name: "どくどく",
    type: "poison",
    category: "status",
    power: null,
    accuracy: 90,
    pp: 10,
    priority: 0,
    effect: { statusCondition: "poison", statusChance: 100 },
  },
};

const moveResolver = (id: string) => MOVES[id];

describe("selectAiMove", () => {
  describe("random AI", () => {
    it("使用可能な技からランダムに選択する", () => {
      const monster = makeMonster();
      const species = makeSpecies();
      const defender = makeMonster({ speciesId: "defender" });
      const defenderSpecies = makeSpecies({ id: "defender" });

      // random() = 0 → 最初の技
      const result = selectAiMove(
        "random",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      expect(result).toBe(0);
    });

    it("random() = 0.99 → 最後の技を選択", () => {
      const monster = makeMonster();
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies();

      const result = selectAiMove(
        "random",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0.99,
      );
      expect(result).toBe(3);
    });

    it("PP切れの技はスキップする", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 0 },
          { moveId: "ember", currentPp: 25 },
          { moveId: "water_gun", currentPp: 0 },
          { moveId: "growl", currentPp: 0 },
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies();

      // 使用可能な技はemberのみ（index 1）
      const result = selectAiMove(
        "random",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      expect(result).toBe(1);
    });

    it("全技PP切れで-1（わるあがき）を返す", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 0 },
          { moveId: "ember", currentPp: 0 },
          { moveId: "water_gun", currentPp: 0 },
          { moveId: "growl", currentPp: 0 },
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies();

      const result = selectAiMove(
        "random",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      expect(result).toBe(-1);
    });
  });

  describe("basic AI", () => {
    it("草タイプの相手に炎技を選ぶ（タイプ相性重視）", () => {
      const monster = makeMonster();
      const species = makeSpecies();
      const defender = makeMonster({ speciesId: "grass_mon" });
      const defenderSpecies = makeSpecies({ id: "grass_mon", types: ["grass"] });

      const result = selectAiMove(
        "basic",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // ember (fire vs grass = 2x) should be preferred over tackle (normal vs grass = 1x)
      expect(result).toBe(1); // ember index
    });

    it("炎タイプの相手に水技を選ぶ", () => {
      const monster = makeMonster();
      const species = makeSpecies();
      const defender = makeMonster({ speciesId: "fire_mon" });
      const defenderSpecies = makeSpecies({ id: "fire_mon", types: ["fire"] });

      const result = selectAiMove(
        "basic",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // water_gun (water vs fire = 2x) should be preferred
      expect(result).toBe(2); // water_gun index
    });

    it("ゴーストタイプの相手にノーマル技を避ける", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 35 },
          { moveId: "ember", currentPp: 25 },
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster({ speciesId: "ghost_mon" });
      const defenderSpecies = makeSpecies({ id: "ghost_mon", types: ["ghost"] });

      const result = selectAiMove(
        "basic",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // tackle (normal vs ghost = 0x) should be avoided, ember preferred
      expect(result).toBe(1); // ember
    });

    it("同スコアの技はランダムに選択する", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "ember", currentPp: 25 },
          { moveId: "water_gun", currentPp: 25 },
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies(); // normal type: both ember and water_gun have same effectiveness

      // 両方ともノーマルタイプに等倍なので同スコア
      const result1 = selectAiMove(
        "basic",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      const result2 = selectAiMove(
        "basic",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0.99,
      );
      // 両方のパターンが出る可能性がある
      expect([0, 1]).toContain(result1);
      expect([0, 1]).toContain(result2);
    });
  });

  describe("smart AI", () => {
    it("タイプ一致技にSTABボーナスを適用する", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "ember", currentPp: 25 },
          { moveId: "water_gun", currentPp: 25 },
        ],
      });
      const species = makeSpecies({ types: ["fire"] }); // 炎タイプのモンスター
      const defender = makeMonster();
      const defenderSpecies = makeSpecies(); // ノーマル、等倍

      // emberはSTAB適用で1.5倍、water_gunは等倍 → ember優先
      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      expect(result).toBe(0); // ember
    });

    it("状態異常技を適切に評価する（相手が正常の場合）", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 35 }, // power 40, normal
          { moveId: "toxic", currentPp: 10 }, // status: poison
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster({ status: null });
      const defenderSpecies = makeSpecies();

      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // toxic (score 1.5 for status against healthy target) vs tackle (40/100 * 1 = 0.4)
      // toxicが優先される
      expect(result).toBe(1); // toxic
    });

    it("既に状態異常の相手には状態異常技の評価が下がる", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 35 },
          { moveId: "toxic", currentPp: 10 },
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster({ status: "poison" }); // 既に毒
      const defenderSpecies = makeSpecies();

      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // toxic has status but target already poisoned → score 0.3
      // tackle score: (40/100) * 1 * (80/100) = 0.32 > 0.3
      expect(result).toBe(0); // tackle
    });

    it("物理技は攻撃種族値を考慮する", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 35 }, // physical
          { moveId: "ember", currentPp: 25 }, // special
        ],
      });
      // 攻撃特化型（atk高い、spAtk低い）
      const species = makeSpecies({
        baseStats: { hp: 80, atk: 150, def: 80, spAtk: 30, spDef: 80, speed: 80 },
      });
      const defender = makeMonster();
      const defenderSpecies = makeSpecies();

      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // tackle: (40/100) * 1 * (150/100) = 0.6
      // ember: (40/100) * 1 * (30/100) = 0.12
      expect(result).toBe(0); // tackle (physical, high atk)
    });

    it("特殊技は特攻種族値を考慮する", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 35 }, // physical
          { moveId: "ember", currentPp: 25 }, // special
        ],
      });
      // 特攻特化型（spAtk高い、atk低い）
      const species = makeSpecies({
        baseStats: { hp: 80, atk: 30, def: 80, spAtk: 150, spDef: 80, speed: 80 },
      });
      const defender = makeMonster();
      const defenderSpecies = makeSpecies();

      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // tackle: (40/100) * 1 * (30/100) = 0.12
      // ember: (40/100) * 1 * (150/100) = 0.6
      expect(result).toBe(1); // ember (special, high spAtk)
    });

    it("タイプ相性0の技はスコア0になる", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "tackle", currentPp: 35 },
          { moveId: "ember", currentPp: 25 },
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies({ types: ["ghost"] }); // ノーマル無効

      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // tackle vs ghost = 0 → score 0, ember vs ghost = 1 → positive score
      expect(result).toBe(1); // ember
    });

    it("能力変化技は一定のスコアを持つ", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "growl", currentPp: 40 }, // stat change
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies();

      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // growlのみなのでgrowlを選択（score 1.2）
      expect(result).toBe(0);
    });

    it("高威力技がスコアに反映される", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "ember", currentPp: 25 }, // power 40
          { moveId: "thunder", currentPp: 10 }, // power 110
        ],
      });
      const species = makeSpecies({ types: ["electric"] }); // STAB for thunder
      const defender = makeMonster();
      const defenderSpecies = makeSpecies({ types: ["water"] }); // electric x2

      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      // thunder: (110/100) * 2 * 1.5 (STAB) * (80/100) = 2.64
      // ember: (40/100) * 1 * (80/100) = 0.32
      expect(result).toBe(1); // thunder
    });

    it("僅差のスコアはランダムで選ぶ（±0.1以内）", () => {
      const monster = makeMonster({
        moves: [
          { moveId: "ember", currentPp: 25 },
          { moveId: "water_gun", currentPp: 25 },
        ],
      });
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies();

      // 両方同じpower・effectivenessなので同スコア
      const result = selectAiMove(
        "smart",
        monster,
        species,
        defender,
        defenderSpecies,
        moveResolver,
        () => 0,
      );
      expect([0, 1]).toContain(result);
    });
  });

  describe("engine integration (selectAiMove)", () => {
    it("aiLevel引数でAI難易度を切り替えられる", () => {
      const monster = makeMonster();
      const species = makeSpecies();
      const defender = makeMonster();
      const defenderSpecies = makeSpecies({ types: ["grass"] });

      const levels: AiLevel[] = ["random", "basic", "smart"];
      for (const level of levels) {
        const result = selectAiMove(
          level,
          monster,
          species,
          defender,
          defenderSpecies,
          moveResolver,
          () => 0,
        );
        // 全レベルで有効なインデックスまたは-1を返す
        expect(result).toBeGreaterThanOrEqual(-1);
        expect(result).toBeLessThan(4);
      }
    });
  });
});
