/**
 * モンスターデータのエントリーポイント
 */
import type { MonsterSpecies } from "@/types";
import { STARTERS } from "./starters";
import { EARLY_MONSTERS } from "./early-monsters";
import { MID_MONSTERS } from "./mid-monsters";
import { LATE_MONSTERS } from "./late-monsters";
import { LEGENDARY_MONSTERS } from "./legendary";
import { NEW_MONSTERS } from "./new-monsters";

/** 全モンスター種族データ */
export const ALL_SPECIES: MonsterSpecies[] = [
  ...STARTERS,
  ...EARLY_MONSTERS,
  ...MID_MONSTERS,
  ...LATE_MONSTERS,
  ...LEGENDARY_MONSTERS,
  ...NEW_MONSTERS,
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
export { MID_MONSTERS } from "./mid-monsters";
export { LATE_MONSTERS } from "./late-monsters";
export { LEGENDARY_MONSTERS } from "./legendary";
export { NEW_MONSTERS } from "./new-monsters";
