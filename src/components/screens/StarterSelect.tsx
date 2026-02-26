"use client";

import { useState } from "react";

/**
 * スターター選択画面 (#58)
 * 御三家から1匹を選ぶ
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

const TYPE_COLORS: Record<string, string> = {
  fire: "text-orange-400 border-orange-400",
  water: "text-blue-400 border-blue-400",
  grass: "text-green-400 border-green-400",
  electric: "text-yellow-400 border-yellow-400",
  normal: "text-gray-300 border-gray-300",
};

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
      className="flex min-h-screen flex-col items-center justify-center bg-gray-950"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 博士のセリフ */}
      <div className="mb-8 max-w-lg rounded-lg bg-gray-900/80 px-6 py-4">
        <p className="font-mono text-lg text-white">
          {confirming
            ? `${selected.name}でよいかな？`
            : `${professorName}「この3匹から1匹を選ぶのじゃ！」`}
        </p>
      </div>

      {/* スターター選択カード */}
      <div className="flex gap-6">
        {starters.map((starter, i) => {
          const isSelected = i === selectedIndex;
          const colorClass = TYPE_COLORS[starter.type] ?? TYPE_COLORS.normal;

          return (
            <button
              key={starter.speciesId}
              className={`flex w-40 flex-col items-center rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? `${colorClass} scale-110 bg-white/10 shadow-lg`
                  : "border-gray-700 bg-gray-900 text-gray-500 hover:border-gray-500"
              }`}
              onClick={() => {
                if (i === selectedIndex) {
                  setConfirming(true);
                } else {
                  setSelectedIndex(i);
                }
              }}
            >
              {/* モンスターアイコン（プレースホルダー） */}
              <div
                className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 text-3xl ${
                  isSelected ? colorClass : "border-gray-600"
                }`}
              >
                {starter.type === "fire" ? "🔥" : starter.type === "water" ? "💧" : "🌿"}
              </div>

              <span
                className={`font-mono text-lg font-bold ${isSelected ? "text-white" : "text-gray-400"}`}
              >
                {starter.name}
              </span>
              <span
                className={`mt-1 font-mono text-xs uppercase ${isSelected ? colorClass.split(" ")[0] : "text-gray-600"}`}
              >
                {starter.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* 選択中のモンスターの説明 */}
      <div className="mt-8 max-w-md text-center">
        <p className="font-mono text-gray-300">{selected?.description}</p>
      </div>

      {/* 確認ダイアログ */}
      {confirming && (
        <div className="mt-6 flex gap-4">
          <button
            className="rounded bg-emerald-600 px-6 py-2 font-mono text-white hover:bg-emerald-500"
            onClick={() => onSelect(starters[selectedIndex].speciesId)}
          >
            はい
          </button>
          <button
            className="rounded bg-gray-700 px-6 py-2 font-mono text-gray-300 hover:bg-gray-600"
            onClick={() => setConfirming(false)}
          >
            いいえ
          </button>
        </div>
      )}

      {/* 操作ガイド */}
      {!confirming && (
        <p className="mt-8 font-mono text-xs text-gray-600">← → で選択 / Enter で決定</p>
      )}
    </div>
  );
}
