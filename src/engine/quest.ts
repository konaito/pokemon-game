/**
 * サイドクエストシステム
 */

/** クエスト条件 */
export type QuestCondition =
  | { type: "show_monster"; speciesId: string }
  | { type: "deliver_item"; itemId: string; count: number }
  | { type: "defeat_trainer"; trainerId: string }
  | { type: "visit_location"; mapId: string }
  | { type: "catch_monster"; speciesId: string };

/** クエスト報酬 */
export type QuestReward =
  | { type: "item"; itemId: string; count: number }
  | { type: "monster"; speciesId: string; level: number }
  | { type: "flag"; flagId: string };

/** クエスト定義 */
export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  giverNpcId: string;
  giverMapId: string;
  conditions: QuestCondition[];
  rewards: QuestReward[];
  prerequisite?: { flag?: string; badge?: number };
}

/** クエストの状態 */
export type QuestStatus = "available" | "active" | "completed";

/** アクティブなクエストの進行状態 */
export interface QuestProgress {
  questId: string;
  conditionsMet: boolean[];
}

/** クエスト管理全体の状態 */
export interface QuestState {
  active: QuestProgress[];
  completed: string[];
}

/** 初期クエスト状態を生成 */
export function createQuestState(): QuestState {
  return { active: [], completed: [] };
}

/**
 * クエストが受注可能か判定
 */
export function canAcceptQuest(
  quest: QuestDefinition,
  questState: QuestState,
  storyFlags: Record<string, boolean>,
  badgeCount: number,
): boolean {
  // 既に受注中 or 完了済み
  if (questState.active.some((a) => a.questId === quest.id)) return false;
  if (questState.completed.includes(quest.id)) return false;

  // 前提条件チェック
  if (quest.prerequisite) {
    if (quest.prerequisite.flag && !storyFlags[quest.prerequisite.flag]) return false;
    if (quest.prerequisite.badge !== undefined && badgeCount < quest.prerequisite.badge) {
      return false;
    }
  }

  return true;
}

/**
 * クエストを受注
 */
export function acceptQuest(quest: QuestDefinition, state: QuestState): QuestState {
  const progress: QuestProgress = {
    questId: quest.id,
    conditionsMet: quest.conditions.map(() => false),
  };
  return {
    ...state,
    active: [...state.active, progress],
  };
}

/**
 * 特定の条件を達成済みにする
 */
export function updateQuestCondition(
  state: QuestState,
  questId: string,
  conditionIndex: number,
): QuestState {
  return {
    ...state,
    active: state.active.map((a) => {
      if (a.questId !== questId) return a;
      const newMet = [...a.conditionsMet];
      newMet[conditionIndex] = true;
      return { ...a, conditionsMet: newMet };
    }),
  };
}

/**
 * クエストの全条件が達成されているか判定
 */
export function isQuestComplete(state: QuestState, questId: string): boolean {
  const progress = state.active.find((a) => a.questId === questId);
  if (!progress) return false;
  return progress.conditionsMet.every((met) => met);
}

/**
 * クエストを完了にする（条件チェックは事前に行うこと）
 */
export function completeQuest(state: QuestState, questId: string): QuestState {
  return {
    active: state.active.filter((a) => a.questId !== questId),
    completed: [...state.completed, questId],
  };
}

/**
 * クエストの進行状況テキストを取得
 */
export function getQuestProgressText(quest: QuestDefinition, progress: QuestProgress): string {
  const completed = progress.conditionsMet.filter(Boolean).length;
  const total = quest.conditions.length;
  return `${quest.title} (${completed}/${total})`;
}

// ============================================
// クエスト定義データ（10個）
// ============================================

export const SIDE_QUESTS: QuestDefinition[] = [
  {
    id: "quest_lost_monster",
    title: "迷子のモンスター",
    description: "ワスレマチ近くのルートで迷子のモンスターを見つけて連れ戻してください。",
    giverNpcId: "wasuremachi_elder",
    giverMapId: "wasuremachi",
    conditions: [{ type: "visit_location", mapId: "route-1" }],
    rewards: [{ type: "item", itemId: "super-potion", count: 3 }],
  },
  {
    id: "quest_research",
    title: "研究のお手伝い",
    description: "博士の研究のため、特定のモンスターを3体見せてください。",
    giverNpcId: "wasuremachi_professor",
    giverMapId: "wasuremachi",
    conditions: [
      { type: "show_monster", speciesId: "himori" },
      { type: "show_monster", speciesId: "shizukumo" },
      { type: "show_monster", speciesId: "konohana" },
    ],
    rewards: [{ type: "item", itemId: "rare-candy", count: 1 }],
  },
  {
    id: "quest_berry_harvest",
    title: "きのみ収穫",
    description: "各ルートからきのみを集めてきてください。",
    giverNpcId: "town2_farmer",
    giverMapId: "kiokunooka",
    conditions: [{ type: "deliver_item", itemId: "sitrus-berry", count: 3 }],
    rewards: [{ type: "item", itemId: "lum-berry", count: 2 }],
    prerequisite: { badge: 1 },
  },
  {
    id: "quest_lost_letter",
    title: "失われた手紙",
    description: "別の町のNPCに手紙を届けてください。",
    giverNpcId: "town3_postman",
    giverMapId: "kasumimura",
    conditions: [{ type: "deliver_item", itemId: "letter", count: 1 }],
    rewards: [{ type: "item", itemId: "tm-flamethrower", count: 1 }],
    prerequisite: { badge: 2 },
  },
  {
    id: "quest_strong_foe",
    title: "強敵を倒せ",
    description: "隠しトレーナーに勝利してください。",
    giverNpcId: "town4_fighter",
    giverMapId: "honoonomachi",
    conditions: [{ type: "defeat_trainer", trainerId: "hidden_trainer_1" }],
    rewards: [{ type: "item", itemId: "choice-band", count: 1 }],
    prerequisite: { badge: 3 },
  },
  {
    id: "quest_fossil",
    title: "化石発掘",
    description: "特定のマップで化石を見つけてください。",
    giverNpcId: "town5_scientist",
    giverMapId: "koganecity",
    conditions: [{ type: "visit_location", mapId: "forgotten-ruins" }],
    rewards: [{ type: "monster", speciesId: "iwagame", level: 25 }],
    prerequisite: { badge: 4 },
  },
  {
    id: "quest_ghost",
    title: "幽霊の正体",
    description: "夜の建物でゴーストモンスターを捕獲してください。",
    giverNpcId: "town6_medium",
    giverMapId: "yuureimura",
    conditions: [{ type: "catch_monster", speciesId: "dorontama" }],
    rewards: [{ type: "flag", flagId: "rare_ghost_unlocked" }],
    prerequisite: { badge: 5 },
  },
  {
    id: "quest_fishing_master",
    title: "釣り名人への道",
    description: "水タイプのモンスターを5種見せてください。",
    giverNpcId: "town7_fisherman",
    giverMapId: "uminomachi",
    conditions: [
      { type: "show_monster", speciesId: "shizukumo" },
      { type: "show_monster", speciesId: "namikozou" },
      { type: "show_monster", speciesId: "taikaiou" },
      { type: "show_monster", speciesId: "suigyuu" },
      { type: "show_monster", speciesId: "iwagame" },
    ],
    rewards: [{ type: "item", itemId: "super-rod", count: 1 }],
    prerequisite: { badge: 6 },
  },
  {
    id: "quest_lost_items",
    title: "忘れ物コレクター",
    description: "各地の忘れ物を5個集めてください。",
    giverNpcId: "town8_collector",
    giverMapId: "owari-city",
    conditions: [
      { type: "visit_location", mapId: "route-1" },
      { type: "visit_location", mapId: "hajimari-forest" },
      { type: "visit_location", mapId: "forgotten-ruins" },
      { type: "visit_location", mapId: "seirei-mountain" },
      { type: "visit_location", mapId: "route-9" },
    ],
    rewards: [{ type: "item", itemId: "master-ball", count: 1 }],
    prerequisite: { badge: 7 },
  },
  {
    id: "quest_memory_shards",
    title: "記憶のかけら",
    description: "世界中に散らばる記憶のかけらを全て集めてください。",
    giverNpcId: "postgame_sage",
    giverMapId: "wasuremachi",
    conditions: [
      { type: "visit_location", mapId: "forgotten-ruins" },
      { type: "visit_location", mapId: "seirei-mountain" },
      { type: "visit_location", mapId: "owari-city" },
    ],
    rewards: [{ type: "monster", speciesId: "omoideon", level: 70 }],
    prerequisite: { flag: "champion_cleared" },
  },
];

/** IDからクエスト定義を検索 */
export function getQuestById(id: string): QuestDefinition | undefined {
  return SIDE_QUESTS.find((q) => q.id === id);
}
