import type { MonsterInstance, MoveDefinition, PartyState } from "@/types";

const MAX_PARTY_SIZE = 6;
const MAX_BOX_COUNT = 8;
const MAX_BOX_SIZE = 30;

/** パーティ状態の初期化 */
export function createPartyState(): PartyState {
  return {
    party: [],
    boxes: Array.from({ length: MAX_BOX_COUNT }, () => []),
  };
}

/** パーティにモンスターを追加。満杯ならボックスへ送る */
export function addMonster(
  state: PartyState,
  monster: MonsterInstance,
): { destination: "party" | "box"; boxIndex?: number } {
  if (state.party.length < MAX_PARTY_SIZE) {
    state.party.push(monster);
    return { destination: "party" };
  }

  // パーティ満杯 → ボックスへ
  for (let i = 0; i < state.boxes.length; i++) {
    if (state.boxes[i].length < MAX_BOX_SIZE) {
      state.boxes[i].push(monster);
      return { destination: "box", boxIndex: i };
    }
  }

  throw new Error("全てのボックスが満杯です");
}

/** パーティ内の並び替え */
export function swapPartyOrder(state: PartyState, indexA: number, indexB: number): void {
  if (indexA < 0 || indexA >= state.party.length) throw new Error("無効なインデックス");
  if (indexB < 0 || indexB >= state.party.length) throw new Error("無効なインデックス");
  [state.party[indexA], state.party[indexB]] = [state.party[indexB], state.party[indexA]];
}

/** パーティからボックスへ預ける（パーティは最低1匹必要） */
export function depositToBox(state: PartyState, partyIndex: number, boxIndex: number): void {
  if (state.party.length <= 1) throw new Error("手持ちが1匹の時は預けられません");
  if (partyIndex < 0 || partyIndex >= state.party.length) throw new Error("無効なインデックス");
  if (boxIndex < 0 || boxIndex >= state.boxes.length) throw new Error("無効なボックス番号");
  if (state.boxes[boxIndex].length >= MAX_BOX_SIZE) throw new Error("ボックスが満杯です");

  const [monster] = state.party.splice(partyIndex, 1);
  state.boxes[boxIndex].push(monster);
}

/** ボックスからパーティへ引き出す */
export function withdrawFromBox(state: PartyState, boxIndex: number, boxSlotIndex: number): void {
  if (state.party.length >= MAX_PARTY_SIZE) throw new Error("手持ちが満杯です");
  if (boxIndex < 0 || boxIndex >= state.boxes.length) throw new Error("無効なボックス番号");
  if (boxSlotIndex < 0 || boxSlotIndex >= state.boxes[boxIndex].length)
    throw new Error("無効なスロット");

  const [monster] = state.boxes[boxIndex].splice(boxSlotIndex, 1);
  state.party.push(monster);
}

/** パーティの生存モンスター数 */
export function aliveCount(party: MonsterInstance[]): number {
  return party.filter((m) => m.currentHp > 0).length;
}

/** パーティ全回復（ポケモンセンター相当） */
export function healParty(
  party: MonsterInstance[],
  maxHpCalc: (monster: MonsterInstance) => number,
  moveResolver: (moveId: string) => MoveDefinition,
): void {
  for (const monster of party) {
    monster.currentHp = maxHpCalc(monster);
    monster.status = null;
    for (const move of monster.moves) {
      const def = moveResolver(move.moveId);
      move.currentPp = def.pp;
    }
  }
}
