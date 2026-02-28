import { describe, it, expect } from "vitest";
import {
  isShinyRoll,
  SHINY_RATE,
  SHINY_CHARM_MULTIPLIER,
  generateShinyPalette,
  getShinyEncounterMessage,
  isHiddenAbilityRoll,
  HIDDEN_ABILITY_RATE,
  getHiddenAbility,
  HIDDEN_ABILITIES,
} from "../shiny";

describe("色違い判定", () => {
  it("確率以下の乱数で色違いになる", () => {
    // random()がSHINY_RATEより小さい値を返す
    expect(isShinyRoll(false, () => SHINY_RATE - 0.00001)).toBe(true);
  });

  it("確率以上の乱数では色違いにならない", () => {
    expect(isShinyRoll(false, () => SHINY_RATE + 0.001)).toBe(false);
  });

  it("ひかるおまもりで確率が3倍になる", () => {
    const rate = SHINY_RATE * SHINY_CHARM_MULTIPLIER;
    expect(isShinyRoll(true, () => rate - 0.00001)).toBe(true);
    expect(isShinyRoll(true, () => rate + 0.001)).toBe(false);
  });

  it("SHINY_RATEは1/4096", () => {
    expect(SHINY_RATE).toBeCloseTo(1 / 4096);
  });
});

describe("generateShinyPalette", () => {
  it("パレットの色が変化する", () => {
    const normal = { "1": "#ff0000", "2": "#00ff00" };
    const shiny = generateShinyPalette(normal);

    expect(shiny["1"]).not.toBe(normal["1"]);
    expect(shiny["2"]).not.toBe(normal["2"]);
  });

  it("HEX形式を保持する", () => {
    const normal = { "1": "#ff8844" };
    const shiny = generateShinyPalette(normal);
    expect(shiny["1"]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("黒(#000000)はシフトしても黒のまま", () => {
    const normal = { "1": "#000000" };
    const shiny = generateShinyPalette(normal);
    expect(shiny["1"]).toBe("#000000");
  });

  it("全キーが保持される", () => {
    const normal = { "1": "#ff0000", "2": "#00ff00", "3": "#0000ff" };
    const shiny = generateShinyPalette(normal);
    expect(Object.keys(shiny)).toEqual(Object.keys(normal));
  });
});

describe("getShinyEncounterMessage", () => {
  it("色違いメッセージにモンスター名が含まれる", () => {
    const msg = getShinyEncounterMessage("ヒモリ");
    expect(msg).toContain("色違い");
    expect(msg).toContain("ヒモリ");
  });
});

describe("隠れ特性判定", () => {
  it("確率以下で隠れ特性発動", () => {
    expect(isHiddenAbilityRoll(() => HIDDEN_ABILITY_RATE - 0.001)).toBe(true);
  });

  it("確率以上では通常特性", () => {
    expect(isHiddenAbilityRoll(() => HIDDEN_ABILITY_RATE + 0.001)).toBe(false);
  });

  it("HIDDEN_ABILITY_RATEは1/100", () => {
    expect(HIDDEN_ABILITY_RATE).toBe(0.01);
  });
});

describe("HIDDEN_ABILITIES マッピング", () => {
  it("御三家に隠れ特性がある", () => {
    expect(getHiddenAbility("himori")).toBe("speed_boost");
    expect(getHiddenAbility("shizukumo")).toBe("swift_swim");
    expect(getHiddenAbility("konohana")).toBe("thick_fat");
  });

  it("全48種に隠れ特性がある（伝説除く）", () => {
    // 伝説2体を除く48体
    expect(Object.keys(HIDDEN_ABILITIES).length).toBe(48);
  });

  it("伝説モンスターには隠れ特性がない", () => {
    expect(getHiddenAbility("omoide")).toBeNull();
    expect(getHiddenAbility("wasurenu")).toBeNull();
  });

  it("未登録IDはnullを返す", () => {
    expect(getHiddenAbility("nonexistent")).toBeNull();
  });
});
