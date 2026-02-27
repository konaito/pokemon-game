/**
 * 戦闘用アイテム定義
 */
import type { ItemDefinition } from "@/types";

export const BATTLE_ITEMS: Record<string, ItemDefinition> = {
  "x-attack": {
    id: "x-attack",
    name: "プラスパワー",
    description: "バトル中にこうげきを1段階上げる。",
    category: "battle",
    price: 500,
    usableInBattle: true,
    effect: { type: "none" },
  },
  "x-defense": {
    id: "x-defense",
    name: "ディフェンダー",
    description: "バトル中にぼうぎょを1段階上げる。",
    category: "battle",
    price: 550,
    usableInBattle: true,
    effect: { type: "none" },
  },
  "x-speed": {
    id: "x-speed",
    name: "スピーダー",
    description: "バトル中にすばやさを1段階上げる。",
    category: "battle",
    price: 350,
    usableInBattle: true,
    effect: { type: "none" },
  },
};
