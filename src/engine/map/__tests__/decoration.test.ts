import { describe, it, expect } from "vitest";
import {
  TOWN_THEMES,
  TOWN_DECORATIONS,
  getTownTheme,
  getTownDecorations,
  getThemedTownCount,
  getDecoratedTownCount,
  type DecorationTile,
} from "../decoration";

describe("街テーマカラー", () => {
  it("10街以上にテーマカラーが定義されている", () => {
    expect(getThemedTownCount()).toBeGreaterThanOrEqual(10);
  });

  it("全テーマにprimary/secondary/groundTint/themeNameがある", () => {
    for (const [id, theme] of Object.entries(TOWN_THEMES)) {
      expect(theme.primary.length, `${id}のprimaryが空`).toBeGreaterThan(0);
      expect(theme.secondary.length, `${id}のsecondaryが空`).toBeGreaterThan(0);
      expect(theme.groundTint.length, `${id}のgroundTintが空`).toBeGreaterThan(0);
      expect(theme.themeName.length, `${id}のthemeNameが空`).toBeGreaterThan(0);
    }
  });

  it("テーマカラーがHEXカラー形式", () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const [id, theme] of Object.entries(TOWN_THEMES)) {
      expect(theme.primary, `${id}のprimaryがHEX形式でない`).toMatch(hexPattern);
      expect(theme.secondary, `${id}のsecondaryがHEX形式でない`).toMatch(hexPattern);
      expect(theme.groundTint, `${id}のgroundTintがHEX形式でない`).toMatch(hexPattern);
    }
  });

  it("getTownThemeでテーマを取得できる", () => {
    const theme = getTownTheme("wasuremachi");
    expect(theme).toBeDefined();
    expect(theme!.themeName).toBe("素朴な丘の村");
  });

  it("存在しない街はundefined", () => {
    expect(getTownTheme("nonexistent")).toBeUndefined();
  });
});

describe("装飾タイル", () => {
  it("10街以上に装飾タイルが定義されている", () => {
    expect(getDecoratedTownCount()).toBeGreaterThanOrEqual(10);
  });

  it("各街に3つ以上の装飾がある", () => {
    for (const [id, decorations] of Object.entries(TOWN_DECORATIONS)) {
      expect(decorations.length, `${id}の装飾が3未満`).toBeGreaterThanOrEqual(3);
    }
  });

  it("全装飾にx/y/variantがある", () => {
    for (const [id, decorations] of Object.entries(TOWN_DECORATIONS)) {
      for (const deco of decorations) {
        expect(deco.x, `${id}の装飾にxがない`).toBeGreaterThanOrEqual(0);
        expect(deco.y, `${id}の装飾にyがない`).toBeGreaterThanOrEqual(0);
        expect(deco.variant.length, `${id}の装飾にvariantがない`).toBeGreaterThan(0);
      }
    }
  });

  it("テキスト付き装飾にtextがある", () => {
    const textVariants = ["signpost", "bulletin_board", "monument"];
    for (const [id, decorations] of Object.entries(TOWN_DECORATIONS)) {
      for (const deco of decorations) {
        if (textVariants.includes(deco.variant)) {
          expect(deco.text, `${id}の${deco.variant}にtextがない`).toBeDefined();
          expect(deco.text!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("getTownDecorationsで装飾を取得できる", () => {
    const decos = getTownDecorations("kawasemi-city");
    expect(decos.length).toBeGreaterThanOrEqual(3);
    const fountain = decos.find((d: DecorationTile) => d.variant === "fountain");
    expect(fountain).toBeDefined();
  });

  it("存在しない街は空配列を返す", () => {
    expect(getTownDecorations("nonexistent")).toEqual([]);
  });

  it("噴水がカワセミシティにある", () => {
    const decos = getTownDecorations("kawasemi-city");
    expect(decos.some((d: DecorationTile) => d.variant === "fountain")).toBe(true);
  });

  it("ポケモンリーグに像がある", () => {
    const decos = getTownDecorations("pokemon-league");
    expect(decos.some((d: DecorationTile) => d.variant === "statue")).toBe(true);
  });
});
