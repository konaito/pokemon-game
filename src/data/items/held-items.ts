import type { HeldItemDefinition } from "@/types";

export const HELD_ITEMS: HeldItemDefinition[] = [
  // === きのみ系（消費） ===
  {
    id: "sitrus-berry",
    name: "オボンのみ",
    description: "HPが1/2以下になると最大HPの1/4を回復する。",
    effect: "berry_sitrus",
    consumable: true,
  },
  {
    id: "lum-berry",
    name: "ラムのみ",
    description: "状態異常になったとき自動で治す。",
    effect: "berry_lum",
    consumable: true,
  },
  {
    id: "liechi-berry",
    name: "チイラのみ",
    description: "HPが1/4以下になると攻撃が上がる。",
    effect: "berry_pinch_atk",
    consumable: true,
  },

  // === 強化系（非消費） ===
  {
    id: "life-orb",
    name: "いのちのたま",
    description: "技の威力が1.3倍になるが、攻撃するたびHPが1/10減る。",
    effect: "life_orb",
    consumable: false,
  },
  {
    id: "choice-band",
    name: "こだわりハチマキ",
    description: "攻撃が1.5倍になるが、同じ技しか出せなくなる。",
    effect: "choice_band",
    consumable: false,
  },
  {
    id: "choice-specs",
    name: "こだわりメガネ",
    description: "特攻が1.5倍になるが、同じ技しか出せなくなる。",
    effect: "choice_specs",
    consumable: false,
  },
  {
    id: "expert-belt",
    name: "たつじんのおび",
    description: "効果抜群の技のダメージが1.2倍になる。",
    effect: "expert_belt",
    consumable: false,
  },
  {
    id: "leftovers",
    name: "たべのこし",
    description: "毎ターン終了時にHPが最大HPの1/16回復する。",
    effect: "leftovers",
    consumable: false,
  },

  // === 一回限り（消費） ===
  {
    id: "focus-sash",
    name: "きあいのタスキ",
    description: "HP満タンから一撃で倒されそうになるとHP1で耐える。",
    effect: "focus_sash",
    consumable: true,
  },

  // === タイプ強化系（非消費） ===
  {
    id: "charcoal",
    name: "もくたん",
    description: "ほのおタイプの技の威力が1.2倍になる。",
    effect: "type_boost",
    boostType: "fire",
    consumable: false,
  },
  {
    id: "mystic-water",
    name: "しんぴのしずく",
    description: "みずタイプの技の威力が1.2倍になる。",
    effect: "type_boost",
    boostType: "water",
    consumable: false,
  },
  {
    id: "miracle-seed",
    name: "きせきのタネ",
    description: "くさタイプの技の威力が1.2倍になる。",
    effect: "type_boost",
    boostType: "grass",
    consumable: false,
  },
  {
    id: "magnet",
    name: "じしゃく",
    description: "でんきタイプの技の威力が1.2倍になる。",
    effect: "type_boost",
    boostType: "electric",
    consumable: false,
  },
];

const HELD_ITEM_MAP = new Map(HELD_ITEMS.map((item) => [item.id, item]));

export function getHeldItemById(id: string): HeldItemDefinition | undefined {
  return HELD_ITEM_MAP.get(id);
}
