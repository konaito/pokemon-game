import type {
  MonsterInstance,
  MonsterSpecies,
  MoveResolver,
  IVs,
  BaseStats,
  EggGroup,
  MoveId,
} from "@/types";
import { randomNature } from "@/engine/monster/nature";
import { generateUid } from "@/engine/monster/uid";

/** 育て屋の状態 */
export interface DaycareState {
  /** 預けたモンスター（最大2体） */
  deposited: [MonsterInstance | null, MonsterInstance | null];
  /** 発見されたタマゴ（まだ受け取っていない） */
  pendingEgg: MonsterInstance | null;
}

/** 育て屋の初期状態 */
export function createDaycareState(): DaycareState {
  return {
    deposited: [null, null],
    pendingEgg: null,
  };
}

/**
 * 2体のモンスターが互換性のあるタマゴグループかどうか判定
 * undiscoveredグループ同士は不可
 */
export function areCompatible(species1: MonsterSpecies, species2: MonsterSpecies): boolean {
  const groups1 = species1.eggGroups ?? [];
  const groups2 = species2.eggGroups ?? [];

  if (groups1.length === 0 || groups2.length === 0) return false;
  if (groups1.includes("undiscovered") || groups2.includes("undiscovered")) return false;

  // 共通のタマゴグループがあるか
  return groups1.some((g) => groups2.includes(g));
}

/**
 * タマゴ発見確率を計算
 * 同種族: 50%, 異種族（同グループ）: 20%
 */
export function getEggChance(species1: MonsterSpecies, species2: MonsterSpecies): number {
  if (!areCompatible(species1, species2)) return 0;
  if (species1.id === species2.id) return 50;
  return 20;
}

/**
 * タマゴ発見判定（歩数ごとに呼ばれる想定）
 * 256歩ごとに判定
 */
export function checkEggFound(
  species1: MonsterSpecies,
  species2: MonsterSpecies,
  random: () => number = Math.random,
): boolean {
  const chance = getEggChance(species1, species2);
  if (chance === 0) return false;
  return random() * 100 < chance;
}

/** IV遺伝で継承するステータスキーの配列 */
const IV_KEYS: (keyof BaseStats)[] = ["hp", "atk", "def", "spAtk", "spDef", "speed"];

/**
 * 個体値遺伝: 親2体から3つのIVをランダムに継承、残りはランダム
 */
export function inheritIVs(
  parent1: MonsterInstance,
  parent2: MonsterInstance,
  random: () => number = Math.random,
): IVs {
  const result: IVs = {
    hp: Math.floor(random() * 32),
    atk: Math.floor(random() * 32),
    def: Math.floor(random() * 32),
    spAtk: Math.floor(random() * 32),
    spDef: Math.floor(random() * 32),
    speed: Math.floor(random() * 32),
  };

  // 3つのステータスをランダムに選んで親から遺伝
  const available = [...IV_KEYS];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(random() * available.length);
    const stat = available.splice(idx, 1)[0];
    // どちらの親から遺伝するかランダム
    const parent = random() < 0.5 ? parent1 : parent2;
    result[stat] = parent.ivs[stat];
  }

  return result;
}

/**
 * 遺伝技を計算: 父親が持つ技のうち、子のeggMovesリストに含まれるもの
 */
export function getInheritedMoves(
  parent1Moves: MoveId[],
  parent2Moves: MoveId[],
  childEggMoves: MoveId[],
): MoveId[] {
  if (childEggMoves.length === 0) return [];

  const parentMoves = new Set([...parent1Moves, ...parent2Moves]);
  return childEggMoves.filter((m) => parentMoves.has(m));
}

/**
 * タマゴを生成する
 * 子は母親（parent1）の基本形態
 */
export function generateEgg(
  parent1: MonsterInstance,
  parent2: MonsterInstance,
  childSpecies: MonsterSpecies,
  moveResolver: MoveResolver,
  random: () => number = Math.random,
): MonsterInstance {
  const nature = randomNature(random);
  const ivs = inheritIVs(parent1, parent2, random);
  const evs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 };

  // 遺伝技を計算
  const parent1MoveIds = parent1.moves.map((m) => m.moveId);
  const parent2MoveIds = parent2.moves.map((m) => m.moveId);
  const inheritedMoves = getInheritedMoves(
    parent1MoveIds,
    parent2MoveIds,
    childSpecies.eggMoves ?? [],
  );

  // レベル1で覚える技
  const baseMoves = childSpecies.learnset.filter((e) => e.level <= 1).map((e) => e.moveId);

  // 遺伝技 + レベル1技から最大4つ
  const allMoves = [...inheritedMoves, ...baseMoves.filter((m) => !inheritedMoves.includes(m))];
  const finalMoves = allMoves.slice(0, 4).map((moveId) => {
    const moveDef = moveResolver(moveId);
    return { moveId, currentPp: moveDef.pp };
  });

  // 技がない場合はたいあたりをデフォルトに
  if (finalMoves.length === 0) {
    const defaultMove = moveResolver("tackle");
    finalMoves.push({ moveId: "tackle", currentPp: defaultMove.pp });
  }

  const hatchSteps = childSpecies.hatchSteps ?? 5120;

  return {
    uid: generateUid(),
    speciesId: childSpecies.id,
    level: 1,
    exp: 0,
    nature,
    ivs,
    evs,
    currentHp: 1, // タマゴ中はHP無意味、孵化時に再計算
    moves: finalMoves,
    status: null,
    isEgg: true,
    eggSteps: hatchSteps,
  };
}

/**
 * 歩数によるタマゴ孵化処理
 * @returns 孵化したモンスター、またはnull（まだ孵化していない）
 */
export function processEggStep(
  egg: MonsterInstance,
  steps: number = 1,
): { hatched: boolean; remaining: number } {
  if (!egg.isEgg || egg.eggSteps === undefined) {
    return { hatched: false, remaining: 0 };
  }

  egg.eggSteps = Math.max(0, egg.eggSteps - steps);

  if (egg.eggSteps <= 0) {
    return { hatched: true, remaining: 0 };
  }

  return { hatched: false, remaining: egg.eggSteps };
}

/**
 * タマゴを孵化させる（isEggフラグ解除 + HP再計算）
 */
export function hatchEgg(egg: MonsterInstance, species: MonsterSpecies, maxHp: number): void {
  egg.isEgg = false;
  egg.eggSteps = undefined;
  egg.currentHp = maxHp;
}

/**
 * 育て屋にモンスターを預ける
 */
export function depositMonster(
  state: DaycareState,
  monster: MonsterInstance,
): { success: boolean; slot: number; message: string } {
  if (state.deposited[0] === null) {
    state.deposited[0] = monster;
    return { success: true, slot: 0, message: "1番目のスロットに預けました" };
  }
  if (state.deposited[1] === null) {
    state.deposited[1] = monster;
    return { success: true, slot: 1, message: "2番目のスロットに預けました" };
  }
  return { success: false, slot: -1, message: "育て屋はいっぱいです" };
}

/**
 * 育て屋からモンスターを引き取る
 */
export function withdrawMonster(
  state: DaycareState,
  slot: number,
): { success: boolean; monster: MonsterInstance | null; message: string } {
  if (slot < 0 || slot > 1) {
    return { success: false, monster: null, message: "無効なスロットです" };
  }
  const monster = state.deposited[slot];
  if (!monster) {
    return { success: false, monster: null, message: "このスロットにはモンスターがいません" };
  }
  state.deposited[slot] = null;
  return { success: true, monster, message: "モンスターを引き取りました" };
}

/**
 * 育て屋のタマゴ受け取り
 */
export function collectEgg(state: DaycareState): {
  success: boolean;
  egg: MonsterInstance | null;
  message: string;
} {
  if (!state.pendingEgg) {
    return { success: false, egg: null, message: "タマゴは見つかっていません" };
  }
  const egg = state.pendingEgg;
  state.pendingEgg = null;
  return { success: true, egg, message: "タマゴを受け取りました！" };
}
