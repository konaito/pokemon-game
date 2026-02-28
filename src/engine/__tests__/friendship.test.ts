import { describe, it, expect } from "vitest";
import type { MonsterInstance } from "@/types";
import {
  getFriendshipLevel,
  getFriendship,
  applyFriendshipEvent,
  applyFriendshipEventToMonster,
  hasFriendshipBonus,
  getFriendshipCritBonus,
  getFriendshipStatusRecoveryChance,
  canEvolveByFriendship,
  getFriendshipDescription,
  BASE_FRIENDSHIP,
  MAX_FRIENDSHIP,
  MIN_FRIENDSHIP,
  FRIENDSHIP_EVOLUTION_THRESHOLD,
} from "../friendship";

function makeMonster(overrides: Partial<MonsterInstance> = {}): MonsterInstance {
  return {
    uid: "test-1",
    speciesId: "test_species",
    level: 50,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
    ...overrides,
  };
}

describe("getFriendshipLevel", () => {
  it("0-49はlow", () => {
    expect(getFriendshipLevel(0)).toBe("low");
    expect(getFriendshipLevel(49)).toBe("low");
  });

  it("50-149はnormal", () => {
    expect(getFriendshipLevel(50)).toBe("normal");
    expect(getFriendshipLevel(149)).toBe("normal");
  });

  it("150-254はhigh", () => {
    expect(getFriendshipLevel(150)).toBe("high");
    expect(getFriendshipLevel(254)).toBe("high");
  });

  it("255はmax", () => {
    expect(getFriendshipLevel(255)).toBe("max");
  });
});

describe("getFriendship", () => {
  it("設定されていればその値を返す", () => {
    const monster = makeMonster({ friendship: 200 });
    expect(getFriendship(monster)).toBe(200);
  });

  it("未設定ならBASE_FRIENDSHIPを返す", () => {
    const monster = makeMonster();
    expect(getFriendship(monster)).toBe(BASE_FRIENDSHIP);
  });
});

describe("applyFriendshipEvent", () => {
  it("レベルアップで上昇（low帯: +5）", () => {
    expect(applyFriendshipEvent(30, "level_up")).toBe(35);
  });

  it("レベルアップで上昇（normal帯: +4）", () => {
    expect(applyFriendshipEvent(70, "level_up")).toBe(74);
  });

  it("レベルアップで上昇（high帯: +3）", () => {
    expect(applyFriendshipEvent(200, "level_up")).toBe(203);
  });

  it("バトル勝利で上昇", () => {
    expect(applyFriendshipEvent(70, "battle_victory")).toBe(72);
  });

  it("回復で上昇", () => {
    expect(applyFriendshipEvent(70, "healing")).toBe(71);
  });

  it("瀕死で低下", () => {
    expect(applyFriendshipEvent(70, "faint")).toBe(69);
  });

  it("苦い薬で低下（low帯: -3）", () => {
    expect(applyFriendshipEvent(30, "bitter_medicine")).toBe(27);
  });

  it("最大値を超えない", () => {
    expect(applyFriendshipEvent(254, "level_up")).toBe(255);
  });

  it("最小値を下回らない", () => {
    expect(applyFriendshipEvent(0, "faint")).toBe(0);
  });

  it("max帯（255）はhighと同じ変動量", () => {
    expect(applyFriendshipEvent(255, "faint")).toBe(254);
  });
});

describe("applyFriendshipEventToMonster", () => {
  it("モンスターのなつき度を変更した新しいインスタンスを返す", () => {
    const monster = makeMonster({ friendship: 100 });
    const updated = applyFriendshipEventToMonster(monster, "level_up");
    expect(updated.friendship).toBe(104);
    expect(monster.friendship).toBe(100); // 元は変わらない
  });

  it("friendshipが未設定でもBASE_FRIENDSHIPから計算", () => {
    const monster = makeMonster();
    const updated = applyFriendshipEventToMonster(monster, "level_up");
    expect(updated.friendship).toBe(BASE_FRIENDSHIP + 4); // normal帯: +4
  });
});

describe("バトルボーナス", () => {
  it("220以上でボーナスあり", () => {
    expect(hasFriendshipBonus(220)).toBe(true);
    expect(hasFriendshipBonus(255)).toBe(true);
  });

  it("220未満でボーナスなし", () => {
    expect(hasFriendshipBonus(219)).toBe(false);
    expect(hasFriendshipBonus(0)).toBe(false);
  });

  it("急所ボーナス: 220以上で+1", () => {
    expect(getFriendshipCritBonus(220)).toBe(1);
    expect(getFriendshipCritBonus(219)).toBe(0);
  });

  it("状態異常回復: 255で10%", () => {
    expect(getFriendshipStatusRecoveryChance(255)).toBe(0.1);
    expect(getFriendshipStatusRecoveryChance(254)).toBe(0);
  });
});

describe("canEvolveByFriendship", () => {
  it("220以上でなつき進化可能", () => {
    const monster = makeMonster({ friendship: 220 });
    expect(canEvolveByFriendship(monster)).toBe(true);
  });

  it("220未満では不可", () => {
    const monster = makeMonster({ friendship: 219 });
    expect(canEvolveByFriendship(monster)).toBe(false);
  });

  it("カスタム閾値を指定可能", () => {
    const monster = makeMonster({ friendship: 180 });
    expect(canEvolveByFriendship(monster, 180)).toBe(true);
    expect(canEvolveByFriendship(monster, 200)).toBe(false);
  });

  it("friendship未設定（70）では不可", () => {
    const monster = makeMonster();
    expect(canEvolveByFriendship(monster)).toBe(false);
  });
});

describe("getFriendshipDescription", () => {
  it("各段階に対応する説明文を返す", () => {
    expect(getFriendshipDescription(0)).toContain("警戒");
    expect(getFriendshipDescription(70)).toContain("慣れ");
    expect(getFriendshipDescription(200)).toContain("懐い");
    expect(getFriendshipDescription(255)).toContain("信頼");
  });
});
