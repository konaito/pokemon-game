import { describe, it, expect } from "vitest";
import {
  BALL_DEFINITIONS,
  resolveBallModifier,
  getAvailableBalls,
  calcPremierBallBonus,
  type BallId,
  type BallCatchContext,
} from "../balls";

function defaultContext(overrides: Partial<BallCatchContext> = {}): BallCatchContext {
  return {
    targetTypes: ["normal"],
    turnCount: 1,
    isNight: false,
    isCave: false,
    isRegistered: false,
    ...overrides,
  };
}

describe("ボール定義", () => {
  it("10種類のボールが定義されている", () => {
    expect(Object.keys(BALL_DEFINITIONS)).toHaveLength(10);
  });

  it("全ボールにid/name/description/category/effectがある", () => {
    for (const [id, ball] of Object.entries(BALL_DEFINITIONS)) {
      expect(ball.id, `${id}のidが空`).toBe(id);
      expect(ball.name.length, `${id}のnameが空`).toBeGreaterThan(0);
      expect(ball.description.length, `${id}のdescriptionが空`).toBeGreaterThan(0);
      expect(ball.category).toBe("ball");
      expect(ball.effect.type).toBe("ball");
    }
  });

  it("基本4種のボールの倍率が正しい", () => {
    expect(BALL_DEFINITIONS["monster-ball"].effect.catchRateModifier).toBe(1);
    expect(BALL_DEFINITIONS["super-ball"].effect.catchRateModifier).toBe(1.5);
    expect(BALL_DEFINITIONS["hyper-ball"].effect.catchRateModifier).toBe(2);
    expect(BALL_DEFINITIONS["master-ball"].effect.catchRateModifier).toBe(255);
  });

  it("条件付きボールのベース倍率は1", () => {
    const conditionalBalls: BallId[] = [
      "net-ball",
      "dark-ball",
      "timer-ball",
      "quick-ball",
      "repeat-ball",
      "premier-ball",
    ];
    for (const id of conditionalBalls) {
      expect(BALL_DEFINITIONS[id].effect.catchRateModifier).toBe(1);
    }
  });
});

describe("resolveBallModifier", () => {
  describe("基本ボール（コンテキスト不要）", () => {
    it("モンスターボールは1.0", () => {
      expect(resolveBallModifier("monster-ball")).toBe(1);
    });

    it("スーパーボールは1.5", () => {
      expect(resolveBallModifier("super-ball")).toBe(1.5);
    });

    it("ハイパーボールは2.0", () => {
      expect(resolveBallModifier("hyper-ball")).toBe(2);
    });

    it("マスターボールは255", () => {
      expect(resolveBallModifier("master-ball")).toBe(255);
    });

    it("存在しないボールは1.0", () => {
      expect(resolveBallModifier("unknown-ball")).toBe(1);
    });
  });

  describe("ネットボール", () => {
    it("水タイプに対して3.0倍", () => {
      expect(resolveBallModifier("net-ball", defaultContext({ targetTypes: ["water"] }))).toBe(3.0);
    });

    it("虫タイプに対して3.0倍", () => {
      expect(resolveBallModifier("net-ball", defaultContext({ targetTypes: ["bug"] }))).toBe(3.0);
    });

    it("水/虫の複合タイプにも3.0倍", () => {
      expect(
        resolveBallModifier("net-ball", defaultContext({ targetTypes: ["water", "bug"] })),
      ).toBe(3.0);
    });

    it("それ以外のタイプには1.0倍", () => {
      expect(resolveBallModifier("net-ball", defaultContext({ targetTypes: ["fire"] }))).toBe(1.0);
    });
  });

  describe("ダークボール", () => {
    it("夜に3.0倍", () => {
      expect(resolveBallModifier("dark-ball", defaultContext({ isNight: true }))).toBe(3.0);
    });

    it("洞窟内で3.0倍", () => {
      expect(resolveBallModifier("dark-ball", defaultContext({ isCave: true }))).toBe(3.0);
    });

    it("昼の屋外で1.0倍", () => {
      expect(
        resolveBallModifier("dark-ball", defaultContext({ isNight: false, isCave: false })),
      ).toBe(1.0);
    });
  });

  describe("タイマーボール", () => {
    it("1ターン目で1.3倍", () => {
      expect(resolveBallModifier("timer-ball", defaultContext({ turnCount: 1 }))).toBeCloseTo(1.3);
    });

    it("5ターン目で2.5倍", () => {
      expect(resolveBallModifier("timer-ball", defaultContext({ turnCount: 5 }))).toBeCloseTo(2.5);
    });

    it("10ターン目で4.0倍（上限）", () => {
      expect(resolveBallModifier("timer-ball", defaultContext({ turnCount: 10 }))).toBe(4.0);
    });

    it("20ターン目でも4.0倍（上限）", () => {
      expect(resolveBallModifier("timer-ball", defaultContext({ turnCount: 20 }))).toBe(4.0);
    });
  });

  describe("クイックボール", () => {
    it("1ターン目で4.0倍", () => {
      expect(resolveBallModifier("quick-ball", defaultContext({ turnCount: 1 }))).toBe(4.0);
    });

    it("2ターン目以降は1.0倍", () => {
      expect(resolveBallModifier("quick-ball", defaultContext({ turnCount: 2 }))).toBe(1.0);
    });

    it("10ターン目でも1.0倍", () => {
      expect(resolveBallModifier("quick-ball", defaultContext({ turnCount: 10 }))).toBe(1.0);
    });
  });

  describe("リピートボール", () => {
    it("図鑑登録済みのモンスターに3.0倍", () => {
      expect(resolveBallModifier("repeat-ball", defaultContext({ isRegistered: true }))).toBe(3.0);
    });

    it("未登録のモンスターに1.0倍", () => {
      expect(resolveBallModifier("repeat-ball", defaultContext({ isRegistered: false }))).toBe(1.0);
    });
  });

  describe("プレミアボール", () => {
    it("常に1.0倍（コレクション用）", () => {
      expect(resolveBallModifier("premier-ball", defaultContext())).toBe(1);
    });
  });
});

describe("getAvailableBalls", () => {
  it("バッジ0個ではモンスターボールのみ", () => {
    const balls = getAvailableBalls(0);
    expect(balls).toEqual(["monster-ball"]);
  });

  it("バッジ1個でスーパーボール解禁", () => {
    const balls = getAvailableBalls(1);
    expect(balls).toContain("monster-ball");
    expect(balls).toContain("super-ball");
    expect(balls).not.toContain("hyper-ball");
  });

  it("バッジ3個でハイパーボールとネットボール解禁", () => {
    const balls = getAvailableBalls(3);
    expect(balls).toContain("hyper-ball");
    expect(balls).toContain("net-ball");
  });

  it("バッジ4個でダークボール解禁", () => {
    const balls = getAvailableBalls(4);
    expect(balls).toContain("dark-ball");
  });

  it("バッジ5個でタイマーボールとリピートボール解禁", () => {
    const balls = getAvailableBalls(5);
    expect(balls).toContain("timer-ball");
    expect(balls).toContain("repeat-ball");
  });

  it("バッジ6個でクイックボール解禁", () => {
    const balls = getAvailableBalls(6);
    expect(balls).toContain("quick-ball");
  });

  it("バッジ8個で全ショップボール利用可能", () => {
    const balls = getAvailableBalls(8);
    expect(balls).toHaveLength(8); // master-ball/premier-ballはショップ外
  });
});

describe("calcPremierBallBonus", () => {
  it("10個未満の購入でボーナスなし", () => {
    expect(calcPremierBallBonus(0)).toBe(0);
    expect(calcPremierBallBonus(5)).toBe(0);
    expect(calcPremierBallBonus(9)).toBe(0);
  });

  it("10個購入で1個ボーナス", () => {
    expect(calcPremierBallBonus(10)).toBe(1);
  });

  it("20個購入で2個ボーナス", () => {
    expect(calcPremierBallBonus(20)).toBe(2);
  });

  it("25個購入で2個ボーナス（端数切り捨て）", () => {
    expect(calcPremierBallBonus(25)).toBe(2);
  });
});
