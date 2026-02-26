/**
 * ゲーム全体で使用する基本型定義
 */

/** ゲームのトップレベル状態 */
export type GameState = "title" | "overworld" | "battle" | "menu" | "dialogue" | "cutscene";

/** 一意な識別子 */
export type MonsterId = string;
export type MoveId = string;
export type ItemId = string;
export type MapId = string;

/** タイプID */
export type TypeId =
  | "normal"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

/** 種族値 */
export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

/** 個体値 (0-31) */
export type IVs = BaseStats;

/** 努力値 (0-252, 合計510上限) */
export type EVs = BaseStats;

/** モンスター種族（図鑑データ） */
export interface MonsterSpecies {
  id: MonsterId;
  name: string;
  types: [TypeId] | [TypeId, TypeId];
  baseStats: BaseStats;
  learnset: { level: number; moveId: MoveId }[];
  evolvesTo?: { id: MonsterId; level: number };
}

/** 個体としてのモンスター */
export interface MonsterInstance {
  speciesId: MonsterId;
  nickname?: string;
  level: number;
  exp: number;
  ivs: IVs;
  evs: EVs;
  currentHp: number;
  moves: MoveInstance[];
  status: StatusCondition | null;
}

/** 技のインスタンス（PP管理付き） */
export interface MoveInstance {
  moveId: MoveId;
  currentPp: number;
}

/** 技の定義 */
export interface MoveDefinition {
  id: MoveId;
  name: string;
  type: TypeId;
  category: "physical" | "special" | "status";
  power: number | null;
  accuracy: number;
  pp: number;
  priority: number;
  effect?: MoveEffect;
}

/** 技の追加効果 */
export interface MoveEffect {
  statusCondition?: StatusCondition;
  statusChance?: number;
  statChanges?: Partial<Record<keyof BaseStats, number>>;
}

/** 状態異常 */
export type StatusCondition = "poison" | "burn" | "paralysis" | "sleep" | "freeze";

/** タイプ相性の倍率 */
export type TypeEffectiveness = 0 | 0.5 | 1 | 2;
