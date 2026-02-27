"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * タイトル画面 (#54)
 * ゲーム開始フロー - ハイブリッドデザイン（ピクセル × モダンUI）
 */

export interface TitleScreenProps {
  onNewGame: (playerName: string) => void;
  onContinue?: () => void;
  hasSaveData?: boolean;
}

export function TitleScreen({ onNewGame, onContinue, hasSaveData = false }: TitleScreenProps) {
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedOption, setSelectedOption] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [titlePhase, setTitlePhase] = useState(0);

  useEffect(() => {
    const t0 = setTimeout(() => setMounted(true), 0);
    const t1 = setTimeout(() => setTitlePhase(1), 300);
    const t2 = setTimeout(() => setTitlePhase(2), 800);
    const t3 = setTimeout(() => setTitlePhase(3), 1400);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const options = useMemo(
    () => [
      ...(hasSaveData ? [{ label: "つづきから", action: () => onContinue?.() }] : []),
      { label: "はじめから", action: () => setShowNameInput(true) },
    ],
    [hasSaveData, onContinue],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showNameInput) return;
      if (e.key === "ArrowUp" || e.key === "w") {
        setSelectedOption((prev) => (prev - 1 + options.length) % options.length);
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        setSelectedOption((prev) => (prev + 1) % options.length);
      }
      if (e.key === "Enter" || e.key === "z" || e.key === " ") {
        options[selectedOption].action();
      }
    },
    [showNameInput, selectedOption, options],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = playerName.trim();
    if (trimmed.length > 0 && trimmed.length <= 8) {
      onNewGame(trimmed);
    }
  };

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#1a1a2e]"
      role="main"
      aria-label="Monster Chronicle タイトル画面"
    >
      {/* 背景エフェクト */}
      <div className="pointer-events-none absolute inset-0">
        {/* 放射状グラデーション */}
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(83,52,131,0.4) 0%, rgba(233,69,96,0.1) 40%, transparent 70%)",
            opacity: mounted ? 1 : 0,
          }}
        />
        {/* パーティクル */}
        {mounted &&
          Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 23 + 10) % 100}%`,
                background:
                  i % 3 === 0
                    ? "rgba(233,69,96,0.6)"
                    : i % 3 === 1
                      ? "rgba(83,52,131,0.8)"
                      : "rgba(255,255,255,0.3)",
                animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
      </div>

      {/* タイトルロゴ */}
      <div className="relative mb-12">
        {/* ロゴ上のモンスターシルエット */}
        <div
          className="mx-auto mb-4 transition-all duration-1000"
          style={{
            opacity: titlePhase >= 1 ? 1 : 0,
            transform: titlePhase >= 1 ? "scale(1)" : "scale(0.8)",
          }}
        >
          <svg
            viewBox="0 0 64 48"
            width="128"
            height="96"
            className="mx-auto"
            style={{
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 12px rgba(233,69,96,0.4))",
            }}
          >
            {/* 伝説のモンスター「ワスレヌ」のシルエット */}
            {/* 翼 */}
            <polygon points="8,28 2,18 6,14 14,12 18,20" fill="#533483" opacity="0.8" />
            <polygon points="56,28 62,18 58,14 50,12 46,20" fill="#533483" opacity="0.8" />
            {/* 体 */}
            <ellipse cx="32" cy="28" rx="14" ry="10" fill="#e94560" opacity="0.6" />
            <ellipse cx="32" cy="26" rx="12" ry="8" fill="#e94560" opacity="0.8" />
            {/* 頭 */}
            <circle cx="32" cy="16" r="8" fill="#e94560" />
            <circle cx="32" cy="16" r="7" fill="#ff6b81" opacity="0.5" />
            {/* 目 */}
            <ellipse cx="29" cy="15" rx="2" ry="2.5" fill="white" />
            <ellipse cx="35" cy="15" rx="2" ry="2.5" fill="white" />
            <circle cx="29" cy="15" r="1" fill="#1a1a2e" />
            <circle cx="35" cy="15" r="1" fill="#1a1a2e" />
            {/* 角 */}
            <polygon points="28,9 30,4 32,9" fill="#533483" />
            <polygon points="32,9 34,4 36,9" fill="#533483" />
            {/* 尻尾 */}
            <path d="M 32 38 Q 38 42 44 40 Q 46 38 44 36" fill="#e94560" opacity="0.7" />
            {/* 光のハイライト */}
            <circle cx="30" cy="13" r="1" fill="white" opacity="0.6" />
          </svg>
        </div>
        {/* MONSTER */}
        <h1
          className="game-text-shadow text-center transition-all duration-700"
          style={{
            fontFamily: "var(--font-pressstart)",
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            letterSpacing: "0.15em",
            color: "white",
            opacity: titlePhase >= 1 ? 1 : 0,
            transform: titlePhase >= 1 ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          MONSTER
        </h1>
        {/* CHRONICLE */}
        <h2
          className="game-text-shadow mt-2 text-center transition-all duration-700"
          style={{
            fontFamily: "var(--font-pressstart)",
            fontSize: "clamp(1rem, 3.5vw, 1.75rem)",
            letterSpacing: "0.2em",
            color: "#e94560",
            opacity: titlePhase >= 2 ? 1 : 0,
            transform: titlePhase >= 2 ? "translateY(0)" : "translateY(-10px)",
            textShadow: "0 0 20px rgba(233,69,96,0.5), 1px 1px 0 rgba(0,0,0,0.5)",
          }}
        >
          CHRONICLE
        </h2>
        {/* 装飾ライン */}
        <div
          className="mx-auto mt-4 h-[2px] transition-all duration-700"
          style={{
            background: "linear-gradient(90deg, transparent, #e94560, #533483, transparent)",
            width: titlePhase >= 2 ? "100%" : "0%",
          }}
        />
      </div>

      {/* メニュー / 名前入力 */}
      <div
        className="relative z-10 transition-all duration-500"
        style={{
          opacity: titlePhase >= 3 ? 1 : 0,
          transform: titlePhase >= 3 ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {!showNameInput ? (
          <div className="space-y-1">
            {options.map((opt, i) => (
              <button
                key={opt.label}
                className={`game-text-shadow block w-56 rounded-md px-5 py-2.5 text-center font-[family-name:var(--font-dotgothic)] text-lg transition-all ${
                  i === selectedOption
                    ? "scale-105 bg-white/15 text-white shadow-[0_0_15px_rgba(233,69,96,0.2)]"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                onClick={() => opt.action()}
                onMouseEnter={() => setSelectedOption(i)}
              >
                <span
                  className="mr-2 inline-block transition-transform"
                  style={{
                    opacity: i === selectedOption ? 1 : 0,
                    color: "#e94560",
                  }}
                >
                  ▶
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleNameSubmit}
            className="animate-fade-in flex flex-col items-center gap-5"
          >
            <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg text-white">
              あなたの名前は？
            </p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={8}
              className="w-52 rounded-md border-2 border-[#533483] bg-[#16213e] px-4 py-2.5 text-center font-[family-name:var(--font-dotgothic)] text-lg text-white focus:border-[#e94560] focus:shadow-[0_0_15px_rgba(233,69,96,0.3)] focus:outline-none"
              autoFocus
              placeholder="なまえ"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNameInput(false)}
                className="rounded-md border border-[#533483] px-5 py-1.5 font-[family-name:var(--font-dotgothic)] text-gray-400 transition-colors hover:border-gray-400 hover:text-white"
              >
                もどる
              </button>
              <button
                type="submit"
                disabled={playerName.trim().length === 0}
                className="rounded-md bg-[#e94560] px-5 py-1.5 font-[family-name:var(--font-dotgothic)] text-white transition-colors hover:bg-[#ff6b81] disabled:opacity-40"
              >
                けってい
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Press Start */}
      {!showNameInput && titlePhase >= 3 && (
        <p
          className="absolute bottom-8 font-[family-name:var(--font-pressstart)] text-[10px] tracking-widest text-gray-600"
          style={{ animation: "blink 1.2s step-end infinite" }}
        >
          PRESS ENTER
        </p>
      )}

      {/* バージョン */}
      <span className="absolute bottom-3 right-4 font-[family-name:var(--font-dotgothic)] text-[10px] text-gray-700">
        v0.1.0
      </span>
    </div>
  );
}
