/**
 * 釣りシステム (#187)
 * 水タイルで釣り竿を使って水系モンスターを捕獲
 */
import type { MapId } from "@/types";

/** 釣り竿のランク */
export type RodRank = "old" | "good" | "super";

/** 釣り竿の定義 */
export interface FishingRod {
  id: string;
  rank: RodRank;
  name: string;
  description: string;
  /** ヒット確率 (0-1) */
  hitRate: number;
  /** 出現するモンスターの最低レベル補正 */
  levelBonus: number;
}

/** 釣りエンカウントテーブルのエントリ */
export interface FishingEncounter {
  speciesId: string;
  minLevel: number;
  maxLevel: number;
  weight: number;
  /** この竿ランク以上で出現 */
  minRod: RodRank;
}

/** マップごとの釣りテーブル */
export interface FishingTable {
  mapId: MapId;
  encounters: FishingEncounter[];
}

/** 釣り竿データ */
export const FISHING_RODS: FishingRod[] = [
  {
    id: "old_rod",
    rank: "old",
    name: "ボロのつりざお",
    description: "古びた釣り竿。弱い水モンスターが釣れる。",
    hitRate: 0.5,
    levelBonus: 0,
  },
  {
    id: "good_rod",
    rank: "good",
    name: "いいつりざお",
    description: "そこそこの釣り竿。中程度の水モンスターが釣れる。",
    hitRate: 0.7,
    levelBonus: 5,
  },
  {
    id: "super_rod",
    rank: "super",
    name: "すごいつりざお",
    description: "最高の釣り竿。レアな水モンスターも釣れる。",
    hitRate: 0.9,
    levelBonus: 10,
  },
];

/** 竿ランクの序列 */
const ROD_ORDER: RodRank[] = ["old", "good", "super"];

/**
 * 竿ランクが十分か判定
 */
export function isRodSufficient(rodRank: RodRank, requiredRank: RodRank): boolean {
  return ROD_ORDER.indexOf(rodRank) >= ROD_ORDER.indexOf(requiredRank);
}

/**
 * 釣り竿をIDから取得
 */
export function getRodById(id: string): FishingRod | undefined {
  return FISHING_RODS.find((r) => r.id === id);
}

/**
 * 釣りのヒット判定
 */
export function rollFishingHit(rod: FishingRod, random: () => number = Math.random): boolean {
  return random() < rod.hitRate;
}

/**
 * 釣りテーブルから竿ランクに応じたエンカウントを抽出
 */
export function getAvailableEncounters(table: FishingTable, rodRank: RodRank): FishingEncounter[] {
  return table.encounters.filter((e) => isRodSufficient(rodRank, e.minRod));
}

/**
 * 重み付きランダム選択でエンカウントを決定
 */
export function selectFishingEncounter(
  encounters: FishingEncounter[],
  random: () => number = Math.random,
): FishingEncounter | null {
  if (encounters.length === 0) return null;

  const totalWeight = encounters.reduce((sum, e) => sum + e.weight, 0);
  let roll = random() * totalWeight;

  for (const encounter of encounters) {
    roll -= encounter.weight;
    if (roll <= 0) return encounter;
  }

  return encounters[encounters.length - 1];
}

/**
 * エンカウントからレベルを決定
 */
export function rollFishingLevel(
  encounter: FishingEncounter,
  rod: FishingRod,
  random: () => number = Math.random,
): number {
  const min = encounter.minLevel + rod.levelBonus;
  const max = encounter.maxLevel + rod.levelBonus;
  return Math.floor(random() * (max - min + 1)) + min;
}

/** 釣りメッセージ */
export function getFishingMessage(phase: "cast" | "hit" | "miss" | "nothing"): string {
  switch (phase) {
    case "cast":
      return "つりざおを水面に投げ入れた…";
    case "hit":
      return "おっ！何かがかかったぞ！";
    case "miss":
      return "…ダメだ、逃げられた。";
    case "nothing":
      return "…何も釣れなかった。";
  }
}

// ── デフォルトの釣りテーブル ──

export const DEFAULT_FISHING_TABLES: FishingTable[] = [
  {
    mapId: "kawasemi_city",
    encounters: [
      { speciesId: "kawadojou", minLevel: 10, maxLevel: 15, weight: 40, minRod: "old" },
      { speciesId: "shizukumo", minLevel: 12, maxLevel: 18, weight: 30, minRod: "good" },
      { speciesId: "umihebi", minLevel: 20, maxLevel: 30, weight: 10, minRod: "super" },
    ],
  },
  {
    mapId: "mizuki_port",
    encounters: [
      { speciesId: "kawadojou", minLevel: 15, maxLevel: 20, weight: 35, minRod: "old" },
      { speciesId: "shizukumo", minLevel: 18, maxLevel: 25, weight: 30, minRod: "old" },
      { speciesId: "namikozou", minLevel: 20, maxLevel: 28, weight: 20, minRod: "good" },
      { speciesId: "umihebi", minLevel: 30, maxLevel: 40, weight: 15, minRod: "super" },
    ],
  },
];
