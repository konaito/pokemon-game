"use client";

import { useState, useEffect, useCallback } from "react";
import type { TypeId } from "@/types";

/** エフェクト種別 */
export type EffectType = "particles" | "flash" | "shake" | "wave" | "beam";

/** バトルエフェクト定義 */
export interface BattleEffectDef {
  type: EffectType;
  color: string;
  secondaryColor?: string;
  duration: number;
  particleCount?: number;
  direction?: "to_target" | "from_self" | "radial" | "upward";
}

/** タイプ別デフォルトエフェクト */
const TYPE_EFFECTS: Record<TypeId, BattleEffectDef> = {
  normal: { type: "flash", color: "#A9A9A9", duration: 300 },
  fire: {
    type: "particles",
    color: "#FF4500",
    secondaryColor: "#FF6B35",
    duration: 600,
    particleCount: 12,
    direction: "to_target",
  },
  water: {
    type: "wave",
    color: "#1E90FF",
    secondaryColor: "#00BFFF",
    duration: 500,
    direction: "to_target",
  },
  grass: {
    type: "particles",
    color: "#228B22",
    secondaryColor: "#32CD32",
    duration: 500,
    particleCount: 8,
    direction: "radial",
  },
  electric: {
    type: "beam",
    color: "#FFD700",
    secondaryColor: "#FFF700",
    duration: 400,
    direction: "to_target",
  },
  ice: {
    type: "particles",
    color: "#ADD8E6",
    secondaryColor: "#E0FFFF",
    duration: 500,
    particleCount: 10,
    direction: "radial",
  },
  fighting: { type: "shake", color: "#FF8C00", duration: 400 },
  poison: {
    type: "particles",
    color: "#9932CC",
    secondaryColor: "#BA55D3",
    duration: 500,
    particleCount: 8,
    direction: "upward",
  },
  ground: {
    type: "shake",
    color: "#8B4513",
    secondaryColor: "#D2B48C",
    duration: 500,
  },
  flying: {
    type: "wave",
    color: "#87CEEB",
    duration: 400,
    direction: "from_self",
  },
  psychic: {
    type: "wave",
    color: "#FF69B4",
    secondaryColor: "#DA70D6",
    duration: 600,
    direction: "radial",
  },
  bug: {
    type: "particles",
    color: "#9ACD32",
    duration: 350,
    particleCount: 6,
    direction: "to_target",
  },
  rock: {
    type: "shake",
    color: "#A0522D",
    duration: 500,
  },
  ghost: {
    type: "wave",
    color: "#663399",
    secondaryColor: "#4B0082",
    duration: 600,
    direction: "radial",
  },
  dragon: {
    type: "beam",
    color: "#7B68EE",
    secondaryColor: "#9370DB",
    duration: 500,
    direction: "to_target",
  },
  dark: {
    type: "flash",
    color: "#2F2F2F",
    secondaryColor: "#696969",
    duration: 400,
  },
  steel: {
    type: "beam",
    color: "#C0C0C0",
    secondaryColor: "#808080",
    duration: 400,
    direction: "to_target",
  },
  fairy: {
    type: "particles",
    color: "#FFB6C1",
    secondaryColor: "#FF69B4",
    duration: 500,
    particleCount: 10,
    direction: "radial",
  },
};

/** エフェクト定義を取得 */
export function getEffectForType(typeId: TypeId): BattleEffectDef {
  return TYPE_EFFECTS[typeId];
}

/** エフェクト再生のプロパティ */
interface BattleEffectProps {
  /** 再生するエフェクト（nullで非表示） */
  effect: BattleEffectDef | null;
  /** 対象がプレイヤー側か相手側か */
  target: "player" | "opponent";
  /** 再生完了コールバック */
  onComplete?: () => void;
}

/** パーティクル1つの状態 */
interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  delay: number;
}

function generateParticles(effect: BattleEffectDef, target: "player" | "opponent"): Particle[] {
  const count = effect.particleCount ?? 8;
  const particles: Particle[] = [];
  const targetX = target === "opponent" ? 30 : 70;
  const targetY = 50;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 20 + Math.random() * 30;
    let dx: number, dy: number;

    switch (effect.direction) {
      case "to_target":
        dx = (targetX - 50) * 0.3 + Math.cos(angle) * speed * 0.3;
        dy = Math.sin(angle) * speed * 0.5;
        break;
      case "upward":
        dx = (Math.random() - 0.5) * 20;
        dy = -(15 + Math.random() * 25);
        break;
      case "radial":
        dx = Math.cos(angle) * speed * 0.5;
        dy = Math.sin(angle) * speed * 0.5;
        break;
      default:
        dx = Math.cos(angle) * speed * 0.4;
        dy = Math.sin(angle) * speed * 0.4;
    }

    particles.push({
      id: i,
      x: targetX + (Math.random() - 0.5) * 10,
      y: targetY + (Math.random() - 0.5) * 10,
      dx,
      dy,
      color: i % 2 === 0 ? effect.color : (effect.secondaryColor ?? effect.color),
      size: 3 + Math.random() * 4,
      delay: Math.random() * 100,
    });
  }
  return particles;
}

/** バトルエフェクトコンポーネント */
export function BattleEffect({ effect, target, onComplete }: BattleEffectProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const startEffect = useCallback(() => {
    if (!effect) return;
    setIsVisible(true);

    if (effect.type === "particles") {
      setParticles(generateParticles(effect, target));
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setParticles([]);
      onComplete?.();
    }, effect.duration);

    return () => clearTimeout(timer);
  }, [effect, target, onComplete]);

  useEffect(() => {
    if (effect) {
      const cleanup = startEffect();
      return cleanup;
    }
  }, [effect, startEffect]);

  if (!effect || !isVisible) return null;

  const targetX = target === "opponent" ? "25%" : "70%";
  const targetY = "45%";

  // Flash エフェクト
  if (effect.type === "flash") {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: `radial-gradient(circle at ${targetX} ${targetY}, ${effect.color}40, transparent 60%)`,
          animation: `battle-flash ${effect.duration}ms ease-out forwards`,
        }}
      />
    );
  }

  // Shake エフェクト
  if (effect.type === "shake") {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          animation: `battle-shake ${effect.duration}ms ease-in-out`,
          background: `radial-gradient(circle at ${targetX} 80%, ${effect.color}30, transparent 50%)`,
        }}
      />
    );
  }

  // Wave エフェクト
  if (effect.type === "wave") {
    return (
      <div className="pointer-events-none absolute inset-0 z-20">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: targetX,
              top: targetY,
              width: "10px",
              height: "10px",
              transform: "translate(-50%, -50%)",
              border: `2px solid ${i % 2 === 0 ? effect.color : (effect.secondaryColor ?? effect.color)}`,
              animation: `battle-wave ${effect.duration}ms ease-out ${i * 100}ms forwards`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    );
  }

  // Beam エフェクト
  if (effect.type === "beam") {
    const fromX = target === "opponent" ? "75%" : "25%";
    return (
      <div className="pointer-events-none absolute inset-0 z-20">
        <div
          className="absolute"
          style={{
            left: fromX,
            top: targetY,
            width: "0",
            height: "4px",
            background: `linear-gradient(90deg, ${effect.color}, ${effect.secondaryColor ?? effect.color})`,
            boxShadow: `0 0 10px ${effect.color}, 0 0 20px ${effect.color}80`,
            animation: `battle-beam ${effect.duration}ms ease-out forwards`,
            transformOrigin: target === "opponent" ? "left center" : "right center",
          }}
        />
      </div>
    );
  }

  // Particles エフェクト
  if (effect.type === "particles") {
    return (
      <div className="pointer-events-none absolute inset-0 z-20">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
                animation: `battle-particle ${effect.duration}ms ease-out ${p.delay}ms forwards`,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    );
  }

  return null;
}
