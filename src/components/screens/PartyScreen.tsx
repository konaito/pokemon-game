"use client";

import { useState } from "react";
import { HpBar } from "../ui/HpBar";

/**
 * パーティ画面 (#65)
 * ステータス確認、並び替え
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
  /** 交代選択モード（バトル中） */
  selectMode?: boolean;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  poison: { text: "どく", color: "text-purple-400" },
  burn: { text: "やけど", color: "text-orange-400" },
  paralysis: { text: "まひ", color: "text-yellow-400" },
  sleep: { text: "ねむり", color: "text-gray-400" },
  freeze: { text: "こおり", color: "text-cyan-400" },
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

  const handleSelect = (index: number) => {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-950 p-6"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h2 className="mb-4 font-mono text-xl text-white">
        {selectMode ? "モンスターを選んでください" : "てもち"}
      </h2>

      <div className="space-y-2">
        {party.map((member, i) => {
          const isFainted = member.currentHp <= 0;
          const isSwapSource = swapSource === i;
          const isSelected = selectedIndex === i;

          return (
            <button
              key={i}
              className={`flex w-full items-center gap-4 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                isSwapSource
                  ? "border-yellow-500 bg-yellow-900/20"
                  : isSelected
                    ? "border-white/30 bg-white/10"
                    : "border-gray-700 bg-gray-900"
              } ${isFainted ? "opacity-50" : ""}`}
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {/* アイコンプレースホルダー */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-xl">
                {isFainted ? "💀" : "🐾"}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-bold text-white">{member.name}</span>
                  <span className="font-mono text-sm text-gray-400">Lv.{member.level}</span>
                  {member.status && STATUS_LABELS[member.status] && (
                    <span className={`font-mono text-xs ${STATUS_LABELS[member.status].color}`}>
                      [{STATUS_LABELS[member.status].text}]
                    </span>
                  )}
                </div>
                <HpBar current={member.currentHp} max={member.maxHp} className="mt-1 w-48" />
              </div>

              <div className="font-mono text-xs text-gray-500">{member.types.join(" / ")}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-4">
        <button
          className="rounded bg-gray-700 px-4 py-2 font-mono text-sm text-gray-300 hover:bg-gray-600"
          onClick={onBack}
        >
          もどる
        </button>
        {swapSource !== null && (
          <span className="font-mono text-sm text-yellow-400">
            入れ替え先を選んでください（Escでキャンセル）
          </span>
        )}
      </div>
    </div>
  );
}
