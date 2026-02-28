import type { BattleAction } from "../state-machine";
import type { AiContext, AiStrategy } from "./ai-types";
import { getMultiTypeEffectiveness } from "@/engine/type/effectiveness";
import { calcAllStats } from "@/engine/monster/stats";

/**
 * スマートAI — ジムリーダー・四天王・チャンピオン用
 * タイプ相性 + 推定ダメージ + 積み技判断 + 不利対面での交代
 */
export const smartAi: AiStrategy = {
  selectAction(context: AiContext): BattleAction {
    if (context.usableMoves.length === 0) {
      return { type: "fight", moveIndex: -1 };
    }

    // 不利対面で交代を検討
    const switchAction = considerSwitch(context);
    if (switchAction) return switchAction;

    const selfStats = calcAllStats(
      context.selfSpecies.baseStats,
      context.self.ivs,
      context.self.evs,
      context.self.level,
      context.self.nature,
    );

    const opponentStats = calcAllStats(
      context.opponentSpecies.baseStats,
      context.opponent.ivs,
      context.opponent.evs,
      context.opponent.level,
      context.opponent.nature,
    );

    const scored = context.usableMoves.map((m) => {
      const move = m.move;
      const basePower = move.power ?? 0;

      // 変化技の評価
      if (move.category === "status") {
        return { index: m.index, score: evaluateStatusMove(move, context) };
      }

      // タイプ相性
      const effectiveness = getMultiTypeEffectiveness(move.type, [
        ...context.opponentSpecies.types,
      ]);

      if (effectiveness === 0) {
        return { index: m.index, score: 0 };
      }

      // STAB
      const stab = context.selfSpecies.types.includes(move.type) ? 1.5 : 1;

      // 攻撃/防御ステータスに基づく推定ダメージ
      const atk = move.category === "physical" ? selfStats.atk : selfStats.spAtk;
      const def = move.category === "physical" ? opponentStats.def : opponentStats.spDef;
      const estimatedDamage =
        ((((2 * context.self.level) / 5 + 2) * basePower * atk) / def / 50 + 2) *
        effectiveness *
        stab;

      // キル確率ボーナス: 倒せそうなら優先
      const killBonus = estimatedDamage >= context.opponent.currentHp ? 50 : 0;

      // ランダム要素（少しだけ）
      const randomFactor = 0.95 + context.random() * 0.05;

      return { index: m.index, score: (estimatedDamage + killBonus) * randomFactor };
    });

    scored.sort((a, b) => b.score - a.score);
    return { type: "fight", moveIndex: scored[0].index };
  },
};

/** 変化技の評価 */
function evaluateStatusMove(
  move: { effect?: { statChanges?: Record<string, number> }; type: string },
  context: AiContext,
): number {
  // HPが半分以上あり、有利対面なら積み技を評価
  const selfMaxHp = calcAllStats(
    context.selfSpecies.baseStats,
    context.self.ivs,
    context.self.evs,
    context.self.level,
    context.self.nature,
  ).hp;

  const hpRatio = context.self.currentHp / selfMaxHp;

  // HPが低い場合は攻撃優先
  if (hpRatio < 0.4) return 5;

  // 有利対面で積み技は価値がある
  const isFavorableMatchup = checkFavorableMatchup(context);
  if (isFavorableMatchup && hpRatio > 0.6) {
    return 35 + context.random() * 10;
  }

  return 15 + context.random() * 5;
}

/** 対面有利かどうか */
function checkFavorableMatchup(context: AiContext): boolean {
  // 自分の最高相性技で2倍以上出せるか
  for (const m of context.usableMoves) {
    if (m.move.category === "status") continue;
    const eff = getMultiTypeEffectiveness(m.move.type, [...context.opponentSpecies.types]);
    if (eff >= 2) return true;
  }
  return false;
}

/** 不利対面で交代を検討 */
function considerSwitch(context: AiContext): BattleAction | null {
  // 25%の確率でのみ交代を検討（毎ターン交代されるとゲームにならない）
  if (context.random() > 0.25) return null;

  // 全技が等倍以下で、相手が抜群技を持ちそうな場合
  const bestEffectiveness = Math.max(
    ...context.usableMoves
      .filter((m) => m.move.category !== "status" && m.move.power)
      .map((m) => getMultiTypeEffectiveness(m.move.type, [...context.opponentSpecies.types])),
    0,
  );

  // 自分の技が全部いまひとつ以下で、味方に有利なモンスターがいる場合
  if (bestEffectiveness > 0.5) return null;

  // パーティで有利なモンスターを探す
  const party = context.selfBattler.party;
  const activeIdx = context.selfBattler.activeIndex;

  for (let i = 0; i < party.length; i++) {
    if (i === activeIdx) continue;
    if (party[i].currentHp <= 0) continue;
    return { type: "switch", partyIndex: i };
  }

  return null;
}
