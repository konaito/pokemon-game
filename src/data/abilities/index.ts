/**
 * 特性（アビリティ）マスターデータ (#172)
 */
import type { AbilityDefinition } from "@/types";

/** 全特性データ */
export const ALL_ABILITIES: AbilityDefinition[] = [
  // ── ピンチ系（HP1/3以下でタイプ技1.5倍）──
  {
    id: "blaze",
    name: "もうか",
    description: "HPが1/3以下のとき、炎タイプの技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "torrent",
    name: "げきりゅう",
    description: "HPが1/3以下のとき、水タイプの技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "overgrow",
    name: "しんりょく",
    description: "HPが1/3以下のとき、草タイプの技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "swarm",
    name: "むしのしらせ",
    description: "HPが1/3以下のとき、虫タイプの技の威力が1.5倍になる。",
    trigger: "on_damage_calc",
  },

  // ── 登場時効果 ──
  {
    id: "intimidate",
    name: "いかく",
    description: "登場時、相手の攻撃を1段階下げる。",
    trigger: "on_enter",
  },
  {
    id: "drizzle",
    name: "あめふらし",
    description: "登場時、天候を雨にする。",
    trigger: "on_enter",
  },
  {
    id: "drought",
    name: "ひでり",
    description: "登場時、天候を晴れにする。",
    trigger: "on_enter",
  },

  // ── タイプ耐性・無効化 ──
  {
    id: "levitate",
    name: "ふゆう",
    description: "地面タイプの技を無効化する。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "flash_fire",
    name: "もらいび",
    description: "炎タイプの技を受けると無効化し、自分の炎技の威力が1.5倍になる。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "water_absorb",
    name: "ちょすい",
    description: "水タイプの技を受けるとHPが1/4回復する。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "volt_absorb",
    name: "ちくでん",
    description: "電気タイプの技を受けるとHPが1/4回復する。",
    trigger: "on_type_effectiveness",
  },
  {
    id: "thick_fat",
    name: "あついしぼう",
    description: "炎と氷タイプの技のダメージを半減する。",
    trigger: "on_damage_calc",
  },

  // ── ダメージ補正系 ──
  {
    id: "adaptability",
    name: "てきおうりょく",
    description: "タイプ一致ボーナスが1.5倍ではなく2倍になる。",
    trigger: "on_stab",
  },
  {
    id: "huge_power",
    name: "ちからもち",
    description: "物理技の攻撃力が2倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "guts",
    name: "こんじょう",
    description: "状態異常のとき、攻撃が1.5倍になる。やけどの攻撃低下を無効化する。",
    trigger: "on_damage_calc",
  },

  // ── 耐久・防御系 ──
  {
    id: "sturdy",
    name: "がんじょう",
    description: "HPが満タンのとき、一撃でひんしにならない（HP1で耐える）。",
    trigger: "on_damage_calc",
  },
  {
    id: "clear_body",
    name: "クリアボディ",
    description: "相手の技や特性で能力を下げられない。",
    trigger: "on_enter",
  },
  {
    id: "ice_scales",
    name: "こおりのりんぷん",
    description: "特殊技のダメージを半減する。",
    trigger: "on_damage_calc",
  },

  // ── 速度・行動系 ──
  {
    id: "speed_boost",
    name: "かそく",
    description: "毎ターン終了時、素早さが1段階上がる。",
    trigger: "on_enter",
  },
  {
    id: "swift_swim",
    name: "すいすい",
    description: "雨のとき、素早さが2倍になる。",
    trigger: "on_damage_calc",
  },

  // ── その他 ──
  {
    id: "poison_touch",
    name: "どくしゅ",
    description: "接触技で攻撃したとき、30%の確率で相手を毒にする。",
    trigger: "on_damage_calc",
  },
  {
    id: "keen_eye",
    name: "するどいめ",
    description: "命中率を下げられない。",
    trigger: "on_enter",
  },
  {
    id: "inner_focus",
    name: "せいしんりょく",
    description: "ひるまない。",
    trigger: "on_enter",
  },
  {
    id: "natural_cure",
    name: "しぜんかいふく",
    description: "交代すると状態異常が治る。",
    trigger: "on_enter",
  },
  {
    id: "iron_fist",
    name: "てつのこぶし",
    description: "パンチ技の威力が1.2倍になる。",
    trigger: "on_damage_calc",
  },
  {
    id: "rock_head",
    name: "いしあたま",
    description: "反動ダメージを受けない。",
    trigger: "on_damage_calc",
  },
  {
    id: "shell_armor",
    name: "シェルアーマー",
    description: "相手の攻撃が急所に当たらない。",
    trigger: "on_damage_calc",
  },
  {
    id: "shadow_tag",
    name: "かげふみ",
    description: "相手は逃げたり交代できない。",
    trigger: "on_enter",
  },
  {
    id: "synchronize",
    name: "シンクロ",
    description: "毒・麻痺・やけどになると、相手も同じ状態異常になる。",
    trigger: "on_enter",
  },
  {
    id: "marvel_scale",
    name: "ふしぎなうろこ",
    description: "状態異常のとき、防御が1.5倍になる。",
    trigger: "on_damage_calc",
  },
];

/** IDから特性を取得 */
export function getAbilityById(id: string): AbilityDefinition | undefined {
  return ALL_ABILITIES.find((a) => a.id === id);
}

/**
 * モンスター種族→特性のデフォルトマッピング
 * MonsterSpecies.abilities が未設定の場合のフォールバック
 */
export const SPECIES_ABILITIES: Record<string, string[]> = {
  // 御三家（炎）
  himori: ["blaze"],
  hinomori: ["blaze"],
  enjuu: ["blaze", "iron_fist"],

  // 御三家（水）
  shizukumo: ["torrent"],
  namikozou: ["torrent"],
  taikaiou: ["torrent", "synchronize"],

  // 御三家（草）
  konohana: ["overgrow"],
  morinoko: ["overgrow"],
  taijushin: ["overgrow", "rock_head"],

  // 序盤ノーマル
  konezumi: ["guts", "keen_eye"],
  oonezumi: ["guts", "keen_eye"],

  // 序盤飛行
  tobibato: ["keen_eye"],
  hayatedori: ["keen_eye", "speed_boost"],

  // 序盤虫
  mayumushi: ["swarm"],
  hanamushi: ["swarm", "speed_boost"],

  // 電気
  hikarineko: ["volt_absorb"],

  // 毒
  dokudama: ["poison_touch"],
  dokunuma: ["poison_touch"],

  // 水地面
  kawadojou: ["swift_swim", "water_absorb"],

  // 中盤 炎
  hidane: ["blaze", "flash_fire"],
  kaenjishi: ["intimidate", "flash_fire"],

  // 格闘岩
  tsuchikobushi: ["guts", "iron_fist"],
  iwakenjin: ["guts", "sturdy"],

  // 地面鋼
  mogurakko: ["keen_eye"],
  dogou: ["sturdy", "clear_body"],

  // ゴースト
  yurabi: ["levitate"],
  kageboushi: ["levitate", "synchronize"],
  yomikagura: ["levitate", "shadow_tag"],

  // フェアリー
  hanausagi: ["natural_cure"],
  tsukiusagi: ["natural_cure", "synchronize"],

  // 鋼
  kanamori: ["sturdy", "clear_body"],

  // 毒草
  kusakabi: ["overgrow", "poison_touch"],
  dokubana: ["poison_touch", "natural_cure"],

  // 悪飛行
  yamigarasu: ["keen_eye", "inner_focus"],

  // 氷
  yukiusagi: ["ice_scales", "natural_cure"],
  koorigitsune: ["ice_scales", "adaptability"],
  kogoriiwa: ["sturdy", "rock_head"],

  // ドラゴン
  tatsunoko: ["inner_focus"],
  ryuubi: ["intimidate", "inner_focus"],
  ryuujin: ["intimidate", "adaptability"],

  // エスパー
  kiokudama: ["synchronize", "inner_focus"],
  omoidama: ["synchronize", "marvel_scale"],

  // 鋼ドラゴン
  haganedake: ["sturdy", "shell_armor"],

  // 悪格闘
  kurooni: ["guts", "intimidate"],

  // ゴースト氷
  fubukirei: ["levitate", "ice_scales"],

  // 水ドラゴン
  umihebi: ["swift_swim", "marvel_scale"],

  // 電気鋼
  denjimushi: ["volt_absorb"],
  raijindou: ["volt_absorb", "clear_body"],

  // 伝説
  omoide: ["synchronize"],
  wasurenu: ["shadow_tag"],
};

/** 種族IDからデフォルト特性リストを取得 */
export function getSpeciesAbilities(speciesId: string): string[] {
  return SPECIES_ABILITIES[speciesId] ?? [];
}
