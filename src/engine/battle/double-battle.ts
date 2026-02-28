import type {
  MonsterInstance,
  MonsterSpecies,
  MoveDefinition,
  SpeciesResolver,
  MoveResolver,
} from "@/types";

/** 技のターゲットタイプ */
export type MoveTarget =
  | "single" // 相手1体を選択
  | "adjacent" // 隣接する1体（味方含む可能性）
  | "all_opponents" // 相手全体
  | "all" // 場の全体（味方含む）
  | "self" // 自分のみ
  | "ally"; // 味方1体

/** ダブルバトルでの位置 */
export type BattlePosition = {
  side: "player" | "opponent";
  slot: number; // 0 or 1
};

/** ダブルバトルの各スロット状態 */
export interface DoubleBattleSlot {
  partyIndex: number; // パーティ内のインデックス（-1 = 空）
  monster: MonsterInstance | null;
}

/** ダブルバトル状態 */
export interface DoubleBattleState {
  player: {
    party: MonsterInstance[];
    slots: [DoubleBattleSlot, DoubleBattleSlot];
  };
  opponent: {
    party: MonsterInstance[];
    slots: [DoubleBattleSlot, DoubleBattleSlot];
  };
  turnNumber: number;
}

/** ダブルバトルのアクション */
export interface DoubleBattleAction {
  slot: number; // 0 or 1 (自分のどのスロットから行動するか)
  type: "fight" | "switch";
  moveIndex?: number; // fight の場合
  target?: BattlePosition; // fight の場合のターゲット
  switchPartyIndex?: number; // switch の場合
}

/**
 * ダブルバトルの初期化
 */
export function initDoubleBattle(
  playerParty: MonsterInstance[],
  opponentParty: MonsterInstance[],
): DoubleBattleState {
  const playerAlive = playerParty.map((m, i) => ({ m, i })).filter((e) => e.m.currentHp > 0);
  const opponentAlive = opponentParty.map((m, i) => ({ m, i })).filter((e) => e.m.currentHp > 0);

  return {
    player: {
      party: playerParty,
      slots: [
        {
          partyIndex: playerAlive[0]?.i ?? -1,
          monster: playerAlive[0]?.m ?? null,
        },
        {
          partyIndex: playerAlive[1]?.i ?? -1,
          monster: playerAlive[1]?.m ?? null,
        },
      ],
    },
    opponent: {
      party: opponentParty,
      slots: [
        {
          partyIndex: opponentAlive[0]?.i ?? -1,
          monster: opponentAlive[0]?.m ?? null,
        },
        {
          partyIndex: opponentAlive[1]?.i ?? -1,
          monster: opponentAlive[1]?.m ?? null,
        },
      ],
    },
    turnNumber: 1,
  };
}

/**
 * 技のターゲットタイプを取得する
 * MoveDefinition に target がなければデフォルトで "single" を返す
 */
export function getMoveTarget(move: MoveDefinition): MoveTarget {
  // move.target は将来の拡張用。現状はcategory/power/effectから推定
  return "single";
}

/**
 * 範囲技のダメージ補正倍率（ダブルバトルでは0.75倍）
 */
export function getSpreadMoveMultiplier(target: MoveTarget): number {
  if (target === "all_opponents" || target === "all") {
    return 0.75;
  }
  return 1.0;
}

/**
 * ダブルバトルの行動順を決定する
 * 4体（プレイヤー2体 + 相手2体）をスピード順にソート
 */
export function determineDoubleActionOrder(
  actions: {
    position: BattlePosition;
    monster: MonsterInstance;
    species: MonsterSpecies;
    move?: MoveDefinition;
    priority?: number;
  }[],
  random: () => number = Math.random,
): typeof actions {
  return [...actions].sort((a, b) => {
    // 優先度が高い技が先
    const priA = a.move?.priority ?? 0;
    const priB = b.move?.priority ?? 0;
    if (priA !== priB) return priB - priA;

    // 素早さ比較
    const speedA = a.species.baseStats.speed;
    const speedB = b.species.baseStats.speed;
    if (speedA !== speedB) return speedB - speedA;

    // 同速ならランダム
    return random() < 0.5 ? -1 : 1;
  });
}

/**
 * 場のモンスターを取得する（場に出ている全モンスター）
 */
export function getActiveMonsters(state: DoubleBattleState): {
  player: (MonsterInstance | null)[];
  opponent: (MonsterInstance | null)[];
} {
  return {
    player: state.player.slots.map((s) => s.monster),
    opponent: state.opponent.slots.map((s) => s.monster),
  };
}

/**
 * ダブルバトルでモンスターが瀕死かチェック
 */
export function checkDoubleFaint(
  state: DoubleBattleState,
): { side: "player" | "opponent"; slot: number }[] {
  const fainted: { side: "player" | "opponent"; slot: number }[] = [];

  for (const slot of [0, 1] as const) {
    const playerMon = state.player.slots[slot].monster;
    if (playerMon && playerMon.currentHp <= 0) {
      fainted.push({ side: "player", slot });
    }
    const opponentMon = state.opponent.slots[slot].monster;
    if (opponentMon && opponentMon.currentHp <= 0) {
      fainted.push({ side: "opponent", slot });
    }
  }

  return fainted;
}

/**
 * ダブルバトルの交代処理
 */
export function switchInDouble(
  state: DoubleBattleState,
  side: "player" | "opponent",
  slot: number,
  newPartyIndex: number,
): string | null {
  const sideState = side === "player" ? state.player : state.opponent;
  const party = sideState.party;

  if (newPartyIndex < 0 || newPartyIndex >= party.length) return null;
  if (party[newPartyIndex].currentHp <= 0) return null;

  // 既に場に出ているモンスターは交代先にできない
  if (
    sideState.slots[0].partyIndex === newPartyIndex ||
    sideState.slots[1].partyIndex === newPartyIndex
  ) {
    return null;
  }

  sideState.slots[slot] = {
    partyIndex: newPartyIndex,
    monster: party[newPartyIndex],
  };

  return `${party[newPartyIndex].speciesId}を繰り出した！`;
}

/**
 * ダブルバトルの勝敗判定
 */
export function checkDoubleResult(state: DoubleBattleState): "win" | "lose" | null {
  const playerAlive = state.player.party.some((m) => m.currentHp > 0);
  const opponentAlive = state.opponent.party.some((m) => m.currentHp > 0);

  if (!opponentAlive) return "win";
  if (!playerAlive) return "lose";
  return null;
}

/**
 * 有効なターゲットを取得する
 */
export function getValidTargets(
  state: DoubleBattleState,
  actorSide: "player" | "opponent",
  moveTarget: MoveTarget,
): BattlePosition[] {
  const targets: BattlePosition[] = [];
  const opponentSide = actorSide === "player" ? "opponent" : "player";

  switch (moveTarget) {
    case "single":
    case "adjacent":
      // 相手の場のモンスター
      for (const slot of [0, 1] as const) {
        const sideState = actorSide === "player" ? state.opponent : state.player;
        if (sideState.slots[slot].monster && sideState.slots[slot].monster!.currentHp > 0) {
          targets.push({ side: opponentSide, slot });
        }
      }
      break;

    case "all_opponents":
      for (const slot of [0, 1] as const) {
        const sideState = actorSide === "player" ? state.opponent : state.player;
        if (sideState.slots[slot].monster && sideState.slots[slot].monster!.currentHp > 0) {
          targets.push({ side: opponentSide, slot });
        }
      }
      break;

    case "all":
      for (const side of ["player", "opponent"] as const) {
        const sideState = side === "player" ? state.player : state.opponent;
        for (const slot of [0, 1] as const) {
          if (sideState.slots[slot].monster && sideState.slots[slot].monster!.currentHp > 0) {
            targets.push({ side, slot });
          }
        }
      }
      break;

    case "self":
      // ターゲットなし（自分自身は暗黙）
      break;

    case "ally":
      // 味方のもう一方のスロット
      for (const slot of [0, 1] as const) {
        const sideState = actorSide === "player" ? state.player : state.opponent;
        if (sideState.slots[slot].monster && sideState.slots[slot].monster!.currentHp > 0) {
          targets.push({ side: actorSide, slot });
        }
      }
      break;
  }

  return targets;
}
