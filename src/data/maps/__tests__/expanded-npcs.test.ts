import { describe, it, expect } from "vitest";
import {
  TOWN_NPC_SETS,
  getTownNpcSet,
  getAdditionalNpcs,
  getTotalAdditionalNpcCount,
  getTotalNpcCount,
  allTownsHaveMinNpcs,
  bigCitiesHaveEnoughNpcs,
  hasStoryHints,
  countStoryNpcs,
  validateUniqueNpcIds,
} from "@/data/maps/expanded-npcs";

describe("街の追加NPC", () => {
  it("全10街にNPCセットが定義されている", () => {
    expect(Object.keys(TOWN_NPC_SETS)).toHaveLength(10);
    expect(getTownNpcSet("wasuremachi")).toBeDefined();
    expect(getTownNpcSet("tsuchigumo-village")).toBeDefined();
    expect(getTownNpcSet("morinoha-town")).toBeDefined();
    expect(getTownNpcSet("inazuma-city")).toBeDefined();
    expect(getTownNpcSet("kagari-city")).toBeDefined();
    expect(getTownNpcSet("gouki-town")).toBeDefined();
    expect(getTownNpcSet("kirifuri-village")).toBeDefined();
    expect(getTownNpcSet("fuyuha-town")).toBeDefined();
    expect(getTownNpcSet("tatsumi-city")).toBeDefined();
    expect(getTownNpcSet("pokemon-league")).toBeDefined();
  });

  it("全ての街にNPCが5体以上配置されている", () => {
    expect(allTownsHaveMinNpcs(5)).toBe(true);
  });

  it("大都市（イナヅマ、タツミ）には10体前後のNPCがいる", () => {
    expect(bigCitiesHaveEnoughNpcs(10)).toBe(true);
  });

  it("合計約40体のNPCが新規追加されている", () => {
    const total = getTotalAdditionalNpcCount();
    expect(total).toBeGreaterThanOrEqual(35);
  });

  it("全NPC合計数が正しい", () => {
    const total = getTotalNpcCount();
    // 既存NPC(約24) + 追加NPC(約40) = 約64
    expect(total).toBeGreaterThanOrEqual(60);
  });

  it("全NPCに個性的な会話テキストが設定されている", () => {
    for (const set of Object.values(TOWN_NPC_SETS)) {
      for (const npc of set.additionalNpcs) {
        expect(npc.dialogue.length, `${npc.name}の会話が空`).toBeGreaterThan(0);
        // 会話テキストが最低2行ある
        expect(npc.dialogue.length, `${npc.name}の会話が短すぎる`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("ストーリーのヒントや世界観を伝えるNPCが含まれている", () => {
    expect(hasStoryHints()).toBe(true);
    // 5体以上のNPCがストーリー関連の会話を持つ
    expect(countStoryNpcs()).toBeGreaterThanOrEqual(5);
  });

  it("全NPCのIDが一意である", () => {
    const result = validateUniqueNpcIds();
    expect(result.valid, `重複ID: ${result.duplicates.join(", ")}`).toBe(true);
  });

  it("存在しないマップIDでundefinedを返す", () => {
    expect(getTownNpcSet("nonexistent")).toBeUndefined();
    expect(getAdditionalNpcs("nonexistent")).toEqual([]);
  });

  describe("個別の街のNPC数", () => {
    it("ワスレ町は合計7体", () => {
      const set = getTownNpcSet("wasuremachi")!;
      expect(set.totalCount).toBe(7);
      expect(set.additionalNpcs).toHaveLength(4);
    });

    it("ツチグモ村は合計5体", () => {
      const set = getTownNpcSet("tsuchigumo-village")!;
      expect(set.totalCount).toBe(5);
    });

    it("モリノハの町は合計6体", () => {
      const set = getTownNpcSet("morinoha-town")!;
      expect(set.totalCount).toBe(6);
    });

    it("イナヅマシティは合計10体", () => {
      const set = getTownNpcSet("inazuma-city")!;
      expect(set.totalCount).toBe(10);
      expect(set.additionalNpcs).toHaveLength(8);
    });

    it("カガリ市は合計7体", () => {
      const set = getTownNpcSet("kagari-city")!;
      expect(set.totalCount).toBe(7);
    });

    it("タツミシティは合計10体", () => {
      const set = getTownNpcSet("tatsumi-city")!;
      expect(set.totalCount).toBe(10);
      expect(set.additionalNpcs).toHaveLength(8);
    });

    it("ポケモンリーグは合計9体", () => {
      const set = getTownNpcSet("pokemon-league")!;
      expect(set.totalCount).toBe(9);
      expect(set.additionalNpcs).toHaveLength(2);
    });
  });

  describe("NPC会話内容の多様性", () => {
    it("バトルヒントを含むNPCが存在する", () => {
      const hintKeywords = ["タイプ", "弱い", "有効", "相性"];
      let hintCount = 0;
      for (const set of Object.values(TOWN_NPC_SETS)) {
        for (const npc of set.additionalNpcs) {
          if (npc.dialogue.some((d) => hintKeywords.some((kw) => d.includes(kw)))) {
            hintCount++;
          }
        }
      }
      expect(hintCount).toBeGreaterThanOrEqual(3);
    });

    it("世界観（大忘却テーマ）を語るNPCが存在する", () => {
      let count = 0;
      for (const set of Object.values(TOWN_NPC_SETS)) {
        for (const npc of set.additionalNpcs) {
          if (npc.dialogue.some((d) => d.includes("大忘却"))) {
            count++;
          }
        }
      }
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it("ユーモアのある会話を持つNPCが存在する", () => {
      // 感嘆符やユーモラスな表現を含むNPCがいることを確認
      let humorCount = 0;
      for (const set of Object.values(TOWN_NPC_SETS)) {
        for (const npc of set.additionalNpcs) {
          if (
            npc.dialogue.some(
              (d) => d.includes("！！") || d.includes("はぁ") || d.includes("はっ！"),
            )
          ) {
            humorCount++;
          }
        }
      }
      expect(humorCount).toBeGreaterThanOrEqual(2);
    });
  });
});
