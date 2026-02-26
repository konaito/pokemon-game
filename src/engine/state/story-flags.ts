/**
 * ストーリーフラグ管理システム (#39)
 * イベント進行状態の条件判定・操作ユーティリティ
 */

/** ストーリーフラグの型（GameState.storyFlagsと同一） */
export type StoryFlags = Record<string, boolean>;

/**
 * フラグ条件: 単一フラグのチェック
 * - string: そのフラグがtrueであること
 * - { flag: string; value: boolean }: 指定の値であること
 */
export type FlagCondition =
  | string
  | { flag: string; value: boolean };

/**
 * 複合フラグ条件
 * - 配列はAND条件（すべてを満たす）
 */
export type FlagRequirement = FlagCondition | FlagCondition[];

/**
 * 単一のフラグ条件を評価する
 */
function evaluateCondition(flags: StoryFlags, condition: FlagCondition): boolean {
  if (typeof condition === "string") {
    return flags[condition] === true;
  }
  return (flags[condition.flag] ?? false) === condition.value;
}

/**
 * フラグ条件を満たしているか判定
 * 配列はAND条件（すべてを満たす必要がある）
 */
export function checkFlagRequirement(flags: StoryFlags, requirement: FlagRequirement): boolean {
  if (Array.isArray(requirement)) {
    return requirement.every((cond) => evaluateCondition(flags, cond));
  }
  return evaluateCondition(flags, requirement);
}

/**
 * 複数のフラグを一度に設定する
 * @returns 新しいstoryFlagsオブジェクト（イミュータブル）
 */
export function setFlags(flags: StoryFlags, updates: Record<string, boolean>): StoryFlags {
  return { ...flags, ...updates };
}

/**
 * 指定フラグがtrueか確認する（ショートカット）
 */
export function hasFlag(flags: StoryFlags, flag: string): boolean {
  return flags[flag] === true;
}

/**
 * 複数フラグがすべてtrueか確認する
 */
export function hasAllFlags(flags: StoryFlags, flagNames: string[]): boolean {
  return flagNames.every((f) => flags[f] === true);
}

/**
 * 複数フラグのいずれかがtrueか確認する
 */
export function hasAnyFlag(flags: StoryFlags, flagNames: string[]): boolean {
  return flagNames.some((f) => flags[f] === true);
}
