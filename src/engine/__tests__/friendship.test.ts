import { describe, it, expect } from "vitest";
import {
  getFriendship,
  getFriendshipLevel,
  getFriendshipText,
  onLevelUp,
  onBattleWin,
  onHeal,
  onFaint,
  getCriticalRateBonus,
  canEvolveByFriendship,
  DEFAULT_BASE_FRIENDSHIP,
  MAX_FRIENDSHIP,
  MIN_FRIENDSHIP,
} from "../friendship";
import type { MonsterInstance, MonsterSpecies } from "@/types";

function createMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    uid: "test-1",
    speciesId: "himori",
    level: 50,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 150,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
    ...overrides,
  };
}

function createSpecies(overrides?: Partial<MonsterSpecies>): MonsterSpecies {
  return {
    id: "himori",
    name: "ヒモリ",
    types: ["fire"],
    baseStats: { hp: 65, atk: 63, def: 45, spAtk: 80, spDef: 60, speed: 65 },
    baseExpYield: 64,
    expGroup: "medium_slow",
    learnset: [{ level: 1, moveId: "tackle" }],
    ...overrides,
  };
}

describe("getFriendship", () => {
  it("friendship未設定時はデフォルト値70を返す", () => {
    const monster = createMonster();
    expect(getFriendship(monster)).toBe(DEFAULT_BASE_FRIENDSHIP);
  });

  it("friendship設定済みならその値を返す", () => {
    const monster = createMonster({ friendship: 200 });
    expect(getFriendship(monster)).toBe(200);
  });

  it("種族のbaseFriendshipが設定されていればそれを使う", () => {
    const monster = createMonster();
    const species = createSpecies({ baseFriendship: 35 });
    expect(getFriendship(monster, species)).toBe(35);
  });

  it("friendship=0は有効な値として0を返す", () => {
    const monster = createMonster({ friendship: 0 });
    expect(getFriendship(monster)).toBe(0);
  });
});

describe("getFriendshipLevel", () => {
  it("0はlow", () => {
    expect(getFriendshipLevel(0)).toBe("low");
  });

  it("49はlow", () => {
    expect(getFriendshipLevel(49)).toBe("low");
  });

  it("50はnormal", () => {
    expect(getFriendshipLevel(50)).toBe("normal");
  });

  it("149はnormal", () => {
    expect(getFriendshipLevel(149)).toBe("normal");
  });

  it("150はhigh", () => {
    expect(getFriendshipLevel(150)).toBe("high");
  });

  it("254はhigh", () => {
    expect(getFriendshipLevel(254)).toBe("high");
  });

  it("255はmax", () => {
    expect(getFriendshipLevel(255)).toBe("max");
  });
});

describe("getFriendshipText", () => {
  it("段階に応じた日本語テキストを返す", () => {
    expect(getFriendshipText(0)).toContain("警戒");
    expect(getFriendshipText(70)).toContain("ふつう");
    expect(getFriendshipText(200)).toContain("とても");
    expect(getFriendshipText(255)).toContain("最高");
  });
});

describe("なつき度変更", () => {
  it("レベルアップでなつき度が上昇する", () => {
    const monster = createMonster({ friendship: 70 });
    onLevelUp(monster);
    expect(monster.friendship).toBeGreaterThan(70);
  });

  it("なつき度が低い時はレベルアップで多く上昇する", () => {
    const lowFriendship = createMonster({ friendship: 50 });
    const highFriendship = createMonster({ friendship: 210 });
    onLevelUp(lowFriendship);
    onLevelUp(highFriendship);
    const lowDelta = lowFriendship.friendship! - 50;
    const highDelta = highFriendship.friendship! - 210;
    expect(lowDelta).toBeGreaterThan(highDelta);
  });

  it("バトル勝利でなつき度が上昇する", () => {
    const monster = createMonster({ friendship: 100 });
    onBattleWin(monster);
    expect(monster.friendship).toBeGreaterThan(100);
  });

  it("回復でなつき度が上昇する", () => {
    const monster = createMonster({ friendship: 100 });
    onHeal(monster);
    expect(monster.friendship).toBe(101);
  });

  it("瀕死でなつき度が低下する", () => {
    const monster = createMonster({ friendship: 100 });
    onFaint(monster);
    expect(monster.friendship).toBe(99);
  });

  it("なつき度は255を超えない", () => {
    const monster = createMonster({ friendship: 254 });
    onLevelUp(monster);
    expect(monster.friendship).toBe(MAX_FRIENDSHIP);
  });

  it("なつき度は0を下回らない", () => {
    const monster = createMonster({ friendship: 0 });
    onFaint(monster);
    expect(monster.friendship).toBe(MIN_FRIENDSHIP);
  });
});

describe("getCriticalRateBonus", () => {
  it("なつき度220以上で急所率ボーナスがある", () => {
    const monster = createMonster({ friendship: 220 });
    expect(getCriticalRateBonus(monster)).toBeGreaterThan(0);
  });

  it("なつき度219以下ではボーナスなし", () => {
    const monster = createMonster({ friendship: 219 });
    expect(getCriticalRateBonus(monster)).toBe(0);
  });
});

describe("canEvolveByFriendship", () => {
  it("なつき度220以上かつfriendship進化条件ありで進化先を返す", () => {
    const monster = createMonster({ friendship: 220 });
    const species = createSpecies({
      evolvesTo: [{ id: "enjuu", level: 1, condition: "friendship" }],
    });
    expect(canEvolveByFriendship(monster, species)).toBe("enjuu");
  });

  it("なつき度不足では進化しない", () => {
    const monster = createMonster({ friendship: 200 });
    const species = createSpecies({
      evolvesTo: [{ id: "enjuu", level: 1, condition: "friendship" }],
    });
    expect(canEvolveByFriendship(monster, species)).toBeNull();
  });

  it("friendship条件がない進化先は対象外", () => {
    const monster = createMonster({ friendship: 255 });
    const species = createSpecies({
      evolvesTo: [{ id: "enjuu", level: 36 }],
    });
    expect(canEvolveByFriendship(monster, species)).toBeNull();
  });

  it("evolvesToがない種族はnull", () => {
    const monster = createMonster({ friendship: 255 });
    const species = createSpecies({ evolvesTo: undefined });
    expect(canEvolveByFriendship(monster, species)).toBeNull();
  });
});
