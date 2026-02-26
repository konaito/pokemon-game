import type { MapDefinition } from "./map-data";
import { isWalkable, getConnectionAt, getTileAt } from "./map-data";

/**
 * プレイヤー移動 & 衝突判定 (#31)
 */

export type Direction = "up" | "down" | "left" | "right";

export interface PlayerPosition {
  x: number;
  y: number;
  direction: Direction;
}

export interface MoveResult {
  /** 移動できたか */
  moved: boolean;
  /** 新しい位置 */
  position: PlayerPosition;
  /** マップ遷移が発生したか */
  mapTransition: { targetMapId: string; targetX: number; targetY: number } | null;
  /** エンカウントタイル（草むら）を踏んだか */
  enteredEncounterTile: boolean;
  /** NPCに話しかける方向にNPCがいたか */
  facingNpcId: string | null;
}

const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/**
 * プレイヤーを指定方向に1マス移動させる
 */
export function movePlayer(
  currentPos: PlayerPosition,
  direction: Direction,
  map: MapDefinition,
): MoveResult {
  const { dx, dy } = DIRECTION_DELTA[direction];
  const newX = currentPos.x + dx;
  const newY = currentPos.y + dy;

  const baseResult: MoveResult = {
    moved: false,
    position: { ...currentPos, direction },
    mapTransition: null,
    enteredEncounterTile: false,
    facingNpcId: null,
  };

  // NPC衝突判定
  const npcAtTarget = map.npcs.find((npc) => npc.x === newX && npc.y === newY);
  if (npcAtTarget) {
    return { ...baseResult, facingNpcId: npcAtTarget.id };
  }

  // 壁・範囲外判定
  if (!isWalkable(map, newX, newY)) {
    return baseResult;
  }

  const newPosition: PlayerPosition = { x: newX, y: newY, direction };

  // マップ接続判定
  const connection = getConnectionAt(map, newX, newY);
  if (connection) {
    return {
      moved: true,
      position: newPosition,
      mapTransition: {
        targetMapId: connection.targetMapId,
        targetX: connection.targetX,
        targetY: connection.targetY,
      },
      enteredEncounterTile: false,
      facingNpcId: null,
    };
  }

  // エンカウントタイル判定
  const tile = getTileAt(map, newX, newY);
  const enteredEncounterTile = tile?.encounter ?? false;

  return {
    moved: true,
    position: newPosition,
    mapTransition: null,
    enteredEncounterTile,
    facingNpcId: null,
  };
}

/**
 * 向いている方向のNPCを取得（Aボタン相当）
 */
export function getFacingNpc(position: PlayerPosition, map: MapDefinition): string | null {
  const { dx, dy } = DIRECTION_DELTA[position.direction];
  const facingX = position.x + dx;
  const facingY = position.y + dy;

  const npc = map.npcs.find((n) => n.x === facingX && n.y === facingY);
  return npc?.id ?? null;
}
