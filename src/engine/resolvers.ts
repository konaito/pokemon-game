/**
 * Resolver生成 — データ層とエンジン層を接続するファクトリ関数
 */
import type {
  MonsterSpecies,
  MoveDefinition,
  ItemDefinition,
  SpeciesResolver,
  MoveResolver,
} from "@/types";
import type { MapDefinition } from "@/engine/map/map-data";
import { getSpeciesById } from "@/data/monsters";
import { getMoveById } from "@/data/moves";
import { getItemById } from "@/data/items";
import { getMapById } from "@/data/maps";

export type ItemResolver = (itemId: string) => ItemDefinition;
export type MapResolver = (mapId: string) => MapDefinition;

/** 種族データリゾルバを生成 */
export function createSpeciesResolver(): SpeciesResolver {
  return (speciesId: string): MonsterSpecies => {
    const species = getSpeciesById(speciesId);
    if (!species) throw new Error(`Unknown species: ${speciesId}`);
    return species;
  };
}

/** 技データリゾルバを生成 */
export function createMoveResolver(): MoveResolver {
  return (moveId: string): MoveDefinition => {
    const move = getMoveById(moveId);
    if (!move) throw new Error(`Unknown move: ${moveId}`);
    return move;
  };
}

/** アイテムデータリゾルバを生成 */
export function createItemResolver(): ItemResolver {
  return (itemId: string): ItemDefinition => {
    const item = getItemById(itemId);
    if (!item) throw new Error(`Unknown item: ${itemId}`);
    return item;
  };
}

/** マップデータリゾルバを生成 */
export function createMapResolver(): MapResolver {
  return (mapId: string): MapDefinition => {
    const map = getMapById(mapId);
    if (!map) throw new Error(`Unknown map: ${mapId}`);
    return map;
  };
}
