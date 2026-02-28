import type { AbilityDefinition } from "@/types";

/** 全特性のマスターデータ */
export const ALL_ABILITIES: AbilityDefinition[] = [
  // ── スターター御三家の専用特性 ──
  {
    id: "blaze",
    name: "もうか",
    description: "HPが1/3以下のとき、ほのお技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "torrent",
    name: "げきりゅう",
    description: "HPが1/3以下のとき、みず技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "overgrow",
    name: "しんりょく",
    description: "HPが1/3以下のとき、くさ技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },

  // ── 登場時発動 ──
  {
    id: "intimidate",
    name: "いかく",
    description: "場に出たとき、相手の攻撃を1段階下げる。",
    trigger: "on_enter",
  },

  // ── ダメージ計算時 ──
  {
    id: "adaptability",
    name: "てきおうりょく",
    description: "タイプ一致技のボーナスが1.5倍から2倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "huge_power",
    name: "ちからもち",
    description: "物理技の攻撃力が2倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "technician",
    name: "テクニシャン",
    description: "威力60以下の技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "iron_fist",
    name: "てつのこぶし",
    description: "パンチ系の技の威力が1.2倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "sniper",
    name: "スナイパー",
    description: "急所に当たったときのダメージが2.25倍になる。",
    trigger: "on_damage_calc",
  },

  // ── タイプ相性変更 ──
  {
    id: "levitate",
    name: "ふゆう",
    description: "じめん技を受けない。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "flash_fire",
    name: "もらいび",
    description: "ほのお技を受けるとダメージ無効で、自分のほのお技の威力が1.5倍になる。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "water_absorb",
    name: "ちょすい",
    description: "みず技を受けるとダメージ無効で、HPを1/4回復する。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "volt_absorb",
    name: "ちくでん",
    description: "でんき技を受けるとダメージ無効で、HPを1/4回復する。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "thick_fat",
    name: "あついしぼう",
    description: "ほのおとこおりタイプの技のダメージを半減する。",
    trigger: "on_damage_calc",
  },

  // ── パッシブ ──
  {
    id: "sturdy",
    name: "がんじょう",
    description: "HPが満タンのとき、一撃で倒されない（HP1で耐える）。",
    trigger: "passive",
  },
  {
    id: "natural_cure",
    name: "しぜんかいふく",
    description: "交代すると状態異常が治る。",
    trigger: "passive",
  },
  {
    id: "poison_point",
    name: "どくのトゲ",
    description: "直接攻撃を受けると30%の確率で相手をどく状態にする。",
    trigger: "passive",
  },
  {
    id: "static",
    name: "せいでんき",
    description: "直接攻撃を受けると30%の確率で相手をまひ状態にする。",
    trigger: "passive",
  },
  {
    id: "flame_body",
    name: "ほのおのからだ",
    description: "直接攻撃を受けると30%の確率で相手をやけど状態にする。",
    trigger: "passive",
  },
  {
    id: "swift_swim",
    name: "すいすい",
    description: "天候が雨のとき、素早さが2倍になる。",
    trigger: "passive",
  },
  {
    id: "chlorophyll",
    name: "ようりょくそ",
    description: "天候が晴れのとき、素早さが2倍になる。",
    trigger: "passive",
  },
  {
    id: "sand_veil",
    name: "すながくれ",
    description: "砂嵐のとき、回避率が1.25倍になる。",
    trigger: "passive",
  },
  {
    id: "guts",
    name: "こんじょう",
    description: "状態異常のとき、攻撃が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "clear_body",
    name: "クリアボディ",
    description: "相手の技や特性で能力を下げられない。",
    trigger: "passive",
  },
  {
    id: "inner_focus",
    name: "せいしんりょく",
    description: "ひるまない。",
    trigger: "passive",
  },
  {
    id: "keen_eye",
    name: "するどいめ",
    description: "命中率を下げられない。",
    trigger: "passive",
  },
  {
    id: "shed_skin",
    name: "だっぴ",
    description: "毎ターン1/3の確率で状態異常が治る。",
    trigger: "passive",
  },
  {
    id: "pressure",
    name: "プレッシャー",
    description: "相手の技のPP消費を1増やす。",
    trigger: "passive",
  },
  {
    id: "marvel_scale",
    name: "ふしぎなうろこ",
    description: "状態異常のとき、防御が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "multiscale",
    name: "マルチスケイル",
    description: "HPが満タンのとき、受けるダメージを半減する。",
    trigger: "on_damage_calc",
  },
];

const ABILITY_MAP = new Map(ALL_ABILITIES.map((a) => [a.id, a]));

/** 特性IDから定義を取得 */
export function getAbilityById(abilityId: string): AbilityDefinition {
  const ability = ABILITY_MAP.get(abilityId);
  if (!ability) {
    throw new Error(`Unknown ability: ${abilityId}`);
  }
  return ability;
}
