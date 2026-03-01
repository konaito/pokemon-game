import { describe, it, expect } from "vitest";
import { determineTurnOrder, type TurnAction } from "../turn-order";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";
import { createStatStages } from "../stat-stage";

function createMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    uid: "test-turn",
    speciesId: "test-monster",
    level: 50,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [],
    status: null,
    ...overrides,
  };
}

function createSpecies(overrides?: Partial<MonsterSpecies>): MonsterSpecies {
  return {
    id: "test-monster",
    name: "テストモンスター",
    types: ["normal"],
    baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    baseExpYield: 80,
    expGroup: "medium_fast",
    learnset: [],
    ...overrides,
  };
}

const defaultMove: MoveDefinition = {
  id: "tackle",
  name: "たいあたり",
  type: "normal",
  category: "physical",
  power: 40,
  accuracy: 100,
  pp: 35,
  priority: 0,
};

function makeFightAction(
  side: "player" | "opponent",
  move: MoveDefinition = defaultMove,
  speciesOverrides?: Partial<MonsterSpecies>,
  monsterOverrides?: Partial<MonsterInstance>,
): TurnAction {
  return {
    side,
    action: { type: "fight", moveIndex: 0 },
    monster: createMonster(monsterOverrides),
    species: createSpecies(speciesOverrides),
    move,
    statStages: createStatStages(),
  };
}

describe("determineTurnOrder", () => {
  describe("アクション優先度", () => {
    it("逃走は技より先", () => {
      const player: TurnAction = {
        side: "player",
        action: { type: "run" },
        monster: createMonster(),
        species: createSpecies(),
      };
      const opponent = makeFightAction("opponent");
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("player");
    });

    it("交代は技より先", () => {
      const player: TurnAction = {
        side: "player",
        action: { type: "switch", partyIndex: 1 },
        monster: createMonster(),
        species: createSpecies(),
      };
      const opponent = makeFightAction("opponent");
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("player");
    });

    it("アイテムは技より先", () => {
      const player: TurnAction = {
        side: "player",
        action: { type: "item", itemId: "potion" },
        monster: createMonster(),
        species: createSpecies(),
      };
      const opponent = makeFightAction("opponent");
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("player");
    });

    it("逃走は交代より先", () => {
      const player: TurnAction = {
        side: "player",
        action: { type: "run" },
        monster: createMonster(),
        species: createSpecies(),
      };
      const opponent: TurnAction = {
        side: "opponent",
        action: { type: "switch", partyIndex: 1 },
        monster: createMonster(),
        species: createSpecies(),
      };
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("player");
    });

    it("交代はアイテムより先", () => {
      const player: TurnAction = {
        side: "player",
        action: { type: "switch", partyIndex: 1 },
        monster: createMonster(),
        species: createSpecies(),
      };
      const opponent: TurnAction = {
        side: "opponent",
        action: { type: "item", itemId: "potion" },
        monster: createMonster(),
        species: createSpecies(),
      };
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("player");
    });
  });

  describe("技のpriority比較", () => {
    it("高priority技が先行する", () => {
      const quickAttack: MoveDefinition = { ...defaultMove, id: "quick-attack", priority: 1 };
      const player = makeFightAction("player", quickAttack);
      const opponent = makeFightAction("opponent", defaultMove);
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("player");
    });

    it("priority負の技は後攻する", () => {
      const slowMove: MoveDefinition = { ...defaultMove, id: "slow-move", priority: -1 };
      const player = makeFightAction("player", slowMove);
      const opponent = makeFightAction("opponent", defaultMove);
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("opponent");
    });
  });

  describe("素早さ比較", () => {
    it("速いモンスターが先行する", () => {
      const fast = { baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 120 } };
      const slow = { baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 40 } };
      const player = makeFightAction("player", defaultMove, fast);
      const opponent = makeFightAction("opponent", defaultMove, slow);
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("player");
    });

    it("麻痺の素早さ半減が適用される", () => {
      const fast = { baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 100 } };
      const slow = { baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 60 } };
      // playerは速いが麻痺で半減 → opponentが先行
      const player = makeFightAction("player", defaultMove, fast, { status: "paralysis" });
      const opponent = makeFightAction("opponent", defaultMove, slow);
      const [first] = determineTurnOrder(player, opponent);
      expect(first.side).toBe("opponent");
    });
  });

  describe("同速ランダム", () => {
    it("乱数 < 0.5 でプレイヤー先攻", () => {
      const player = makeFightAction("player");
      const opponent = makeFightAction("opponent");
      const [first] = determineTurnOrder(player, opponent, () => 0.3);
      expect(first.side).toBe("player");
    });

    it("乱数 >= 0.5 で相手先攻", () => {
      const player = makeFightAction("player");
      const opponent = makeFightAction("opponent");
      const [first] = determineTurnOrder(player, opponent, () => 0.7);
      expect(first.side).toBe("opponent");
    });
  });
});
