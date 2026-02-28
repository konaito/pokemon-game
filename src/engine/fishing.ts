import type { FishingRod, MonsterInstance, SpeciesResolver, MoveResolver } from "@/types";
import type { MapDefinition, FishingEncounterEntry, TileType } from "@/engine/map/map-data";
import { generateWildMonster } from "@/engine/map/encounter";
import type { EncounterEntry } from "@/engine/map/map-data";

/**
 * 釣り竿の日本語名を取得
 */
export function getFishingRodName(rod: FishingRod): string {
  switch (rod) {
    case "old_rod":
      return "ボロのつりざお";
    case "good_rod":
      return "いいつりざお";
    case "super_rod":
      return "すごいつりざお";
  }
}

/**
 * 指定位置が水タイルに隣接しているか判定
 */
export function isAdjacentToWater(tiles: TileType[][], x: number, y: number): boolean {
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (ny >= 0 && ny < tiles.length && nx >= 0 && nx < tiles[0].length) {
      if (tiles[ny][nx] === "water") return true;
    }
  }

  return false;
}

/**
 * 釣りができるか判定
 */
export function canFish(map: MapDefinition, x: number, y: number, rod: FishingRod): boolean {
  if (!map.fishingEncounters || map.fishingEncounters.length === 0) return false;
  if (!isAdjacentToWater(map.tiles, x, y)) return false;
  // 竿に対応するエントリがあるか
  return map.fishingEncounters.some((e) => e.rod === rod);
}

/**
 * 釣りのヒット判定（竿によって成功率が異なる）
 */
export function rollFishingHit(rod: FishingRod, random: () => number = Math.random): boolean {
  // ボロ: 50%, いい: 75%, すごい: 100%
  const hitRate = rod === "old_rod" ? 0.5 : rod === "good_rod" ? 0.75 : 1.0;
  return random() < hitRate;
}

/**
 * 釣りエンカウントテーブルから竿に対応するエントリを抽選
 */
export function rollFishingEncounter(
  entries: FishingEncounterEntry[],
  rod: FishingRod,
  random: () => number = Math.random,
): FishingEncounterEntry | null {
  const rodEntries = entries.filter((e) => e.rod === rod);
  if (rodEntries.length === 0) return null;

  const totalWeight = rodEntries.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight <= 0) return null;

  let roll = random() * totalWeight;
  for (const entry of rodEntries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }

  return rodEntries[rodEntries.length - 1];
}

/**
 * 釣り処理のメインフロー
 * @returns { hit: boolean, monster?: MonsterInstance, messages: string[] }
 */
export function processFishing(
  map: MapDefinition,
  x: number,
  y: number,
  rod: FishingRod,
  speciesResolver: SpeciesResolver,
  moveResolver: MoveResolver,
  random: () => number = Math.random,
): { hit: boolean; monster: MonsterInstance | null; messages: string[] } {
  const messages: string[] = [];
  const rodName = getFishingRodName(rod);

  if (!canFish(map, x, y, rod)) {
    messages.push("ここでは釣りができない…");
    return { hit: false, monster: null, messages };
  }

  messages.push(`${rodName}を使った！`);

  // ヒット判定
  if (!rollFishingHit(rod, random)) {
    messages.push("…あたりがない…");
    return { hit: false, monster: null, messages };
  }

  // エンカウント抽選
  const entry = rollFishingEncounter(map.fishingEncounters!, rod, random);
  if (!entry) {
    messages.push("…あたりがない…");
    return { hit: false, monster: null, messages };
  }

  messages.push("…！ ヒット！");

  // モンスター生成（FishingEncounterEntryをEncounterEntry互換に変換）
  const encounterEntry: EncounterEntry = {
    speciesId: entry.speciesId,
    minLevel: entry.minLevel,
    maxLevel: entry.maxLevel,
    weight: entry.weight,
  };

  const monster = generateWildMonster(encounterEntry, speciesResolver, moveResolver, random);
  const species = speciesResolver(entry.speciesId);
  messages.push(`野生の${species.name}が釣れた！`);

  return { hit: true, monster, messages };
}
