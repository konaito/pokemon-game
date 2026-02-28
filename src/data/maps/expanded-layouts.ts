/**
 * 街マップの拡張レイアウト定義
 *
 * 各街に個性的なサイズ・レイアウトを持たせるためのデータ。
 * 実際のマップに適用する際は connections の座標も合わせて更新する。
 */
import type { TileType } from "@/engine/map/map-data";

const W: TileType = "wall";
const G: TileType = "ground";
const T: TileType = "grass";
const R: TileType = "water";
const D: TileType = "door";
const S: TileType = "sign";

/** 拡張マップレイアウト */
export interface ExpandedLayout {
  /** マップID */
  mapId: string;
  /** 街名 */
  name: string;
  /** レイアウトの説明 */
  description: string;
  /** 幅 */
  width: number;
  /** 高さ */
  height: number;
  /** タイルデータ */
  tiles: TileType[][];
  /** レイアウトの特徴タグ */
  features: LayoutFeature[];
  /** 水タイルの用途 */
  waterUsage?: string;
  /** 草タイルの用途 */
  grassUsage?: string;
}

/** レイアウトの特徴 */
export type LayoutFeature =
  | "hilltop"
  | "forest_surround"
  | "farmland"
  | "urban_grid"
  | "volcanic"
  | "dojo"
  | "misty"
  | "snowy"
  | "harbor"
  | "fortress"
  | "fountain"
  | "pond"
  | "elevation"
  | "park"
  | "winding_path";

// ===== ワスレ町（12×12）丘の上の小さな村 =====
export const WASUREMACHI_EXPANDED: ExpandedLayout = {
  mapId: "wasuremachi",
  name: "ワスレ町",
  description: "丘の上の小さな村。高低差を壁で表現し、中央に大きな木がある。",
  width: 12,
  height: 12,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11
    [W, W, W, W, W, W, W, W, W, W, W, W], // y=0: 北壁
    [W, G, G, G, T, T, T, T, G, G, G, W], // y=1: 花壇帯
    [W, G, D, W, G, G, G, G, W, D, G, W], // y=2: 博士の家(左), 民家(右)
    [W, G, G, W, G, G, G, G, W, G, G, W], // y=3:
    [W, G, G, G, G, W, W, G, G, G, G, W], // y=4: 中央の大木
    [G, G, G, G, G, W, W, G, G, G, G, G], // y=5: 東西通路
    [G, G, G, G, G, G, G, G, G, G, G, G], // y=6: メイン通り
    [W, G, D, W, G, G, G, G, W, D, W, W], // y=7: 回復センター(左), ジム(右)
    [W, G, G, W, G, R, R, G, W, G, W, W], // y=8: 小さな池
    [W, G, G, G, G, R, R, G, G, G, G, W], // y=9: 池の周り
    [W, W, G, G, G, G, G, G, G, G, W, W], // y=10: 南の丘
    [W, W, W, W, W, G, G, W, W, W, W, W], // y=11: 南出口
  ],
  features: ["hilltop", "pond", "elevation"],
  waterUsage: "村の中央にある小さな思い出の池",
  grassUsage: "丘の上に咲く忘れな草の花壇",
};

// ===== ツチグモ村（10×12）森に囲まれた村 =====
export const TSUCHIGUMO_EXPANDED: ExpandedLayout = {
  mapId: "tsuchigumo-village",
  name: "ツチグモ村",
  description: "森に囲まれた村。周囲にgrass帯、木々が多い自然豊かな雰囲気。",
  width: 10,
  height: 12,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9
    [W, W, W, W, W, G, G, W, W, W], // y=0: 北入口
    [W, T, T, G, G, G, G, G, T, W], // y=1: 森の縁
    [T, T, G, G, G, G, G, G, T, T], // y=2: 木々に囲まれた道
    [W, G, D, W, G, G, G, G, G, W], // y=3: 村長の家
    [W, G, G, W, G, G, G, W, D, W], // y=4: ジム
    [G, G, G, G, G, T, G, W, G, W], // y=5: 村の広場
    [G, G, G, G, T, T, T, G, G, G], // y=6: 木漏れ日の広場
    [W, G, D, W, G, T, G, G, G, W], // y=7: 回復センター
    [W, G, G, W, G, G, G, W, G, W], // y=8:
    [W, T, G, G, G, G, G, G, T, W], // y=9: 森の縁
    [W, T, T, G, G, G, G, T, T, W], // y=10: 森の深い部分
    [W, W, W, W, G, G, W, W, W, W], // y=11: 南出口
  ],
  features: ["forest_surround"],
  grassUsage: "村を取り囲む豊かな森の草木。虫モンスターが好む",
};

// ===== モリノハの町（14×12）横に広い農村 =====
export const MORINOHA_EXPANDED: ExpandedLayout = {
  mapId: "morinoha-town",
  name: "モリノハの町",
  description: "横に広い農村。畑エリアとゆったりした道が特徴。",
  width: 14,
  height: 12,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11 12 13
    [W, W, W, W, W, G, G, W, W, W, W, W, W, W], // y=0: 北入口
    [W, G, G, G, G, G, G, G, G, T, T, T, G, W], // y=1: 畑エリア(東)
    [W, G, D, W, G, G, G, G, G, T, T, T, G, W], // y=2: 民家(左)
    [W, G, G, W, G, G, G, G, G, T, T, T, G, W], // y=3:
    [W, G, G, G, G, G, S, G, G, G, G, G, G, W], // y=4: 看板
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G], // y=5: メイン通り
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G], // y=6: メイン通り
    [W, G, D, W, G, G, G, G, W, D, W, G, G, W], // y=7: 回復センター, ジム
    [W, G, G, W, G, G, G, G, W, G, W, G, G, W], // y=8:
    [W, G, G, G, G, R, G, G, G, G, G, T, T, W], // y=9: 小川と花壇
    [W, G, G, G, G, R, G, G, G, G, G, T, T, W], // y=10:
    [W, W, W, W, G, G, W, W, W, W, W, W, W, W], // y=11: 南出口
  ],
  features: ["farmland"],
  waterUsage: "畑を潤す小川",
  grassUsage: "町の東側に広がる畑。住民の大切な食料源",
};

// ===== イナヅマシティ（16×14）大都市 =====
export const INAZUMA_EXPANDED: ExpandedLayout = {
  mapId: "inazuma-city",
  name: "イナヅマシティ",
  description: "大都市。碁盤目状の道路と多くの建物が並ぶ活気ある街。",
  width: 16,
  height: 14,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
    [W, W, W, W, W, G, G, W, W, W, W, W, W, W, W, W], // y=0: 北入口
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=1:
    [W, G, D, W, G, G, G, G, W, D, W, G, W, D, G, W], // y=2: デパート,研究所,民家
    [W, G, G, W, G, G, G, G, W, G, W, G, W, G, G, W], // y=3:
    [W, G, G, G, G, G, S, G, G, G, G, G, G, G, G, W], // y=4: 看板
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // y=5: メイン通り
    [G, G, G, G, G, R, R, G, G, G, G, G, G, G, G, G], // y=6: 噴水広場
    [W, G, G, G, G, R, R, G, G, G, G, G, G, G, G, W], // y=7: 噴水
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=8:
    [W, G, D, W, G, G, G, G, W, D, W, G, W, D, G, W], // y=9: 回復センター,ジム,ショップ
    [W, G, G, W, G, G, G, G, W, G, W, G, W, G, G, W], // y=10:
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=11:
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=12:
    [W, W, W, W, G, G, W, W, W, W, W, W, W, W, W, W], // y=13: 南出口
  ],
  features: ["urban_grid", "fountain"],
  waterUsage: "街の中央にある噴水広場。待ち合わせスポット",
};

// ===== カガリ市（14×14）火山のふもとの温泉街 =====
export const KAGARI_EXPANDED: ExpandedLayout = {
  mapId: "kagari-city",
  name: "カガリ市",
  description: "火山のふもとの温泉街。L字型の道と段差が特徴。",
  width: 14,
  height: 14,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11 12 13
    [W, W, W, W, W, G, G, W, W, W, W, W, W, W], // y=0: 北入口
    [W, G, G, G, G, G, G, G, W, W, W, W, W, W], // y=1: 段上（北西）
    [W, G, D, W, G, G, G, G, W, W, W, W, W, W], // y=2: 温泉宿
    [W, G, G, W, G, G, G, G, G, G, G, G, G, W], // y=3: 段差の道
    [W, G, G, G, G, G, S, G, G, G, G, G, G, W], // y=4: 看板
    [G, G, G, G, G, G, G, G, G, R, R, G, G, W], // y=5: 温泉池
    [G, G, G, G, G, G, G, G, G, R, R, G, G, W], // y=6:
    [W, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=7:
    [W, G, D, W, G, G, G, G, G, G, W, D, G, W], // y=8: 回復センター,ジム
    [W, G, G, W, G, G, G, G, G, G, W, G, G, W], // y=9:
    [W, W, W, W, G, G, G, G, G, G, G, G, G, W], // y=10: 段下（南東）
    [W, W, W, W, G, G, G, T, T, G, G, G, G, W], // y=11: 火山灰の草地
    [W, W, W, W, G, G, G, T, T, G, G, G, G, W], // y=12:
    [W, W, W, W, W, G, G, W, W, W, W, W, W, W], // y=13: 南出口
  ],
  features: ["volcanic", "elevation"],
  waterUsage: "火山の地熱で温められた天然温泉",
  grassUsage: "火山灰が積もった地面に生える耐熱性の草",
};

// ===== ゴウキの町（12×14）山あいの武道の町 =====
export const GOUKI_EXPANDED: ExpandedLayout = {
  mapId: "gouki-town",
  name: "ゴウキの町",
  description: "山あいの武道の町。中央に修行場があり、石畳の道が続く。",
  width: 12,
  height: 14,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11
    [W, W, W, W, W, G, G, W, W, W, W, W], // y=0: 北入口
    [W, G, G, G, G, G, G, G, G, G, G, W], // y=1:
    [W, G, D, W, G, G, G, G, W, D, G, W], // y=2: 長老の家, 道場
    [W, G, G, W, G, G, G, G, W, G, G, W], // y=3:
    [W, G, G, G, G, G, G, G, G, G, G, W], // y=4:
    [G, G, G, G, W, W, W, W, G, G, G, G], // y=5: 修行場（壁で囲い）
    [G, G, G, G, W, G, G, W, G, G, G, G], // y=6: 修行場内部
    [W, G, G, G, W, G, G, W, G, G, G, W], // y=7:
    [W, G, G, G, W, W, D, W, G, G, G, W], // y=8: 修行場入口
    [W, G, G, G, G, G, G, G, G, G, G, W], // y=9:
    [W, G, D, W, G, G, G, G, G, S, G, W], // y=10: 回復センター, 看板
    [W, G, G, W, G, G, G, G, G, G, G, W], // y=11:
    [W, G, G, G, G, G, G, G, G, G, G, W], // y=12:
    [W, W, W, W, G, G, W, W, W, W, W, W], // y=13: 南出口
  ],
  features: ["dojo", "elevation"],
};

// ===== キリフリ村（12×12）霧に包まれた古い村 =====
export const KIRIFURI_EXPANDED: ExpandedLayout = {
  mapId: "kirifuri-village",
  name: "キリフリ村",
  description: "霧に包まれた古い村。墓地エリアと曲がりくねった道が特徴。",
  width: 12,
  height: 12,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11
    [W, W, W, W, W, G, G, W, W, W, W, W], // y=0: 北入口
    [W, G, G, G, G, G, G, G, G, G, G, W], // y=1:
    [W, G, D, W, G, G, G, W, S, W, G, W], // y=2: 占いの館, 墓地看板
    [W, G, G, W, G, G, G, W, G, W, G, W], // y=3:
    [W, G, G, G, G, G, G, W, G, W, G, W], // y=4: 墓地エリア（東）
    [G, G, G, G, G, G, G, G, G, G, G, G], // y=5: 曲がり道
    [W, G, G, W, W, G, G, G, G, G, G, G], // y=6: 段差
    [W, G, G, G, G, G, G, G, G, G, G, W], // y=7:
    [W, G, D, W, G, G, G, G, W, D, G, W], // y=8: 回復センター, ジム
    [W, G, G, W, G, G, G, G, W, G, G, W], // y=9:
    [W, G, G, G, G, T, T, G, G, G, G, W], // y=10: 古い草地
    [W, W, W, W, G, G, W, W, W, W, W, W], // y=11: 南出口
  ],
  features: ["misty", "winding_path"],
  grassUsage: "手入れされず生い茂った古い墓地の草",
};

// ===== フユハの町（14×12）雪国の町 =====
export const FUYUHA_EXPANDED: ExpandedLayout = {
  mapId: "fuyuha-town",
  name: "フユハの町",
  description: "雪国の町。凍った池があり、家が密集している。",
  width: 14,
  height: 12,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11 12 13
    [W, W, W, W, W, G, G, W, W, W, W, W, W, W], // y=0: 北入口
    [W, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=1:
    [W, G, D, W, G, G, G, G, W, D, G, W, D, W], // y=2: 民家,ショップ,毛糸屋
    [W, G, G, W, G, G, G, G, W, G, G, W, G, W], // y=3:
    [W, G, G, G, G, R, R, R, G, G, G, G, G, W], // y=4: 凍った池
    [G, G, G, G, G, R, R, R, G, G, G, G, G, G], // y=5: 池の中央
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G], // y=6: メイン通り
    [W, G, D, W, G, G, S, G, G, W, D, W, G, W], // y=7: 回復センター,ジム
    [W, G, G, W, G, G, G, G, G, W, G, W, G, W], // y=8:
    [W, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=9:
    [W, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=10:
    [W, W, W, W, G, G, W, W, W, W, W, W, W, W], // y=11: 南出口
  ],
  features: ["snowy", "pond"],
  waterUsage: "冬に凍る湖。スケートの名所でもある",
};

// ===== タツミシティ（18×16）最大の港湾都市 =====
export const TATSUMI_EXPANDED: ExpandedLayout = {
  mapId: "tatsumi-city",
  name: "タツミシティ",
  description: "最大の港湾都市。港エリアと商業区・住宅区が分かれている。",
  width: 18,
  height: 16,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17
    [W, W, W, W, W, G, G, W, W, W, W, W, W, W, W, W, W, W], // y=0:  北入口
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=1:
    [W, G, D, W, G, G, G, G, W, D, W, G, G, W, D, G, G, W], // y=2:  造船所,図書館,交易所
    [W, G, G, W, G, G, G, G, W, G, W, G, G, W, G, G, G, W], // y=3:
    [W, G, G, G, G, G, S, G, G, G, G, G, G, G, G, G, G, W], // y=4:  看板
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // y=5:  メイン通り
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // y=6:  メイン通り
    [W, G, D, W, G, G, G, G, W, D, W, G, G, W, D, G, G, W], // y=7:  回復センター,ジム,ショップ
    [W, G, G, W, G, G, G, G, W, G, W, G, G, W, G, G, G, W], // y=8:
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=9:
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, W], // y=10:
    [W, W, W, G, G, G, G, G, G, G, G, G, G, G, G, W, W, W], // y=11: 港エリア境界
    [W, R, R, R, R, G, G, R, R, R, R, G, G, R, R, R, R, W], // y=12: 港の桟橋
    [W, R, R, R, R, G, G, R, R, R, R, G, G, R, R, R, R, W], // y=13: 港
    [W, R, R, R, R, G, G, R, R, R, R, G, G, R, R, R, R, W], // y=14: 海
    [W, W, W, W, W, G, G, W, W, W, W, W, W, W, W, W, W, W], // y=15: 南出口
  ],
  features: ["harbor", "urban_grid"],
  waterUsage: "港と海。大陸との交易の要衝",
};

// ===== ポケモンリーグ（12×16）壮大な城塞 =====
export const LEAGUE_EXPANDED: ExpandedLayout = {
  mapId: "pokemon-league",
  name: "ポケモンリーグ",
  description: "壮大な城塞。長い通路と荘厳な構造が挑戦者を待ち受ける。",
  width: 12,
  height: 16,
  tiles: [
    //  0  1  2  3  4  5  6  7  8  9  10 11
    [W, W, W, W, W, G, G, W, W, W, W, W], // y=0:  入口
    [W, W, G, G, G, G, G, G, G, G, W, W], // y=1:  入口の間
    [W, W, G, G, G, G, G, G, G, G, W, W], // y=2:
    [W, W, W, W, G, G, G, G, W, W, W, W], // y=3:  細い通路
    [W, W, G, G, G, G, G, G, G, G, W, W], // y=4:  四天王1の間
    [W, W, W, W, G, G, G, G, W, W, W, W], // y=5:  通路
    [W, W, G, G, G, G, G, G, G, G, W, W], // y=6:  四天王2の間
    [W, W, W, W, G, G, G, G, W, W, W, W], // y=7:  通路
    [W, W, G, G, G, G, G, G, G, G, W, W], // y=8:  四天王3の間
    [W, W, W, W, G, G, G, G, W, W, W, W], // y=9:  通路
    [W, W, G, G, G, G, G, G, G, G, W, W], // y=10: 四天王4の間
    [W, W, W, W, G, G, G, G, W, W, W, W], // y=11: 通路
    [W, R, R, G, G, G, G, G, G, R, R, W], // y=12: チャンピオンの間（装飾水路）
    [W, R, R, G, G, G, G, G, G, R, R, W], // y=13:
    [W, G, G, G, G, G, G, G, G, G, G, W], // y=14: 回復地点
    [W, W, W, W, W, W, W, W, W, W, W, W], // y=15: 奥壁
  ],
  features: ["fortress", "fountain"],
  waterUsage: "チャンピオンの間を囲む装飾水路",
};

/** 全拡張レイアウト */
export const EXPANDED_LAYOUTS: Record<string, ExpandedLayout> = {
  wasuremachi: WASUREMACHI_EXPANDED,
  "tsuchigumo-village": TSUCHIGUMO_EXPANDED,
  "morinoha-town": MORINOHA_EXPANDED,
  "inazuma-city": INAZUMA_EXPANDED,
  "kagari-city": KAGARI_EXPANDED,
  "gouki-town": GOUKI_EXPANDED,
  "kirifuri-village": KIRIFURI_EXPANDED,
  "fuyuha-town": FUYUHA_EXPANDED,
  "tatsumi-city": TATSUMI_EXPANDED,
  "pokemon-league": LEAGUE_EXPANDED,
};

/** 拡張レイアウトを取得 */
export function getExpandedLayout(mapId: string): ExpandedLayout | undefined {
  return EXPANDED_LAYOUTS[mapId];
}

/** 拡張レイアウト数を取得 */
export function getExpandedLayoutCount(): number {
  return Object.keys(EXPANDED_LAYOUTS).length;
}

/** 指定の特徴を持つレイアウトを検索 */
export function getLayoutsByFeature(feature: LayoutFeature): ExpandedLayout[] {
  return Object.values(EXPANDED_LAYOUTS).filter((l) => l.features.includes(feature));
}

/** レイアウトが正しいタイル配列を持っているか検証 */
export function validateLayout(layout: ExpandedLayout): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (layout.tiles.length !== layout.height) {
    errors.push(`タイル行数が不正: expected ${layout.height}, got ${layout.tiles.length}`);
  }

  for (let y = 0; y < layout.tiles.length; y++) {
    if (layout.tiles[y].length !== layout.width) {
      errors.push(`行${y}の列数が不正: expected ${layout.width}, got ${layout.tiles[y].length}`);
    }
  }

  // 出入口（端の非壁タイル）が存在するか確認
  const hasEntrance =
    layout.tiles[0].some((t) => t !== "wall") ||
    layout.tiles[layout.height - 1].some((t) => t !== "wall") ||
    layout.tiles.some((row) => row[0] !== "wall") ||
    layout.tiles.some((row) => row[layout.width - 1] !== "wall");

  if (!hasEntrance) {
    errors.push("出入口がありません");
  }

  return { valid: errors.length === 0, errors };
}

/** 水タイル・草タイルの使用数を取得 */
export function countDecorativeTiles(layout: ExpandedLayout): { water: number; grass: number } {
  let water = 0;
  let grass = 0;
  for (const row of layout.tiles) {
    for (const tile of row) {
      if (tile === "water") water++;
      if (tile === "grass") grass++;
    }
  }
  return { water, grass };
}
