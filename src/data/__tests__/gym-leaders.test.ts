import { describe, it, expect } from "vitest";
import { GYM_LEADERS } from "../gyms";
import { ALL_SPECIES } from "../monsters";

const speciesIds = new Set(ALL_SPECIES.map((s) => s.id));

describe("ジムリーダーデータ", () => {
  it("8人のジムリーダーが定義されている", () => {
    expect(GYM_LEADERS).toHaveLength(8);
  });

  it("ジム番号が1〜8で連続している", () => {
    const numbers = GYM_LEADERS.map((g) => g.gymNumber);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("全ジムリーダーにユニークなIDがある", () => {
    const ids = GYM_LEADERS.map((g) => g.id);
    expect(new Set(ids).size).toBe(8);
  });

  it("全ジムリーダーにバッジ名がある", () => {
    for (const gym of GYM_LEADERS) {
      expect(gym.badgeName).toBeTruthy();
    }
  });

  it("全ジムリーダーのパーティに有効なspeciesIdが使われている", () => {
    for (const gym of GYM_LEADERS) {
      for (const member of gym.leaderParty) {
        expect(speciesIds.has(member.speciesId)).toBe(true);
      }
    }
  });

  it("パーティのレベルはジム番号が進むにつれ上昇する", () => {
    for (let i = 0; i < GYM_LEADERS.length - 1; i++) {
      const currentMax = Math.max(...GYM_LEADERS[i].leaderParty.map((p) => p.level));
      const nextMax = Math.max(...GYM_LEADERS[i + 1].leaderParty.map((p) => p.level));
      expect(nextMax).toBeGreaterThan(currentMax);
    }
  });

  it("各ジムにintroとdefeatの会話がある", () => {
    for (const gym of GYM_LEADERS) {
      expect(gym.leaderIntroDialogue.length).toBeGreaterThan(0);
      expect(gym.leaderDefeatDialogue.length).toBeGreaterThan(0);
    }
  });

  it("各ジムリーダーのパーティが2匹以上いる", () => {
    for (const gym of GYM_LEADERS) {
      expect(gym.leaderParty.length).toBeGreaterThanOrEqual(2);
    }
  });
});
