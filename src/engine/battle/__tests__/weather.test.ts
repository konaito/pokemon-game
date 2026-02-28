import { describe, it, expect } from "vitest";
import {
  createWeatherState,
  setWeather,
  tickWeather,
  getWeatherDamageMultiplier,
  getSandstormSpDefMultiplier,
  getWeatherDamage,
  getWeatherStartMessage,
  getWeatherEndMessage,
  getWeatherDamageMessage,
  getWeatherContinueMessage,
  WEATHER_NAMES,
} from "../weather";

describe("createWeatherState", () => {
  it("デフォルトはclear", () => {
    const state = createWeatherState();
    expect(state.weather).toBe("clear");
    expect(state.turnsRemaining).toBe(0);
  });

  it("指定した天候で作成できる", () => {
    const state = createWeatherState("sunny");
    expect(state.weather).toBe("sunny");
  });
});

describe("setWeather", () => {
  it("天候を5ターンで設定", () => {
    const state = setWeather("rainy");
    expect(state.weather).toBe("rainy");
    expect(state.turnsRemaining).toBe(5);
  });

  it("ターン数を指定できる", () => {
    const state = setWeather("sandstorm", 8);
    expect(state.turnsRemaining).toBe(8);
  });

  it("clearを設定するとターン0", () => {
    const state = setWeather("clear");
    expect(state.weather).toBe("clear");
    expect(state.turnsRemaining).toBe(0);
  });
});

describe("tickWeather", () => {
  it("clearはそのまま", () => {
    const state = createWeatherState();
    expect(tickWeather(state)).toEqual(state);
  });

  it("永続天候（turnsRemaining=0）はそのまま", () => {
    const state = { weather: "sunny" as const, turnsRemaining: 0 };
    expect(tickWeather(state)).toEqual(state);
  });

  it("ターン数が1減る", () => {
    const state = setWeather("rainy", 5);
    const next = tickWeather(state);
    expect(next.weather).toBe("rainy");
    expect(next.turnsRemaining).toBe(4);
  });

  it("残り1ターンでclearに戻る", () => {
    const state = { weather: "hail" as const, turnsRemaining: 1 };
    const next = tickWeather(state);
    expect(next.weather).toBe("clear");
    expect(next.turnsRemaining).toBe(0);
  });
});

describe("getWeatherDamageMultiplier", () => {
  it("晴れ: 炎1.5倍", () => {
    expect(getWeatherDamageMultiplier("sunny", "fire")).toBe(1.5);
  });

  it("晴れ: 水0.5倍", () => {
    expect(getWeatherDamageMultiplier("sunny", "water")).toBe(0.5);
  });

  it("雨: 水1.5倍", () => {
    expect(getWeatherDamageMultiplier("rainy", "water")).toBe(1.5);
  });

  it("雨: 炎0.5倍", () => {
    expect(getWeatherDamageMultiplier("rainy", "fire")).toBe(0.5);
  });

  it("晴れ: 他タイプは等倍", () => {
    expect(getWeatherDamageMultiplier("sunny", "grass")).toBe(1.0);
  });

  it("clearは等倍", () => {
    expect(getWeatherDamageMultiplier("clear", "fire")).toBe(1.0);
  });

  it("砂嵐は攻撃倍率に影響なし", () => {
    expect(getWeatherDamageMultiplier("sandstorm", "fire")).toBe(1.0);
  });
});

describe("getSandstormSpDefMultiplier", () => {
  it("砂嵐時に岩タイプは特防1.5倍", () => {
    expect(getSandstormSpDefMultiplier("sandstorm", ["rock"])).toBe(1.5);
  });

  it("砂嵐時に岩複合タイプも1.5倍", () => {
    expect(getSandstormSpDefMultiplier("sandstorm", ["grass", "rock"])).toBe(1.5);
  });

  it("砂嵐時に岩以外は等倍", () => {
    expect(getSandstormSpDefMultiplier("sandstorm", ["fire"])).toBe(1.0);
  });

  it("砂嵐以外は等倍", () => {
    expect(getSandstormSpDefMultiplier("clear", ["rock"])).toBe(1.0);
  });
});

describe("getWeatherDamage", () => {
  it("砂嵐: 最大HPの1/16ダメージ", () => {
    expect(getWeatherDamage("sandstorm", 160, ["fire"])).toBe(10);
  });

  it("砂嵐: 岩タイプは免除", () => {
    expect(getWeatherDamage("sandstorm", 160, ["rock"])).toBe(0);
  });

  it("砂嵐: 地面タイプは免除", () => {
    expect(getWeatherDamage("sandstorm", 160, ["ground"])).toBe(0);
  });

  it("砂嵐: 鋼タイプは免除", () => {
    expect(getWeatherDamage("sandstorm", 160, ["steel"])).toBe(0);
  });

  it("あられ: 最大HPの1/16ダメージ", () => {
    expect(getWeatherDamage("hail", 160, ["fire"])).toBe(10);
  });

  it("あられ: 氷タイプは免除", () => {
    expect(getWeatherDamage("hail", 160, ["ice"])).toBe(0);
  });

  it("最低1ダメージ保証", () => {
    expect(getWeatherDamage("sandstorm", 10, ["fire"])).toBe(1);
  });

  it("clearはダメージ0", () => {
    expect(getWeatherDamage("clear", 160, ["fire"])).toBe(0);
  });

  it("晴れ/雨はダメージ0", () => {
    expect(getWeatherDamage("sunny", 160, ["fire"])).toBe(0);
    expect(getWeatherDamage("rainy", 160, ["fire"])).toBe(0);
  });
});

describe("天候メッセージ", () => {
  it("WEATHER_NAMESに全天候がある", () => {
    expect(WEATHER_NAMES.clear).toBe("なし");
    expect(WEATHER_NAMES.sunny).toBe("晴れ");
    expect(WEATHER_NAMES.rainy).toBe("雨");
    expect(WEATHER_NAMES.sandstorm).toBe("砂嵐");
    expect(WEATHER_NAMES.hail).toBe("あられ");
  });

  it("開始メッセージ", () => {
    expect(getWeatherStartMessage("sunny")).toContain("日差し");
    expect(getWeatherStartMessage("rainy")).toContain("雨");
    expect(getWeatherStartMessage("sandstorm")).toContain("砂嵐");
    expect(getWeatherStartMessage("hail")).toContain("あられ");
    expect(getWeatherStartMessage("clear")).toBe("");
  });

  it("終了メッセージ", () => {
    expect(getWeatherEndMessage("sunny")).toContain("元に戻った");
    expect(getWeatherEndMessage("rainy")).toContain("止んだ");
    expect(getWeatherEndMessage("sandstorm")).toContain("収まった");
    expect(getWeatherEndMessage("hail")).toContain("止んだ");
    expect(getWeatherEndMessage("clear")).toBe("");
  });

  it("ダメージメッセージ", () => {
    expect(getWeatherDamageMessage("sandstorm", "ヒモリ")).toContain("ヒモリ");
    expect(getWeatherDamageMessage("hail", "ヒモリ")).toContain("ヒモリ");
    expect(getWeatherDamageMessage("clear", "ヒモリ")).toBe("");
  });

  it("継続メッセージ", () => {
    expect(getWeatherContinueMessage("sunny").length).toBeGreaterThan(0);
    expect(getWeatherContinueMessage("rainy").length).toBeGreaterThan(0);
    expect(getWeatherContinueMessage("sandstorm").length).toBeGreaterThan(0);
    expect(getWeatherContinueMessage("hail").length).toBeGreaterThan(0);
    expect(getWeatherContinueMessage("clear")).toBe("");
  });
});
