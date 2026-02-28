import { describe, it, expect } from "vitest";
import { FLAVOR_TEXTS, getFlavorText, getFlavorTextCount } from "../monsters/flavor-text";
import { ALL_SPECIES } from "../monsters";

describe("図鑑フレーバーテキスト", () => {
  it("全50種族に図鑑テキストがある", () => {
    expect(getFlavorTextCount()).toBe(50);
  });

  it("ALL_SPECIESの全種族にテキストが対応している", () => {
    for (const species of ALL_SPECIES) {
      const text = getFlavorText(species.id);
      expect(text, `${species.id}（${species.name}）にテキストがない`).toBeDefined();
    }
  });

  it("各テキストが2行以上の長さを持つ", () => {
    for (const [id, text] of Object.entries(FLAVOR_TEXTS)) {
      expect(text.length, `${id}のテキストが短すぎる`).toBeGreaterThan(20);
    }
  });

  it("getFlavorTextで取得できる", () => {
    const text = getFlavorText("himori");
    expect(text).toBeDefined();
    expect(text).toContain("記憶");
  });

  it("存在しないIDはundefined", () => {
    expect(getFlavorText("nonexistent")).toBeUndefined();
  });

  it("伝説モンスターのテキストが大忘却に言及している", () => {
    expect(getFlavorText("omoide")).toContain("大忘却");
    expect(getFlavorText("wasurenu")).toContain("忘却");
  });
});
