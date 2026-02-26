import type { MonsterInstance } from "@/types";
import type { MapDefinition, EncounterEntry } from "./map-data";

/**
 * エンカウントシステム (#34)
 * 草むら判定、出現テーブル、出現率による野生モンスター生成
 */

/**
 * 草むらでエンカウントが発生するか判定
 * @param encounterRate マップのエンカウント率 (0-100)
 * @param random 乱数関数（テスト用DI）
 */
export function shouldEncounter(
  encounterRate: number,
  random: () => number = Math.random,
): boolean {
  if (encounterRate <= 0) return false;
  return random() * 100 < encounterRate;
}

/**
 * 出現テーブルからモンスターを抽選
 * @param entries 出現テーブル
 * @param random 乱数関数（テスト用DI）
 * @returns 選ばれた出現エントリ、またはnull（テーブルが空の場合）
 */
export function rollEncounter(
  entries: EncounterEntry[],
  random: () => number = Math.random,
): EncounterEntry | null {
  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight <= 0) return null;

  let roll = random() * totalWeight;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }

  return entries[entries.length - 1];
}

/**
 * 出現レベルを決定
 * @param minLevel 最低レベル
 * @param maxLevel 最高レベル
 * @param random 乱数関数（テスト用DI）
 */
export function rollLevel(
  minLevel: number,
  maxLevel: number,
  random: () => number = Math.random,
): number {
  return minLevel + Math.floor(random() * (maxLevel - minLevel + 1));
}

/**
 * 野生モンスターのインスタンスを生成
 * @param entry 出現テーブルエントリ
 * @param random 乱数関数（テスト用DI）
 */
export function generateWildMonster(
  entry: EncounterEntry,
  random: () => number = Math.random,
): MonsterInstance {
  const level = rollLevel(entry.minLevel, entry.maxLevel, random);

  // 野生モンスターのIVはランダム (0-31)
  const rollIv = () => Math.floor(random() * 32);

  return {
    speciesId: entry.speciesId,
    level,
    exp: 0,
    ivs: {
      hp: rollIv(),
      atk: rollIv(),
      def: rollIv(),
      spAtk: rollIv(),
      spDef: rollIv(),
      speed: rollIv(),
    },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 0, // 後でmaxHpCalcで設定する
    moves: [], // 後でspeciesのlearnsetから設定する
    status: null,
  };
}

/**
 * マップ上の草むらタイル踏破時のエンカウント処理
 * @returns 出現したモンスターのインスタンス、またはnull（エンカウント発生しなかった場合）
 */
export function processEncounter(
  map: MapDefinition,
  random: () => number = Math.random,
): MonsterInstance | null {
  if (!shouldEncounter(map.encounterRate, random)) return null;

  const entry = rollEncounter(map.encounters, random);
  if (!entry) return null;

  return generateWildMonster(entry, random);
}
