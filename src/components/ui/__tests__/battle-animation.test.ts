import { describe, it, expect } from "vitest";
import {
  createAttackAnimation,
  createDamageAnimation,
  createFaintAnimation,
  createStatusAnimation,
  createStatChangeAnimation,
  createHealAnimation,
} from "../BattleAnimation";

describe("バトルアニメーションイベント生成", () => {
  describe("createAttackAnimation", () => {
    it("物理技の攻撃アニメーションを生成する", () => {
      const event = createAttackAnimation("opponent", "physical", "fire");
      expect(event.type).toBe("attack_physical");
      expect(event.target).toBe("opponent");
      expect(event.moveType).toBe("fire");
    });

    it("特殊技の攻撃アニメーションを生成する", () => {
      const event = createAttackAnimation("player", "special", "water");
      expect(event.type).toBe("attack_special");
      expect(event.target).toBe("player");
      expect(event.moveType).toBe("water");
    });
  });

  describe("createDamageAnimation", () => {
    it("プレイヤーへのダメージアニメーション", () => {
      const event = createDamageAnimation("player");
      expect(event.type).toBe("damage");
      expect(event.target).toBe("player");
    });

    it("相手へのダメージアニメーション", () => {
      const event = createDamageAnimation("opponent");
      expect(event.type).toBe("damage");
      expect(event.target).toBe("opponent");
    });
  });

  describe("createFaintAnimation", () => {
    it("瀕死アニメーションは長めの持続時間", () => {
      const event = createFaintAnimation("player");
      expect(event.type).toBe("faint");
      expect(event.target).toBe("player");
      expect(event.duration).toBe(1000);
    });
  });

  describe("createStatusAnimation", () => {
    it("状態異常アニメーションを生成する", () => {
      const event = createStatusAnimation("opponent", "poison");
      expect(event.type).toBe("status_inflict");
      expect(event.target).toBe("opponent");
      expect(event.moveType).toBe("poison");
    });

    it("moveType無しでも生成可能", () => {
      const event = createStatusAnimation("player");
      expect(event.type).toBe("status_inflict");
      expect(event.moveType).toBeUndefined();
    });
  });

  describe("createStatChangeAnimation", () => {
    it("ステータスアップアニメーション", () => {
      const event = createStatChangeAnimation("player", "up");
      expect(event.type).toBe("stat_up");
      expect(event.target).toBe("player");
    });

    it("ステータスダウンアニメーション", () => {
      const event = createStatChangeAnimation("opponent", "down");
      expect(event.type).toBe("stat_down");
      expect(event.target).toBe("opponent");
    });
  });

  describe("createHealAnimation", () => {
    it("回復アニメーションを生成する", () => {
      const event = createHealAnimation("player");
      expect(event.type).toBe("heal");
      expect(event.target).toBe("player");
    });
  });

  describe("全アニメーションタイプの網羅", () => {
    it("8種類のアニメーションタイプが全て生成可能", () => {
      const types = new Set([
        createAttackAnimation("player", "physical", "normal").type,
        createAttackAnimation("player", "special", "fire").type,
        createDamageAnimation("player").type,
        createFaintAnimation("player").type,
        createStatusAnimation("player").type,
        createStatChangeAnimation("player", "up").type,
        createStatChangeAnimation("player", "down").type,
        createHealAnimation("player").type,
      ]);
      expect(types.size).toBe(8);
    });

    it("全タイプでtargetがplayer/opponentのどちらかを指定可能", () => {
      const targets = ["player", "opponent"] as const;
      for (const target of targets) {
        expect(createAttackAnimation(target, "physical", "normal").target).toBe(target);
        expect(createDamageAnimation(target).target).toBe(target);
        expect(createFaintAnimation(target).target).toBe(target);
        expect(createHealAnimation(target).target).toBe(target);
      }
    });
  });
});
