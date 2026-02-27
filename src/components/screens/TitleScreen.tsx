"use client";

import { useState, useEffect } from "react";

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

  const options = [
    ...(hasSaveData ? [{ label: "つづきから", action: () => onContinue?.() }] : []),
    { label: "はじめから", action: () => setShowNameInput(true) },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

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
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
