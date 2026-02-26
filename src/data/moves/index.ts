/**
 * 技データのエントリーポイント
 */
import type { MoveDefinition } from "@/types";
import { EARLY_MOVES } from "./early-moves";
import { MID_LATE_MOVES } from "./mid-late-moves";

/** 全技データ（IDでキーイング） */
export const ALL_MOVES: Record<string, MoveDefinition> = {
  ...EARLY_MOVES,
  ...MID_LATE_MOVES,
};

/** IDから技を取得 */
export function getMoveById(id: string): MoveDefinition | undefined {
  return ALL_MOVES[id];
}

/** 全技IDの一覧 */
export function getAllMoveIds(): string[] {
  return Object.keys(ALL_MOVES);
}

export { EARLY_MOVES } from "./early-moves";
export { MID_LATE_MOVES } from "./mid-late-moves";
