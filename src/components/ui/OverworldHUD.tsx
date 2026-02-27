"use client";

import { HpBar } from "./HpBar";
import type { MapDefinition } from "@/engine/map/map-data";
import type { PlayerPosition, Direction } from "@/engine/map/player-movement";

/**
 * オーバーワールドHUD (#140)
 * ミニマップ、先頭モンスターHP、操作ガイド、NPC「!」マーク
 */

export interface HUDMonsterInfo {
  name: string;
  currentHp: number;
  maxHp: number;
  level: number;
  speciesId: string;
}

export interface OverworldHUDProps {
  map: MapDefinition;
  position: PlayerPosition;
  leadMonster?: HUDMonsterInfo | null;
  facingNpc?: boolean;
  showControls?: boolean;
}

/** ミニマップ: マップ全体の縮小表示 + プレイヤー位置 */
function MiniMap({ map, position }: { map: MapDefinition; position: PlayerPosition }) {
  const scale = Math.min(48 / map.width, 48 / map.height);
  const w = Math.round(map.width * scale);
  const h = Math.round(map.height * scale);

  return (
    <div
      className="rounded border border-[#533483]/60 bg-[#16213e]/90"
      style={{ width: w + 8, height: h + 8, padding: 4 }}
    >
      <svg viewBox={`0 0 ${map.width} ${map.height}`} width={w} height={h}>
        {/* タイル概要 */}
        {Array.from({ length: map.height }, (_, y) =>
          Array.from({ length: map.width }, (_, x) => {
            const tile = map.tiles[y]?.[x] ?? "ground";
            let fill = "#8a7e5e";
            if (tile === "wall") fill = "#4a4a5a";
            else if (tile === "grass") fill = "#4a9e4a";
            else if (tile === "water") fill = "#4a8ec4";
            else if (tile === "door") fill = "#8b5e3c";
            return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
          }),
        )}
        {/* NPC位置 */}
        {map.npcs.map((npc) => (
          <rect
            key={npc.id}
            x={npc.x}
            y={npc.y}
            width={1}
            height={1}
            fill="#e94560"
            opacity={0.8}
          />
        ))}
        {/* プレイヤー位置 */}
        <rect
          x={position.x - 0.5}
          y={position.y - 0.5}
          width={2}
          height={2}
          fill="#fff"
          opacity={0.9}
        />
      </svg>
    </div>
  );
}

/** 先頭モンスターHP表示 */
function LeadMonsterBar({ monster }: { monster: HUDMonsterInfo }) {
  return (
    <div className="rounded border border-[#533483]/60 bg-[#16213e]/90 px-2 py-1">
      <div className="flex items-center gap-1.5">
        <span className="font-[family-name:var(--font-dotgothic)] text-[10px] text-white">
          {monster.name}
        </span>
        <span className="font-[family-name:var(--font-dotgothic)] text-[8px] text-gray-500">
          Lv.{monster.level}
        </span>
      </div>
      <HpBar
        current={monster.currentHp}
        max={monster.maxHp}
        className="mt-0.5 w-20"
        showNumbers={false}
      />
    </div>
  );
}

/** NPC会話ヒント「!」 */
function NpcHint({ direction }: { direction: Direction }) {
  const offsets: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
  };
  const { x, y } = offsets[direction];
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <span
        className="font-[family-name:var(--font-pressstart)] text-xl text-[#F8D030]"
        style={{
          textShadow: "0 0 8px rgba(248,208,48,0.6), 1px 1px 0 rgba(0,0,0,0.8)",
          animation: "float 0.8s ease-in-out infinite",
        }}
      >
        !
      </span>
    </div>
  );
}

/** 操作ガイド（PC用） */
function ControlGuide() {
  return (
    <div className="rounded border border-[#533483]/40 bg-[#16213e]/80 px-2 py-1">
      <div className="flex gap-2 font-[family-name:var(--font-dotgothic)] text-[8px] text-gray-500">
        <span>↑↓←→: 移動</span>
        <span>Z: 話す</span>
        <span>X: メニュー</span>
      </div>
    </div>
  );
}

export function OverworldHUD({
  map,
  position,
  leadMonster,
  facingNpc = false,
  showControls = true,
}: OverworldHUDProps) {
  return (
    <>
      {/* 左上: ミニマップ */}
      <div className="absolute left-1 top-1 z-20">
        <MiniMap map={map} position={position} />
      </div>

      {/* 右上: 先頭モンスターHP */}
      {leadMonster && (
        <div className="absolute right-1 top-1 z-20">
          <LeadMonsterBar monster={leadMonster} />
        </div>
      )}

      {/* NPC「!」ヒント */}
      {facingNpc && <NpcHint direction={position.direction} />}

      {/* 右下: 操作ガイド（PC時のみ） */}
      {showControls && (
        <div className="absolute bottom-1 right-1 z-20 hidden sm:block">
          <ControlGuide />
        </div>
      )}
    </>
  );
}
