/**
 * エンディングシーケンスの実装 (#56)
 * チャンピオン勝利後のエンディング〜エピローグ
 */

import type { EventScript } from "./event-script";

/**
 * エンディングシーケンスのスクリプトを生成
 * チャンピオン撃破後に呼ばれることを前提とする
 */
export function createEndingScript(playerName: string): EventScript {
  return {
    id: "ending_sequence",
    trigger: "champion_defeated",
    commands: [
      // 殿堂入り
      {
        type: "dialogue",
        lines: [
          `${playerName}は殿堂入りした！`,
          "あなたとモンスターたちの絆は、レムニアの歴史に刻まれた。",
        ],
      },

      // アカツキとの会話
      {
        type: "dialogue",
        speaker: "アカツキ",
        lines: [
          "私はあの日、全てを諦めた。",
          "記憶が戻ることも、世界が変わることも、不可能だと思った。",
          "だがお前は諦めなかった。",
          "…ありがとう。お前のおかげで、私もまた前に進める。",
        ],
      },

      // 演出用の待機
      { type: "wait", ms: 2000 },

      // スタッフロール演出
      {
        type: "dialogue",
        lines: ["— MONSTER CHRONICLE —", "あなたの旅を振り返ります…"],
      },
      { type: "wait", ms: 3000 },

      // エピローグ: ワスレ町に戻る
      {
        type: "move_player",
        mapId: "wasuremachi",
        x: 4,
        y: 4,
      },

      // 母親との再会
      {
        type: "dialogue",
        speaker: "母",
        lines: [
          "おかえり。",
          "テレビで見ていたよ。あなたが殿堂入りしたこと。",
          "…立派になったね。",
        ],
      },

      // コダチ博士との会話
      {
        type: "dialogue",
        speaker: "コダチ博士",
        lines: [
          "世界は変わり始めている。",
          "記憶は戻らなかった。だが…見てごらん。",
          "人々は再びモンスターに興味を持ち始めている。",
          "恐怖ではなく、好奇心で。",
          "新しい物語が始まっているんだ。",
        ],
      },

      // ソウマとの最後の会話
      {
        type: "dialogue",
        speaker: "ソウマ",
        lines: [
          "…やっと戻ったか。",
          "俺もモンスターの研究をしてみようと思う。",
          "お前が見せてくれたもの、ちゃんと覚えてるから。",
          "…認めたくなかったんだ。こいつらのことが、怖くなくなってきてたことを。",
          "ありがとな。",
        ],
      },

      // エンディングメッセージ
      { type: "wait", ms: 2000 },
      {
        type: "dialogue",
        lines: [
          "あなたの旅は、ここで一つの区切りを迎えます。",
          "しかし、レムニアの物語はまだ続いています。",
          "新しい冒険が、あなたを待っています。",
        ],
      },

      // エンディング完了フラグ
      { type: "set_flag", flag: "ending_complete", value: true },

      // パーティ回復（ポストゲーム開始の準備）
      { type: "heal" },
    ],
  };
}

/**
 * ポストゲーム解放時のスクリプト
 * エンディング完了後にコダマ町で表示される
 */
export function createPostgameIntroScript(): EventScript {
  return {
    id: "postgame_intro",
    trigger: [
      { flag: "ending_complete", value: true },
      { flag: "postgame_started", value: false },
    ],
    commands: [
      {
        type: "dialogue",
        speaker: "コダチ博士",
        lines: [
          "さて…チャンピオンになったからと言って、やるべきことがなくなったわけじゃない。",
          "セイレイ山にオモイデの気配を感じる。会いに行ってみないか？",
          "それに、忘却の遺跡の奥にもまだ調査していない場所がある。",
          "レムニアの物語は、まだ終わっていないよ。",
        ],
      },
      { type: "set_flag", flag: "postgame_started", value: true },
    ],
  };
}

/**
 * ソウマ最終バトルスクリプト（ポストゲーム）
 */
export function createSoumaFinalBattleScript(): EventScript {
  return {
    id: "souma_final_battle",
    trigger: [
      { flag: "ending_complete", value: true },
      { flag: "souma_final_beaten", value: false },
    ],
    commands: [
      {
        type: "dialogue",
        speaker: "ソウマ",
        lines: ["…待ってたよ。", "全力で来い。お前にそう言えるようになった自分が、少し誇らしい。"],
      },
      {
        type: "battle",
        trainerName: "モンスター研究者 ソウマ",
        party: [
          { speciesId: "oonezumi", level: 62 },
          { speciesId: "hayatedori", level: 63 },
          { speciesId: "dokunuma", level: 63 },
          { speciesId: "hikarineko", level: 64 },
          { speciesId: "kawadojou", level: 64 },
          { speciesId: "hanamushi", level: 65 },
        ],
      },
      {
        type: "dialogue",
        speaker: "ソウマ",
        lines: [
          "…やっぱりお前には勝てないか。",
          "でも…悔しいけど、嫌な気持ちじゃない。",
          "お前と戦えて、楽しかった。",
          "…ありがとう。これからも、よろしくな。",
        ],
      },
      { type: "set_flag", flag: "souma_final_beaten", value: true },
    ],
  };
}
