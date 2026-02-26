import type { NatureId } from "@/types";

/** ステータス名（HP除く） */
type StatName = "atk" | "def" | "spAtk" | "spDef" | "speed";

/** 性格による上昇/下降ステータスのマッピング */
const NATURE_TABLE: Record<NatureId, { up: StatName | null; down: StatName | null }> = {
  // 無補正（対角線）
  hardy: { up: null, down: null },
  docile: { up: null, down: null },
  serious: { up: null, down: null },
  bashful: { up: null, down: null },
  quirky: { up: null, down: null },
  // atk↑
  lonely: { up: "atk", down: "def" },
  brave: { up: "atk", down: "speed" },
  adamant: { up: "atk", down: "spAtk" },
  naughty: { up: "atk", down: "spDef" },
  // def↑
  bold: { up: "def", down: "atk" },
  relaxed: { up: "def", down: "speed" },
  impish: { up: "def", down: "spAtk" },
  lax: { up: "def", down: "spDef" },
  // speed↑
  timid: { up: "speed", down: "atk" },
  hasty: { up: "speed", down: "def" },
  jolly: { up: "speed", down: "spAtk" },
  naive: { up: "speed", down: "spDef" },
  // spAtk↑
  modest: { up: "spAtk", down: "atk" },
  mild: { up: "spAtk", down: "def" },
  quiet: { up: "spAtk", down: "speed" },
  rash: { up: "spAtk", down: "spDef" },
  // spDef↑
  calm: { up: "spDef", down: "atk" },
  gentle: { up: "spDef", down: "def" },
  sassy: { up: "spDef", down: "speed" },
  careful: { up: "spDef", down: "spAtk" },
};

/** 全25種類の性格IDリスト */
export const ALL_NATURES: NatureId[] = Object.keys(NATURE_TABLE) as NatureId[];

/**
 * 性格によるステータス補正値を返す
 * 上昇ステータスは1.1、下降ステータスは0.9、それ以外は1.0
 */
export function getNatureModifiers(nature: NatureId): Record<StatName, number> {
  const { up, down } = NATURE_TABLE[nature];
  const mods: Record<StatName, number> = {
    atk: 1.0,
    def: 1.0,
    spAtk: 1.0,
    spDef: 1.0,
    speed: 1.0,
  };
  if (up) mods[up] = 1.1;
  if (down) mods[down] = 0.9;
  return mods;
}

/**
 * ランダムに性格を選択
 */
export function randomNature(random: () => number = Math.random): NatureId {
  return ALL_NATURES[Math.floor(random() * ALL_NATURES.length)];
}
