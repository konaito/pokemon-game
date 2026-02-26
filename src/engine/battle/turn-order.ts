import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";
import { calcAllStats } from "@/engine/monster/stats";
import type { BattleAction } from "./state-machine";

export interface TurnAction {
  side: "player" | "opponent";
  action: BattleAction;
  monster: MonsterInstance;
  species: MonsterSpecies;
  move?: MoveDefinition;
}

/**
 * ターン内の行動順を決定する
 *
 * 優先度:
 * 1. 逃走・交代・アイテム使用は技より先
 * 2. 技の優先度（priority）が高い方が先
 * 3. 同優先度なら素早さが高い方が先
 * 4. 同速なら50%の確率で決定
 */
export function determineTurnOrder(
  playerAction: TurnAction,
  opponentAction: TurnAction,
  random?: () => number,
): [TurnAction, TurnAction] {
  const rng = random ?? Math.random;

  // 非バトルアクション（逃走・交代・アイテム）は常に先行
  const playerPriority = getActionPriority(playerAction);
  const opponentPriority = getActionPriority(opponentAction);

  if (playerPriority !== opponentPriority) {
    return playerPriority > opponentPriority
      ? [playerAction, opponentAction]
      : [opponentAction, playerAction];
  }

  // 技同士の場合: 技のpriority比較
  const playerMovePriority = playerAction.move?.priority ?? 0;
  const opponentMovePriority = opponentAction.move?.priority ?? 0;

  if (playerMovePriority !== opponentMovePriority) {
    return playerMovePriority > opponentMovePriority
      ? [playerAction, opponentAction]
      : [opponentAction, playerAction];
  }

  // 素早さ比較
  const playerSpeed = calcAllStats(
    playerAction.species.baseStats,
    playerAction.monster.ivs,
    playerAction.monster.evs,
    playerAction.monster.level,
  ).speed;

  const opponentSpeed = calcAllStats(
    opponentAction.species.baseStats,
    opponentAction.monster.ivs,
    opponentAction.monster.evs,
    opponentAction.monster.level,
  ).speed;

  if (playerSpeed !== opponentSpeed) {
    return playerSpeed > opponentSpeed
      ? [playerAction, opponentAction]
      : [opponentAction, playerAction];
  }

  // 同速: ランダム
  return rng() < 0.5 ? [playerAction, opponentAction] : [opponentAction, playerAction];
}

/** アクション種別による優先度（高い方が先に行動） */
function getActionPriority(action: TurnAction): number {
  switch (action.action.type) {
    case "run":
      return 3;
    case "switch":
      return 2;
    case "item":
      return 1;
    case "fight":
      return 0;
  }
}
