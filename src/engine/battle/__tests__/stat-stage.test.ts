import { describe, it, expect } from "vitest";
import { createStatStages, applyStatChanges, getStageMultiplier } from "../stat-stage";

describe("能力変化ステージ", () => {
  describe("createStatStages", () => {
    it("初期値は全て0", () => {
      const stages = createStatStages();
      expect(stages).toEqual({ atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 });
    });
  });

  describe("getStageMultiplier", () => {
    it("ステージ0で倍率1.0", () => {
      expect(getStageMultiplier(0)).toBe(1);
    });

    it("ステージ+1で倍率1.5", () => {
      expect(getStageMultiplier(1)).toBe(1.5);
    });

    it("ステージ-1で倍率2/3", () => {
      expect(getStageMultiplier(-1)).toBeCloseTo(2 / 3, 5);
    });

    it("ステージ+6で倍率4.0", () => {
      expect(getStageMultiplier(6)).toBe(4);
    });

    it("ステージ-6で倍率0.25", () => {
      expect(getStageMultiplier(-6)).toBe(0.25);
    });

    it("範囲外はクランプされる", () => {
      expect(getStageMultiplier(10)).toBe(getStageMultiplier(6));
      expect(getStageMultiplier(-10)).toBe(getStageMultiplier(-6));
    });
  });

  describe("applyStatChanges", () => {
    it("攻撃力を1段階上げる", () => {
      const stages = createStatStages();
      const [newStages, messages] = applyStatChanges(stages, { atk: 1 }, "ヒモリ");
      expect(newStages.atk).toBe(1);
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain("こうげき");
      expect(messages[0]).toContain("上がった");
    });

    it("防御力を1段階下げる", () => {
      const stages = createStatStages();
      const [newStages, messages] = applyStatChanges(stages, { def: -1 }, "コネズミ");
      expect(newStages.def).toBe(-1);
      expect(messages[0]).toContain("ぼうぎょ");
      expect(messages[0]).toContain("下がった");
    });

    it("2段階変化で「ぐぐっと」が付く", () => {
      const stages = createStatStages();
      const [newStages, messages] = applyStatChanges(stages, { atk: 2 }, "ヒモリ");
      expect(newStages.atk).toBe(2);
      expect(messages[0]).toContain("ぐぐっと");
    });

    it("3段階以上の変化で「ぐーんと」が付く", () => {
      const stages = createStatStages();
      const [, messages] = applyStatChanges(stages, { spAtk: 3 }, "テスト");
      expect(messages[0]).toContain("ぐーんと");
    });

    it("+6の上限でメッセージが出る", () => {
      const stages = { ...createStatStages(), atk: 6 };
      const [newStages, messages] = applyStatChanges(stages, { atk: 1 }, "テスト");
      expect(newStages.atk).toBe(6);
      expect(messages[0]).toContain("もう上がらない");
    });

    it("-6の下限でメッセージが出る", () => {
      const stages = { ...createStatStages(), def: -6 };
      const [newStages, messages] = applyStatChanges(stages, { def: -1 }, "テスト");
      expect(newStages.def).toBe(-6);
      expect(messages[0]).toContain("もう下がらない");
    });

    it("複数ステータスを同時に変化させられる", () => {
      const stages = createStatStages();
      const [newStages, messages] = applyStatChanges(stages, { atk: 1, speed: 1 }, "テスト");
      expect(newStages.atk).toBe(1);
      expect(newStages.speed).toBe(1);
      expect(messages).toHaveLength(2);
    });

    it("HPの変化は無視される", () => {
      const stages = createStatStages();
      const [newStages, messages] = applyStatChanges(stages, { hp: 1 } as never, "テスト");
      expect(newStages).toEqual(createStatStages());
      expect(messages).toHaveLength(0);
    });
  });
});
