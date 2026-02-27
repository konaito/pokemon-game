"use client";

import { useState } from "react";

/**
 * メニュー画面 (#77)
 * ゲーム中のメインメニュー - ハイブリッドデザイン
 */

export interface MenuScreenProps {
  playerName: string;
  badgeCount: number;
  playTime?: string;
  onNavigate: (screen: string) => void;
  onSave?: () => void;
  onBack: () => void;
}

interface MenuItem {
  label: string;
  value: string;
  description: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "ポケモン", value: "party", description: "手持ちのモンスターを確認する", icon: "◆" },
  { label: "バッグ", value: "bag", description: "持ち物を確認する", icon: "■" },
  { label: "図鑑", value: "pokedex", description: "見つけたモンスターを確認する", icon: "▣" },
  { label: "レポート", value: "save", description: "冒険の記録を書く", icon: "✦" },
  { label: "設定", value: "settings", description: "ゲームの設定を変更する", icon: "⚙" },
  { label: "とじる", value: "close", description: "メニューを閉じる", icon: "✕" },
];

export function MenuScreen({
  playerName,
  badgeCount,
  onNavigate,
  onSave,
  onBack,
}: MenuScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = (index: number) => {
    const item = MENU_ITEMS[index];
    if (item.value === "close") {
      onBack();
    } else if (item.value === "save") {
      onSave?.();
    } else {
      onNavigate(item.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "w") {
      setSelectedIndex((prev) => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
    }
    if (e.key === "ArrowDown" || e.key === "s") {
      setSelectedIndex((prev) => (prev + 1) % MENU_ITEMS.length);
    }
    if (e.key === "Enter" || e.key === "z") {
      handleSelect(selectedIndex);
    }
    if (e.key === "Escape" || e.key === "x") {
      onBack();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-end p-4"
      style={{ backgroundColor: "rgba(10, 10, 26, 0.6)" }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="rpg-window animate-fade-in w-60">
        {/* プレイヤー情報 */}
        <div className="border-b border-[#533483]/30 px-4 py-3">
          <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-sm text-white">
            {playerName}
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-dotgothic)] text-xs text-gray-400">
            バッジ: <span className="text-[#e94560]">{badgeCount}</span>個
          </p>
        </div>

        {/* メニュー項目 */}
        <div className="py-1">
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item.value}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left font-[family-name:var(--font-dotgothic)] text-sm transition-all ${
                i === selectedIndex ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span
                className="w-4 text-center text-xs"
                style={{ color: i === selectedIndex ? "#e94560" : "transparent" }}
              >
                ▶
              </span>
              <span className="w-4 text-center text-xs text-[#533483]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* 説明文 */}
        <div className="border-t border-[#533483]/30 px-4 py-2">
          <p className="font-[family-name:var(--font-dotgothic)] text-xs text-gray-500">
            {MENU_ITEMS[selectedIndex].description}
          </p>
        </div>
      </div>
    </div>
  );
}
