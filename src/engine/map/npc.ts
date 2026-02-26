import type { NpcDefinition } from "./map-data";

/**
 * NPC配置と会話システム (#41)
 */

export interface NpcInteractionResult {
  npc: NpcDefinition;
  /** 会話テキスト */
  dialogue: string[];
  /** トレーナー戦が発生するか */
  triggerBattle: boolean;
}

/**
 * NPCに話しかける
 * @param npcId NPC ID
 * @param npcs マップ上のNPC一覧
 * @param defeatedTrainers 倒済みトレーナーIDのSet
 */
export function interactWithNpc(
  npcId: string,
  npcs: NpcDefinition[],
  defeatedTrainers: Set<string> = new Set(),
): NpcInteractionResult | null {
  const npc = npcs.find((n) => n.id === npcId);
  if (!npc) return null;

  const alreadyDefeated = defeatedTrainers.has(npc.id);

  return {
    npc,
    dialogue: npc.dialogue,
    triggerBattle: npc.isTrainer && !alreadyDefeated,
  };
}
