import { describe, it, expect } from "vitest";
import {
  canMatch,
  isTimedOut,
  findMatch,
  generateRoomId,
  createMatchmakingEntry,
  type MatchmakingEntry,
  type MatchmakingConfig,
} from "../matchmaking";

const config: MatchmakingConfig = {
  baseToleranceRange: 100,
  toleranceExpansionPerInterval: 50,
  toleranceExpansionInterval: 10000,
  timeout: 300000,
};

function entry(id: string, rating: number, joinedAt: number = 0): MatchmakingEntry {
  return { playerId: id, socketId: `socket_${id}`, rating, joinedAt };
}

describe("マッチングシステム", () => {
  describe("canMatch", () => {
    it("レーティング差100以内ならマッチする", () => {
      const a = entry("a", 1500, 0);
      const b = entry("b", 1580, 0);
      expect(canMatch(a, b, 0, config)).toBe(true);
    });

    it("レーティング差101以上ではマッチしない", () => {
      const a = entry("a", 1500, 0);
      const b = entry("b", 1601, 0);
      expect(canMatch(a, b, 0, config)).toBe(false);
    });

    it("同じプレイヤー同士はマッチしない", () => {
      const a = entry("a", 1500, 0);
      const same = entry("a", 1500, 0);
      expect(canMatch(a, same, 0, config)).toBe(false);
    });

    it("待ち時間10秒で許容幅が+50拡大する", () => {
      const a = entry("a", 1500, 0);
      const b = entry("b", 1640, 0);
      // 基本100 + 待ち10秒で+50 = 150。差140なのでマッチ
      expect(canMatch(a, b, 10000, config)).toBe(true);
    });

    it("待ち時間0秒では同じ差ではマッチしない", () => {
      const a = entry("a", 1500, 0);
      const b = entry("b", 1640, 0);
      expect(canMatch(a, b, 0, config)).toBe(false);
    });

    it("待ち時間20秒で許容幅が+100拡大する", () => {
      const a = entry("a", 1500, 0);
      const b = entry("b", 1700, 0);
      // 基本100 + 20秒で+100 = 200。差200でマッチ
      expect(canMatch(a, b, 20000, config)).toBe(true);
    });
  });

  describe("isTimedOut", () => {
    it("5分未満ではタイムアウトしない", () => {
      const e = entry("a", 1500, 0);
      expect(isTimedOut(e, 299999, config)).toBe(false);
    });

    it("5分でタイムアウトする", () => {
      const e = entry("a", 1500, 0);
      expect(isTimedOut(e, 300000, config)).toBe(true);
    });
  });

  describe("findMatch", () => {
    it("空のキューではnullを返す", () => {
      expect(findMatch([], 0, config)).toBeNull();
    });

    it("1人のキューではnullを返す", () => {
      expect(findMatch([entry("a", 1500)], 0, config)).toBeNull();
    });

    it("マッチ可能な2人のペアを返す", () => {
      const queue = [entry("a", 1500, 0), entry("b", 1550, 0)];
      const result = findMatch(queue, 0, config);
      expect(result).not.toBeNull();
      expect(result![0].playerId).toBe("a");
      expect(result![1].playerId).toBe("b");
    });

    it("レーティング差が最も小さいペアを返す", () => {
      const queue = [entry("a", 1500, 0), entry("b", 1590, 0), entry("c", 1510, 0)];
      const result = findMatch(queue, 0, config);
      expect(result).not.toBeNull();
      // a(1500)とc(1510)が最もレーティング差が小さい
      const ids = [result![0].playerId, result![1].playerId].sort();
      expect(ids).toEqual(["a", "c"]);
    });

    it("マッチ不可能なキューではnullを返す", () => {
      const queue = [entry("a", 1000, 0), entry("b", 2000, 0)];
      expect(findMatch(queue, 0, config)).toBeNull();
    });
  });

  describe("generateRoomId", () => {
    it("ユニークなIDを生成する", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateRoomId());
      }
      expect(ids.size).toBe(100);
    });

    it("room_プレフィックスで始まる", () => {
      expect(generateRoomId()).toMatch(/^room_/);
    });
  });

  describe("createMatchmakingEntry", () => {
    it("エントリを正しく作成する", () => {
      const e = createMatchmakingEntry("player1", "socket1", 1600);
      expect(e.playerId).toBe("player1");
      expect(e.socketId).toBe("socket1");
      expect(e.rating).toBe(1600);
      expect(e.joinedAt).toBeGreaterThan(0);
    });
  });
});
