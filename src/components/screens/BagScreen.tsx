"use client";

import { useState } from "react";
import { ItemIcon, type ItemCategory } from "../ui/OverworldSprites";

/**
 * バッグ画面 (#69)
 * アイテム一覧、使用 - ハイブリッドデザイン
 */

export interface BagItemInfo {
  itemId: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  usable: boolean;
}

export interface BagScreenProps {
  items: BagItemInfo[];
  onUse?: (itemId: string) => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  medicine: { label: "くすり", icon: "♥" },
  ball: { label: "ボール", icon: "●" },
  battle: { label: "せんとう", icon: "⚔" },
  key: { label: "だいじ", icon: "★" },
};

const CATEGORY_ORDER = ["medicine", "ball", "battle", "key"];

export function BagScreen({ items, onUse, onBack }: BagScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  const currentCategory = CATEGORY_ORDER[selectedCategory];
  const filteredItems = items.filter((item) => item.category === currentCategory);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a") {
      setSelectedCategory((prev) => (prev - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length);
      setSelectedItem(0);
    }
    if (e.key === "ArrowRight" || e.key === "d") {
      setSelectedCategory((prev) => (prev + 1) % CATEGORY_ORDER.length);
      setSelectedItem(0);
    }
    if (e.key === "ArrowUp" || e.key === "w") {
      setSelectedItem((prev) => Math.max(0, prev - 1));
    }
    if (e.key === "ArrowDown" || e.key === "s") {
      setSelectedItem((prev) => Math.min(filteredItems.length - 1, prev + 1));
    }
    if (e.key === "Enter" || e.key === "z") {
      const item = filteredItems[selectedItem];
      if (item?.usable) {
        onUse?.(item.itemId);
      }
    }
    if (e.key === "Escape" || e.key === "x") {
      onBack();
    }
  };

  return (
    <div
      className="flex h-full w-full flex-col bg-[#1a1a2e] p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* カテゴリタブ */}
      <div className="mb-3 flex gap-1">
        {CATEGORY_ORDER.map((cat, i) => {
          const catInfo = CATEGORY_LABELS[cat] ?? { label: cat, icon: "?" };
          return (
            <button
              key={cat}
              className={`flex items-center gap-1.5 rounded-t-md border-2 border-b-0 px-4 py-2 font-[family-name:var(--font-dotgothic)] text-sm transition-all ${
                i === selectedCategory
                  ? "border-[#533483] bg-[#16213e] text-white"
                  : "border-transparent bg-transparent text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => {
                setSelectedCategory(i);
                setSelectedItem(0);
              }}
            >
              <ItemIcon category={cat as ItemCategory} size={16} />
              {catInfo.label}
            </button>
          );
        })}
      </div>

      {/* アイテムリスト + 説明パネル */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto rounded-lg border border-[#533483]/20 bg-[#16213e] p-2">
          {filteredItems.length === 0 ? (
            <p className="py-8 text-center font-[family-name:var(--font-dotgothic)] text-gray-500">
              アイテムがありません
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredItems.map((item, i) => (
                <button
                  key={item.itemId}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-left font-[family-name:var(--font-dotgothic)] transition-all ${
                    i === selectedItem ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5"
                  }`}
                  onClick={() => {
                    setSelectedItem(i);
                    if (item.usable) onUse?.(item.itemId);
                  }}
                  onMouseEnter={() => setSelectedItem(i)}
                >
                  <span className="flex items-center gap-2">
                    <ItemIcon category={item.category as ItemCategory} size={14} />
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500">×{item.quantity}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* アイテム説明パネル */}
        <div className="rpg-window w-56">
          <div className="rpg-window-inner flex h-full flex-col">
            {filteredItems[selectedItem] ? (
              <>
                <h3 className="game-text-shadow font-[family-name:var(--font-dotgothic)] font-bold text-white">
                  {filteredItems[selectedItem].name}
                </h3>
                <p className="mt-2 flex-1 font-[family-name:var(--font-dotgothic)] text-sm leading-relaxed text-gray-300">
                  {filteredItems[selectedItem].description}
                </p>
                {filteredItems[selectedItem].usable && (
                  <button
                    className="mt-3 w-full rounded-md bg-[#e94560] py-1.5 font-[family-name:var(--font-dotgothic)] text-sm text-white transition-colors hover:bg-[#ff6b81]"
                    onClick={() => onUse?.(filteredItems[selectedItem].itemId)}
                  >
                    つかう
                  </button>
                )}
              </>
            ) : (
              <p className="font-[family-name:var(--font-dotgothic)] text-sm text-gray-600">
                アイテムを選んでください
              </p>
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
