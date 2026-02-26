"use client";

import { useState } from "react";

/**
 * 図鑑UI (#73)
 * 一覧、詳細、捕獲状況
 */

export interface PokedexEntry {
  id: string;
  name: string;
  types: string[];
  description: string;
  /** 見たことがある */
  seen: boolean;
  /** 捕まえたことがある */
  caught: boolean;
}

export interface PokedexScreenProps {
  entries: PokedexEntry[];
  onBack: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-500",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-500",
  ice: "bg-cyan-400",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-700",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-amber-800",
  ghost: "bg-purple-800",
  dragon: "bg-violet-700",
  dark: "bg-gray-800",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

export function PokedexScreen({ entries, onBack }: PokedexScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const seenCount = entries.filter((e) => e.seen).length;
  const caughtCount = entries.filter((e) => e.caught).length;
  const selected = entries[selectedIndex];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "w") {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (e.key === "ArrowDown" || e.key === "s") {
      setSelectedIndex((prev) => Math.min(entries.length - 1, prev + 1));
    }
    if (e.key === "Escape" || e.key === "x") {
      onBack();
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-950 p-6"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* ヘッダー */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-mono text-xl text-white">モンスター図鑑</h2>
        <div className="font-mono text-sm text-gray-400">
          みつけた: {seenCount} / つかまえた: {caughtCount}
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        {/* 一覧 */}
        <div className="w-64 space-y-0.5 overflow-y-auto">
          {entries.map((entry, i) => (
            <button
              key={entry.id}
              className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-left font-mono text-sm transition-colors ${
                i === selectedIndex ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setSelectedIndex(i)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="w-4 text-xs">{entry.caught ? "●" : entry.seen ? "○" : " "}</span>
              <span>{entry.seen ? entry.name : "？？？"}</span>
            </button>
          ))}
        </div>

        {/* 詳細 */}
        <div className="flex-1 rounded-lg bg-gray-900 p-6">
          {selected && selected.seen ? (
            <>
              <h3 className="font-mono text-2xl font-bold text-white">{selected.name}</h3>
              <div className="mt-2 flex gap-2">
                {selected.types.map((type) => (
                  <span
                    key={type}
                    className={`rounded px-2 py-0.5 font-mono text-xs text-white ${TYPE_COLORS[type] ?? "bg-gray-600"}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="mt-4 font-mono text-gray-300">{selected.description}</p>
              <p className="mt-4 font-mono text-sm text-gray-500">
                {selected.caught ? "つかまえた！" : "まだつかまえていない"}
              </p>
            </>
          ) : (
            <p className="font-mono text-gray-600">データがありません</p>
          )}
        </div>
      </div>

      <button
        className="mt-4 self-start rounded bg-gray-700 px-4 py-2 font-mono text-sm text-gray-300 hover:bg-gray-600"
        onClick={onBack}
      >
        もどる
      </button>
    </div>
  );
}
