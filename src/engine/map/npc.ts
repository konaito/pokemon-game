import type { NpcDefinition, NpcEvent } from "./map-data";
import type { StoryFlags } from "@/engine/state/story-flags";
import { checkFlagRequirement } from "@/engine/state/story-flags";

/**
 * NPC配置と会話システム (#41, #39)
 */

export interface NpcInteractionResult {
  npc: NpcDefinition;
  /** 会話テキスト（条件分岐後） */
  dialogue: string[];
  /** トレーナー戦が発生するか */
  triggerBattle: boolean;
  /** 会話完了時に実行するイベント */
  event: NpcEvent | null;
}

/**
 * NPCのダイアログを解決する（条件分岐対応）
 * conditionalDialoguesを上から順に評価し、最初に条件を満たしたものを返す。
 * いずれも満たさない場合はデフォルトのdialogueを返す。
 */
export function resolveNpcDialogue(
  npc: NpcDefinition,
  storyFlags: StoryFlags = {},
): string[] {
  if (npc.conditionalDialogues) {
    for (const cd of npc.conditionalDialogues) {
      if (checkFlagRequirement(storyFlags, cd.condition)) {
        return cd.dialogue;
      }
    }
  }
  return npc.dialogue;
}

/**
 * マップ上でストーリーフラグに基づきNPCが出現しているか判定
 */
export function isNpcVisible(npc: NpcDefinition, storyFlags: StoryFlags = {}): boolean {
  if (!npc.appearCondition) return true;
  return checkFlagRequirement(storyFlags, npc.appearCondition);
}

/**
 * マップ上の可視NPCリストを取得
 */
export function getVisibleNpcs(npcs: NpcDefinition[], storyFlags: StoryFlags = {}): NpcDefinition[] {
  return npcs.filter((npc) => isNpcVisible(npc, storyFlags));
}

/**
 * NPCに話しかける
 * @param npcId NPC ID
 * @param npcs マップ上のNPC一覧
 * @param defeatedTrainers 倒済みトレーナーIDのSet
 * @param storyFlags 現在のストーリーフラグ
 */
export function interactWithNpc(
  npcId: string,
  npcs: NpcDefinition[],
  defeatedTrainers: Set<string> = new Set(),
  storyFlags: StoryFlags = {},
): NpcInteractionResult | null {
  const npc = npcs.find((n) => n.id === npcId);
  if (!npc) return null;

  // 出現条件チェック
  if (!isNpcVisible(npc, storyFlags)) return null;

  const alreadyDefeated = defeatedTrainers.has(npc.id);

  return {
    npc,
    dialogue: resolveNpcDialogue(npc, storyFlags),
    triggerBattle: npc.isTrainer && !alreadyDefeated,
    event: npc.onInteract ?? null,
  };
}
