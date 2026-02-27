"use client";

import { useState, useEffect, useCallback } from "react";
import { TYPE_HEX } from "@/lib/design-tokens";

/**
 * バトルアニメーション (#83)
 * 技エフェクト、被ダメージ、瀕死演出
 */

/** アニメーションの種類 */
export type BattleAnimationType =
  | "attack_physical"
  | "attack_special"
  | "damage"
  | "faint"
  | "status_inflict"
  | "stat_up"
  | "stat_down"
  | "heal";

export interface BattleAnimationEvent {
  type: BattleAnimationType;
  /** 対象: "player" | "opponent" */
  target: "player" | "opponent";
  /** 技タイプ（エフェクト色の決定に使用） */
  moveType?: string;
  /** アニメーション時間（ms） */
  duration?: number;
}

export interface BattleAnimationProps {
  /** 再生するアニメーションイベント */
  event: BattleAnimationEvent | null;
  /** アニメーション完了時のコールバック */
  onComplete: () => void;
}

/**
 * バトルフィールド上のアニメーションオーバーレイ
 * BattleScreen内のバトルアリーナ部分に重ねて使用
 */
export function BattleAnimation({ event, onComplete }: BattleAnimationProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const reset = useCallback(() => {
    setPhase("idle");
    setOpacity(0);
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  useEffect(() => {
    if (!event) {
      reset();
      return;
    }

    setPhase("playing");
    const duration = event.duration ?? getDefaultDuration(event.type);

    // アニメーションのキーフレームをsetTimeoutで再現
    const timers: ReturnType<typeof setTimeout>[] = [];

    switch (event.type) {
      case "attack_physical": {
        // 突進アニメーション: 前に飛び出す→戻る
        setOpacity(0);
        const dir = event.target === "opponent" ? -1 : 1;
        timers.push(setTimeout(() => setTranslateX(dir * 30), 0));
        timers.push(setTimeout(() => setTranslateX(0), duration * 0.4));
        timers.push(
          setTimeout(() => {
            // ヒットフラッシュ
            setOpacity(1);
            setScale(1.2);
          }, duration * 0.35),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0);
            setScale(1);
          }, duration * 0.6),
        );
        break;
      }
      case "attack_special": {
        // 特殊技: 光弾エフェクト
        setOpacity(0);
        setScale(0.3);
        timers.push(
          setTimeout(() => {
            setOpacity(1);
            setScale(1.5);
          }, duration * 0.1),
        );
        timers.push(
          setTimeout(() => {
            setScale(2);
            setOpacity(0);
          }, duration * 0.6),
        );
        break;
      }
      case "damage": {
        // 被ダメ: 点滅
        let flashCount = 0;
        const flashInterval = setInterval(() => {
          flashCount++;
          setOpacity(flashCount % 2 === 0 ? 0 : 0.6);
          if (flashCount >= 6) {
            clearInterval(flashInterval);
            setOpacity(0);
          }
        }, duration / 7);
        timers.push(setTimeout(() => clearInterval(flashInterval), duration));
        break;
      }
      case "faint": {
        // 瀕死: 下にスライドしながらフェードアウト
        setOpacity(0);
        setTranslateY(0);
        timers.push(
          setTimeout(() => {
            setOpacity(0.5);
            setTranslateY(40);
          }, duration * 0.2),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0);
            setTranslateY(80);
          }, duration * 0.6),
        );
        break;
      }
      case "status_inflict": {
        // 状態異常付与: パルス
        setScale(1);
        setOpacity(0);
        timers.push(
          setTimeout(() => {
            setOpacity(0.7);
            setScale(1.3);
          }, duration * 0.1),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0.4);
            setScale(1);
          }, duration * 0.4),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0);
          }, duration * 0.7),
        );
        break;
      }
      case "stat_up": {
        // ステータスアップ: 上に矢印フロート
        setOpacity(0);
        setTranslateY(20);
        timers.push(
          setTimeout(() => {
            setOpacity(1);
            setTranslateY(-20);
          }, duration * 0.1),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0);
            setTranslateY(-40);
          }, duration * 0.6),
        );
        break;
      }
      case "stat_down": {
        // ステータスダウン: 下に矢印フロート
        setOpacity(0);
        setTranslateY(-20);
        timers.push(
          setTimeout(() => {
            setOpacity(1);
            setTranslateY(20);
          }, duration * 0.1),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0);
            setTranslateY(40);
          }, duration * 0.6),
        );
        break;
      }
      case "heal": {
        // 回復: 緑のきらめき
        setOpacity(0);
        setScale(0.5);
        timers.push(
          setTimeout(() => {
            setOpacity(0.8);
            setScale(1.2);
          }, duration * 0.15),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0.4);
            setScale(1.5);
          }, duration * 0.5),
        );
        timers.push(
          setTimeout(() => {
            setOpacity(0);
          }, duration * 0.8),
        );
        break;
      }
    }

    // 完了通知
    timers.push(
      setTimeout(() => {
        reset();
        setPhase("done");
        onComplete();
      }, duration),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [event, onComplete, reset]);

  if (!event || phase === "idle") return null;

  const color = getEffectColor(event);
  const isTargetLeft = event.target === "opponent";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* メインエフェクト */}
      <div
        className="absolute"
        style={{
          left: isTargetLeft ? "25%" : "65%",
          top: "40%",
          transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
          opacity,
          transition: "all 150ms ease-out",
        }}
      >
        {/* 中心の光球 */}
        <div
          className="h-16 w-16 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}cc, ${color}40, transparent)`,
            boxShadow: `0 0 30px ${color}80, 0 0 60px ${color}30`,
          }}
        />
        {/* 飛散パーティクル */}
        {(event.type === "attack_physical" || event.type === "attack_special") &&
          opacity > 0 &&
          Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 * Math.PI) / 180;
            const dist = 20 + i * 5;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: color,
                  transform: `translate(-50%, -50%) translate(${Math.cos(angle) * dist * scale}px, ${Math.sin(angle) * dist * scale}px)`,
                  opacity: opacity * (1 - i * 0.12),
                  boxShadow: `0 0 6px ${color}`,
                  transition: "all 120ms ease-out",
                }}
              />
            );
          })}
      </div>

      {/* ダメージ時のフラッシュ＋シェイク */}
      {event.type === "damage" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#ffffff",
            opacity: opacity * 0.35,
            transition: "opacity 60ms ease-out",
          }}
        />
      )}

      {/* 瀕死の暗転 */}
      {event.type === "faint" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#000000",
            opacity: opacity * 0.5,
            transition: "opacity 300ms ease-out",
          }}
        />
      )}

      {/* 回復のきらめきパーティクル */}
      {event.type === "heal" &&
        opacity > 0 &&
        Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: isTargetLeft ? `${20 + i * 3}%` : `${60 + i * 3}%`,
              top: `${30 + i * 6}%`,
              transform: `translateY(${translateY - i * 8}px)`,
              opacity: opacity * (1 - i * 0.15),
              transition: "all 200ms ease-out",
            }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: "#78C850",
                boxShadow: "0 0 4px #78C850",
              }}
            />
          </div>
        ))}

      {/* ステータスアップ/ダウンの矢印 */}
      {(event.type === "stat_up" || event.type === "stat_down") && (
        <div
          className="absolute font-[family-name:var(--font-dotgothic)] text-2xl font-bold"
          style={{
            left: isTargetLeft ? "25%" : "65%",
            top: "35%",
            transform: `translate(-50%, -50%) translateY(${translateY}px)`,
            opacity,
            color,
            transition: "all 150ms ease-out",
            textShadow: `0 0 10px ${color}, 0 0 20px ${color}60`,
          }}
        >
          {event.type === "stat_up" ? "▲" : "▼"}
        </div>
      )}
    </div>
  );
}

function getDefaultDuration(type: BattleAnimationType): number {
  switch (type) {
    case "attack_physical":
    case "attack_special":
      return 600;
    case "damage":
      return 500;
    case "faint":
      return 800;
    case "status_inflict":
      return 500;
    case "stat_up":
    case "stat_down":
      return 500;
    case "heal":
      return 600;
  }
}

function getEffectColor(event: BattleAnimationEvent): string {
  if (event.type === "heal") return "#78C850"; // 緑
  if (event.type === "stat_up") return "#F8D030"; // 黄
  if (event.type === "stat_down") return "#6890F0"; // 青
  if (event.type === "damage" || event.type === "faint") return "#ffffff";
  if (event.moveType && TYPE_HEX[event.moveType]) {
    return TYPE_HEX[event.moveType];
  }
  return "#ffffff";
}

/**
 * バトルアニメーションイベントを生成するヘルパー
 */
export function createAttackAnimation(
  target: "player" | "opponent",
  category: "physical" | "special",
  moveType: string,
): BattleAnimationEvent {
  return {
    type: category === "physical" ? "attack_physical" : "attack_special",
    target,
    moveType,
  };
}

export function createDamageAnimation(target: "player" | "opponent"): BattleAnimationEvent {
  return { type: "damage", target };
}

export function createFaintAnimation(target: "player" | "opponent"): BattleAnimationEvent {
  return { type: "faint", target, duration: 1000 };
}

export function createStatusAnimation(
  target: "player" | "opponent",
  moveType?: string,
): BattleAnimationEvent {
  return { type: "status_inflict", target, moveType };
}

export function createStatChangeAnimation(
  target: "player" | "opponent",
  direction: "up" | "down",
): BattleAnimationEvent {
  return { type: direction === "up" ? "stat_up" : "stat_down", target };
}

export function createHealAnimation(target: "player" | "opponent"): BattleAnimationEvent {
  return { type: "heal", target };
}
