import { describe, it, expect } from "vitest";
import {
  shouldEncounter,
  rollEncounter,
  rollLevel,
  generateWildMonster,
  processEncounter,
} from "../encounter";
import type { MapDefinition, EncounterEntry } from "../map-data";
import type { MonsterSpecies, MoveDefinition } from "@/types";
import { calcAllStats } from "@/engine/monster/stats";

const testEntries: EncounterEntry[] = [
  { speciesId: "rattata", minLevel: 2, maxLevel: 5, weight: 60 },
  { speciesId: "pidgey", minLevel: 3, maxLevel: 6, weight: 30 },
  { speciesId: "pikachu", minLevel: 4, maxLevel: 4, weight: 10 },
];

const testSpecies: Record<string, MonsterSpecies> = {
  rattata: {
    id: "rattata",
    name: "ラッタ",
    types: ["normal"],
    baseStats: { hp: 30, atk: 56, def: 35, spAtk: 25, spDef: 35, speed: 72 },
    baseExpYield: 51,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 4, moveId: "tail-whip" },
      { level: 7, moveId: "quick-attack" },
    ],
  },
  pidgey: {
    id: "pidgey",
    name: "ポッポ",
    types: ["normal", "flying"],
    baseStats: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, speed: 56 },
    baseExpYield: 50,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 5, moveId: "gust" },
    ],
  },
  pikachu: {
    id: "pikachu",
    name: "ピカチュウ",
    types: ["electric"],
    baseStats: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, speed: 90 },
    baseExpYield: 112,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "thunder-shock" },
      { level: 4, moveId: "tail-whip" },
    ],
  },
};

const testMoves: Record<string, MoveDefinition> = {
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
  "tail-whip": {
    id: "tail-whip",
    name: "しっぽをふる",
    type: "normal",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 30,
    priority: 0,
  },
  "quick-attack": {
    id: "quick-attack",
    name: "でんこうせっか",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 30,
    priority: 1,
  },
  gust: {
    id: "gust",
    name: "かぜおこし",
    type: "flying",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  "thunder-shock": {
    id: "thunder-shock",
    name: "でんきショック",
    type: "electric",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 30,
    priority: 0,
  },
};

const speciesResolver = (id: string) => testSpecies[id];
const moveResolver = (id: string) => testMoves[id];

describe("エンカウントシステム", () => {
  describe("shouldEncounter", () => {
    it("エンカウント率0では発生しない", () => {
      expect(shouldEncounter(0, () => 0)).toBe(false);
    });

    it("乱数がエンカウント率未満なら発生する", () => {
      // encounterRate=20、random()=0.1 → 0.1*100=10 < 20 → true
      expect(shouldEncounter(20, () => 0.1)).toBe(true);
    });

    it("乱数がエンカウント率以上なら発生しない", () => {
      // encounterRate=20、random()=0.5 → 0.5*100=50 >= 20 → false
      expect(shouldEncounter(20, () => 0.5)).toBe(false);
    });
  });

  describe("rollEncounter", () => {
    it("空テーブルでは null を返す", () => {
      expect(rollEncounter([], () => 0)).toBeNull();
    });

    it("重みに基づいて選択される（低い乱数→高重みのエントリ）", () => {
      // random()=0 → roll=0 → 最初のエントリ (rattata, weight=60)
      const entry = rollEncounter(testEntries, () => 0);
      expect(entry!.speciesId).toBe("rattata");
    });

    it("重みに基づいて選択される（高い乱数→低重みのエントリ）", () => {
      // random()=0.95 → roll=95 → rattata(60)→35残, pidgey(30)→5残, pikachu(10)→当選
      const entry = rollEncounter(testEntries, () => 0.95);
      expect(entry!.speciesId).toBe("pikachu");
    });
  });

  describe("rollLevel", () => {
    it("最小値を返す（乱数=0）", () => {
      expect(rollLevel(3, 7, () => 0)).toBe(3);
    });

    it("最大値を返す（乱数=0.99）", () => {
      expect(rollLevel(3, 7, () => 0.99)).toBe(7);
    });

    it("同一レベルならそのレベルを返す", () => {
      expect(rollLevel(5, 5, () => 0.5)).toBe(5);
    });
  });

  describe("generateWildMonster", () => {
    it("出現テーブルからモンスターインスタンスを生成する", () => {
      const entry = testEntries[0];
      const monster = generateWildMonster(entry, speciesResolver, moveResolver, () => 0.5);
      expect(monster.speciesId).toBe("rattata");
      expect(monster.level).toBeGreaterThanOrEqual(2);
      expect(monster.level).toBeLessThanOrEqual(5);
      expect(monster.status).toBeNull();
      expect(monster.evs.hp).toBe(0);
    });

    it("IVは0-31の範囲で生成される", () => {
      const monster = generateWildMonster(testEntries[0], speciesResolver, moveResolver, () => 0.5);
      // random()=0.5 → floor(0.5*32) = 16
      expect(monster.ivs.hp).toBe(16);
    });

    it("T5: currentHp > 0 かつ currentHp === maxHp で生成される", () => {
      const monster = generateWildMonster(testEntries[0], speciesResolver, moveResolver, () => 0.5);
      expect(monster.currentHp).toBeGreaterThan(0);
      // maxHpと一致することを確認（calcAllStatsで同じパラメータから計算）
      const species = speciesResolver(monster.speciesId);
      const maxHp = calcAllStats(species.baseStats, monster.ivs, monster.evs, monster.level).hp;
      expect(monster.currentHp).toBe(maxHp);
    });

    it("T5: moves.length > 0 で生成される", () => {
      const monster = generateWildMonster(testEntries[0], speciesResolver, moveResolver, () => 0.5);
      expect(monster.moves.length).toBeGreaterThan(0);
      // rattata Lv3-4 (random=0.5 → level=3 or 4) はtackle(Lv1)を持つ
      expect(monster.moves.some((m) => m.moveId === "tackle")).toBe(true);
    });

    it("T5: レベルに応じた技のみを持つ（最大4つ）", () => {
      // pikachu Lv4 → thunder-shock(Lv1), tail-whip(Lv4) の2つ
      const entry = testEntries[2]; // pikachu, minLevel=4, maxLevel=4
      const monster = generateWildMonster(entry, speciesResolver, moveResolver, () => 0.5);
      expect(monster.level).toBe(4);
      expect(monster.moves.length).toBe(2);
      expect(monster.moves[0].moveId).toBe("thunder-shock");
      expect(monster.moves[1].moveId).toBe("tail-whip");
    });
  });

  describe("processEncounter", () => {
    const testMap: MapDefinition = {
      id: "route-1",
      name: "1番道路",
      width: 1,
      height: 1,
      tiles: [["grass"]],
      connections: [],
      encounters: testEntries,
      encounterRate: 20,
      npcs: [],
    };

    it("エンカウントが発生するとモンスターを返す", () => {
      // random()=0.05 → 5 < 20 → エンカウント発生
      const monster = processEncounter(testMap, speciesResolver, moveResolver, () => 0.05);
      expect(monster).not.toBeNull();
      expect(monster!.speciesId).toBe("rattata");
    });

    it("エンカウントが発生しないとnullを返す", () => {
      // random()=0.8 → 80 >= 20 → エンカウントなし
      const monster = processEncounter(testMap, speciesResolver, moveResolver, () => 0.8);
      expect(monster).toBeNull();
    });
  });
});
