/**
 * オブリヴィオン団イベントシナリオ (#49)
 * 悪の組織「オブリヴィオン団」に関するイベントスクリプト群
 */

import type { EventScript } from "./event-script";

/**
 * カガリ市での初遭遇イベント
 * ジム4（カガリ市）到着時に発生
 */
export const oblivionFirstEncounter: EventScript = {
  id: "oblivion_first_encounter",
  trigger: { flag: "gym3_cleared", value: true },
  commands: [
    {
      type: "branch",
      condition: "oblivion_encountered",
      then: [
        {
          type: "dialogue",
          speaker: "マボロシ",
          lines: ["また会ったな。まだ分からないのか...記憶など、重荷でしかない。"],
        },
      ],
      else: [
        {
          type: "dialogue",
          lines: ["…街の広場で、黒い制服の集団が演説をしている。"],
        },
        {
          type: "dialogue",
          speaker: "オブリヴィオン団員",
          lines: [
            "市民の皆さん！モンスターとの共存など幻想です！",
            "50年前の『大忘却』こそが、我々人間に自立をもたらしたのです！",
          ],
        },
        {
          type: "dialogue",
          speaker: "マボロシ",
          lines: [
            "…ほう、モンスターを連れた子供か。",
            "私はマボロシ。オブリヴィオン団の情報局長だ。",
            "お前のような者がいるから、人々は過去に縛られる。",
            "…少し教育してやろう。",
          ],
        },
        {
          type: "battle",
          trainerName: "オブリヴィオン マボロシ",
          party: [
            { speciesId: "dokudama", level: 25 },
            { speciesId: "dokudama", level: 27 },
          ],
        },
        {
          type: "dialogue",
          speaker: "マボロシ",
          lines: [
            "…なるほど、多少は使えるようだな。",
            "だが覚えておけ。記憶とは呪いだ。",
            "いずれお前もそれを思い知る。",
          ],
        },
        { type: "set_flag", flag: "oblivion_encountered", value: true },
      ],
    },
  ],
};

/**
 * 忘却の遺跡イベント（ナツメ町）
 * ジム5到着後、遺跡を調査するイベント
 */
export const oblivionRuinsEvent: EventScript = {
  id: "oblivion_ruins_event",
  trigger: [
    { flag: "gym4_cleared", value: true },
    { flag: "oblivion_encountered", value: true },
  ],
  commands: [
    {
      type: "branch",
      condition: "ruins_investigated",
      then: [
        {
          type: "dialogue",
          speaker: "コダチ博士",
          lines: ["遺跡の調査は完了している。次はキリフリ村に向かおう。"],
        },
      ],
      else: [
        {
          type: "dialogue",
          speaker: "コダチ博士",
          lines: [
            "ここが忘却の遺跡だ。大忘却の手がかりがあるはずだ。",
            "…注意してくれ。オブリヴィオン団が先に来ている可能性がある。",
          ],
        },
        {
          type: "dialogue",
          lines: ["…遺跡の奥に進むと、壁画が見つかった。"],
        },
        {
          type: "dialogue",
          speaker: "コダチ博士",
          lines: [
            "これは…人間とモンスターが共に暮らす姿の壁画だ。",
            "そして、この紋章…。ワスレヌの力を増幅する装置の設計図だ！",
            "大忘却は自然現象ではなかった。誰かが意図的に起こしたんだ！",
          ],
        },
        {
          type: "dialogue",
          speaker: "ウツロ",
          lines: [
            "……その通りだ。",
            "ムゲン様が世界を救った。記憶という鎖から。",
            "お前たちが何をしようと、忘却は止められない。",
          ],
        },
        {
          type: "battle",
          trainerName: "オブリヴィオン ウツロ",
          party: [
            { speciesId: "dokudama", level: 30 },
            { speciesId: "oonezumi", level: 32 },
          ],
        },
        {
          type: "dialogue",
          speaker: "ウツロ",
          lines: ["………撤退する。だが、お前たちの努力は無意味だ。"],
        },
        {
          type: "dialogue",
          speaker: "コダチ博士",
          lines: [
            "…これで確信した。大忘却は人為的なものだった。",
            "そしてオブリヴィオン団は、同じことをもう一度しようとしている。",
            "急がなければ。",
          ],
        },
        { type: "set_flag", flag: "ruins_investigated", value: true },
      ],
    },
  ],
};

/**
 * キリフリ村の老人たちの記憶を守るイベント
 * ジム6到着時に発生
 */
export const oblivionKirifuriEvent: EventScript = {
  id: "oblivion_kirifuri_event",
  trigger: [
    { flag: "gym5_cleared", value: true },
    { flag: "ruins_investigated", value: true },
  ],
  commands: [
    {
      type: "branch",
      condition: "kirifuri_defended",
      then: [
        {
          type: "dialogue",
          speaker: "長老",
          lines: ["お前のおかげでわしらの記憶は守られた。感謝しているよ。"],
        },
      ],
      else: [
        {
          type: "dialogue",
          speaker: "長老",
          lines: [
            "ここキリフリ村には、大忘却を覚えている者がまだいる。",
            "わしらは50年前のあの日を覚えておるよ。",
            "モンスターたちが…突然、わしらのことを忘れたように去っていった日を。",
          ],
        },
        {
          type: "dialogue",
          lines: ["…突然、オブリヴィオン団が村に押し入ってきた！"],
        },
        {
          type: "dialogue",
          speaker: "マボロシ",
          lines: [
            "やはりここに生き残りがいたか。",
            "大忘却の記憶を持つ者…排除しなければならない。",
            "記憶は、感染する。お前たちがいる限り、忘却は完成しない。",
          ],
        },
        {
          type: "battle",
          trainerName: "オブリヴィオン マボロシ",
          party: [
            { speciesId: "dokudama", level: 35 },
            { speciesId: "dokunuma", level: 37 },
            { speciesId: "oonezumi", level: 35 },
          ],
        },
        {
          type: "dialogue",
          speaker: "マボロシ",
          lines: ["…くっ。だが、これは序章に過ぎない。カゲロウ様の計画は止められない。"],
        },
        {
          type: "dialogue",
          speaker: "長老",
          lines: [
            "ありがとう、若き旅人よ。",
            "聞いてくれ。わしは覚えておる。モンスターと人が一緒に暮らしていた頃を。",
            "あの頃は…本当に幸せだった。",
            "お前とそのモンスターの姿を見ていると、あの頃を思い出すよ。",
          ],
        },
        { type: "set_flag", flag: "kirifuri_defended", value: true },
      ],
    },
  ],
};

/**
 * セイレイ山 最終決戦イベント
 * 全8バッジ取得後に発生
 */
export const oblivionFinalBattle: EventScript = {
  id: "oblivion_final_battle",
  trigger: [
    { flag: "gym8_cleared", value: true },
    { flag: "kirifuri_defended", value: true },
  ],
  commands: [
    {
      type: "branch",
      condition: "oblivion_defeated",
      then: [
        {
          type: "dialogue",
          lines: ["セイレイ山は静かだ。嵐は過ぎ去った。"],
        },
      ],
      else: [
        {
          type: "dialogue",
          lines: [
            "セイレイ山の頂上。嵐が渦巻いている。",
            "オブリヴィオン団がワスレヌの力を解放しようとしている。",
          ],
        },
        {
          type: "dialogue",
          speaker: "トコヤミ",
          lines: [
            "来たか。ここまで来られるとは思わなかったよ。",
            "だが遅い。装置はもうすぐ完成する。",
            "…研究者として、一つだけ言っておこう。",
            "ワスレヌは本来、悪い存在ではない。利用されただけだ。",
          ],
        },
        {
          type: "battle",
          trainerName: "オブリヴィオン トコヤミ",
          party: [
            { speciesId: "dokunuma", level: 42 },
            { speciesId: "hayatedori", level: 40 },
            { speciesId: "oonezumi", level: 42 },
          ],
        },
        {
          type: "dialogue",
          speaker: "カゲロウ",
          lines: [
            "ようこそ、忘却の完成の場へ。",
            "お前のその『絆』とやらは、失った時にどれほど人を壊すか知っているか？",
            "最初からなければ、誰も傷つかない。",
            "…覚悟はいいか。全てを終わらせる。",
          ],
        },
        {
          type: "battle",
          trainerName: "オブリヴィオン団ボス カゲロウ",
          party: [
            { speciesId: "dokunuma", level: 45 },
            { speciesId: "oonezumi", level: 44 },
            { speciesId: "hayatedori", level: 44 },
            { speciesId: "dokudama", level: 46 },
          ],
        },
        {
          type: "dialogue",
          speaker: "カゲロウ",
          lines: [
            "…なぜだ。なぜお前は、記憶の痛みを知りながら前に進める。",
            "記憶とは…呪いではなかったのか…。",
          ],
        },
        {
          type: "dialogue",
          speaker: "コダチ博士",
          lines: [
            "カゲロウ…記憶は呪いじゃない。",
            "辛い記憶も、楽しい記憶も、全て私たちの一部だ。",
            "そしてこの子は、過去の記憶がなくても新しい絆を作った。",
            "それこそが答えだ。",
          ],
        },
        { type: "set_flag", flag: "oblivion_defeated", value: true },
      ],
    },
  ],
};

/** オブリヴィオン団関連の全イベントスクリプト */
export const OBLIVION_EVENTS: EventScript[] = [
  oblivionFirstEncounter,
  oblivionRuinsEvent,
  oblivionKirifuriEvent,
  oblivionFinalBattle,
];
