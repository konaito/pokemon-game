/**
 * 街の施設 内部マップ定義 (#197)
 * ポケモンセンター・フレンドリィショップ・民家等の内部マップ
 */
import type { MapDefinition } from "@/engine/map/map-data";

const W = "wall" as const;
const G = "ground" as const;
const D = "door" as const;
const S = "sign" as const;

// ═══════════════════════════════════════
// ポケモンセンター 共通テンプレート (8×6)
// ═══════════════════════════════════════
function createPokecenter(mapId: string, cityName: string): MapDefinition {
  return {
    id: mapId as MapDefinition["id"],
    name: `${cityName} ポケモンセンター`,
    width: 8,
    height: 6,
    tiles: [
      [W, W, W, W, W, W, W, W],
      [W, G, G, G, G, G, G, W],
      [W, G, G, G, G, G, G, W],
      [W, G, G, G, G, G, G, W],
      [W, G, G, G, G, G, G, W],
      [W, W, W, D, D, W, W, W],
    ],
    connections: [],
    encounters: [],
    encounterRate: 0,
    npcs: [
      {
        id: `npc-healer-${mapId}`,
        name: "回復のおねえさん",
        x: 4,
        y: 1,
        dialogue: [
          "ここはポケモンセンターです。",
          "モンスターの体力を回復しますね。",
          "お預かりしますね…… ……おまたせしました！",
          "モンスターは元気になりましたよ！",
        ],
        isTrainer: false,
        onInteract: { heal: true },
      },
      {
        id: `npc-center-visitor-${mapId}`,
        name: "休憩中のトレーナー",
        x: 2,
        y: 3,
        dialogue: ["ここのポケモンセンターはいつも助かるよ。", "長い旅にはこまめな休憩が大事さ。"],
        isTrainer: false,
      },
    ],
  };
}

// ═══════════════════════════════════════
// フレンドリィショップ 共通テンプレート (6×6)
// ═══════════════════════════════════════
function createShop(mapId: string, cityName: string): MapDefinition {
  return {
    id: mapId as MapDefinition["id"],
    name: `${cityName} フレンドリィショップ`,
    width: 6,
    height: 6,
    tiles: [
      [W, W, W, W, W, W],
      [W, G, G, G, G, W],
      [W, G, G, G, G, W],
      [W, G, G, G, G, W],
      [W, G, G, G, G, W],
      [W, W, D, D, W, W],
    ],
    connections: [],
    encounters: [],
    encounterRate: 0,
    npcs: [
      {
        id: `npc-shopkeeper-${mapId}`,
        name: "店員",
        x: 3,
        y: 1,
        dialogue: ["いらっしゃいませ！フレンドリィショップへようこそ！", "何をお求めですか？"],
        isTrainer: false,
      },
      {
        id: `npc-shop-customer-${mapId}`,
        name: "買い物客",
        x: 1,
        y: 3,
        dialogue: ["この店はいい品揃えだよ。冒険に必要なものが揃ってる。"],
        isTrainer: false,
      },
    ],
  };
}

// ═══════════════════════════════════════
// 民家テンプレート (5×5)
// ═══════════════════════════════════════
function createHouse(
  mapId: string,
  residentName: string,
  dialogue: string[],
  signText?: string[],
): MapDefinition {
  return {
    id: mapId as MapDefinition["id"],
    name: `民家`,
    width: 5,
    height: 5,
    tiles: [
      [W, W, W, W, W],
      [W, G, G, signText ? S : G, W],
      [W, G, G, G, W],
      [W, G, G, G, W],
      [W, W, D, W, W],
    ],
    connections: [],
    encounters: [],
    encounterRate: 0,
    npcs: [
      {
        id: `npc-resident-${mapId}`,
        name: residentName,
        x: 1,
        y: 1,
        dialogue,
        isTrainer: false,
      },
    ],
  };
}

// ═══════════════════════════════════════
// 全施設定義
// ═══════════════════════════════════════

/** ポケモンセンター一覧 */
export const POKECENTERS: MapDefinition[] = [
  createPokecenter("pokecenter-wasuremachi", "ワスレ町"),
  createPokecenter("pokecenter-tsuchigumo", "ツチグモ村"),
  createPokecenter("pokecenter-morinoha", "モリノハの町"),
  createPokecenter("pokecenter-kawasemi", "カワセミシティ"),
  createPokecenter("pokecenter-raimei", "ライメイ峠"),
  createPokecenter("pokecenter-tsukiyomi", "ツキヨミの里"),
  createPokecenter("pokecenter-kurogane", "クロガネの街"),
  createPokecenter("pokecenter-yaminomori", "ヤミノモリ村"),
  createPokecenter("pokecenter-seirei", "セイレイ山"),
];

/** ショップ一覧 */
export const SHOPS: MapDefinition[] = [
  createShop("shop-wasuremachi", "ワスレ町"),
  createShop("shop-tsuchigumo", "ツチグモ村"),
  createShop("shop-morinoha", "モリノハの町"),
  createShop("shop-kawasemi", "カワセミシティ"),
  createShop("shop-raimei", "ライメイ峠"),
  createShop("shop-kurogane", "クロガネの街"),
  createShop("shop-yaminomori", "ヤミノモリ村"),
];

/** 民家一覧 */
export const HOUSES: MapDefinition[] = [
  createHouse("house-wasuremachi-1", "おばあさん", [
    "ワスレ町は昔はもっと賑やかだったんだよ…",
    "大忘却のせいで、みんなここが故郷だったことも忘れてしまったんじゃ。",
  ]),
  createHouse("house-wasuremachi-2", "幼なじみのお母さん", [
    "あら、旅に出たのね。うちの子も元気にしてるかしら。",
    "モンスターを大切にね。",
  ]),
  createHouse("house-morinoha-1", "農家のおじさん", [
    "この町の畑は大忘却の前からあるんだ。",
    "土が覚えてるのかもしれないな…作物の育て方を。",
  ]),
  createHouse("house-kawasemi-1", "船乗りのおじいさん", [
    "若い頃は海を渡ったもんだ。",
    "海の向こうには、大忘却の影響を受けなかった土地があるとか…",
    "まあ、誰も覚えとらんがな。",
  ]),
  createHouse("house-kurogane-1", "鍛冶師のおかみさん", [
    "うちの人は毎日鉄を打ってるよ。",
    "鋼モンスターが手伝ってくれるから、この町の鍛冶は特別なんだ。",
  ]),
  createHouse(
    "house-tsukiyomi-1",
    "巫女",
    [
      "この里では月の記憶を守る祈りを続けています。",
      "大忘却でも、月だけは忘れなかった…それはフェアリーの力のおかげです。",
    ],
    ["月読の里の教え：忘却は終わりではなく、新しい始まりである。"],
  ),
  createHouse("house-yaminomori-1", "占い師", [
    "闇の中にこそ、見えるものがある…",
    "あなたの旅路に、暗い影が寄り添っている。でも、それは守護のしるし。",
  ]),
];

/** 全施設マップを統合 */
export const ALL_FACILITY_MAPS: MapDefinition[] = [...POKECENTERS, ...SHOPS, ...HOUSES];

/** 施設マップ数 */
export function getFacilityCount(): number {
  return ALL_FACILITY_MAPS.length;
}

/** IDから施設マップを取得 */
export function getFacilityById(mapId: string): MapDefinition | undefined {
  return ALL_FACILITY_MAPS.find((m) => m.id === mapId);
}
