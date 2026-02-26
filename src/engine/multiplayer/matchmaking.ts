/**
 * マッチングシステム (#89)
 * レーティングベースのマッチング + バトルルーム管理
 */

/** マッチング待機エントリ */
export interface MatchmakingEntry {
  playerId: string;
  socketId: string;
  rating: number;
  joinedAt: number;
}

/** マッチング結果 */
export interface MatchResult {
  playerA: MatchmakingEntry;
  playerB: MatchmakingEntry;
  roomId: string;
}

/** マッチング設定 */
export interface MatchmakingConfig {
  /** 基本許容レーティング差 */
  baseToleranceRange: number;
  /** 待ち時間10秒ごとの許容幅拡大 */
  toleranceExpansionPerInterval: number;
  /** 許容幅拡大の時間間隔（ms） */
  toleranceExpansionInterval: number;
  /** マッチングタイムアウト（ms） */
  timeout: number;
}

const DEFAULT_CONFIG: MatchmakingConfig = {
  baseToleranceRange: 100,
  toleranceExpansionPerInterval: 50,
  toleranceExpansionInterval: 10000,
  timeout: 300000, // 5分
};

/**
 * 2人のプレイヤーがマッチング可能か判定
 */
export function canMatch(
  a: MatchmakingEntry,
  b: MatchmakingEntry,
  now: number = Date.now(),
  config: MatchmakingConfig = DEFAULT_CONFIG,
): boolean {
  if (a.playerId === b.playerId) return false;

  const waitTimeA = now - a.joinedAt;
  const waitTimeB = now - b.joinedAt;
  const maxWait = Math.max(waitTimeA, waitTimeB);

  const expansionSteps = Math.floor(maxWait / config.toleranceExpansionInterval);
  const tolerance =
    config.baseToleranceRange +
    expansionSteps * config.toleranceExpansionPerInterval;

  return Math.abs(a.rating - b.rating) <= tolerance;
}

/**
 * キューがタイムアウトしたかチェック
 */
export function isTimedOut(
  entry: MatchmakingEntry,
  now: number = Date.now(),
  config: MatchmakingConfig = DEFAULT_CONFIG,
): boolean {
  return now - entry.joinedAt >= config.timeout;
}

/**
 * マッチングキューからベストマッチを検索
 * @returns マッチしたペア、またはnull
 */
export function findMatch(
  queue: MatchmakingEntry[],
  now: number = Date.now(),
  config: MatchmakingConfig = DEFAULT_CONFIG,
): [MatchmakingEntry, MatchmakingEntry] | null {
  if (queue.length < 2) return null;

  let bestPair: [MatchmakingEntry, MatchmakingEntry] | null = null;
  let bestRatingDiff = Infinity;

  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      if (canMatch(queue[i], queue[j], now, config)) {
        const diff = Math.abs(queue[i].rating - queue[j].rating);
        if (diff < bestRatingDiff) {
          bestRatingDiff = diff;
          bestPair = [queue[i], queue[j]];
        }
      }
    }
  }

  return bestPair;
}

/**
 * ルームIDを生成
 */
export function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * マッチングエントリを作成
 */
export function createMatchmakingEntry(
  playerId: string,
  socketId: string,
  rating: number,
): MatchmakingEntry {
  return {
    playerId,
    socketId,
    rating,
    joinedAt: Date.now(),
  };
}
