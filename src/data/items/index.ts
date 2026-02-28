/**
 * アイテムデータのエントリーポイント
 */
import type { ItemDefinition } from "@/types";
import { BALL_DEFINITIONS } from "@/engine/capture/balls";
import { MEDICINE_ITEMS } from "./medicines";
import { BATTLE_ITEMS } from "./battle-items";
import { EVOLUTION_ITEMS } from "./evolution-items";

/** 全アイテムデータ（IDでキーイング） */
export const ALL_ITEMS: Record<string, ItemDefinition> = {
  ...BALL_DEFINITIONS,
  ...MEDICINE_ITEMS,
  ...BATTLE_ITEMS,
  ...EVOLUTION_ITEMS,
};

/** IDからアイテムを取得 */
export function getItemById(id: string): ItemDefinition | undefined {
  return ALL_ITEMS[id];
}

/** 全アイテムIDの一覧 */
export function getAllItemIds(): string[] {
  return Object.keys(ALL_ITEMS);
}

export { MEDICINE_ITEMS } from "./medicines";
export { BATTLE_ITEMS } from "./battle-items";
export { EVOLUTION_ITEMS } from "./evolution-items";
