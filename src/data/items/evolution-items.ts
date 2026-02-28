/**
 * 進化アイテム
 * モンスターに使用すると条件を満たす場合に進化する
 */
import type { ItemDefinition } from "@/types";

export const EVOLUTION_ITEMS: Record<string, ItemDefinition> = {
  "tsunagari-no-himo": {
    id: "tsunagari-no-himo",
    name: "つながりのヒモ",
    description: "不思議なヒモ。持たせて使うと通信進化のように進化する。",
    category: "key",
    price: 2000,
    usableInBattle: false,
    effect: { type: "evolution", evolutionItemId: "tsunagari-no-himo" },
  },
  "reikai-no-nuno": {
    id: "reikai-no-nuno",
    name: "れいかいのぬの",
    description: "霊界の気配を纏った布。特定のゴーストタイプのモンスターを進化させる。",
    category: "key",
    price: 2000,
    usableInBattle: false,
    effect: { type: "evolution", evolutionItemId: "reikai-no-nuno" },
  },
  "metal-coat": {
    id: "metal-coat",
    name: "メタルコート",
    description: "特殊な金属の膜。特定のモンスターに使うとはがねタイプに進化する。",
    category: "key",
    price: 2000,
    usableInBattle: false,
    effect: { type: "evolution", evolutionItemId: "metal-coat" },
  },
};
