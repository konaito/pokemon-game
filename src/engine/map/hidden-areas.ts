/**
 * 隠しエリアとダンジョン深層 (#188)
 * 隠し通路の判定ロジック、隠しアイテム、新ダンジョンマップ定義
 */

import type { MapDefinition, MapConnection, EncounterEntry, NpcDefinition } from "./map-data";
import type { FlagRequirement, StoryFlags } from "@/engine/state/story-flags";
import { checkFlagRequirement } from "@/engine/state/story-flags";

/** 隠しアイテム定義 */
export interface HiddenItem {
  id: string;
  x: number;
  y: number;
  itemId: string;
  quantity: number;
  /** 取得済みフラグ名 */
  flagId: string;
  /** アイテム発見のヒントテキスト */
  hint?: string;
}

/** 隠し通路定義 */
export interface HiddenPassage {
  /** 元マップ上の壁座標 */
  x: number;
  y: number;
  /** 通過条件 */
  requirement: FlagRequirement;
  /** 通過先の接続情報 */
  connection: MapConnection;
  /** ヒント台詞 */
  hint?: string;
}

/**
 * 隠し通路が通過可能か判定
 */
export function canPassHiddenPassage(passage: HiddenPassage, flags: StoryFlags): boolean {
  return checkFlagRequirement(flags, passage.requirement);
}

/**
 * 隠しアイテムが取得可能か判定
 */
export function canCollectHiddenItem(item: HiddenItem, flags: StoryFlags): boolean {
  return !flags[item.flagId];
}

/**
 * 隠しアイテムを取得した際のフラグ名を返す
 */
export function getHiddenItemFlag(item: HiddenItem): string {
  return item.flagId;
}

// ── 隠しエリアマップ定義 ──

/** 忘却の遺跡 最深部 */
export const RUINS_DEPTHS: MapDefinition = {
  id: "ruins_depths",
  name: "忘却の遺跡 最深部",
  width: 10,
  height: 12,
  tiles: [
    ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ["wall", "ground", "ground", "ground", "wall", "wall", "ground", "ground", "ground", "wall"],
    [
      "wall",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "wall",
    ],
    ["wall", "ground", "ground", "wall", "ground", "ground", "wall", "ground", "ground", "wall"],
    ["wall", "ground", "ground", "wall", "ground", "ground", "wall", "ground", "ground", "wall"],
    [
      "wall",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "wall",
    ],
    ["wall", "wall", "ground", "ground", "ground", "ground", "ground", "ground", "wall", "wall"],
    ["wall", "wall", "ground", "ground", "sign", "sign", "ground", "ground", "wall", "wall"],
    ["wall", "wall", "wall", "ground", "ground", "ground", "ground", "wall", "wall", "wall"],
    ["wall", "wall", "wall", "ground", "ground", "ground", "ground", "wall", "wall", "wall"],
    ["wall", "wall", "wall", "wall", "ground", "ground", "wall", "wall", "wall", "wall"],
    ["wall", "wall", "wall", "wall", "door", "door", "wall", "wall", "wall", "wall"],
  ],
  connections: [
    {
      targetMapId: "ruins_b2f",
      targetX: 5,
      targetY: 1,
      sourceX: 4,
      sourceY: 11,
    },
    {
      targetMapId: "ruins_b2f",
      targetX: 6,
      targetY: 1,
      sourceX: 5,
      sourceY: 11,
    },
  ],
  encounters: [],
  encounterRate: 0,
  npcs: [],
};

/** セイレイ山 裏ルート */
export const SEIREI_BACK: MapDefinition = {
  id: "seirei_back",
  name: "セイレイ山 裏ルート",
  width: 12,
  height: 10,
  tiles: [
    [
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
    ],
    [
      "wall",
      "grass",
      "grass",
      "ground",
      "wall",
      "ground",
      "ground",
      "grass",
      "grass",
      "ground",
      "ground",
      "wall",
    ],
    [
      "wall",
      "grass",
      "ground",
      "ground",
      "wall",
      "ground",
      "ground",
      "grass",
      "ground",
      "ground",
      "ground",
      "wall",
    ],
    [
      "wall",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "wall",
      "ground",
      "wall",
    ],
    [
      "wall",
      "ground",
      "wall",
      "wall",
      "ground",
      "ground",
      "wall",
      "wall",
      "ground",
      "wall",
      "ground",
      "wall",
    ],
    [
      "wall",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "wall",
    ],
    [
      "wall",
      "grass",
      "ground",
      "wall",
      "ground",
      "ground",
      "wall",
      "ground",
      "grass",
      "grass",
      "ground",
      "wall",
    ],
    [
      "wall",
      "grass",
      "grass",
      "wall",
      "ground",
      "ground",
      "wall",
      "ground",
      "grass",
      "grass",
      "ground",
      "wall",
    ],
    [
      "wall",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "wall",
    ],
    [
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
      "door",
      "door",
      "wall",
      "wall",
      "wall",
      "wall",
      "wall",
    ],
  ],
  connections: [
    {
      targetMapId: "seirei_summit",
      targetX: 5,
      targetY: 1,
      sourceX: 5,
      sourceY: 9,
    },
    {
      targetMapId: "seirei_summit",
      targetX: 6,
      targetY: 1,
      sourceX: 6,
      sourceY: 9,
    },
  ],
  encounters: [
    { speciesId: "iwakenjin", minLevel: 50, maxLevel: 55, weight: 20 },
    { speciesId: "haganedake", minLevel: 50, maxLevel: 55, weight: 20 },
    { speciesId: "ryuubi", minLevel: 52, maxLevel: 58, weight: 15 },
    { speciesId: "koorigitsune", minLevel: 50, maxLevel: 55, weight: 20 },
    { speciesId: "kurooni", minLevel: 53, maxLevel: 58, weight: 15 },
    { speciesId: "ryuujin", minLevel: 55, maxLevel: 60, weight: 10 },
  ],
  encounterRate: 30,
  npcs: [],
};

/** 海底洞窟 */
export const UNDERSEA_CAVE: MapDefinition = {
  id: "undersea_cave",
  name: "海底洞窟",
  width: 10,
  height: 10,
  tiles: [
    ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ["wall", "water", "water", "ground", "ground", "ground", "ground", "water", "water", "wall"],
    ["wall", "water", "ground", "ground", "grass", "grass", "ground", "ground", "water", "wall"],
    ["wall", "ground", "ground", "grass", "ground", "ground", "grass", "ground", "ground", "wall"],
    ["wall", "ground", "grass", "ground", "ground", "ground", "ground", "grass", "ground", "wall"],
    ["wall", "ground", "ground", "ground", "water", "water", "ground", "ground", "ground", "wall"],
    ["wall", "water", "ground", "ground", "water", "water", "ground", "ground", "water", "wall"],
    ["wall", "water", "water", "ground", "ground", "ground", "ground", "water", "water", "wall"],
    [
      "wall",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "ground",
      "wall",
    ],
    ["wall", "wall", "wall", "wall", "door", "door", "wall", "wall", "wall", "wall"],
  ],
  connections: [],
  encounters: [
    { speciesId: "shizukumo", minLevel: 45, maxLevel: 50, weight: 25 },
    { speciesId: "umihebi", minLevel: 48, maxLevel: 53, weight: 20 },
    { speciesId: "kogoriiwa", minLevel: 45, maxLevel: 50, weight: 20 },
    { speciesId: "haganedake", minLevel: 48, maxLevel: 52, weight: 20 },
    { speciesId: "koorigitsune", minLevel: 50, maxLevel: 55, weight: 15 },
  ],
  encounterRate: 25,
  npcs: [],
};

/** 忘れられた研究所 */
export const FORGOTTEN_LAB: MapDefinition = {
  id: "forgotten_lab",
  name: "忘れられた研究所",
  width: 8,
  height: 8,
  tiles: [
    ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ["wall", "ground", "ground", "ground", "ground", "ground", "ground", "wall"],
    ["wall", "ground", "sign", "ground", "ground", "sign", "ground", "wall"],
    ["wall", "ground", "ground", "ground", "ground", "ground", "ground", "wall"],
    ["wall", "ground", "ground", "wall", "wall", "ground", "ground", "wall"],
    ["wall", "ground", "sign", "ground", "ground", "sign", "ground", "wall"],
    ["wall", "ground", "ground", "ground", "ground", "ground", "ground", "wall"],
    ["wall", "wall", "wall", "door", "door", "wall", "wall", "wall"],
  ],
  connections: [],
  encounters: [],
  encounterRate: 0,
  npcs: [
    {
      id: "lab_terminal_1",
      name: "研究端末",
      x: 2,
      y: 2,
      dialogue: [
        "『大忘却プロジェクト 研究記録 #127』",
        "記憶の結晶化実験は失敗に終わった。",
        "記憶と忘却は分離できない。一対の存在なのだ。",
      ],
      isTrainer: false,
    },
    {
      id: "lab_terminal_2",
      name: "研究端末",
      x: 5,
      y: 2,
      dialogue: [
        "『大忘却プロジェクト 研究記録 #256』",
        "実験体「オモイデ」と「ワスレヌ」が暴走した。",
        "記憶と忘却の分離により、世界規模の忘却現象が発生。",
      ],
      isTrainer: false,
    },
    {
      id: "lab_terminal_3",
      name: "研究端末",
      x: 2,
      y: 5,
      dialogue: [
        "『大忘却プロジェクト 最終報告』",
        "大忘却は人為的に引き起こされた。",
        "二体を再び合わせることで、失われた記憶は戻るかもしれない…",
      ],
      isTrainer: false,
    },
    {
      id: "lab_terminal_4",
      name: "研究端末",
      x: 5,
      y: 5,
      dialogue: [
        "『博士の個人メモ』",
        "私が始めてしまったことだ。",
        "いつか記憶と忘却を受け止められる者が現れることを祈る。",
        "この研究所の存在を知る者に、全てを託す。",
      ],
      isTrainer: false,
    },
  ],
};

/** 虹色の花畑 */
export const RAINBOW_MEADOW: MapDefinition = {
  id: "rainbow_meadow",
  name: "虹色の花畑",
  width: 10,
  height: 8,
  tiles: [
    ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ["wall", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "wall"],
    ["wall", "grass", "ground", "grass", "grass", "grass", "grass", "ground", "grass", "wall"],
    ["wall", "grass", "grass", "grass", "ground", "ground", "grass", "grass", "grass", "wall"],
    ["wall", "grass", "grass", "ground", "ground", "ground", "ground", "grass", "grass", "wall"],
    ["wall", "grass", "ground", "grass", "grass", "grass", "grass", "ground", "grass", "wall"],
    ["wall", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "wall"],
    ["wall", "wall", "wall", "wall", "door", "door", "wall", "wall", "wall", "wall"],
  ],
  connections: [],
  encounters: [
    { speciesId: "hanabira", minLevel: 35, maxLevel: 42, weight: 30 },
    { speciesId: "hanamushi", minLevel: 38, maxLevel: 45, weight: 25 },
    { speciesId: "yukiusagi", minLevel: 35, maxLevel: 40, weight: 20 },
    { speciesId: "hikarineko", minLevel: 38, maxLevel: 45, weight: 15 },
    { speciesId: "hanabira", minLevel: 42, maxLevel: 48, weight: 10 },
  ],
  encounterRate: 35,
  npcs: [],
};

/** 全隠しエリアマップ */
export const HIDDEN_AREA_MAPS: MapDefinition[] = [
  RUINS_DEPTHS,
  SEIREI_BACK,
  UNDERSEA_CAVE,
  FORGOTTEN_LAB,
  RAINBOW_MEADOW,
];

/** 隠し通路の定義 */
export const HIDDEN_PASSAGES: HiddenPassage[] = [
  {
    x: 7,
    y: 3,
    requirement: "champion_cleared",
    connection: {
      targetMapId: "ruins_depths",
      targetX: 4,
      targetY: 10,
      sourceX: 7,
      sourceY: 3,
    },
    hint: "この壁、どこか怪しい…古代文字が刻まれている。",
  },
  {
    x: 9,
    y: 5,
    requirement: ["champion_cleared", "badge_8"],
    connection: {
      targetMapId: "seirei_back",
      targetX: 5,
      targetY: 8,
      sourceX: 9,
      sourceY: 5,
    },
    hint: "山肌に微かな隙間が見える。全てのバッジが光っている…",
  },
  {
    x: 3,
    y: 7,
    requirement: "quest_forgotten_lab_started",
    connection: {
      targetMapId: "forgotten_lab",
      targetX: 3,
      targetY: 6,
      sourceX: 3,
      sourceY: 7,
    },
    hint: "壁の裏に、何か部屋があるようだ…",
  },
];

/** 隠しアイテムの定義 */
export const HIDDEN_ITEMS: HiddenItem[] = [
  {
    id: "hidden_ruins_rare_candy",
    x: 4,
    y: 7,
    itemId: "rare_candy",
    quantity: 1,
    flagId: "hidden_item_ruins_depths_1",
    hint: "石碑の裏に何か光るものが見える…",
  },
  {
    id: "hidden_seirei_evo_stone",
    x: 10,
    y: 3,
    itemId: "thunder_stone",
    quantity: 1,
    flagId: "hidden_item_seirei_back_1",
    hint: "岩の隙間に何かが挟まっている…",
  },
  {
    id: "hidden_undersea_water_stone",
    x: 4,
    y: 5,
    itemId: "water_stone",
    quantity: 1,
    flagId: "hidden_item_undersea_1",
    hint: "水底に何かが光っている…",
  },
  {
    id: "hidden_meadow_fairy_dust",
    x: 4,
    y: 3,
    itemId: "moon_stone",
    quantity: 1,
    flagId: "hidden_item_meadow_1",
    hint: "花の中に不思議な輝きが…",
  },
  {
    id: "hidden_lab_master_ball",
    x: 5,
    y: 3,
    itemId: "master_ball",
    quantity: 1,
    flagId: "hidden_item_lab_1",
    hint: "デスクの引き出しに何か入っている…",
  },
];
