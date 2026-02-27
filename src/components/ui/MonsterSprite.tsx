"use client";

import { memo, useMemo } from "react";
import { TYPE_HEX } from "@/lib/design-tokens";
import { getSpriteData } from "@/data/sprites";

/**
 * モンスタースプライト
 * 20x20 ピクセルアートを SVG <rect> グリッドでレンダリング
 */

export interface MonsterSpriteProps {
  speciesId: string;
  types: string[];
  size?: number;
  className?: string;
  /** バトル画面で反転表示（相手側） */
  flip?: boolean;
  /** ひんし状態 */
  fainted?: boolean;
}

/** タイプの主色を取得 */
function getTypeColor(types: string[]): string {
  return TYPE_HEX[types[0]] ?? "#A8A878";
}

/** タイプの副色を取得 */
function getSecondaryColor(types: string[]): string {
  if (types.length > 1) return TYPE_HEX[types[1]] ?? "#A8A878";
  const hex = TYPE_HEX[types[0]] ?? "#A8A878";
  return lightenColor(hex, 40);
}

function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function darkenColor(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** グリッド文字をカラーに変換するマップを構築 */
function buildColorMap(
  primary: string,
  secondary: string,
  palette: Record<string, string>,
): Record<string, string> {
  const map: Record<string, string> = {
    "1": primary,
    "2": secondary,
    "3": darkenColor(primary, 40),
    w: "#FFFFFF",
    "-": "#333333",
  };
  for (const [key, color] of Object.entries(palette)) {
    map[key] = color;
  }
  return map;
}

/** グリッドデータから SVG <rect> 要素配列を生成 */
function renderPixelRects(grid: string[], colorMap: Record<string, string>): React.ReactElement[] {
  const rects: React.ReactElement[] = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ".") continue;
      const color = colorMap[ch];
      if (!color) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />);
    }
  }
  return rects;
}

/** フォールバック: スプライトデータ未定義時の簡易表示 */
function renderFallback(primary: string): React.ReactElement[] {
  const dark = darkenColor(primary, 40);
  return [
    <ellipse key="body" cx={10} cy={12} rx={6} ry={5} fill={primary} />,
    <ellipse key="head" cx={10} cy={7} rx={4} ry={3.5} fill={primary} />,
    <circle key="eye-l" cx={8.5} cy={6.5} r={0.8} fill="#FFF" />,
    <circle key="pupil-l" cx={8.5} cy={6.5} r={0.5} fill="#333" />,
    <circle key="eye-r" cx={11.5} cy={6.5} r={0.8} fill="#FFF" />,
    <circle key="pupil-r" cx={11.5} cy={6.5} r={0.5} fill="#333" />,
    <rect key="leg-l" x={7} y={16} width={1.5} height={2} rx={0.5} fill={dark} />,
    <rect key="leg-r" x={11.5} y={16} width={1.5} height={2} rx={0.5} fill={dark} />,
  ];
}

export const MonsterSprite = memo(function MonsterSprite({
  speciesId,
  types,
  size = 64,
  className = "",
  flip = false,
  fainted = false,
}: MonsterSpriteProps) {
  const primary = getTypeColor(types);
  const secondary = getSecondaryColor(types);
  const sprite = getSpriteData(speciesId);

  const rects = useMemo(() => {
    if (!sprite) return renderFallback(primary);
    const colorMap = buildColorMap(primary, secondary, sprite.palette);
    return renderPixelRects(sprite.grid, colorMap);
  }, [speciesId, primary, secondary, sprite]);

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        transform: flip ? "scaleX(-1)" : undefined,
        opacity: fainted ? 0.3 : 1,
        filter: fainted ? "grayscale(0.8)" : undefined,
        transition: "opacity 0.3s, filter 0.3s",
      }}
    >
      <svg viewBox="0 0 20 20" width={size} height={size} style={{ imageRendering: "pixelated" }}>
        {rects}
      </svg>
    </div>
  );
});

/**
 * オーバーワールド用のミニスプライト
 * 小さいサイズでシンプル表示
 */
export function MonsterMiniSprite({
  types,
  size = 24,
  className = "",
}: {
  types: string[];
  size?: number;
  className?: string;
}) {
  const primary = getTypeColor(types);

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 16 16" width={size} height={size}>
        <circle cx="8" cy="8" r="6" fill={primary} />
        <circle cx="6" cy="7" r="1" fill="#FFF" />
        <circle cx="10" cy="7" r="1" fill="#FFF" />
      </svg>
    </div>
  );
}
