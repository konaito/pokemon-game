import { describe, it, expect } from "vitest";
import {
  shouldEncounter,
  rollEncounter,
  rollLevel,
  generateWildMonster,
  processEncounter,
} from "../encounter";
import type { MapDefinition, EncounterEntry } from "../map-data";

const testEntries: EncounterEntry[] = [
  { speciesId: "rattata", minLevel: 2, maxLevel: 5, weight: 60 },
  { speciesId: "pidgey", minLevel: 3, maxLevel: 6, weight: 30 },
  { speciesId: "pikachu", minLevel: 4, maxLevel: 4, weight: 10 },
];

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
      const monster = generateWildMonster(entry, () => 0.5);
      expect(monster.speciesId).toBe("rattata");
      expect(monster.level).toBeGreaterThanOrEqual(2);
      expect(monster.level).toBeLessThanOrEqual(5);
      expect(monster.status).toBeNull();
      expect(monster.evs.hp).toBe(0);
    });

    it("IVは0-31の範囲で生成される", () => {
      const monster = generateWildMonster(testEntries[0], () => 0.5);
      // random()=0.5 → floor(0.5*32) = 16
      expect(monster.ivs.hp).toBe(16);
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
      const monster = processEncounter(testMap, () => 0.05);
      expect(monster).not.toBeNull();
      expect(monster!.speciesId).toBe("rattata");
    });

    it("エンカウントが発生しないとnullを返す", () => {
      // random()=0.8 → 80 >= 20 → エンカウントなし
      const monster = processEncounter(testMap, () => 0.8);
      expect(monster).toBeNull();
    });
  });
});
