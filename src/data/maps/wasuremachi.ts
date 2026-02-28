/**
 * ワスレ町 — 始まりの町
 * 10x10、ポケモンセンター、博士の家、ジムへの接続
 */
import type { MapDefinition } from "@/engine/map/map-data";

// W=wall, G=ground, T=grass, D=door
const W = "wall" as const;
const G = "ground" as const;
const D = "door" as const;

export const WASUREMACHI: MapDefinition = {
  id: "wasuremachi",
  name: "ワスレ町",
  width: 10,
  height: 10,
  tiles: [
    // y=0: 上端の壁
    [W, W, W, W, W, W, W, W, W, W],
    // y=1: 博士の家（左上）
    [W, D, W, G, G, G, G, W, D, W],
    // y=2
    [W, G, W, G, G, G, G, W, G, W],
    // y=3: 道
    [G, G, G, G, G, G, G, G, G, G],
    // y=4
    [G, G, G, G, G, G, G, G, G, G],
    // y=5: ポケモンセンター（左下）、ジム（右下）
    [W, D, W, G, G, G, G, W, D, W],
    // y=6
    [W, G, W, G, G, G, G, W, G, W],
    // y=7
    [W, W, W, G, G, G, G, W, W, W],
    // y=8: 下部の道
    [G, G, G, G, G, G, G, G, G, G],
    // y=9: 南出口（ルート1への接続）
    [W, W, W, W, G, G, W, W, W, W],
  ],
  connections: [
    {
      // 南出口 → ルート1
      targetMapId: "route-1",
      targetX: 7,
      targetY: 0,
      sourceX: 4,
      sourceY: 9,
    },
    {
      // 南出口（幅2マス目）
      targetMapId: "route-1",
      targetX: 8,
      targetY: 0,
      sourceX: 5,
      sourceY: 9,
    },
  ],
  encounters: [],
  encounterRate: 0,
  npcs: [
    {
      id: "npc-professor",
      name: "ワスレ博士",
      x: 1,
      y: 2,
      dialogue: [
        "わしはワスレ博士じゃ。",
        "この世界には「大忘却」と呼ばれる謎の現象があったんじゃ…",
        "キミのモンスターを大切に育てるんじゃぞ！",
      ],
      conditionalDialogues: [
        {
          condition: "champion_cleared",
          dialogue: [
            "キミがチャンピオンになるとは…わしも鼻が高いわい！",
            "「大忘却」の謎に、キミならきっと迫れるじゃろう。",
          ],
        },
        {
          condition: "gym8_cleared",
          dialogue: [
            "全てのジムバッジを手にしたか！",
            "ポケモンリーグが待っておるぞ。万全の準備をするんじゃ！",
          ],
        },
        {
          condition: "gym4_cleared",
          dialogue: ["おお、もうバッジが4つもあるのか！", "キミの成長は目を見張るものがあるのう。"],
        },
        {
          condition: "gym1_cleared",
          dialogue: ["最初のジムに勝ったか！やるのう！", "まだまだ先は長い。焦らず進むんじゃぞ。"],
        },
      ],
      isTrainer: false,
    },
    {
      id: "npc-healer",
      name: "回復のおねえさん",
      x: 1,
      y: 6,
      dialogue: ["ここはモンスター回復センターです。", "お預かりしたモンスターを回復しますね！"],
      isTrainer: false,
      onInteract: { heal: true },
    },
    {
      id: "npc-townsperson",
      name: "町の人",
      x: 5,
      y: 4,
      dialogue: [
        "ワスレ町へようこそ！",
        "南に行くとルート1だよ。野生のモンスターがいるから気をつけてね！",
      ],
      conditionalDialogues: [
        {
          condition: "champion_cleared",
          dialogue: [
            "チャンピオンがこの町の出身だなんて、誇らしいよ！",
            "いつでも遊びに来てくれよな！",
          ],
        },
        {
          condition: "gym8_cleared",
          dialogue: [
            "全バッジ制覇だって！？すごいな…",
            "ポケモンリーグに挑むんだろう？応援してるぜ！",
          ],
        },
        {
          condition: "gym4_cleared",
          dialogue: ["もう半分のジムを制覇したのか！", "この町を出た頃が懐かしいだろう？"],
        },
        {
          condition: "gym1_cleared",
          dialogue: [
            "最初のジムに勝ったんだって？やるじゃないか！",
            "次の町はルート2を抜けた先にあるよ。",
          ],
        },
      ],
      isTrainer: false,
    },
    {
      id: "npc-shop-wasuremachi",
      name: "ショップ店員",
      x: 8,
      y: 6,
      dialogue: ["いらっしゃいませ！ 何をお求めですか？"],
      isTrainer: false,
      onInteract: { shop: [] },
    },
  ],
};
