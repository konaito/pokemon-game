/**
 * サイドクエストシステム (#184)
 * 各町のNPCから受けられるサブクエスト10個
 */
import type { StoryFlags } from "@/engine/state/story-flags";

/** クエストの状態 */
export type QuestStatus = "unavailable" | "available" | "active" | "completed";

/** クエストの種類 */
export type QuestType = "fetch" | "catch" | "show" | "battle" | "explore" | "deliver";

/** クエスト定義 */
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  /** クエスト受注可能になるフラグ条件 */
  availableFlag?: string;
  /** クエスト受注フラグ */
  startedFlag: string;
  /** クエスト完了フラグ */
  completedFlag: string;
  /** クエスト発生場所のマップID */
  locationMapId: string;
  /** クエストNPCのID */
  npcId: string;
  /** 報酬 */
  rewards: QuestReward[];
  /** クエスト目的の説明 */
  objective: string;
}

/** 報酬 */
export interface QuestReward {
  type: "item" | "money" | "monster";
  id?: string;
  quantity: number;
}

/**
 * クエストの状態を取得
 */
export function getQuestStatus(quest: QuestDefinition, flags: StoryFlags): QuestStatus {
  if (flags[quest.completedFlag]) return "completed";
  if (flags[quest.startedFlag]) return "active";
  if (quest.availableFlag && !flags[quest.availableFlag]) return "unavailable";
  return "available";
}

/**
 * アクティブなクエスト一覧を取得
 */
export function getActiveQuests(quests: QuestDefinition[], flags: StoryFlags): QuestDefinition[] {
  return quests.filter((q) => getQuestStatus(q, flags) === "active");
}

/**
 * 利用可能なクエスト一覧を取得
 */
export function getAvailableQuests(
  quests: QuestDefinition[],
  flags: StoryFlags,
): QuestDefinition[] {
  return quests.filter((q) => getQuestStatus(q, flags) === "available");
}

/**
 * 完了済みクエスト数を取得
 */
export function getCompletedQuestCount(quests: QuestDefinition[], flags: StoryFlags): number {
  return quests.filter((q) => getQuestStatus(q, flags) === "completed").length;
}

// ── 10個のサイドクエスト定義 ──

export const SIDE_QUESTS: QuestDefinition[] = [
  {
    id: "quest_lost_konezumi",
    name: "迷子のコネズミ",
    description: "ワスレマチの子供がコネズミを見失った。ルート1で見つけてきてほしい。",
    type: "fetch",
    startedFlag: "quest_lost_konezumi_started",
    completedFlag: "quest_lost_konezumi_completed",
    locationMapId: "wasuremachi",
    npcId: "child_wasuremachi",
    rewards: [{ type: "item", id: "potion", quantity: 5 }],
    objective: "ルート1で迷子のコネズミを見つける",
  },
  {
    id: "quest_show_hikarineko",
    name: "ヒカリネコを見せて！",
    description: "ツチグモ村の研究者がヒカリネコの生態を調べたい。捕まえて見せてほしい。",
    type: "show",
    availableFlag: "badge_1",
    startedFlag: "quest_show_hikarineko_started",
    completedFlag: "quest_show_hikarineko_completed",
    locationMapId: "tsuchigumo_village",
    npcId: "researcher_tsuchigumo",
    rewards: [{ type: "item", id: "thunder_stone", quantity: 1 }],
    objective: "ヒカリネコを捕まえて研究者に見せる",
  },
  {
    id: "quest_deliver_letter",
    name: "届け物",
    description: "カワセミ市の郵便局員がイシヤマタウンへ手紙を届けてほしい。",
    type: "deliver",
    availableFlag: "badge_2",
    startedFlag: "quest_deliver_letter_started",
    completedFlag: "quest_deliver_letter_completed",
    locationMapId: "kawasemi_city",
    npcId: "postman_kawasemi",
    rewards: [{ type: "item", id: "rare_candy", quantity: 1 }],
    objective: "イシヤマタウンの住人に手紙を届ける",
  },
  {
    id: "quest_catch_yukiusagi",
    name: "雪兎を探して",
    description: "ユキハラタウンの老人がユキウサギを見たがっている。捕まえて見せてほしい。",
    type: "catch",
    availableFlag: "badge_4",
    startedFlag: "quest_catch_yukiusagi_started",
    completedFlag: "quest_catch_yukiusagi_completed",
    locationMapId: "yukihara_town",
    npcId: "elder_yukihara",
    rewards: [{ type: "item", id: "moon_stone", quantity: 1 }],
    objective: "ユキウサギを捕まえて老人に見せる",
  },
  {
    id: "quest_battle_rival_rematch",
    name: "ライバルの挑戦",
    description: "ミズキ港でライバルが再戦を申し込んできた。",
    type: "battle",
    availableFlag: "badge_3",
    startedFlag: "quest_battle_rival_started",
    completedFlag: "quest_battle_rival_completed",
    locationMapId: "mizuki_port",
    npcId: "rival_mizuki",
    rewards: [{ type: "money", quantity: 5000 }],
    objective: "ライバルとのバトルに勝利する",
  },
  {
    id: "quest_explore_ruins",
    name: "遺跡の謎",
    description: "忘却の遺跡で古代文字を3つ発見してほしい。",
    type: "explore",
    availableFlag: "badge_5",
    startedFlag: "quest_explore_ruins_started",
    completedFlag: "quest_explore_ruins_completed",
    locationMapId: "oblivion_ruins",
    npcId: "archaeologist_ruins",
    rewards: [{ type: "item", id: "rare_candy", quantity: 2 }],
    objective: "忘却の遺跡で古代文字を3つ見つける",
  },
  {
    id: "quest_forgotten_lab",
    name: "失われた研究所",
    description: "博士の日記に記された「忘れられた研究所」を見つけてほしい。",
    type: "explore",
    availableFlag: "badge_6",
    startedFlag: "quest_forgotten_lab_started",
    completedFlag: "quest_forgotten_lab_completed",
    locationMapId: "seirei_city",
    npcId: "professor_seirei",
    rewards: [{ type: "item", id: "master_ball", quantity: 1 }],
    objective: "忘れられた研究所を発見し、端末を全て読む",
  },
  {
    id: "quest_ghost_sighting",
    name: "幽霊の目撃情報",
    description: "夜の学校に幽霊が出るという噂。正体を突き止めてほしい。",
    type: "explore",
    availableFlag: "badge_4",
    startedFlag: "quest_ghost_sighting_started",
    completedFlag: "quest_ghost_sighting_completed",
    locationMapId: "kageboushi_city",
    npcId: "teacher_kageboushi",
    rewards: [{ type: "item", id: "spell_tag", quantity: 1 }],
    objective: "夜の学校で幽霊の正体を突き止める",
  },
  {
    id: "quest_dragon_scale",
    name: "竜のウロコ",
    description: "セイレイ山の頂上付近にドラゴンのウロコがあるらしい。",
    type: "fetch",
    availableFlag: "badge_7",
    startedFlag: "quest_dragon_scale_started",
    completedFlag: "quest_dragon_scale_completed",
    locationMapId: "seirei_mountain",
    npcId: "hiker_seirei",
    rewards: [{ type: "item", id: "dragon_fang", quantity: 1 }],
    objective: "セイレイ山頂上でドラゴンのウロコを入手する",
  },
  {
    id: "quest_complete_pokedex",
    name: "図鑑を完成させよう",
    description: "全モンスターを捕獲して図鑑を完成させてほしい。",
    type: "catch",
    availableFlag: "champion_cleared",
    startedFlag: "quest_complete_pokedex_started",
    completedFlag: "quest_complete_pokedex_completed",
    locationMapId: "wasuremachi",
    npcId: "professor_wasuremachi",
    rewards: [{ type: "item", id: "shiny_charm", quantity: 1 }],
    objective: "全50種類のモンスターを捕獲する",
  },
];
