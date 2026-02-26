import type { StatusCondition } from "@/types";

/**
 * 捕獲率計算エンジン (#59)
 *
 * 公式（Gen III+）に準拠:
 *   a = ((3*maxHp - 2*currentHp) * catchRate * ballModifier) / (3*maxHp) * statusModifier
 *   揺れ判定: shakeCheck = 1048560 / sqrt(sqrt(16711680 / a))
 *   3回連続で乱数(0〜65535)がshakeCheck以下なら捕獲成功
 */

/** 状態異常による捕獲率ボーナス */
function getStatusModifier(status: StatusCondition | null): number {
  switch (status) {
    case "sleep":
    case "freeze":
      return 2;
    case "paralysis":
    case "poison":
    case "burn":
      return 1.5;
    default:
      return 1;
  }
}

export interface CatchCalcInput {
  /** モンスターの最大HP */
  maxHp: number;
  /** モンスターの現在HP */
  currentHp: number;
  /** 種族の捕獲率 (1-255) */
  baseCatchRate: number;
  /** ボールの補正倍率 */
  ballModifier: number;
  /** 状態異常 */
  status: StatusCondition | null;
}

export interface CatchResult {
  /** 捕獲成功したか */
  caught: boolean;
  /** ボールが揺れた回数 (0-3)。3なら捕獲成功 */
  shakeCount: number;
}

/**
 * 捕獲率の「a」値を計算
 * a = ((3*maxHp - 2*currentHp) * catchRate * ballModifier) / (3*maxHp) * statusModifier
 */
export function calcCatchValue(input: CatchCalcInput): number {
  const { maxHp, currentHp, baseCatchRate, ballModifier, status } = input;
  const statusMod = getStatusModifier(status);

  const a = ((3 * maxHp - 2 * currentHp) * baseCatchRate * ballModifier * statusMod) / (3 * maxHp);

  return Math.min(255, Math.max(1, Math.floor(a)));
}

/**
 * 揺れ判定の閾値を計算
 * shakeCheck = 1048560 / sqrt(sqrt(16711680 / a))
 */
export function calcShakeThreshold(a: number): number {
  if (a >= 255) return 65536; // 確定捕獲
  return Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / a)));
}

/**
 * 捕獲判定を実行
 * @param input 捕獲計算の入力
 * @param random 乱数関数 (0-65535の整数を返す)。テスト用にDI可能
 */
export function attemptCatch(
  input: CatchCalcInput,
  random: () => number = () => Math.floor(Math.random() * 65536),
): CatchResult {
  // マスターボール相当（255以上）は確定捕獲
  if (input.ballModifier >= 255) {
    return { caught: true, shakeCount: 3 };
  }

  const a = calcCatchValue(input);
  const threshold = calcShakeThreshold(a);

  let shakeCount = 0;
  for (let i = 0; i < 3; i++) {
    if (random() < threshold) {
      shakeCount++;
    } else {
      break;
    }
  }

  return { caught: shakeCount === 3, shakeCount };
}
