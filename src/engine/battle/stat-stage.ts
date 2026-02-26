/**
 * 能力変化ステージ管理
 * ポケモン本家と同様に -6 〜 +6 のステージで能力倍率を管理
 */

import type { BaseStats } from "@/types";

/** 能力変化ステージ（HPを除く5つのステータス） */
export type StatStages = Record<Exclude<keyof BaseStats, "hp">, number>;

/** ステージごとの倍率テーブル */
const STAGE_MULTIPLIERS: Record<number, number> = {
  "-6": 2 / 8,
  "-5": 2 / 7,
  "-4": 2 / 6,
  "-3": 2 / 5,
  "-2": 2 / 4,
  "-1": 2 / 3,
  "0": 1,
  "1": 3 / 2,
  "2": 4 / 2,
  "3": 5 / 2,
  "4": 6 / 2,
  "5": 7 / 2,
  "6": 8 / 2,
};

/** 初期ステージ（全て0） */
export function createStatStages(): StatStages {
  return { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 };
}

/** ステージを -6〜+6 にクランプ */
function clampStage(stage: number): number {
  return Math.max(-6, Math.min(6, stage));
}

/**
 * 能力変化を適用し、変化後のステージを返す
 * @returns [更新後のステージ, メッセージリスト]
 */
export function applyStatChanges(
  stages: StatStages,
  changes: Partial<Record<keyof BaseStats, number>>,
  targetName: string,
): [StatStages, string[]] {
  const newStages = { ...stages };
  const messages: string[] = [];

  for (const [stat, delta] of Object.entries(changes) as [keyof BaseStats, number][]) {
    if (stat === "hp" || delta === 0) continue;

    const current = newStages[stat];
    const newValue = clampStage(current + delta);

    if (newValue === current) {
      // 既に上限/下限
      if (delta > 0) {
        messages.push(`${targetName}の${getStatName(stat)}はもう上がらない！`);
      } else {
        messages.push(`${targetName}の${getStatName(stat)}はもう下がらない！`);
      }
    } else {
      newStages[stat] = newValue;
      const absDelta = Math.abs(delta);
      if (delta > 0) {
        const intensity = absDelta >= 3 ? "ぐーんと" : absDelta >= 2 ? "ぐぐっと" : "";
        messages.push(`${targetName}の${getStatName(stat)}が${intensity}上がった！`);
      } else {
        const intensity = absDelta >= 3 ? "がくーんと" : absDelta >= 2 ? "がくっと" : "";
        messages.push(`${targetName}の${getStatName(stat)}が${intensity}下がった！`);
      }
    }
  }

  return [newStages, messages];
}

/** ステージ倍率を取得 */
export function getStageMultiplier(stage: number): number {
  return STAGE_MULTIPLIERS[clampStage(stage)] ?? 1;
}

/** ステータス名の日本語表示 */
function getStatName(stat: keyof BaseStats): string {
  switch (stat) {
    case "atk": return "こうげき";
    case "def": return "ぼうぎょ";
    case "spAtk": return "とくこう";
    case "spDef": return "とくぼう";
    case "speed": return "すばやさ";
    case "hp": return "HP";
  }
}
