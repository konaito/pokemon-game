import type { MonsterInstance, Bag, PartyState } from "@/types";

/**
 * ゲーム全体の状態定義
 */

export type ScreenId =
  | "title"
  | "starter_select"
  | "overworld"
  | "battle"
  | "party"
  | "bag"
  | "pokedex"
  | "menu"
  | "shop"
  | "healing_center"
  | "dialogue";

export interface PlayerState {
  name: string;
  money: number;
  badges: string[];
  partyState: PartyState;
  bag: Bag;
  /** 図鑑に登録済みのモンスターID */
  pokedexSeen: Set<string>;
  pokedexCaught: Set<string>;
}

export interface OverworldState {
  currentMapId: string;
  playerX: number;
  playerY: number;
  direction: "up" | "down" | "left" | "right";
}

export interface GameState {
  screen: ScreenId;
  player: PlayerState | null;
  overworld: OverworldState | null;
  /** ストーリーフラグ */
  storyFlags: Record<string, boolean>;
}

/** 初期ゲーム状態 */
export function createInitialGameState(): GameState {
  return {
    screen: "title",
    player: null,
    overworld: null,
    storyFlags: {},
  };
}

/** 新規ゲーム開始時のプレイヤー初期状態 */
export function createNewPlayerState(name: string): PlayerState {
  return {
    name,
    money: 3000,
    badges: [],
    partyState: {
      party: [],
      boxes: Array.from({ length: 8 }, () => []),
    },
    bag: { items: [] },
    pokedexSeen: new Set(),
    pokedexCaught: new Set(),
  };
}

export type GameAction =
  | { type: "START_NEW_GAME"; playerName: string }
  | { type: "CHANGE_SCREEN"; screen: ScreenId }
  | { type: "SET_STARTER"; monster: MonsterInstance }
  | { type: "UPDATE_PLAYER"; updates: Partial<PlayerState> }
  | { type: "SET_STORY_FLAG"; flag: string; value: boolean };

/** ゲーム状態のReducer */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_NEW_GAME":
      return {
        ...state,
        screen: "starter_select",
        player: createNewPlayerState(action.playerName),
      };
    case "CHANGE_SCREEN":
      return { ...state, screen: action.screen };
    case "SET_STARTER":
      if (!state.player) return state;
      return {
        ...state,
        screen: "overworld",
        player: {
          ...state.player,
          partyState: {
            ...state.player.partyState,
            party: [action.monster],
          },
          pokedexSeen: new Set([...state.player.pokedexSeen, action.monster.speciesId]),
          pokedexCaught: new Set([...state.player.pokedexCaught, action.monster.speciesId]),
        },
      };
    case "UPDATE_PLAYER":
      if (!state.player) return state;
      return {
        ...state,
        player: { ...state.player, ...action.updates },
      };
    case "SET_STORY_FLAG":
      return {
        ...state,
        storyFlags: { ...state.storyFlags, [action.flag]: action.value },
      };
    default:
      return state;
  }
}
