import type { ItemDefinition, TypeId } from "@/types";

/**
 * ボールアイテムの定義 (#63, #194)
 * 各ボールの捕獲率補正を含む
 * 条件付きボールはcatchRateModifier=1をベースとし、
 * resolveBallModifier()で動的に補正を計算する
 */
export const BALL_DEFINITIONS = {
  "monster-ball": {
    id: "monster-ball",
    name: "モンスターボール",
    description: "野生のモンスターを捕まえるためのボール。",
    category: "ball",
    price: 200,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
  "super-ball": {
    id: "super-ball",
    name: "スーパーボール",
    description: "モンスターボールよりも捕まえやすいボール。",
    category: "ball",
    price: 600,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1.5 },
  },
  "hyper-ball": {
    id: "hyper-ball",
    name: "ハイパーボール",
    description: "スーパーボールよりもさらに捕まえやすいボール。",
    category: "ball",
    price: 1200,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 2 },
  },
  "master-ball": {
    id: "master-ball",
    name: "マスターボール",
    description: "どんなモンスターでも必ず捕まえられる最高のボール。",
    category: "ball",
    price: 0,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 255 },
  },
  "net-ball": {
    id: "net-ball",
    name: "ネットボール",
    description: "水タイプや虫タイプのモンスターが捕まえやすいボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
  "dark-ball": {
    id: "dark-ball",
    name: "ダークボール",
    description: "夜や洞窟で使うと捕まえやすくなるボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
  "timer-ball": {
    id: "timer-ball",
    name: "タイマーボール",
    description: "ターン数が経つほど捕まえやすくなるボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
  "quick-ball": {
    id: "quick-ball",
    name: "クイックボール",
    description: "バトル開始直後に使うと捕まえやすいボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
  "repeat-ball": {
    id: "repeat-ball",
    name: "リピートボール",
    description: "一度捕まえたことのあるモンスターが捕まえやすいボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
  "premier-ball": {
    id: "premier-ball",
    name: "プレミアボール",
    description: "少し珍しい特別なボール。性能はモンスターボールと同じ。",
    category: "ball",
    price: 0,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
} as const satisfies Record<string, ItemDefinition>;

export type BallId = keyof typeof BALL_DEFINITIONS;

/** ボールの条件付き捕獲率計算に必要なコンテキスト */
export interface BallCatchContext {
  /** 対象モンスターのタイプ */
  targetTypes: TypeId[];
  /** 現在のバトルターン数 */
  turnCount: number;
  /** 夜かどうか */
  isNight: boolean;
  /** 洞窟内かどうか */
  isCave: boolean;
  /** 図鑑に捕獲済みか */
  isRegistered: boolean;
}

/**
 * ボールIDとコンテキストから実効捕獲率倍率を解決する
 * 条件付きボールはコンテキストに応じて倍率が変動する
 */
export function resolveBallModifier(ballId: string, context?: BallCatchContext): number {
  const ball = BALL_DEFINITIONS[ballId as BallId];
  if (!ball) return 1;

  const baseModifier = ball.effect.catchRateModifier;

  // 条件付きボール以外はそのまま返す
  if (!context) return baseModifier;

  switch (ballId) {
    case "net-ball": {
      const hasWaterOrBug = context.targetTypes.some((t) => t === "water" || t === "bug");
      return hasWaterOrBug ? 3.0 : 1.0;
    }
    case "dark-ball":
      return context.isNight || context.isCave ? 3.0 : 1.0;
    case "timer-ball": {
      const modifier = Math.min(4.0, 1 + context.turnCount * 0.3);
      return modifier;
    }
    case "quick-ball":
      return context.turnCount <= 1 ? 4.0 : 1.0;
    case "repeat-ball":
      return context.isRegistered ? 3.0 : 1.0;
    default:
      return baseModifier;
  }
}

/** ボール購入時のバッジ解禁テーブル */
export const BALL_UNLOCK_BADGES: Record<string, number> = {
  "monster-ball": 0,
  "super-ball": 1,
  "hyper-ball": 3,
  "net-ball": 3,
  "dark-ball": 4,
  "timer-ball": 5,
  "repeat-ball": 5,
  "quick-ball": 6,
};

/**
 * バッジ数に応じて購入可能なボール一覧を返す
 */
export function getAvailableBalls(badgeCount: number): BallId[] {
  return (Object.entries(BALL_UNLOCK_BADGES) as [BallId, number][])
    .filter(([, required]) => badgeCount >= required)
    .map(([id]) => id);
}

/**
 * プレミアボールのおまけ判定
 * ボール10個購入ごとに1個プレミアボールを付与
 */
export function calcPremierBallBonus(purchasedBallCount: number): number {
  return Math.floor(purchasedBallCount / 10);
}
