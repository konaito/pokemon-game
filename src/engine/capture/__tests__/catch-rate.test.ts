import { describe, it, expect } from "vitest";
import {
  calcCatchValue,
  calcShakeThreshold,
  attemptCatch,
  resolveBallModifier,
} from "../catch-rate";

describe("捕獲率計算", () => {
  describe("calcCatchValue", () => {
    it("HP満タンでは低い値になる", () => {
      const a = calcCatchValue({
        maxHp: 100,
        currentHp: 100,
        baseCatchRate: 45,
        ballModifier: 1,
        status: null,
      });
      // ((300-200)*45*1*1) / 300 = 4500/300 = 15
      expect(a).toBe(15);
    });

    it("HP1で最大に近い値になる", () => {
      const a = calcCatchValue({
        maxHp: 100,
        currentHp: 1,
        baseCatchRate: 45,
        ballModifier: 1,
        status: null,
      });
      // ((300-2)*45*1*1) / 300 = 13410/300 = 44.7 → 44
      expect(a).toBe(44);
    });

    it("状態異常（sleep）で2倍補正", () => {
      const aSleep = calcCatchValue({
        maxHp: 100,
        currentHp: 50,
        baseCatchRate: 100,
        ballModifier: 1,
        status: "sleep",
      });
      // ((300-100)*100*1*2)/300 = 40000/300 = 133.33 → 133
      expect(aSleep).toBe(133);
    });

    it("状態異常（poison）で1.5倍補正", () => {
      const aPoison = calcCatchValue({
        maxHp: 100,
        currentHp: 50,
        baseCatchRate: 100,
        ballModifier: 1,
        status: "poison",
      });
      // ((300-100)*100*1*1.5)/300 = 30000/300 = 100
      expect(aPoison).toBe(100);
    });

    it("ハイパーボール（2倍）で補正される", () => {
      const a = calcCatchValue({
        maxHp: 100,
        currentHp: 50,
        baseCatchRate: 100,
        ballModifier: 2,
        status: null,
      });
      // ((300-100)*100*2*1)/300 = 40000/300 = 133
      expect(a).toBe(133);
    });

    it("値は1以上255以下に収まる", () => {
      const aMin = calcCatchValue({
        maxHp: 1000,
        currentHp: 1000,
        baseCatchRate: 1,
        ballModifier: 1,
        status: null,
      });
      expect(aMin).toBeGreaterThanOrEqual(1);

      const aMax = calcCatchValue({
        maxHp: 10,
        currentHp: 1,
        baseCatchRate: 255,
        ballModifier: 2,
        status: "sleep",
      });
      expect(aMax).toBeLessThanOrEqual(255);
    });
  });

  describe("calcShakeThreshold", () => {
    it("a=255で確定捕獲（閾値65536）", () => {
      expect(calcShakeThreshold(255)).toBe(65536);
    });

    it("a=1で最小の閾値", () => {
      const threshold = calcShakeThreshold(1);
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThan(65536);
    });

    it("aが大きいほど閾値が高くなる", () => {
      const low = calcShakeThreshold(10);
      const high = calcShakeThreshold(100);
      expect(high).toBeGreaterThan(low);
    });
  });

  describe("attemptCatch", () => {
    it("マスターボール（ballModifier>=255）で確定捕獲", () => {
      const result = attemptCatch({
        maxHp: 100,
        currentHp: 100,
        baseCatchRate: 3,
        ballModifier: 255,
        status: null,
      });
      expect(result.caught).toBe(true);
      expect(result.shakeCount).toBe(3);
    });

    it("乱数が全て0なら3回揺れて捕獲成功", () => {
      const result = attemptCatch(
        {
          maxHp: 100,
          currentHp: 50,
          baseCatchRate: 100,
          ballModifier: 1,
          status: null,
        },
        () => 0, // 常に最小値
      );
      expect(result.caught).toBe(true);
      expect(result.shakeCount).toBe(3);
    });

    it("乱数が全て最大なら0回揺れて失敗", () => {
      const result = attemptCatch(
        {
          maxHp: 100,
          currentHp: 100,
          baseCatchRate: 3,
          ballModifier: 1,
          status: null,
        },
        () => 65535, // 常に最大値
      );
      expect(result.caught).toBe(false);
      expect(result.shakeCount).toBe(0);
    });

    it("途中で失敗すると部分的な揺れ回数を返す", () => {
      let callCount = 0;
      const result = attemptCatch(
        {
          maxHp: 100,
          currentHp: 50,
          baseCatchRate: 100,
          ballModifier: 1,
          status: null,
        },
        () => {
          callCount++;
          return callCount <= 2 ? 0 : 65535; // 2回成功、3回目失敗
        },
      );
      expect(result.caught).toBe(false);
      expect(result.shakeCount).toBe(2);
    });
  });

  describe("resolveBallModifier - 条件付きボール", () => {
    it("ballIdがundefinedならbaseModifierを返す", () => {
      const result = resolveBallModifier(2, undefined, {
        targetTypes: ["fire"],
        turnCount: 1,
        isRegistered: false,
      });
      expect(result).toBe(2);
    });

    it("未知のballIdならbaseModifierを返す", () => {
      const result = resolveBallModifier(1.5, "unknown-ball", {
        targetTypes: ["fire"],
        turnCount: 1,
        isRegistered: false,
      });
      expect(result).toBe(1.5);
    });

    describe("ネットボール", () => {
      it("水タイプに3.0倍", () => {
        const result = resolveBallModifier(1, "net-ball", {
          targetTypes: ["water"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(3);
      });

      it("虫タイプに3.0倍", () => {
        const result = resolveBallModifier(1, "net-ball", {
          targetTypes: ["bug"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(3);
      });

      it("水/虫の複合タイプにも3.0倍", () => {
        const result = resolveBallModifier(1, "net-ball", {
          targetTypes: ["water", "bug"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(3);
      });

      it("対象外タイプには1.0倍", () => {
        const result = resolveBallModifier(1, "net-ball", {
          targetTypes: ["fire", "dragon"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(1);
      });
    });

    describe("ダークボール", () => {
      it("常に3.0倍（洞窟想定）", () => {
        const result = resolveBallModifier(1, "dark-ball", {
          targetTypes: ["normal"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(3);
      });
    });

    describe("タイマーボール", () => {
      it("1ターン目は1.3倍", () => {
        const result = resolveBallModifier(1, "timer-ball", {
          targetTypes: ["normal"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(1.3);
      });

      it("5ターン目は2.5倍", () => {
        const result = resolveBallModifier(1, "timer-ball", {
          targetTypes: ["normal"],
          turnCount: 5,
          isRegistered: false,
        });
        expect(result).toBe(2.5);
      });

      it("10ターン目は4.0倍（上限）", () => {
        const result = resolveBallModifier(1, "timer-ball", {
          targetTypes: ["normal"],
          turnCount: 10,
          isRegistered: false,
        });
        expect(result).toBe(4);
      });

      it("20ターン目でも4.0倍が上限", () => {
        const result = resolveBallModifier(1, "timer-ball", {
          targetTypes: ["normal"],
          turnCount: 20,
          isRegistered: false,
        });
        expect(result).toBe(4);
      });
    });

    describe("クイックボール", () => {
      it("1ターン目は4.0倍", () => {
        const result = resolveBallModifier(1, "quick-ball", {
          targetTypes: ["normal"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(4);
      });

      it("2ターン目以降は1.0倍", () => {
        const result = resolveBallModifier(1, "quick-ball", {
          targetTypes: ["normal"],
          turnCount: 2,
          isRegistered: false,
        });
        expect(result).toBe(1);
      });
    });

    describe("リピートボール", () => {
      it("図鑑登録済みなら3.0倍", () => {
        const result = resolveBallModifier(1, "repeat-ball", {
          targetTypes: ["normal"],
          turnCount: 1,
          isRegistered: true,
        });
        expect(result).toBe(3);
      });

      it("未登録なら1.0倍", () => {
        const result = resolveBallModifier(1, "repeat-ball", {
          targetTypes: ["normal"],
          turnCount: 1,
          isRegistered: false,
        });
        expect(result).toBe(1);
      });
    });
  });
});
