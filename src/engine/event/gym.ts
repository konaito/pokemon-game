/**
 * ジム戦イベントフロー (#46)
 * パズル → リーダー戦 → バッジ獲得のフローを定義
 */

import type { EventScript, EventCommand } from "./event-script";
import type { TypeId } from "@/types";

/** ジムリーダーのパーティメンバー定義 */
export interface GymLeaderPartyMember {
  speciesId: string;
  level: number;
}

/** ジム定義 */
export interface GymDefinition {
  id: string;
  /** ジム番号（1-8） */
  gymNumber: number;
  /** ジム名 */
  name: string;
  /** ジムリーダー名 */
  leaderName: string;
  /** ジムのタイプ */
  type: TypeId;
  /** リーダーのパーティ */
  leaderParty: GymLeaderPartyMember[];
  /** 獲得するバッジ名 */
  badgeName: string;
  /** ジムのマップID */
  mapId: string;
  /** 入場に必要なフラグ条件（未設定なら常に入場可能） */
  entryRequirement?: string[];
  /** リーダー戦前の会話 */
  leaderIntroDialogue: string[];
  /** リーダー戦後（勝利時）の会話 */
  leaderDefeatDialogue: string[];
  /** バッジ獲得時の報酬技マシンなど */
  rewardItemId?: string;
}

/**
 * ジムのストーリーフラグ名を生成
 */
export function getGymFlagName(gymNumber: number): string {
  return `gym${gymNumber}_cleared`;
}

/**
 * ジムの入場フラグ名を生成
 */
export function getGymEntryFlagName(gymNumber: number): string {
  return `gym${gymNumber}_entered`;
}

/**
 * ジムリーダー戦のイベントスクリプトを生成
 * フロー: リーダー会話 → バトル → 勝利会話 → バッジ獲得 → フラグ設定
 */
export function createGymBattleScript(gym: GymDefinition): EventScript {
  const clearedFlag = getGymFlagName(gym.gymNumber);

  const commands: EventCommand[] = [
    // 既にクリア済みの場合は短い会話で終了
    {
      type: "branch",
      condition: clearedFlag,
      then: [
        {
          type: "dialogue",
          speaker: gym.leaderName,
          lines: ["また来たのか。お前の実力は認めている。先に進むがいい。"],
        },
      ],
      else: [
        // リーダー戦前の会話
        {
          type: "dialogue",
          speaker: gym.leaderName,
          lines: gym.leaderIntroDialogue,
        },
        // バトル開始
        {
          type: "battle",
          trainerName: gym.leaderName,
          party: gym.leaderParty,
        },
        // 勝利後の会話
        {
          type: "dialogue",
          speaker: gym.leaderName,
          lines: gym.leaderDefeatDialogue,
        },
        // バッジ獲得
        {
          type: "dialogue",
          lines: [`${gym.badgeName}を手に入れた！`],
        },
        // 報酬アイテム（あれば）
        ...(gym.rewardItemId
          ? [
              {
                type: "give_item" as const,
                itemId: gym.rewardItemId,
                quantity: 1,
              },
            ]
          : []),
        // クリアフラグ設定
        {
          type: "set_flag" as const,
          flag: clearedFlag,
          value: true,
        },
      ],
    },
  ];

  return {
    id: `gym_battle_${gym.gymNumber}`,
    // 未クリアでも再訪可能（branch内で分岐するため、triggerは設定しない）
    commands,
  };
}

/**
 * ジムクリアに必要なバッジ数を判定
 * @param gymNumber ジム番号（1-8）
 * @returns 入場に必要な前提バッジ数（0-7）
 */
export function getRequiredBadgeCount(gymNumber: number): number {
  // 最初のジムは前提なし、以降は前のジムのクリアが必要
  return Math.max(0, gymNumber - 1);
}

/**
 * プレイヤーが特定のジムに挑戦可能か判定
 * @param gymNumber ジム番号
 * @param storyFlags 現在のストーリーフラグ
 */
export function canChallengeGym(
  gymNumber: number,
  storyFlags: Record<string, boolean>,
): boolean {
  const requiredBadges = getRequiredBadgeCount(gymNumber);
  for (let i = 1; i <= requiredBadges; i++) {
    if (!storyFlags[getGymFlagName(i)]) return false;
  }
  return true;
}

/**
 * クリア済みバッジの一覧を取得
 * @param storyFlags 現在のストーリーフラグ
 * @param totalGyms ジム総数（デフォルト8）
 */
export function getEarnedBadges(
  storyFlags: Record<string, boolean>,
  totalGyms: number = 8,
): number[] {
  const badges: number[] = [];
  for (let i = 1; i <= totalGyms; i++) {
    if (storyFlags[getGymFlagName(i)]) {
      badges.push(i);
    }
  }
  return badges;
}

/**
 * 四天王に挑戦可能か判定（全8バッジ必要）
 */
export function canChallengeEliteFour(
  storyFlags: Record<string, boolean>,
  totalGyms: number = 8,
): boolean {
  return getEarnedBadges(storyFlags, totalGyms).length >= totalGyms;
}
