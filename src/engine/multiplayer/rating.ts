/**
 * レーティングシステム (#91)
 * Elo方式によるプレイヤーレーティング計算
 */

/** レーティング定数 */
const K_FACTOR = 32;
const DEFAULT_RATING = 1500;
const MIN_RATING = 1000;

/** プレイヤーレーティングデータ */
export interface PlayerRating {
  playerId: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  season: number;
}

/** ランク定義 */
export type RankTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master";

export interface RankInfo {
  tier: RankTier;
  label: string;
  minRating: number;
}

/** ランクテーブル（降順で検索用） */
const RANK_TABLE: RankInfo[] = [
  { tier: "master", label: "マスター", minRating: 2100 },
  { tier: "diamond", label: "ダイヤモンド", minRating: 1900 },
  { tier: "platinum", label: "プラチナ", minRating: 1700 },
  { tier: "gold", label: "ゴールド", minRating: 1500 },
  { tier: "silver", label: "シルバー", minRating: 1300 },
  { tier: "bronze", label: "ブロンズ", minRating: MIN_RATING },
];

/**
 * Elo方式の期待勝率を計算
 */
export function calculateExpectedScore(
  ratingA: number,
  ratingB: number,
): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * 新しいレーティングを計算
 * @param rating 現在のレーティング
 * @param expectedScore 期待勝率
 * @param actualScore 実際の結果（1=勝ち, 0=負け, 0.5=引き分け）
 */
export function calculateNewRating(
  rating: number,
  expectedScore: number,
  actualScore: number,
): number {
  const newRating = Math.round(rating + K_FACTOR * (actualScore - expectedScore));
  return Math.max(MIN_RATING, newRating);
}

/**
 * バトル結果からレーティング変動を計算
 * @returns [playerAの新レーティング, playerBの新レーティング]
 */
export function calculateRatingChange(
  ratingA: number,
  ratingB: number,
  result: "a_wins" | "b_wins" | "draw",
): [number, number] {
  const expectedA = calculateExpectedScore(ratingA, ratingB);
  const expectedB = 1 - expectedA;

  let actualA: number;
  let actualB: number;

  switch (result) {
    case "a_wins":
      actualA = 1;
      actualB = 0;
      break;
    case "b_wins":
      actualA = 0;
      actualB = 1;
      break;
    case "draw":
      actualA = 0.5;
      actualB = 0.5;
      break;
  }

  const newA = calculateNewRating(ratingA, expectedA, actualA);
  const newB = calculateNewRating(ratingB, expectedB, actualB);

  return [newA, newB];
}

/**
 * レーティングからランクを取得
 */
export function getRank(rating: number): RankInfo {
  for (const rank of RANK_TABLE) {
    if (rating >= rank.minRating) {
      return rank;
    }
  }
  return RANK_TABLE[RANK_TABLE.length - 1];
}

/**
 * シーズンリセット: レーティングを中央値に向かって圧縮
 */
export function seasonReset(rating: number): number {
  return Math.round(DEFAULT_RATING + (rating - DEFAULT_RATING) * 0.5);
}

/**
 * 新規プレイヤーのレーティングデータを作成
 */
export function createPlayerRating(playerId: string, season: number): PlayerRating {
  return {
    playerId,
    rating: DEFAULT_RATING,
    wins: 0,
    losses: 0,
    draws: 0,
    season,
  };
}

/**
 * バトル結果を反映してPlayerRatingを更新
 */
export function applyBattleResult(
  player: PlayerRating,
  opponentRating: number,
  result: "win" | "loss" | "draw",
): PlayerRating {
  const expected = calculateExpectedScore(player.rating, opponentRating);
  const actual = result === "win" ? 1 : result === "loss" ? 0 : 0.5;
  const newRating = calculateNewRating(player.rating, expected, actual);

  return {
    ...player,
    rating: newRating,
    wins: player.wins + (result === "win" ? 1 : 0),
    losses: player.losses + (result === "loss" ? 1 : 0),
    draws: player.draws + (result === "draw" ? 1 : 0),
  };
}
