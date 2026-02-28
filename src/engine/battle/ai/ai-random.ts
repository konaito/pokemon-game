import type { BattleAction } from "../state-machine";
import type { AiContext, AiStrategy } from "./ai-types";

/** ランダムAI — 野生モンスター用（既存ロジック） */
export const randomAi: AiStrategy = {
  selectAction(context: AiContext): BattleAction {
    if (context.usableMoves.length === 0) {
      return { type: "fight", moveIndex: -1 };
    }
    const chosen = context.usableMoves[Math.floor(context.random() * context.usableMoves.length)];
    return { type: "fight", moveIndex: chosen.index };
  },
};
