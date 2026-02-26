import { describe, it, expect } from "vitest";
import { getTypeEffectiveness, getMultiTypeEffectiveness } from "../effectiveness";

describe("getTypeEffectiveness", () => {
  it("等倍の組み合わせは1を返す", () => {
    expect(getTypeEffectiveness("normal", "normal")).toBe(1);
    expect(getTypeEffectiveness("fire", "fighting")).toBe(1);
  });

  it("効果抜群は2を返す", () => {
    expect(getTypeEffectiveness("fire", "grass")).toBe(2);
    expect(getTypeEffectiveness("water", "fire")).toBe(2);
    expect(getTypeEffectiveness("grass", "water")).toBe(2);
  });

  it("いまひとつは0.5を返す", () => {
    expect(getTypeEffectiveness("fire", "water")).toBe(0.5);
    expect(getTypeEffectiveness("water", "grass")).toBe(0.5);
    expect(getTypeEffectiveness("grass", "fire")).toBe(0.5);
  });

  it("無効は0を返す", () => {
    expect(getTypeEffectiveness("normal", "ghost")).toBe(0);
    expect(getTypeEffectiveness("electric", "ground")).toBe(0);
    expect(getTypeEffectiveness("ground", "flying")).toBe(0);
    expect(getTypeEffectiveness("fighting", "ghost")).toBe(0);
    expect(getTypeEffectiveness("ghost", "normal")).toBe(0);
    expect(getTypeEffectiveness("psychic", "dark")).toBe(0);
    expect(getTypeEffectiveness("poison", "steel")).toBe(0);
    expect(getTypeEffectiveness("dragon", "fairy")).toBe(0);
  });

  it("三すくみ: 炎→草→水→炎", () => {
    expect(getTypeEffectiveness("fire", "grass")).toBe(2);
    expect(getTypeEffectiveness("grass", "water")).toBe(2);
    expect(getTypeEffectiveness("water", "fire")).toBe(2);
  });

  it("フェアリーはドラゴンに抜群", () => {
    expect(getTypeEffectiveness("fairy", "dragon")).toBe(2);
  });

  it("鋼はフェアリーに抜群", () => {
    expect(getTypeEffectiveness("steel", "fairy")).toBe(2);
  });
});

describe("getMultiTypeEffectiveness", () => {
  it("単タイプには通常の相性を返す", () => {
    expect(getMultiTypeEffectiveness("fire", ["grass"])).toBe(2);
  });

  it("複合タイプ: 草/毒に炎は2倍（草2×毒1）", () => {
    expect(getMultiTypeEffectiveness("fire", ["grass", "poison"])).toBe(2);
  });

  it("複合タイプ: 草/鋼に炎は4倍（草2×鋼2）", () => {
    expect(getMultiTypeEffectiveness("fire", ["grass", "steel"])).toBe(4);
  });

  it("複合タイプ: 水/飛行に電気は4倍（水2×飛行2）", () => {
    expect(getMultiTypeEffectiveness("electric", ["water", "flying"])).toBe(4);
  });

  it("複合タイプで無効が含まれると0", () => {
    // ノーマル vs ゴースト/何か → 0
    expect(getMultiTypeEffectiveness("normal", ["ghost", "dark"])).toBe(0);
  });

  it("複合タイプ: 炎/水に草は等倍（炎0.5×水2=1）", () => {
    expect(getMultiTypeEffectiveness("grass", ["fire", "water"])).toBe(1);
  });
});
