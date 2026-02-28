/**
 * 街の装飾タイルと視覚的な個性付けシステム (#198)
 * 各タイルタイプの視覚バリアント定義と街テーマカラー
 */

/** 装飾タイルバリアント（視覚的なサブタイプ） */
export type DecorationVariant =
  | "fountain" // 噴水（water系）
  | "pond" // 池
  | "flowerbed" // 花壇（grass系）
  | "park" // 公園
  | "field" // 畑
  | "statue" // 像（wall系）
  | "tree" // 木
  | "big_tree" // 大木
  | "rock" // 岩
  | "bench" // ベンチ（ground系）
  | "streetlight" // 街灯
  | "well" // 井戸
  | "mailbox" // ポスト
  | "signpost" // 道標（sign系）
  | "bulletin_board" // 掲示板
  | "monument"; // 記念碑

/** 装飾タイル定義 */
export interface DecorationTile {
  x: number;
  y: number;
  variant: DecorationVariant;
  /** 看板テキスト（variant=signpost/bulletin_board/monument時） */
  text?: string;
}

/** 街のテーマカラー */
export interface TownTheme {
  /** プライマリカラー（建物屋根等） */
  primary: string;
  /** セカンダリカラー（アクセント） */
  secondary: string;
  /** 地面の色味 */
  groundTint: string;
  /** テーマ名 */
  themeName: string;
}

/** 全街のテーマカラー定義 */
export const TOWN_THEMES: Record<string, TownTheme> = {
  wasuremachi: {
    primary: "#8B7355",
    secondary: "#D4C5A9",
    groundTint: "#C8B88A",
    themeName: "素朴な丘の村",
  },
  "tsuchigumo-village": {
    primary: "#4A7C3F",
    secondary: "#8FBC8F",
    groundTint: "#A8C890",
    themeName: "森の村",
  },
  "morinoha-town": {
    primary: "#6B8E23",
    secondary: "#9ACD32",
    groundTint: "#C4D79B",
    themeName: "農村",
  },
  "kawasemi-city": {
    primary: "#4682B4",
    secondary: "#87CEEB",
    groundTint: "#B0C4DE",
    themeName: "水辺の都市",
  },
  "raimei-pass": {
    primary: "#FFD700",
    secondary: "#FFA500",
    groundTint: "#D2B48C",
    themeName: "雷鳴の峠",
  },
  "tsukiyomi-village": {
    primary: "#9370DB",
    secondary: "#E6E6FA",
    groundTint: "#DCD0FF",
    themeName: "月の里",
  },
  "kurogane-city": {
    primary: "#708090",
    secondary: "#C0C0C0",
    groundTint: "#A9A9A9",
    themeName: "鋼の街",
  },
  "yaminomori-village": {
    primary: "#483D8B",
    secondary: "#6A5ACD",
    groundTint: "#696969",
    themeName: "闇の森の村",
  },
  "seirei-mountain": {
    primary: "#800080",
    secondary: "#DA70D6",
    groundTint: "#C0B0C0",
    themeName: "霊山",
  },
  "pokemon-league": {
    primary: "#B22222",
    secondary: "#FFD700",
    groundTint: "#D4A580",
    themeName: "壮大な城塞",
  },
};

/** 街ごとの装飾タイル配置 */
export const TOWN_DECORATIONS: Record<string, DecorationTile[]> = {
  wasuremachi: [
    { x: 4, y: 3, variant: "big_tree" },
    { x: 3, y: 7, variant: "well" },
    { x: 7, y: 4, variant: "mailbox" },
    { x: 6, y: 8, variant: "signpost", text: "南：ルート1 → ツチグモ村" },
  ],
  "tsuchigumo-village": [
    { x: 3, y: 2, variant: "tree" },
    { x: 6, y: 2, variant: "tree" },
    { x: 5, y: 5, variant: "flowerbed" },
    { x: 2, y: 7, variant: "signpost", text: "北：はじまりの森 / 南：ルート2" },
  ],
  "morinoha-town": [
    { x: 2, y: 3, variant: "field" },
    { x: 3, y: 3, variant: "field" },
    { x: 7, y: 5, variant: "flowerbed" },
    { x: 5, y: 2, variant: "bench" },
    { x: 8, y: 7, variant: "signpost", text: "モリノハの町 — 緑豊かな農村" },
  ],
  "kawasemi-city": [
    { x: 4, y: 4, variant: "fountain" },
    { x: 2, y: 6, variant: "pond" },
    { x: 7, y: 2, variant: "streetlight" },
    { x: 8, y: 5, variant: "bench" },
    { x: 5, y: 8, variant: "signpost", text: "カワセミシティ — 水辺の美しい町" },
  ],
  "raimei-pass": [
    { x: 3, y: 3, variant: "rock" },
    { x: 7, y: 5, variant: "rock" },
    { x: 5, y: 7, variant: "streetlight" },
    { x: 9, y: 2, variant: "signpost", text: "ライメイ峠 — 雷が響く峠道" },
  ],
  "tsukiyomi-village": [
    { x: 4, y: 3, variant: "statue" },
    { x: 2, y: 5, variant: "flowerbed" },
    { x: 7, y: 5, variant: "flowerbed" },
    { x: 5, y: 7, variant: "monument", text: "月読の碑：忘却なき者に月光あれ" },
  ],
  "kurogane-city": [
    { x: 3, y: 3, variant: "statue" },
    { x: 7, y: 3, variant: "streetlight" },
    { x: 5, y: 6, variant: "bench" },
    {
      x: 8,
      y: 8,
      variant: "bulletin_board",
      text: "クロガネ鍛冶組合：本日の鉄の市場価格 — 記憶の鉄鉱1kg 5000円",
    },
  ],
  "yaminomori-village": [
    { x: 3, y: 4, variant: "tree" },
    { x: 6, y: 2, variant: "rock" },
    { x: 4, y: 7, variant: "streetlight" },
    { x: 7, y: 6, variant: "monument", text: "闇の中に光を見出す者こそ、真の勇者なり" },
  ],
  "seirei-mountain": [
    { x: 4, y: 2, variant: "statue" },
    { x: 2, y: 5, variant: "rock" },
    { x: 7, y: 5, variant: "rock" },
    { x: 5, y: 8, variant: "monument", text: "この山に眠る魂よ、安らかに" },
  ],
  "pokemon-league": [
    { x: 5, y: 3, variant: "statue" },
    { x: 3, y: 5, variant: "streetlight" },
    { x: 7, y: 5, variant: "streetlight" },
    { x: 5, y: 10, variant: "monument", text: "ポケモンリーグ — 勇者たちの殿堂" },
  ],
};

/**
 * 街のテーマを取得
 */
export function getTownTheme(mapId: string): TownTheme | undefined {
  return TOWN_THEMES[mapId];
}

/**
 * 街の装飾タイルを取得
 */
export function getTownDecorations(mapId: string): DecorationTile[] {
  return TOWN_DECORATIONS[mapId] ?? [];
}

/**
 * テーマ定義済みの街数
 */
export function getThemedTownCount(): number {
  return Object.keys(TOWN_THEMES).length;
}

/**
 * 装飾配置済みの街数
 */
export function getDecoratedTownCount(): number {
  return Object.keys(TOWN_DECORATIONS).length;
}
