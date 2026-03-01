import { describe, it, expect } from "vitest";
import { executeMove, executeStruggle } from "../move-executor";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";

function createMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    uid: "test-exec",
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

const physicalMove: MoveDefinition = {
  id: "tackle",
  name: "たいあたり",
  type: "normal",
  category: "physical",
  power: 40,
  accuracy: 100,
  pp: 35,
  priority: 0,
};

const statusMove: MoveDefinition = {
  id: "thunder-wave",
  name: "でんじは",
  type: "electric",
  category: "status",
  power: null,
  accuracy: 100,
  pp: 20,
  priority: 0,
  effect: {
    statusCondition: "paralysis",
  },
};

// 常に命中する高乱数（急所なし）
const alwaysHitRng = () => 0.99;

describe("executeMove", () => {
  describe("PP管理", () => {
    it("PP消費される", () => {
      const attacker = createMonster({
        moves: [{ moveId: "tackle", currentPp: 10 }],
      });
      executeMove(
        attacker,
        createSpecies(),
        createMonster(),
        createSpecies(),
        physicalMove,
        alwaysHitRng,
      );
      expect(attacker.moves[0].currentPp).toBe(9);
    });

    it("PP0で使用不能", () => {
      const attacker = createMonster({
        moves: [{ moveId: "tackle", currentPp: 0 }],
      });
      const result = executeMove(
        attacker,
        createSpecies(),
        createMonster(),
        createSpecies(),
        physicalMove,
        alwaysHitRng,
      );
      expect(result.hit).toBe(false);
      expect(result.messages).toContain("しかし技のPPが足りない！");
    });
  });

  describe("命中判定", () => {
    it("命中: hitRoll < accuracy", () => {
      const result = executeMove(
        createMonster(),
        createSpecies(),
        createMonster(),
        createSpecies(),
        physicalMove,
        alwaysHitRng,
      );
      expect(result.hit).toBe(true);
    });

    it("外れ: hitRoll >= accuracy", () => {
      const lowAccuracyMove: MoveDefinition = { ...physicalMove, accuracy: 50 };
      // rng() * 100 = 99 >= 50 → 外れ
      const result = executeMove(
        createMonster(),
        createSpecies(),
        createMonster(),
        createSpecies(),
        lowAccuracyMove,
        alwaysHitRng,
      );
      expect(result.hit).toBe(false);
      expect(result.messages).toContain("しかし攻撃は外れた！");
    });
  });

  describe("状態異常による行動不能", () => {
    it("眠り: 行動不能メッセージ", () => {
      const attacker = createMonster({ status: "sleep" });
      // rng() = 0.99 >= 1/3 → 起きない
      const result = executeMove(
        attacker,
        createSpecies({ name: "スリーパー" }),
        createMonster(),
        createSpecies(),
        physicalMove,
        alwaysHitRng,
      );
      expect(result.hit).toBe(false);
      expect(result.messages[0]).toContain("ぐうぐう眠っている");
    });

    it("氷: 行動不能メッセージ", () => {
      const attacker = createMonster({ status: "freeze" });
      const result = executeMove(
        attacker,
        createSpecies({ name: "フリーザー" }),
        createMonster(),
        createSpecies(),
        physicalMove,
        alwaysHitRng,
      );
      expect(result.hit).toBe(false);
      expect(result.messages[0]).toContain("凍って動けない");
    });
  });

  describe("ダメージ技", () => {
    it("ダメージを与えてdefenderHpAfterが減少する", () => {
      const defender = createMonster({ currentHp: 100 });
      const result = executeMove(
        createMonster(),
        createSpecies(),
        defender,
        createSpecies(),
        physicalMove,
        alwaysHitRng,
      );
      expect(result.hit).toBe(true);
      expect(result.damage).not.toBeNull();
      expect(result.defenderHpAfter).toBeLessThan(100);
    });

    it("HPが0以下にならない", () => {
      const defender = createMonster({ currentHp: 1 });
      const highPowerMove: MoveDefinition = { ...physicalMove, power: 200 };
      const result = executeMove(
        createMonster(),
        createSpecies(),
        defender,
        createSpecies(),
        highPowerMove,
        alwaysHitRng,
      );
      expect(result.defenderHpAfter).toBe(0);
    });

    it("効果抜群メッセージ", () => {
      const fireMove: MoveDefinition = {
        ...physicalMove,
        id: "ember",
        name: "ひのこ",
        type: "fire",
      };
      const result = executeMove(
        createMonster(),
        createSpecies({ types: ["fire"] }),
        createMonster(),
        createSpecies({ types: ["grass"] }),
        fireMove,
        alwaysHitRng,
      );
      expect(result.messages).toContain("効果は抜群だ！");
    });

    it("いまひとつメッセージ", () => {
      const fireMove: MoveDefinition = {
        ...physicalMove,
        id: "ember",
        name: "ひのこ",
        type: "fire",
      };
      const result = executeMove(
        createMonster(),
        createSpecies({ types: ["fire"] }),
        createMonster(),
        createSpecies({ types: ["water"] }),
        fireMove,
        alwaysHitRng,
      );
      expect(result.messages).toContain("効果はいまひとつのようだ...");
    });
  });

  describe("ステータス技", () => {
    it("状態異常を付与する", () => {
      // rng = 0 → canAct=true（状態異常なし）, hitRoll=0 < 100（命中）, statusRoll=0 < 100（付与）
      const result = executeMove(
        createMonster(),
        createSpecies(),
        createMonster(),
        createSpecies({ name: "ターゲット" }),
        statusMove,
        () => 0.5,
      );
      expect(result.hit).toBe(true);
      expect(result.statusApplied).toBe("paralysis");
      expect(result.damage).toBeNull();
    });

    it("既に状態異常がある場合は付与しない", () => {
      const defender = createMonster({ status: "poison" });
      const result = executeMove(
        createMonster(),
        createSpecies(),
        defender,
        createSpecies(),
        statusMove,
        () => 0.5,
      );
      expect(result.statusApplied).toBeNull();
    });

    it("能力変化を含むステータス技", () => {
      const buffMove: MoveDefinition = {
        id: "swords-dance",
        name: "つるぎのまい",
        type: "normal",
        category: "status",
        power: null,
        accuracy: 100,
        pp: 20,
        priority: 0,
        effect: { statChanges: { atk: 2 } },
      };
      const result = executeMove(
        createMonster(),
        createSpecies(),
        createMonster(),
        createSpecies(),
        buffMove,
        () => 0.5,
      );
      expect(result.hit).toBe(true);
      expect(result.statChanges).toBeDefined();
      expect(result.statChanges!.target).toBe("self");
      expect(result.statChanges!.changes.atk).toBe(2);
    });

    it("デバフ技は相手に適用", () => {
      const debuffMove: MoveDefinition = {
        id: "growl",
        name: "なきごえ",
        type: "normal",
        category: "status",
        power: null,
        accuracy: 100,
        pp: 40,
        priority: 0,
        effect: { statChanges: { atk: -1 } },
      };
      const result = executeMove(
        createMonster(),
        createSpecies(),
        createMonster(),
        createSpecies(),
        debuffMove,
        () => 0.5,
      );
      expect(result.statChanges!.target).toBe("opponent");
    });

    it("効果なし（状態異常もバフもなし）", () => {
      const noEffectMove: MoveDefinition = {
        id: "splash",
        name: "はねる",
        type: "normal",
        category: "status",
        power: null,
        accuracy: 100,
        pp: 40,
        priority: 0,
      };
      const result = executeMove(
        createMonster(),
        createSpecies(),
        createMonster(),
        createSpecies(),
        noEffectMove,
        () => 0.5,
      );
      expect(result.messages).toContain("しかし効果がなかった！");
    });
  });

  describe("ダメージ技の追加効果", () => {
    it("追加効果で状態異常付与", () => {
      const burnMove: MoveDefinition = {
        ...physicalMove,
        id: "fire-fang",
        name: "ほのおのキバ",
        type: "fire",
        effect: { statusCondition: "burn", statusChance: 100 },
      };
      // rng常に0.5: canAct=true, hitRoll=50 < 100, damageRng=0.5, statusRoll=50 < 100
      const result = executeMove(
        createMonster(),
        createSpecies({ types: ["fire"] }),
        createMonster({ currentHp: 200 }),
        createSpecies({ name: "ターゲット" }),
        burnMove,
        () => 0.5,
      );
      expect(result.statusApplied).toBe("burn");
    });

    it("瀕死時は追加効果なし", () => {
      const burnMove: MoveDefinition = {
        ...physicalMove,
        id: "fire-fang",
        name: "ほのおのキバ",
        type: "fire",
        power: 200,
        effect: { statusCondition: "burn", statusChance: 100 },
      };
      const result = executeMove(
        createMonster(),
        createSpecies({ types: ["fire"] }),
        createMonster({ currentHp: 1 }),
        createSpecies(),
        burnMove,
        () => 0.5,
      );
      expect(result.statusApplied).toBeNull();
    });
  });
});

describe("executeStruggle", () => {
  it("ダメージを与える（level * 2）", () => {
    const attacker = createMonster({ level: 50, currentHp: 200 });
    const defender = createMonster({ currentHp: 200 });
    const result = executeStruggle(
      attacker,
      createSpecies(),
      defender,
      createSpecies(),
      200,
      alwaysHitRng,
    );
    expect(result.hit).toBe(true);
    expect(result.damage!.damage).toBe(100); // floor(50 * 2) = 100
    expect(result.defenderHpAfter).toBe(100);
  });

  it("反動ダメージを受ける（maxHP/4）", () => {
    const attacker = createMonster({ level: 50, currentHp: 200 });
    const maxHp = 200;
    executeStruggle(
      attacker,
      createSpecies(),
      createMonster(),
      createSpecies(),
      maxHp,
      alwaysHitRng,
    );
    expect(attacker.currentHp).toBe(150); // 200 - 50
  });

  it("反動ダメージは最低1", () => {
    const attacker = createMonster({ level: 50, currentHp: 100 });
    const maxHp = 3; // floor(3/4)=0 → max(1,0)=1
    executeStruggle(
      attacker,
      createSpecies(),
      createMonster(),
      createSpecies(),
      maxHp,
      alwaysHitRng,
    );
    expect(attacker.currentHp).toBe(99);
  });

  it("反動で自分が倒れる", () => {
    const attacker = createMonster({ level: 50, currentHp: 10 });
    executeStruggle(attacker, createSpecies(), createMonster(), createSpecies(), 200, alwaysHitRng);
    expect(attacker.currentHp).toBe(0);
  });

  it("状態異常で行動不能", () => {
    const attacker = createMonster({ level: 50, currentHp: 200, status: "sleep" });
    const result = executeStruggle(
      attacker,
      createSpecies({ name: "スリーパー" }),
      createMonster(),
      createSpecies(),
      200,
      alwaysHitRng,
    );
    expect(result.hit).toBe(false);
    expect(result.messages[0]).toContain("ぐうぐう眠っている");
  });

  it("メッセージに「わるあがき」と「反動」が含まれる", () => {
    const attacker = createMonster({ level: 50, currentHp: 200 });
    const result = executeStruggle(
      attacker,
      createSpecies({ name: "テスト" }),
      createMonster(),
      createSpecies(),
      200,
      alwaysHitRng,
    );
    expect(result.messages.some((m) => m.includes("わるあがき"))).toBe(true);
    expect(result.messages.some((m) => m.includes("反動"))).toBe(true);
  });
});
