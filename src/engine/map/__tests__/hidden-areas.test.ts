import { describe, it, expect } from "vitest";
import type { StoryFlags } from "@/engine/state/story-flags";
import {
  canPassHiddenPassage,
  canCollectHiddenItem,
  getHiddenItemFlag,
  RUINS_DEPTHS,
  SEIREI_BACK,
  UNDERSEA_CAVE,
  FORGOTTEN_LAB,
  RAINBOW_MEADOW,
  HIDDEN_AREA_MAPS,
  HIDDEN_PASSAGES,
  HIDDEN_ITEMS,
  type HiddenPassage,
  type HiddenItem,
} from "../hidden-areas";

describe("canPassHiddenPassage", () => {
  it("条件を満たしていれば通過可能", () => {
    const passage: HiddenPassage = {
      x: 7,
      y: 3,
      requirement: "champion_cleared",
      connection: { targetMapId: "ruins_depths", targetX: 4, targetY: 10, sourceX: 7, sourceY: 3 },
    };
    const flags: StoryFlags = { champion_cleared: true };
    expect(canPassHiddenPassage(passage, flags)).toBe(true);
  });

  it("条件を満たしていなければ通過不可", () => {
    const passage: HiddenPassage = {
      x: 7,
      y: 3,
      requirement: "champion_cleared",
      connection: { targetMapId: "ruins_depths", targetX: 4, targetY: 10, sourceX: 7, sourceY: 3 },
    };
    const flags: StoryFlags = {};
    expect(canPassHiddenPassage(passage, flags)).toBe(false);
  });

  it("AND条件（配列）で全て満たしていれば通過可能", () => {
    const passage: HiddenPassage = {
      x: 9,
      y: 5,
      requirement: ["champion_cleared", "badge_8"],
      connection: { targetMapId: "seirei_back", targetX: 5, targetY: 8, sourceX: 9, sourceY: 5 },
    };
    const flags: StoryFlags = { champion_cleared: true, badge_8: true };
    expect(canPassHiddenPassage(passage, flags)).toBe(true);
  });

  it("AND条件（配列）で一部しか満たしていなければ通過不可", () => {
    const passage: HiddenPassage = {
      x: 9,
      y: 5,
      requirement: ["champion_cleared", "badge_8"],
      connection: { targetMapId: "seirei_back", targetX: 5, targetY: 8, sourceX: 9, sourceY: 5 },
    };
    const flags: StoryFlags = { champion_cleared: true };
    expect(canPassHiddenPassage(passage, flags)).toBe(false);
  });
});

describe("canCollectHiddenItem", () => {
  it("未取得のアイテムは取得可能", () => {
    const item: HiddenItem = {
      id: "test_item",
      x: 1,
      y: 1,
      itemId: "rare_candy",
      quantity: 1,
      flagId: "hidden_item_test",
    };
    const flags: StoryFlags = {};
    expect(canCollectHiddenItem(item, flags)).toBe(true);
  });

  it("取得済みのアイテムは取得不可", () => {
    const item: HiddenItem = {
      id: "test_item",
      x: 1,
      y: 1,
      itemId: "rare_candy",
      quantity: 1,
      flagId: "hidden_item_test",
    };
    const flags: StoryFlags = { hidden_item_test: true };
    expect(canCollectHiddenItem(item, flags)).toBe(false);
  });
});

describe("getHiddenItemFlag", () => {
  it("アイテムのフラグIDを返す", () => {
    const item: HiddenItem = {
      id: "test_item",
      x: 1,
      y: 1,
      itemId: "rare_candy",
      quantity: 1,
      flagId: "hidden_item_test",
    };
    expect(getHiddenItemFlag(item)).toBe("hidden_item_test");
  });
});

describe("隠しエリアマップ定義", () => {
  it("RUINS_DEPTHS が正しい構造を持つ", () => {
    expect(RUINS_DEPTHS.id).toBe("ruins_depths");
    expect(RUINS_DEPTHS.width).toBe(10);
    expect(RUINS_DEPTHS.height).toBe(12);
    expect(RUINS_DEPTHS.tiles).toHaveLength(12);
    expect(RUINS_DEPTHS.tiles[0]).toHaveLength(10);
    expect(RUINS_DEPTHS.connections).toHaveLength(2);
    expect(RUINS_DEPTHS.encounterRate).toBe(0);
  });

  it("SEIREI_BACK が正しい構造を持つ", () => {
    expect(SEIREI_BACK.id).toBe("seirei_back");
    expect(SEIREI_BACK.width).toBe(12);
    expect(SEIREI_BACK.height).toBe(10);
    expect(SEIREI_BACK.tiles).toHaveLength(10);
    expect(SEIREI_BACK.tiles[0]).toHaveLength(12);
    expect(SEIREI_BACK.encounters.length).toBeGreaterThan(0);
    expect(SEIREI_BACK.encounterRate).toBe(30);
  });

  it("UNDERSEA_CAVE が水タイルを含む", () => {
    expect(UNDERSEA_CAVE.id).toBe("undersea_cave");
    const hasWater = UNDERSEA_CAVE.tiles.some((row) => row.includes("water"));
    expect(hasWater).toBe(true);
    expect(UNDERSEA_CAVE.encounters.length).toBeGreaterThan(0);
  });

  it("FORGOTTEN_LAB にNPCが配置されている", () => {
    expect(FORGOTTEN_LAB.id).toBe("forgotten_lab");
    expect(FORGOTTEN_LAB.npcs).toHaveLength(4);
    expect(FORGOTTEN_LAB.encounterRate).toBe(0);
    // 全NPCが研究端末
    for (const npc of FORGOTTEN_LAB.npcs) {
      expect(npc.name).toBe("研究端末");
      expect(npc.isTrainer).toBe(false);
    }
  });

  it("RAINBOW_MEADOW が草タイルを多く含む", () => {
    expect(RAINBOW_MEADOW.id).toBe("rainbow_meadow");
    const grassCount = RAINBOW_MEADOW.tiles.flat().filter((t) => t === "grass").length;
    expect(grassCount).toBeGreaterThan(10);
    expect(RAINBOW_MEADOW.encounters.length).toBeGreaterThan(0);
  });

  it("HIDDEN_AREA_MAPS に5つのマップが含まれる", () => {
    expect(HIDDEN_AREA_MAPS).toHaveLength(5);
    const ids = HIDDEN_AREA_MAPS.map((m) => m.id);
    expect(ids).toContain("ruins_depths");
    expect(ids).toContain("seirei_back");
    expect(ids).toContain("undersea_cave");
    expect(ids).toContain("forgotten_lab");
    expect(ids).toContain("rainbow_meadow");
  });

  it("各マップのtiles行数がheightと一致する", () => {
    for (const map of HIDDEN_AREA_MAPS) {
      expect(map.tiles).toHaveLength(map.height);
      for (const row of map.tiles) {
        expect(row).toHaveLength(map.width);
      }
    }
  });
});

describe("HIDDEN_PASSAGES", () => {
  it("3つの隠し通路が定義されている", () => {
    expect(HIDDEN_PASSAGES).toHaveLength(3);
  });

  it("各通路にconnection情報がある", () => {
    for (const passage of HIDDEN_PASSAGES) {
      expect(passage.connection.targetMapId).toBeDefined();
      expect(typeof passage.connection.targetX).toBe("number");
      expect(typeof passage.connection.targetY).toBe("number");
    }
  });

  it("忘却の遺跡への隠し通路はchampion_clearedが必要", () => {
    const ruinsPassage = HIDDEN_PASSAGES.find((p) => p.connection.targetMapId === "ruins_depths");
    expect(ruinsPassage).toBeDefined();
    expect(ruinsPassage!.requirement).toBe("champion_cleared");
  });

  it("セイレイ山裏ルートへの隠し通路は複合条件が必要", () => {
    const seireiPassage = HIDDEN_PASSAGES.find((p) => p.connection.targetMapId === "seirei_back");
    expect(seireiPassage).toBeDefined();
    expect(Array.isArray(seireiPassage!.requirement)).toBe(true);
  });
});

describe("HIDDEN_ITEMS", () => {
  it("5つの隠しアイテムが定義されている", () => {
    expect(HIDDEN_ITEMS).toHaveLength(5);
  });

  it("各アイテムにユニークなIDがある", () => {
    const ids = HIDDEN_ITEMS.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("各アイテムにユニークなflagIdがある", () => {
    const flagIds = HIDDEN_ITEMS.map((item) => item.flagId);
    const uniqueFlagIds = new Set(flagIds);
    expect(uniqueFlagIds.size).toBe(flagIds.length);
  });

  it("忘れられた研究所にマスターボールが隠されている", () => {
    const masterBall = HIDDEN_ITEMS.find((item) => item.itemId === "master_ball");
    expect(masterBall).toBeDefined();
    expect(masterBall!.flagId).toBe("hidden_item_lab_1");
  });

  it("全アイテムの数量が1以上", () => {
    for (const item of HIDDEN_ITEMS) {
      expect(item.quantity).toBeGreaterThanOrEqual(1);
    }
  });
});
