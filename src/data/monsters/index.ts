/**
 * モンスターデータのエントリーポイント
 */
import type { MonsterSpecies } from "@/types";
import { STARTERS } from "./starters";
import { EARLY_MONSTERS } from "./early-monsters";
import { LEGENDARY_MONSTERS } from "./legendary";

/** 全モンスター種族データ */
export const ALL_SPECIES: MonsterSpecies[] = [
  ...STARTERS,
  ...EARLY_MONSTERS,
  ...LEGENDARY_MONSTERS,
];

/** IDからモンスター種族を取得 */
export function getSpeciesById(id: string): MonsterSpecies | undefined {
  return ALL_SPECIES.find((s) => s.id === id);
}

/** 全モンスターIDの一覧 */
export function getAllSpeciesIds(): string[] {
  return ALL_SPECIES.map((s) => s.id);
}

export { STARTERS } from "./starters";
export { EARLY_MONSTERS } from "./early-monsters";
export { LEGENDARY_MONSTERS } from "./legendary";
