/**
 * ジムリーダー個別サイドストーリー (#182)
 * 殿堂入り後に各ジムを再訪すると発生するイベント
 */

import type { EventScript } from "./event-script";

/** ジムリーダーサイドストーリー: マサキ（ノーマル） */
const MASAKI_STORY: EventScript = {
  id: "gym1_side_story",
  trigger: ["champion_cleared", "badge_1"],
  commands: [
    {
      type: "branch",
      condition: "gym1_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "マサキ",
          lines: [
            "おっ、チャンピオンじゃないか！よく来てくれたね。",
            "実は…僕にも話しておきたいことがあるんだ。",
          ],
        },
        {
          type: "dialogue",
          speaker: "マサキ",
          lines: [
            "大忘却の前、僕はただの少年だった。",
            "記憶を失って、最初に出会ったのがモンスターだった。",
            "名前も、故郷も分からない僕に、モンスターたちは寄り添ってくれた。",
          ],
        },
        {
          type: "dialogue",
          speaker: "マサキ",
          lines: [
            "だから僕はジムリーダーになったんだ。",
            "記憶がなくても、新しい絆を作れることを証明するために。",
            "…君がここまで来たのが、その証拠だよ。",
          ],
        },
        {
          type: "dialogue",
          speaker: "マサキ",
          lines: ["これは僕からのお礼。最初の試練を超えた君に相応しい技だ。"],
        },
        {
          type: "give_item",
          itemId: "tm_return",
          quantity: 1,
        },
        { type: "set_flag", flag: "gym1_story_cleared", value: true },
      ],
    },
  ],
};

/** ジムリーダーサイドストーリー: カイコ（虫） */
const KAIKO_STORY: EventScript = {
  id: "gym2_side_story",
  trigger: ["champion_cleared", "badge_2"],
  commands: [
    {
      type: "branch",
      condition: "gym2_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "カイコ",
          lines: ["あら、チャンピオンさん！会えて嬉しいわ。", "ちょっと聞いてほしい話があるの。"],
        },
        {
          type: "dialogue",
          speaker: "カイコ",
          lines: [
            "大忘却の前、この森にはもっと多くの虫たちがいたの。",
            "虫たちは美しい歌を歌っていた…でも今は、その歌を覚えている虫はいない。",
            "私は研究を通じて、その失われた歌を再現しようとしているの。",
          ],
        },
        {
          type: "dialogue",
          speaker: "カイコ",
          lines: [
            "最近、一匹の虫が古い旋律を口ずさんでいるのを聞いたわ。",
            "記憶は消えても、本能に刻まれた歌は消えないのね。",
            "これ、私の研究成果から作った特別なきのみよ。",
          ],
        },
        {
          type: "give_item",
          itemId: "lum_berry",
          quantity: 3,
        },
        { type: "set_flag", flag: "gym2_story_cleared", value: true },
      ],
    },
  ],
};

/** ジムリーダーサイドストーリー: ライゾウ（電気） */
const RAIZOU_STORY: EventScript = {
  id: "gym3_side_story",
  trigger: ["champion_cleared", "badge_3"],
  commands: [
    {
      type: "branch",
      condition: "gym3_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "ライゾウ",
          lines: ["おお！チャンピオン！よく来たぜ！", "実はな、お前に教えたいことがあるんだ。"],
        },
        {
          type: "dialogue",
          speaker: "ライゾウ",
          lines: [
            "大忘却が起きた時、イナヅマシティは大停電になった。",
            "でもな、俺のモンスターたちが発電して街を守ったんだ。",
            "記憶は失っても、この街を守りたいって気持ちは残ってた。",
          ],
        },
        {
          type: "dialogue",
          speaker: "ライゾウ",
          lines: [
            "それが俺の誇りだ。",
            "お前にも分かるだろ？大切なものは記憶じゃない。今ここにある想いだ。",
            "これを持ってけ！俺の一番の技マシンだ！",
          ],
        },
        {
          type: "give_item",
          itemId: "tm_thunderbolt",
          quantity: 1,
        },
        { type: "set_flag", flag: "gym3_story_cleared", value: true },
      ],
    },
  ],
};

/** ジムリーダーサイドストーリー: カガリ（炎） */
const KAGARI_STORY: EventScript = {
  id: "gym4_side_story",
  trigger: ["champion_cleared", "badge_4"],
  commands: [
    {
      type: "branch",
      condition: "gym4_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "カガリ",
          lines: ["…チャンピオンか。鍛冶場に来い。話がある。"],
        },
        {
          type: "dialogue",
          speaker: "カガリ",
          lines: [
            "この火山の下には、大忘却以前の鍛冶場があった。",
            "俺は偶然その遺跡を見つけ、失われた鍛造術を知った。",
            "記憶はなくとも、先人の技術は炎の中に刻まれていた。",
          ],
        },
        {
          type: "dialogue",
          speaker: "カガリ",
          lines: [
            "お前のモンスターたちは強い炎を持っている。",
            "この特別な持ち物を使え。炎がさらに燃え盛るだろう。",
          ],
        },
        {
          type: "give_item",
          itemId: "charcoal",
          quantity: 1,
        },
        { type: "set_flag", flag: "gym4_story_cleared", value: true },
      ],
    },
  ],
};

/** ジムリーダーサイドストーリー: ゴウキ（格闘） */
const GOUKI_STORY: EventScript = {
  id: "gym5_side_story",
  trigger: ["champion_cleared", "badge_5"],
  commands: [
    {
      type: "branch",
      condition: "gym5_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "ゴウキ",
          lines: [
            "…チャンピオンよ。再び相まみえることを嬉しく思う。",
            "我には弟子がいた。だが…かつて確執があった。",
          ],
        },
        {
          type: "dialogue",
          speaker: "ゴウキ",
          lines: [
            "弟子は我の道を否定し、去っていった。",
            "大忘却が起きた時、弟子は記憶を失い…我のことも忘れた。",
            "だが最近、弟子は自らの意志でこの町に戻ってきたのだ。",
          ],
        },
        {
          type: "dialogue",
          speaker: "ゴウキ",
          lines: [
            "記憶がなくとも、心が導く場所は同じだった。",
            "お前のおかげだ。お前の冒険が、この島に希望を灯した。",
            "これを受け取れ。我の拳に込めた感謝だ。",
          ],
        },
        {
          type: "give_item",
          itemId: "tm_brick_break",
          quantity: 1,
        },
        { type: "set_flag", flag: "gym5_story_cleared", value: true },
      ],
    },
  ],
};

/** ジムリーダーサイドストーリー: キリフリ（ゴースト） */
const KIRIFURI_STORY: EventScript = {
  id: "gym6_side_story",
  trigger: ["champion_cleared", "badge_6"],
  commands: [
    {
      type: "branch",
      condition: "gym6_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "キリフリ",
          lines: [
            "ふふ…チャンピオンが霧の中に迷い込んできたわね。",
            "実はね、あなたに見せたいものがあるの。",
          ],
        },
        {
          type: "dialogue",
          speaker: "キリフリ",
          lines: [
            "この村には大忘却で失われた魂が集まってくる。",
            "彼らは記憶を求めてさまよっている…でも、もう取り戻せない。",
            "私の役目は、その魂を安らかに眠らせること。",
          ],
        },
        {
          type: "dialogue",
          speaker: "キリフリ",
          lines: [
            "でもね、あなたが伝説のモンスターを探しているなら…",
            "忘却の遺跡の奥に、答えがあるかもしれないわ。",
            "これは霧を晴らすお守りよ。きっと役に立つわ。",
          ],
        },
        {
          type: "give_item",
          itemId: "spell_tag",
          quantity: 1,
        },
        { type: "set_flag", flag: "gym6_story_cleared", value: true },
      ],
    },
  ],
};

/** ジムリーダーサイドストーリー: フユハ（氷） */
const FUYUHA_STORY: EventScript = {
  id: "gym7_side_story",
  trigger: ["champion_cleared", "badge_7"],
  commands: [
    {
      type: "branch",
      condition: "gym7_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "フユハ",
          lines: [
            "チャンピオンさん…寒い中、来てくれたのね。",
            "少し、私の研究の話を聞いてくれる？",
          ],
        },
        {
          type: "dialogue",
          speaker: "フユハ",
          lines: [
            "氷の結晶の中に、大忘却以前の情景が閉じ込められているの。",
            "まるで写真のように、かつての世界の姿が…",
            "チャンピオンだった人の姿も、見つけたわ。",
          ],
        },
        {
          type: "dialogue",
          speaker: "フユハ",
          lines: [
            "大忘却の前にも、チャンピオンはいた。",
            "その人もまた、記憶と忘却の間で戦っていた。",
            "あなたが今、同じ道を歩いているの。",
            "これは氷の中から見つけた技マシンよ。大切にして。",
          ],
        },
        {
          type: "give_item",
          itemId: "tm_ice_beam",
          quantity: 1,
        },
        { type: "set_flag", flag: "gym7_story_cleared", value: true },
      ],
    },
  ],
};

/** ジムリーダーサイドストーリー: タツミ（ドラゴン） */
const TATSUMI_STORY: EventScript = {
  id: "gym8_side_story",
  trigger: ["champion_cleared", "badge_8"],
  commands: [
    {
      type: "branch",
      condition: "gym8_story_cleared",
      then: [],
      else: [
        {
          type: "dialogue",
          speaker: "タツミ",
          lines: ["…チャンピオン。お前が来ることは分かっていた。", "竜が教えてくれたからな。"],
        },
        {
          type: "dialogue",
          speaker: "タツミ",
          lines: [
            "大忘却の真相…竜は知っている。",
            "かつてこの世界には、記憶と忘却を司る二体の存在がいた。",
            "オモイデとワスレヌ。彼らが引き裂かれた時、大忘却が起きた。",
          ],
        },
        {
          type: "dialogue",
          speaker: "タツミ",
          lines: [
            "お前がチャンピオンになったのは偶然ではない。",
            "記憶と忘却の両方を受け止められる者…それがお前だ。",
            "忘却の遺跡の最深部に行け。答えがある。",
          ],
        },
        {
          type: "dialogue",
          speaker: "タツミ",
          lines: ["これは…竜の古い記憶から紡いだ最高の技マシンだ。", "使いこなしてみせろ。"],
        },
        {
          type: "give_item",
          itemId: "tm_dragon_pulse",
          quantity: 1,
        },
        { type: "set_flag", flag: "gym8_story_cleared", value: true },
      ],
    },
  ],
};

/** 全ジムリーダーサイドストーリー */
export const GYM_SIDE_STORIES: EventScript[] = [
  MASAKI_STORY,
  KAIKO_STORY,
  RAIZOU_STORY,
  KAGARI_STORY,
  GOUKI_STORY,
  KIRIFURI_STORY,
  FUYUHA_STORY,
  TATSUMI_STORY,
];
