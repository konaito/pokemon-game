/**
 * Particles — 汎用パーティクルエフェクト
 * Math.sin + フレーム数で座標計算。CSS animation禁止。
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  drift: number;
};

export type ParticlesProps = {
  count?: number;
  color?: string;
  /** パーティクルの基本サイズ */
  baseSize?: number;
  /** 動き方: rise=上昇, fall=下降, float=浮遊, converge=中央収束 */
  mode?: "rise" | "fall" | "float" | "converge";
  opacity?: number;
  /** 収束先 (convergeモード用) */
  convergeX?: number;
  convergeY?: number;
  seed?: number;
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const Particles: React.FC<ParticlesProps> = ({
  count = 30,
  color = "#FFFFFF",
  baseSize = 4,
  mode = "rise",
  opacity = 0.6,
  convergeX = 960,
  convergeY = 540,
  seed = 42,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const rand = seededRandom(seed);
  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rand() * width,
    y: rand() * height,
    size: baseSize * (0.5 + rand() * 1.5),
    speed: 0.5 + rand() * 2,
    phase: rand() * Math.PI * 2,
    drift: (rand() - 0.5) * 2,
  }));

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {particles.map((p) => {
        const t = frame * 0.02 * p.speed;
        let px: number;
        let py: number;

        switch (mode) {
          case "rise":
            px = p.x + Math.sin(t + p.phase) * 30 * p.drift;
            py = ((p.y - frame * p.speed * 1.5) % (height + 40)) + 20;
            if (py < -20) py += height + 40;
            break;
          case "fall":
            px = p.x + Math.sin(t + p.phase) * 20 * p.drift;
            py = ((p.y + frame * p.speed) % (height + 40)) - 20;
            break;
          case "float":
            px = p.x + Math.sin(t + p.phase) * 40;
            py = p.y + Math.cos(t * 0.7 + p.phase) * 30;
            break;
          case "converge": {
            const progress = Math.min(1, frame / 150);
            const ease = progress * progress * (3 - 2 * progress);
            px = p.x + (convergeX - p.x) * ease + Math.sin(t + p.phase) * 20 * (1 - ease);
            py = p.y + (convergeY - p.y) * ease + Math.cos(t + p.phase) * 20 * (1 - ease);
            break;
          }
        }

        const particleOpacity = opacity * (0.3 + 0.7 * Math.abs(Math.sin(t * 2 + p.phase)));

        return (
          <circle key={p.id} cx={px} cy={py} r={p.size} fill={color} opacity={particleOpacity} />
        );
      })}
    </svg>
  );
};
