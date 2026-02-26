import { describe, it, expect } from "vitest";
import {
  getTileProperties,
  getTileAt,
  isWalkable,
  getConnectionAt,
  type MapDefinition,
} from "../map-data";

const testMap: MapDefinition = {
  id: "test-town",
  name: "テスト町",
  width: 3,
  height: 3,
  tiles: [
    ["ground", "grass", "wall"],
    ["ground", "door", "water"],
    ["wall", "ground", "ground"],
  ],
  connections: [{ targetMapId: "route-1", targetX: 0, targetY: 0, sourceX: 1, sourceY: 1 }],
  encounters: [],
  encounterRate: 0,
  npcs: [],
};

describe("マップデータ", () => {
  describe("getTileProperties", () => {
    it("地面は通行可能・エンカウントなし", () => {
      const tile = getTileProperties("ground");
      expect(tile.walkable).toBe(true);
      expect(tile.encounter).toBe(false);
    });

    it("草むらは通行可能・エンカウントあり", () => {
      const tile = getTileProperties("grass");
      expect(tile.walkable).toBe(true);
      expect(tile.encounter).toBe(true);
    });

    it("壁は通行不可", () => {
      const tile = getTileProperties("wall");
      expect(tile.walkable).toBe(false);
    });

    it("水は通行不可", () => {
      const tile = getTileProperties("water");
      expect(tile.walkable).toBe(false);
    });
  });

  describe("getTileAt", () => {
    it("マップ範囲内のタイルを取得できる", () => {
      const tile = getTileAt(testMap, 1, 0);
      expect(tile).not.toBeNull();
      expect(tile!.type).toBe("grass");
    });

    it("マップ範囲外は null を返す", () => {
      expect(getTileAt(testMap, -1, 0)).toBeNull();
      expect(getTileAt(testMap, 3, 0)).toBeNull();
      expect(getTileAt(testMap, 0, -1)).toBeNull();
      expect(getTileAt(testMap, 0, 3)).toBeNull();
    });
  });

  describe("isWalkable", () => {
    it("地面は通行可能", () => {
      expect(isWalkable(testMap, 0, 0)).toBe(true);
    });

    it("壁は通行不可", () => {
      expect(isWalkable(testMap, 2, 0)).toBe(false);
    });

    it("範囲外は通行不可", () => {
      expect(isWalkable(testMap, -1, 0)).toBe(false);
    });
  });

  describe("getConnectionAt", () => {
    it("接続があれば返す", () => {
      const conn = getConnectionAt(testMap, 1, 1);
      expect(conn).not.toBeNull();
      expect(conn!.targetMapId).toBe("route-1");
    });

    it("接続がなければ null を返す", () => {
      expect(getConnectionAt(testMap, 0, 0)).toBeNull();
    });
  });
});
