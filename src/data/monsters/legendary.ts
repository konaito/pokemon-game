/**
 * 伝説のモンスターデータ
 * オモイデ（記憶の守護者）とワスレヌ（忘却の存在）
 */
import type { MonsterSpecies } from "@/types";

export const LEGENDARY_MONSTERS: MonsterSpecies[] = [
  {
    id: "omoide",
    name: "オモイデ",
    types: ["psychic", "fairy"],
    baseStats: { hp: 100, atk: 65, def: 90, spAtk: 130, spDef: 120, speed: 95 },
    baseExpYield: 306,
    expGroup: "slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "gust" },
    ],
  },
  {
    id: "wasurenu",
    name: "ワスレヌ",
    types: ["psychic", "dark"],
    baseStats: { hp: 100, atk: 130, def: 80, spAtk: 120, spDef: 80, speed: 90 },
    baseExpYield: 306,
    expGroup: "slow",
    learnset: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "bite" },
    ],
  },
];
