import { describe, it, expect } from "vitest";
import {
  ALL_FACILITY_MAPS,
  POKECENTERS,
  SHOPS,
  HOUSES,
  getFacilityById,
  getFacilityCount,
} from "../facilities";

describe("施設マップ定義", () => {
  it("23以上の施設マップが定義されている", () => {
    expect(getFacilityCount()).toBeGreaterThanOrEqual(23);
  });

  it("ポケモンセンターが9つある", () => {
    expect(POKECENTERS).toHaveLength(9);
  });

  it("ショップが7つある", () => {
    expect(SHOPS).toHaveLength(7);
  });

  it("民家が7つある", () => {
    expect(HOUSES).toHaveLength(7);
  });

  it("全施設マップにid/name/npcsがある", () => {
    for (const map of ALL_FACILITY_MAPS) {
      expect(map.id.length, `マップIDが空`).toBeGreaterThan(0);
      expect(map.name.length, `${map.id}のnameが空`).toBeGreaterThan(0);
      expect(map.npcs.length, `${map.id}のNPCが0`).toBeGreaterThan(0);
    }
  });

  it("全施設マップのタイルサイズが正しい", () => {
    for (const map of ALL_FACILITY_MAPS) {
      expect(map.tiles.length, `${map.id}のheightが不一致`).toBe(map.height);
      for (const row of map.tiles) {
        expect(row.length, `${map.id}のwidthが不一致`).toBe(map.width);
      }
    }
  });

  it("全施設マップのエンカウント率が0", () => {
    for (const map of ALL_FACILITY_MAPS) {
      expect(map.encounterRate, `${map.id}のencounterRateが0でない`).toBe(0);
    }
  });

  it("ポケモンセンターに回復NPCがいる", () => {
    for (const center of POKECENTERS) {
      const healer = center.npcs.find((n) => n.onInteract?.heal);
      expect(healer, `${center.id}に回復NPCがいない`).toBeDefined();
    }
  });

  it("ショップに店員NPCがいる", () => {
    for (const shop of SHOPS) {
      const shopkeeper = shop.npcs.find((n) => n.name === "店員");
      expect(shopkeeper, `${shop.id}に店員がいない`).toBeDefined();
    }
  });

  it("IDから施設を取得できる", () => {
    const center = getFacilityById("pokecenter-wasuremachi");
    expect(center).toBeDefined();
    expect(center!.name).toContain("ワスレ町");
  });

  it("存在しないIDはundefined", () => {
    expect(getFacilityById("nonexistent")).toBeUndefined();
  });

  it("全施設マップのIDがユニーク", () => {
    const ids = ALL_FACILITY_MAPS.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("ドアタイルが配置されている", () => {
    for (const map of ALL_FACILITY_MAPS) {
      const hasDoor = map.tiles.some((row) => row.includes("door"));
      expect(hasDoor, `${map.id}にドアがない`).toBe(true);
    }
  });
});
