/**
 * モンスターデータを public/monsters.json に出力するスクリプト
 *
 * 使い方: bun scripts/generate-monsters-json.ts
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

import { STARTERS } from "@/data/monsters/starters";
import { EARLY_MONSTERS } from "@/data/monsters/early-monsters";
import { MID_MONSTERS } from "@/data/monsters/mid-monsters";
import { LATE_MONSTERS } from "@/data/monsters/late-monsters";
import { LEGENDARY_MONSTERS } from "@/data/monsters/legendary";
import { ALL_SPECIES, getSpeciesById } from "@/data/monsters/index";
import type { MonsterSpecies } from "@/types";

// 各ファイルのモンスターIDセットを作って area を判定する
const starterIds = new Set(STARTERS.map((s) => s.id));
const earlyIds = new Set(EARLY_MONSTERS.map((s) => s.id));
const midIds = new Set(MID_MONSTERS.map((s) => s.id));
const lateIds = new Set(LATE_MONSTERS.map((s) => s.id));
const legendaryIds = new Set(LEGENDARY_MONSTERS.map((s) => s.id));

function getArea(id: string): "starter" | "early" | "mid" | "late" | "legendary" {
  if (starterIds.has(id)) return "starter";
  if (earlyIds.has(id)) return "early";
  if (midIds.has(id)) return "mid";
  if (lateIds.has(id)) return "late";
  if (legendaryIds.has(id)) return "legendary";
  throw new Error(`Unknown area for monster: ${id}`);
}

interface PokedexEntry {
  num: number;
  id: string;
  name: string;
  types: string[];
  stats: {
    hp: number;
    atk: number;
    def: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  evo: { name: string; lv: number }[];
  area: string;
  legendary: boolean;
}

const pokedex: PokedexEntry[] = ALL_SPECIES.map((species: MonsterSpecies, index: number) => {
  const area = getArea(species.id);

  // 進化先の名前を解決
  const evo: { name: string; lv: number }[] = (species.evolvesTo ?? []).map((e) => {
    const target = getSpeciesById(e.id);
    if (!target) {
      throw new Error(`Evolution target not found: ${e.id} (from ${species.id})`);
    }
    return { name: target.name, lv: e.level };
  });

  return {
    num: index + 1,
    id: species.id,
    name: species.name,
    types: [...species.types],
    stats: { ...species.baseStats },
    evo,
    area,
    legendary: legendaryIds.has(species.id),
  };
});

const outPath = resolve(import.meta.dirname!, "..", "public", "monsters.json");
writeFileSync(outPath, JSON.stringify(pokedex, null, 2) + "\n", "utf-8");

console.log(`Generated ${pokedex.length} monsters -> ${outPath}`);
