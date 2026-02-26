import type { GameState } from "./game-state";
import { saveGame } from "./save-data";

/** オートセーブ用の専用スロット（スロット0を使用） */
export const AUTOSAVE_SLOT = 0;

/** オートセーブのデバウンス間隔（ミリ秒） */
export const AUTOSAVE_DEBOUNCE_MS = 5000;

/** オートセーブ対象のアクション種別 */
export type AutosaveTrigger =
  | "battle_end"
  | "map_transition"
  | "healing"
  | "starter_selected"
  | "item_obtained";

/**
 * オートセーブを実行
 * @returns 成功したら true
 */
export function performAutosave(state: GameState, playTime: number = 0): boolean {
  if (!state.player) return false;
  if (state.screen === "title" || state.screen === "starter_select") return false;
  return saveGame(state, AUTOSAVE_SLOT, playTime);
}

/**
 * デバウンス付きオートセーブマネージャ
 * 短時間に複数回呼ばれても最後の1回だけ実行する
 */
export function createAutosaveManager() {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let playTimeSeconds = 0;
  let playTimeInterval: ReturnType<typeof setInterval> | null = null;

  return {
    /** プレイ時間の計測を開始 */
    startTimer() {
      if (playTimeInterval) return;
      playTimeInterval = setInterval(() => {
        playTimeSeconds++;
      }, 1000);
    },

    /** プレイ時間の計測を停止 */
    stopTimer() {
      if (playTimeInterval) {
        clearInterval(playTimeInterval);
        playTimeInterval = null;
      }
    },

    /** 現在のプレイ時間（秒）を取得 */
    getPlayTime(): number {
      return playTimeSeconds;
    },

    /** プレイ時間を復元（ロード時に使用） */
    setPlayTime(seconds: number) {
      playTimeSeconds = seconds;
    },

    /** デバウンス付きオートセーブをスケジュール */
    schedule(state: GameState): void {
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        performAutosave(state, playTimeSeconds);
        timerId = null;
      }, AUTOSAVE_DEBOUNCE_MS);
    },

    /** 即時実行（画面遷移前など） */
    saveNow(state: GameState): boolean {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      return performAutosave(state, playTimeSeconds);
    },

    /** クリーンアップ */
    destroy() {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      this.stopTimer();
    },
  };
}
