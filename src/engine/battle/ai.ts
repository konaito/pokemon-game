import type {
  MonsterInstance,
  MonsterSpecies,
  MoveDefinition,
  SpeciesResolver,
  MoveResolver,
} from "@/types";
import { getMultiTypeEffectiveness } from "@/engine/type/effectiveness";

/** AI難易度 */
export type AiLevel = "random" | "basic" | "smart";

/**
 * AI技選択（random: 完全ランダム）
 */
function selectRandom(
  usableMoves: { moveId: string; index: number }[],
  random: () => number,
): number {
  const chosen = usableMoves[Math.floor(random() * usableMoves.length)];
  return chosen.index;
}

/**
 * AI技選択（basic: タイプ相性を考慮）
 * 効果抜群の技を優先、無効・いまひとつは避ける
 */
function selectBasic(
  usableMoves: { moveId: string; index: number }[],
  active: MonsterInstance,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  moveResolver: MoveResolver,
  random: () => number,
): number {
  const scored = usableMoves.map((m) => {
    const move = moveResolver(m.moveId);
    if (!move || move.category === "status" || move.power === null) {
      return { index: m.index, score: 0.5 };
    }

    // タイプ相性スコア
    const effectiveness = getMultiTypeEffectiveness(move.type, [...defenderSpecies.types]);

    let score = effectiveness;
    // 威力も軽く考慮
    score *= move.power / 100;
    // STAB
    // Note: active monster speciesId would need resolving, simplified here
    return { index: m.index, score };
  });

  // スコア降順ソート
  scored.sort((a, b) => b.score - a.score);

  // 最高スコアの技を選ぶ（同スコアならランダム）
  const bestScore = scored[0].score;
  const bestMoves = scored.filter((s) => s.score === bestScore);
  return bestMoves[Math.floor(random() * bestMoves.length)].index;
}

/**
 * AI技選択（smart: タイプ相性 + 残HP + ステータスを考慮）
 * ジムリーダーや四天王向けの高度AI
 */
function selectSmart(
  usableMoves: { moveId: string; index: number }[],
  active: MonsterInstance,
  activeSpecies: MonsterSpecies,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  moveResolver: MoveResolver,
  random: () => number,
): number {
  const scored = usableMoves.map((m) => {
    const move = moveResolver(m.moveId);
    if (!move) return { index: m.index, score: 0 };

    // ステータス技の評価
    if (move.category === "status") {
      // 状態異常付与技は相手が異常なしの時に有効
      if (move.effect?.statusCondition && defender.status === null) {
        return { index: m.index, score: 1.5 };
      }
      // 能力変化技
      if (move.effect?.statChanges) {
        return { index: m.index, score: 1.2 };
      }
      return { index: m.index, score: 0.3 };
    }

    if (move.power === null) return { index: m.index, score: 0.5 };

    // タイプ相性
    const effectiveness = getMultiTypeEffectiveness(move.type, [...defenderSpecies.types]);
    if (effectiveness === 0) return { index: m.index, score: 0 };

    // 基本スコア = 威力 × タイプ相性
    let score = (move.power / 100) * effectiveness;

    // STABボーナス
    if (activeSpecies.types.includes(move.type)) {
      score *= 1.5;
    }

    // 物理/特殊の適性（攻撃と特攻を比較）
    if (move.category === "physical") {
      score *= activeSpecies.baseStats.atk / 100;
    } else {
      score *= activeSpecies.baseStats.spAtk / 100;
    }

    // 相手のHP割合が低い時は確実に倒せる低威力技でも良い
    // 高HP時は高威力技を優先
    return { index: m.index, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const bestScore = scored[0].score;
  const bestMoves = scored.filter((s) => Math.abs(s.score - bestScore) < 0.1);
  return bestMoves[Math.floor(random() * bestMoves.length)].index;
}

/**
 * AIが技を選択する
 */
export function selectAiMove(
  aiLevel: AiLevel,
  active: MonsterInstance,
  activeSpecies: MonsterSpecies,
  defender: MonsterInstance,
  defenderSpecies: MonsterSpecies,
  moveResolver: MoveResolver,
  random: () => number = Math.random,
): number {
  const usableMoves = active.moves
    .map((m, i) => ({ moveId: m.moveId, index: i }))
    .filter((m) => {
      const inst = active.moves[m.index];
      return inst.currentPp > 0;
    });

  if (usableMoves.length === 0) return -1; // わるあがき

  switch (aiLevel) {
    case "random":
      return selectRandom(usableMoves, random);
    case "basic":
      return selectBasic(usableMoves, active, defender, defenderSpecies, moveResolver, random);
    case "smart":
      return selectSmart(
        usableMoves,
        active,
        activeSpecies,
        defender,
        defenderSpecies,
        moveResolver,
        random,
      );
  }
}
