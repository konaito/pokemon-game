import type { Bag, ItemId, ItemDefinition } from "@/types";
import { addItem, removeItem, getItemCount } from "../item/bag";

/**
 * ショップシステム (#45)
 * アイテムの購入・売却
 */

/** プレイヤーの所持金 */
export interface Wallet {
  money: number;
}

/** ショップの商品ラインナップ */
export interface ShopInventory {
  /** 販売アイテムのID一覧 */
  items: ItemId[];
}

/** 購入結果 */
export interface TransactionResult {
  success: boolean;
  message: string;
}

/**
 * アイテムを購入
 * @param wallet プレイヤーの財布
 * @param bag プレイヤーのバッグ
 * @param itemDef 購入するアイテムの定義
 * @param quantity 個数
 */
export function buyItem(
  wallet: Wallet,
  bag: Bag,
  itemDef: ItemDefinition,
  quantity: number = 1,
): TransactionResult {
  if (quantity <= 0) return { success: false, message: "個数が無効です" };

  const totalCost = itemDef.price * quantity;
  if (wallet.money < totalCost) {
    return { success: false, message: "お金が足りません！" };
  }

  wallet.money -= totalCost;
  addItem(bag, itemDef.id, quantity);
  return {
    success: true,
    message: `${itemDef.name}を${quantity}個買った！`,
  };
}

/**
 * アイテムを売却（購入価格の半額）
 * @param wallet プレイヤーの財布
 * @param bag プレイヤーのバッグ
 * @param itemDef 売却するアイテムの定義
 * @param quantity 個数
 */
export function sellItem(
  wallet: Wallet,
  bag: Bag,
  itemDef: ItemDefinition,
  quantity: number = 1,
): TransactionResult {
  if (quantity <= 0) return { success: false, message: "個数が無効です" };

  const owned = getItemCount(bag, itemDef.id);
  if (owned < quantity) {
    return { success: false, message: "そのアイテムは持っていません！" };
  }

  if (itemDef.price === 0) {
    return { success: false, message: "このアイテムは売れません！" };
  }

  const sellPrice = Math.floor(itemDef.price / 2) * quantity;
  removeItem(bag, itemDef.id, quantity);
  wallet.money += sellPrice;
  return {
    success: true,
    message: `${itemDef.name}を${quantity}個売った！ ${sellPrice}円を手に入れた！`,
  };
}
