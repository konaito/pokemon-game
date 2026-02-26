import { describe, it, expect } from "vitest";
import {
  createTradeRoom,
  offerMonster,
  confirmTrade,
  cancelTrade,
  resolveTradeResult,
  canTradeMonster,
} from "../trade";
import type { MonsterInstance } from "@/types";

function dummyMonster(speciesId: string, uid: string = "uid-1"): MonsterInstance {
  return {
    uid,
    speciesId,
    level: 10,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 30,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

describe("交換システム", () => {
  describe("createTradeRoom", () => {
    it("交換ルームを作成できる", () => {
      const room = createTradeRoom(
        "room1",
        { id: "a", socketId: "sa" },
        { id: "b", socketId: "sb" },
      );
      expect(room.id).toBe("room1");
      expect(room.state).toBe("offering");
      expect(room.players).toHaveLength(2);
      expect(room.players[0].offeredMonsterUid).toBeNull();
      expect(room.players[1].offeredMonsterUid).toBeNull();
    });
  });

  describe("offerMonster", () => {
    it("片方だけ提示してもofferingのまま", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = offerMonster(room, "a", "mon-1");
      expect(room.state).toBe("offering");
      expect(room.players[0].offeredMonsterUid).toBe("mon-1");
    });

    it("両方提示するとconfirmingに遷移", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = offerMonster(room, "a", "mon-1");
      room = offerMonster(room, "b", "mon-2");
      expect(room.state).toBe("confirming");
    });

    it("提示を変更すると相手のconfirmedがリセットされる", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = offerMonster(room, "a", "mon-1");
      room = offerMonster(room, "b", "mon-2");
      room = confirmTrade(room, "b");
      // Aが提示を変更
      room = { ...room, state: "offering" as const }; // 状態をofferingに戻す
      room = offerMonster(room, "a", "mon-3");
      expect(room.players[1].confirmed).toBe(false);
    });
  });

  describe("confirmTrade", () => {
    it("片方だけconfirmしてもconfirmingのまま", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = offerMonster(room, "a", "mon-1");
      room = offerMonster(room, "b", "mon-2");
      room = confirmTrade(room, "a");
      expect(room.state).toBe("confirming");
      expect(room.players[0].confirmed).toBe(true);
    });

    it("両方confirmするとcompleteに遷移", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = offerMonster(room, "a", "mon-1");
      room = offerMonster(room, "b", "mon-2");
      room = confirmTrade(room, "a");
      room = confirmTrade(room, "b");
      expect(room.state).toBe("complete");
    });

    it("offering状態でconfirmしても変化なし", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = confirmTrade(room, "a");
      expect(room.state).toBe("offering");
    });
  });

  describe("cancelTrade", () => {
    it("キャンセルするとcancelled状態になる", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = cancelTrade(room);
      expect(room.state).toBe("cancelled");
    });
  });

  describe("resolveTradeResult", () => {
    it("complete状態の交換結果を生成する", () => {
      let room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      room = offerMonster(room, "a", "mon-1");
      room = offerMonster(room, "b", "mon-2");
      room = confirmTrade(room, "a");
      room = confirmTrade(room, "b");

      const result = resolveTradeResult(room);
      expect(result.success).toBe(true);
      expect(result.exchanges).toHaveLength(2);
      expect(result.exchanges![0]).toEqual({
        playerId: "a",
        receivedMonsterUid: "mon-2",
      });
      expect(result.exchanges![1]).toEqual({
        playerId: "b",
        receivedMonsterUid: "mon-1",
      });
    });

    it("未完了の交換はエラーを返す", () => {
      const room = createTradeRoom("r", { id: "a", socketId: "sa" }, { id: "b", socketId: "sb" });
      const result = resolveTradeResult(room);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("canTradeMonster", () => {
    it("通常のモンスターは交換可能", () => {
      const mon = dummyMonster("konezumi");
      const result = canTradeMonster(mon, 3);
      expect(result.tradeable).toBe(true);
    });

    it("手持ちが1匹の場合は交換不可", () => {
      const mon = dummyMonster("konezumi");
      const result = canTradeMonster(mon, 1);
      expect(result.tradeable).toBe(false);
      expect(result.reason).toContain("1匹");
    });

    it("伝説のモンスターは交換不可", () => {
      const mon = dummyMonster("omoide");
      const result = canTradeMonster(mon, 3);
      expect(result.tradeable).toBe(false);
      expect(result.reason).toContain("伝説");
    });

    it("ワスレヌも交換不可", () => {
      const mon = dummyMonster("wasurenu");
      const result = canTradeMonster(mon, 3);
      expect(result.tradeable).toBe(false);
    });
  });
});
