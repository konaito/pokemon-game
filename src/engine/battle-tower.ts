import type { MonsterInstance, MonsterId, NatureId } from "@/types";
import { expForLevel } from "@/engine/battle/experience";

/**
 * バトルタワー管理モジュール
 * ポストゲームのエンドレスバトル施設
 */

/** バトルタワーの状態 */
export interface BattleTowerState {
  currentStreak: number;
  bestStreak: number;
  inChallenge: boolean;
  currentFloor: number;
  battlePoints: number;
}

/** バトルタワートレーナーのテンプレート */
export interface TowerTrainer {
  name: string;
  party: MonsterId[];
}

/** 難易度設定 */
export interface DifficultyConfig {
  level: number;
  ivRange: [number, number];
  aiType: "basic" | "smart" | "smart_plus";
}

/** 初期状態を生成 */
export function createBattleTowerState(): BattleTowerState {
  return {
    currentStreak: 0,
    bestStreak: 0,
    inChallenge: false,
    currentFloor: 0,
    battlePoints: 0,
  };
}

/**
 * 連勝数に基づく難易度設定を取得
 */
export function getDifficulty(streak: number): DifficultyConfig {
  if (streak >= 50) {
    // 50戦目: ボス戦
    return { level: 50, ivRange: [31, 31], aiType: "smart_plus" };
  }
  if (streak >= 21) {
    return { level: 50, ivRange: [31, 31], aiType: "smart" };
  }
  if (streak >= 11) {
    return { level: 50, ivRange: [20, 31], aiType: "basic" };
  }
  return { level: 50, ivRange: [0, 31], aiType: "basic" };
}

/** トレーナー名プール */
const TRAINER_NAMES = [
  "タワートレーナー ユウキ",
  "タワートレーナー マコト",
  "タワートレーナー サクラ",
  "タワートレーナー リン",
  "タワートレーナー カイ",
  "タワートレーナー ハナ",
  "タワートレーナー ソラ",
  "タワートレーナー ミナト",
  "タワートレーナー アキラ",
  "タワートレーナー ナツキ",
];

/** ボストレーナー名 */
const BOSS_NAME = "タワータイクーン レイジ";

/** 使用可能なモンスタープール（序盤〜中盤の進化後） */
const MONSTER_POOL: MonsterId[] = [
  "enjuu",
  "taikaiou",
  "daijumoku",
  "pikarion",
  "suigyuu",
  "blazeraptor",
  "frostail",
  "shadokuro",
  "seireioh",
  "koganemushi",
  "iwagame",
  "kazehane",
  "dorontama",
  "yamigarasu",
  "ginryuu",
  "haganemaru",
];

/** 性格プール */
const NATURES: NatureId[] = [
  "adamant",
  "modest",
  "jolly",
  "timid",
  "bold",
  "impish",
  "calm",
  "careful",
];

/**
 * タワートレーナーを生成
 */
export function generateTowerTrainer(
  streak: number,
  random: () => number = Math.random,
): TowerTrainer {
  const isBoss = streak === 49; // 0-indexed, 50戦目

  const name = isBoss ? BOSS_NAME : TRAINER_NAMES[Math.floor(random() * TRAINER_NAMES.length)];

  // パーティサイズ: 3体
  const partySize = 3;
  const party: MonsterId[] = [];
  const pool = [...MONSTER_POOL];

  for (let i = 0; i < partySize && pool.length > 0; i++) {
    const idx = Math.floor(random() * pool.length);
    party.push(pool[idx]);
    pool.splice(idx, 1); // 重複なし
  }

  return { name, party };
}

/**
 * タワートレーナーのパーティをMonsterInstance[]として生成
 */
export function generateTowerParty(
  trainer: TowerTrainer,
  difficulty: DifficultyConfig,
  random: () => number = Math.random,
): MonsterInstance[] {
  return trainer.party.map((speciesId, i) => {
    const [minIv, maxIv] = difficulty.ivRange;
    const rollIv = () => minIv + Math.floor(random() * (maxIv - minIv + 1));
    const nature = NATURES[Math.floor(random() * NATURES.length)];

    return {
      uid: `tower-${i}`,
      speciesId,
      level: difficulty.level,
      exp: expForLevel(difficulty.level, "medium_fast"),
      nature,
      ivs: {
        hp: rollIv(),
        atk: rollIv(),
        def: rollIv(),
        spAtk: rollIv(),
        spDef: rollIv(),
        speed: rollIv(),
      },
      evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
      currentHp: 999, // 後でmaxHpに修正される
      moves: [],
      status: null,
    };
  });
}

/**
 * 勝利時のBP報酬を計算
 */
export function calculateBpReward(streak: number): number {
  if (streak >= 50) return 20; // ボス勝利
  if (streak >= 21) return 5;
  if (streak >= 11) return 3;
  return 2;
}

/**
 * 7戦ごとの休憩ポイントか判定
 */
export function isRestPoint(floor: number): boolean {
  return floor > 0 && floor % 7 === 0;
}

/**
 * ボス戦か判定
 */
export function isBossBattle(floor: number): boolean {
  return floor === 50;
}

/**
 * チャレンジ開始
 */
export function startChallenge(state: BattleTowerState): BattleTowerState {
  return {
    ...state,
    inChallenge: true,
    currentStreak: 0,
    currentFloor: 0,
  };
}

/**
 * 勝利処理
 */
export function recordWin(state: BattleTowerState): BattleTowerState {
  const newStreak = state.currentStreak + 1;
  const bp = calculateBpReward(newStreak);
  return {
    ...state,
    currentStreak: newStreak,
    currentFloor: state.currentFloor + 1,
    bestStreak: Math.max(state.bestStreak, newStreak),
    battlePoints: state.battlePoints + bp,
  };
}

/**
 * 敗北処理
 */
export function recordLoss(state: BattleTowerState): BattleTowerState {
  return {
    ...state,
    inChallenge: false,
    currentStreak: 0,
    currentFloor: 0,
  };
}

/**
 * チャレンジ中断（リタイア）
 */
export function forfeitChallenge(state: BattleTowerState): BattleTowerState {
  return {
    ...state,
    inChallenge: false,
    currentFloor: 0,
  };
}
