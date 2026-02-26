import type { GameState, PlayerState, OverworldState } from "./game-state";
import type { MonsterInstance, PartyState, Bag, BagItem } from "@/types";

/** セーブデータのバージョン（互換性管理用） */
export const SAVE_DATA_VERSION = 1;

/** セーブスロット数 */
export const MAX_SAVE_SLOTS = 3;

/** セーブスロットのキープレフィックス */
const STORAGE_KEY_PREFIX = "pokemon_save_";

/**
 * JSON シリアライズ可能なセーブデータ構造
 * Set → string[] に変換し、保存不要なフィールドを除外
 */
export interface SaveData {
  version: number;
  savedAt: string;
  playTime: number;
  state: SerializedGameState;
}

/** JSON化可能なGameState */
export interface SerializedGameState {
  player: SerializedPlayerState;
  overworld: OverworldState | null;
  storyFlags: Record<string, boolean>;
}

/** JSON化可能なPlayerState (Set → string[]) */
export interface SerializedPlayerState {
  name: string;
  money: number;
  badges: string[];
  partyState: PartyState;
  bag: Bag;
  pokedexSeen: string[];
  pokedexCaught: string[];
}

/** セーブスロットのサマリ（一覧表示用） */
export interface SaveSlotSummary {
  slot: number;
  exists: boolean;
  playerName?: string;
  playTime?: number;
  savedAt?: string;
  partyLevel?: number;
  badges?: number;
}

/**
 * GameState → SaveData にシリアライズ
 */
export function serializeGameState(state: GameState, playTime: number = 0): SaveData | null {
  if (!state.player) return null;

  return {
    version: SAVE_DATA_VERSION,
    savedAt: new Date().toISOString(),
    playTime,
    state: {
      player: serializePlayerState(state.player),
      overworld: state.overworld,
      storyFlags: { ...state.storyFlags },
    },
  };
}

function serializePlayerState(player: PlayerState): SerializedPlayerState {
  return {
    name: player.name,
    money: player.money,
    badges: [...player.badges],
    partyState: {
      party: player.partyState.party.map(cloneMonster),
      boxes: player.partyState.boxes.map((box) => box.map(cloneMonster)),
    },
    bag: { items: player.bag.items.map((item) => ({ ...item })) },
    pokedexSeen: [...player.pokedexSeen],
    pokedexCaught: [...player.pokedexCaught],
  };
}

function cloneMonster(m: MonsterInstance): MonsterInstance {
  return {
    uid: m.uid,
    speciesId: m.speciesId,
    nickname: m.nickname,
    level: m.level,
    exp: m.exp,
    nature: m.nature,
    ivs: { ...m.ivs },
    evs: { ...m.evs },
    currentHp: m.currentHp,
    moves: m.moves.map((mv) => ({ ...mv })),
    status: m.status,
  };
}

/**
 * SaveData → GameState にデシリアライズ
 */
export function deserializeGameState(saveData: SaveData): GameState {
  const { player, overworld, storyFlags } = saveData.state;

  return {
    screen: "overworld",
    player: {
      name: player.name,
      money: player.money,
      badges: [...player.badges],
      partyState: {
        party: player.partyState.party.map(cloneMonster),
        boxes: player.partyState.boxes.map((box) => box.map(cloneMonster)),
      },
      bag: { items: player.bag.items.map((item: BagItem) => ({ ...item })) },
      pokedexSeen: new Set(player.pokedexSeen),
      pokedexCaught: new Set(player.pokedexCaught),
    },
    overworld: overworld ? { ...overworld } : null,
    storyFlags: { ...storyFlags },
  };
}

/**
 * セーブデータのバリデーション
 */
export function validateSaveData(data: unknown): data is SaveData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (d.version !== SAVE_DATA_VERSION) return false;
  if (typeof d.savedAt !== "string") return false;
  if (typeof d.state !== "object" || d.state === null) return false;

  const state = d.state as Record<string, unknown>;
  if (typeof state.player !== "object" || state.player === null) return false;

  const player = state.player as Record<string, unknown>;
  if (typeof player.name !== "string") return false;
  if (!Array.isArray(player.partyState)) {
    if (typeof player.partyState !== "object" || player.partyState === null) return false;
  }

  return true;
}

// --- localStorage アダプタ ---

function getStorageKey(slot: number): string {
  return `${STORAGE_KEY_PREFIX}${slot}`;
}

/**
 * セーブデータを localStorage に保存
 * @returns 成功したら true
 */
export function saveToSlot(slot: number, saveData: SaveData): boolean {
  if (slot < 0 || slot >= MAX_SAVE_SLOTS) return false;
  try {
    const json = JSON.stringify(saveData);
    localStorage.setItem(getStorageKey(slot), json);
    return true;
  } catch {
    return false;
  }
}

/**
 * セーブデータを localStorage から読み込み
 * @returns SaveData またはバリデーション失敗で null
 */
export function loadFromSlot(slot: number): SaveData | null {
  if (slot < 0 || slot >= MAX_SAVE_SLOTS) return null;
  try {
    const json = localStorage.getItem(getStorageKey(slot));
    if (!json) return null;
    const data = JSON.parse(json);
    if (!validateSaveData(data)) return null;
    return data as SaveData;
  } catch {
    return null;
  }
}

/**
 * セーブスロットを削除
 */
export function deleteSlot(slot: number): boolean {
  if (slot < 0 || slot >= MAX_SAVE_SLOTS) return false;
  try {
    localStorage.removeItem(getStorageKey(slot));
    return true;
  } catch {
    return false;
  }
}

/**
 * 全スロットのサマリ一覧を取得
 */
export function listSaveSlots(): SaveSlotSummary[] {
  const summaries: SaveSlotSummary[] = [];
  for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
    const data = loadFromSlot(i);
    if (!data) {
      summaries.push({ slot: i, exists: false });
    } else {
      const party = data.state.player.partyState.party;
      const maxLevel = party.length > 0 ? Math.max(...party.map((m) => m.level)) : 0;
      summaries.push({
        slot: i,
        exists: true,
        playerName: data.state.player.name,
        playTime: data.playTime,
        savedAt: data.savedAt,
        partyLevel: maxLevel,
        badges: data.state.player.badges.length,
      });
    }
  }
  return summaries;
}

/**
 * ゲーム状態をセーブ（高レベルAPI）
 */
export function saveGame(state: GameState, slot: number, playTime: number = 0): boolean {
  const saveData = serializeGameState(state, playTime);
  if (!saveData) return false;
  return saveToSlot(slot, saveData);
}

/**
 * ゲーム状態をロード（高レベルAPI）
 */
export function loadGame(slot: number): GameState | null {
  const saveData = loadFromSlot(slot);
  if (!saveData) return null;
  return deserializeGameState(saveData);
}
