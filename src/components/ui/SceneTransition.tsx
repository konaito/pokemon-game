"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 画面遷移アニメーション (#130)
 * バトル開始・マップ遷移・フェード等のトランジション演出
 */

export type TransitionType = "fade" | "battle" | "wipe" | "none";

export interface SceneTransitionProps {
  /** トランジションが発火するかどうか */
  active: boolean;
  /** トランジション種別 */
  type: TransitionType;
  /** 完了時コールバック */
  onComplete?: () => void;
  /** 演出時間(ms) */
  duration?: number;
}

export function SceneTransition({
  active,
  type,
  onComplete,
  duration = 600,
}: SceneTransitionProps) {
  const [phase, setPhase] = useState<"idle" | "in" | "hold" | "out">("idle");

  useEffect(() => {
    if (!active || type === "none") {
      // reset on deactivation via timeout to avoid sync setState in effect
      const resetTimer = setTimeout(() => setPhase("idle"), 0);
      return () => clearTimeout(resetTimer);
    }

    const startTimer = setTimeout(() => setPhase("in"), 0);

    const holdTimer = setTimeout(() => {
      setPhase("hold");
    }, duration / 2);

    const outTimer = setTimeout(() => {
      setPhase("out");
    }, duration * 0.6);

    const doneTimer = setTimeout(() => {
      setPhase("idle");
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [active, type, duration, onComplete]);

  if (phase === "idle" || type === "none") return null;

  if (type === "battle") {
    return <BattleTransition phase={phase} duration={duration} />;
  }

  if (type === "wipe") {
    return <WipeTransition phase={phase} duration={duration} />;
  }

  // デフォルト: フェード
  return <FadeTransition phase={phase} duration={duration} />;
}

function FadeTransition({ phase, duration }: { phase: "in" | "hold" | "out"; duration: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] bg-black"
      style={{
        opacity: phase === "out" ? 0 : 1,
        transition: `opacity ${duration / 2}ms ease-in-out`,
      }}
    />
  );
}

function BattleTransition({ phase, duration }: { phase: "in" | "hold" | "out"; duration: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {/* 赤いフラッシュ */}
      <div
        className="absolute inset-0"
        style={{
          background:
            phase === "in"
              ? "radial-gradient(circle at 50% 50%, rgba(233,69,96,0.4) 0%, rgba(0,0,0,0.9) 70%)"
              : "transparent",
          opacity: phase === "out" ? 0 : 1,
          transition: `opacity ${duration / 3}ms ease-out`,
        }}
      />

      {/* 斜めストライプワイプ */}
      {(phase === "in" || phase === "hold") && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="absolute bg-black"
              style={{
                top: 0,
                bottom: 0,
                left: `${i * 12.5}%`,
                width: "12.5%",
                transform:
                  phase === "in"
                    ? `translateY(${i % 2 === 0 ? "-100%" : "100%"})`
                    : "translateY(0)",
                transition: `transform ${duration / 3}ms ease-in-out ${i * 30}ms`,
              }}
            />
          ))}
        </>
      )}

      {/* アウト時: サークルオープン */}
      {phase === "out" && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            clipPath: "circle(150% at 50% 50%)",
            animation: `battle-intro ${duration / 2}ms ease-out forwards`,
          }}
        />
      )}
    </div>
  );
}

function WipeTransition({ phase, duration }: { phase: "in" | "hold" | "out"; duration: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] bg-[#1a1a2e]"
      style={{
        opacity: phase === "out" ? 0 : 1,
        transition: `opacity ${duration / 2}ms ease-in-out`,
      }}
    >
      {/* マップ名表示用の中央テキストエリア */}
      {phase === "hold" && (
        <div className="flex h-full items-center justify-center">
          <div className="animate-fade-in h-1 w-32 rounded-full bg-[#533483]/50" />
        </div>
      )}
    </div>
  );
}

/**
 * トランジション管理フック
 * Game.tsxで使用して画面遷移を制御する
 */
export function useSceneTransition() {
  const [transition, setTransition] = useState<{
    active: boolean;
    type: TransitionType;
    callback?: () => void;
    duration?: number;
  }>({ active: false, type: "none" });

  const startTransition = useCallback(
    (type: TransitionType, callback?: () => void, duration?: number) => {
      setTransition({ active: true, type, callback, duration });
    },
    [],
  );

  const handleComplete = useCallback(() => {
    const cb = transition.callback;
    setTransition({ active: false, type: "none" });
    cb?.();
  }, [transition.callback]);

  return {
    transitionActive: transition.active,
    transitionType: transition.type,
    transitionDuration: transition.duration,
    startTransition,
    handleComplete,
  };
}
