/**
 * ショップの品揃え定義
 * バッジ数に応じてアイテムが解禁される
 */
import type { ItemId } from "@/types";

/** デフォルトのショップ品揃え（バッジ数で解禁） */
const SHOP_UNLOCK_TABLE: { badgeCount: number; items: ItemId[] }[] = [
  {
    badgeCount: 0,
    items: ["potion", "antidote", "parlyz-heal", "monster-ball"],
  },
  {
    badgeCount: 1,
    items: ["super-potion", "awakening", "burn-heal", "super-ball"],
  },
  {
    badgeCount: 3,
    items: ["hyper-potion", "full-heal", "revive", "net-ball"],
  },
  {
    badgeCount: 4,
    items: ["dark-ball"],
  },
  {
    badgeCount: 5,
    items: ["hyper-ball", "timer-ball", "repeat-ball"],
  },
  {
    badgeCount: 6,
    items: ["full-restore", "max-potion", "quick-ball"],
  },
];

/**
 * バッジ数に応じたショップのアイテム一覧を取得
 */
export function getShopItems(badgeCount: number): ItemId[] {
  const items: ItemId[] = [];
  for (const entry of SHOP_UNLOCK_TABLE) {
    if (badgeCount >= entry.badgeCount) {
      items.push(...entry.items);
    }
  }
  return items;
}
