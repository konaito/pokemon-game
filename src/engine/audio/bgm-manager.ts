/**
 * BGM管理システム (#75)
 * 場面に応じたBGMの再生・切替・フェードを管理する
 */

/** BGMトラックの場面種別 */
export type BgmContext =
  | "title"
  | "overworld"
  | "battle_wild"
  | "battle_trainer"
  | "battle_gym"
  | "battle_elite"
  | "victory"
  | "healing"
  | "evolution"
  | "event";

/** BGMトラック定義 */
export interface BgmTrack {
  id: string;
  /** 表示名 */
  name: string;
  /** 場面種別 */
  context: BgmContext;
  /** 音声ファイルのパス（相対パス） */
  src: string;
  /** ループするか */
  loop: boolean;
  /** デフォルト音量（0.0-1.0） */
  volume: number;
}

/** BGMマネージャーの状態 */
export interface BgmState {
  currentTrackId: string | null;
  isPlaying: boolean;
  volume: number;
  isFading: boolean;
}

/** BGMマネージャーが発行するイベント */
export type BgmEvent =
  | { type: "play"; trackId: string }
  | { type: "stop" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "fade_out"; durationMs: number }
  | { type: "fade_in"; trackId: string; durationMs: number }
  | { type: "volume_change"; volume: number };

/**
 * BGMマネージャー
 * 実際のオーディオ再生はUIレイヤーに委譲し、ここではロジックのみを管理する
 */
export function createBgmManager() {
  let state: BgmState = {
    currentTrackId: null,
    isPlaying: false,
    volume: 0.7,
    isFading: false,
  };

  const eventLog: BgmEvent[] = [];

  function emit(event: BgmEvent) {
    eventLog.push(event);
  }

  return {
    /** 現在の状態を取得 */
    getState(): BgmState {
      return { ...state };
    },

    /** イベントログを取得（テスト用） */
    getEventLog(): BgmEvent[] {
      return [...eventLog];
    },

    /** イベントログをクリア */
    clearEventLog() {
      eventLog.length = 0;
    },

    /**
     * BGMを再生（現在のトラックと同じなら何もしない）
     */
    play(trackId: string): void {
      if (state.currentTrackId === trackId && state.isPlaying) return;

      if (state.currentTrackId && state.currentTrackId !== trackId) {
        emit({ type: "stop" });
      }

      state = {
        ...state,
        currentTrackId: trackId,
        isPlaying: true,
        isFading: false,
      };
      emit({ type: "play", trackId });
    },

    /** BGMを停止 */
    stop(): void {
      if (!state.isPlaying) return;
      state = { ...state, currentTrackId: null, isPlaying: false, isFading: false };
      emit({ type: "stop" });
    },

    /** BGMを一時停止 */
    pause(): void {
      if (!state.isPlaying) return;
      state = { ...state, isPlaying: false };
      emit({ type: "pause" });
    },

    /** BGMを再開 */
    resume(): void {
      if (state.isPlaying || !state.currentTrackId) return;
      state = { ...state, isPlaying: true };
      emit({ type: "resume" });
    },

    /**
     * フェードアウトして停止
     */
    fadeOut(durationMs: number): void {
      if (!state.isPlaying) return;
      state = { ...state, isFading: true };
      emit({ type: "fade_out", durationMs });
      // 実際のフェード完了はUIレイヤーがstop()を呼ぶ
    },

    /**
     * フェードインで新しいトラックを再生
     */
    fadeIn(trackId: string, durationMs: number): void {
      if (state.currentTrackId && state.currentTrackId !== trackId) {
        emit({ type: "stop" });
      }
      state = {
        ...state,
        currentTrackId: trackId,
        isPlaying: true,
        isFading: true,
      };
      emit({ type: "fade_in", trackId, durationMs });
    },

    /**
     * クロスフェードで切り替え（フェードアウト→フェードイン）
     */
    crossFade(trackId: string, durationMs: number): void {
      if (state.currentTrackId === trackId && state.isPlaying) return;

      if (state.isPlaying) {
        emit({ type: "fade_out", durationMs: Math.floor(durationMs / 2) });
      }

      state = {
        ...state,
        currentTrackId: trackId,
        isPlaying: true,
        isFading: true,
      };
      emit({ type: "fade_in", trackId, durationMs: Math.floor(durationMs / 2) });
    },

    /** 音量設定（0.0-1.0） */
    setVolume(volume: number): void {
      const clamped = Math.max(0, Math.min(1, volume));
      state = { ...state, volume: clamped };
      emit({ type: "volume_change", volume: clamped });
    },

    /** フェード完了通知（UIレイヤーから呼ばれる） */
    onFadeComplete(): void {
      state = { ...state, isFading: false };
    },
  };
}

/**
 * マップIDからBGMトラックIDを解決する
 * @param mapId マップID
 * @param mapBgmTable マップ→BGMのマッピング
 * @param defaultTrackId マッピングにない場合のデフォルト
 */
export function resolveMapBgm(
  mapId: string,
  mapBgmTable: Record<string, string>,
  defaultTrackId: string = "overworld-default",
): string {
  return mapBgmTable[mapId] ?? defaultTrackId;
}

/**
 * バトル種別からBGMトラックIDを解決する
 */
export function resolveBattleBgm(
  battleType: "wild" | "trainer",
  isGymLeader: boolean = false,
  isEliteFour: boolean = false,
): string {
  if (isEliteFour) return "battle-elite";
  if (isGymLeader) return "battle-gym";
  if (battleType === "trainer") return "battle-trainer";
  return "battle-wild";
}
