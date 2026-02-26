import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  performAutosave,
  createAutosaveManager,
  AUTOSAVE_SLOT,
  AUTOSAVE_DEBOUNCE_MS,
} from "../autosave";
import { loadFromSlot } from "../save-data";
import type { GameState } from "../game-state";
import type { MonsterInstance } from "@/types";

function createTestMonster(): MonsterInstance {
  return {
    uid: "test-autosave",
    speciesId: "fire-starter",
    level: 10,
    exp: 1000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 30,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

function createPlayableState(): GameState {
  return {
    screen: "overworld",
    player: {
      name: "テスト",
      money: 3000,
      badges: [],
      partyState: {
        party: [createTestMonster()],
        boxes: Array.from({ length: 8 }, () => []),
      },
      bag: { items: [] },
      pokedexSeen: new Set(["fire-starter"]),
      pokedexCaught: new Set(["fire-starter"]),
    },
    overworld: { currentMapId: "town-1", playerX: 3, playerY: 5, direction: "down" },
    storyFlags: {},
  };
}

const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  vi.useFakeTimers();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    },
    writable: true,
  });
});

describe("performAutosave", () => {
  it("オーバーワールドでオートセーブが成功する", () => {
    const state = createPlayableState();
    expect(performAutosave(state, 100)).toBe(true);

    const saved = loadFromSlot(AUTOSAVE_SLOT);
    expect(saved).not.toBeNull();
    expect(saved!.state.player.name).toBe("テスト");
    expect(saved!.playTime).toBe(100);
  });

  it("playerがnullの場合はセーブしない", () => {
    const state: GameState = { screen: "title", player: null, overworld: null, storyFlags: {} };
    expect(performAutosave(state)).toBe(false);
  });

  it("タイトル画面ではセーブしない", () => {
    const state = createPlayableState();
    state.screen = "title";
    expect(performAutosave(state)).toBe(false);
  });

  it("スターター選択画面ではセーブしない", () => {
    const state = createPlayableState();
    state.screen = "starter_select";
    expect(performAutosave(state)).toBe(false);
  });
});

describe("createAutosaveManager", () => {
  it("schedule()はデバウンス後に実行される", () => {
    const manager = createAutosaveManager();
    const state = createPlayableState();

    manager.schedule(state);
    expect(loadFromSlot(AUTOSAVE_SLOT)).toBeNull();

    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);
    expect(loadFromSlot(AUTOSAVE_SLOT)).not.toBeNull();

    manager.destroy();
  });

  it("schedule()が複数回呼ばれても最後の1回だけ実行される", () => {
    const manager = createAutosaveManager();
    const state1 = createPlayableState();
    state1.player!.money = 1000;

    const state2 = createPlayableState();
    state2.player!.money = 9999;

    manager.schedule(state1);
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS / 2);
    manager.schedule(state2);
    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);

    const saved = loadFromSlot(AUTOSAVE_SLOT);
    expect(saved!.state.player.money).toBe(9999);

    manager.destroy();
  });

  it("saveNow()は即座にセーブする", () => {
    const manager = createAutosaveManager();
    const state = createPlayableState();

    expect(manager.saveNow(state)).toBe(true);
    expect(loadFromSlot(AUTOSAVE_SLOT)).not.toBeNull();

    manager.destroy();
  });

  it("プレイ時間がカウントされる", () => {
    const manager = createAutosaveManager();

    manager.startTimer();
    vi.advanceTimersByTime(5000);
    expect(manager.getPlayTime()).toBe(5);

    manager.stopTimer();
    vi.advanceTimersByTime(5000);
    expect(manager.getPlayTime()).toBe(5);

    manager.destroy();
  });

  it("setPlayTime()でプレイ時間を復元できる", () => {
    const manager = createAutosaveManager();
    manager.setPlayTime(3600);
    expect(manager.getPlayTime()).toBe(3600);
    manager.destroy();
  });

  it("destroy()でタイマーがクリアされる", () => {
    const manager = createAutosaveManager();
    const state = createPlayableState();

    manager.startTimer();
    manager.schedule(state);
    manager.destroy();

    vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS * 2);
    expect(loadFromSlot(AUTOSAVE_SLOT)).toBeNull();
  });
});
