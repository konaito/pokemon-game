/**
 * ジムリーダーデータ
 * ワスレナ島の8つのジム。序盤〜終盤にかけてレベルが上昇する。
 */

import type { GymDefinition } from "@/engine/event/gym";

/** 全ジムリーダーデータ */
export const GYM_LEADERS: GymDefinition[] = [
  // ジム1: ノーマル — マサキ（シズマリの町）
  {
    id: "gym_1",
    gymNumber: 1,
    name: "シズマリジム",
    leaderName: "マサキ",
    type: "normal",
    leaderParty: [
      { speciesId: "konezumi", level: 10 },
      { speciesId: "tobibato", level: 12 },
    ],
    badgeName: "シズマリバッジ",
    mapId: "shizumari_gym",
    leaderIntroDialogue: [
      "やあ、新しい挑戦者だね。",
      "僕はマサキ。この島で一番最初の試練を担当している。",
      "記憶がなくても、モンスターとの絆は消えない。",
      "それを見せてくれ！",
    ],
    leaderDefeatDialogue: [
      "…やるじゃないか。君とモンスターの息はぴったりだ。",
      "シズマリバッジ、受け取ってくれ。",
    ],
  },

  // ジム2: 虫 — カイコ（ルート2の先）
  {
    id: "gym_2",
    gymNumber: 2,
    name: "モリノハジム",
    leaderName: "カイコ",
    type: "bug",
    leaderParty: [
      { speciesId: "mayumushi", level: 14 },
      { speciesId: "mayumushi", level: 14 },
      { speciesId: "hanamushi", level: 16 },
    ],
    badgeName: "モリノハバッジ",
    mapId: "morinoha_gym",
    leaderIntroDialogue: [
      "虫たちは小さくても、とても強いの。",
      "私はカイコ。虫タイプの研究をしているわ。",
      "大忘却で失われた虫の歌を探しているの。",
      "あなたの強さ、虫たちに見せて。",
    ],
    leaderDefeatDialogue: ["…すごい。虫たちも認めているわ。", "モリノハバッジ、あなたのものよ。"],
  },

  // ジム3: 電気 — ライゾウ（ルート3の先）
  {
    id: "gym_3",
    gymNumber: 3,
    name: "イナヅマジム",
    leaderName: "ライゾウ",
    type: "electric",
    leaderParty: [
      { speciesId: "hikarineko", level: 18 },
      { speciesId: "hikarineko", level: 20 },
    ],
    badgeName: "イナヅマバッジ",
    mapId: "inazuma_gym",
    leaderIntroDialogue: [
      "ビリビリ来るぜ！",
      "俺はライゾウ、雷使いだ！",
      "大忘却の嵐のように激しいバトル、覚悟しな！",
    ],
    leaderDefeatDialogue: ["しびれたぜ…お前の方が一枚上手だ。", "イナヅマバッジだ！受け取りな！"],
  },

  // ジム4: 炎 — カガリ（カガリ市）
  {
    id: "gym_4",
    gymNumber: 4,
    name: "カガリジム",
    leaderName: "カガリ",
    type: "fire",
    leaderParty: [
      { speciesId: "hidane", level: 24 },
      { speciesId: "hinomori", level: 26 },
      { speciesId: "kaenjishi", level: 28 },
    ],
    badgeName: "カガリバッジ",
    mapId: "kagari_gym",
    leaderIntroDialogue: [
      "記憶の炎は消えない。たとえ全てを忘れても。",
      "私はカガリ。炎と共に生きる鍛冶師。",
      "お前の心に火はあるか？　見せてもらうぞ。",
    ],
    leaderDefeatDialogue: ["…見事な炎だ。お前の心は燃えている。", "カガリバッジだ。大切にしろ。"],
  },

  // ジム5: 格闘 — ゴウキ（ルート5の先）
  {
    id: "gym_5",
    gymNumber: 5,
    name: "ゴウキジム",
    leaderName: "ゴウキ",
    type: "fighting",
    leaderParty: [
      { speciesId: "tsuchikobushi", level: 30 },
      { speciesId: "kurooni", level: 31 },
      { speciesId: "iwakenjin", level: 33 },
    ],
    badgeName: "ゴウキバッジ",
    mapId: "gouki_gym",
    leaderIntroDialogue: [
      "拳に宿る記憶がある。体が覚えている。",
      "我はゴウキ。武の道を極めし者。",
      "言葉はいらぬ。拳で語り合おう。",
    ],
    leaderDefeatDialogue: [
      "…見事。お前の拳は、我を超えた。",
      "ゴウキバッジだ。お前にはその資格がある。",
    ],
  },

  // ジム6: ゴースト — キリフリ（キリフリ村）
  {
    id: "gym_6",
    gymNumber: 6,
    name: "キリフリジム",
    leaderName: "キリフリ",
    type: "ghost",
    leaderParty: [
      { speciesId: "yurabi", level: 34 },
      { speciesId: "kageboushi", level: 35 },
      { speciesId: "fubukirei", level: 36 },
      { speciesId: "yomikagura", level: 38 },
    ],
    badgeName: "キリフリバッジ",
    mapId: "kirifuri_gym",
    leaderIntroDialogue: [
      "ふふ…よく来たわね。",
      "私はキリフリ。霧の向こうから来た霊媒師よ。",
      "大忘却で消えた魂が、ここには集まってくるの。",
      "あなたは…その記憶の重さに耐えられるかしら。",
    ],
    leaderDefeatDialogue: ["…あなたの光は、霧を晴らすほどね。", "キリフリバッジ、受け取りなさい。"],
  },

  // ジム7: 氷 — フユハ（ルート7の先）
  {
    id: "gym_7",
    gymNumber: 7,
    name: "フユハジム",
    leaderName: "フユハ",
    type: "ice",
    leaderParty: [
      { speciesId: "yukiusagi", level: 39 },
      { speciesId: "kogoriiwa", level: 40 },
      { speciesId: "fubukirei", level: 41 },
      { speciesId: "koorigitsune", level: 43 },
    ],
    badgeName: "フユハバッジ",
    mapId: "fuyuha_gym",
    leaderIntroDialogue: [
      "氷は記憶を閉じ込める。溶けなければ、永遠に。",
      "私はフユハ。氷の結晶を研究する学者よ。",
      "大忘却の前の記憶…氷の中に見つけたの。",
      "あなたの熱意で、この氷を溶かしてみせて。",
    ],
    leaderDefeatDialogue: [
      "…氷が…溶けていくわ。あなたの温かさに。",
      "フユハバッジよ。どうか、受け取って。",
    ],
  },

  // ジム8: ドラゴン — タツミ（ルート8の先）
  {
    id: "gym_8",
    gymNumber: 8,
    name: "タツミジム",
    leaderName: "タツミ",
    type: "dragon",
    leaderParty: [
      { speciesId: "umihebi", level: 43 },
      { speciesId: "haganedake", level: 44 },
      { speciesId: "ryuubi", level: 44 },
      { speciesId: "ryuujin", level: 46 },
    ],
    badgeName: "タツミバッジ",
    mapId: "tatsumi_gym",
    leaderIntroDialogue: [
      "…来たか。最後のジムリーダー、タツミだ。",
      "竜は太古の記憶を血に刻む。大忘却すら、竜には届かなかった。",
      "お前がここまで来たということは、それだけの覚悟がある。",
      "全力で行くぞ。これが最後の試練だ。",
    ],
    leaderDefeatDialogue: [
      "…竜の誇りにかけて認めよう。お前は強い。",
      "タツミバッジだ。これで全てのバッジが揃った。",
      "ポケモンリーグへの道が、開かれたぞ。",
    ],
  },
];
