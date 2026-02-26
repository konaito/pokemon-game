import { describe, it, expect, beforeEach } from "vitest";
import {
  serializeGameState,
  deserializeGameState,
  validateSaveData,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  listSaveSlots,
  saveGame,
  loadGame,
  SAVE_DATA_VERSION,
  MAX_SAVE_SLOTS,
} from "../save-data";
import type { GameState } from "../game-state";
import type { MonsterInstance } from "@/types";

function createTestMonster(): MonsterInstance {
  return {
    uid: "test-uid-001",
    speciesId: "fire-starter",
    level: 15,
    exp: 3375,
    nature: "adamant",
    ivs: { hp: 20, atk: 25, def: 15, spAtk: 10, spDef: 20, speed: 18 },
    evs: { hp: 0, atk: 10, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 45,
    moves: [
      { moveId: "tackle", currentPp: 30 },
      { moveId: "ember", currentPp: 20 },
    ],
    status: null,
  };
}

function createTestGameState(): GameState {
  return {
    screen: "overworld",
    player: {
      name: "サトシ",
      money: 5000,
      badges: ["badge1"],
      partyState: {
        party: [createTestMonster()],
        boxes: Array.from({ length: 8 }, () => []),
      },
      bag: { items: [{ itemId: "potion", quantity: 3 }] },
      pokedexSeen: new Set(["fire-starter", "water-starter"]),
      pokedexCaught: new Set(["fire-starter"]),
    },
    overworld: {
      currentMapId: "route-1",
      playerX: 5,
      playerY: 10,
      direction: "down",
    },
    storyFlags: { intro_done: true },
  };
}

// localStorage モック
const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
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

describe("セーブデータ構造", () => {
  describe("serializeGameState", () => {
    it("GameStateをSaveDataに変換できる", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state, 3600);

      expect(saveData).not.toBeNull();
      expect(saveData!.version).toBe(SAVE_DATA_VERSION);
      expect(saveData!.playTime).toBe(3600);
      expect(typeof saveData!.savedAt).toBe("string");
    });

    it("Set がstring[]に変換される", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;

      expect(Array.isArray(saveData.state.player.pokedexSeen)).toBe(true);
      expect(saveData.state.player.pokedexSeen).toContain("fire-starter");
      expect(saveData.state.player.pokedexSeen).toContain("water-starter");
      expect(Array.isArray(saveData.state.player.pokedexCaught)).toBe(true);
      expect(saveData.state.player.pokedexCaught).toContain("fire-starter");
    });

    it("playerがnullの場合nullを返す", () => {
      const state: GameState = {
        screen: "title",
        player: null,
        overworld: null,
        storyFlags: {},
      };
      expect(serializeGameState(state)).toBeNull();
    });

    it("モンスターデータが正しくシリアライズされる", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      const monster = saveData.state.player.partyState.party[0];

      expect(monster.uid).toBe("test-uid-001");
      expect(monster.nature).toBe("adamant");
      expect(monster.level).toBe(15);
      expect(monster.moves).toHaveLength(2);
    });
  });

  describe("deserializeGameState", () => {
    it("SaveDataをGameStateに復元できる", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      const restored = deserializeGameState(saveData);

      expect(restored.screen).toBe("overworld");
      expect(restored.player!.name).toBe("サトシ");
      expect(restored.player!.money).toBe(5000);
      expect(restored.player!.badges).toEqual(["badge1"]);
    });

    it("string[] がSetに復元される", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      const restored = deserializeGameState(saveData);

      expect(restored.player!.pokedexSeen).toBeInstanceOf(Set);
      expect(restored.player!.pokedexSeen.has("fire-starter")).toBe(true);
      expect(restored.player!.pokedexSeen.has("water-starter")).toBe(true);
      expect(restored.player!.pokedexCaught).toBeInstanceOf(Set);
      expect(restored.player!.pokedexCaught.has("fire-starter")).toBe(true);
    });

    it("モンスターデータが正しく復元される", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      const restored = deserializeGameState(saveData);
      const monster = restored.player!.partyState.party[0];

      expect(monster.uid).toBe("test-uid-001");
      expect(monster.nature).toBe("adamant");
      expect(monster.level).toBe(15);
      expect(monster.status).toBeNull();
    });

    it("overworldデータが復元される", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      const restored = deserializeGameState(saveData);

      expect(restored.overworld!.currentMapId).toBe("route-1");
      expect(restored.overworld!.playerX).toBe(5);
      expect(restored.overworld!.playerY).toBe(10);
    });

    it("storyFlagsが復元される", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      const restored = deserializeGameState(saveData);

      expect(restored.storyFlags.intro_done).toBe(true);
    });
  });

  describe("ラウンドトリップ", () => {
    it("serialize → deserialize で元のデータと一致する", () => {
      const original = createTestGameState();
      const saveData = serializeGameState(original)!;
      const restored = deserializeGameState(saveData);

      expect(restored.player!.name).toBe(original.player!.name);
      expect(restored.player!.money).toBe(original.player!.money);
      expect(restored.player!.partyState.party).toHaveLength(1);
      expect(restored.player!.partyState.party[0].speciesId).toBe("fire-starter");
      expect(restored.player!.bag.items).toHaveLength(1);
      expect(restored.player!.bag.items[0].quantity).toBe(3);
    });

    it("元のオブジェクトを変更しても復元データに影響しない（ディープコピー）", () => {
      const original = createTestGameState();
      const saveData = serializeGameState(original)!;

      // 元データを書き換え
      original.player!.money = 99999;
      original.player!.partyState.party[0].level = 100;

      const restored = deserializeGameState(saveData);
      expect(restored.player!.money).toBe(5000);
      expect(restored.player!.partyState.party[0].level).toBe(15);
    });
  });

  describe("validateSaveData", () => {
    it("正しいSaveDataを検証通過する", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      expect(validateSaveData(saveData)).toBe(true);
    });

    it("nullは拒否する", () => {
      expect(validateSaveData(null)).toBe(false);
    });

    it("バージョン不一致は拒否する", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      (saveData as unknown as Record<string, unknown>).version = 999;
      expect(validateSaveData(saveData)).toBe(false);
    });

    it("playerが欠けていると拒否する", () => {
      expect(validateSaveData({ version: 1, savedAt: "x", state: {} })).toBe(false);
    });
  });
});

describe("localStorage アダプタ", () => {
  describe("saveToSlot / loadFromSlot", () => {
    it("スロットにセーブしてロードできる", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;

      expect(saveToSlot(0, saveData)).toBe(true);

      const loaded = loadFromSlot(0);
      expect(loaded).not.toBeNull();
      expect(loaded!.state.player.name).toBe("サトシ");
    });

    it("空スロットからロードするとnull", () => {
      expect(loadFromSlot(0)).toBeNull();
    });

    it("無効なスロット番号は拒否する", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;

      expect(saveToSlot(-1, saveData)).toBe(false);
      expect(saveToSlot(MAX_SAVE_SLOTS, saveData)).toBe(false);
      expect(loadFromSlot(-1)).toBeNull();
      expect(loadFromSlot(MAX_SAVE_SLOTS)).toBeNull();
    });
  });

  describe("deleteSlot", () => {
    it("スロットを削除できる", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      saveToSlot(0, saveData);

      expect(deleteSlot(0)).toBe(true);
      expect(loadFromSlot(0)).toBeNull();
    });

    it("無効なスロット番号は拒否する", () => {
      expect(deleteSlot(-1)).toBe(false);
    });
  });

  describe("listSaveSlots", () => {
    it("全スロットのサマリを返す", () => {
      const state = createTestGameState();
      const saveData = serializeGameState(state)!;
      saveToSlot(0, saveData);

      const slots = listSaveSlots();
      expect(slots).toHaveLength(MAX_SAVE_SLOTS);
      expect(slots[0].exists).toBe(true);
      expect(slots[0].playerName).toBe("サトシ");
      expect(slots[0].partyLevel).toBe(15);
      expect(slots[0].badges).toBe(1);
      expect(slots[1].exists).toBe(false);
      expect(slots[2].exists).toBe(false);
    });
  });
});

describe("高レベルAPI", () => {
  it("saveGame → loadGame のラウンドトリップ", () => {
    const state = createTestGameState();

    expect(saveGame(state, 0, 7200)).toBe(true);

    const restored = loadGame(0);
    expect(restored).not.toBeNull();
    expect(restored!.player!.name).toBe("サトシ");
    expect(restored!.player!.partyState.party[0].uid).toBe("test-uid-001");
    expect(restored!.player!.pokedexSeen).toBeInstanceOf(Set);
  });

  it("playerがnullの場合saveGameはfalseを返す", () => {
    const state: GameState = {
      screen: "title",
      player: null,
      overworld: null,
      storyFlags: {},
    };
    expect(saveGame(state, 0)).toBe(false);
  });

  it("空スロットのloadGameはnullを返す", () => {
    expect(loadGame(1)).toBeNull();
  });
});
