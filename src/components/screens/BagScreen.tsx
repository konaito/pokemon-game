"use client";

import { useState } from "react";

/**
 * バッグ画面 (#69)
 * アイテム一覧、使用
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

const CATEGORY_LABELS: Record<string, string> = {
  medicine: "くすり",
  ball: "ボール",
  battle: "せんとう",
  key: "たいせつなもの",
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
      className="flex min-h-screen flex-col bg-gray-950 p-6"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* カテゴリタブ */}
      <div className="mb-4 flex gap-2">
        {CATEGORY_ORDER.map((cat, i) => (
          <button
            key={cat}
            className={`rounded-t px-4 py-2 font-mono text-sm transition-colors ${
              i === selectedCategory
                ? "bg-gray-800 text-white"
                : "bg-gray-900 text-gray-500 hover:text-gray-300"
            }`}
            onClick={() => {
              setSelectedCategory(i);
              setSelectedItem(0);
            }}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* アイテムリスト */}
      <div className="flex flex-1 gap-4">
        <div className="flex-1 space-y-1">
          {filteredItems.length === 0 ? (
            <p className="py-4 text-center font-mono text-gray-500">
              このカテゴリにはアイテムがありません
            </p>
          ) : (
            filteredItems.map((item, i) => (
              <button
                key={item.itemId}
                className={`flex w-full items-center justify-between rounded px-4 py-2 text-left font-mono transition-colors ${
                  i === selectedItem ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5"
                }`}
                onClick={() => {
                  setSelectedItem(i);
                  if (item.usable) onUse?.(item.itemId);
                }}
                onMouseEnter={() => setSelectedItem(i)}
              >
                <span>{item.name}</span>
                <span className="text-gray-500">×{item.quantity}</span>
              </button>
            ))
          )}
        </div>

        {/* アイテム説明 */}
        <div className="w-64 rounded-lg bg-gray-900 p-4">
          {filteredItems[selectedItem] ? (
            <>
              <h3 className="font-mono font-bold text-white">{filteredItems[selectedItem].name}</h3>
              <p className="mt-2 font-mono text-sm text-gray-400">
                {filteredItems[selectedItem].description}
              </p>
              {filteredItems[selectedItem].usable && (
                <button
                  className="mt-4 rounded bg-emerald-600 px-4 py-1 font-mono text-sm text-white hover:bg-emerald-500"
                  onClick={() => onUse?.(filteredItems[selectedItem].itemId)}
                >
                  つかう
                </button>
              )}
            </>
          ) : (
            <p className="font-mono text-sm text-gray-600">アイテムを選んでください</p>
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
