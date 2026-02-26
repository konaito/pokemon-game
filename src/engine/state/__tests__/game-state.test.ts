import { describe, it, expect } from "vitest";
import { createInitialGameState, createNewPlayerState, gameReducer } from "../game-state";
import type { MonsterInstance } from "@/types";

function createDummyMonster(): MonsterInstance {
  return {
    uid: "test-starter",
    speciesId: "fire-starter",
    level: 5,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 20, atk: 20, def: 20, spAtk: 20, spDef: 20, speed: 20 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 20,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

describe("ゲーム状態管理", () => {
  it("初期状態はタイトル画面", () => {
    const state = createInitialGameState();
    expect(state.screen).toBe("title");
    expect(state.player).toBeNull();
  });

  it("新規プレイヤー状態が正しく作成される", () => {
    const player = createNewPlayerState("サトシ");
    expect(player.name).toBe("サトシ");
    expect(player.money).toBe(3000);
    expect(player.partyState.party).toHaveLength(0);
    expect(player.bag.items).toHaveLength(2);
    expect(player.bag.items).toEqual([
      { itemId: "monster-ball", quantity: 5 },
      { itemId: "potion", quantity: 3 },
    ]);
  });

  describe("gameReducer", () => {
    it("START_NEW_GAME でスターター選択画面に遷移", () => {
      const state = createInitialGameState();
      const next = gameReducer(state, { type: "START_NEW_GAME", playerName: "サトシ" });
      expect(next.screen).toBe("starter_select");
      expect(next.player).not.toBeNull();
      expect(next.player!.name).toBe("サトシ");
    });

    it("CHANGE_SCREEN で画面を変更", () => {
      const state = createInitialGameState();
      const next = gameReducer(state, { type: "CHANGE_SCREEN", screen: "menu" });
      expect(next.screen).toBe("menu");
    });

    it("SET_STARTER でスターターがパーティに追加されオーバーワールドに遷移", () => {
      let state = createInitialGameState();
      state = gameReducer(state, { type: "START_NEW_GAME", playerName: "サトシ" });

      const monster = createDummyMonster();
      state = gameReducer(state, { type: "SET_STARTER", monster });

      expect(state.screen).toBe("overworld");
      expect(state.player!.partyState.party).toHaveLength(1);
      expect(state.player!.partyState.party[0].speciesId).toBe("fire-starter");
      expect(state.player!.pokedexSeen.has("fire-starter")).toBe(true);
      expect(state.player!.pokedexCaught.has("fire-starter")).toBe(true);
    });

    it("SET_STORY_FLAG でフラグを設定", () => {
      const state = createInitialGameState();
      const next = gameReducer(state, {
        type: "SET_STORY_FLAG",
        flag: "gym1_cleared",
        value: true,
      });
      expect(next.storyFlags.gym1_cleared).toBe(true);
    });

    it("playerがnullの時SET_STARTERは無視される", () => {
      const state = createInitialGameState();
      const next = gameReducer(state, { type: "SET_STARTER", monster: createDummyMonster() });
      expect(next.screen).toBe("title"); // 変更なし
    });
  });
});
