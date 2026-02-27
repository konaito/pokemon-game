"use client";

import type { Direction } from "@/engine/map/player-movement";
import type { TileType } from "@/engine/map/map-data";

/**
 * オーバーワールド用スプライト集
 * マップタイル、プレイヤー、NPCのドット絵SVG
 */

// ─── マップタイル ─────────────────────────────────

/** 8x8ピクセルアートパターンをSVGで定義 */
const TILE_SVGS: Record<TileType, string> = {
  ground: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
    <rect width="8" height="8" fill="#c8b88c"/>
    <rect x="1" y="1" width="1" height="1" fill="#bfae7e" opacity="0.5"/>
    <rect x="5" y="2" width="1" height="1" fill="#d4c49a" opacity="0.4"/>
    <rect x="3" y="5" width="1" height="1" fill="#bfae7e" opacity="0.3"/>
    <rect x="6" y="6" width="1" height="1" fill="#d4c49a" opacity="0.4"/>
    <rect x="0" y="4" width="1" height="1" fill="#b8a67a" opacity="0.3"/>
    <rect x="7" y="0" width="1" height="1" fill="#d0c090" opacity="0.3"/>
  </svg>`,

  wall: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
    <rect width="8" height="8" fill="#5a5a6e"/>
    <rect x="0" y="0" width="4" height="4" fill="#636378" stroke="#4e4e62" stroke-width="0.5"/>
    <rect x="4" y="0" width="4" height="4" fill="#5e5e72" stroke="#4e4e62" stroke-width="0.5"/>
    <rect x="0" y="4" width="4" height="4" fill="#565668" stroke="#4e4e62" stroke-width="0.5"/>
    <rect x="4" y="4" width="4" height="4" fill="#626276" stroke="#4e4e62" stroke-width="0.5"/>
    <rect x="2" y="0" width="4" height="1" fill="#6a6a7e" opacity="0.3"/>
    <rect x="0" y="4" width="4" height="1" fill="#6a6a7e" opacity="0.3"/>
  </svg>`,

  grass: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
    <rect width="8" height="8" fill="#5cb85c"/>
    <rect x="1" y="6" width="1" height="2" fill="#4a9e4a"/>
    <rect x="2" y="5" width="1" height="3" fill="#3d8b3d"/>
    <rect x="3" y="6" width="1" height="2" fill="#4a9e4a"/>
    <rect x="5" y="5" width="1" height="3" fill="#4a9e4a"/>
    <rect x="6" y="6" width="1" height="2" fill="#3d8b3d"/>
    <rect x="7" y="7" width="1" height="1" fill="#4a9e4a"/>
    <rect x="0" y="7" width="1" height="1" fill="#3d8b3d"/>
    <rect x="1" y="3" width="1" height="1" fill="#6dc86d" opacity="0.6"/>
    <rect x="4" y="2" width="1" height="1" fill="#6dc86d" opacity="0.5"/>
    <rect x="6" y="4" width="1" height="1" fill="#6dc86d" opacity="0.4"/>
    <rect x="0" y="1" width="1" height="1" fill="#4a9e4a" opacity="0.4"/>
    <rect x="3" y="0" width="1" height="1" fill="#6dc86d" opacity="0.3"/>
  </svg>`,

  water: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
    <rect width="8" height="8" fill="#5b9bd5"/>
    <rect x="0" y="2" width="2" height="1" fill="#6baae0" opacity="0.7"/>
    <rect x="3" y="2" width="3" height="1" fill="#6baae0" opacity="0.6"/>
    <rect x="1" y="5" width="2" height="1" fill="#6baae0" opacity="0.7"/>
    <rect x="5" y="5" width="2" height="1" fill="#6baae0" opacity="0.5"/>
    <rect x="2" y="0" width="1" height="1" fill="#7bb8e8" opacity="0.5"/>
    <rect x="6" y="3" width="1" height="1" fill="#7bb8e8" opacity="0.4"/>
    <rect x="0" y="6" width="1" height="1" fill="#4e8ec4" opacity="0.5"/>
    <rect x="4" y="7" width="1" height="1" fill="#4e8ec4" opacity="0.4"/>
  </svg>`,

  ledge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
    <rect width="8" height="8" fill="#c8b88c"/>
    <rect x="0" y="6" width="8" height="2" fill="#d4a95a"/>
    <rect x="0" y="6" width="8" height="1" fill="#e0b860" opacity="0.6"/>
    <rect x="0" y="5" width="8" height="1" fill="#b89840" opacity="0.4"/>
    <rect x="1" y="1" width="1" height="1" fill="#bfae7e" opacity="0.3"/>
    <rect x="5" y="3" width="1" height="1" fill="#d4c49a" opacity="0.3"/>
  </svg>`,

  door: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
    <rect width="8" height="8" fill="#c8b88c"/>
    <rect x="1" y="1" width="6" height="7" fill="#8b5e3c"/>
    <rect x="1" y="1" width="6" height="1" fill="#a0704a" opacity="0.7"/>
    <rect x="2" y="2" width="2" height="3" fill="#6d4a2c" opacity="0.6"/>
    <rect x="4" y="2" width="2" height="3" fill="#6d4a2c" opacity="0.6"/>
    <rect x="5" y="4" width="1" height="1" fill="#d4a95a"/>
    <rect x="1" y="0" width="6" height="1" fill="#5a5a6e"/>
  </svg>`,

  sign: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
    <rect width="8" height="8" fill="#c8b88c"/>
    <rect x="3" y="4" width="2" height="4" fill="#6d4a2c"/>
    <rect x="1" y="1" width="6" height="4" fill="#b87333"/>
    <rect x="1" y="1" width="6" height="1" fill="#c88040" opacity="0.6"/>
    <rect x="2" y="2" width="4" height="1" fill="#8b5e3c" opacity="0.4"/>
    <rect x="2" y="3" width="3" height="1" fill="#8b5e3c" opacity="0.3"/>
  </svg>`,
};

/** タイルSVGをdata URIに変換（キャッシュ用） */
const tileDataUriCache: Record<string, string> = {};

export function getTileBackground(tileType: TileType): string {
  if (!tileDataUriCache[tileType]) {
    const svg = TILE_SVGS[tileType] ?? TILE_SVGS.ground;
    tileDataUriCache[tileType] = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  return tileDataUriCache[tileType];
}

// ─── プレイヤースプライト ─────────────────────────────

/** 16x16ピクセルアートのプレイヤーキャラ（方向別） */
export function PlayerSprite({ direction, size = 28 }: { direction: Direction; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: "pixelated" }}>
      {PLAYER_SVG_PATHS[direction]}
    </svg>
  );
}

const PLAYER_SVG_PATHS: Record<Direction, React.ReactNode> = {
  down: (
    <>
      {/* 帽子 */}
      <rect x="5" y="1" width="6" height="3" fill="#e94560" />
      <rect x="4" y="2" width="1" height="2" fill="#e94560" />
      <rect x="11" y="2" width="1" height="2" fill="#e94560" />
      <rect x="5" y="0" width="6" height="1" fill="#c83050" />
      {/* 顔 */}
      <rect x="5" y="4" width="6" height="4" fill="#fdd" />
      <rect x="6" y="5" width="1" height="1" fill="#333" />
      <rect x="9" y="5" width="1" height="1" fill="#333" />
      <rect x="7" y="7" width="2" height="1" fill="#d9a" />
      {/* 体 */}
      <rect x="4" y="8" width="8" height="4" fill="#4477cc" />
      <rect x="6" y="8" width="4" height="1" fill="#5588dd" />
      <rect x="7" y="9" width="2" height="2" fill="#fdd" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#445" />
      <rect x="9" y="12" width="2" height="2" fill="#445" />
      {/* 腕 */}
      <rect x="3" y="9" width="1" height="3" fill="#fdd" />
      <rect x="12" y="9" width="1" height="3" fill="#fdd" />
    </>
  ),
  up: (
    <>
      {/* 帽子（後ろ） */}
      <rect x="5" y="1" width="6" height="3" fill="#e94560" />
      <rect x="4" y="2" width="1" height="2" fill="#e94560" />
      <rect x="11" y="2" width="1" height="2" fill="#e94560" />
      <rect x="5" y="0" width="6" height="1" fill="#c83050" />
      {/* 後頭部 */}
      <rect x="5" y="4" width="6" height="4" fill="#654" />
      <rect x="5" y="4" width="6" height="1" fill="#543" />
      {/* 体（後ろ） */}
      <rect x="4" y="8" width="8" height="4" fill="#4477cc" />
      <rect x="6" y="8" width="4" height="1" fill="#3366bb" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#445" />
      <rect x="9" y="12" width="2" height="2" fill="#445" />
      {/* 腕 */}
      <rect x="3" y="9" width="1" height="3" fill="#fdd" />
      <rect x="12" y="9" width="1" height="3" fill="#fdd" />
    </>
  ),
  left: (
    <>
      {/* 帽子 */}
      <rect x="4" y="1" width="6" height="3" fill="#e94560" />
      <rect x="3" y="2" width="1" height="2" fill="#e94560" />
      <rect x="2" y="2" width="1" height="1" fill="#c83050" />
      <rect x="4" y="0" width="6" height="1" fill="#c83050" />
      {/* 顔（左向き） */}
      <rect x="4" y="4" width="6" height="4" fill="#fdd" />
      <rect x="5" y="5" width="1" height="1" fill="#333" />
      <rect x="4" y="7" width="2" height="1" fill="#d9a" />
      {/* 髪 */}
      <rect x="9" y="4" width="1" height="3" fill="#654" />
      {/* 体 */}
      <rect x="4" y="8" width="7" height="4" fill="#4477cc" />
      <rect x="5" y="8" width="3" height="1" fill="#5588dd" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#445" />
      <rect x="8" y="12" width="2" height="2" fill="#445" />
      {/* 腕 */}
      <rect x="3" y="9" width="1" height="3" fill="#fdd" />
    </>
  ),
  right: (
    <>
      {/* 帽子 */}
      <rect x="6" y="1" width="6" height="3" fill="#e94560" />
      <rect x="12" y="2" width="1" height="2" fill="#e94560" />
      <rect x="13" y="2" width="1" height="1" fill="#c83050" />
      <rect x="6" y="0" width="6" height="1" fill="#c83050" />
      {/* 顔（右向き） */}
      <rect x="6" y="4" width="6" height="4" fill="#fdd" />
      <rect x="10" y="5" width="1" height="1" fill="#333" />
      <rect x="10" y="7" width="2" height="1" fill="#d9a" />
      {/* 髪 */}
      <rect x="6" y="4" width="1" height="3" fill="#654" />
      {/* 体 */}
      <rect x="5" y="8" width="7" height="4" fill="#4477cc" />
      <rect x="8" y="8" width="3" height="1" fill="#5588dd" />
      {/* 足 */}
      <rect x="6" y="12" width="2" height="2" fill="#445" />
      <rect x="9" y="12" width="2" height="2" fill="#445" />
      {/* 腕 */}
      <rect x="12" y="9" width="1" height="3" fill="#fdd" />
    </>
  ),
};

// ─── NPCスプライト ─────────────────────────────────

export type NpcAppearance = "villager" | "trainer" | "gymleader" | "elder" | "nurse" | "shopkeeper";

/** NPCの外見を判定 */
export function getNpcAppearance(npcId: string, isTrainer: boolean): NpcAppearance {
  if (npcId.includes("gym") && npcId.includes("leader")) return "gymleader";
  if (npcId.includes("nurse") || npcId.includes("heal")) return "nurse";
  if (npcId.includes("shop") || npcId.includes("mart")) return "shopkeeper";
  if (npcId.includes("elder") || npcId.includes("professor")) return "elder";
  if (isTrainer) return "trainer";
  return "villager";
}

/** 16x16ピクセルアートのNPC */
export function NpcSprite({ appearance, size = 26 }: { appearance: NpcAppearance; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ imageRendering: "pixelated" }}>
      {NPC_SVG_PATHS[appearance]}
    </svg>
  );
}

const NPC_SVG_PATHS: Record<NpcAppearance, React.ReactNode> = {
  villager: (
    <>
      {/* 髪 */}
      <rect x="5" y="1" width="6" height="3" fill="#86592d" />
      <rect x="4" y="2" width="1" height="2" fill="#86592d" />
      <rect x="11" y="2" width="1" height="2" fill="#86592d" />
      {/* 顔 */}
      <rect x="5" y="4" width="6" height="4" fill="#fdd" />
      <rect x="6" y="5" width="1" height="1" fill="#333" />
      <rect x="9" y="5" width="1" height="1" fill="#333" />
      <rect x="7" y="7" width="2" height="1" fill="#d9a" />
      {/* 体 */}
      <rect x="4" y="8" width="8" height="4" fill="#7ab648" />
      <rect x="6" y="8" width="4" height="1" fill="#8cc655" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#654" />
      <rect x="9" y="12" width="2" height="2" fill="#654" />
    </>
  ),
  trainer: (
    <>
      {/* 帽子（赤） */}
      <rect x="5" y="0" width="6" height="2" fill="#d33" />
      <rect x="4" y="1" width="1" height="2" fill="#d33" />
      <rect x="11" y="1" width="1" height="2" fill="#d33" />
      <rect x="7" y="0" width="2" height="1" fill="#fff" />
      {/* 顔 */}
      <rect x="5" y="3" width="6" height="4" fill="#fdd" />
      <rect x="6" y="4" width="1" height="1" fill="#333" />
      <rect x="9" y="4" width="1" height="1" fill="#333" />
      <rect x="7" y="6" width="2" height="1" fill="#d9a" />
      {/* 体（黒） */}
      <rect x="4" y="7" width="8" height="5" fill="#333" />
      <rect x="6" y="7" width="4" height="1" fill="#555" />
      <rect x="7" y="8" width="2" height="2" fill="#d33" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#445" />
      <rect x="9" y="12" width="2" height="2" fill="#445" />
      {/* 腕 */}
      <rect x="3" y="8" width="1" height="3" fill="#fdd" />
      <rect x="12" y="8" width="1" height="3" fill="#fdd" />
    </>
  ),
  gymleader: (
    <>
      {/* 髪（派手） */}
      <rect x="4" y="0" width="8" height="4" fill="#e94560" />
      <rect x="3" y="1" width="1" height="3" fill="#e94560" />
      <rect x="12" y="1" width="1" height="3" fill="#e94560" />
      {/* 顔 */}
      <rect x="5" y="4" width="6" height="4" fill="#fdd" />
      <rect x="6" y="5" width="1" height="1" fill="#533483" />
      <rect x="9" y="5" width="1" height="1" fill="#533483" />
      <rect x="7" y="7" width="2" height="1" fill="#d9a" />
      {/* マント */}
      <rect x="3" y="8" width="10" height="4" fill="#533483" />
      <rect x="5" y="8" width="6" height="1" fill="#6a48a0" />
      <rect x="7" y="9" width="2" height="2" fill="#e94560" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#333" />
      <rect x="9" y="12" width="2" height="2" fill="#333" />
    </>
  ),
  elder: (
    <>
      {/* 白髪 */}
      <rect x="5" y="1" width="6" height="3" fill="#ccc" />
      <rect x="4" y="2" width="1" height="3" fill="#ccc" />
      <rect x="11" y="2" width="1" height="3" fill="#ccc" />
      {/* 顔 */}
      <rect x="5" y="4" width="6" height="4" fill="#ecc" />
      <rect x="6" y="5" width="1" height="1" fill="#333" />
      <rect x="9" y="5" width="1" height="1" fill="#333" />
      <rect x="6" y="5" width="4" height="1" fill="none" stroke="#bbb" strokeWidth="0.3" />
      <rect x="7" y="7" width="2" height="1" fill="#caa" />
      {/* 白衣 */}
      <rect x="4" y="8" width="8" height="4" fill="#eee" />
      <rect x="6" y="8" width="4" height="1" fill="#fff" />
      <rect x="7" y="9" width="1" height="1" fill="#ddd" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#654" />
      <rect x="9" y="12" width="2" height="2" fill="#654" />
    </>
  ),
  nurse: (
    <>
      {/* ナースキャップ */}
      <rect x="5" y="0" width="6" height="2" fill="#fff" />
      <rect x="7" y="0" width="2" height="1" fill="#f66" />
      {/* 髪 */}
      <rect x="4" y="2" width="8" height="2" fill="#f9c" />
      {/* 顔 */}
      <rect x="5" y="4" width="6" height="4" fill="#fdd" />
      <rect x="6" y="5" width="1" height="1" fill="#333" />
      <rect x="9" y="5" width="1" height="1" fill="#333" />
      <rect x="7" y="7" width="2" height="1" fill="#f99" />
      {/* エプロン */}
      <rect x="4" y="8" width="8" height="4" fill="#fcc" />
      <rect x="6" y="8" width="4" height="1" fill="#fff" />
      <rect x="7" y="9" width="2" height="1" fill="#f66" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#fff" />
      <rect x="9" y="12" width="2" height="2" fill="#fff" />
    </>
  ),
  shopkeeper: (
    <>
      {/* エプロンキャップ */}
      <rect x="5" y="0" width="6" height="2" fill="#5b9bd5" />
      {/* 髪 */}
      <rect x="4" y="2" width="8" height="2" fill="#654" />
      {/* 顔 */}
      <rect x="5" y="4" width="6" height="4" fill="#fdd" />
      <rect x="6" y="5" width="1" height="1" fill="#333" />
      <rect x="9" y="5" width="1" height="1" fill="#333" />
      <rect x="7" y="7" width="2" height="1" fill="#d9a" />
      {/* エプロン */}
      <rect x="4" y="8" width="8" height="4" fill="#5b9bd5" />
      <rect x="5" y="8" width="6" height="1" fill="#6baae0" />
      <rect x="6" y="9" width="4" height="2" fill="#fff" />
      {/* 足 */}
      <rect x="5" y="12" width="2" height="2" fill="#445" />
      <rect x="9" y="12" width="2" height="2" fill="#445" />
    </>
  ),
};

// ─── アイテムアイコン ─────────────────────────────

export type ItemCategory = "medicine" | "ball" | "battle" | "key";

/** 12x12ピクセルアートのアイテムアイコン */
export function ItemIcon({
  category,
  itemId,
  size = 20,
}: {
  category: ItemCategory;
  itemId?: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} style={{ imageRendering: "pixelated" }}>
      {ITEM_SVG_PATHS[category]}
    </svg>
  );
}

const ITEM_SVG_PATHS: Record<ItemCategory, React.ReactNode> = {
  medicine: (
    <>
      {/* ポーション瓶 */}
      <rect x="4" y="1" width="4" height="2" fill="#aaa" />
      <rect x="3" y="3" width="6" height="7" fill="#e94560" />
      <rect x="4" y="3" width="4" height="1" fill="#ff6b81" />
      <rect x="5" y="5" width="2" height="3" fill="#fff" opacity="0.5" />
      <rect x="4" y="6" width="4" height="1" fill="#fff" opacity="0.5" />
      <rect x="3" y="10" width="6" height="1" fill="#c83050" />
    </>
  ),
  ball: (
    <>
      {/* モンスターボール */}
      <rect x="3" y="2" width="6" height="4" fill="#e94560" />
      <rect x="2" y="3" width="1" height="3" fill="#e94560" />
      <rect x="9" y="3" width="1" height="3" fill="#e94560" />
      <rect x="2" y="5" width="8" height="1" fill="#333" />
      <rect x="3" y="6" width="6" height="4" fill="#fff" />
      <rect x="2" y="6" width="1" height="3" fill="#fff" />
      <rect x="9" y="6" width="1" height="3" fill="#fff" />
      <rect x="5" y="5" width="2" height="2" fill="#fff" />
      <rect x="5" y="5" width="2" height="2" fill="none" stroke="#333" strokeWidth="0.5" />
    </>
  ),
  battle: (
    <>
      {/* 剣アイコン */}
      <rect x="5" y="1" width="2" height="6" fill="#B8B8D0" />
      <rect x="5" y="1" width="2" height="1" fill="#ddd" />
      <rect x="3" y="7" width="6" height="1" fill="#8b5e3c" />
      <rect x="4" y="7" width="4" height="1" fill="#a0704a" />
      <rect x="5" y="8" width="2" height="3" fill="#6d4a2c" />
      <rect x="5" y="8" width="2" height="1" fill="#8b5e3c" />
    </>
  ),
  key: (
    <>
      {/* 鍵アイテム（星） */}
      <rect x="5" y="1" width="2" height="2" fill="#F8D030" />
      <rect x="3" y="3" width="6" height="2" fill="#F8D030" />
      <rect x="4" y="5" width="1" height="2" fill="#F8D030" />
      <rect x="7" y="5" width="1" height="2" fill="#F8D030" />
      <rect x="5" y="3" width="2" height="1" fill="#FFE860" />
      <rect x="5" y="7" width="2" height="2" fill="#d4a020" />
      <rect x="5" y="9" width="2" height="1" fill="#b89018" />
    </>
  ),
};
