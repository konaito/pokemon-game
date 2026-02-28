/**
 * 街のランドマークと探索ポイント (#200)
 * 各街の特徴的な場所、探索イベント、隠しアイテム
 */

/** ランドマーク種別 */
export type LandmarkType =
  | "monument" // 記念碑・石碑
  | "viewpoint" // 展望台・眺望ポイント
  | "historic" // 歴史的建造物
  | "natural" // 自然の景観
  | "sacred" // 神聖な場所
  | "industrial" // 産業施設
  | "cultural"; // 文化施設

/** ランドマーク定義 */
export interface Landmark {
  id: string;
  name: string;
  mapId: string;
  x: number;
  y: number;
  type: LandmarkType;
  /** 調べた時のテキスト */
  description: string[];
  /** 隠しアイテム（一度だけ取得可） */
  hiddenItem?: { itemId: string; flagId: string };
}

/** 全ランドマーク定義 */
export const LANDMARKS: Landmark[] = [
  // ── ワスレ町 ──
  {
    id: "landmark-wasuremachi-tree",
    name: "忘却の大樹",
    mapId: "wasuremachi",
    x: 4,
    y: 3,
    type: "natural",
    description: [
      "町の中央にそびえる巨大な大樹。",
      "大忘却以前からここに立っているとされ、幹には誰にも読めない古代文字が刻まれている。",
      "この木の下で眠ると、忘れた夢を見るという言い伝えがある。",
    ],
  },
  {
    id: "landmark-wasuremachi-well",
    name: "記憶の井戸",
    mapId: "wasuremachi",
    x: 3,
    y: 7,
    type: "historic",
    description: [
      "古い石造りの井戸。水面を覗くと、自分の知らない顔が映るとも言われる。",
      "大忘却で失われた記憶が、この井戸の底に沈んでいるという伝説がある。",
    ],
    hiddenItem: { itemId: "potion", flagId: "landmark_well_item" },
  },

  // ── ツチグモ村 ──
  {
    id: "landmark-tsuchigumo-shrine",
    name: "蜘蛛の祠",
    mapId: "tsuchigumo-village",
    x: 5,
    y: 2,
    type: "sacred",
    description: [
      "村の守り神を祀る小さな祠。",
      "虫モンスターと人間が共存していた大忘却以前の時代を偲ぶ場所。",
    ],
  },

  // ── モリノハの町 ──
  {
    id: "landmark-morinoha-ancient-tree",
    name: "年輪の古木",
    mapId: "morinoha-town",
    x: 7,
    y: 4,
    type: "natural",
    description: [
      "樹齢千年とも言われる古木。年輪を数えると大忘却の時期と一致する傷跡がある。",
      "タイジュシンはこの木の子孫かもしれないと、研究者たちは語っている。",
    ],
    hiddenItem: { itemId: "super-potion", flagId: "landmark_ancient_tree_item" },
  },

  // ── カワセミシティ ──
  {
    id: "landmark-kawasemi-fountain",
    name: "記憶の噴水",
    mapId: "kawasemi-city",
    x: 4,
    y: 4,
    type: "cultural",
    description: [
      "町の中央広場にある美しい噴水。",
      "水には記憶を溶かす力があるとされ、この噴水の水を飲むと大忘却以前の夢を見るという。",
      "タイカイオウの像が水を吐き出すデザインになっている。",
    ],
  },
  {
    id: "landmark-kawasemi-harbor",
    name: "旧港跡",
    mapId: "kawasemi-city",
    x: 8,
    y: 8,
    type: "historic",
    description: [
      "かつて大きな港があった場所。今は朽ちた桟橋が残るのみ。",
      "大忘却で航海術が失われ、海を渡る船はもう動かない。",
    ],
    hiddenItem: { itemId: "hyper-potion", flagId: "landmark_harbor_item" },
  },

  // ── ライメイ峠 ──
  {
    id: "landmark-raimei-lightning-rock",
    name: "雷石",
    mapId: "raimei-pass",
    x: 5,
    y: 3,
    type: "natural",
    description: [
      "大忘却の夜に落ちた雷が作った巨大な岩。",
      "この岩に触れると静電気が走り、遠い雷鳴のような音が聞こえるという。",
      "ライジンドウはこの岩の近くでよく目撃される。",
    ],
  },

  // ── ツキヨミの里 ──
  {
    id: "landmark-tsukiyomi-altar",
    name: "月読の祭壇",
    mapId: "tsukiyomi-village",
    x: 4,
    y: 2,
    type: "sacred",
    description: [
      "月の力を受け止める古代の祭壇。",
      "満月の夜にここで祈ると、失われた記憶の断片が月光に映し出されるという。",
      "ツキウサギたちが毎晩ここで踊りを捧げている。",
    ],
  },

  // ── クロガネの街 ──
  {
    id: "landmark-kurogane-furnace",
    name: "始まりの炉",
    mapId: "kurogane-city",
    x: 3,
    y: 3,
    type: "industrial",
    description: [
      "大忘却後、最初に火が灯された鍛冶の炉。",
      "記憶を失った人々が、本能的に鉄を打ち始めた場所として知られている。",
      "今でも鋼モンスターがここに集まり、炎を見つめていることがある。",
    ],
    hiddenItem: { itemId: "revive", flagId: "landmark_furnace_item" },
  },

  // ── ヤミノモリ村 ──
  {
    id: "landmark-yaminomori-graveyard",
    name: "忘れられた墓地",
    mapId: "yaminomori-village",
    x: 6,
    y: 6,
    type: "sacred",
    description: [
      "誰のものかもわからない墓石が並ぶ場所。",
      "大忘却で埋葬された者の名前は全て消え、今は無銘の墓だけが残っている。",
      "カゲボウシはここで生まれるとも言われている。",
    ],
  },

  // ── セイレイ山 ──
  {
    id: "landmark-seirei-peak",
    name: "精霊の頂",
    mapId: "seirei-mountain",
    x: 5,
    y: 1,
    type: "viewpoint",
    description: [
      "セイレイ山の最高地点。ここからは島全体を見渡すことができる。",
      "伝説では、ここに立つ者は大忘却以前の世界の幻視を得るという。",
      "ヨミカグラが舞う姿が、稀にここから目撃されている。",
    ],
  },

  // ── ポケモンリーグ ──
  {
    id: "landmark-league-hall-of-fame",
    name: "殿堂入りの碑",
    mapId: "pokemon-league",
    x: 5,
    y: 2,
    type: "monument",
    description: [
      "歴代チャンピオンの名前が刻まれた碑。",
      "…しかし大忘却でほとんどの名前が消えてしまった。",
      "新たな名前が刻まれる日を、この碑は待ち続けている。",
    ],
  },
];

/**
 * マップIDに属するランドマークを取得
 */
export function getLandmarksByMapId(mapId: string): Landmark[] {
  return LANDMARKS.filter((l) => l.mapId === mapId);
}

/**
 * ランドマークIDで取得
 */
export function getLandmarkById(id: string): Landmark | undefined {
  return LANDMARKS.find((l) => l.id === id);
}

/**
 * ランドマーク総数
 */
export function getLandmarkCount(): number {
  return LANDMARKS.length;
}

/**
 * 隠しアイテム付きランドマーク数
 */
export function getHiddenItemLandmarkCount(): number {
  return LANDMARKS.filter((l) => l.hiddenItem !== undefined).length;
}
