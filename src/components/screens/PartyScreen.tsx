"use client";

import { useState, useEffect, useCallback } from "react";
import { HpBar } from "../ui/HpBar";
import { MonsterSprite } from "../ui/MonsterSprite";
import { STATUS_COLOR, TYPE_BG, TYPE_LABEL } from "@/lib/design-tokens";

/**
 * パーティ画面 (#65)
 * ステータス確認、並び替え - ハイブリッドデザイン
 */

export interface PartyMemberInfo {
  speciesId: string;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  status: string | null;
  types: string[];
}

export interface PartyScreenProps {
  party: PartyMemberInfo[];
  onSwap?: (indexA: number, indexB: number) => void;
  onSelect?: (index: number) => void;
  onBack: () => void;
  selectMode?: boolean;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  poison: { text: "どく", color: STATUS_COLOR.poison.text },
  burn: { text: "やけど", color: STATUS_COLOR.burn.text },
  paralysis: { text: "まひ", color: STATUS_COLOR.paralysis.text },
  sleep: { text: "ねむり", color: STATUS_COLOR.sleep.text },
  freeze: { text: "こおり", color: STATUS_COLOR.freeze.text },
};

export function PartyScreen({
  party,
  onSwap,
  onSelect,
  onBack,
  selectMode = false,
}: PartyScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [swapSource, setSwapSource] = useState<number | null>(null);

  const handleSelect = useCallback(
    (index: number) => {
      if (selectMode) {
        onSelect?.(index);
        return;
      }

      if (swapSource !== null) {
        if (swapSource !== index) {
          onSwap?.(swapSource, index);
        }
        setSwapSource(null);
      } else {
        setSwapSource(index);
      }
    },
    [selectMode, onSelect, swapSource, onSwap],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        setSelectedIndex((prev) => Math.min(party.length - 1, prev + 1));
      }
      if (e.key === "Enter" || e.key === "z") {
        handleSelect(selectedIndex);
      }
      if (e.key === "Escape" || e.key === "x") {
        if (swapSource !== null) {
          setSwapSource(null);
        } else {
          onBack();
        }
      }
    },
    [selectedIndex, swapSource, party.length, onBack, handleSelect],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-full w-full flex-col bg-[#1a1a2e] p-4">
      <h2 className="game-text-shadow mb-3 font-[family-name:var(--font-dotgothic)] text-xl text-white">
        {selectMode ? "モンスターを選んでください" : "てもち"}
      </h2>

      <div className="space-y-1.5">
        {party.map((member, i) => {
          const isFainted = member.currentHp <= 0;
          const isSwapSource = swapSource === i;
          const isSelected = selectedIndex === i;

          return (
            <button
              key={i}
              className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                isSwapSource
                  ? "border-yellow-500/60 bg-yellow-900/15"
                  : isSelected
                    ? "border-[#533483] bg-white/8 shadow-[0_0_15px_rgba(83,52,131,0.2)]"
                    : "border-[#533483]/20 bg-[#16213e]"
              } ${isFainted ? "opacity-40" : ""}`}
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {/* アイコン */}
              <MonsterSprite
                speciesId={member.speciesId}
                types={member.types}
                size={48}
                fainted={isFainted}
              />

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="game-text-shadow font-[family-name:var(--font-dotgothic)] font-bold text-white">
                    {member.name}
                  </span>
                  <span className="font-[family-name:var(--font-dotgothic)] text-sm text-gray-400">
                    Lv.{member.level}
                  </span>
                  {member.status && STATUS_LABELS[member.status] && (
                    <span
                      className={`rounded-sm px-1.5 py-0.5 font-[family-name:var(--font-dotgothic)] text-[10px] ${STATUS_LABELS[member.status].color} bg-white/5`}
                    >
                      {STATUS_LABELS[member.status].text}
                    </span>
                  )}
                </div>
                <HpBar current={member.currentHp} max={member.maxHp} className="mt-1 w-48" />
              </div>

              <div className="flex gap-1">
                {member.types.map((type) => (
                  <span
                    key={type}
                    className={`rounded px-1.5 py-0.5 font-[family-name:var(--font-dotgothic)] text-[10px] text-white ${TYPE_BG[type] ?? "bg-gray-600"}`}
                  >
                    {TYPE_LABEL[type] ?? type}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <button
          className="rounded-md border border-[#533483] bg-[#16213e] px-4 py-1.5 font-[family-name:var(--font-dotgothic)] text-sm text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
          onClick={onBack}
        >
          もどる
        </button>
        {swapSource !== null && (
          <span className="font-[family-name:var(--font-dotgothic)] text-sm text-yellow-400">
            入れ替え先を選んでください（Escでキャンセル）
          </span>
        )}
      </div>
    </div>
  );
}
