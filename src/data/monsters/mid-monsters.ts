/**
 * 中盤モンスターデータ（ルート4〜6、カガリ市〜キリフリ村）
 * ジム4（炎）〜ジム6（ゴースト）エリアで出会えるモンスター
 */
import type { MonsterSpecies } from "@/types";

export const MID_MONSTERS: MonsterSpecies[] = [
  // === 炎枠: ヒダネ → カエンジシ ===
  // ルート4（平野）の草むら。カガリ市（炎ジム）周辺の炎タイプ
  {
    id: "hidane",
    name: "ヒダネ",
    types: ["fire"],
    baseStats: { hp: 50, atk: 65, def: 40, spAtk: 45, spDef: 40, speed: 60 },
    baseExpYield: 70,
    expGroup: "medium_fast",
    dexEntry:
      "たてがみの火種は一度消えると二度と灯らない。大忘却を生き延びた炎の記憶を守り続ける誇り高きモンスター。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "ember" },
      { level: 8, moveId: "bite" },
      { level: 14, moveId: "flame-wheel" },
      { level: 20, moveId: "fire-fang" },
    ],
    evolvesTo: [{ id: "kaenjishi", level: 30 }],
  },
  {
    id: "kaenjishi",
    name: "カエンジシ",
    types: ["fire", "normal"],
    baseStats: { hp: 76, atk: 98, def: 65, spAtk: 68, spDef: 65, speed: 93 },
    baseExpYield: 180,
    expGroup: "medium_fast",
    dexEntry:
      "燃え盛るたてがみは王者の証。群れを率いて忘れられた大地を巡り、かつての繁栄の痕跡を焼き付けるように見つめる。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "ember" },
      { level: 1, moveId: "bite" },
      { level: 14, moveId: "flame-wheel" },
      { level: 20, moveId: "fire-fang" },
      { level: 30, moveId: "slash" },
      { level: 37, moveId: "flamethrower" },
    ],
  },

  // === 格闘枠: ツチコブシ → イワケンジン ===
  // ルート4の岩場。格闘+岩の力強いモンスター
  {
    id: "tsuchikobushi",
    name: "ツチコブシ",
    types: ["fighting"],
    baseStats: { hp: 55, atk: 70, def: 55, spAtk: 30, spDef: 40, speed: 45 },
    baseExpYield: 75,
    expGroup: "medium_slow",
    dexEntry:
      "大地を拳で叩き続けて鍛える。大忘却で割れた地層を繋ぎ止めるように、黙々と岩を積み上げる姿が目撃されている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 5, moveId: "leer" },
      { level: 10, moveId: "rock-throw" },
      { level: 16, moveId: "double-kick" },
      { level: 22, moveId: "brick-break" },
    ],
    evolvesTo: [{ id: "iwakenjin", level: 32 }],
  },
  {
    id: "iwakenjin",
    name: "イワケンジン",
    types: ["fighting", "rock"],
    baseStats: { hp: 80, atk: 105, def: 85, spAtk: 40, spDef: 55, speed: 55 },
    baseExpYield: 190,
    expGroup: "medium_slow",
    dexEntry:
      "岩の鎧を纏った拳士。忘れ去られた武術の型を本能で再現し、一撃で巨岩を砕く。その技は大忘却以前の格闘術の名残だという。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "leer" },
      { level: 1, moveId: "rock-throw" },
      { level: 16, moveId: "double-kick" },
      { level: 22, moveId: "brick-break" },
      { level: 32, moveId: "rock-slide" },
      { level: 40, moveId: "close-combat" },
    ],
  },

  // === 地面枠: モグラッコ → ドゴウ ===
  // ルート5（渓谷）のダンジョン。ジム5（地面）の地元モンスター
  {
    id: "mogurakko",
    name: "モグラッコ",
    types: ["ground"],
    baseStats: { hp: 50, atk: 55, def: 50, spAtk: 35, spDef: 40, speed: 60 },
    baseExpYield: 68,
    expGroup: "medium_fast",
    dexEntry:
      "地中のトンネルを掘り進む名人。大忘却で埋もれた地下遺跡を見つけ出すことがあり、考古学者の良きパートナー。",
    learnset: [
      { level: 1, moveId: "scratch" },
      { level: 1, moveId: "mud-slap" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dig" },
      { level: 22, moveId: "slash" },
    ],
    evolvesTo: [{ id: "dogou", level: 28 }],
  },
  {
    id: "dogou",
    name: "ドゴウ",
    types: ["ground", "steel"],
    baseStats: { hp: 75, atk: 90, def: 85, spAtk: 45, spDef: 60, speed: 75 },
    baseExpYield: 178,
    expGroup: "medium_fast",
    dexEntry:
      "鋼の爪で地脈を切り開く。体に纏った鉱石は大忘却以前の金属文明の遺産で、決して錆びることがない。",
    learnset: [
      { level: 1, moveId: "scratch" },
      { level: 1, moveId: "mud-slap" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dig" },
      { level: 22, moveId: "slash" },
      { level: 28, moveId: "iron-head" },
      { level: 35, moveId: "earthquake" },
    ],
  },

  // === ゴースト枠: ユラビ → カゲボウシ → ヨミカグラ ===
  // ルート6（霧の森）。ジム6（ゴースト）の象徴的3段階進化
  {
    id: "yurabi",
    name: "ユラビ",
    types: ["ghost"],
    baseStats: { hp: 35, atk: 25, def: 30, spAtk: 60, spDef: 45, speed: 55 },
    baseExpYield: 55,
    expGroup: "medium_slow",
    dexEntry:
      "揺らめく炎のような姿をした幽霊。大忘却で消えた人々の想いの残滓から生まれたとされる。触れると切ない記憶が蘇る。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 4, moveId: "shadow-sneak" },
      { level: 10, moveId: "shadow-claw" },
      { level: 16, moveId: "psybeam" },
    ],
    evolvesTo: [{ id: "kageboushi", level: 25 }],
  },
  {
    id: "kageboushi",
    name: "カゲボウシ",
    types: ["ghost", "psychic"],
    baseStats: { hp: 50, atk: 40, def: 45, spAtk: 85, spDef: 65, speed: 70 },
    baseExpYield: 140,
    expGroup: "medium_slow",
    dexEntry:
      "影に潜み、人の忘れた記憶を拾い集める。月夜に影の中から覗く瞳は、忘却の彼方を見つめているかのようだ。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "shadow-sneak" },
      { level: 10, moveId: "shadow-claw" },
      { level: 16, moveId: "psybeam" },
      { level: 25, moveId: "shadow-ball" },
    ],
    evolvesTo: [{ id: "yomikagura", level: 40 }],
  },
  {
    id: "yomikagura",
    name: "ヨミカグラ",
    types: ["ghost", "psychic"],
    baseStats: { hp: 65, atk: 55, def: 60, spAtk: 115, spDef: 90, speed: 90 },
    baseExpYield: 230,
    expGroup: "medium_slow",
    dexEntry:
      "黄泉の舞を踊ることで、忘れ去られた魂を一時的に呼び戻す。大忘却の犠牲者たちの想いを鎮める神聖な存在とされている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "shadow-sneak" },
      { level: 1, moveId: "shadow-claw" },
      { level: 1, moveId: "psybeam" },
      { level: 25, moveId: "shadow-ball" },
      { level: 40, moveId: "psychic" },
    ],
  },

  // === フェアリー枠: ハナウサギ → ツキウサギ ===
  // ルート5〜6で稀少出現。月と花のフェアリータイプ
  {
    id: "hanausagi",
    name: "ハナウサギ",
    types: ["fairy"],
    baseStats: { hp: 50, atk: 35, def: 40, spAtk: 60, spDef: 55, speed: 55 },
    baseExpYield: 72,
    expGroup: "fast",
    dexEntry:
      "花畑に隠れて暮らす臆病なモンスター。大忘却で荒れ果てた野原に真っ先に花を咲かせたのは、この子たちだと伝えられている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "fairy-wind" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dazzling-gleam" },
    ],
    evolvesTo: [{ id: "tsukiusagi", level: 30 }],
  },
  {
    id: "tsukiusagi",
    name: "ツキウサギ",
    types: ["fairy", "psychic"],
    baseStats: { hp: 70, atk: 50, def: 60, spAtk: 95, spDef: 85, speed: 80 },
    baseExpYield: 185,
    expGroup: "fast",
    dexEntry:
      "満月の光を浴びて進化する。月明かりに照らされた耳は忘れた記憶を受信するアンテナのようで、涙を流しながら月を見上げることがある。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "fairy-wind" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "dazzling-gleam" },
      { level: 30, moveId: "psychic" },
      { level: 38, moveId: "moonblast" },
    ],
  },

  // === 鋼枠: カナモリ（単体・進化なし）===
  // ルート5の洞窟。頑丈な鋼タイプ
  {
    id: "kanamori",
    name: "カナモリ",
    types: ["steel"],
    baseStats: { hp: 65, atk: 70, def: 100, spAtk: 40, spDef: 70, speed: 30 },
    baseExpYield: 140,
    expGroup: "medium_slow",
    dexEntry:
      "体は忘れ去られた時代の金属でできている。何千年経っても朽ちず、大忘却の記録を体内に封じ込めた生きた遺跡とも呼ばれる。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "metal-claw" },
      { level: 10, moveId: "harden" },
      { level: 18, moveId: "iron-head" },
      { level: 26, moveId: "rock-slide" },
      { level: 34, moveId: "iron-tail" },
    ],
  },

  // === 毒/草枠: クサカビ → ドクバナ ===
  // ルート6の森。毒と草の複合、森の瘴気をまとったモンスター
  {
    id: "kusakabi",
    name: "クサカビ",
    types: ["poison", "grass"],
    baseStats: { hp: 45, atk: 35, def: 40, spAtk: 55, spDef: 50, speed: 40 },
    baseExpYield: 60,
    expGroup: "medium_fast",
    dexEntry:
      "腐った落ち葉から生まれるカビのモンスター。大忘却で朽ちた森の養分を吸い上げ、忘却の瘴気を胞子として撒き散らす。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "poison-sting" },
      { level: 8, moveId: "vine-whip" },
      { level: 14, moveId: "leech-seed" },
      { level: 20, moveId: "cross-poison" },
    ],
    evolvesTo: [{ id: "dokubana", level: 32 }],
  },
  {
    id: "dokubana",
    name: "ドクバナ",
    types: ["poison", "grass"],
    baseStats: { hp: 70, atk: 55, def: 65, spAtk: 90, spDef: 80, speed: 60 },
    baseExpYield: 175,
    expGroup: "medium_fast",
    dexEntry:
      "美しくも致命的な毒の花を咲かせる。その花弁の香りを嗅ぐと忘れていた記憶が蘇るが、同時に激しい頭痛に襲われるという。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "poison-sting" },
      { level: 1, moveId: "vine-whip" },
      { level: 14, moveId: "leech-seed" },
      { level: 20, moveId: "cross-poison" },
      { level: 32, moveId: "sludge-bomb" },
      { level: 40, moveId: "energy-ball" },
    ],
  },

  // === 悪枠: ヤミガラス（単体・進化なし）===
  // ルート5〜6の夜間出現。情報収集に使われるカラス
  {
    id: "yamigarasu",
    name: "ヤミガラス",
    types: ["dark", "flying"],
    baseStats: { hp: 55, atk: 75, def: 50, spAtk: 60, spDef: 50, speed: 80 },
    baseExpYield: 130,
    expGroup: "medium_slow",
    dexEntry:
      "大忘却の闇夜を自在に飛ぶ不吉な鳥。光る物を集める習性があり、巣には忘れられた時代の宝物が溜まっていることがある。",
    learnset: [
      { level: 1, moveId: "peck" },
      { level: 1, moveId: "bite" },
      { level: 10, moveId: "wing-attack" },
      { level: 18, moveId: "sucker-punch" },
      { level: 26, moveId: "aerial-ace" },
      { level: 34, moveId: "crunch" },
      { level: 42, moveId: "dark-pulse" },
    ],
  },
];
