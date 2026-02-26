"use client";

import { useState } from "react";

/**
 * タイトル画面 (#54)
 * ゲーム開始フロー
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
      className="flex min-h-screen flex-col items-center justify-center bg-black"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* タイトルロゴ */}
      <div className="mb-16">
        <h1 className="text-6xl font-bold tracking-wider text-white drop-shadow-lg">
          MONSTER
          <br />
          <span className="text-4xl text-emerald-400">CHRONICLE</span>
        </h1>
      </div>

      {!showNameInput ? (
        /* メニュー */
        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={opt.label}
              className={`block w-48 rounded px-4 py-2 text-center font-mono text-lg transition-colors ${
                i === selectedOption ? "bg-white/20 text-white" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => opt.action()}
              onMouseEnter={() => setSelectedOption(i)}
            >
              {i === selectedOption ? "▶ " : "  "}
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        /* 名前入力 */
        <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-4">
          <p className="font-mono text-lg text-white">あなたの名前は？</p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={8}
            className="w-48 rounded border-2 border-white/30 bg-gray-900 px-4 py-2 text-center font-mono text-lg text-white focus:border-emerald-400 focus:outline-none"
            autoFocus
            placeholder="なまえ"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNameInput(false)}
              className="rounded px-4 py-1 font-mono text-gray-400 hover:text-white"
            >
              もどる
            </button>
            <button
              type="submit"
              disabled={playerName.trim().length === 0}
              className="rounded bg-emerald-600 px-4 py-1 font-mono text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              けってい
            </button>
          </div>
        </form>
      )}

      {/* Press Start */}
      {!showNameInput && (
        <p className="mt-16 animate-pulse font-mono text-sm text-gray-500">Press Enter to start</p>
      )}
    </div>
  );
}
