"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 進化アニメーション (#86)
 * モンスター進化時の演出: 光る→シルエット切り替え→新モンスター登場
 */

export type EvolutionPhase =
  | "idle"
  | "start" // おめでとう！テキスト表示
  | "glow" // 白く光り始める
  | "flash" // 画面全体フラッシュ
  | "transform" // シルエット変化
  | "reveal" // 新モンスター登場
  | "complete"; // 完了

export interface EvolutionAnimationProps {
  /** 進化前のモンスター名 */
  fromName: string;
  /** 進化後のモンスター名 */
  toName: string;
  /** アニメーション開始フラグ */
  isPlaying: boolean;
  /** 完了時コールバック */
  onComplete: () => void;
  /** キャンセル（B連打）可能か */
  cancellable?: boolean;
  /** キャンセル時コールバック */
  onCancel?: () => void;
}

/** 各フェーズの時間（ms） */
const PHASE_DURATIONS: Record<EvolutionPhase, number> = {
  idle: 0,
  start: 2000,
  glow: 2000,
  flash: 600,
  transform: 1500,
  reveal: 2000,
  complete: 0,
};

export function EvolutionAnimation({
  fromName,
  toName,
  isPlaying,
  onComplete,
  cancellable = true,
  onCancel,
}: EvolutionAnimationProps) {
  const [phase, setPhase] = useState<EvolutionPhase>("idle");
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [silhouetteScale, setSilhouetteScale] = useState(1);
  const [cancelPressCount, setCancelPressCount] = useState(0);

  // フェーズ遷移
  useEffect(() => {
    if (!isPlaying) {
      setPhase("idle");
      setGlowIntensity(0);
      setFlashOpacity(0);
      setSilhouetteScale(1);
      setCancelPressCount(0);
      return;
    }

    if (phase === "idle") {
      setPhase("start");
    }
  }, [isPlaying, phase]);

  // 各フェーズのアニメーション
  useEffect(() => {
    if (phase === "idle" || phase === "complete") return;

    const duration = PHASE_DURATIONS[phase];
    const timers: ReturnType<typeof setTimeout>[] = [];

    switch (phase) {
      case "start":
        // テキスト表示後に次フェーズ
        timers.push(setTimeout(() => setPhase("glow"), duration));
        break;

      case "glow": {
        // 徐々に白く光る（パルス効果）
        let glowStep = 0;
        const glowInterval = setInterval(() => {
          glowStep++;
          // サイン波でパルス + 徐々に強くなる
          const base = glowStep / 20;
          const pulse = Math.sin(glowStep * 0.5) * 0.15;
          setGlowIntensity(Math.min(1, base + pulse));
        }, 100);
        timers.push(
          setTimeout(() => {
            clearInterval(glowInterval);
            setGlowIntensity(1);
            setPhase("flash");
          }, duration),
        );
        break;
      }

      case "flash":
        // 全画面フラッシュ
        setFlashOpacity(1);
        timers.push(
          setTimeout(() => {
            setFlashOpacity(0);
            setPhase("transform");
          }, duration),
        );
        break;

      case "transform": {
        // シルエット変化アニメーション
        setSilhouetteScale(1.3);
        timers.push(
          setTimeout(() => {
            setSilhouetteScale(0.8);
          }, duration * 0.3),
        );
        timers.push(
          setTimeout(() => {
            setSilhouetteScale(1);
            setGlowIntensity(0);
            setPhase("reveal");
          }, duration),
        );
        break;
      }

      case "reveal":
        // 新モンスター登場テキスト
        timers.push(
          setTimeout(() => {
            setPhase("complete");
            onComplete();
          }, duration),
        );
        break;
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [phase, onComplete]);

  // Bボタン連打でキャンセル
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!cancellable || !onCancel) return;
      if (phase !== "glow" && phase !== "start") return;

      if (e.key === "Escape" || e.key === "x") {
        setCancelPressCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            onCancel();
            return 0;
          }
          return next;
        });
      }

      // 進行キー
      if (e.key === "Enter" || e.key === "z" || e.key === " ") {
        // 何もしない（進化は自動進行）
      }
    },
    [cancellable, onCancel, phase],
  );

  if (!isPlaying && phase === "idle") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-label="進化アニメーション"
    >
      {/* 背景のグラデーション */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, rgba(100, 149, 237, ${glowIntensity * 0.3}), transparent 70%)`,
          transition: "all 200ms ease-out",
        }}
      />

      {/* 全画面フラッシュ */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          opacity: flashOpacity,
          transition: "opacity 200ms ease-out",
        }}
      />

      {/* テキスト: "おや？" */}
      {phase === "start" && (
        <div className="absolute top-8 w-full text-center">
          <p className="font-mono text-2xl text-white">おや…？</p>
          <p className="mt-2 font-mono text-xl text-gray-300">{fromName}のようすが…！</p>
        </div>
      )}

      {/* モンスターシルエット */}
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: `scale(${silhouetteScale})`,
          transition: "transform 300ms ease-out",
        }}
      >
        {/* 光のオーラ */}
        <div
          className="absolute h-40 w-40 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255, 255, 255, ${glowIntensity * 0.8}), rgba(200, 200, 255, ${glowIntensity * 0.3}), transparent)`,
            filter: `blur(${10 + glowIntensity * 20}px)`,
            transition: "all 200ms ease-out",
          }}
        />

        {/* モンスターアイコン（プレースホルダー） */}
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-full text-5xl"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${glowIntensity * 0.3 + 0.1})`,
            boxShadow: `0 0 ${20 + glowIntensity * 40}px rgba(255, 255, 255, ${glowIntensity * 0.5})`,
            transition: "all 200ms ease-out",
          }}
        >
          {phase === "reveal" || phase === "complete" ? "✨" : "🔮"}
        </div>
      </div>

      {/* テキスト: 進化完了 */}
      {phase === "reveal" && (
        <div className="absolute bottom-16 w-full text-center">
          <p className="font-mono text-lg text-gray-300">おめでとう！ {fromName}は</p>
          <p className="mt-1 font-mono text-2xl font-bold text-white">{toName}に　しんかした！</p>
        </div>
      )}

      {/* キャンセルヒント */}
      {cancellable && (phase === "start" || phase === "glow") && (
        <div className="absolute bottom-4 w-full text-center">
          <p className="font-mono text-xs text-gray-600">Bボタン(X)を3回押すと進化をキャンセル</p>
        </div>
      )}
    </div>
  );
}
