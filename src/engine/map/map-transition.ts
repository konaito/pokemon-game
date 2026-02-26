import type { MapDefinition, MapConnection } from "./map-data";
import type { PlayerPosition } from "./player-movement";

/**
 * マップ遷移 (#37)
 * マップ間の移動を管理
 */

export interface MapTransitionResult {
  /** 遷移先のマップID */
  targetMapId: string;
  /** プレイヤーの新しい位置 */
  newPosition: PlayerPosition;
}

/**
 * マップ遷移を実行
 * @param connection 接続情報
 * @param currentDirection プレイヤーの現在の向き
 */
export function executeMapTransition(
  connection: MapConnection,
  currentDirection: PlayerPosition["direction"],
): MapTransitionResult {
  return {
    targetMapId: connection.targetMapId,
    newPosition: {
      x: connection.targetX,
      y: connection.targetY,
      direction: currentDirection,
    },
  };
}

/**
 * マップIDからマップデータを取得するリゾルバの型定義
 */
export type MapResolver = (mapId: string) => MapDefinition | null;
