import { describe, it, expect } from "vitest";
import {
  createWeatherState,
  setWeather,
  getWeatherDamageMultiplier,
  getWeatherSpDefMultiplier,
  applyWeatherDamage,
  tickWeather,
  getWeatherName,
} from "../weather";
import type { MonsterInstance, MonsterSpecies } from "@/types";

function createMonster(currentHp: number = 100): MonsterInstance {
  return {
    uid: "test-1",
    speciesId: "himori",
    level: 50,
    exp: 100000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

const fireSpecies: MonsterSpecies = {
  id: "himori",
  name: "ヒモリ",
  types: ["fire"],
  baseStats: { hp: 45, atk: 60, def: 40, spAtk: 50, spDef: 40, speed: 65 },
  baseExpYield: 62,
  expGroup: "medium_slow",
  learnset: [],
};

const rockSpecies: MonsterSpecies = {
  id: "kogoriiwa",
  name: "コゴリイワ",
  types: ["ice", "rock"],
  baseStats: { hp: 70, atk: 100, def: 120, spAtk: 45, spDef: 55, speed: 30 },
  baseExpYield: 180,
  expGroup: "medium_slow",
  learnset: [],
};

const iceSpecies: MonsterSpecies = {
  id: "yukiusagi",
  name: "ユキウサギ",
  types: ["ice"],
  baseStats: { hp: 50, atk: 35, def: 40, spAtk: 60, spDef: 55, speed: 65 },
  baseExpYield: 60,
  expGroup: "medium_fast",
  learnset: [],
};

describe("天候システム", () => {
  describe("createWeatherState", () => {
    it("デフォルトは通常天候", () => {
      const state = createWeatherState();
      expect(state.current).toBe("clear");
      expect(state.turnsRemaining).toBe(0);
    });

    it("初期天候を指定できる", () => {
      const state = createWeatherState("rainy");
      expect(state.current).toBe("rainy");
    });
  });

  describe("setWeather", () => {
    it("天候を変更しメッセージを返す", () => {
      const state = createWeatherState();
      const msgs = setWeather(state, "sunny");
      expect(state.current).toBe("sunny");
      expect(state.turnsRemaining).toBe(5);
      expect(msgs[0]).toContain("日差し");
    });

    it("同じ天候の場合は効果なし", () => {
      const state = createWeatherState("sunny");
      state.turnsRemaining = 3;
      const msgs = setWeather(state, "sunny");
      expect(msgs[0]).toContain("効果がなかった");
    });

    it("4種の天候にそれぞれメッセージが出る", () => {
      for (const w of ["sunny", "rainy", "sandstorm", "hail"] as const) {
        const state = createWeatherState();
        const msgs = setWeather(state, w);
        expect(msgs.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getWeatherDamageMultiplier", () => {
    it("晴れ: 炎技1.5倍", () => {
      expect(getWeatherDamageMultiplier("sunny", "fire")).toBe(1.5);
    });

    it("晴れ: 水技0.5倍", () => {
      expect(getWeatherDamageMultiplier("sunny", "water")).toBe(0.5);
    });

    it("雨: 水技1.5倍", () => {
      expect(getWeatherDamageMultiplier("rainy", "water")).toBe(1.5);
    });

    it("雨: 炎技0.5倍", () => {
      expect(getWeatherDamageMultiplier("rainy", "fire")).toBe(0.5);
    });

    it("通常天候: 倍率なし", () => {
      expect(getWeatherDamageMultiplier("clear", "fire")).toBe(1);
    });
  });

  describe("getWeatherSpDefMultiplier", () => {
    it("砂嵐時の岩タイプ: 特防1.5倍", () => {
      expect(getWeatherSpDefMultiplier("sandstorm", ["rock"])).toBe(1.5);
    });

    it("砂嵐時の非岩タイプ: 倍率なし", () => {
      expect(getWeatherSpDefMultiplier("sandstorm", ["fire"])).toBe(1);
    });

    it("通常天候: 倍率なし", () => {
      expect(getWeatherSpDefMultiplier("clear", ["rock"])).toBe(1);
    });
  });

  describe("applyWeatherDamage", () => {
    it("砂嵐: 炎タイプにダメージ", () => {
      const monster = createMonster(100);
      const result = applyWeatherDamage("sandstorm", monster, fireSpecies);
      expect(result.damage).toBeGreaterThan(0);
      expect(result.message).toContain("砂嵐");
    });

    it("砂嵐: 岩タイプはダメージなし", () => {
      const monster = createMonster(100);
      const result = applyWeatherDamage("sandstorm", monster, rockSpecies);
      expect(result.damage).toBe(0);
    });

    it("あられ: 炎タイプにダメージ", () => {
      const monster = createMonster(100);
      const result = applyWeatherDamage("hail", monster, fireSpecies);
      expect(result.damage).toBeGreaterThan(0);
      expect(result.message).toContain("あられ");
    });

    it("あられ: 氷タイプはダメージなし", () => {
      const monster = createMonster(100);
      const result = applyWeatherDamage("hail", monster, iceSpecies);
      expect(result.damage).toBe(0);
    });

    it("通常天候: ダメージなし", () => {
      const monster = createMonster(100);
      const result = applyWeatherDamage("clear", monster, fireSpecies);
      expect(result.damage).toBe(0);
    });
  });

  describe("tickWeather", () => {
    it("ターン経過で天候が終了する", () => {
      const state = createWeatherState();
      setWeather(state, "sunny");
      // 5ターン分tickする
      for (let i = 0; i < 4; i++) {
        tickWeather(state);
        expect(state.current).toBe("sunny");
      }
      const msgs = tickWeather(state);
      expect(state.current).toBe("clear");
      expect(msgs.length).toBeGreaterThan(0);
    });

    it("通常天候ではtickしてもメッセージなし", () => {
      const state = createWeatherState();
      const msgs = tickWeather(state);
      expect(msgs).toEqual([]);
    });
  });

  describe("getWeatherName", () => {
    it("各天候の日本語名を返す", () => {
      expect(getWeatherName("sunny")).toBe("ひざしがつよい");
      expect(getWeatherName("rainy")).toBe("あめ");
      expect(getWeatherName("sandstorm")).toBe("すなあらし");
      expect(getWeatherName("hail")).toBe("あられ");
      expect(getWeatherName("clear")).toBe("通常");
    });
  });
});
