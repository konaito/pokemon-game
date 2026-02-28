import type { MonsterInstance, ItemId, WeatherId } from "@/types";
import { createStatStages, type StatStages } from "./stat-stage";
import { createWeatherState, type WeatherState } from "./weather";

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
  /** アクティブモンスターの能力変化ステージ（交代時にリセット） */
  statStages: StatStages;
}

/** バトル全体の状態 */
export interface BattleState {
  phase: BattlePhase;
  battleType: BattleType;
  player: BattlerState;
  opponent: BattlerState;
  turnNumber: number;
  /** 逃走試行回数 */
  escapeAttempts: number;
  /** 直近のメッセージログ */
  messages: string[];
  /** バトル結果（終了時のみ） */
  result: BattleResult | null;
  /** 天候状態 */
  weather: WeatherState;
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
  defaultWeather: WeatherId = "clear",
): BattleState {
  const playerStartIndex = playerParty.findIndex((m) => m.currentHp > 0);
  const opponentStartIndex = opponentParty.findIndex((m) => m.currentHp > 0);

  return {
    phase: "action_select",
    battleType,
    player: {
      party: playerParty,
      activeIndex: playerStartIndex !== -1 ? playerStartIndex : 0,
      statStages: createStatStages(),
    },
    opponent: {
      party: opponentParty,
      activeIndex: opponentStartIndex !== -1 ? opponentStartIndex : 0,
      statStages: createStatStages(),
    },
    turnNumber: 1,
    escapeAttempts: 0,
    messages: [],
    result: null,
    weather: createWeatherState(defaultWeather),
  };
}

/** アクティブなモンスターを取得 */
export function getActiveMonster(battler: BattlerState): MonsterInstance {
  return battler.party[battler.activeIndex];
}
