import type { MonsterInstance, PartyState } from "@/types";
import { attemptCatch, type CatchCalcInput, type CatchResult } from "./catch-rate";
import { addMonster } from "../monster/party";

/**
 * 捕獲演出フローの結果 (#67)
 */
export interface CaptureFlowResult {
  /** 捕獲判定結果 */
  catchResult: CatchResult;
  /** 演出用メッセージ */
  messages: string[];
  /** 捕獲成功時の格納先 */
  destination?: "party" | "box";
  /** ボックス送りの場合のボックス番号 */
  boxIndex?: number;
}

/** 揺れ回数に対応する演出メッセージ */
function getShakeMessages(ballName: string, shakeCount: number, caught: boolean): string[] {
  const messages: string[] = [];
  messages.push(`${ballName}を投げた！`);

  if (shakeCount >= 1) messages.push("ぽん…");
  if (shakeCount >= 2) messages.push("ぽん…");
  if (shakeCount >= 3) messages.push("ぽん…");

  if (caught) {
    messages.push("やった！ 捕まえた！");
  } else if (shakeCount === 0) {
    messages.push("だめだ！ ボールから出てしまった！");
  } else {
    messages.push("あっ！ もう少しだったのに！");
  }

  return messages;
}

/**
 * 捕獲フローを実行 (#67 + #72)
 * ボール投擲→揺れ判定→成否→パーティ/ボックス追加
 */
export function executeCaptureFlow(
  input: CatchCalcInput,
  target: MonsterInstance,
  partyState: PartyState,
  ballName: string,
  random?: () => number,
): CaptureFlowResult {
  const catchResult = attemptCatch(input, random);
  const messages = getShakeMessages(ballName, catchResult.shakeCount, catchResult.caught);

  if (!catchResult.caught) {
    return { catchResult, messages };
  }

  // 捕獲成功 → パーティ/ボックスに追加 (#72)
  const addResult = addMonster(partyState, target);
  messages.push(
    addResult.destination === "party"
      ? `${target.nickname ?? "モンスター"}をパーティに加えた！`
      : `パーティがいっぱいなので、ボックス${(addResult.boxIndex ?? 0) + 1}に送った！`,
  );

  return {
    catchResult,
    messages,
    destination: addResult.destination,
    boxIndex: addResult.boxIndex,
  };
}
