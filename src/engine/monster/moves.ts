import type { MonsterInstance, MoveId, MoveDefinition, MonsterSpecies } from "@/types";

const MAX_MOVES = 4;

/**
 * レベルアップ時に習得可能な技をチェック
 * @returns 習得可能な技のリスト
 */
export function getLearnableMoves(
  species: MonsterSpecies,
  oldLevel: number,
  newLevel: number,
): { level: number; moveId: MoveId }[] {
  return species.learnset.filter((entry) => entry.level > oldLevel && entry.level <= newLevel);
}

/**
 * 技を習得する（4枠未満なら自動追加）
 * @returns "learned" = 覚えた, "full" = 技枠が満杯で選択が必要
 */
export function learnMove(
  monster: MonsterInstance,
  moveId: MoveId,
  moveDef: MoveDefinition,
): "learned" | "full" {
  // 既に覚えている場合はスキップ
  if (monster.moves.some((m) => m.moveId === moveId)) {
    return "learned";
  }

  if (monster.moves.length < MAX_MOVES) {
    monster.moves.push({ moveId, currentPp: moveDef.pp });
    return "learned";
  }

  return "full";
}

/**
 * 既存の技を忘れて新しい技を覚える
 * @param slotIndex 忘れる技のインデックス (0-3)
 */
export function replaceMove(
  monster: MonsterInstance,
  slotIndex: number,
  newMoveId: MoveId,
  newMoveDef: MoveDefinition,
): { forgottenMoveId: MoveId } {
  if (slotIndex < 0 || slotIndex >= monster.moves.length) {
    throw new Error("無効な技スロット");
  }
  const forgotten = monster.moves[slotIndex].moveId;
  monster.moves[slotIndex] = { moveId: newMoveId, currentPp: newMoveDef.pp };
  return { forgottenMoveId: forgotten };
}
