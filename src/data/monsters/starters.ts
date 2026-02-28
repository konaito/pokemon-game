/**
 * 御三家（スターター）モンスターデータ
 * ヒモリ系列（炎）、シズクモ系列（水）、コノハナ系列（草）
 */
import type { MonsterSpecies } from "@/types";

export const STARTERS: MonsterSpecies[] = [
  // === ヒモリ系列（炎 → 炎 → 炎/格闘）===
  {
    id: "himori",
    name: "ヒモリ",
    types: ["fire"],
    baseStats: { hp: 45, atk: 60, def: 40, spAtk: 50, spDef: 40, speed: 65 },
    baseExpYield: 62,
    expGroup: "medium_slow",
    dexEntry:
      "尻尾の炎は生まれた日の記憶を宿すという。大忘却の後も火が消えなかった数少ないモンスターの子孫。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "growl" },
      { level: 5, moveId: "ember" },
      { level: 9, moveId: "quick-attack" },
      { level: 13, moveId: "bite" },
    ],
    evolvesTo: [{ id: "hinomori", level: 16 }],
  },
  {
    id: "hinomori",
    name: "ヒノモリ",
    types: ["fire"],
    baseStats: { hp: 60, atk: 80, def: 55, spAtk: 65, spDef: 55, speed: 80 },
    baseExpYield: 142,
    expGroup: "medium_slow",
    dexEntry:
      "成長とともに炎が激しくなり、過去の記憶が蘇るように戦う本能が目覚める。忘れられた森を駆け抜ける姿が目撃されている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "growl" },
      { level: 1, moveId: "ember" },
      { level: 9, moveId: "quick-attack" },
      { level: 13, moveId: "bite" },
      { level: 17, moveId: "flame-wheel" },
      { level: 21, moveId: "double-kick" },
    ],
    evolvesTo: [{ id: "enjuu", level: 36 }],
  },
  {
    id: "enjuu",
    name: "エンジュウ",
    types: ["fire", "fighting"],
    baseStats: { hp: 76, atk: 104, def: 71, spAtk: 80, spDef: 71, speed: 108 },
    baseExpYield: 240,
    expGroup: "medium_slow",
    dexEntry:
      "大忘却以前の武人の魂が宿るとされる。炎の拳で失われた記憶を取り戻すかのように、決して諦めず戦い続ける。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "growl" },
      { level: 1, moveId: "ember" },
      { level: 1, moveId: "quick-attack" },
      { level: 13, moveId: "bite" },
      { level: 17, moveId: "flame-wheel" },
      { level: 21, moveId: "double-kick" },
    ],
  },

  // === シズクモ系列（水 → 水 → 水/超）===
  {
    id: "shizukumo",
    name: "シズクモ",
    types: ["water"],
    baseStats: { hp: 50, atk: 40, def: 45, spAtk: 60, spDef: 50, speed: 55 },
    baseExpYield: 63,
    expGroup: "medium_slow",
    dexEntry:
      "体の水滴ひとつひとつに、見たものの記憶が溶け込んでいるといわれる。悲しい記憶に触れると涙のように雫がこぼれる。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "tail-whip" },
      { level: 5, moveId: "water-gun" },
      { level: 9, moveId: "bubble" },
      { level: 13, moveId: "quick-attack" },
    ],
    evolvesTo: [{ id: "namikozou", level: 16 }],
  },
  {
    id: "namikozou",
    name: "ナミコゾウ",
    types: ["water"],
    baseStats: { hp: 65, atk: 55, def: 60, spAtk: 80, spDef: 65, speed: 70 },
    baseExpYield: 144,
    expGroup: "medium_slow",
    dexEntry:
      "波に乗って忘れ去られた海底都市を探索する習性がある。大忘却で沈んだ文明の欠片を集めているとも。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "tail-whip" },
      { level: 1, moveId: "water-gun" },
      { level: 9, moveId: "bubble" },
      { level: 13, moveId: "quick-attack" },
      { level: 17, moveId: "water-pulse" },
    ],
    evolvesTo: [{ id: "taikaiou", level: 36 }],
  },
  {
    id: "taikaiou",
    name: "タイカイオウ",
    types: ["water", "psychic"],
    baseStats: { hp: 81, atk: 71, def: 76, spAtk: 104, spDef: 81, speed: 97 },
    baseExpYield: 239,
    expGroup: "medium_slow",
    dexEntry:
      "深海に眠る全ての記憶を読み取る力を持つ。大忘却の真実を知る唯一の存在かもしれないと、古い文献に記されている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "tail-whip" },
      { level: 1, moveId: "water-gun" },
      { level: 1, moveId: "bubble" },
      { level: 13, moveId: "quick-attack" },
      { level: 17, moveId: "water-pulse" },
    ],
  },

  // === コノハナ系列（草 → 草 → 草/岩）===
  {
    id: "konohana",
    name: "コノハナ",
    types: ["grass"],
    baseStats: { hp: 55, atk: 45, def: 55, spAtk: 45, spDef: 55, speed: 45 },
    baseExpYield: 64,
    expGroup: "medium_slow",
    dexEntry:
      "葉っぱの模様は一枚ごとに異なり、それぞれが大忘却以前の季節の記憶を映し出しているという言い伝えがある。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "leer" },
      { level: 5, moveId: "vine-whip" },
      { level: 9, moveId: "leech-seed" },
      { level: 13, moveId: "razor-leaf" },
    ],
    evolvesTo: [{ id: "morinoko", level: 16 }],
  },
  {
    id: "morinoko",
    name: "モリノコ",
    types: ["grass"],
    baseStats: { hp: 70, atk: 60, def: 70, spAtk: 60, spDef: 70, speed: 60 },
    baseExpYield: 142,
    expGroup: "medium_slow",
    dexEntry:
      "根を大地に下ろして眠ると、土の中に残る遠い昔の記憶を夢に見る。目覚めるたびに少し強くなっている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "leer" },
      { level: 1, moveId: "vine-whip" },
      { level: 9, moveId: "leech-seed" },
      { level: 13, moveId: "razor-leaf" },
      { level: 17, moveId: "rock-throw" },
    ],
    evolvesTo: [{ id: "taijushin", level: 36 }],
  },
  {
    id: "taijushin",
    name: "タイジュシン",
    types: ["grass", "rock"],
    baseStats: { hp: 95, atk: 82, def: 97, spAtk: 75, spDef: 87, speed: 74 },
    baseExpYield: 236,
    expGroup: "medium_slow",
    dexEntry:
      "千年を生きる巨木の化身。その幹には大忘却以前の世界の記録が年輪のように刻まれており、解読を試みる学者が後を絶たない。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "leer" },
      { level: 1, moveId: "vine-whip" },
      { level: 1, moveId: "leech-seed" },
      { level: 13, moveId: "razor-leaf" },
      { level: 17, moveId: "rock-throw" },
    ],
  },
];
