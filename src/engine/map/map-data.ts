import type { MapId, MonsterId } from "@/types";
import type { FlagRequirement } from "@/engine/state/story-flags";

/** タイルの種類 */
export type TileType = "ground" | "wall" | "grass" | "water" | "ledge" | "door" | "sign";

/** タイル1マスのデータ */
export interface Tile {
  type: TileType;
  /** 通行可能か */
  walkable: boolean;
  /** エンカウント発生するか */
  encounter: boolean;
}

/** マップ接続情報 */
export interface MapConnection {
  /** 接続先マップID */
  targetMapId: MapId;
  /** 接続先座標 */
  targetX: number;
  targetY: number;
  /** 接続元の座標範囲（ドアや出入口の位置） */
  sourceX: number;
  sourceY: number;
}

/** 野生モンスター出現テーブルのエントリ */
export interface EncounterEntry {
  speciesId: MonsterId;
  /** 出現レベル範囲 */
  minLevel: number;
  maxLevel: number;
  /** 出現率の重み（合計100） */
  weight: number;
}

/** 条件付きダイアログ — ストーリーフラグに基づいて分岐 */
export interface ConditionalDialogue {
  /** この条件を満たす場合にこのダイアログを使用 */
  condition: FlagRequirement;
  /** 条件を満たした場合のダイアログテキスト */
  dialogue: string[];
}

/** NPC会話完了時に発火するイベント */
export interface NpcEvent {
  /** 設定するフラグ */
  setFlags?: Record<string, boolean>;
  /** 回復イベント */
  heal?: boolean;
  /** アイテム付与 */
  giveItem?: { itemId: string; quantity: number };
}

/** NPC定義 */
export interface NpcDefinition {
  id: string;
  name: string;
  x: number;
  y: number;
  /** デフォルト会話テキスト（配列で複数ページ） */
  dialogue: string[];
  /** 条件付きダイアログ（上から順に評価、最初に条件を満たしたものを使用） */
  conditionalDialogues?: ConditionalDialogue[];
  /** トレーナーとして戦闘するか */
  isTrainer: boolean;
  /** 会話完了時に実行するイベント */
  onInteract?: NpcEvent;
  /** このNPCが出現するための条件（未設定なら常に出現） */
  appearCondition?: FlagRequirement;
}

/** マップ定義 */
export interface MapDefinition {
  id: MapId;
  name: string;
  width: number;
  height: number;
  /** タイルデータ（height × width の2次元配列） */
  tiles: TileType[][];
  /** マップ間接続 */
  connections: MapConnection[];
  /** 野生モンスター出現テーブル */
  encounters: EncounterEntry[];
  /** エンカウント発生率（0-100、草むらに入った時の判定確率） */
  encounterRate: number;
  /** NPC一覧 */
  npcs: NpcDefinition[];
}

/** タイルの基本属性マップ */
const TILE_PROPERTIES: Record<TileType, Pick<Tile, "walkable" | "encounter">> = {
  ground: { walkable: true, encounter: false },
  wall: { walkable: false, encounter: false },
  grass: { walkable: true, encounter: true },
  water: { walkable: false, encounter: false },
  ledge: { walkable: true, encounter: false },
  door: { walkable: true, encounter: false },
  sign: { walkable: false, encounter: false },
};

/** タイル種別から属性を取得 */
export function getTileProperties(type: TileType): Tile {
  return { type, ...TILE_PROPERTIES[type] };
}

/** マップ上の指定座標のタイルを取得 */
export function getTileAt(map: MapDefinition, x: number, y: number): Tile | null {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) return null;
  return getTileProperties(map.tiles[y][x]);
}

/** 指定座標が通行可能か判定 */
export function isWalkable(map: MapDefinition, x: number, y: number): boolean {
  const tile = getTileAt(map, x, y);
  return tile !== null && tile.walkable;
}

/** 指定座標にあるマップ接続を取得 */
export function getConnectionAt(map: MapDefinition, x: number, y: number): MapConnection | null {
  return map.connections.find((c) => c.sourceX === x && c.sourceY === y) ?? null;
}
