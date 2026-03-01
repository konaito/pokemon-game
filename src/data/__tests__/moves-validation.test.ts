import { describe, it, expect } from "vitest";
import { ALL_MOVES, getMoveById, getAllMoveIds } from "../moves";
import type { StatusCondition, TypeId } from "@/types";

const validTypes: TypeId[] = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const validCategories = ["physical", "special", "status"] as const;
const validStatKeys = ["hp", "atk", "def", "spAtk", "spDef", "speed"];
const validStatusConditions: StatusCondition[] = ["poison", "burn", "paralysis", "sleep", "freeze"];

describe("ALL_MOVES", () => {
  const moves = Object.values(ALL_MOVES);

  it("技が定義されている", () => {
    expect(moves.length).toBeGreaterThan(0);
  });

  it("IDとキーが一致する", () => {
    for (const [key, move] of Object.entries(ALL_MOVES)) {
      expect(move.id).toBe(key);
    }
  });

  it.each(moves.map((m) => [m.id, m]))("%s: 基本フィールドが有効", (_id, move) => {
    expect(move.id).toBeTruthy();
    expect(move.name).toBeTruthy();
    expect(validTypes).toContain(move.type);
    expect(validCategories).toContain(move.category);
    expect(move.accuracy).toBeGreaterThan(0);
    expect(move.accuracy).toBeLessThanOrEqual(100);
    expect(move.pp).toBeGreaterThan(0);
  });

  it("ダメージ技にはpower > 0、ステータス技はpower=null", () => {
    for (const move of moves) {
      if (move.category === "status") {
        expect(move.power).toBeNull();
      } else {
        expect(move.power).toBeGreaterThan(0);
      }
    }
  });

  it("priorityは-7〜7の範囲内", () => {
    for (const move of moves) {
      expect(move.priority).toBeGreaterThanOrEqual(-7);
      expect(move.priority).toBeLessThanOrEqual(7);
    }
  });
});

describe("技のeffect検証", () => {
  const movesWithEffect = Object.values(ALL_MOVES).filter((m) => m.effect);

  it("statusConditionが有効な値", () => {
    for (const move of movesWithEffect) {
      if (move.effect?.statusCondition) {
        expect(validStatusConditions).toContain(move.effect.statusCondition);
      }
    }
  });

  it("statusChanceが0〜100の範囲", () => {
    for (const move of movesWithEffect) {
      if (move.effect?.statusChance !== undefined) {
        expect(move.effect.statusChance).toBeGreaterThanOrEqual(0);
        expect(move.effect.statusChance).toBeLessThanOrEqual(100);
      }
    }
  });

  it("statChangesのキーが有効なステータス名", () => {
    for (const move of movesWithEffect) {
      if (move.effect?.statChanges) {
        for (const key of Object.keys(move.effect.statChanges)) {
          expect(validStatKeys).toContain(key);
        }
      }
    }
  });
});

describe("getMoveById / getAllMoveIds", () => {
  it("有効なIDで取得できる", () => {
    const move = getMoveById("tackle");
    expect(move).toBeDefined();
    expect(move!.name).toBe("たいあたり");
  });

  it("無効なIDでundefined", () => {
    expect(getMoveById("nonexistent")).toBeUndefined();
  });

  it("getAllMoveIdsが全技を返す", () => {
    const ids = getAllMoveIds();
    expect(ids.length).toBe(Object.keys(ALL_MOVES).length);
  });
});
