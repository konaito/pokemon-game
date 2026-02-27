"use client";

import { useState } from "react";
import { MonsterSprite } from "../ui/MonsterSprite";
import { TYPE_ACCENT, TYPE_HEX } from "@/lib/design-tokens";

/**
 * スターター選択画面 (#58)
 * 御三家から1匹を選ぶ - ハイブリッドデザイン
 */

export interface StarterOption {
  speciesId: string;
  name: string;
  type: string;
  description: string;
}

export interface StarterSelectProps {
  starters: StarterOption[];
  onSelect: (speciesId: string) => void;
  professorName?: string;
}

export function StarterSelect({ starters, onSelect, professorName = "博士" }: StarterSelectProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (confirming) {
      if (e.key === "Enter" || e.key === "z") {
        onSelect(starters[selectedIndex].speciesId);
      }
      if (e.key === "Escape" || e.key === "x") {
        setConfirming(false);
      }
      return;
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
      setSelectedIndex((prev) => (prev - 1 + starters.length) % starters.length);
    }
    if (e.key === "ArrowRight" || e.key === "d") {
      setSelectedIndex((prev) => (prev + 1) % starters.length);
    }
    if (e.key === "Enter" || e.key === "z") {
      setConfirming(true);
    }
  };

  const selected = starters[selectedIndex];

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#1a1a2e]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 背景エフェクト */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${TYPE_HEX[selected.type] ?? "#533483"}20 0%, transparent 60%)`,
        }}
      />

      {/* 博士のセリフ */}
      <div className="rpg-window animate-fade-in relative z-10 mb-8 max-w-lg">
        <div className="rpg-window-inner">
          <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg text-white">
            {confirming
              ? `${selected.name}でよいかな？`
              : `${professorName}「この3匹から1匹を選ぶのじゃ！」`}
          </p>
        </div>
      </div>

      {/* スターター選択カード */}
      <div className="relative z-10 flex gap-5">
        {starters.map((starter, i) => {
          const isSelected = i === selectedIndex;
          const accentClass = TYPE_ACCENT[starter.type] ?? TYPE_ACCENT.normal;
          const hex = TYPE_HEX[starter.type] ?? "#A8A878";

          return (
            <button
              key={starter.speciesId}
              className={`group flex w-40 flex-col items-center rounded-xl border-2 p-5 transition-all duration-300 ${
                isSelected
                  ? `${accentClass} scale-110 bg-white/10`
                  : "border-[#533483]/40 bg-[#16213e] text-gray-500 hover:border-[#533483]"
              }`}
              style={isSelected ? { boxShadow: `0 0 30px ${hex}30, 0 0 60px ${hex}10` } : undefined}
              onClick={() => {
                if (i === selectedIndex) {
                  setConfirming(true);
                } else {
                  setSelectedIndex(i);
                }
              }}
            >
              {/* モンスターアイコン */}
              <div
                className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected ? `${accentClass} bg-white/5` : "border-[#533483]/30"
                }`}
                style={isSelected ? { boxShadow: `inset 0 0 20px ${hex}20` } : undefined}
              >
                <MonsterSprite speciesId={starter.speciesId} types={[starter.type]} size={56} />
              </div>

              <span
                className={`game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg font-bold transition-colors ${
                  isSelected ? "text-white" : "text-gray-400"
                }`}
              >
                {starter.name}
              </span>
              <span
                className={`mt-1 font-[family-name:var(--font-dotgothic)] text-xs uppercase transition-colors ${
                  isSelected ? accentClass.split(" ")[0] : "text-gray-600"
                }`}
              >
                {starter.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* 説明文 */}
      <div className="relative z-10 mt-6 max-w-md text-center">
        <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-gray-300">
          {selected?.description}
        </p>
      </div>

      {/* 確認ダイアログ */}
      {confirming && (
        <div className="animate-fade-in relative z-10 mt-5 flex gap-3">
          <button
            className="rounded-md bg-[#e94560] px-6 py-2 font-[family-name:var(--font-dotgothic)] text-white transition-colors hover:bg-[#ff6b81]"
            onClick={() => onSelect(starters[selectedIndex].speciesId)}
          >
            はい
          </button>
          <button
            className="rounded-md border border-[#533483] bg-[#16213e] px-6 py-2 font-[family-name:var(--font-dotgothic)] text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
            onClick={() => setConfirming(false)}
          >
            いいえ
          </button>
        </div>
      )}

      {/* 操作ガイド */}
      {!confirming && (
        <p className="absolute bottom-4 font-[family-name:var(--font-dotgothic)] text-xs text-gray-600">
          ← → で選択 / Enter で決定
        </p>
      )}
    </div>
  );
}
