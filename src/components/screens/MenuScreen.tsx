"use client";

import { useState } from "react";

/**
 * メニュー画面 (#77)
 * ゲーム中のメインメニュー
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
}

const MENU_ITEMS: MenuItem[] = [
  { label: "ポケモン", value: "party", description: "手持ちのモンスターを確認する" },
  { label: "バッグ", value: "bag", description: "持ち物を確認する" },
  { label: "図鑑", value: "pokedex", description: "見つけたモンスターを確認する" },
  { label: "レポート", value: "save", description: "冒険の記録を書く" },
  { label: "設定", value: "settings", description: "ゲームの設定を変更する" },
  { label: "とじる", value: "close", description: "メニューを閉じる" },
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
      className="fixed inset-0 z-40 flex items-start justify-end bg-black/50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="w-56 rounded-lg border-2 border-gray-600 bg-gray-900 shadow-xl">
        {/* プレイヤー情報 */}
        <div className="border-b border-gray-700 px-4 py-3">
          <p className="font-mono text-sm text-gray-400">{playerName}</p>
          <p className="font-mono text-xs text-gray-500">バッジ: {badgeCount}個</p>
        </div>

        {/* メニュー項目 */}
        <div className="py-2">
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item.value}
              className={`flex w-full items-center px-4 py-2 text-left font-mono text-sm transition-colors ${
                i === selectedIndex ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              {i === selectedIndex ? "▶ " : "  "}
              {item.label}
            </button>
          ))}
        </div>

        {/* 説明文 */}
        <div className="border-t border-gray-700 px-4 py-2">
          <p className="font-mono text-xs text-gray-500">{MENU_ITEMS[selectedIndex].description}</p>
        </div>
      </div>
    </div>
  );
}
