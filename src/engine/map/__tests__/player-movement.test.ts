import { describe, it, expect } from "vitest";
import { movePlayer, getFacingNpc } from "../player-movement";
import type { MapDefinition } from "../map-data";

const testMap: MapDefinition = {
  id: "test",
  name: "テスト",
  width: 5,
  height: 5,
  tiles: [
    ["wall", "wall", "wall", "wall", "wall"],
    ["wall", "ground", "ground", "ground", "wall"],
    ["wall", "ground", "grass", "door", "wall"],
    ["wall", "ground", "ground", "ground", "wall"],
    ["wall", "wall", "wall", "wall", "wall"],
  ],
  connections: [{ targetMapId: "route-1", targetX: 0, targetY: 0, sourceX: 3, sourceY: 2 }],
  encounters: [],
  encounterRate: 20,
  npcs: [{ id: "npc1", name: "村人", x: 3, y: 3, dialogue: ["こんにちは！"], isTrainer: false }],
};

describe("プレイヤー移動", () => {
  it("空いている方向に移動できる", () => {
    const result = movePlayer({ x: 1, y: 1, direction: "down" }, "down", testMap);
    expect(result.moved).toBe(true);
    expect(result.position).toEqual({ x: 1, y: 2, direction: "down" });
  });

  it("壁に向かって移動できない", () => {
    const result = movePlayer({ x: 1, y: 1, direction: "up" }, "up", testMap);
    expect(result.moved).toBe(false);
    expect(result.position.x).toBe(1);
    expect(result.position.y).toBe(1);
    expect(result.position.direction).toBe("up"); // 向きだけ更新
  });

  it("草むらに入るとエンカウントフラグが立つ", () => {
    const result = movePlayer({ x: 1, y: 2, direction: "right" }, "right", testMap);
    expect(result.moved).toBe(true);
    expect(result.enteredEncounterTile).toBe(true);
  });

  it("マップ接続座標に移動するとマップ遷移が発生する", () => {
    const result = movePlayer({ x: 2, y: 2, direction: "right" }, "right", testMap);
    expect(result.moved).toBe(true);
    expect(result.mapTransition).not.toBeNull();
    expect(result.mapTransition!.targetMapId).toBe("route-1");
  });

  it("NPCがいる場所には移動できない", () => {
    const result = movePlayer({ x: 2, y: 3, direction: "right" }, "right", testMap);
    expect(result.moved).toBe(false);
    expect(result.facingNpcId).toBe("npc1");
  });
});

describe("getFacingNpc", () => {
  it("向いている方向にNPCがいれば返す", () => {
    const npcId = getFacingNpc({ x: 2, y: 3, direction: "right" }, testMap);
    expect(npcId).toBe("npc1");
  });

  it("向いている方向にNPCがいなければnull", () => {
    const npcId = getFacingNpc({ x: 1, y: 1, direction: "up" }, testMap);
    expect(npcId).toBeNull();
  });
});
