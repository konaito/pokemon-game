/**
 * 終盤モンスターデータ（ルート7〜8、ユキツバキ村〜ミズホ市〜チャンピオンロード）
 * ジム7（氷）〜ジム8（ドラゴン）エリアで出会えるモンスター
 */
import type { MonsterSpecies } from "@/types";

export const LATE_MONSTERS: MonsterSpecies[] = [
  // === 氷枠: ユキウサギ → コオリギツネ ===
  // ルート7（雪山）。ジム7（氷）の地元モンスター
  {
    id: "yukiusagi",
    name: "ユキウサギ",
    types: ["ice"],
    baseStats: { hp: 45, atk: 40, def: 45, spAtk: 60, spDef: 50, speed: 65 },
    baseExpYield: 80,
    expGroup: "medium_fast",
    dexEntry:
      "雪山に棲む白い小うさぎ。大忘却の冬を耐え抜いた祖先の記憶が、氷の結晶となって毛並みに宿っている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "icy-wind" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "ice-shard" },
      { level: 22, moveId: "ice-fang" },
    ],
    evolvesTo: [{ id: "koorigitsune", level: 34 }],
  },
  {
    id: "koorigitsune",
    name: "コオリギツネ",
    types: ["ice", "fairy"],
    baseStats: { hp: 65, atk: 55, def: 60, spAtk: 95, spDef: 80, speed: 100 },
    baseExpYield: 195,
    expGroup: "medium_fast",
    dexEntry:
      "九本の尾は九つの失われた記憶を象徴するという。吹雪の中を優雅に舞い、凍てついた記憶の欠片を解き放つ。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "icy-wind" },
      { level: 8, moveId: "quick-attack" },
      { level: 15, moveId: "ice-shard" },
      { level: 22, moveId: "ice-fang" },
      { level: 34, moveId: "dazzling-gleam" },
      { level: 42, moveId: "ice-beam" },
      { level: 50, moveId: "blizzard" },
    ],
  },

  // === 氷/岩枠: コゴリイワ（単体・進化なし）===
  // ルート7の雪山洞窟。凍った岩のモンスター
  {
    id: "kogoriiwa",
    name: "コゴリイワ",
    types: ["ice", "rock"],
    baseStats: { hp: 80, atk: 90, def: 95, spAtk: 40, spDef: 55, speed: 30 },
    baseExpYield: 155,
    expGroup: "medium_slow",
    dexEntry:
      "永久凍土の中で眠り続けていた太古の岩。大忘却以前の風景がその氷の中に封じ込められ、覗き込むとかつての世界が見えるという。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "ice-shard" },
      { level: 10, moveId: "rock-throw" },
      { level: 18, moveId: "harden" },
      { level: 26, moveId: "rock-slide" },
      { level: 34, moveId: "ice-fang" },
      { level: 42, moveId: "stone-edge" },
    ],
  },

  // === ドラゴン枠: タツノコ → リュウジン ===
  // ルート8（高原）。ジム8（ドラゴン）の地元モンスター。3段階進化
  {
    id: "tatsunoko",
    name: "タツノコ",
    types: ["dragon"],
    baseStats: { hp: 45, atk: 55, def: 45, spAtk: 55, spDef: 45, speed: 50 },
    baseExpYield: 60,
    expGroup: "slow",
    dexEntry:
      "古い伝承にのみ記された竜の幼生。大忘却で竜族は絶滅したと思われていたが、高原の奥地でひっそりと生き延びていた。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "leer" },
      { level: 8, moveId: "dragon-breath" },
      { level: 15, moveId: "bite" },
      { level: 22, moveId: "slash" },
    ],
    evolvesTo: [{ id: "ryuubi", level: 30 }],
  },
  {
    id: "ryuubi",
    name: "リュウビ",
    types: ["dragon", "flying"],
    baseStats: { hp: 65, atk: 75, def: 60, spAtk: 75, spDef: 60, speed: 70 },
    baseExpYield: 147,
    expGroup: "slow",
    dexEntry:
      "翼を得て空を翔る若竜。忘れられた空中都市の残骸の間を飛び回り、竜族の栄光の記憶を翼に刻んでいく。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "leer" },
      { level: 1, moveId: "dragon-breath" },
      { level: 15, moveId: "bite" },
      { level: 22, moveId: "slash" },
      { level: 30, moveId: "dragon-claw" },
      { level: 38, moveId: "air-slash" },
    ],
    evolvesTo: [{ id: "ryuujin", level: 48 }],
  },
  {
    id: "ryuujin",
    name: "リュウジン",
    types: ["dragon", "flying"],
    baseStats: { hp: 90, atk: 110, def: 80, spAtk: 100, spDef: 80, speed: 95 },
    baseExpYield: 270,
    expGroup: "slow",
    dexEntry:
      "天を統べる竜神。大忘却を引き起こした力にも屈せず、記憶の守護者として空から世界を見守り続けてきたと神話に記されている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "dragon-breath" },
      { level: 1, moveId: "dragon-claw" },
      { level: 1, moveId: "air-slash" },
      { level: 48, moveId: "dragon-pulse" },
      { level: 56, moveId: "outrage" },
    ],
  },

  // === エスパー枠: キオクダマ → オモイダマ ===
  // ルート7〜8の稀少枠。記憶に関わるエスパーモンスター（テーマ的に重要）
  {
    id: "kiokudama",
    name: "キオクダマ",
    types: ["psychic"],
    baseStats: { hp: 55, atk: 30, def: 50, spAtk: 70, spDef: 55, speed: 45 },
    baseExpYield: 78,
    expGroup: "medium_slow",
    dexEntry:
      "宙に浮かぶ記憶の珠。大忘却で失われた記憶の断片が凝縮して生まれたモンスター。近づくと誰かの想い出の映像が頭に流れ込む。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 5, moveId: "psybeam" },
      { level: 12, moveId: "fairy-wind" },
      { level: 20, moveId: "zen-headbutt" },
    ],
    evolvesTo: [{ id: "omoidama", level: 36 }],
  },
  {
    id: "omoidama",
    name: "オモイダマ",
    types: ["psychic", "fairy"],
    baseStats: { hp: 75, atk: 45, def: 70, spAtk: 105, spDef: 90, speed: 60 },
    baseExpYield: 200,
    expGroup: "medium_slow",
    dexEntry:
      "大切な想い出の結晶。持ち主の最も美しい記憶を映し出し、どんなに辛い忘却にも抗う力を与えてくれるといわれている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "psybeam" },
      { level: 12, moveId: "fairy-wind" },
      { level: 20, moveId: "zen-headbutt" },
      { level: 36, moveId: "psychic" },
      { level: 44, moveId: "moonblast" },
    ],
  },

  // === 鋼/ドラゴン枠: ハガネダケ（単体・進化なし、擬似伝説）===
  // チャンピオンロード。竹のように硬い鋼+ドラゴンの希少モンスター
  {
    id: "haganedake",
    name: "ハガネダケ",
    types: ["steel", "dragon"],
    baseStats: { hp: 70, atk: 95, def: 105, spAtk: 60, spDef: 80, speed: 50 },
    baseExpYield: 175,
    expGroup: "slow",
    dexEntry:
      "鋼のように硬い竹の姿をした擬似伝説モンスター。大忘却の嵐にも折れず、竜の血脈と鋼の意志で世界の記憶を支え続けている。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "metal-claw" },
      { level: 12, moveId: "dragon-breath" },
      { level: 20, moveId: "iron-head" },
      { level: 28, moveId: "dragon-claw" },
      { level: 36, moveId: "flash-cannon" },
      { level: 44, moveId: "iron-tail" },
    ],
  },

  // === 悪/格闘枠: クロオニ（単体・進化なし）===
  // チャンピオンロード。鬼のようなモンスター
  {
    id: "kurooni",
    name: "クロオニ",
    types: ["dark", "fighting"],
    baseStats: { hp: 80, atk: 100, def: 70, spAtk: 50, spDef: 60, speed: 85 },
    baseExpYield: 168,
    expGroup: "medium_slow",
    dexEntry:
      "大忘却の闇から生まれた鬼。忘却に飲まれた者の怒りと悲しみが形を成したとされ、その拳は記憶を砕くほどの破壊力を持つ。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "bite" },
      { level: 10, moveId: "double-kick" },
      { level: 18, moveId: "sucker-punch" },
      { level: 26, moveId: "brick-break" },
      { level: 34, moveId: "crunch" },
      { level: 42, moveId: "close-combat" },
    ],
  },

  // === ゴースト/氷枠: フブキレイ（単体・進化なし）===
  // ルート7の吹雪の夜。凍える幽霊
  {
    id: "fubukirei",
    name: "フブキレイ",
    types: ["ghost", "ice"],
    baseStats: { hp: 55, atk: 40, def: 55, spAtk: 95, spDef: 85, speed: 80 },
    baseExpYield: 168,
    expGroup: "medium_fast",
    dexEntry:
      "吹雪の夜に現れる凍える幽霊。大忘却の寒波で凍りついた旅人の未練が形を成したもの。その泣き声は忘れた人の名を呼んでいるという。",
    learnset: [
      { level: 1, moveId: "shadow-sneak" },
      { level: 1, moveId: "icy-wind" },
      { level: 10, moveId: "ice-shard" },
      { level: 18, moveId: "shadow-ball" },
      { level: 26, moveId: "ice-beam" },
      { level: 34, moveId: "dark-pulse" },
    ],
  },

  // === 水/ドラゴン枠: ウミヘビ（単体・進化なし）===
  // チャンピオンロードの水辺。海蛇のドラゴン
  {
    id: "umihebi",
    name: "ウミヘビ",
    types: ["water", "dragon"],
    baseStats: { hp: 75, atk: 60, def: 70, spAtk: 90, spDef: 75, speed: 80 },
    baseExpYield: 170,
    expGroup: "medium_slow",
    dexEntry:
      "深海の洞窟に棲む海竜。大忘却で海底に沈んだ都市の番人を務めており、記憶の泡を吐いて侵入者を惑わせる。",
    learnset: [
      { level: 1, moveId: "water-gun" },
      { level: 1, moveId: "dragon-breath" },
      { level: 12, moveId: "aqua-tail" },
      { level: 20, moveId: "dragon-pulse" },
      { level: 28, moveId: "surf" },
      { level: 36, moveId: "hydro-pump" },
    ],
  },

  // === 電気/鋼枠: デンジムシ → ライジンドウ ===
  // ルート8の草むら。電磁の鎧をまとうモンスター
  {
    id: "denjimushi",
    name: "デンジムシ",
    types: ["electric", "steel"],
    baseStats: { hp: 50, atk: 55, def: 65, spAtk: 55, spDef: 50, speed: 40 },
    baseExpYield: 82,
    expGroup: "medium_fast",
    dexEntry:
      "電磁波を纏った虫型モンスター。大忘却以前の通信機器の残骸に寄生して生まれたとされ、体内に微弱な電波信号を発している。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "thunder-shock" },
      { level: 10, moveId: "metal-claw" },
      { level: 17, moveId: "spark" },
      { level: 24, moveId: "iron-head" },
    ],
    evolvesTo: [{ id: "raijindou", level: 38 }],
  },
  {
    id: "raijindou",
    name: "ライジンドウ",
    types: ["electric", "steel"],
    baseStats: { hp: 70, atk: 80, def: 95, spAtk: 85, spDef: 75, speed: 60 },
    baseExpYield: 205,
    expGroup: "medium_fast",
    dexEntry:
      "雷神の鎧をまとった鋼の戦士。忘れられた古代の電力網を体内に再現しており、その放電は失われた文明の光を一瞬だけ蘇らせる。",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "thunder-shock" },
      { level: 1, moveId: "metal-claw" },
      { level: 17, moveId: "spark" },
      { level: 24, moveId: "iron-head" },
      { level: 38, moveId: "thunderbolt" },
      { level: 46, moveId: "flash-cannon" },
    ],
  },
];
