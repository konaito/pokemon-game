/**
 * 四天王 & チャンピオン戦の実装 (#53)
 * ワスレナ島ポケモンリーグでの最終試練
 */

import type { EventScript } from "./event-script";

/** 四天王メンバーの定義 */
export interface EliteFourMember {
  id: string;
  name: string;
  type: string;
  title: string;
  introDialogue: string[];
  defeatDialogue: string[];
  party: { speciesId: string; level: number }[];
}

/** チャンピオンの定義 */
export interface ChampionDefinition {
  id: string;
  name: string;
  title: string;
  introDialogue: string[];
  defeatDialogue: string[];
  party: { speciesId: string; level: number }[];
}

/** 四天王データ */
export const ELITE_FOUR: EliteFourMember[] = [
  {
    id: "tsubasa",
    name: "ツバサ",
    type: "flying",
    title: "四天王",
    introDialogue: [
      "ようこそ、ポケモンリーグへ。",
      "私はツバサ。風のように自由に生きる吟遊詩人だ。",
      "忘れられた歌を集めて旅をしてきた。",
      "お前の物語を、風に乗せて聞かせてもらおう。",
    ],
    defeatDialogue: [
      "…見事だ。お前の物語は、風よりも力強い。",
      "次の間へ進むがいい。",
    ],
    party: [
      { speciesId: "hayatedori", level: 48 },
      { speciesId: "tobibato", level: 46 },
      { speciesId: "hanamushi", level: 48 },
      { speciesId: "hayatedori", level: 50 },
    ],
  },
  {
    id: "kurogane",
    name: "クロガネ",
    type: "steel",
    title: "四天王",
    introDialogue: [
      "鋼は錆びぬ。鋼は折れぬ。鋼は忘れぬ。",
      "わしはクロガネ。元鍛冶師だ。",
      "形あるものは残る。記憶が消えても、鋼は残った。",
      "お前の意志、鋼のように固いか試してやろう。",
    ],
    defeatDialogue: [
      "…お前の意志は、わしの鋼よりも硬い。",
      "先へ進め。",
    ],
    party: [
      { speciesId: "oonezumi", level: 49 },
      { speciesId: "kawadojou", level: 49 },
      { speciesId: "oonezumi", level: 51 },
      { speciesId: "kawadojou", level: 52 },
    ],
  },
  {
    id: "miyabi",
    name: "ミヤビ",
    type: "fairy",
    title: "四天王",
    introDialogue: [
      "物語の中にこそ、記憶は生き続ける。",
      "私はミヤビ。かつて舞台に立った女優よ。",
      "あなたの旅も、一つの物語。",
      "その物語の結末を、私が見届けてあげる。",
    ],
    defeatDialogue: [
      "…素晴らしい。あなたの物語は、まだ終わらない。",
      "次の幕へ。",
    ],
    party: [
      { speciesId: "hanamushi", level: 50 },
      { speciesId: "hikarineko", level: 50 },
      { speciesId: "hanamushi", level: 52 },
      { speciesId: "konohana", level: 53 },
    ],
  },
  {
    id: "genbu",
    name: "ゲンブ",
    type: "rock",
    title: "四天王",
    introDialogue: [
      "大地の記憶は何万年も消えない。",
      "私はゲンブ。地質学者だ。",
      "岩は全てを覚えている。大忘却の前も、後も。",
      "大地の記憶に刻まれるほどの戦い、見せてもらおう。",
    ],
    defeatDialogue: [
      "…お前の名は、大地の記憶に刻まれた。",
      "最後の間へ進め。チャンピオンが待っている。",
    ],
    party: [
      { speciesId: "kawadojou", level: 51 },
      { speciesId: "dokunuma", level: 51 },
      { speciesId: "oonezumi", level: 53 },
      { speciesId: "kawadojou", level: 54 },
    ],
  },
];

/** チャンピオンデータ */
export const CHAMPION: ChampionDefinition = {
  id: "akatsuki",
  name: "アカツキ",
  title: "チャンピオン",
  introDialogue: [
    "…来たか。",
    "私はアカツキ。レムニアのチャンピオンだ。",
    "かつてコダチと共に旅をした。大忘却の真相を追い、そして…絶望した。",
    "記憶が戻ることも、世界が変わることも、不可能だと思った。",
    "だがお前は…お前の目は、昔の私に似ているな。",
    "全力で来い。私が間違っていたのか、確かめさせてくれ。",
  ],
  defeatDialogue: [
    "…私の負けだ。",
    "記憶は戻らなくても、新しい絆は生まれる。",
    "お前がそれを証明した。",
    "…ありがとう。お前のおかげで、私もまた前に進める。",
  ],
  party: [
    { speciesId: "hayatedori", level: 54 },
    { speciesId: "dokunuma", level: 54 },
    { speciesId: "hikarineko", level: 55 },
    { speciesId: "oonezumi", level: 55 },
    { speciesId: "kawadojou", level: 56 },
    { speciesId: "hanamushi", level: 57 },
  ],
};

/**
 * 四天王メンバーのバトルスクリプトを生成
 */
export function createEliteFourScript(member: EliteFourMember, index: number): EventScript {
  const flagName = `elite_four_${index + 1}_cleared`;

  return {
    id: `elite_four_battle_${index + 1}`,
    commands: [
      {
        type: "branch",
        condition: flagName,
        then: [
          {
            type: "dialogue",
            speaker: member.name,
            lines: ["もう一度会えて嬉しいよ。先へ進みたまえ。"],
          },
        ],
        else: [
          {
            type: "dialogue",
            speaker: member.name,
            lines: member.introDialogue,
          },
          {
            type: "battle",
            trainerName: `${member.title} ${member.name}`,
            party: member.party,
          },
          {
            type: "dialogue",
            speaker: member.name,
            lines: member.defeatDialogue,
          },
          {
            type: "set_flag",
            flag: flagName,
            value: true,
          },
        ],
      },
    ],
  };
}

/**
 * チャンピオン戦スクリプトを生成
 */
export function createChampionScript(champion: ChampionDefinition): EventScript {
  return {
    id: "champion_battle",
    commands: [
      {
        type: "branch",
        condition: "champion_defeated",
        then: [
          {
            type: "dialogue",
            speaker: champion.name,
            lines: [
              "再び来たか。お前との戦いは、いつも心が躍る。",
              "…もう一度、全力で行かせてもらう。",
            ],
          },
          {
            type: "battle",
            trainerName: `${champion.title} ${champion.name}`,
            party: champion.party,
          },
          {
            type: "dialogue",
            speaker: champion.name,
            lines: ["…やはりお前は強い。チャンピオンに相応しい。"],
          },
        ],
        else: [
          {
            type: "dialogue",
            speaker: champion.name,
            lines: champion.introDialogue,
          },
          {
            type: "battle",
            trainerName: `${champion.title} ${champion.name}`,
            party: champion.party,
          },
          {
            type: "dialogue",
            speaker: champion.name,
            lines: champion.defeatDialogue,
          },
          {
            type: "dialogue",
            lines: ["殿堂入りおめでとう！"],
          },
          {
            type: "set_flag",
            flag: "champion_defeated",
            value: true,
          },
        ],
      },
    ],
  };
}

/**
 * ポケモンリーグ全体のスクリプト一覧を生成
 */
export function createLeagueScripts(): EventScript[] {
  const scripts: EventScript[] = [];
  for (let i = 0; i < ELITE_FOUR.length; i++) {
    scripts.push(createEliteFourScript(ELITE_FOUR[i], i));
  }
  scripts.push(createChampionScript(CHAMPION));
  return scripts;
}
