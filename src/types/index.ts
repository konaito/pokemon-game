/**
 * ゲーム全体で使用する基本型定義
 */

/** ゲームのトップレベル状態 */
export type GamePhase = "title" | "overworld" | "battle" | "menu" | "dialogue" | "cutscene";

/** 一意な識別子 */
export type MonsterId = string;
export type MoveId = string;
export type ItemId = string;
export type MapId = string;

/** 性格ID（25種類） */
export type NatureId =
  | "hardy"
  | "lonely"
  | "brave"
  | "adamant"
  | "naughty"
  | "bold"
  | "docile"
  | "relaxed"
  | "impish"
  | "lax"
  | "timid"
  | "hasty"
  | "serious"
  | "jolly"
  | "naive"
  | "modest"
  | "mild"
  | "quiet"
  | "bashful"
  | "rash"
  | "calm"
  | "gentle"
  | "sassy"
  | "careful"
  | "quirky";

/** 経験値グループ */
export type ExpGroup = "fast" | "medium_fast" | "medium_slow" | "slow";

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
  baseExpYield: number;
  expGroup: ExpGroup;
  learnset: { level: number; moveId: MoveId }[];
  evolvesTo?: { id: MonsterId; level: number; condition?: string }[];
}

/** 個体としてのモンスター */
export interface MonsterInstance {
  uid: string;
  speciesId: MonsterId;
  nickname?: string;
  level: number;
  exp: number;
  nature: NatureId;
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

/** アイテムカテゴリ */
export type ItemCategory = "ball" | "medicine" | "battle" | "key";

/** アイテム定義 */
export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  /** バトル中に使用可能か */
  usableInBattle: boolean;
  /** 効果（アイテム種別ごとに異なる） */
  effect: ItemEffect;
}

/** アイテム効果 */
export type ItemEffect =
  | { type: "heal_hp"; amount: number }
  | { type: "heal_status"; status: StatusCondition | "all" }
  | { type: "heal_pp"; amount: number | "all" }
  | { type: "ball"; catchRateModifier: number }
  | { type: "evolution"; evolutionItemId: string }
  | { type: "none" };

/** バッグ内のアイテム（個数管理） */
export interface BagItem {
  itemId: ItemId;
  quantity: number;
}

/** プレイヤーのバッグ */
export interface Bag {
  items: BagItem[];
}

/** パーティ + ボックスの管理 */
export interface PartyState {
  /** 手持ち（最大6匹） */
  party: MonsterInstance[];
  /** ボックス（預かりシステム） */
  boxes: MonsterInstance[][];
}

/** 種族データを引けるリゾルバ */
export type SpeciesResolver = (speciesId: string) => MonsterSpecies;
/** 技データを引けるリゾルバ */
export type MoveResolver = (moveId: string) => MoveDefinition;
