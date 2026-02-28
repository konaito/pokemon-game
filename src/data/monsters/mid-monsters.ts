/**
 * 中盤モンスターデータ（ルート4〜6、カガリ市〜キリフリ村）
 * ジム4（炎）〜ジム6（ゴースト）エリアで出会えるモンスター
 */
import type { MonsterSpecies } from "@/types";

export const MID_MONSTERS: MonsterSpecies[] = [
  // === 炎枠: ヒダネ → カエンジシ ===
  // ルート4（平野）の草むら。カガリ市（炎ジム）周辺の炎タイプ
  {
    id: "hidane",
    name: "ヒダネ",
    types: ["fire"],
    baseStats: { hp: 50, atk: 65, def: 40, spAtk: 45, spDef: 40, speed: 60 },
    baseExpYield: 70,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "ember" },
      { level: 8, moveId: "bite" },
      { level: 14, moveId: "flame-wheel" },
      { level: 20, moveId: "fire-fang" },
    ],
    abilities: ["flash_fire"],
    evolvesTo: [{ id: "kaenjishi", level: 30 }],
  },
  {
    id: "kaenjishi",
    name: "カエンジシ",
    types: ["fire", "normal"],
    baseStats: { hp: 76, atk: 98, def: 65, spAtk: 68, spDef: 65, speed: 93 },
    baseExpYield: 180,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "ember" },
      { level: 1, moveId: "bite" },
      { level: 14, moveId: "flame-wheel" },
      { level: 20, moveId: "fire-fang" },
      { level: 30, moveId: "slash" },
      { level: 37, moveId: "flamethrower" },
    ],
    abilities: ["flash_fire", "intimidate"],
  },

  // === 格闘枠: ツチコブシ → イワケンジン ===
  // ルート4の岩場。格闘+岩の力強いモンスター
  {
    id: "tsuchikobushi",
    name: "ツチコブシ",
    types: ["fighting"],
    baseStats: { hp: 55, atk: 70, def: 55, spAtk: 30, spDef: 40, speed: 45 },
    baseExpYield: 75,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 5, moveId: "leer" },
      { level: 10, moveId: "rock-throw" },
      { level: 16, moveId: "double-kick" },
      { level: 22, moveId: "brick-break" },
    ],
    abilities: ["guts", "iron_fist"],
    evolvesTo: [{ id: "iwakenjin", level: 32 }],
  },
  {
    id: "iwakenjin",
    name: "イワケンジン",
    types: ["fighting", "rock"],
    baseStats: { hp: 80, atk: 105, def: 85, spAtk: 40, spDef: 55, speed: 55 },
    baseExpYield: 190,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "leer" },
      { level: 1, moveId: "rock-throw" },
      { level: 16, moveId: "double-kick" },
      { level: 22, moveId: "brick-break" },
      { level: 32, moveId: "rock-slide" },
      { level: 40, moveId: "close-combat" },
    ],
    abilities: ["guts", "sturdy"],
  },

  // === 地面枠: モグラッコ → ドゴウ ===
  // ルート5（渓谷）のダンジョン。ジム5（地面）の地元モンスター
  {
    id: "mogurakko",
    name: "モグラッコ",
    types: ["ground"],
    baseStats: { hp: 50, atk: 55, def: 50, spAtk: 35, spDef: 40, speed: 60 },
    baseExpYield: 68,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "scratch" },
      { level: 1, moveId: "mud-slap" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dig" },
      { level: 22, moveId: "slash" },
    ],
    abilities: ["sand_veil"],
    evolvesTo: [{ id: "dogou", level: 28 }],
  },
  {
    id: "dogou",
    name: "ドゴウ",
    types: ["ground", "steel"],
    baseStats: { hp: 75, atk: 90, def: 85, spAtk: 45, spDef: 60, speed: 75 },
    baseExpYield: 178,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "scratch" },
      { level: 1, moveId: "mud-slap" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dig" },
      { level: 22, moveId: "slash" },
      { level: 28, moveId: "iron-head" },
      { level: 35, moveId: "earthquake" },
    ],
    abilities: ["sand_veil", "sturdy"],
  },

  // === ゴースト枠: ユラビ → カゲボウシ → ヨミカグラ ===
  // ルート6（霧の森）。ジム6（ゴースト）の象徴的3段階進化
  {
    id: "yurabi",
    name: "ユラビ",
    types: ["ghost"],
    baseStats: { hp: 35, atk: 25, def: 30, spAtk: 60, spDef: 45, speed: 55 },
    baseExpYield: 55,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 4, moveId: "shadow-sneak" },
      { level: 10, moveId: "shadow-claw" },
      { level: 16, moveId: "psybeam" },
    ],
    abilities: ["levitate"],
    evolvesTo: [{ id: "kageboushi", level: 25 }],
  },
  {
    id: "kageboushi",
    name: "カゲボウシ",
    types: ["ghost", "psychic"],
    baseStats: { hp: 50, atk: 40, def: 45, spAtk: 85, spDef: 65, speed: 70 },
    baseExpYield: 140,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "shadow-sneak" },
      { level: 10, moveId: "shadow-claw" },
      { level: 16, moveId: "psybeam" },
      { level: 25, moveId: "shadow-ball" },
    ],
    abilities: ["levitate"],
    evolvesTo: [{ id: "yomikagura", level: 40 }],
  },
  {
    id: "yomikagura",
    name: "ヨミカグラ",
    types: ["ghost", "psychic"],
    baseStats: { hp: 65, atk: 55, def: 60, spAtk: 115, spDef: 90, speed: 90 },
    baseExpYield: 230,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "shadow-sneak" },
      { level: 1, moveId: "shadow-claw" },
      { level: 1, moveId: "psybeam" },
      { level: 25, moveId: "shadow-ball" },
      { level: 40, moveId: "psychic" },
    ],
    abilities: ["levitate", "pressure"],
  },

  // === フェアリー枠: ハナウサギ → ツキウサギ ===
  // ルート5〜6で稀少出現。月と花のフェアリータイプ
  {
    id: "hanausagi",
    name: "ハナウサギ",
    types: ["fairy"],
    baseStats: { hp: 50, atk: 35, def: 40, spAtk: 60, spDef: 55, speed: 55 },
    baseExpYield: 72,
    expGroup: "fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "fairy-wind" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dazzling-gleam" },
    ],
    abilities: ["natural_cure"],
    evolvesTo: [{ id: "tsukiusagi", level: 30 }],
  },
  {
    id: "tsukiusagi",
    name: "ツキウサギ",
    types: ["fairy", "psychic"],
    baseStats: { hp: 70, atk: 50, def: 60, spAtk: 95, spDef: 85, speed: 80 },
    baseExpYield: 185,
    expGroup: "fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "fairy-wind" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dazzling-gleam" },
      { level: 30, moveId: "psychic" },
      { level: 38, moveId: "moonblast" },
    ],
    abilities: ["natural_cure", "inner_focus"],
  },

  // === 鋼枠: カナモリ（単体・進化なし）===
  // ルート5の洞窟。頑丈な鋼タイプ
  {
    id: "kanamori",
    name: "カナモリ",
    types: ["steel"],
    baseStats: { hp: 65, atk: 70, def: 100, spAtk: 40, spDef: 70, speed: 30 },
    baseExpYield: 140,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "metal-claw" },
      { level: 10, moveId: "harden" },
      { level: 18, moveId: "iron-head" },
      { level: 26, moveId: "rock-slide" },
      { level: 34, moveId: "iron-tail" },
    ],
    abilities: ["sturdy", "clear_body"],
  },

  // === 毒/草枠: クサカビ → ドクバナ ===
  // ルート6の森。毒と草の複合、森の瘴気をまとったモンスター
  {
    id: "kusakabi",
    name: "クサカビ",
    types: ["poison", "grass"],
    baseStats: { hp: 45, atk: 35, def: 40, spAtk: 55, spDef: 50, speed: 40 },
    baseExpYield: 60,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "poison-sting" },
      { level: 8, moveId: "vine-whip" },
      { level: 14, moveId: "leech-seed" },
      { level: 20, moveId: "cross-poison" },
    ],
    abilities: ["poison_point", "natural_cure"],
    evolvesTo: [{ id: "dokubana", level: 32 }],
  },
  {
    id: "dokubana",
    name: "ドクバナ",
    types: ["poison", "grass"],
    baseStats: { hp: 70, atk: 55, def: 65, spAtk: 90, spDef: 80, speed: 60 },
    baseExpYield: 175,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "poison-sting" },
      { level: 1, moveId: "vine-whip" },
      { level: 14, moveId: "leech-seed" },
      { level: 20, moveId: "cross-poison" },
      { level: 32, moveId: "sludge-bomb" },
      { level: 40, moveId: "energy-ball" },
    ],
    abilities: ["poison_point", "natural_cure"],
  },

  // === 悪枠: ヤミガラス（単体・進化なし）===
  // ルート5〜6の夜間出現。情報収集に使われるカラス
  {
    id: "yamigarasu",
    name: "ヤミガラス",
    types: ["dark", "flying"],
    baseStats: { hp: 55, atk: 75, def: 50, spAtk: 60, spDef: 50, speed: 80 },
    baseExpYield: 130,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "peck" },
      { level: 1, moveId: "bite" },
      { level: 10, moveId: "wing-attack" },
      { level: 18, moveId: "sucker-punch" },
      { level: 26, moveId: "aerial-ace" },
      { level: 34, moveId: "crunch" },
      { level: 42, moveId: "dark-pulse" },
    ],
    abilities: ["keen_eye", "inner_focus"],
  },
];
