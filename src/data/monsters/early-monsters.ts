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
    dexEntry:
      "大忘却の混乱期を素早さで生き延びた。忘れられた食糧庫の場所を本能的に覚えている不思議なネズミ。",
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
    dexEntry:
      "鋭い前歯で何でも齧る。大忘却で崩れた建物の瓦礫の中から、貴重な遺物を掘り出すことがある。",
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
    dexEntry:
      "かつて手紙を届ける役目を担っていたが、大忘却で届け先を忘れてしまった。それでも空を飛び続けている。",
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
    dexEntry:
      "疾風のように空を駆ける。大忘却以前の地図にない場所へ飛んでいくことがあり、失われた土地を知っているのかもしれない。",
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
    dexEntry:
      "繭の中で大忘却以前の夢を見ているという。糸で紡いだ繭の模様は、忘れられた文字に似ていると研究者は語る。",
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
    dexEntry:
      "羽化した瞬間に、繭の中で見ていた記憶の夢が虹色の鱗粉になる。その粉を浴びると、懐かしい気持ちになるという。",
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
    dexEntry:
      "暗闇を恐れず、体から放つ光で忘れられた道を照らす。大忘却の夜を生き延びた人々を導いたという伝承が残る。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 4, moveId: "thunder-shock" },
      { level: 8, moveId: "quick-attack" },
      { level: 12, moveId: "bite" },
    ],
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
    dexEntry:
      "大忘却で荒廃した湿地に最初に戻ってきた生き物。体内の毒は忘却の瘴気を中和する成分を含んでいるらしい。",
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
    dexEntry:
      "毒の沼地そのものと一体化している。その体を構成する泥には、忘れ去られた時代の化石が混じっていることがある。",
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
    dexEntry:
      "川底の泥の中に潜んで暮らす。大忘却で干上がった川が戻った時、真っ先に姿を現した。記憶の水脈を辿ると言われている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "mud-slap" },
      { level: 7, moveId: "water-gun" },
      { level: 11, moveId: "bite" },
    ],
  },
];
