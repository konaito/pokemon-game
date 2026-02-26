/**
 * モンスター交換システム (#90)
 * プレイヤー間のモンスター交換ロジック
 */

import type { MonsterInstance } from "@/types";

/** 交換ルームの状態 */
export type TradeState = "offering" | "confirming" | "complete" | "cancelled";

/** 交換ルーム内のプレイヤー */
export interface TradePlayer {
  id: string;
  socketId: string;
  /** 提示したモンスターのUID（null=未提示） */
  offeredMonsterUid: string | null;
  /** 交換確定フラグ */
  confirmed: boolean;
}

/** 交換ルーム */
export interface TradeRoom {
  id: string;
  players: [TradePlayer, TradePlayer];
  state: TradeState;
  createdAt: number;
}

/** 交換結果 */
export interface TradeResult {
  success: boolean;
  /** 交換が成功した場合、各プレイヤーが受け取るモンスターのUID */
  exchanges?: { playerId: string; receivedMonsterUid: string }[];
  /** エラーメッセージ */
  error?: string;
}

/**
 * 交換ルームを作成
 */
export function createTradeRoom(
  roomId: string,
  playerA: { id: string; socketId: string },
  playerB: { id: string; socketId: string },
): TradeRoom {
  return {
    id: roomId,
    players: [
      { id: playerA.id, socketId: playerA.socketId, offeredMonsterUid: null, confirmed: false },
      { id: playerB.id, socketId: playerB.socketId, offeredMonsterUid: null, confirmed: false },
    ],
    state: "offering",
    createdAt: Date.now(),
  };
}

/**
 * モンスターを提示
 */
export function offerMonster(
  room: TradeRoom,
  playerId: string,
  monsterUid: string,
): TradeRoom {
  if (room.state !== "offering") return room;

  const players = room.players.map((p) => {
    if (p.id === playerId) {
      return { ...p, offeredMonsterUid: monsterUid, confirmed: false };
    }
    // 相手のconfirmedもリセット（提示が変わったため）
    return { ...p, confirmed: false };
  }) as [TradePlayer, TradePlayer];

  // 両者が提示済みならconfirming状態へ
  const bothOffered = players.every((p) => p.offeredMonsterUid !== null);

  return {
    ...room,
    players,
    state: bothOffered ? "confirming" : "offering",
  };
}

/**
 * 交換を確定
 */
export function confirmTrade(
  room: TradeRoom,
  playerId: string,
): TradeRoom {
  if (room.state !== "confirming") return room;

  const players = room.players.map((p) => {
    if (p.id === playerId) {
      return { ...p, confirmed: true };
    }
    return p;
  }) as [TradePlayer, TradePlayer];

  // 両者が確定したら交換完了
  const bothConfirmed = players.every((p) => p.confirmed);

  return {
    ...room,
    players,
    state: bothConfirmed ? "complete" : "confirming",
  };
}

/**
 * 交換をキャンセル
 */
export function cancelTrade(room: TradeRoom): TradeRoom {
  return { ...room, state: "cancelled" };
}

/**
 * 交換結果を生成（完了状態のルームから）
 */
export function resolveTradeResult(room: TradeRoom): TradeResult {
  if (room.state !== "complete") {
    return { success: false, error: "交換が完了していません" };
  }

  const [a, b] = room.players;

  if (!a.offeredMonsterUid || !b.offeredMonsterUid) {
    return { success: false, error: "モンスターが提示されていません" };
  }

  return {
    success: true,
    exchanges: [
      { playerId: a.id, receivedMonsterUid: b.offeredMonsterUid },
      { playerId: b.id, receivedMonsterUid: a.offeredMonsterUid },
    ],
  };
}

/**
 * 交換可能なモンスターかチェック
 * - パーティが1匹の場合は交換不可（手持ちが0になるため）
 * - 伝説のモンスターは交換不可（ゲームバランス保護）
 */
export function canTradeMonster(
  monster: MonsterInstance,
  partySize: number,
  legendaryIds: Set<string> = new Set(["omoide", "wasurenu"]),
): { tradeable: boolean; reason?: string } {
  if (partySize <= 1) {
    return { tradeable: false, reason: "手持ちが1匹の場合は交換できません" };
  }
  if (legendaryIds.has(monster.speciesId)) {
    return { tradeable: false, reason: "伝説のモンスターは交換できません" };
  }
  return { tradeable: true };
}
