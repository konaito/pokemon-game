import type { MonsterInstance, MoveDefinition } from "@/types";
import { healParty } from "../monster/party";

/**
 * 回復施設（ポケモンセンター相当）(#50)
 * パーティのHP・PP・状態異常を全回復する
 */

export interface HealingResult {
  /** 回復前に回復が必要だったか */
  wasNeeded: boolean;
  message: string;
}

/**
 * パーティが回復を必要としているか判定
 */
export function needsHealing(
  party: MonsterInstance[],
  maxHpCalc: (monster: MonsterInstance) => number,
  moveResolver: (moveId: string) => MoveDefinition,
): boolean {
  return party.some((monster) => {
    if (monster.currentHp < maxHpCalc(monster)) return true;
    if (monster.status !== null) return true;
    return monster.moves.some((move) => {
      const def = moveResolver(move.moveId);
      return move.currentPp < def.pp;
    });
  });
}

/**
 * 回復施設を利用する
 * パーティ全体を全回復し、結果を返す
 */
export function useHealingCenter(
  party: MonsterInstance[],
  maxHpCalc: (monster: MonsterInstance) => number,
  moveResolver: (moveId: string) => MoveDefinition,
): HealingResult {
  const wasNeeded = needsHealing(party, maxHpCalc, moveResolver);

  healParty(party, maxHpCalc, moveResolver);

  return {
    wasNeeded,
    message: wasNeeded
      ? "お預かりしたモンスターは元気になりましたよ！"
      : "またいつでもお越しください！",
  };
}
