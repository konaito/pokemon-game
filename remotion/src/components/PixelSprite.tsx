/**
 * PixelSprite — ゲーム本体の MonsterSprite.tsx のロジックを Remotion用に移植
 * React memo / useMemo / CSS transition なしの純粋SVG描画
 */
import React from "react";
import { getSpriteData } from "../sprite-data";
import { TYPE_HEX } from "../styles";

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

function getTypeColor(types: string[]): string {
  return TYPE_HEX[types[0]] ?? "#A8A878";
}

function getSecondaryColor(types: string[]): string {
  if (types.length > 1) return TYPE_HEX[types[1]] ?? "#A8A878";
  return lightenColor(TYPE_HEX[types[0]] ?? "#A8A878", 40);
}

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

export type PixelSpriteProps = {
  speciesId: string;
  types: string[];
  size?: number;
  flip?: boolean;
  opacity?: number;
  /** シルエットモード: 全ピクセルを指定色で描画 */
  silhouetteColor?: string;
  /** グローフィルタ用の色 */
  glowColor?: string;
  glowIntensity?: number;
};

export const PixelSprite: React.FC<PixelSpriteProps> = ({
  speciesId,
  types,
  size = 200,
  flip = false,
  opacity = 1,
  silhouetteColor,
  glowColor,
  glowIntensity = 10,
}) => {
  const primary = getTypeColor(types);
  const secondary = getSecondaryColor(types);
  const sprite = getSpriteData(speciesId);

  if (!sprite) return null;

  const colorMap = buildColorMap(primary, secondary, sprite.palette);
  const filterId = glowColor ? `glow-${speciesId}` : undefined;

  const rects: React.ReactElement[] = [];
  for (let y = 0; y < sprite.grid.length; y++) {
    const row = sprite.grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ".") continue;
      const color = silhouetteColor ?? colorMap[ch];
      if (!color) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />);
    }
  }

  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      style={{
        imageRendering: "pixelated",
        transform: flip ? "scaleX(-1)" : undefined,
        opacity,
      }}
    >
      {glowColor && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glowIntensity / 20} result="blur" />
            <feFlood floodColor={glowColor} floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={filterId ? `url(#${filterId})` : undefined}>{rects}</g>
    </svg>
  );
};
