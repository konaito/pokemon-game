/**
 * マップデータのエントリーポイント
 */
import type { MapDefinition } from "@/engine/map/map-data";
import { WASUREMACHI } from "./wasuremachi";
import { ROUTE_1 } from "./route-1";
import { HAJIMARI_FOREST } from "./hajimari-forest";
import { ADDITIONAL_MAPS } from "./all-maps";

/** 全マップデータ（IDでキーイング） */
export const ALL_MAPS: Record<string, MapDefinition> = {
  wasuremachi: WASUREMACHI,
  "route-1": ROUTE_1,
  "hajimari-forest": HAJIMARI_FOREST,
  ...ADDITIONAL_MAPS,
};

/** IDからマップを取得 */
export function getMapById(id: string): MapDefinition | undefined {
  return ALL_MAPS[id];
}

/** 全マップIDの一覧 */
export function getAllMapIds(): string[] {
  return Object.keys(ALL_MAPS);
}

export { WASUREMACHI } from "./wasuremachi";
export { ROUTE_1 } from "./route-1";
export { HAJIMARI_FOREST } from "./hajimari-forest";
export { ADDITIONAL_MAPS } from "./all-maps";
