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
  "net-ball": {
    id: "net-ball",
    name: "ネットボール",
    description: "みずタイプとむしタイプのモンスターが捕まえやすいボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1, ballId: "net-ball" },
  },
  "dark-ball": {
    id: "dark-ball",
    name: "ダークボール",
    description: "洞窟や暗い場所で捕まえやすいボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1, ballId: "dark-ball" },
  },
  "timer-ball": {
    id: "timer-ball",
    name: "タイマーボール",
    description: "ターン数が経つほど捕まえやすくなるボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1, ballId: "timer-ball" },
  },
  "quick-ball": {
    id: "quick-ball",
    name: "クイックボール",
    description: "バトル開始直後に使うと捕まえやすいボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1, ballId: "quick-ball" },
  },
  "repeat-ball": {
    id: "repeat-ball",
    name: "リピートボール",
    description: "一度捕まえたことのあるモンスターが捕まえやすいボール。",
    category: "ball",
    price: 1000,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1, ballId: "repeat-ball" },
  },
  "premier-ball": {
    id: "premier-ball",
    name: "プレミアボール",
    description: "なにかの記念に作られた少しめずらしいボール。",
    category: "ball",
    price: 0,
    usableInBattle: true,
    effect: { type: "ball", catchRateModifier: 1 },
  },
} as const satisfies Record<string, ItemDefinition>;

export type BallId = keyof typeof BALL_DEFINITIONS;
