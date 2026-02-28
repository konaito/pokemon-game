import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";
import type { BattleAction, BattlerState } from "../state-machine";

/** AI戦略レベル */
export type AiLevel = "random" | "basic" | "smart";

/** AIが技選択に使うコンテキスト */
export interface AiContext {
  /** 自分のアクティブモンスター */
  self: MonsterInstance;
  /** 自分の種族データ */
  selfSpecies: MonsterSpecies;
  /** 相手のアクティブモンスター */
  opponent: MonsterInstance;
  /** 相手の種族データ */
  opponentSpecies: MonsterSpecies;
  /** 使用可能な技一覧 */
  usableMoves: { move: MoveDefinition; index: number; currentPp: number }[];
  /** 自分のバトラー状態（パーティ参照用） */
  selfBattler: BattlerState;
  /** 乱数関数 */
  random: () => number;
}

/** AI戦略のインターフェース */
export interface AiStrategy {
  selectAction(context: AiContext): BattleAction;
}
