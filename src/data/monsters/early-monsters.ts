/**
 * 序盤モンスターデータ（ルート1〜3、ツチグモ村〜カワセミ市）
 * 御三家以外の序盤で出会えるモンスター10種
 */
import type { MonsterSpecies } from "@/types";

export const EARLY_MONSTERS: MonsterSpecies[] = [
  // === ノーマル枠: コネズミ → オオネズミ ===
  // 序盤の草むら常連。ラッタ的存在
  {
    id: "konezumi",
    name: "コネズミ",
    types: ["normal"],
    baseStats: { hp: 30, atk: 56, def: 35, spAtk: 25, spDef: 35, speed: 72 },
    baseExpYield: 51,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 4, moveId: "tail-whip" },
      { level: 7, moveId: "quick-attack" },
      { level: 13, moveId: "bite" },
    ],
    evolvesTo: [{ id: "oonezumi", level: 20 }],
  },
  {
    id: "oonezumi",
    name: "オオネズミ",
    types: ["normal"],
    baseStats: { hp: 55, atk: 81, def: 60, spAtk: 50, spDef: 60, speed: 97 },
    baseExpYield: 145,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "tail-whip" },
      { level: 7, moveId: "quick-attack" },
      { level: 13, moveId: "bite" },
      { level: 20, moveId: "headbutt" },
    ],
  },

  // === 飛行枠: トビバト → ハヤテドリ ===
  // 序盤の鳥。ポッポ的存在
  {
    id: "tobibato",
    name: "トビバト",
    types: ["normal", "flying"],
    baseStats: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, speed: 56 },
    baseExpYield: 50,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 5, moveId: "gust" },
      { level: 9, moveId: "quick-attack" },
      { level: 13, moveId: "wing-attack" },
    ],
    evolvesTo: [{ id: "hayatedori", level: 18 }],
  },
  {
    id: "hayatedori",
    name: "ハヤテドリ",
    types: ["normal", "flying"],
    baseStats: { hp: 63, atk: 70, def: 55, spAtk: 50, spDef: 50, speed: 91 },
    baseExpYield: 155,
    expGroup: "medium_slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "gust" },
      { level: 9, moveId: "quick-attack" },
      { level: 13, moveId: "wing-attack" },
    ],
  },

  // === 虫枠: マユムシ → ハナムシ ===
  // ジム1（虫タイプ）の地元モンスター
  {
    id: "mayumushi",
    name: "マユムシ",
    types: ["bug"],
    baseStats: { hp: 45, atk: 30, def: 55, spAtk: 25, spDef: 25, speed: 30 },
    baseExpYield: 39,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "string-shot" },
      { level: 7, moveId: "bug-bite" },
      { level: 10, moveId: "harden" },
    ],
    evolvesTo: [{ id: "hanamushi", level: 10 }],
  },
  {
    id: "hanamushi",
    name: "ハナムシ",
    types: ["bug", "flying"],
    baseStats: { hp: 60, atk: 45, def: 50, spAtk: 80, spDef: 80, speed: 70 },
    baseExpYield: 158,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "string-shot" },
      { level: 1, moveId: "gust" },
      { level: 12, moveId: "bug-bite" },
    ],
  },

  // === 電気枠: ヒカリネコ（単体・進化なし）===
  // ルート1の稀少枠。ピカチュウ的存在
  {
    id: "hikarineko",
    name: "ヒカリネコ",
    types: ["electric"],
    baseStats: { hp: 40, atk: 50, def: 35, spAtk: 65, spDef: 50, speed: 90 },
    baseExpYield: 112,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 4, moveId: "thunder-shock" },
      { level: 8, moveId: "quick-attack" },
      { level: 12, moveId: "bite" },
    ],
    evolvesTo: [{ id: "yozoraneko", level: 30, condition: "night" }],
  },

  // === 毒枠: ドクダマ → ドクヌマ ===
  // ルート2〜3の湿地帯。毒タイプ入門
  {
    id: "dokudama",
    name: "ドクダマ",
    types: ["poison"],
    baseStats: { hp: 40, atk: 40, def: 35, spAtk: 40, spDef: 40, speed: 45 },
    baseExpYield: 52,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "poison-sting" },
      { level: 5, moveId: "tackle" },
      { level: 9, moveId: "bite" },
      { level: 13, moveId: "mud-slap" },
    ],
    evolvesTo: [{ id: "dokunuma", level: 22 }],
  },
  {
    id: "dokunuma",
    name: "ドクヌマ",
    types: ["poison", "ground"],
    baseStats: { hp: 65, atk: 65, def: 60, spAtk: 65, spDef: 60, speed: 55 },
    baseExpYield: 157,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "poison-sting" },
      { level: 1, moveId: "tackle" },
      { level: 9, moveId: "bite" },
      { level: 13, moveId: "mud-slap" },
    ],
  },

  // === 水枠: カワドジョウ（単体・進化なし）===
  // ルート3の川辺で出会える水タイプ
  {
    id: "kawadojou",
    name: "カワドジョウ",
    types: ["water", "ground"],
    baseStats: { hp: 55, atk: 55, def: 60, spAtk: 45, spDef: 55, speed: 50 },
    baseExpYield: 92,
    expGroup: "medium_fast",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "mud-slap" },
      { level: 7, moveId: "water-gun" },
      { level: 11, moveId: "bite" },
    ],
  },
];
