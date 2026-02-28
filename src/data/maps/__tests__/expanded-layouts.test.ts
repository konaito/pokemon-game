import { describe, it, expect } from "vitest";
import {
  EXPANDED_LAYOUTS,
  getExpandedLayout,
  getExpandedLayoutCount,
  getLayoutsByFeature,
  validateLayout,
  countDecorativeTiles,
  WASUREMACHI_EXPANDED,
  TSUCHIGUMO_EXPANDED,
  MORINOHA_EXPANDED,
  INAZUMA_EXPANDED,
  KAGARI_EXPANDED,
  GOUKI_EXPANDED,
  KIRIFURI_EXPANDED,
  FUYUHA_EXPANDED,
  TATSUMI_EXPANDED,
  LEAGUE_EXPANDED,
} from "@/data/maps/expanded-layouts";

describe("拡張マップレイアウト", () => {
  it("10街すべての拡張レイアウトが定義されている", () => {
    expect(getExpandedLayoutCount()).toBe(10);
    expect(getExpandedLayout("wasuremachi")).toBeDefined();
    expect(getExpandedLayout("tsuchigumo-village")).toBeDefined();
    expect(getExpandedLayout("morinoha-town")).toBeDefined();
    expect(getExpandedLayout("inazuma-city")).toBeDefined();
    expect(getExpandedLayout("kagari-city")).toBeDefined();
    expect(getExpandedLayout("gouki-town")).toBeDefined();
    expect(getExpandedLayout("kirifuri-village")).toBeDefined();
    expect(getExpandedLayout("fuyuha-town")).toBeDefined();
    expect(getExpandedLayout("tatsumi-city")).toBeDefined();
    expect(getExpandedLayout("pokemon-league")).toBeDefined();
  });

  it("10街中6街以上が10×10から拡張されている", () => {
    const expanded = Object.values(EXPANDED_LAYOUTS).filter((l) => l.width > 10 || l.height > 10);
    expect(expanded.length).toBeGreaterThanOrEqual(6);
  });

  it("各街が異なるサイズを持つ（少なくとも4種類のサイズ）", () => {
    const sizes = new Set(Object.values(EXPANDED_LAYOUTS).map((l) => `${l.width}x${l.height}`));
    expect(sizes.size).toBeGreaterThanOrEqual(4);
  });

  it("全レイアウトが正しいタイル配列を持つ", () => {
    for (const layout of Object.values(EXPANDED_LAYOUTS)) {
      const result = validateLayout(layout);
      expect(result.valid, `${layout.name}: ${result.errors.join(", ")}`).toBe(true);
    }
  });

  it("水タイルが装飾的に活用されている（3街以上）", () => {
    let waterUsageCount = 0;
    for (const layout of Object.values(EXPANDED_LAYOUTS)) {
      const { water } = countDecorativeTiles(layout);
      if (water > 0) waterUsageCount++;
    }
    expect(waterUsageCount).toBeGreaterThanOrEqual(3);
  });

  it("草タイルが装飾的に活用されている（3街以上）", () => {
    let grassUsageCount = 0;
    for (const layout of Object.values(EXPANDED_LAYOUTS)) {
      const { grass } = countDecorativeTiles(layout);
      if (grass > 0) grassUsageCount++;
    }
    expect(grassUsageCount).toBeGreaterThanOrEqual(3);
  });

  it("各街が異なるレイアウト特徴を持つ", () => {
    const allFeatures = new Set<string>();
    for (const layout of Object.values(EXPANDED_LAYOUTS)) {
      expect(layout.features.length).toBeGreaterThan(0);
      layout.features.forEach((f) => allFeatures.add(f));
    }
    // 少なくとも8種類の特徴が使われている
    expect(allFeatures.size).toBeGreaterThanOrEqual(8);
  });

  describe("個別マップのサイズ検証", () => {
    it("ワスレ町は12×12", () => {
      expect(WASUREMACHI_EXPANDED.width).toBe(12);
      expect(WASUREMACHI_EXPANDED.height).toBe(12);
    });

    it("ツチグモ村は10×12", () => {
      expect(TSUCHIGUMO_EXPANDED.width).toBe(10);
      expect(TSUCHIGUMO_EXPANDED.height).toBe(12);
    });

    it("モリノハの町は14×12", () => {
      expect(MORINOHA_EXPANDED.width).toBe(14);
      expect(MORINOHA_EXPANDED.height).toBe(12);
    });

    it("イナヅマシティは16×14", () => {
      expect(INAZUMA_EXPANDED.width).toBe(16);
      expect(INAZUMA_EXPANDED.height).toBe(14);
    });

    it("カガリ市は14×14", () => {
      expect(KAGARI_EXPANDED.width).toBe(14);
      expect(KAGARI_EXPANDED.height).toBe(14);
    });

    it("ゴウキの町は12×14", () => {
      expect(GOUKI_EXPANDED.width).toBe(12);
      expect(GOUKI_EXPANDED.height).toBe(14);
    });

    it("キリフリ村は12×12", () => {
      expect(KIRIFURI_EXPANDED.width).toBe(12);
      expect(KIRIFURI_EXPANDED.height).toBe(12);
    });

    it("フユハの町は14×12", () => {
      expect(FUYUHA_EXPANDED.width).toBe(14);
      expect(FUYUHA_EXPANDED.height).toBe(12);
    });

    it("タツミシティは18×16（最大）", () => {
      expect(TATSUMI_EXPANDED.width).toBe(18);
      expect(TATSUMI_EXPANDED.height).toBe(16);
    });

    it("ポケモンリーグは12×16", () => {
      expect(LEAGUE_EXPANDED.width).toBe(12);
      expect(LEAGUE_EXPANDED.height).toBe(16);
    });
  });

  describe("特徴検索", () => {
    it("fountainの特徴を持つ街が検索できる", () => {
      const results = getLayoutsByFeature("fountain");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((l) => l.mapId === "inazuma-city")).toBe(true);
    });

    it("pondの特徴を持つ街が検索できる", () => {
      const results = getLayoutsByFeature("pond");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("elevationの特徴を持つ街が複数ある", () => {
      const results = getLayoutsByFeature("elevation");
      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("装飾タイル詳細", () => {
    it("ワスレ町に池（水タイル）がある", () => {
      const { water } = countDecorativeTiles(WASUREMACHI_EXPANDED);
      expect(water).toBeGreaterThan(0);
      expect(WASUREMACHI_EXPANDED.waterUsage).toBeDefined();
    });

    it("イナヅマシティに噴水がある", () => {
      const { water } = countDecorativeTiles(INAZUMA_EXPANDED);
      expect(water).toBeGreaterThan(0);
    });

    it("タツミシティに港の海がある", () => {
      const { water } = countDecorativeTiles(TATSUMI_EXPANDED);
      expect(water).toBeGreaterThan(0);
    });

    it("フユハの町に凍った池がある", () => {
      const { water } = countDecorativeTiles(FUYUHA_EXPANDED);
      expect(water).toBeGreaterThan(0);
    });

    it("モリノハの町に畑（草タイル）がある", () => {
      const { grass } = countDecorativeTiles(MORINOHA_EXPANDED);
      expect(grass).toBeGreaterThan(0);
    });
  });

  it("存在しないマップIDでundefinedを返す", () => {
    expect(getExpandedLayout("nonexistent")).toBeUndefined();
  });
});
