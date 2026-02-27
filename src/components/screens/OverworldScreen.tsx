"use client";

import { useState, useCallback, useEffect } from "react";
import type { MapDefinition } from "@/engine/map/map-data";
import type { PlayerPosition, Direction } from "@/engine/map/player-movement";
import { movePlayer, getFacingNpc } from "@/engine/map/player-movement";
import type { StoryFlags } from "@/engine/state/story-flags";
import { MessageWindow } from "../ui/MessageWindow";
import { TILE_COLORS } from "@/lib/design-tokens";

/**
 * オーバーワールド画面 (#28)
 * DOMベースのグリッドマップ表示 - ハイブリッドデザイン
 */

const TILE_SIZE = 32;
const VIEWPORT_TILES_X = 15;
const VIEWPORT_TILES_Y = 11;

export interface OverworldScreenProps {
  map: MapDefinition;
  initialPosition: PlayerPosition;
  storyFlags?: StoryFlags;
  inputBlocked?: boolean;
  onMapTransition?: (targetMapId: string, targetX: number, targetY: number) => void;
  onEncounter?: () => void;
  onNpcInteract?: (npcId: string) => void;
  onMenuOpen?: () => void;
  onPositionChange?: (x: number, y: number, direction: Direction) => void;
}

const DIRECTION_KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

/** プレイヤーの方向別スプライト */
const PLAYER_SPRITE: Record<Direction, string> = {
  up: "▲",
  down: "▼",
  left: "◀",
  right: "▶",
};

export function OverworldScreen({
  map,
  initialPosition,
  storyFlags = {},
  inputBlocked = false,
  onMapTransition,
  onEncounter,
  onNpcInteract,
  onMenuOpen,
  onPositionChange,
}: OverworldScreenProps) {
  const [position, setPosition] = useState<PlayerPosition>(initialPosition);
  const [blockedMsg, setBlockedMsg] = useState<string[] | null>(null);
  const [showMapName, setShowMapName] = useState(true);

  // マップ名をフェードアウト
  useEffect(() => {
    setShowMapName(true);
    const timer = setTimeout(() => setShowMapName(false), 3000);
    return () => clearTimeout(timer);
  }, [map.id]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (blockedMsg) return;

      const result = movePlayer(position, direction, map, storyFlags);
      setPosition(result.position);

      // 親に位置を通知（バトル復帰時に正しい位置を復元するため）
      if (result.moved) {
        onPositionChange?.(result.position.x, result.position.y, result.position.direction);
      }

      if (result.blockedMessage) {
        setBlockedMsg([result.blockedMessage]);
        return;
      }

      if (result.mapTransition) {
        onMapTransition?.(
          result.mapTransition.targetMapId,
          result.mapTransition.targetX,
          result.mapTransition.targetY,
        );
        return;
      }

      if (result.facingNpcId) {
        return;
      }

      if (result.enteredEncounterTile) {
        onEncounter?.();
      }
    },
    [position, map, storyFlags, blockedMsg, onMapTransition, onEncounter, onPositionChange],
  );

  const handleInteract = useCallback(() => {
    if (blockedMsg) return;

    const npcId = getFacingNpc(position, map);
    if (npcId) {
      onNpcInteract?.(npcId);
    }
  }, [position, map, blockedMsg, onNpcInteract]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputBlocked) return;

      const direction = DIRECTION_KEYS[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
        return;
      }

      if (e.key === "z" || e.key === "Enter") {
        e.preventDefault();
        handleInteract();
      }

      if (e.key === "Escape" || e.key === "x") {
        e.preventDefault();
        onMenuOpen?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove, handleInteract, onMenuOpen, inputBlocked]);

  const offsetX = Math.max(
    0,
    Math.min(position.x - Math.floor(VIEWPORT_TILES_X / 2), map.width - VIEWPORT_TILES_X),
  );
  const offsetY = Math.max(
    0,
    Math.min(position.y - Math.floor(VIEWPORT_TILES_Y / 2), map.height - VIEWPORT_TILES_Y),
  );

  const visibleTilesX = Math.min(VIEWPORT_TILES_X, map.width);
  const visibleTilesY = Math.min(VIEWPORT_TILES_Y, map.height);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
      <div
        className="relative overflow-hidden"
        style={{
          width: visibleTilesX * TILE_SIZE,
          height: visibleTilesY * TILE_SIZE,
          boxShadow: "0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* マップタイル */}
        {Array.from({ length: visibleTilesY }, (_, vy) =>
          Array.from({ length: visibleTilesX }, (_, vx) => {
            const mapX = vx + offsetX;
            const mapY = vy + offsetY;
            if (mapX >= map.width || mapY >= map.height) return null;
            const tileType = map.tiles[mapY]?.[mapX] ?? "ground";
            const bgColor = TILE_COLORS[tileType] ?? "bg-gray-500";

            return (
              <div
                key={`${mapX}-${mapY}`}
                className={`absolute ${bgColor}`}
                style={{
                  left: vx * TILE_SIZE,
                  top: vy * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
              >
                {/* 草むらパターン */}
                {tileType === "grass" && (
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background:
                        "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,80,0,0.3) 3px, rgba(0,80,0,0.3) 4px)",
                    }}
                  />
                )}
                {/* 水面パターン */}
                {tileType === "water" && (
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 5px)",
                    }}
                  />
                )}
              </div>
            );
          }),
        )}

        {/* NPC表示 */}
        {map.npcs
          .filter(
            (npc) =>
              npc.x >= offsetX &&
              npc.x < offsetX + visibleTilesX &&
              npc.y >= offsetY &&
              npc.y < offsetY + visibleTilesY,
          )
          .map((npc) => (
            <div
              key={npc.id}
              className="absolute flex items-center justify-center"
              style={{
                left: (npc.x - offsetX) * TILE_SIZE,
                top: (npc.y - offsetY) * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]"
                style={{
                  backgroundColor: npc.isTrainer ? "#e94560" : "#533483",
                  color: "white",
                  boxShadow: npc.isTrainer
                    ? "0 0 8px rgba(233,69,96,0.4)"
                    : "0 0 6px rgba(83,52,131,0.4)",
                }}
              >
                {npc.isTrainer ? "!" : "●"}
              </div>
            </div>
          ))}

        {/* プレイヤー表示 */}
        <div
          className="absolute flex items-center justify-center transition-all duration-100"
          style={{
            left: (position.x - offsetX) * TILE_SIZE,
            top: (position.y - offsetY) * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-sm font-[family-name:var(--font-pressstart)] text-[8px] text-white"
            style={{
              backgroundColor: "#e94560",
              boxShadow: "0 0 10px rgba(233,69,96,0.5)",
            }}
          >
            {PLAYER_SPRITE[position.direction]}
          </div>
        </div>

        {/* マップ名ポップアップ */}
        <div
          className="absolute left-1/2 top-3 -translate-x-1/2 rounded-md px-4 py-1.5 transition-all duration-500"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(22,33,62,0.95), rgba(22,33,62,0.95), transparent)",
            border: "1px solid rgba(83,52,131,0.4)",
            opacity: showMapName ? 1 : 0,
            transform: `translateX(-50%) translateY(${showMapName ? "0" : "-10px"})`,
          }}
        >
          <span className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-sm text-white">
            {map.name}
          </span>
        </div>
      </div>

      {/* ブロックメッセージ */}
      {blockedMsg && <MessageWindow messages={blockedMsg} onComplete={() => setBlockedMsg(null)} />}
    </div>
  );
}
