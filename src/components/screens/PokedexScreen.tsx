"use client";

import { useState, useEffect, useCallback } from "react";
import { MonsterSprite } from "../ui/MonsterSprite";
import { TYPE_BG, TYPE_LABEL } from "@/lib/design-tokens";

/**
 * 図鑑UI (#73)
 * 一覧、詳細、捕獲状況 - ハイブリッドデザイン
 */

export interface PokedexEntry {
  id: string;
  name: string;
  types: string[];
  description: string;
  seen: boolean;
  caught: boolean;
}

export interface PokedexScreenProps {
  entries: PokedexEntry[];
  onBack: () => void;
}

export function PokedexScreen({ entries, onBack }: PokedexScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const seenCount = entries.filter((e) => e.seen).length;
  const caughtCount = entries.filter((e) => e.caught).length;
  const selected = entries[selectedIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        setSelectedIndex((prev) => Math.min(entries.length - 1, prev + 1));
      }
      if (e.key === "Escape" || e.key === "x") {
        onBack();
      }
    },
    [entries.length, onBack],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-full w-full flex-col bg-[#1a1a2e] p-4">
      {/* ヘッダー */}
      <div className="mb-3 flex items-baseline justify-between border-b border-[#533483]/30 pb-3">
        <h2 className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-xl text-white">
          モンスター図鑑
        </h2>
        <div className="flex gap-4 font-[family-name:var(--font-dotgothic)] text-sm text-gray-400">
          <span>
            みつけた: <span className="text-white">{seenCount}</span>
          </span>
          <span>
            つかまえた: <span className="text-[#e94560]">{caughtCount}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* 一覧 */}
        <div className="w-56 space-y-0.5 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <button
              key={entry.id}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left font-[family-name:var(--font-dotgothic)] text-sm transition-all ${
                i === selectedIndex
                  ? "bg-white/10 text-white shadow-[inset_0_0_10px_rgba(233,69,96,0.1)]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setSelectedIndex(i)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="w-5 text-center text-xs">
                {entry.caught ? (
                  <span className="text-[#e94560]">●</span>
                ) : entry.seen ? (
                  <span className="text-gray-400">○</span>
                ) : (
                  " "
                )}
              </span>
              <span className="text-gray-600">{String(i + 1).padStart(3, "0")}</span>
              <span>{entry.seen ? entry.name : "？？？"}</span>
            </button>
          ))}
        </div>

        {/* 詳細パネル */}
        <div className="rpg-window flex-1">
          <div className="rpg-window-inner flex h-full flex-col">
            {selected && selected.seen ? (
              <>
                {/* モンスター画像エリア */}
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-[#1a1a2e]">
                  <MonsterSprite speciesId={selected.id} types={selected.types} size={96} />
                </div>

                <h3 className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-2xl font-bold text-white">
                  {selected.name}
                </h3>

                <div className="mt-2 flex gap-2">
                  {selected.types.map((type) => (
                    <span
                      key={type}
                      className={`game-text-shadow rounded-md px-2.5 py-0.5 font-[family-name:var(--font-dotgothic)] text-xs text-white ${TYPE_BG[type] ?? "bg-gray-600"}`}
                    >
                      {TYPE_LABEL[type] ?? type}
                    </span>
                  ))}
                </div>

                <p className="mt-4 flex-1 font-[family-name:var(--font-dotgothic)] leading-relaxed text-gray-300">
                  {selected.description}
                </p>

                <p className="mt-3 font-[family-name:var(--font-dotgothic)] text-sm">
                  {selected.caught ? (
                    <span className="text-[#e94560]">● つかまえた！</span>
                  ) : (
                    <span className="text-gray-500">○ まだつかまえていない</span>
                  )}
                </p>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="font-[family-name:var(--font-dotgothic)] text-gray-600">
                  データがありません
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        className="mt-3 self-start rounded-md border border-[#533483] bg-[#16213e] px-4 py-1.5 font-[family-name:var(--font-dotgothic)] text-sm text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
        onClick={onBack}
      >
        もどる
      </button>
    </div>
  );
}
