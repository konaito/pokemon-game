/**
 * 持ち物（もちもの）マスターデータ (#174)
 */
import type { TypeId } from "@/types";

/** 持ち物効果の種別 */
export type HeldItemEffectType =
  | "type_boost"
  | "pinch_heal"
  | "status_cure"
  | "choice_atk"
  | "choice_spatk"
  | "choice_speed"
  | "life_orb"
  | "focus_sash"
  | "leftovers"
  | "eviolite"
  | "none";

/** 持ち物定義 */
export interface HeldItemDefinition {
  id: string;
  name: string;
  description: string;
  effectType: HeldItemEffectType;
  /** タイプ強化系の対象タイプ */
  boostType?: TypeId;
  /** 消費アイテムか */
  consumable: boolean;
}

/** 全持ち物データ */
export const ALL_HELD_ITEMS: HeldItemDefinition[] = [
  // ── きのみ系（消費）──
  {
    id: "oran_berry",
    name: "オボンのみ",
    description: "HP1/2以下で最大HPの1/4回復。",
    effectType: "pinch_heal",
    consumable: true,
  },
  {
    id: "lum_berry",
    name: "ラムのみ",
    description: "状態異常になった時に自動回復。",
    effectType: "status_cure",
    consumable: true,
  },
  {
    id: "focus_sash",
    name: "きあいのタスキ",
    description: "HP満タンから一撃で倒される時HP1で耐える。",
    effectType: "focus_sash",
    consumable: true,
  },

  // ── 攻撃強化系（非消費）──
  {
    id: "choice_band",
    name: "こだわりハチマキ",
    description: "攻撃1.5倍。同じ技しか出せない。",
    effectType: "choice_atk",
    consumable: false,
  },
  {
    id: "choice_specs",
    name: "こだわりメガネ",
    description: "特攻1.5倍。同じ技しか出せない。",
    effectType: "choice_spatk",
    consumable: false,
  },
  {
    id: "choice_scarf",
    name: "こだわりスカーフ",
    description: "素早さ1.5倍。同じ技しか出せない。",
    effectType: "choice_speed",
    consumable: false,
  },
  {
    id: "life_orb",
    name: "いのちのたま",
    description: "技威力1.3倍。攻撃のたびにHP1/10消費。",
    effectType: "life_orb",
    consumable: false,
  },
  {
    id: "leftovers",
    name: "たべのこし",
    description: "毎ターン最大HPの1/16回復。",
    effectType: "leftovers",
    consumable: false,
  },
  {
    id: "eviolite",
    name: "しんかのきせき",
    description: "進化前のモンスターの防御・特防1.5倍。",
    effectType: "eviolite",
    consumable: false,
  },

  // ── タイプ強化系（非消費）──
  {
    id: "charcoal",
    name: "もくたん",
    description: "炎タイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "fire",
    consumable: false,
  },
  {
    id: "mystic_water",
    name: "しんぴのしずく",
    description: "水タイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "water",
    consumable: false,
  },
  {
    id: "miracle_seed",
    name: "きせきのタネ",
    description: "草タイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "grass",
    consumable: false,
  },
  {
    id: "magnet",
    name: "じしゃく",
    description: "電気タイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "electric",
    consumable: false,
  },
  {
    id: "never_melt_ice",
    name: "とけないこおり",
    description: "氷タイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "ice",
    consumable: false,
  },
  {
    id: "black_belt",
    name: "くろおび",
    description: "格闘タイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "fighting",
    consumable: false,
  },
  {
    id: "dragon_fang",
    name: "りゅうのキバ",
    description: "ドラゴンタイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "dragon",
    consumable: false,
  },
  {
    id: "spell_tag",
    name: "のろいのおふだ",
    description: "ゴーストタイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "ghost",
    consumable: false,
  },
  {
    id: "metal_coat",
    name: "メタルコート",
    description: "鋼タイプの技の威力が1.2倍。",
    effectType: "type_boost",
    boostType: "steel",
    consumable: false,
  },
];

/** IDから持ち物を取得 */
export function getHeldItemById(id: string): HeldItemDefinition | undefined {
  return ALL_HELD_ITEMS.find((item) => item.id === id);
}
