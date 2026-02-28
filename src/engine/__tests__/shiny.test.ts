import { describe, it, expect } from "vitest";
import { rollShiny, generateShinyPalette, SHINY_RATE } from "../shiny";

describe("rollShiny", () => {
  it("確率1/4096で色違いと判定される", () => {
    expect(SHINY_RATE).toBe(1 / 4096);
  });

  it("乱数が確率未満なら色違い", () => {
    expect(rollShiny(() => 0.0001)).toBe(true);
  });

  it("乱数が確率以上なら通常", () => {
    expect(rollShiny(() => 0.5)).toBe(false);
  });

  it("確率のボーダーライン", () => {
    // 1/4096 ≈ 0.000244140625
    expect(rollShiny(() => 0.000244)).toBe(true);
    expect(rollShiny(() => 0.000245)).toBe(false);
  });
});

describe("generateShinyPalette", () => {
  it("パレットの各色が変換される", () => {
    const original = {
      "1": "#ff0000",
      "2": "#00ff00",
      "3": "#0000ff",
    };
    const shiny = generateShinyPalette(original);

    // 全キーが保持される
    expect(Object.keys(shiny)).toEqual(Object.keys(original));

    // 変換後の値が元と異なる（赤→シアン、緑→マゼンタ、青→黄色系）
    expect(shiny["1"]).not.toBe(original["1"]);
    expect(shiny["2"]).not.toBe(original["2"]);
    expect(shiny["3"]).not.toBe(original["3"]);
  });

  it("HEXカラーの形式が保持される", () => {
    const original = { "1": "#ff5733" };
    const shiny = generateShinyPalette(original);
    expect(shiny["1"]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("非HEXカラーはそのまま返す", () => {
    const original = { "1": "red" };
    const shiny = generateShinyPalette(original);
    expect(shiny["1"]).toBe("red");
  });

  it("空パレットは空で返す", () => {
    const shiny = generateShinyPalette({});
    expect(Object.keys(shiny)).toHaveLength(0);
  });
});
