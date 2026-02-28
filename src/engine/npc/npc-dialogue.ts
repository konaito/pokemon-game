/**
 * NPC会話条件分岐システム (#190)
 * ストーリー進行・バッジ数・パーティ構成に応じてNPC会話が変化する
 */

import type { StoryFlags } from "@/engine/state/story-flags";
import { checkFlagRequirement, type FlagRequirement } from "@/engine/state/story-flags";

/** NPC会話解決に必要なコンテキスト */
export interface DialogueContext {
  storyFlags: StoryFlags;
  badgeCount: number;
  partySpeciesIds: string[];
  partySize: number;
}

/** 拡張NPC会話条件 */
export interface NpcDialogueCondition {
  /** ストーリーフラグ条件（既存互換） */
  flag?: FlagRequirement;
  /** バッジ数条件（以上） */
  badgeCountMin?: number;
  /** バッジ数条件（以下） */
  badgeCountMax?: number;
  /** パーティに特定モンスターがいる */
  partyHas?: string;
  /** パーティサイズ条件（以上） */
  partySizeMin?: number;
}

/** 条件付きダイアログエントリ */
export interface ConditionalDialogueEntry {
  condition: NpcDialogueCondition;
  text: string[];
}

/** 拡張NPC会話定義 */
export interface NpcDialogueSet {
  /** NPC ID */
  npcId: string;
  /** マップID */
  mapId: string;
  /** デフォルト会話 */
  default: string[];
  /** 条件付き会話（上から順に評価、最初にマッチしたものを返す） */
  conditions: ConditionalDialogueEntry[];
}

/**
 * 条件をチェックする
 * 全ての指定された条件をANDで評価する
 */
export function checkDialogueCondition(
  condition: NpcDialogueCondition,
  context: DialogueContext,
): boolean {
  // フラグ条件
  if (condition.flag !== undefined) {
    if (!checkFlagRequirement(context.storyFlags, condition.flag)) {
      return false;
    }
  }

  // バッジ数（最小）
  if (condition.badgeCountMin !== undefined) {
    if (context.badgeCount < condition.badgeCountMin) {
      return false;
    }
  }

  // バッジ数（最大）
  if (condition.badgeCountMax !== undefined) {
    if (context.badgeCount > condition.badgeCountMax) {
      return false;
    }
  }

  // パーティにモンスターがいるか
  if (condition.partyHas !== undefined) {
    if (!context.partySpeciesIds.includes(condition.partyHas)) {
      return false;
    }
  }

  // パーティサイズ
  if (condition.partySizeMin !== undefined) {
    if (context.partySize < condition.partySizeMin) {
      return false;
    }
  }

  return true;
}

/**
 * NPC会話を解決する
 * 条件リストを上から評価し、最初にマッチした条件のテキストを返す
 * どの条件もマッチしない場合はdefaultテキストを返す
 */
export function resolveDialogue(dialogueSet: NpcDialogueSet, context: DialogueContext): string[] {
  for (const entry of dialogueSet.conditions) {
    if (checkDialogueCondition(entry.condition, context)) {
      return entry.text;
    }
  }
  return dialogueSet.default;
}

/**
 * 指定NPC IDの会話を解決する
 */
export function resolveNpcDialogueById(
  npcId: string,
  mapId: string,
  dialogueSets: NpcDialogueSet[],
  context: DialogueContext,
): string[] | null {
  const set = dialogueSets.find((d) => d.npcId === npcId && d.mapId === mapId);
  if (!set) return null;
  return resolveDialogue(set, context);
}

// ═══════════════════════════════════════════════════════
// 全町NPC条件分岐会話データ（50パターン以上）
// ═══════════════════════════════════════════════════════

export const NPC_DIALOGUE_SETS: NpcDialogueSet[] = [
  // ── ワスレ町 ──
  {
    npcId: "npc-professor",
    mapId: "wasuremachi",
    default: [
      "わしはワスレ博士じゃ。",
      "この世界には「大忘却」と呼ばれる謎の現象があったんじゃ…",
      "キミのモンスターを大切に育てるんじゃぞ！",
    ],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンを倒したと聞いたぞ！",
          "キミはこの町の誇りじゃ。大忘却の謎を解き明かす日も近いかもしれんな。",
        ],
      },
      {
        condition: { badgeCountMin: 8 },
        text: [
          "全てのバッジを集めたのか！",
          "いよいよポケモンリーグじゃな。キミの旅の集大成を見せてくるんじゃ！",
        ],
      },
      {
        condition: { badgeCountMin: 4 },
        text: [
          "もう半分のジムを制覇したのか…すごいのう。",
          "大忘却の真相に近づいているかもしれんぞ。",
        ],
      },
      {
        condition: { badgeCountMin: 1 },
        text: ["おお、ジムバッジを手に入れたんじゃな！", "その調子でどんどん先に進むんじゃぞ！"],
      },
      {
        condition: { flag: "starter_selected" },
        text: [
          "モンスターを選んだんじゃな！",
          "まずはツチグモ村のジムに挑戦してみるといい。南のルート1を通るんじゃぞ。",
        ],
      },
    ],
  },
  {
    npcId: "npc-townsperson",
    mapId: "wasuremachi",
    default: [
      "ワスレ町へようこそ！",
      "南に行くとルート1だよ。野生のモンスターがいるから気をつけてね！",
    ],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンがこの町の出身だなんて、誇らしいよ！",
          "君のおかげで町も活気づいてきたね。",
        ],
      },
      {
        condition: { badgeCountMin: 8 },
        text: [
          "全バッジ制覇！？ポケモンリーグに挑む気かい！",
          "この町から旅立った子がそこまで行くなんて…感動だよ。",
        ],
      },
      {
        condition: { badgeCountMin: 4 },
        text: [
          "もう半分のジムを制覇したのか。すごいな…",
          "大忘却の謎を解ける日も近いかもしれないね。",
        ],
      },
      {
        condition: { badgeCountMin: 1 },
        text: [
          "最初のジムに勝ったんだって？やるじゃないか！",
          "次はモリノハの町のジムだよ。がんばれ！",
        ],
      },
    ],
  },
  {
    npcId: "npc-healer",
    mapId: "wasuremachi",
    default: ["ここはモンスター回復センターです。", "お預かりしたモンスターを回復しますね！"],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンの凱旋ですね！おめでとうございます！",
          "いつでもモンスターを回復しますよ！",
        ],
      },
      {
        condition: { partySizeMin: 6 },
        text: [
          "パーティがいっぱいですね！頼もしいメンバーが揃ってますよ。",
          "しっかり回復しますね！",
        ],
      },
    ],
  },

  // ── ツチグモ村（ジム1:ノーマル）──
  {
    npcId: "npc-gym1-healer",
    mapId: "tsuchigumo-village",
    default: ["モンスターを回復しますね！"],
    conditions: [
      {
        condition: { flag: "gym1_cleared" },
        text: [
          "ジムリーダーに勝ったんですね！すごい！",
          "次の町に向けて、モンスターを万全にしましょう！",
        ],
      },
    ],
  },
  {
    npcId: "npc-gym1-leader",
    mapId: "tsuchigumo-village",
    default: [
      "やあ、新しい挑戦者だね。",
      "僕はマサキ。この島で一番最初の試練を担当している。",
      "それを見せてくれ！",
    ],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンになったんだって？すごいな！",
          "僕との初戦を覚えてるかい？あの頃のキミはまだ未熟だったけど…今は立派なトレーナーだ。",
        ],
      },
      {
        condition: { flag: "gym1_cleared" },
        text: [
          "おめでとう！ノーマルバッジは君のものだ。",
          "次はモリノハの町のジムリーダーに挑んでみるといい。虫タイプの使い手だよ。",
        ],
      },
    ],
  },

  // ── モリノハの町（ジム2:虫）──
  {
    npcId: "npc-morinoha-elder",
    mapId: "morinoha-town",
    default: ["この町は森に囲まれた静かな場所じゃ。", "虫モンスターが多く住んでおるぞ。"],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンがこんな田舎に来てくれるとは…光栄じゃ。",
          "この森にはまだ見ぬモンスターが隠れておるかもしれんぞ。",
        ],
      },
      {
        condition: { badgeCountMin: 4 },
        text: [
          "ここまで来るとは大したものじゃ。",
          "キミの旅は、大忘却の真実に繋がっているのかもしれんな。",
        ],
      },
      {
        condition: { partyHas: "hanamushi" },
        text: [
          "おお、ハナムシを連れておるのか！",
          "この森で生まれた子じゃな。大切に育ててやってくれ。",
        ],
      },
    ],
  },

  // ── カワセミシティ（ジム3:水）──
  {
    npcId: "npc-kawasemi-fisherman",
    mapId: "kawasemi-city",
    default: [
      "ここはカワセミシティ。水辺の美しい町さ。",
      "水モンスターが好きなら、この町は天国だぜ。",
    ],
    conditions: [
      {
        condition: { partyHas: "taikaiou" },
        text: ["おいおい、タイカイオウを連れてるのか！？", "海の王者だぞ…すげえトレーナーだな！"],
      },
      {
        condition: { badgeCountMin: 3 },
        text: [
          "バッジ3個か。順調だな！",
          "次のジムは雷鳴峠にあるぞ。電気タイプだから水モンスターは気をつけろよ。",
        ],
      },
    ],
  },
  {
    npcId: "npc-kawasemi-girl",
    mapId: "kawasemi-city",
    default: [
      "カワセミシティは水と共に生きる町よ。",
      "大忘却で失われた水路の記憶が、この町の川に流れているの。",
    ],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンさんですよね？サインください！",
          "…なんてね。でも本当にすごいことだと思うの。",
        ],
      },
    ],
  },

  // ── ライメイ峠（ジム4:電気）──
  {
    npcId: "npc-raimei-hiker",
    mapId: "raimei-pass",
    default: ["この峠は雷が多いから気をつけろよ。", "電気モンスターが活発になるんだ。"],
    conditions: [
      {
        condition: { badgeCountMin: 6 },
        text: ["お前、もうバッジ6個も持ってるのか！", "ここを通り過ぎた頃が懐かしいだろう。"],
      },
      {
        condition: { partyHas: "raijindou" },
        text: [
          "おお！ライジンドウを連れてるのか！",
          "この峠の主とも言える存在だぞ。大切にしろよ。",
        ],
      },
    ],
  },

  // ── ツキヨミの里（ジム5:フェアリー）──
  {
    npcId: "npc-tsukiyomi-priestess",
    mapId: "tsukiyomi-village",
    default: [
      "この里は月の記憶を守る場所…",
      "フェアリーモンスターたちが、忘れられた祈りを歌っているの。",
    ],
    conditions: [
      {
        condition: { partyHas: "tsukiusagi" },
        text: [
          "ツキウサギを連れているのね…",
          "この子は月の記憶の守り手。きっとあなたの旅を照らしてくれるわ。",
        ],
      },
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンになったのね…おめでとう。",
          "月の記憶が、あなたの旅路を祝福しているわ。",
        ],
      },
    ],
  },

  // ── クロガネの街（ジム6:鋼）──
  {
    npcId: "npc-kurogane-smith",
    mapId: "kurogane-city",
    default: ["ここはクロガネの街。鉄と鋼の町さ。", "鋼モンスターが鍛冶を手伝ってくれるんだ。"],
    conditions: [
      {
        condition: { partyHas: "haganedake" },
        text: [
          "ハガネダケを連れてるのか！こいつは珍しい。",
          "その体には世界の歴史が刻まれてるって話だぜ。",
        ],
      },
      {
        condition: { badgeCountMin: 6 },
        text: ["バッジ6個…大したもんだ。", "残りのジムは手強いぞ。気を抜くなよ。"],
      },
    ],
  },

  // ── ヤミノモリ村（ジム7:悪）──
  {
    npcId: "npc-yaminomori-child",
    mapId: "yaminomori-village",
    default: [
      "この村は暗くて怖いけど…悪いところじゃないよ。",
      "闇のモンスターたちは、忘れられた者の味方なんだ。",
    ],
    conditions: [
      {
        condition: { badgeCountMin: 7 },
        text: [
          "すごい！もうすぐ全部のバッジが揃うんだね！",
          "最後のジムは霊山にあるよ。ゴーストタイプだって…怖い。",
        ],
      },
      {
        condition: { partyHas: "kurooni" },
        text: [
          "クロオニと一緒なんだ！",
          "この村で生まれた子だよ。忘却の闇から力を得るけど、優しい心を持ってるんだ。",
        ],
      },
    ],
  },

  // ── セイレイ山（ジム8:ゴースト）──
  {
    npcId: "npc-seirei-monk",
    mapId: "seirei-mountain",
    default: ["この山には忘れられた魂が集まる…", "ゴーストモンスターたちは、記憶の番人じゃ。"],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンがこの霊山に…何を求めに来た？",
          "大忘却の真相は、この山の奥深くに眠っておるかもしれんぞ。",
        ],
      },
      {
        condition: { badgeCountMin: 8 },
        text: [
          "全バッジを集めたか…見事じゃ。",
          "ポケモンリーグへの道が開かれた。だが油断するでないぞ。",
        ],
      },
      {
        condition: { partyHas: "yomikagura" },
        text: [
          "ヨミカグラか…失われた神楽の記憶を舞い続ける者。",
          "お前はこの子に何を見た？大忘却以前の祭りの風景か？",
        ],
      },
    ],
  },

  // ── ポケモンリーグ ──
  {
    npcId: "npc-league-guard",
    mapId: "pokemon-league",
    default: ["ここはポケモンリーグ。", "8つのバッジを持つ者だけが挑戦できる。"],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: ["チャンピオン！お帰りなさい。", "再挑戦はいつでも歓迎ですよ。"],
      },
      {
        condition: { badgeCountMin: 8 },
        text: ["8つのバッジを確認した！", "ようこそ、ポケモンリーグへ。挑戦者よ、栄光を掴め！"],
      },
    ],
  },

  // ── ルート各所のNPC ──
  {
    npcId: "npc-route1-boy",
    mapId: "route-1",
    default: ["草むらに入るとモンスターが出てくるよ！", "モンスターボールで捕まえてみなよ！"],
    conditions: [
      {
        condition: { badgeCountMin: 4 },
        text: ["すごい！もうバッジ4個も持ってるの？", "僕も早くトレーナーになりたいなあ。"],
      },
      {
        condition: { partySizeMin: 4 },
        text: [
          "わあ、たくさんモンスター連れてるね！",
          "僕のお気に入りはコネズミだよ。かわいいでしょ？",
        ],
      },
    ],
  },
  {
    npcId: "npc-forest-girl",
    mapId: "hajimari-forest",
    default: [
      "この森には色々なモンスターがいるの。",
      "草むらを歩いて、新しいモンスターを見つけてね！",
    ],
    conditions: [
      {
        condition: { badgeCountMin: 2 },
        text: [
          "あ、あのときの人！もうバッジ2個も持ってるの？",
          "この森で最初に会ったときはドキドキだったなあ。",
        ],
      },
      {
        condition: { partyHas: "mayumushi" },
        text: [
          "あ、マユムシを連れてるんだ！",
          "この森で見つけたの？繭の中で大忘却以前の夢を見てるんだって…不思議ね。",
        ],
      },
    ],
  },
  {
    npcId: "npc-forest-hiker",
    mapId: "hajimari-forest",
    default: ["南に抜けると次の町があるらしいが…", "まだ道が整備されていないらしい。"],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: ["チャンピオンがこんな森を歩いてるのか！", "初心を忘れないのはいいことだな。"],
      },
      {
        condition: { flag: "gym1_cleared" },
        text: ["南の道が開通したぞ！", "次の町に向かうといい！"],
      },
    ],
  },

  // ── パーティ特殊条件会話 ──
  {
    npcId: "npc-legend-scholar",
    mapId: "wasuremachi",
    default: [
      "大忘却の研究をしているんだ。",
      "オモイデとワスレヌという伝説のモンスターの話を知っているかい？",
    ],
    conditions: [
      {
        condition: { partyHas: "omoide" },
        text: [
          "な…なんと！オモイデを連れているのか！？",
          "記憶を司る伝説のモンスター…まさか実在したとは！",
          "その力で大忘却の謎が解けるかもしれない…！",
        ],
      },
      {
        condition: { partyHas: "wasurenu" },
        text: [
          "ワスレヌを連れている…だと？",
          "忘却を司る伝説のモンスター…これは歴史的発見だ！",
          "オモイデとワスレヌ、両方が揃えば記憶と忘却のバランスが保たれるという…",
        ],
      },
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンの君に頼みたいことがある。",
          "伝説のモンスター、オモイデとワスレヌの手がかりを探してくれないか？",
        ],
      },
    ],
  },

  // ── 進化ヒントNPC ──
  {
    npcId: "npc-evolution-expert",
    mapId: "morinoha-town",
    default: [
      "モンスターの進化について研究しているんだ。",
      "レベルが上がると進化するモンスターが多いが、中には特殊な条件で進化する子もいるぞ。",
    ],
    conditions: [
      {
        condition: { badgeCountMin: 6 },
        text: [
          "キミはもうベテランだな。知ってるかもしれないが…",
          "特定の場所や技を覚えた状態でレベルアップすると進化するモンスターもいるんだ。",
          "パーティの仲間にも影響するらしいぞ。面白いだろう？",
        ],
      },
      {
        condition: { badgeCountMin: 3 },
        text: [
          "だんだん強いモンスターに出会うようになってきただろう？",
          "進化の石を使うと進化するモンスターもいるぞ。アイテムをチェックしてみるといい。",
        ],
      },
    ],
  },

  // ── 各ルートの追加NPC ──
  {
    npcId: "npc-route3-researcher",
    mapId: "route-3",
    default: [
      "この辺りの地質を調べているんだ。",
      "大忘却で失われた古代の遺跡が地下に眠っているかもしれない。",
    ],
    conditions: [
      {
        condition: { partyHas: "mogurakko" },
        text: [
          "おっ、モグラッコを連れてるのか！",
          "地下の遺物を掘り当てる名人だ。調査を手伝ってくれないか？",
        ],
      },
    ],
  },
  {
    npcId: "npc-route5-birdwatcher",
    mapId: "route-5",
    default: ["鳥モンスターの観察が趣味でね。", "ハヤテドリはこの辺りでよく見かけるよ。"],
    conditions: [
      {
        condition: { partyHas: "hayatedori" },
        text: [
          "おお！ハヤテドリを連れているのか！",
          "風の記憶を翼に宿すという…美しいモンスターだ。",
        ],
      },
      {
        condition: { partyHas: "ryuubi" },
        text: [
          "な…竜が空を飛んでいる！？",
          "リュウビを連れているのか！雲に記憶の痕跡を残すという伝説の竜だぞ！",
        ],
      },
    ],
  },

  // ── 追加NPC会話 ──
  {
    npcId: "npc-route4-trainer",
    mapId: "route-4",
    default: ["トレーナー同士がすれ違ったら目が合ったら勝負だ！", "それがトレーナーのルールさ。"],
    conditions: [
      {
        condition: { badgeCountMin: 5 },
        text: ["もうバッジ5個以上か…お前には敵わなそうだな。", "でもいつか再戦しようぜ！"],
      },
      {
        condition: { partySizeMin: 5 },
        text: [
          "5体以上連れてるのか！戦略の幅が広がるな。",
          "どのモンスターを先頭にするか、よく考えるんだぞ。",
        ],
      },
    ],
  },
  {
    npcId: "npc-kawasemi-oldman",
    mapId: "kawasemi-city",
    default: ["わしは毎日この川を眺めておる。", "水の流れには記憶が溶けているらしいからのう。"],
    conditions: [
      {
        condition: { flag: "champion_cleared" },
        text: [
          "チャンピオンか…わしも若い頃はトレーナーを目指したんじゃが。",
          "大忘却で夢も忘れてしもうた…いや、キミのおかげで思い出せそうじゃ。",
        ],
      },
      {
        condition: { partyHas: "kawadojou" },
        text: [
          "おお、カワドジョウを連れておるのか！",
          "川底の泥の記憶を知っとる子じゃ。大事にしてやれよ。",
        ],
      },
    ],
  },
  {
    npcId: "npc-raimei-scientist",
    mapId: "raimei-pass",
    default: [
      "雷のエネルギーを研究しているんだ。",
      "電気モンスターの力を借りれば、失われた技術を復元できるかもしれない。",
    ],
    conditions: [
      {
        condition: { partyHas: "denjimushi" },
        text: [
          "デンジムシを連れてるのか！ちょうどいい。",
          "この子の電気信号で、大忘却以前の通信を再現する実験をしたいんだ。少し協力してくれないか？",
        ],
      },
      {
        condition: { badgeCountMin: 4 },
        text: [
          "バッジ4個のトレーナーか。なかなかの腕前だな。",
          "雷の記憶について、興味深い仮説があるんだが…聞いてくれるか？",
        ],
      },
    ],
  },
];

/**
 * NPC会話セットの総数を取得
 */
export function getDialogueSetCount(): number {
  return NPC_DIALOGUE_SETS.length;
}

/**
 * 全条件分岐パターンの総数を取得
 */
export function getTotalConditionCount(): number {
  return NPC_DIALOGUE_SETS.reduce((sum, set) => sum + set.conditions.length, 0);
}
