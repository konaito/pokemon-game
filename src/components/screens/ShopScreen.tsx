"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * ショップ画面 (#199)
 * 買う / 売る / やめる の3モード
 */

export interface ShopItemInfo {
  itemId: string;
  name: string;
  description: string;
  price: number;
  /** 売却モード時の所持数 */
  quantity?: number;
}

export interface ShopScreenProps {
  /** 購入可能アイテム一覧 */
  shopItems: ShopItemInfo[];
  /** 売却可能アイテム一覧（プレイヤーの所持品） */
  sellItems: ShopItemInfo[];
  /** プレイヤーの所持金 */
  money: number;
  /** 購入コールバック */
  onBuy: (itemId: string, quantity: number) => void;
  /** 売却コールバック */
  onSell: (itemId: string, quantity: number) => void;
  /** 閉じるコールバック */
  onBack: () => void;
}

type ShopMode = "menu" | "buy" | "sell";

export function ShopScreen({
  shopItems,
  sellItems,
  money,
  onBuy,
  onSell,
  onBack,
}: ShopScreenProps) {
  const [mode, setMode] = useState<ShopMode>("menu");
  const [menuCursor, setMenuCursor] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const menuOptions = ["かいにきた", "うりにきた", "やめる"];
  const currentList = mode === "buy" ? shopItems : sellItems;
  const currentItem = currentList[selectedItem];

  const getMaxBuyQuantity = useCallback(
    (item: ShopItemInfo) => {
      if (item.price <= 0) return 1;
      return Math.max(1, Math.floor(money / item.price));
    },
    [money],
  );

  const getMaxSellQuantity = useCallback((item: ShopItemInfo) => item.quantity ?? 0, []);

  // モードが変わったらカーソルリセット
  useEffect(() => {
    setSelectedItem(0);
    setQuantity(1);
  }, [mode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (mode === "menu") {
        if (e.key === "ArrowUp" || e.key === "w") {
          setMenuCursor((prev) => (prev - 1 + menuOptions.length) % menuOptions.length);
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          setMenuCursor((prev) => (prev + 1) % menuOptions.length);
        }
        if (e.key === "Enter" || e.key === "z") {
          if (menuCursor === 0) setMode("buy");
          else if (menuCursor === 1) setMode("sell");
          else onBack();
        }
        if (e.key === "Escape" || e.key === "x") {
          onBack();
        }
        return;
      }

      // buy / sell モード
      if (e.key === "ArrowUp" || e.key === "w") {
        setSelectedItem((prev) => Math.max(0, prev - 1));
        setQuantity(1);
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        setSelectedItem((prev) => Math.min(currentList.length - 1, prev + 1));
        setQuantity(1);
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        if (!currentItem) return;
        const max =
          mode === "buy" ? getMaxBuyQuantity(currentItem) : getMaxSellQuantity(currentItem);
        setQuantity((prev) => Math.min(max, prev + 1));
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        setQuantity((prev) => Math.max(1, prev - 1));
      }
      if (e.key === "Enter" || e.key === "z") {
        if (!currentItem) return;
        if (mode === "buy") {
          onBuy(currentItem.itemId, quantity);
        } else {
          onSell(currentItem.itemId, quantity);
        }
        setQuantity(1);
      }
      if (e.key === "Escape" || e.key === "x") {
        setMode("menu");
      }
    },
    [
      mode,
      menuCursor,
      selectedItem,
      quantity,
      currentList,
      currentItem,
      onBuy,
      onSell,
      onBack,
      getMaxBuyQuantity,
      getMaxSellQuantity,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // メニューモード
  if (mode === "menu") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#1a1a2e]">
        <div className="rpg-window w-72">
          <div className="rpg-window-inner">
            <p className="mb-4 font-[family-name:var(--font-dotgothic)] text-white">
              いらっしゃいませ！
            </p>
            <p className="mb-4 font-[family-name:var(--font-dotgothic)] text-sm text-gray-300">
              所持金: ¥{money.toLocaleString()}
            </p>
            <div className="space-y-1">
              {menuOptions.map((opt, i) => (
                <button
                  key={opt}
                  className={`flex w-full items-center gap-2 rounded-md px-4 py-2 text-left font-[family-name:var(--font-dotgothic)] transition-all ${
                    i === menuCursor ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5"
                  }`}
                  onClick={() => {
                    if (i === 0) setMode("buy");
                    else if (i === 1) setMode("sell");
                    else onBack();
                  }}
                  onMouseEnter={() => setMenuCursor(i)}
                >
                  <span className="w-4">{i === menuCursor ? "▶" : ""}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 買う / 売る モード
  const title = mode === "buy" ? "かいもの" : "うりもの";

  return (
    <div className="flex h-full w-full flex-col bg-[#1a1a2e] p-4">
      {/* ヘッダー */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg text-white">
          {title}
        </h2>
        <span className="font-[family-name:var(--font-dotgothic)] text-sm text-yellow-400">
          所持金: ¥{money.toLocaleString()}
        </span>
      </div>

      {/* アイテムリスト + 説明パネル */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto rounded-lg border border-[#533483]/20 bg-[#16213e] p-2">
          {currentList.length === 0 ? (
            <p className="py-8 text-center font-[family-name:var(--font-dotgothic)] text-gray-500">
              {mode === "sell" ? "売れるアイテムがありません" : "商品がありません"}
            </p>
          ) : (
            <div className="space-y-0.5">
              {currentList.map((item, i) => (
                <button
                  key={item.itemId}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-left font-[family-name:var(--font-dotgothic)] transition-all ${
                    i === selectedItem ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5"
                  }`}
                  onClick={() => {
                    setSelectedItem(i);
                    setQuantity(1);
                  }}
                  onMouseEnter={() => setSelectedItem(i)}
                >
                  <span>{item.name}</span>
                  <span className="text-sm text-gray-500">
                    {mode === "buy"
                      ? `¥${item.price.toLocaleString()}`
                      : `×${item.quantity ?? 0}  売値¥${Math.floor(item.price / 2).toLocaleString()}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 説明パネル */}
        <div className="rpg-window w-56">
          <div className="rpg-window-inner flex h-full flex-col">
            {currentItem ? (
              <>
                <h3 className="game-text-shadow font-[family-name:var(--font-dotgothic)] font-bold text-white">
                  {currentItem.name}
                </h3>
                <p className="mt-2 flex-1 font-[family-name:var(--font-dotgothic)] text-sm leading-relaxed text-gray-300">
                  {currentItem.description}
                </p>

                {/* 個数選択 */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-[family-name:var(--font-dotgothic)] text-sm text-gray-400">
                    個数:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded bg-white/10 px-2 py-0.5 font-[family-name:var(--font-dotgothic)] text-sm text-white hover:bg-white/20"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    >
                      ◀
                    </button>
                    <span className="w-8 text-center font-[family-name:var(--font-dotgothic)] text-white">
                      {quantity}
                    </span>
                    <button
                      className="rounded bg-white/10 px-2 py-0.5 font-[family-name:var(--font-dotgothic)] text-sm text-white hover:bg-white/20"
                      onClick={() => {
                        const max =
                          mode === "buy"
                            ? getMaxBuyQuantity(currentItem)
                            : getMaxSellQuantity(currentItem);
                        setQuantity((prev) => Math.min(max, prev + 1));
                      }}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {/* 合計金額 */}
                <p className="mt-1 text-right font-[family-name:var(--font-dotgothic)] text-sm text-yellow-400">
                  {mode === "buy"
                    ? `合計: ¥${(currentItem.price * quantity).toLocaleString()}`
                    : `売却額: ¥${(Math.floor(currentItem.price / 2) * quantity).toLocaleString()}`}
                </p>

                <button
                  className="mt-2 w-full rounded-md bg-[#e94560] py-1.5 font-[family-name:var(--font-dotgothic)] text-sm text-white transition-colors hover:bg-[#ff6b81]"
                  onClick={() => {
                    if (mode === "buy") {
                      onBuy(currentItem.itemId, quantity);
                    } else {
                      onSell(currentItem.itemId, quantity);
                    }
                    setQuantity(1);
                  }}
                >
                  {mode === "buy" ? "かう" : "うる"}
                </button>
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
        onClick={() => setMode("menu")}
      >
        もどる
      </button>
    </div>
  );
}
