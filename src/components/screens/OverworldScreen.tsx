"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { MapDefinition } from "@/engine/map/map-data";
import type { PlayerPosition, Direction } from "@/engine/map/player-movement";
import { movePlayer, getFacingNpc } from "@/engine/map/player-movement";
import type { StoryFlags } from "@/engine/state/story-flags";
import { MessageWindow } from "../ui/MessageWindow";
import {
  getTileBackground,
  PlayerSprite,
  NpcSprite,
  getNpcAppearance,
} from "../ui/OverworldSprites";
import { OverworldHUD, type HUDMonsterInfo } from "../ui/OverworldHUD";
import { VirtualPad } from "../ui/VirtualPad";

/**
 * オーバーワールド画面 (#28)
 * DOMベースのグリッドマップ表示 - ハイブリッドデザイン
 * + HUD (#140), 歩行アニメ (#143), バーチャルパッド (#147), レスポンシブ (#146)
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
  /** 先頭モンスター情報（HUD表示用） */
  leadMonster?: HUDMonsterInfo | null;
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
  leadMonster,
}: OverworldScreenProps) {
  const [position, setPosition] = useState<PlayerPosition>(initialPosition);
  const [blockedMsg, setBlockedMsg] = useState<string[] | null>(null);
  const [showMapName, setShowMapName] = useState(true);
  /** 歩行アニメーション: 0=静止, 1=フレーム1, 2=フレーム2 */
  const [walkFrame, setWalkFrame] = useState(0);
  const walkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 草揺れエフェクト用の座標 */
  const [grassSwayTile, setGrassSwayTile] = useState<{ x: number; y: number } | null>(null);

  // マップ名をフェードアウト
  useEffect(() => {
    const showTimer = setTimeout(() => setShowMapName(true), 0);
    const hideTimer = setTimeout(() => setShowMapName(false), 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [map.id]);

  // 歩行フレームリセット用タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    };
  }, []);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (blockedMsg) return;

      const result = movePlayer(position, direction, map, storyFlags);
      setPosition(result.position);

      // 歩行アニメーション
      if (result.moved) {
        setWalkFrame((prev) => (prev === 1 ? 2 : 1));
        if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
        walkTimerRef.current = setTimeout(() => setWalkFrame(0), 200);

        onPositionChange?.(result.position.x, result.position.y, result.position.direction);

        // 草タイルを踏んだら揺れエフェクト
        const tile = map.tiles[result.position.y]?.[result.position.x];
        if (tile === "grass") {
          setGrassSwayTile({ x: result.position.x, y: result.position.y });
          setTimeout(() => setGrassSwayTile(null), 400);
        }
      } else {
        // 移動失敗時は向き変更のみ（アニメなし）
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

  // NPC「!」ヒント判定
  const facingNpcId = getFacingNpc(position, map);

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
        className="overworld-viewport relative overflow-hidden"
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
            const isGrassSway =
              grassSwayTile && grassSwayTile.x === mapX && grassSwayTile.y === mapY;

            return (
              <div
                key={`${mapX}-${mapY}`}
                className={`absolute pixel-perfect${isGrassSway ? " animate-grass-sway" : ""}`}
                style={{
                  left: vx * TILE_SIZE,
                  top: vy * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  background: getTileBackground(tileType),
                  backgroundSize: "100% 100%",
                }}
              />
            );
          }),
        )}

        {/* 水タイルアニメーション */}
        {Array.from({ length: visibleTilesY }, (_, vy) =>
          Array.from({ length: visibleTilesX }, (_, vx) => {
            const mapX = vx + offsetX;
            const mapY = vy + offsetY;
            if (mapX >= map.width || mapY >= map.height) return null;
            const tileType = map.tiles[mapY]?.[mapX];
            if (tileType !== "water") return null;

            return (
              <div
                key={`water-${mapX}-${mapY}`}
                className="pointer-events-none absolute pixel-perfect animate-water-shimmer"
                style={{
                  left: vx * TILE_SIZE,
                  top: vy * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  background:
                    "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                  backgroundSize: "200% 200%",
                  animationDelay: `${((mapX + mapY) % 4) * 0.5}s`,
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
              className="absolute flex items-center justify-center"
              style={{
                left: (npc.x - offsetX) * TILE_SIZE,
                top: (npc.y - offsetY) * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              <NpcSprite appearance={getNpcAppearance(npc.id, npc.isTrainer)} size={26} />
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
          <PlayerSprite direction={position.direction} size={28} walkFrame={walkFrame} />
        </div>

        {/* HUD */}
        <OverworldHUD
          map={map}
          position={position}
          leadMonster={leadMonster}
          facingNpc={!!facingNpcId}
        />

        {/* マップ名ポップアップ */}
        <div
          className="absolute left-1/2 top-8 z-20 -translate-x-1/2 rounded-md px-4 py-1.5 transition-all duration-500"
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

      {/* バーチャルパッド（モバイル用） */}
      <VirtualPad
        onDirection={(dir) => !inputBlocked && handleMove(dir)}
        onConfirm={() => !inputBlocked && handleInteract()}
        onCancel={() => {}}
        onMenu={() => !inputBlocked && onMenuOpen?.()}
        disabled={inputBlocked}
      />

      {/* ブロックメッセージ */}
      {blockedMsg && <MessageWindow messages={blockedMsg} onComplete={() => setBlockedMsg(null)} />}
    </div>
  );
}
