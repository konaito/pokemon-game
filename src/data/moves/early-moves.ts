/**
 * 序盤の技データ定義
 * ルート1〜3、ジム1〜3で使用される技
 */
import type { MoveDefinition } from "@/types";

/** 序盤の技マスターデータ */
export const EARLY_MOVES = {
  // === ノーマル技 ===
  tackle: {
    id: "tackle",
    name: "たいあたり",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  scratch: {
    id: "scratch",
    name: "ひっかく",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  "quick-attack": {
    id: "quick-attack",
    name: "でんこうせっか",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 30,
    priority: 1,
  },
  bite: {
    id: "bite",
    name: "かみつく",
    type: "dark",
    category: "physical",
    power: 60,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  headbutt: {
    id: "headbutt",
    name: "ずつき",
    type: "normal",
    category: "physical",
    power: 70,
    accuracy: 100,
    pp: 15,
    priority: 0,
  },

  // === ステータス技 ===
  growl: {
    id: "growl",
    name: "なきごえ",
    type: "normal",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 40,
    priority: 0,
    effect: {
      statChanges: { atk: -1 },
    },
  },
  "tail-whip": {
    id: "tail-whip",
    name: "しっぽをふる",
    type: "normal",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 30,
    priority: 0,
    effect: {
      statChanges: { def: -1 },
    },
  },
  leer: {
    id: "leer",
    name: "にらみつける",
    type: "normal",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 30,
    priority: 0,
    effect: {
      statChanges: { def: -1 },
    },
  },
  "string-shot": {
    id: "string-shot",
    name: "いとをはく",
    type: "bug",
    category: "status",
    power: null,
    accuracy: 95,
    pp: 40,
    priority: 0,
    effect: {
      statChanges: { speed: -2 },
    },
  },
  harden: {
    id: "harden",
    name: "かたくなる",
    type: "normal",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 30,
    priority: 0,
    effect: {
      statChanges: { def: 1 },
    },
  },

  // === 炎タイプ ===
  ember: {
    id: "ember",
    name: "ひのこ",
    type: "fire",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
    effect: {
      statusCondition: "burn",
      statusChance: 10,
    },
  },
  "flame-wheel": {
    id: "flame-wheel",
    name: "かえんぐるま",
    type: "fire",
    category: "physical",
    power: 60,
    accuracy: 100,
    pp: 25,
    priority: 0,
    effect: {
      statusCondition: "burn",
      statusChance: 10,
    },
  },

  // === 水タイプ ===
  "water-gun": {
    id: "water-gun",
    name: "みずでっぽう",
    type: "water",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  "water-pulse": {
    id: "water-pulse",
    name: "みずのはどう",
    type: "water",
    category: "special",
    power: 60,
    accuracy: 100,
    pp: 20,
    priority: 0,
  },
  bubble: {
    id: "bubble",
    name: "あわ",
    type: "water",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 30,
    priority: 0,
    effect: {
      statChanges: { speed: -1 },
    },
  },

  // === 草タイプ ===
  "vine-whip": {
    id: "vine-whip",
    name: "つるのムチ",
    type: "grass",
    category: "physical",
    power: 45,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  "razor-leaf": {
    id: "razor-leaf",
    name: "はっぱカッター",
    type: "grass",
    category: "physical",
    power: 55,
    accuracy: 95,
    pp: 25,
    priority: 0,
  },
  "leech-seed": {
    id: "leech-seed",
    name: "やどりぎのタネ",
    type: "grass",
    category: "status",
    power: null,
    accuracy: 90,
    pp: 10,
    priority: 0,
  },

  // === 虫タイプ ===
  "bug-bite": {
    id: "bug-bite",
    name: "むしくい",
    type: "bug",
    category: "physical",
    power: 60,
    accuracy: 100,
    pp: 20,
    priority: 0,
  },

  // === 飛行タイプ ===
  gust: {
    id: "gust",
    name: "かぜおこし",
    type: "flying",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  peck: {
    id: "peck",
    name: "つつく",
    type: "flying",
    category: "physical",
    power: 35,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  "wing-attack": {
    id: "wing-attack",
    name: "つばさでうつ",
    type: "flying",
    category: "physical",
    power: 60,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },

  // === 電気タイプ ===
  "thunder-shock": {
    id: "thunder-shock",
    name: "でんきショック",
    type: "electric",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 30,
    priority: 0,
    effect: {
      statusCondition: "paralysis",
      statusChance: 10,
    },
  },

  // === 毒タイプ ===
  "poison-sting": {
    id: "poison-sting",
    name: "どくばり",
    type: "poison",
    category: "physical",
    power: 15,
    accuracy: 100,
    pp: 35,
    priority: 0,
    effect: {
      statusCondition: "poison",
      statusChance: 30,
    },
  },

  // === 岩タイプ ===
  "rock-throw": {
    id: "rock-throw",
    name: "いわおとし",
    type: "rock",
    category: "physical",
    power: 50,
    accuracy: 90,
    pp: 15,
    priority: 0,
  },

  // === 格闘タイプ ===
  "double-kick": {
    id: "double-kick",
    name: "にどげり",
    type: "fighting",
    category: "physical",
    power: 30,
    accuracy: 100,
    pp: 30,
    priority: 0,
  },

  // === 地面タイプ ===
  "mud-slap": {
    id: "mud-slap",
    name: "どろかけ",
    type: "ground",
    category: "special",
    power: 20,
    accuracy: 100,
    pp: 10,
    priority: 0,
  },
} as const satisfies Record<string, MoveDefinition>;
