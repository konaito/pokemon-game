import type { Bag, BagItem, ItemId, ItemDefinition, MonsterInstance, MoveDefinition } from "@/types";

/** 空のバッグを作成 */
export function createBag(): Bag {
  return { items: [] };
}

/** アイテムを追加（既存なら個数を加算） */
export function addItem(bag: Bag, itemId: ItemId, quantity: number = 1): void {
  const existing = bag.items.find((i) => i.itemId === itemId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    bag.items.push({ itemId, quantity });
  }
}

/** アイテムを消費（個数が0になったら削除） */
export function removeItem(bag: Bag, itemId: ItemId, quantity: number = 1): boolean {
  const existing = bag.items.find((i) => i.itemId === itemId);
  if (!existing || existing.quantity < quantity) return false;
  existing.quantity -= quantity;
  if (existing.quantity <= 0) {
    bag.items.splice(bag.items.indexOf(existing), 1);
  }
  return true;
}

/** アイテムの所持数を取得 */
export function getItemCount(bag: Bag, itemId: ItemId): number {
  return bag.items.find((i) => i.itemId === itemId)?.quantity ?? 0;
}

/** カテゴリでフィルタ */
export function getItemsByCategory(
  bag: Bag,
  category: string,
  itemResolver: (id: ItemId) => ItemDefinition,
): BagItem[] {
  return bag.items.filter((i) => itemResolver(i.itemId).category === category);
}

/** 回復アイテムの使用 */
export function useHealItem(
  item: ItemDefinition,
  target: MonsterInstance,
  maxHp: number,
  moveResolver?: (moveId: string) => MoveDefinition,
): { used: boolean; message: string } {
  if (target.currentHp <= 0) {
    return { used: false, message: `${target.nickname ?? "モンスター"}は瀕死のため使えない！` };
  }

  if (item.effect.type === "heal_hp") {
    if (target.currentHp >= maxHp) {
      return { used: false, message: "HPは満タンだ！" };
    }
    target.currentHp = Math.min(maxHp, target.currentHp + item.effect.amount);
    return { used: true, message: `HPが${item.effect.amount}回復した！` };
  }

  if (item.effect.type === "heal_status") {
    if (target.status === null) {
      return { used: false, message: "状態異常ではない！" };
    }
    if (item.effect.status !== "all" && target.status !== item.effect.status) {
      return { used: false, message: "このアイテムでは治せない！" };
    }
    target.status = null;
    return { used: true, message: "状態異常が治った！" };
  }

  if (item.effect.type === "heal_pp") {
    if (!moveResolver) {
      return { used: false, message: "このアイテムは使えない！" };
    }
    const amount = item.effect.amount;
    let restored = false;
    for (const move of target.moves) {
      const moveDef = moveResolver(move.moveId);
      const maxPp = moveDef.pp;
      if (move.currentPp < maxPp) {
        if (amount === "all") {
          move.currentPp = maxPp;
        } else {
          move.currentPp = Math.min(maxPp, move.currentPp + amount);
        }
        restored = true;
      }
    }
    if (!restored) {
      return { used: false, message: "PPは満タンだ！" };
    }
    return { used: true, message: "PPが回復した！" };
  }

  return { used: false, message: "このアイテムは使えない！" };
}
