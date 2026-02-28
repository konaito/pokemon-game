import type { BattleAction } from "../state-machine";
import type { AiContext, AiStrategy } from "./ai-types";
import { getMultiTypeEffectiveness } from "@/engine/type/effectiveness";

/**
 * 基本AI — 一般トレーナー用
 * タイプ相性・威力・STAB(タイプ一致ボーナス)を考慮してスコア評価
 */
export const basicAi: AiStrategy = {
  selectAction(context: AiContext): BattleAction {
    if (context.usableMoves.length === 0) {
      return { type: "fight", moveIndex: -1 };
    }

    const scored = context.usableMoves.map((m) => {
      const move = m.move;
      const basePower = move.power ?? 0;

      // 変化技は低い固定スコア
      if (move.category === "status") {
        return { index: m.index, score: 10 + context.random() * 5 };
      }

      // タイプ相性
      const effectiveness = getMultiTypeEffectiveness(move.type, [
        ...context.opponentSpecies.types,
      ]);

      // 無効(0)なら使わない
      if (effectiveness === 0) {
        return { index: m.index, score: 0 };
      }

      // STAB (タイプ一致ボーナス)
      const stab = context.selfSpecies.types.includes(move.type) ? 1.5 : 1;

      // スコア = 威力 × 相性 × STAB × ランダム(0.85-1.0)
      const randomFactor = 0.85 + context.random() * 0.15;
      const score = basePower * effectiveness * stab * randomFactor;

      return { index: m.index, score };
    });

    // 最高スコアの技を選択
    scored.sort((a, b) => b.score - a.score);
    return { type: "fight", moveIndex: scored[0].index };
  },
};
