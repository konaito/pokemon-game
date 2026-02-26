/**
 * ゲーム全体で使用する基本型定義
 * 詳細な型定義は各Epicの実装時に追加する
 */

/** ゲームのトップレベル状態 */
export type GameState = "title" | "overworld" | "battle" | "menu" | "dialogue" | "cutscene";

/** モンスターのタイプ（具体的なタイプはEpic 2で定義） */
export type TypeId = string;

/** 一意な識別子 */
export type MonsterId = string;
export type MoveId = string;
export type ItemId = string;
export type MapId = string;
