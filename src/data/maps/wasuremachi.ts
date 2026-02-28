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
