import type { MonsterInstance, MonsterSpecies } from "@/types";
import { calcHp } from "./stats";

/**
 * 進化チェック時のコンテキスト情報
 */
export interface EvolutionContext {
  /** 使用されたアイテムID（アイテム進化時） */
  usedItemId?: string;
  /** 現在の時間帯 */
  timeOfDay?: "day" | "night";
  /** なつき度（0-255） */
  friendship?: number;
  /** 通信交換が発生したか */
  isTrade?: boolean;
  /** 現在のマップID（場所進化用） */
  currentMapId?: string;
  /** モンスターが覚えている技ID一覧（技条件進化用） */
  knownMoves?: string[];
  /** パーティのモンスター種族ID一覧（パーティ条件進化用） */
  partySpeciesIds?: string[];
}

/** なつき進化に必要な最低なつき度 */
const FRIENDSHIP_THRESHOLD = 220;

/**
 * 進化条件の文字列を解釈し、条件を満たすかチェックする
 */
function checkCondition(condition: string | undefined, context: EvolutionContext): boolean {
  if (condition === undefined) return true; // 条件なし = レベルのみ

  if (condition.startsWith("item:")) {
    const requiredItemId = condition.slice(5);
    return context.usedItemId === requiredItemId;
  }

  if (condition === "time:day") {
    return context.timeOfDay === "day";
  }

  if (condition === "time:night") {
    return context.timeOfDay === "night";
  }

  if (condition === "friendship") {
    return (context.friendship ?? 0) >= FRIENDSHIP_THRESHOLD;
  }

  if (condition === "trade") {
    return context.isTrade === true;
  }

  if (condition.startsWith("location:")) {
    const requiredMapId = condition.slice(9);
    return context.currentMapId === requiredMapId;
  }

  if (condition.startsWith("move:")) {
    const requiredMoveId = condition.slice(5);
    return (context.knownMoves ?? []).includes(requiredMoveId);
  }

  if (condition.startsWith("party:")) {
    const requiredSpeciesId = condition.slice(6);
    return (context.partySpeciesIds ?? []).includes(requiredSpeciesId);
  }

  return false; // 不明な条件は満たさない
}

/**
 * 進化条件をチェック（配列をイテレートし、条件を満たす最初の進化先を返す）
 * @returns 進化先のspeciesId、または null（進化しない場合）
 */
export function checkEvolution(
  monster: MonsterInstance,
  species: MonsterSpecies,
  context: EvolutionContext = {},
): string | null {
  if (!species.evolvesTo || species.evolvesTo.length === 0) return null;
  for (const evo of species.evolvesTo) {
    if (monster.level >= evo.level && checkCondition(evo.condition, context)) {
      return evo.id;
    }
  }
  return null;
}

/**
 * 進化を実行する
 * - speciesIdを更新
 * - 最大HPの差分を現在HPに加算
 */
export function evolve(
  monster: MonsterInstance,
  oldSpecies: MonsterSpecies,
  newSpecies: MonsterSpecies,
): void {
  const oldMaxHp = calcHp(oldSpecies.baseStats.hp, monster.ivs.hp, monster.evs.hp, monster.level);
  const newMaxHp = calcHp(newSpecies.baseStats.hp, monster.ivs.hp, monster.evs.hp, monster.level);

  monster.speciesId = newSpecies.id;
  // 最大HPの増加分を現在HPに加算
  monster.currentHp = Math.min(newMaxHp, monster.currentHp + (newMaxHp - oldMaxHp));
}
