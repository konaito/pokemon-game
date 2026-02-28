/**
 * 伝説モンスター捕獲イベント (#183)
 * オモイデ（記憶の守護者）とワスレヌ（忘却の体現者）の専用イベント
 */

import type { EventScript } from "./event-script";

/**
 * オモイデ捕獲イベント
 * 場所: 忘却の遺跡 最深部
 * 条件: 殿堂入り + 全8バッジ
 */
export const OMOIDE_EVENT: EventScript = {
  id: "legendary_omoide",
  trigger: [
    "champion_cleared",
    "badge_1",
    "badge_2",
    "badge_3",
    "badge_4",
    "badge_5",
    "badge_6",
    "badge_7",
    "badge_8",
  ],
  commands: [
    {
      type: "branch",
      condition: "omoide_captured",
      then: [], // 既に捕獲済みなら何もしない
      else: [
        {
          type: "branch",
          condition: "omoide_event_started",
          then: [
            // イベント開始済みだが未捕獲 → 再戦
            {
              type: "dialogue",
              lines: ["…空気が揺れている。", "記憶の欠片が、再び形を成していく…"],
            },
            { type: "wait", ms: 1000 },
            {
              type: "dialogue",
              speaker: "オモイデ",
              lines: ["…また来たのですね。", "あなたの記憶の力…もう一度、確かめさせてください。"],
            },
            {
              type: "battle",
              trainerName: "オモイデ",
              party: [{ speciesId: "omoide", level: 70 }],
            },
            {
              type: "set_flag",
              flag: "omoide_captured",
              value: true,
            },
          ],
          else: [
            // 初回イベント
            {
              type: "dialogue",
              lines: ["遺跡の最深部に辿り着いた。", "壁に刻まれた古代文字が淡く光り始める…"],
            },
            { type: "wait", ms: 1500 },
            {
              type: "dialogue",
              lines: [
                "光が集まり、一つの姿を形作っていく。",
                "それは…忘れ去られた記憶そのものだった。",
              ],
            },
            { type: "wait", ms: 1000 },
            {
              type: "dialogue",
              speaker: "オモイデ",
              lines: [
                "…私は、この世界の記憶を守る者。",
                "大忘却の嵐が全てを飲み込んだあの日から、",
                "ここで失われた記憶を守り続けてきました。",
              ],
            },
            {
              type: "dialogue",
              speaker: "オモイデ",
              lines: [
                "あなたが本当に記憶の力を受け継ぐ者なら…",
                "私の試練を乗り越えて見せなさい。",
              ],
            },
            {
              type: "set_flag",
              flag: "omoide_event_started",
              value: true,
            },
            {
              type: "battle",
              trainerName: "オモイデ",
              party: [{ speciesId: "omoide", level: 70 }],
            },
            {
              type: "set_flag",
              flag: "omoide_captured",
              value: true,
            },
            {
              type: "dialogue",
              speaker: "オモイデ",
              lines: [
                "…見事です。あなたの中に、確かな記憶の力を感じます。",
                "私はあなたと共に歩みましょう。",
                "忘れ去られた世界の記憶を、取り戻すために。",
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * ワスレヌ捕獲イベント
 * 場所: 虚無の間（オモイデ捕獲後に出現する新エリア）
 * 条件: オモイデ捕獲済み
 */
export const WASURENU_EVENT: EventScript = {
  id: "legendary_wasurenu",
  trigger: "omoide_captured",
  commands: [
    {
      type: "branch",
      condition: "wasurenu_captured",
      then: [], // 既に捕獲済みなら何もしない
      else: [
        {
          type: "branch",
          condition: "wasurenu_event_started",
          then: [
            // イベント開始済みだが未捕獲 → 再戦
            {
              type: "dialogue",
              lines: ["虚無の空間が再び開く。", "忘却の力が渦を巻いている…"],
            },
            { type: "wait", ms: 1000 },
            {
              type: "dialogue",
              speaker: "ワスレヌ",
              lines: ["…忘れられぬ者よ。再び来たか。", "ならば、もう一度戦おう。"],
            },
            {
              type: "battle",
              trainerName: "ワスレヌ",
              party: [{ speciesId: "wasurenu", level: 70 }],
            },
            {
              type: "set_flag",
              flag: "wasurenu_captured",
              value: true,
            },
          ],
          else: [
            // 初回イベント
            {
              type: "dialogue",
              lines: [
                "パーティの中のオモイデが反応している…！",
                "目の前に、見えない扉が開いていく。",
              ],
            },
            { type: "wait", ms: 2000 },
            {
              type: "dialogue",
              lines: [
                "扉の向こうは、何もない空間だった。",
                "色も、音も、匂いも…全てが忘れ去られた場所。",
              ],
            },
            { type: "wait", ms: 1500 },
            {
              type: "dialogue",
              lines: ["闇の中から、一つの影が現れる。", "それは記憶の対極…忘却そのものの化身。"],
            },
            {
              type: "dialogue",
              speaker: "ワスレヌ",
              lines: [
                "…お前が、オモイデの力を手にした者か。",
                "記憶と忘却…私たちは、かつて一つだった。",
              ],
            },
            {
              type: "dialogue",
              speaker: "ワスレヌ",
              lines: [
                "大忘却の日、世界は私たちを引き裂いた。",
                "オモイデは記憶を守ることを選び、",
                "私は…忘却の痛みを引き受けた。",
              ],
            },
            {
              type: "dialogue",
              speaker: "ワスレヌ",
              lines: [
                "お前が本当に記憶と忘却の両方を",
                "受け止められる者なのか…確かめさせてもらう。",
              ],
            },
            {
              type: "set_flag",
              flag: "wasurenu_event_started",
              value: true,
            },
            {
              type: "battle",
              trainerName: "ワスレヌ",
              party: [{ speciesId: "wasurenu", level: 70 }],
            },
            {
              type: "set_flag",
              flag: "wasurenu_captured",
              value: true,
            },
            {
              type: "dialogue",
              speaker: "ワスレヌ",
              lines: [
                "…そうか。お前なら…忘却の闇も、記憶の光も、",
                "両方を抱えて歩いていけるのだな。",
              ],
            },
            {
              type: "dialogue",
              lines: [
                "ワスレヌは静かに目を閉じ、",
                "あなたの元へと歩み寄った。",
                "記憶と忘却…二つの伝説が、今ひとつになった。",
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** 伝説イベント一覧 */
export const LEGENDARY_EVENTS: EventScript[] = [OMOIDE_EVENT, WASURENU_EVENT];
