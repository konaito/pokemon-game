/**
 * イベントスクリプトエンジン (#42)
 * 会話、カットシーン、分岐をスクリプトとして記述・実行する
 */

import type { FlagRequirement, StoryFlags } from "@/engine/state/story-flags";
import { checkFlagRequirement } from "@/engine/state/story-flags";

// ── コマンド定義 ──

/** 会話を表示 */
export interface DialogueCommand {
  type: "dialogue";
  speaker?: string;
  lines: string[];
}

/** ストーリーフラグを設定 */
export interface SetFlagCommand {
  type: "set_flag";
  flag: string;
  value: boolean;
}

/** 条件分岐 */
export interface BranchCommand {
  type: "branch";
  condition: FlagRequirement;
  /** 条件を満たした場合に実行するコマンド列 */
  then: EventCommand[];
  /** 条件を満たさなかった場合に実行するコマンド列 */
  else?: EventCommand[];
}

/** パーティを回復 */
export interface HealCommand {
  type: "heal";
}

/** アイテムを付与 */
export interface GiveItemCommand {
  type: "give_item";
  itemId: string;
  quantity: number;
}

/** バトルを開始 */
export interface BattleCommand {
  type: "battle";
  trainerName: string;
  /** トレーナーのパーティ（speciesIdとlevelのペア配列） */
  party: { speciesId: string; level: number }[];
}

/** プレイヤーを移動 */
export interface MovePlayerCommand {
  type: "move_player";
  mapId: string;
  x: number;
  y: number;
}

/** 待機（演出用） */
export interface WaitCommand {
  type: "wait";
  ms: number;
}

/** 全コマンドの直和型 */
export type EventCommand =
  | DialogueCommand
  | SetFlagCommand
  | BranchCommand
  | HealCommand
  | GiveItemCommand
  | BattleCommand
  | MovePlayerCommand
  | WaitCommand;

/** イベントスクリプト定義 */
export interface EventScript {
  id: string;
  /** スクリプトを実行するための条件（未設定なら常に実行可能） */
  trigger?: FlagRequirement;
  /** コマンド列 */
  commands: EventCommand[];
}

// ── スクリプトランナー ──

/** スクリプト実行時に外部に通知するイベント */
export type EventOutput =
  | { type: "dialogue"; speaker?: string; lines: string[] }
  | { type: "set_flag"; flag: string; value: boolean }
  | { type: "heal" }
  | { type: "give_item"; itemId: string; quantity: number }
  | { type: "battle"; trainerName: string; party: { speciesId: string; level: number }[] }
  | { type: "move_player"; mapId: string; x: number; y: number }
  | { type: "wait"; ms: number };

/**
 * スクリプトが実行可能か判定
 */
export function canTriggerScript(script: EventScript, flags: StoryFlags): boolean {
  if (!script.trigger) return true;
  return checkFlagRequirement(flags, script.trigger);
}

/**
 * コマンド列を平坦化して実行（分岐を解決する）
 * @param commands 実行するコマンド列
 * @param flags 現在のストーリーフラグ（分岐解決に使用）
 * @returns 実行すべきEventOutputのリスト
 */
export function resolveCommands(commands: EventCommand[], flags: StoryFlags): EventOutput[] {
  const outputs: EventOutput[] = [];
  // フラグはスクリプト実行中にも変化する可能性があるので、ミュータブルコピーを使用
  const mutableFlags = { ...flags };

  for (const cmd of commands) {
    switch (cmd.type) {
      case "dialogue":
        outputs.push({ type: "dialogue", speaker: cmd.speaker, lines: cmd.lines });
        break;

      case "set_flag":
        mutableFlags[cmd.flag] = cmd.value;
        outputs.push({ type: "set_flag", flag: cmd.flag, value: cmd.value });
        break;

      case "branch": {
        const conditionMet = checkFlagRequirement(mutableFlags, cmd.condition);
        const branch = conditionMet ? cmd.then : (cmd.else ?? []);
        outputs.push(...resolveCommands(branch, mutableFlags));
        break;
      }

      case "heal":
        outputs.push({ type: "heal" });
        break;

      case "give_item":
        outputs.push({ type: "give_item", itemId: cmd.itemId, quantity: cmd.quantity });
        break;

      case "battle":
        outputs.push({ type: "battle", trainerName: cmd.trainerName, party: cmd.party });
        break;

      case "move_player":
        outputs.push({ type: "move_player", mapId: cmd.mapId, x: cmd.x, y: cmd.y });
        break;

      case "wait":
        outputs.push({ type: "wait", ms: cmd.ms });
        break;
    }
  }

  return outputs;
}

/**
 * スクリプトを実行してイベント出力リストを取得
 * @returns トリガー条件を満たさない場合はnull
 */
export function executeScript(script: EventScript, flags: StoryFlags): EventOutput[] | null {
  if (!canTriggerScript(script, flags)) return null;
  return resolveCommands(script.commands, flags);
}
