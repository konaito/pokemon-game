import { describe, it, expect } from "vitest";
import {
  LANDMARKS,
  getLandmarksByMapId,
  getLandmarkById,
  getLandmarkCount,
  getHiddenItemLandmarkCount,
} from "../landmarks";

describe("ランドマーク定義", () => {
  it("12以上のランドマークが定義されている", () => {
    expect(getLandmarkCount()).toBeGreaterThanOrEqual(12);
  });

  it("全ランドマークに必須フィールドがある", () => {
    for (const landmark of LANDMARKS) {
      expect(landmark.id.length).toBeGreaterThan(0);
      expect(landmark.name.length).toBeGreaterThan(0);
      expect(landmark.mapId.length).toBeGreaterThan(0);
      expect(landmark.type.length).toBeGreaterThan(0);
      expect(landmark.description.length).toBeGreaterThan(0);
    }
  });

  it("IDがユニーク", () => {
    const ids = LANDMARKS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("各ランドマークの説明文が2行以上", () => {
    for (const landmark of LANDMARKS) {
      expect(landmark.description.length, `${landmark.id}の説明が短い`).toBeGreaterThanOrEqual(2);
    }
  });

  it("隠しアイテム付きランドマークが4つ以上ある", () => {
    expect(getHiddenItemLandmarkCount()).toBeGreaterThanOrEqual(4);
  });
});

describe("ランドマーク検索", () => {
  it("マップIDでランドマークを取得できる", () => {
    const wasuremachi = getLandmarksByMapId("wasuremachi");
    expect(wasuremachi.length).toBeGreaterThanOrEqual(1);
  });

  it("カワセミシティに複数のランドマーク", () => {
    const kawasemi = getLandmarksByMapId("kawasemi-city");
    expect(kawasemi.length).toBeGreaterThanOrEqual(2);
  });

  it("IDで単一ランドマークを取得", () => {
    const landmark = getLandmarkById("landmark-wasuremachi-tree");
    expect(landmark).toBeDefined();
    expect(landmark!.name).toBe("忘却の大樹");
  });

  it("存在しないIDはundefined", () => {
    expect(getLandmarkById("nonexistent")).toBeUndefined();
  });

  it("存在しないマップは空配列", () => {
    expect(getLandmarksByMapId("nonexistent")).toEqual([]);
  });

  it("説明が大忘却テーマに沿っている", () => {
    let memoryCount = 0;
    for (const landmark of LANDMARKS) {
      const fullText = landmark.description.join(" ");
      if (fullText.includes("大忘却") || fullText.includes("記憶") || fullText.includes("忘")) {
        memoryCount++;
      }
    }
    // 大多数のランドマークが忘却・記憶テーマを含む
    expect(memoryCount).toBeGreaterThanOrEqual(8);
  });
});
