import { describe, it, expect } from "vitest";
import { executeMapTransition } from "../map-transition";
import type { MapConnection } from "../map-data";

function createConnection(overrides?: Partial<MapConnection>): MapConnection {
  return {
    targetMapId: "route-1",
    targetX: 5,
    targetY: 0,
    sourceX: 5,
    sourceY: 9,
    ...overrides,
  };
}

describe("executeMapTransition", () => {
  it("targetMapId が正しく設定される", () => {
    const connection = createConnection({ targetMapId: "hajimari-forest" });
    const result = executeMapTransition(connection, "up");
    expect(result.targetMapId).toBe("hajimari-forest");
  });

  it("新しい座標が接続先座標になる", () => {
    const connection = createConnection({ targetX: 3, targetY: 7 });
    const result = executeMapTransition(connection, "down");
    expect(result.newPosition.x).toBe(3);
    expect(result.newPosition.y).toBe(7);
  });

  it("向きが維持される: up", () => {
    const result = executeMapTransition(createConnection(), "up");
    expect(result.newPosition.direction).toBe("up");
  });

  it("向きが維持される: down", () => {
    const result = executeMapTransition(createConnection(), "down");
    expect(result.newPosition.direction).toBe("down");
  });

  it("向きが維持される: left", () => {
    const result = executeMapTransition(createConnection(), "left");
    expect(result.newPosition.direction).toBe("left");
  });

  it("向きが維持される: right", () => {
    const result = executeMapTransition(createConnection(), "right");
    expect(result.newPosition.direction).toBe("right");
  });
});
