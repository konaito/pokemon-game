"use client";

import { useState, useCallback, useEffect } from "react";
import type { MapDefinition } from "@/engine/map/map-data";
import type { PlayerPosition, Direction } from "@/engine/map/player-movement";
import { movePlayer, getFacingNpc } from "@/engine/map/player-movement";
import { MessageWindow } from "../ui/MessageWindow";

/**
 * オーバーワールド画面 (#28)
 * DOMベースのグリッドマップ表示
 */

const TILE_SIZE = 32;
const VIEWPORT_TILES_X = 15;
const VIEWPORT_TILES_Y = 11;

export interface OverworldScreenProps {
  map: MapDefinition;
  initialPosition: PlayerPosition;
  onMapTransition?: (targetMapId: string, targetX: number, targetY: number) => void;
  onEncounter?: () => void;
  onNpcInteract?: (npcId: string) => void;
  onMenuOpen?: () => void;
}

const TILE_COLORS: Record<string, string> = {
  ground: "bg-amber-100",
  wall: "bg-gray-600",
  grass: "bg-green-400",
  water: "bg-blue-400",
  ledge: "bg-amber-300",
  door: "bg-amber-800",
  sign: "bg-amber-600",
};

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

export function OverworldScreen({
  map,
  initialPosition,
  onMapTransition,
  onEncounter,
  onNpcInteract,
  onMenuOpen,
}: OverworldScreenProps) {
  const [position, setPosition] = useState<PlayerPosition>(initialPosition);
  const [dialogueMessages, setDialogueMessages] = useState<string[] | null>(null);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (dialogueMessages) return; // 会話中は移動不可

      const result = movePlayer(position, direction, map);
      setPosition(result.position);

      if (result.mapTransition) {
        onMapTransition?.(
          result.mapTransition.targetMapId,
          result.mapTransition.targetX,
          result.mapTransition.targetY,
        );
        return;
      }

      if (result.facingNpcId) {
        onNpcInteract?.(result.facingNpcId);
        const npc = map.npcs.find((n) => n.id === result.facingNpcId);
        if (npc) {
          setDialogueMessages(npc.dialogue);
        }
        return;
      }

      if (result.enteredEncounterTile) {
        onEncounter?.();
      }
    },
    [position, map, dialogueMessages, onMapTransition, onEncounter, onNpcInteract],
  );

  const handleInteract = useCallback(() => {
    if (dialogueMessages) return;

    const npcId = getFacingNpc(position, map);
    if (npcId) {
      onNpcInteract?.(npcId);
      const npc = map.npcs.find((n) => n.id === npcId);
      if (npc) {
        setDialogueMessages(npc.dialogue);
      }
    }
  }, [position, map, dialogueMessages, onNpcInteract]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [handleMove, handleInteract, onMenuOpen]);

  // ビューポートのオフセット計算（プレイヤーを中心に）
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
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div
        className="relative"
        style={{ width: visibleTilesX * TILE_SIZE, height: visibleTilesY * TILE_SIZE }}
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
              />
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
              className="absolute flex items-center justify-center text-lg"
              style={{
                left: (npc.x - offsetX) * TILE_SIZE,
                top: (npc.y - offsetY) * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              {npc.isTrainer ? "⚔️" : "👤"}
            </div>
          ))}

        {/* プレイヤー表示 */}
        <div
          className="absolute flex items-center justify-center text-lg transition-all duration-100"
          style={{
            left: (position.x - offsetX) * TILE_SIZE,
            top: (position.y - offsetY) * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
        >
          {position.direction === "up"
            ? "⬆️"
            : position.direction === "down"
              ? "⬇️"
              : position.direction === "left"
                ? "⬅️"
                : "➡️"}
        </div>

        {/* マップ名 */}
        <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5">
          <span className="font-mono text-xs text-white">{map.name}</span>
        </div>
      </div>

      {/* 会話ウィンドウ */}
      {dialogueMessages && (
        <MessageWindow messages={dialogueMessages} onComplete={() => setDialogueMessages(null)} />
      )}
    </div>
  );
}
