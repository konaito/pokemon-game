import { describe, it, expect } from "vitest";
import {
  getFishingRodName,
  isAdjacentToWater,
  canFish,
  rollFishingHit,
  rollFishingEncounter,
  processFishing,
} from "../fishing";
import type { MapDefinition, FishingEncounterEntry, TileType } from "../map/map-data";
import { getSpeciesById } from "@/data/monsters";
import { getMoveById } from "@/data/moves";

const speciesResolver = (id: string) => getSpeciesById(id)!;
const moveResolver = (id: string) => getMoveById(id)!;

const sampleTiles: TileType[][] = [
  ["ground", "ground", "water"],
  ["ground", "ground", "water"],
  ["grass", "ground", "ground"],
];

const sampleFishingEntries: FishingEncounterEntry[] = [
  { rod: "old_rod", speciesId: "shizukumo", minLevel: 5, maxLevel: 10, weight: 80 },
  { rod: "old_rod", speciesId: "shizukumo", minLevel: 10, maxLevel: 15, weight: 20 },
  { rod: "good_rod", speciesId: "shizukumo", minLevel: 20, maxLevel: 25, weight: 60 },
  { rod: "super_rod", speciesId: "taikaiou", minLevel: 35, maxLevel: 45, weight: 100 },
];

function createTestMap(overrides?: Partial<MapDefinition>): MapDefinition {
  return {
    id: "test-map",
    name: "テストマップ",
    width: 3,
    height: 3,
    tiles: sampleTiles,
    connections: [],
    encounters: [],
    encounterRate: 0,
    npcs: [],
    fishingEncounters: sampleFishingEntries,
    ...overrides,
  };
}

describe("getFishingRodName", () => {
  it("各竿の日本語名を返す", () => {
    expect(getFishingRodName("old_rod")).toBe("ボロのつりざお");
    expect(getFishingRodName("good_rod")).toBe("いいつりざお");
    expect(getFishingRodName("super_rod")).toBe("すごいつりざお");
  });
});

describe("isAdjacentToWater", () => {
  it("水タイルに隣接している場合true", () => {
    expect(isAdjacentToWater(sampleTiles, 1, 0)).toBe(true); // (1,0)の右が水
  });

  it("水タイルに隣接していない場合false", () => {
    expect(isAdjacentToWater(sampleTiles, 0, 2)).toBe(false);
  });

  it("範囲外を参照してもエラーにならない", () => {
    expect(isAdjacentToWater(sampleTiles, 0, 0)).toBe(false);
  });
});

describe("canFish", () => {
  it("水タイル隣接かつ釣りテーブルあり＋竿対応エントリありでtrue", () => {
    const map = createTestMap();
    expect(canFish(map, 1, 0, "old_rod")).toBe(true);
  });

  it("釣りテーブルがないマップではfalse", () => {
    const map = createTestMap({ fishingEncounters: undefined });
    expect(canFish(map, 1, 0, "old_rod")).toBe(false);
  });

  it("水タイルに隣接していない場合false", () => {
    const map = createTestMap();
    expect(canFish(map, 0, 2, "old_rod")).toBe(false);
  });

  it("対応する竿のエントリがない場合false", () => {
    const map = createTestMap({
      fishingEncounters: [
        { rod: "super_rod", speciesId: "taikaiou", minLevel: 35, maxLevel: 45, weight: 100 },
      ],
    });
    expect(canFish(map, 1, 0, "old_rod")).toBe(false);
  });
});

describe("rollFishingHit", () => {
  it("すごいつりざおは100%ヒット", () => {
    expect(rollFishingHit("super_rod", () => 0.99)).toBe(true);
  });

  it("ボロのつりざおは50%", () => {
    expect(rollFishingHit("old_rod", () => 0.49)).toBe(true);
    expect(rollFishingHit("old_rod", () => 0.51)).toBe(false);
  });

  it("いいつりざおは75%", () => {
    expect(rollFishingHit("good_rod", () => 0.74)).toBe(true);
    expect(rollFishingHit("good_rod", () => 0.76)).toBe(false);
  });
});

describe("rollFishingEncounter", () => {
  it("竿に対応するエントリから抽選する", () => {
    const result = rollFishingEncounter(sampleFishingEntries, "old_rod", () => 0.1);
    expect(result).not.toBeNull();
    expect(result!.rod).toBe("old_rod");
  });

  it("竿に対応するエントリがない場合null", () => {
    const entries: FishingEncounterEntry[] = [
      { rod: "super_rod", speciesId: "taikaiou", minLevel: 35, maxLevel: 45, weight: 100 },
    ];
    expect(rollFishingEncounter(entries, "old_rod")).toBeNull();
  });
});

describe("processFishing", () => {
  it("水タイル隣接でヒットすればモンスターが釣れる", () => {
    const map = createTestMap();
    const result = processFishing(map, 1, 0, "super_rod", speciesResolver, moveResolver, () => 0.1);
    expect(result.hit).toBe(true);
    expect(result.monster).not.toBeNull();
    expect(result.messages.some((m) => m.includes("ヒット"))).toBe(true);
  });

  it("ヒットしなければモンスターなし", () => {
    const map = createTestMap();
    // ボロ竿でrandom=0.99 → 不発
    const result = processFishing(map, 1, 0, "old_rod", speciesResolver, moveResolver, () => 0.99);
    expect(result.hit).toBe(false);
    expect(result.monster).toBeNull();
    expect(result.messages.some((m) => m.includes("あたりがない"))).toBe(true);
  });

  it("釣りできない場所ではエラーメッセージ", () => {
    const map = createTestMap({ fishingEncounters: undefined });
    const result = processFishing(map, 1, 0, "old_rod", speciesResolver, moveResolver);
    expect(result.hit).toBe(false);
    expect(result.messages.some((m) => m.includes("釣りができない"))).toBe(true);
  });
});
