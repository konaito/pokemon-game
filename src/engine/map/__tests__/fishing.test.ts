import { describe, it, expect } from "vitest";
import {
  isRodSufficient,
  getRodById,
  rollFishingHit,
  getAvailableEncounters,
  selectFishingEncounter,
  rollFishingLevel,
  getFishingMessage,
  FISHING_RODS,
  DEFAULT_FISHING_TABLES,
} from "../fishing";

describe("釣り竿データ", () => {
  it("3種類の竿がある", () => {
    expect(FISHING_RODS).toHaveLength(3);
  });

  it("getRodByIdで取得できる", () => {
    expect(getRodById("old_rod")!.rank).toBe("old");
    expect(getRodById("good_rod")!.rank).toBe("good");
    expect(getRodById("super_rod")!.rank).toBe("super");
  });

  it("ヒット率が竿ランクに比例して上がる", () => {
    const old = getRodById("old_rod")!;
    const good = getRodById("good_rod")!;
    const sup = getRodById("super_rod")!;
    expect(old.hitRate).toBeLessThan(good.hitRate);
    expect(good.hitRate).toBeLessThan(sup.hitRate);
  });
});

describe("isRodSufficient", () => {
  it("同じランクは十分", () => {
    expect(isRodSufficient("old", "old")).toBe(true);
    expect(isRodSufficient("good", "good")).toBe(true);
  });

  it("上位ランクは十分", () => {
    expect(isRodSufficient("super", "old")).toBe(true);
    expect(isRodSufficient("good", "old")).toBe(true);
  });

  it("下位ランクは不十分", () => {
    expect(isRodSufficient("old", "good")).toBe(false);
    expect(isRodSufficient("old", "super")).toBe(false);
  });
});

describe("rollFishingHit", () => {
  it("ヒット率以下でヒット", () => {
    const rod = getRodById("old_rod")!; // hitRate: 0.5
    expect(rollFishingHit(rod, () => 0.3)).toBe(true);
    expect(rollFishingHit(rod, () => 0.6)).toBe(false);
  });
});

describe("getAvailableEncounters", () => {
  const table = DEFAULT_FISHING_TABLES[0]; // kawasemi_city

  it("ボロのつりざおではold以上のみ", () => {
    const enc = getAvailableEncounters(table, "old");
    expect(enc.length).toBe(1);
  });

  it("いいつりざおではgood以上のみ", () => {
    const enc = getAvailableEncounters(table, "good");
    expect(enc.length).toBe(2);
  });

  it("すごいつりざおでは全て利用可能", () => {
    const enc = getAvailableEncounters(table, "super");
    expect(enc.length).toBe(3);
  });
});

describe("selectFishingEncounter", () => {
  it("空テーブルはnull", () => {
    expect(selectFishingEncounter([])).toBeNull();
  });

  it("重みに基づいて選択される", () => {
    const encounters = DEFAULT_FISHING_TABLES[0].encounters;
    const result = selectFishingEncounter(encounters, () => 0.01);
    expect(result).toBeDefined();
    expect(result!.speciesId).toBeTruthy();
  });
});

describe("rollFishingLevel", () => {
  it("竿のレベルボーナスが適用される", () => {
    const encounter = {
      speciesId: "test",
      minLevel: 10,
      maxLevel: 15,
      weight: 1,
      minRod: "old" as const,
    };
    const oldRod = getRodById("old_rod")!;
    const superRod = getRodById("super_rod")!;

    const oldLevel = rollFishingLevel(encounter, oldRod, () => 0);
    const superLevel = rollFishingLevel(encounter, superRod, () => 0);

    expect(superLevel).toBe(oldLevel + superRod.levelBonus);
  });

  it("レベルがmin〜maxの範囲内", () => {
    const encounter = {
      speciesId: "test",
      minLevel: 10,
      maxLevel: 15,
      weight: 1,
      minRod: "old" as const,
    };
    const rod = getRodById("old_rod")!;

    for (let i = 0; i < 10; i++) {
      const level = rollFishingLevel(encounter, rod, Math.random);
      expect(level).toBeGreaterThanOrEqual(10);
      expect(level).toBeLessThanOrEqual(15);
    }
  });
});

describe("getFishingMessage", () => {
  it("各フェーズのメッセージを返す", () => {
    expect(getFishingMessage("cast").length).toBeGreaterThan(0);
    expect(getFishingMessage("hit")).toContain("かかった");
    expect(getFishingMessage("miss")).toContain("逃げ");
    expect(getFishingMessage("nothing")).toContain("釣れなかった");
  });
});

describe("DEFAULT_FISHING_TABLES", () => {
  it("2つの釣りテーブルがある", () => {
    expect(DEFAULT_FISHING_TABLES).toHaveLength(2);
  });

  it("各テーブルにエンカウントがある", () => {
    for (const table of DEFAULT_FISHING_TABLES) {
      expect(table.encounters.length).toBeGreaterThan(0);
    }
  });
});
