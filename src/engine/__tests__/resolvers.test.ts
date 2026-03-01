import { describe, it, expect } from "vitest";
import {
  createSpeciesResolver,
  createMoveResolver,
  createItemResolver,
  createMapResolver,
} from "../resolvers";

describe("createSpeciesResolver", () => {
  const resolve = createSpeciesResolver();

  it("有効なIDでデータを取得できる", () => {
    const species = resolve("himori");
    expect(species.id).toBe("himori");
    expect(species.name).toBeDefined();
    expect(species.types.length).toBeGreaterThanOrEqual(1);
  });

  it("無効なIDでエラーをスローする", () => {
    expect(() => resolve("nonexistent-species")).toThrow("Unknown species: nonexistent-species");
  });
});

describe("createMoveResolver", () => {
  const resolve = createMoveResolver();

  it("有効なIDでデータを取得できる", () => {
    const move = resolve("tackle");
    expect(move.id).toBe("tackle");
    expect(move.name).toBeDefined();
    expect(move.type).toBeDefined();
  });

  it("無効なIDでエラーをスローする", () => {
    expect(() => resolve("nonexistent-move")).toThrow("Unknown move: nonexistent-move");
  });
});

describe("createItemResolver", () => {
  const resolve = createItemResolver();

  it("有効なIDでデータを取得できる", () => {
    const item = resolve("potion");
    expect(item.id).toBe("potion");
    expect(item.name).toBeDefined();
    expect(item.category).toBeDefined();
  });

  it("無効なIDでエラーをスローする", () => {
    expect(() => resolve("nonexistent-item")).toThrow("Unknown item: nonexistent-item");
  });
});

describe("createMapResolver", () => {
  const resolve = createMapResolver();

  it("有効なIDでデータを取得できる", () => {
    const map = resolve("wasuremachi");
    expect(map).toBeDefined();
  });

  it("無効なIDでエラーをスローする", () => {
    expect(() => resolve("nonexistent-map")).toThrow("Unknown map: nonexistent-map");
  });
});
