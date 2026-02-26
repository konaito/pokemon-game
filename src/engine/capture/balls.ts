import type { ItemDefinition } from "@/types";

/**
 * ボールアイテムの定義 (#63)
 * 各ボールの捕獲率補正を含む
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
} as const satisfies Record<string, ItemDefinition>;

export type BallId = keyof typeof BALL_DEFINITIONS;
