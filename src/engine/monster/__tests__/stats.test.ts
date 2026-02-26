import { describe, it, expect } from "vitest";
import { calcHp, calcStat, calcAllStats } from "../stats";

describe("calcHp", () => {
  it("Lv50, 種族値80, IV31, EV252 の場合", () => {
    // ((2*80+31+252/4)*50/100)+50+10 = ((160+31+63)*50/100)+60
    // = (254*50/100)+60 = 127+60 = 187
    expect(calcHp(80, 31, 252, 50)).toBe(187);
  });

  it("Lv1, 最低値", () => {
    // ((2*1+0+0)*1/100)+1+10 = 0+11 = 11
    expect(calcHp(1, 0, 0, 1)).toBe(11);
  });

  it("Lv100, 種族値255, IV31, EV252", () => {
    // ((2*255+31+63)*100/100)+100+10 = (604)+110 = 714
    expect(calcHp(255, 31, 252, 100)).toBe(714);
  });
});

describe("calcStat", () => {
  it("Lv50, 種族値80, IV31, EV252, 性格補正なし", () => {
    // (((2*80+31+63)*50/100)+5)*1.0 = (127+5)*1 = 132
    expect(calcStat(80, 31, 252, 50)).toBe(132);
  });

  it("性格補正あり（1.1倍）", () => {
    // (127+5)*1.1 = 145.2 → 145
    expect(calcStat(80, 31, 252, 50, 1.1)).toBe(145);
  });

  it("性格補正あり（0.9倍）", () => {
    // (127+5)*0.9 = 118.8 → 118
    expect(calcStat(80, 31, 252, 50, 0.9)).toBe(118);
  });
});

describe("calcAllStats", () => {
  it("全ステータスを正しく計算する", () => {
    const baseStats = { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, speed: 45 };
    const ivs = { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 };
    const evs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 };

    const stats = calcAllStats(baseStats, ivs, evs, 50);

    expect(stats.hp).toBeGreaterThan(0);
    expect(stats.atk).toBeGreaterThan(0);
    expect(stats.def).toBeGreaterThan(0);
    expect(stats.spAtk).toBeGreaterThan(0);
    expect(stats.spDef).toBeGreaterThan(0);
    expect(stats.speed).toBeGreaterThan(0);
  });
});
