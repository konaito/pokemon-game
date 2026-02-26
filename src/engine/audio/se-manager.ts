/**
 * SE（効果音）管理システム (#79)
 * 攻撃、捕獲、レベルアップ、メニュー操作などのSEを管理する
 */

/** SE種別 */
export type SeCategory =
  | "battle" // 攻撃、ダメージ、被ダメ
  | "capture" // ボール投擲、揺れ、捕獲成功/失敗
  | "ui" // メニュー操作、カーソル移動、決定、キャンセル
  | "system" // レベルアップ、進化、回復、セーブ
  | "field"; // 扉、衝突、エンカウント

/** SE定義 */
export interface SeDefinition {
  id: string;
  name: string;
  category: SeCategory;
  src: string;
  /** デフォルト音量（0.0-1.0） */
  volume: number;
}

/** 組み込みSE ID（よく使うSEの定数） */
export const SE = {
  // バトル
  ATTACK_NORMAL: "se-attack-normal",
  ATTACK_SUPER: "se-attack-super",
  ATTACK_WEAK: "se-attack-weak",
  ATTACK_MISS: "se-attack-miss",
  DAMAGE: "se-damage",
  FAINT: "se-faint",
  // 捕獲
  BALL_THROW: "se-ball-throw",
  BALL_SHAKE: "se-ball-shake",
  CATCH_SUCCESS: "se-catch-success",
  CATCH_FAIL: "se-catch-fail",
  // UI
  CURSOR_MOVE: "se-cursor-move",
  CONFIRM: "se-confirm",
  CANCEL: "se-cancel",
  MENU_OPEN: "se-menu-open",
  MENU_CLOSE: "se-menu-close",
  // システム
  LEVEL_UP: "se-level-up",
  EVOLUTION: "se-evolution",
  HEAL: "se-heal",
  SAVE: "se-save",
  BADGE_GET: "se-badge-get",
  ITEM_GET: "se-item-get",
  // フィールド
  DOOR: "se-door",
  COLLISION: "se-collision",
  ENCOUNTER: "se-encounter",
} as const;

/** SEイベント（UIレイヤーに通知） */
export type SeEvent =
  | { type: "play"; seId: string; volume: number }
  | { type: "master_volume_change"; volume: number };

/**
 * SE管理マネージャー
 * BGMと同様、実際のオーディオ再生はUIレイヤーに委譲する
 */
export function createSeManager() {
  let masterVolume = 0.8;
  const eventLog: SeEvent[] = [];

  function emit(event: SeEvent) {
    eventLog.push(event);
  }

  return {
    /** マスターボリュームを取得 */
    getMasterVolume(): number {
      return masterVolume;
    },

    /** イベントログを取得（テスト用） */
    getEventLog(): SeEvent[] {
      return [...eventLog];
    },

    /** イベントログをクリア */
    clearEventLog() {
      eventLog.length = 0;
    },

    /**
     * SEを再生する
     * @param seId SE ID
     * @param volume 個別音量（0.0-1.0、マスターボリュームと乗算される）
     */
    play(seId: string, volume: number = 1.0): void {
      const effectiveVolume = Math.max(0, Math.min(1, volume * masterVolume));
      emit({ type: "play", seId, volume: effectiveVolume });
    },

    /** マスターボリュームを設定（0.0-1.0） */
    setMasterVolume(volume: number): void {
      masterVolume = Math.max(0, Math.min(1, volume));
      emit({ type: "master_volume_change", volume: masterVolume });
    },
  };
}

/**
 * タイプ相性からダメージSEを解決
 */
export function resolveDamageSe(effectiveness: number): string {
  if (effectiveness >= 2) return SE.ATTACK_SUPER;
  if (effectiveness > 0 && effectiveness < 1) return SE.ATTACK_WEAK;
  if (effectiveness === 0) return SE.ATTACK_MISS;
  return SE.ATTACK_NORMAL;
}

/**
 * 捕獲揺れ回数からSEシーケンスを生成
 */
export function generateCaptureSe(shakeCount: number, caught: boolean): string[] {
  const sequence: string[] = [SE.BALL_THROW];
  for (let i = 0; i < shakeCount; i++) {
    sequence.push(SE.BALL_SHAKE);
  }
  sequence.push(caught ? SE.CATCH_SUCCESS : SE.CATCH_FAIL);
  return sequence;
}
