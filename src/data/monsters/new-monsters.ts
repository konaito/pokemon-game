/**
 * 追加モンスター20体
 *
 * 不足タイプ（毒、虫、ゴースト、鋼、悪、氷、地面）を補強し、
 * 分岐進化を含む新系統を追加。「忘却と記憶」テーマに沿った世界観。
 */
import type { MonsterSpecies } from "@/types";

export const NEW_MONSTERS: MonsterSpecies[] = [
  // ===================================================================
  // 毒キノコ系統（2段階）: ドクキノコ → キノドクシ
  // ===================================================================
  {
    id: "dokukinoko",
    name: "ドクキノコ",
    types: ["poison"],
    baseStats: { hp: 45, atk: 35, def: 50, spAtk: 55, spDef: 50, speed: 30 },
    baseExpYield: 65,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "poison-sting" },
      { level: 10, moveId: "leech-seed" },
      { level: 16, moveId: "sludge-bomb" },
      { level: 22, moveId: "razor-leaf" },
    ],
    evolvesTo: [{ id: "kinodokushi", level: 25 }],
  },
  {
    id: "kinodokushi",
    name: "キノドクシ",
    types: ["poison", "grass"],
    baseStats: { hp: 70, atk: 55, def: 75, spAtk: 85, spDef: 80, speed: 40 },
    baseExpYield: 165,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "poison-sting" },
      { level: 10, moveId: "leech-seed" },
      { level: 16, moveId: "sludge-bomb" },
      { level: 22, moveId: "razor-leaf" },
      { level: 25, moveId: "energy-ball" },
      { level: 33, moveId: "cross-poison" },
    ],
  },

  // ===================================================================
  // クモ系統（2段階）: クモイト → ジョロウグモ（虫/毒）
  // ===================================================================
  {
    id: "kumoito",
    name: "クモイト",
    types: ["bug", "poison"],
    baseStats: { hp: 40, atk: 50, def: 40, spAtk: 35, spDef: 35, speed: 55 },
    baseExpYield: 55,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "string-shot" },
      { level: 1, moveId: "poison-sting" },
      { level: 8, moveId: "bug-bite" },
      { level: 14, moveId: "cross-poison" },
      { level: 20, moveId: "x-scissor" },
    ],
    evolvesTo: [{ id: "jorougumo", level: 22 }],
  },
  {
    id: "jorougumo",
    name: "ジョロウグモ",
    types: ["bug", "poison"],
    baseStats: { hp: 65, atk: 80, def: 60, spAtk: 55, spDef: 60, speed: 80 },
    baseExpYield: 160,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "string-shot" },
      { level: 1, moveId: "poison-sting" },
      { level: 8, moveId: "bug-bite" },
      { level: 14, moveId: "cross-poison" },
      { level: 20, moveId: "x-scissor" },
      { level: 28, moveId: "sludge-bomb" },
      { level: 35, moveId: "signal-beam" },
    ],
  },

  // ===================================================================
  // ハナカブト（虫/飛行）単独
  // ===================================================================
  {
    id: "hanakabuto",
    name: "ハナカブト",
    types: ["bug", "flying"],
    baseStats: { hp: 65, atk: 80, def: 70, spAtk: 45, spDef: 55, speed: 75 },
    baseExpYield: 150,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "gust" },
      { level: 8, moveId: "bug-bite" },
      { level: 15, moveId: "wing-attack" },
      { level: 22, moveId: "x-scissor" },
      { level: 30, moveId: "aerial-ace" },
      { level: 38, moveId: "brave-bird" },
    ],
  },

  // ===================================================================
  // 幽霊火系統（3段階）: ヒトダマ → ユウレイビ → アマテラ（ゴースト/フェアリー）
  // ===================================================================
  {
    id: "hitodama",
    name: "ヒトダマ",
    types: ["ghost"],
    baseStats: { hp: 35, atk: 25, def: 30, spAtk: 55, spDef: 45, speed: 50 },
    baseExpYield: 55,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "shadow-sneak" },
      { level: 8, moveId: "ember" },
      { level: 14, moveId: "shadow-ball" },
      { level: 20, moveId: "fairy-wind" },
    ],
    evolvesTo: [{ id: "yuureibi", level: 30 }],
  },
  {
    id: "yuureibi",
    name: "ユウレイビ",
    types: ["ghost", "fairy"],
    baseStats: { hp: 55, atk: 35, def: 50, spAtk: 80, spDef: 70, speed: 65 },
    baseExpYield: 140,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "shadow-sneak" },
      { level: 1, moveId: "ember" },
      { level: 14, moveId: "shadow-ball" },
      { level: 20, moveId: "fairy-wind" },
      { level: 30, moveId: "dazzling-gleam" },
      { level: 36, moveId: "flamethrower" },
    ],
    evolvesTo: [{ id: "amatera", level: 42 }],
  },
  {
    id: "amatera",
    name: "アマテラ",
    types: ["ghost", "fairy"],
    baseStats: { hp: 75, atk: 45, def: 70, spAtk: 115, spDef: 95, speed: 80 },
    baseExpYield: 230,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "shadow-sneak" },
      { level: 1, moveId: "shadow-ball" },
      { level: 1, moveId: "fairy-wind" },
      { level: 30, moveId: "dazzling-gleam" },
      { level: 36, moveId: "flamethrower" },
      { level: 42, moveId: "moonblast" },
      { level: 50, moveId: "fire-blast" },
    ],
  },

  // ===================================================================
  // 鉄岩系統（2段階）: テツイワ → コウテツジン（鋼/岩）
  // ===================================================================
  {
    id: "tetsuiwa",
    name: "テツイワ",
    types: ["steel", "rock"],
    baseStats: { hp: 55, atk: 65, def: 80, spAtk: 30, spDef: 45, speed: 25 },
    baseExpYield: 75,
    expGroup: "slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "harden" },
      { level: 8, moveId: "rock-throw" },
      { level: 14, moveId: "metal-claw" },
      { level: 22, moveId: "iron-head" },
      { level: 28, moveId: "rock-slide" },
    ],
    evolvesTo: [{ id: "koutetsujin", level: 40 }],
  },
  {
    id: "koutetsujin",
    name: "コウテツジン",
    types: ["steel", "rock"],
    baseStats: { hp: 80, atk: 100, def: 120, spAtk: 45, spDef: 65, speed: 35 },
    baseExpYield: 210,
    expGroup: "slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "metal-claw" },
      { level: 14, moveId: "iron-head" },
      { level: 22, moveId: "rock-slide" },
      { level: 40, moveId: "flash-cannon" },
      { level: 46, moveId: "stone-edge" },
      { level: 52, moveId: "earthquake" },
    ],
  },

  // ===================================================================
  // 闇竜系統（2段階）: ヤミトカゲ → アンコクリュウ（悪/ドラゴン）
  // ===================================================================
  {
    id: "yamitokage",
    name: "ヤミトカゲ",
    types: ["dark"],
    baseStats: { hp: 50, atk: 60, def: 45, spAtk: 55, spDef: 40, speed: 65 },
    baseExpYield: 70,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "scratch" },
      { level: 1, moveId: "bite" },
      { level: 10, moveId: "dragon-breath" },
      { level: 18, moveId: "crunch" },
      { level: 24, moveId: "dark-pulse" },
      { level: 30, moveId: "dragon-claw" },
    ],
    evolvesTo: [{ id: "ankokuryuu", level: 38 }],
  },
  {
    id: "ankokuryuu",
    name: "アンコクリュウ",
    types: ["dark", "dragon"],
    baseStats: { hp: 80, atk: 95, def: 70, spAtk: 90, spDef: 65, speed: 95 },
    baseExpYield: 220,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "bite" },
      { level: 1, moveId: "dragon-breath" },
      { level: 18, moveId: "crunch" },
      { level: 24, moveId: "dark-pulse" },
      { level: 30, moveId: "dragon-claw" },
      { level: 38, moveId: "dragon-pulse" },
      { level: 45, moveId: "outrage" },
    ],
  },

  // ===================================================================
  // 氷土系統（2段階）: コオリモグラ → トウドジン（氷/地面）
  // ===================================================================
  {
    id: "koorimogura",
    name: "コオリモグラ",
    types: ["ice", "ground"],
    baseStats: { hp: 55, atk: 65, def: 55, spAtk: 35, spDef: 45, speed: 50 },
    baseExpYield: 70,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "scratch" },
      { level: 1, moveId: "mud-slap" },
      { level: 8, moveId: "icy-wind" },
      { level: 16, moveId: "dig" },
      { level: 22, moveId: "ice-fang" },
      { level: 28, moveId: "earthquake" },
    ],
    evolvesTo: [{ id: "toudojin", level: 42 }],
  },
  {
    id: "toudojin",
    name: "トウドジン",
    types: ["ice", "ground"],
    baseStats: { hp: 85, atk: 100, def: 80, spAtk: 50, spDef: 65, speed: 65 },
    baseExpYield: 200,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "mud-slap" },
      { level: 1, moveId: "icy-wind" },
      { level: 16, moveId: "dig" },
      { level: 22, moveId: "ice-fang" },
      { level: 28, moveId: "earthquake" },
      { level: 42, moveId: "ice-beam" },
      { level: 50, moveId: "blizzard" },
    ],
  },

  // ===================================================================
  // 分岐進化: ヒカリウサギ（フェアリー）— ハナウサギの分岐進化先
  // ===================================================================
  {
    id: "hikariusagi",
    name: "ヒカリウサギ",
    types: ["fairy"],
    baseStats: { hp: 70, atk: 50, def: 65, spAtk: 90, spDef: 85, speed: 80 },
    baseExpYield: 170,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "fairy-wind" },
      { level: 12, moveId: "quick-attack" },
      { level: 18, moveId: "dazzling-gleam" },
      { level: 24, moveId: "psybeam" },
      { level: 30, moveId: "moonblast" },
      { level: 38, moveId: "play-rough" },
    ],
  },

  // ===================================================================
  // 分岐進化: ヨゾラネコ（悪/フェアリー）— ヒカリネコの進化先
  // ===================================================================
  {
    id: "yozoraneko",
    name: "ヨゾラネコ",
    types: ["dark", "fairy"],
    baseStats: { hp: 65, atk: 70, def: 55, spAtk: 85, spDef: 70, speed: 90 },
    baseExpYield: 175,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "scratch" },
      { level: 1, moveId: "thunder-shock" },
      { level: 10, moveId: "bite" },
      { level: 18, moveId: "fairy-wind" },
      { level: 24, moveId: "dark-pulse" },
      { level: 30, moveId: "dazzling-gleam" },
      { level: 38, moveId: "moonblast" },
    ],
  },

  // ===================================================================
  // ドクリンプ（毒）— 単独の毒スライム
  // ===================================================================
  {
    id: "dokurinpu",
    name: "ドクリンプ",
    types: ["poison"],
    baseStats: { hp: 80, atk: 45, def: 60, spAtk: 75, spDef: 70, speed: 40 },
    baseExpYield: 140,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "poison-sting" },
      { level: 10, moveId: "sludge-bomb" },
      { level: 18, moveId: "cross-poison" },
      { level: 26, moveId: "shadow-ball" },
      { level: 34, moveId: "dark-pulse" },
    ],
  },

  // ===================================================================
  // ツチノコ（地面/毒）— 単独モンスター
  // ===================================================================
  {
    id: "tsuchinoko",
    name: "ツチノコ",
    types: ["ground", "poison"],
    baseStats: { hp: 75, atk: 70, def: 65, spAtk: 55, spDef: 60, speed: 45 },
    baseExpYield: 145,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "mud-slap" },
      { level: 8, moveId: "poison-sting" },
      { level: 16, moveId: "dig" },
      { level: 22, moveId: "sludge-bomb" },
      { level: 30, moveId: "earthquake" },
      { level: 38, moveId: "earth-power" },
    ],
  },

  // ===================================================================
  // カゼワシ（格闘/飛行）— 単独モンスター
  // ===================================================================
  {
    id: "kazewashi",
    name: "カゼワシ",
    types: ["fighting", "flying"],
    baseStats: { hp: 70, atk: 95, def: 65, spAtk: 50, spDef: 60, speed: 90 },
    baseExpYield: 180,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "peck" },
      { level: 1, moveId: "double-kick" },
      { level: 10, moveId: "wing-attack" },
      { level: 18, moveId: "aerial-ace" },
      { level: 24, moveId: "brick-break" },
      { level: 32, moveId: "close-combat" },
      { level: 40, moveId: "brave-bird" },
    ],
  },

  // ===================================================================
  // ワスレナグサ（草/フェアリー）— テーマモンスター「忘れな草」
  // ===================================================================
  {
    id: "wasurenagusa",
    name: "ワスレナグサ",
    types: ["grass", "fairy"],
    baseStats: { hp: 60, atk: 40, def: 55, spAtk: 90, spDef: 85, speed: 70 },
    baseExpYield: 160,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "vine-whip" },
      { level: 1, moveId: "fairy-wind" },
      { level: 10, moveId: "leech-seed" },
      { level: 16, moveId: "razor-leaf" },
      { level: 22, moveId: "dazzling-gleam" },
      { level: 30, moveId: "energy-ball" },
      { level: 38, moveId: "moonblast" },
    ],
  },
];
