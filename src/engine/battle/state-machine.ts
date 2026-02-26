import type { MonsterInstance, ItemId } from "@/types";

/**
 * バトルの状態遷移図:
 *
 * INIT → ACTION_SELECT → TURN_EXECUTE → TURN_RESULT
 *   ↑                                       ↓
 *   └──── ACTION_SELECT ◄──── CHECK_FAINT ◄─┘
 *                                  ↓
 *                          FORCE_SWITCH (瀕死時)
 *                                  ↓
 *                          BATTLE_END (全滅 or 捕獲 or 逃走)
 */
export type BattlePhase =
  | "init"
  | "action_select"
  | "turn_execute"
  | "turn_result"
  | "check_faint"
  | "force_switch"
  | "battle_end";

/** バトルの種別 */
export type BattleType = "wild" | "trainer";

/** プレイヤーが選択できるアクション */
export type BattleAction =
  | { type: "fight"; moveIndex: number }
  | { type: "item"; itemId: ItemId }
  | { type: "switch"; partyIndex: number }
  | { type: "run" };

/** バトルに参加するトレーナーの状態 */
export interface BattlerState {
  party: MonsterInstance[];
  activeIndex: number;
}

/** バトル全体の状態 */
export interface BattleState {
  phase: BattlePhase;
  battleType: BattleType;
  player: BattlerState;
  opponent: BattlerState;
  turnNumber: number;
  /** 直近のメッセージログ */
  messages: string[];
  /** バトル結果（終了時のみ） */
  result: BattleResult | null;
}

export type BattleResult =
  | { type: "win" }
  | { type: "lose" }
  | { type: "capture" }
  | { type: "run_success" }
  | { type: "run_fail" };

/** バトル状態の初期化 */
export function initBattle(
  playerParty: MonsterInstance[],
  opponentParty: MonsterInstance[],
  battleType: BattleType,
): BattleState {
  return {
    phase: "action_select",
    battleType,
    player: { party: playerParty, activeIndex: 0 },
    opponent: { party: opponentParty, activeIndex: 0 },
    turnNumber: 1,
    messages: [],
    result: null,
  };
}

/** アクティブなモンスターを取得 */
export function getActiveMonster(battler: BattlerState): MonsterInstance {
  return battler.party[battler.activeIndex];
}
