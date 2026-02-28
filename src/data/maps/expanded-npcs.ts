/**
 * 街の追加NPC定義
 *
 * 各街のNPCを5-10体に増やし、生活感と賑わいを持たせる。
 * 世界観（忘却と記憶テーマ）を伝えるNPC、ヒントNPC、コミカルNPCなど多様に配置。
 */
import type { NpcDefinition } from "@/engine/map/map-data";

/** 街ごとの追加NPC定義 */
export interface TownNpcSet {
  /** 対象マップID */
  mapId: string;
  /** 街名 */
  townName: string;
  /** 既存NPC数 */
  existingCount: number;
  /** 追加NPC一覧 */
  additionalNpcs: NpcDefinition[];
  /** 追加後の合計NPC数 */
  totalCount: number;
}

// ===== ワスレ町（既存3 → 7体）=====
const WASUREMACHI_NPCS: TownNpcSet = {
  mapId: "wasuremachi",
  townName: "ワスレ町",
  existingCount: 3,
  additionalNpcs: [
    {
      id: "npc-wasuremachi-childhood",
      name: "幼なじみ",
      x: 9,
      y: 3,
      dialogue: [
        "おっ、冒険に出るのか？",
        "オレも早くモンスターが欲しいなあ。",
        "帰ってきたら冒険の話を聞かせてくれよ！",
      ],
      isTrainer: false,
    },
    {
      id: "npc-wasuremachi-grandma",
      name: "おばあさん",
      x: 3,
      y: 8,
      dialogue: [
        "この町はね、大忘却の前からあるんだよ。",
        "昔はもっとたくさんの人が住んでいてねえ…",
        "みんな何かを忘れてしまったけど、この町の温かさだけは覚えていたの。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-wasuremachi-fisher",
      name: "釣り人",
      x: 6,
      y: 9,
      dialogue: [
        "池で釣りをしてたんだが、最近は魚が減ってなあ。",
        "南のルート1には水辺のモンスターがいるらしいぞ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-wasuremachi-traveler",
      name: "旅人",
      x: 8,
      y: 6,
      dialogue: [
        "遠い街から来たんだ。この島にはたくさんの不思議があるね。",
        "南に進むとツチグモ村がある。最初のジムがあるよ。",
        "準備はしっかりしていった方がいい。草むらにはモンスターがいるからね。",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 7,
};

// ===== ツチグモ村（既存2 → 5体）=====
const TSUCHIGUMO_NPCS: TownNpcSet = {
  mapId: "tsuchigumo-village",
  townName: "ツチグモ村",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-tsuchigumo-bugboy",
      name: "虫取り少年",
      x: 5,
      y: 6,
      dialogue: [
        "この森にはいろんな虫モンスターがいるんだ！",
        "マユムシを見つけたら大事に育ててみて。きっと強くなるよ！",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tsuchigumo-elder",
      name: "村長",
      x: 3,
      y: 3,
      dialogue: [
        "ようこそツチグモ村へ。ここは森と共に生きる村じゃ。",
        "マサキは若いが腕は確かじゃ。挑戦してみるとよい。",
        "大忘却の後、この森だけは変わらなかったんじゃよ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tsuchigumo-woodcutter",
      name: "木こり",
      x: 7,
      y: 9,
      dialogue: [
        "森の恵みをいただいて暮らしとる。",
        "最近、奥の方で見慣れないモンスターを見たんじゃが…気のせいかの。",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 5,
};

// ===== モリノハの町（既存2 → 6体）=====
const MORINOHA_NPCS: TownNpcSet = {
  mapId: "morinoha-town",
  townName: "モリノハの町",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-morinoha-farmer",
      name: "農家のおじさん",
      x: 10,
      y: 2,
      dialogue: [
        "この畑で町の食料を作っとるんじゃ。",
        "草タイプのモンスターが畑を荒らすこともあるが、まあ仲良くやっとる。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-morinoha-flower",
      name: "花屋のお姉さん",
      x: 6,
      y: 4,
      dialogue: [
        "お花はいかが？モンスターにも好かれるわよ。",
        "ハナウサギって知ってる？花が大好きなモンスターなの。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-morinoha-oldman",
      name: "物知りじいさん",
      x: 4,
      y: 8,
      dialogue: [
        "大忘却の前、この町はもっと大きかったそうじゃ。",
        "記憶を失った人々がここに集まり、農業を始めたのがこの町の始まりじゃ。",
        "タイプ相性を覚えるんじゃぞ。水は火に強く、火は草に強い。基本じゃ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-morinoha-child",
      name: "遊んでいる子供",
      x: 7,
      y: 6,
      dialogue: [
        "あのね、カイコさんってすっごく虫に詳しいんだよ！",
        "いつか僕もモンスターを連れて冒険に出るんだ！",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 6,
};

// ===== イナヅマシティ（既存2 → 10体）=====
const INAZUMA_NPCS: TownNpcSet = {
  mapId: "inazuma-city",
  townName: "イナヅマシティ",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-inazuma-businessman",
      name: "サラリーマン",
      x: 4,
      y: 4,
      dialogue: [
        "はぁ…今日も残業か。",
        "電気タイプのモンスターを見ると元気が出るんだよね。ビリビリっとね。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-inazuma-researcher",
      name: "研究者",
      x: 9,
      y: 2,
      dialogue: [
        "大忘却の原因を研究しているんだ。",
        "記憶を操作するモンスターの存在が鍵を握っていると考えている。",
        "オモイデとワスレヌ…伝説のモンスターを知っているか？",
      ],
      isTrainer: false,
    },
    {
      id: "npc-inazuma-shopclerk",
      name: "ショップ店員",
      x: 13,
      y: 2,
      dialogue: [
        "いらっしゃいませ！冒険に必要なアイテムを取り揃えてますよ。",
        "バッジが増えるともっといい商品を仕入れますね！",
      ],
      isTrainer: false,
    },
    {
      id: "npc-inazuma-couple-a",
      name: "カップルの男性",
      x: 6,
      y: 7,
      dialogue: [
        "この噴水の前でプロポーズしたんだ。",
        "モンスターもお祝いしてくれたよ。忘れられない思い出さ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-inazuma-couple-b",
      name: "カップルの女性",
      x: 7,
      y: 7,
      dialogue: [
        "大忘却で多くを失ったけど、大切な人との記憶は残ったの。",
        "記憶の力って不思議よね。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-inazuma-guard",
      name: "警備員",
      x: 14,
      y: 5,
      dialogue: [
        "この街の治安は俺が守る！",
        "最近、怪しいやつらが南の方でうろついてるって話だ。気をつけろよ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-inazuma-kid",
      name: "元気な子供",
      x: 11,
      y: 8,
      dialogue: [
        "ライゾウさんってさ、電気タイプの達人なんだって！",
        "水タイプで挑んだら一撃でやられちゃうよ！地面タイプがいいって聞いたよ！",
      ],
      isTrainer: false,
    },
    {
      id: "npc-inazuma-storyteller",
      name: "語り部",
      x: 3,
      y: 8,
      dialogue: [
        "聞いてくれ。これは大忘却にまつわる話じゃ。",
        "かつてこの世界には2体の伝説のモンスターがいた。",
        "1体は記憶を守る者、もう1体は忘却を司る者。",
        "2体の均衡が崩れた時、大忘却が起きたと言い伝えられておる。",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 10,
};

// ===== カガリ市（既存2 → 7体）=====
const KAGARI_NPCS: TownNpcSet = {
  mapId: "kagari-city",
  townName: "カガリ市",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-kagari-tourist",
      name: "温泉客",
      x: 3,
      y: 2,
      dialogue: [
        "はぁ〜、いい湯だった！温泉最高！",
        "火山の近くだからこそ、こんないいお湯が湧くんだよね。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-kagari-blacksmith",
      name: "鍛冶屋",
      x: 10,
      y: 7,
      dialogue: [
        "火山の炎で鍛えた道具は一級品じゃ。",
        "炎タイプのモンスターと共に仕事をしておる。最高の相棒じゃ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-kagari-firefighter",
      name: "消防士",
      x: 7,
      y: 10,
      dialogue: [
        "火山の近くだから火事には注意だ！",
        "水タイプのモンスターはここでは重宝されるんだぜ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-kagari-guide",
      name: "観光ガイド",
      x: 6,
      y: 4,
      dialogue: [
        "ようこそカガリ市へ！火山と温泉の街です。",
        "カガリジムリーダーは炎タイプの使い手。水か地面タイプで挑むといいですよ。",
        "温泉に浸かるとモンスターも元気になるって噂もあります。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-kagari-oldcouple",
      name: "温泉好きのおじいさん",
      x: 9,
      y: 5,
      dialogue: [
        "大忘却で記憶を失ったが、この温泉の心地よさだけは体が覚えておった。",
        "体が覚えている記憶というものもあるんじゃな。",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 7,
};

// ===== ゴウキの町（既存2 → 6体）=====
const GOUKI_NPCS: TownNpcSet = {
  mapId: "gouki-town",
  townName: "ゴウキの町",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-gouki-monk",
      name: "修行僧",
      x: 6,
      y: 6,
      dialogue: [
        "精神を研ぎ澄ませ。心が乱れると技も乱れる。",
        "格闘タイプのモンスターは鍛錬を怠らない。見習うべきじゃ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-gouki-karate",
      name: "空手家",
      x: 9,
      y: 4,
      dialogue: [
        "はっ！やっ！とうっ！",
        "…すまん、修行中だった。ゴウキ師範のジムに挑むなら飛行タイプがいいぞ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-gouki-master",
      name: "老師範",
      x: 3,
      y: 10,
      dialogue: [
        "ゴウキはワシの一番弟子じゃ。",
        "あやつは言葉少なじゃが、拳に想いを込めて戦う男じゃ。",
        "大忘却で記憶を失った人々を、その拳で守ってきたんじゃよ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-gouki-disciple",
      name: "弟子",
      x: 5,
      y: 6,
      dialogue: ["ゴウキ師範みたいに強くなりたい！", "毎日100回突きの練習をしてるんだ！"],
      isTrainer: false,
    },
  ],
  totalCount: 6,
};

// ===== キリフリ村（既存2 → 5体）=====
const KIRIFURI_NPCS: TownNpcSet = {
  mapId: "kirifuri-village",
  townName: "キリフリ村",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-kirifuri-miko",
      name: "巫女",
      x: 3,
      y: 2,
      dialogue: [
        "この村には古い霊が住み着いておるのです。",
        "ゴーストタイプのモンスターは怖くありません。彼らも想いを持つ存在です。",
        "大忘却で失われた記憶…それが霊となって彷徨っているのかもしれませんね。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-kirifuri-fortune",
      name: "占い師",
      x: 3,
      y: 3,
      dialogue: [
        "ふむ…あなたの運命を見てあげましょう。",
        "…この先に大きな試練が待っている。だが恐れるな。",
        "ゴーストタイプにはあくタイプが有効じゃよ。覚えておきなさい。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-kirifuri-gravekeeper",
      name: "墓守",
      x: 9,
      y: 4,
      dialogue: [
        "ここは大忘却で亡くなった者たちの墓地じゃ。",
        "毎日花を供えておる。忘れられた者たちを、せめてワシは忘れないでおこうと思うてな。",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 5,
};

// ===== フユハの町（既存2 → 6体）=====
const FUYUHA_NPCS: TownNpcSet = {
  mapId: "fuyuha-town",
  townName: "フユハの町",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-fuyuha-skier",
      name: "スキーヤー",
      x: 10,
      y: 4,
      dialogue: ["この辺りの雪質は最高だぜ！", "氷タイプのモンスターと一緒に滑ると楽しいぞ！"],
      isTrainer: false,
    },
    {
      id: "npc-fuyuha-shovel",
      name: "雪かきおじさん",
      x: 4,
      y: 6,
      dialogue: [
        "毎日毎日雪かきじゃ…だが大事な仕事じゃよ。",
        "氷タイプのモンスターが手伝ってくれるとありがたいんじゃが、余計に凍らせるんじゃ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-fuyuha-knitter",
      name: "毛糸屋のおばさん",
      x: 12,
      y: 3,
      dialogue: [
        "あら、寒そうね。マフラーを編んであげましょうか？",
        "氷タイプのモンスターはね、寒さを恐れないの。尊敬するわ。",
        "フユハさんの技は美しいわよ。氷の芸術って感じ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-fuyuha-dogwalker",
      name: "犬の散歩をしている人",
      x: 8,
      y: 9,
      dialogue: [
        "うちのモンスターは雪が大好きでねえ。",
        "この池は冬になると完全に凍るんだ。子供たちがスケートして遊ぶんだよ。",
        "大忘却の日も、こうして雪は降っていたそうだ。変わらないものもあるんだな。",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 6,
};

// ===== タツミシティ（既存2 → 10体）=====
const TATSUMI_NPCS: TownNpcSet = {
  mapId: "tatsumi-city",
  townName: "タツミシティ",
  existingCount: 2,
  additionalNpcs: [
    {
      id: "npc-tatsumi-sailor",
      name: "船乗り",
      x: 5,
      y: 12,
      dialogue: [
        "海の向こうにはまだ見ぬ大陸があるという。",
        "いつか水タイプのモンスターと共に大海原を渡ってみたいもんだ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tatsumi-merchant",
      name: "商人",
      x: 14,
      y: 2,
      dialogue: [
        "各地の珍しいアイテムを取り揃えておるよ。",
        "バッジをたくさん持っているなら、特別な商品もあるぞ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tatsumi-fisherman",
      name: "漁師",
      x: 12,
      y: 12,
      dialogue: [
        "今日の漁は大漁だ！水タイプのモンスターのおかげだな。",
        "港の近くでは珍しいモンスターが見つかることもあるぜ。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tatsumi-scholar",
      name: "歴史学者",
      x: 9,
      y: 2,
      dialogue: [
        "この港町は大忘却以前から交易の要衝だったのだ。",
        "記録によれば、オモイデという伝説のモンスターが記憶の守護者として崇められていた。",
        "ワスレヌは忘却を司る者。2体は表裏一体の存在なのだ。",
        "この島のどこかに、2体が眠る場所があるはずだ…",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tatsumi-breeder",
      name: "モンスターブリーダー",
      x: 4,
      y: 8,
      dialogue: [
        "モンスターの育成は愛情が大切よ。",
        "レベルを上げるだけじゃなく、タイプ相性を考えたパーティ構成も重要ね。",
        "ドラゴンタイプはフェアリーに弱い。タツミさんに挑むなら覚えておいて。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tatsumi-captain",
      name: "船長",
      x: 8,
      y: 4,
      dialogue: [
        "この港から出航する船は世界中を巡っておる。",
        "8つのバッジを集めたなら、ポケモンリーグへの道が開かれるぞ。",
        "覚悟はいいか？四天王とチャンピオンが待っている。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tatsumi-girl",
      name: "港を眺める少女",
      x: 3,
      y: 11,
      dialogue: [
        "海を見ていると、忘れた何かを思い出せそうな気がするの。",
        "大忘却で何を失ったのか…それすら覚えていないの。",
        "でも、新しい思い出を作ればいいんだよね。モンスターが教えてくれたの。",
      ],
      isTrainer: false,
    },
    {
      id: "npc-tatsumi-reporter",
      name: "記者",
      x: 15,
      y: 6,
      dialogue: [
        "新聞記者です！バッジコレクターの冒険者さんですね！",
        "ポケモンリーグに挑戦する冒険者は珍しいんです。取材させてください！",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 10,
};

// ===== ポケモンリーグ（既存7 → 9体）=====
const LEAGUE_NPCS: TownNpcSet = {
  mapId: "pokemon-league",
  townName: "ポケモンリーグ",
  existingCount: 7,
  additionalNpcs: [
    {
      id: "npc-league-fan",
      name: "熱狂的なファン",
      x: 8,
      y: 7,
      dialogue: [
        "すごい！ここまで来たんだね！",
        "四天王を倒してチャンピオンになるところを見届けたいよ！",
        "がんばれー！！",
      ],
      isTrainer: false,
    },
    {
      id: "npc-league-reporter",
      name: "リーグ記者",
      x: 3,
      y: 7,
      dialogue: [
        "ポケモンリーグ公式記者です。",
        "挑戦者が現れたのは久しぶりです。これは大ニュースですね！",
        "勝っても負けても、あなたの挑戦を記事にしますよ。",
      ],
      isTrainer: false,
    },
  ],
  totalCount: 9,
};

/** 全街の追加NPC定義 */
export const TOWN_NPC_SETS: Record<string, TownNpcSet> = {
  wasuremachi: WASUREMACHI_NPCS,
  "tsuchigumo-village": TSUCHIGUMO_NPCS,
  "morinoha-town": MORINOHA_NPCS,
  "inazuma-city": INAZUMA_NPCS,
  "kagari-city": KAGARI_NPCS,
  "gouki-town": GOUKI_NPCS,
  "kirifuri-village": KIRIFURI_NPCS,
  "fuyuha-town": FUYUHA_NPCS,
  "tatsumi-city": TATSUMI_NPCS,
  "pokemon-league": LEAGUE_NPCS,
};

/** 街の追加NPCセットを取得 */
export function getTownNpcSet(mapId: string): TownNpcSet | undefined {
  return TOWN_NPC_SETS[mapId];
}

/** 追加NPC一覧を取得 */
export function getAdditionalNpcs(mapId: string): NpcDefinition[] {
  return TOWN_NPC_SETS[mapId]?.additionalNpcs ?? [];
}

/** 全追加NPC数を取得 */
export function getTotalAdditionalNpcCount(): number {
  return Object.values(TOWN_NPC_SETS).reduce((sum, set) => sum + set.additionalNpcs.length, 0);
}

/** 全NPC合計数を取得（既存+追加） */
export function getTotalNpcCount(): number {
  return Object.values(TOWN_NPC_SETS).reduce((sum, set) => sum + set.totalCount, 0);
}

/** 全街のNPCが5体以上かチェック */
export function allTownsHaveMinNpcs(minCount: number): boolean {
  return Object.values(TOWN_NPC_SETS).every((set) => set.totalCount >= minCount);
}

/** 大都市（イナヅマ、タツミ）のNPC数が十分かチェック */
export function bigCitiesHaveEnoughNpcs(minCount: number): boolean {
  const bigCities = ["inazuma-city", "tatsumi-city"];
  return bigCities.every((id) => {
    const set = TOWN_NPC_SETS[id];
    return set !== undefined && set.totalCount >= minCount;
  });
}

/** NPCの会話にストーリーヒントが含まれているか */
export function hasStoryHints(): boolean {
  const storyKeywords = ["大忘却", "オモイデ", "ワスレヌ", "伝説", "記憶"];
  for (const set of Object.values(TOWN_NPC_SETS)) {
    for (const npc of set.additionalNpcs) {
      for (const line of npc.dialogue) {
        if (storyKeywords.some((kw) => line.includes(kw))) {
          return true;
        }
      }
    }
  }
  return false;
}

/** ストーリー関連の会話を持つNPC数 */
export function countStoryNpcs(): number {
  const storyKeywords = ["大忘却", "オモイデ", "ワスレヌ", "伝説", "記憶"];
  let count = 0;
  for (const set of Object.values(TOWN_NPC_SETS)) {
    for (const npc of set.additionalNpcs) {
      const hasStoryDialogue = npc.dialogue.some((line) =>
        storyKeywords.some((kw) => line.includes(kw)),
      );
      if (hasStoryDialogue) count++;
    }
  }
  return count;
}

/** 全NPCのIDが一意であることを検証 */
export function validateUniqueNpcIds(): { valid: boolean; duplicates: string[] } {
  const ids = new Set<string>();
  const duplicates: string[] = [];
  for (const set of Object.values(TOWN_NPC_SETS)) {
    for (const npc of set.additionalNpcs) {
      if (ids.has(npc.id)) {
        duplicates.push(npc.id);
      }
      ids.add(npc.id);
    }
  }
  return { valid: duplicates.length === 0, duplicates };
}
