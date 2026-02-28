import { describe, it, expect } from "vitest";
import { checkEvolution, evolve, describeCondition } from "../evolution";
import type { EvolutionContext } from "../evolution";
import type { MonsterInstance, MonsterSpecies } from "@/types";

function createDummyMonster(level: number = 10, currentHp: number = 30): MonsterInstance {
  return {
    uid: `test-charmander-${level}`,
    speciesId: "charmander",
    level,
    exp: 1000,
    nature: "hardy",
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

const charmander: MonsterSpecies = {
  id: "charmander",
  name: "ヒトカゲ",
  types: ["fire"],
  baseStats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, speed: 65 },
  baseExpYield: 62,
  expGroup: "medium_fast",
  learnset: [],
  evolvesTo: [{ id: "charmeleon", level: 16 }],
};

const charmeleon: MonsterSpecies = {
  id: "charmeleon",
  name: "リザード",
  types: ["fire"],
  baseStats: { hp: 58, atk: 64, def: 58, spAtk: 80, spDef: 65, speed: 80 },
  baseExpYield: 142,
  expGroup: "medium_fast",
  learnset: [],
  evolvesTo: [{ id: "charizard", level: 36 }],
};

const noEvoSpecies: MonsterSpecies = {
  id: "pikachu",
  name: "ピカチュウ",
  types: ["electric"],
  baseStats: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, speed: 90 },
  baseExpYield: 112,
  expGroup: "medium_fast",
  learnset: [],
};

// アイテム進化用の種族
const itemEvoSpecies: MonsterSpecies = {
  id: "eevee-fire",
  name: "イーブイ",
  types: ["normal"],
  baseStats: { hp: 55, atk: 55, def: 50, spAtk: 45, spDef: 65, speed: 55 },
  baseExpYield: 65,
  expGroup: "medium_fast",
  learnset: [],
  evolvesTo: [{ id: "flareon", level: 1, condition: "item:fire-stone" }],
};

// 時間帯進化用の種族（分岐進化）
const timeEvoSpecies: MonsterSpecies = {
  id: "eevee-time",
  name: "イーブイ（時間）",
  types: ["normal"],
  baseStats: { hp: 55, atk: 55, def: 50, spAtk: 45, spDef: 65, speed: 55 },
  baseExpYield: 65,
  expGroup: "medium_fast",
  learnset: [],
  evolvesTo: [
    { id: "espeon", level: 30, condition: "time:day" },
    { id: "umbreon", level: 30, condition: "time:night" },
  ],
};

// なつき進化用の種族
const friendshipEvoSpecies: MonsterSpecies = {
  id: "togepi",
  name: "トゲピー",
  types: ["fairy"],
  baseStats: { hp: 35, atk: 20, def: 65, spAtk: 40, spDef: 65, speed: 20 },
  baseExpYield: 49,
  expGroup: "fast",
  learnset: [],
  evolvesTo: [{ id: "togetic", level: 1, condition: "friendship" }],
};

// 通信進化用の種族
const tradeEvoSpecies: MonsterSpecies = {
  id: "kadabra",
  name: "ユンゲラー",
  types: ["psychic"],
  baseStats: { hp: 40, atk: 35, def: 30, spAtk: 120, spDef: 70, speed: 105 },
  baseExpYield: 140,
  expGroup: "medium_slow",
  learnset: [],
  evolvesTo: [{ id: "alakazam", level: 1, condition: "trade" }],
};

describe("進化システム", () => {
  describe("checkEvolution — レベル進化", () => {
    it("レベルが進化条件を満たしていれば進化先IDを返す", () => {
      const monster = createDummyMonster(16);
      const result = checkEvolution(monster, charmander);
      expect(result).toBe("charmeleon");
    });

    it("レベルが足りなければ null を返す", () => {
      const monster = createDummyMonster(15);
      const result = checkEvolution(monster, charmander);
      expect(result).toBeNull();
    });

    it("進化先がない種族は null を返す", () => {
      const monster = createDummyMonster(99);
      const result = checkEvolution(monster, noEvoSpecies);
      expect(result).toBeNull();
    });
  });

  describe("checkEvolution — アイテム進化", () => {
    it("正しいアイテムを使用すれば進化する", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "eevee-fire";
      const ctx: EvolutionContext = { usedItemId: "fire-stone" };
      expect(checkEvolution(monster, itemEvoSpecies, ctx)).toBe("flareon");
    });

    it("アイテムなしでは進化しない", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "eevee-fire";
      expect(checkEvolution(monster, itemEvoSpecies)).toBeNull();
    });

    it("間違ったアイテムでは進化しない", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "eevee-fire";
      const ctx: EvolutionContext = { usedItemId: "water-stone" };
      expect(checkEvolution(monster, itemEvoSpecies, ctx)).toBeNull();
    });
  });

  describe("checkEvolution — 時間帯進化（分岐進化）", () => {
    it("昼にレベル条件を満たすとespeonに進化", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "eevee-time";
      const ctx: EvolutionContext = { timeOfDay: "day" };
      expect(checkEvolution(monster, timeEvoSpecies, ctx)).toBe("espeon");
    });

    it("夜にレベル条件を満たすとumbreonに進化", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "eevee-time";
      const ctx: EvolutionContext = { timeOfDay: "night" };
      expect(checkEvolution(monster, timeEvoSpecies, ctx)).toBe("umbreon");
    });

    it("時間帯指定なしでは進化しない", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "eevee-time";
      expect(checkEvolution(monster, timeEvoSpecies)).toBeNull();
    });

    it("レベルが足りなければ時間帯が合っていても進化しない", () => {
      const monster = createDummyMonster(29);
      monster.speciesId = "eevee-time";
      const ctx: EvolutionContext = { timeOfDay: "day" };
      expect(checkEvolution(monster, timeEvoSpecies, ctx)).toBeNull();
    });
  });

  describe("checkEvolution — なつき進化", () => {
    it("なつき度220以上で進化する", () => {
      const monster = createDummyMonster(5);
      monster.speciesId = "togepi";
      const ctx: EvolutionContext = { friendship: 220 };
      expect(checkEvolution(monster, friendshipEvoSpecies, ctx)).toBe("togetic");
    });

    it("なつき度不足では進化しない", () => {
      const monster = createDummyMonster(5);
      monster.speciesId = "togepi";
      const ctx: EvolutionContext = { friendship: 219 };
      expect(checkEvolution(monster, friendshipEvoSpecies, ctx)).toBeNull();
    });

    it("なつき度未指定では進化しない", () => {
      const monster = createDummyMonster(5);
      monster.speciesId = "togepi";
      expect(checkEvolution(monster, friendshipEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — 通信進化", () => {
    it("通信交換で進化する", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "kadabra";
      const ctx: EvolutionContext = { isTrade: true };
      expect(checkEvolution(monster, tradeEvoSpecies, ctx)).toBe("alakazam");
    });

    it("通信交換なしでは進化しない", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "kadabra";
      expect(checkEvolution(monster, tradeEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — 場所進化", () => {
    const locationEvoSpecies: MonsterSpecies = {
      id: "magneton",
      name: "レアコイル",
      types: ["electric", "steel"],
      baseStats: { hp: 50, atk: 60, def: 95, spAtk: 120, spDef: 70, speed: 70 },
      baseExpYield: 163,
      expGroup: "medium_fast",
      learnset: [],
      evolvesTo: [{ id: "magnezone", level: 30, condition: "location:power_plant" }],
    };

    it("指定マップでレベル条件を満たせば進化する", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "magneton";
      const ctx: EvolutionContext = { currentMapId: "power_plant" };
      expect(checkEvolution(monster, locationEvoSpecies, ctx)).toBe("magnezone");
    });

    it("異なるマップでは進化しない", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "magneton";
      const ctx: EvolutionContext = { currentMapId: "route_1" };
      expect(checkEvolution(monster, locationEvoSpecies, ctx)).toBeNull();
    });

    it("マップ未指定では進化しない", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "magneton";
      expect(checkEvolution(monster, locationEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — 技進化", () => {
    const moveEvoSpecies: MonsterSpecies = {
      id: "piloswine",
      name: "イノムー",
      types: ["ice", "ground"],
      baseStats: { hp: 100, atk: 100, def: 80, spAtk: 60, spDef: 60, speed: 50 },
      baseExpYield: 158,
      expGroup: "slow",
      learnset: [],
      evolvesTo: [{ id: "mamoswine", level: 1, condition: "move:ancient-power" }],
    };

    it("指定技を覚えていれば進化する", () => {
      const monster = createDummyMonster(40);
      monster.speciesId = "piloswine";
      const ctx: EvolutionContext = { knownMoveIds: ["ancient-power", "ice-beam"] };
      expect(checkEvolution(monster, moveEvoSpecies, ctx)).toBe("mamoswine");
    });

    it("指定技を覚えていなければ進化しない", () => {
      const monster = createDummyMonster(40);
      monster.speciesId = "piloswine";
      const ctx: EvolutionContext = { knownMoveIds: ["ice-beam", "earthquake"] };
      expect(checkEvolution(monster, moveEvoSpecies, ctx)).toBeNull();
    });

    it("技未指定では進化しない", () => {
      const monster = createDummyMonster(40);
      monster.speciesId = "piloswine";
      expect(checkEvolution(monster, moveEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — パーティ条件進化", () => {
    const partyEvoSpecies: MonsterSpecies = {
      id: "mantyke",
      name: "タマンタ",
      types: ["water", "flying"],
      baseStats: { hp: 45, atk: 20, def: 50, spAtk: 60, spDef: 120, speed: 50 },
      baseExpYield: 69,
      expGroup: "slow",
      learnset: [],
      evolvesTo: [{ id: "mantine", level: 1, condition: "party:remoraid" }],
    };

    it("パーティに指定モンスターがいれば進化する", () => {
      const monster = createDummyMonster(20);
      monster.speciesId = "mantyke";
      const ctx: EvolutionContext = { partySpeciesIds: ["remoraid", "pikachu"] };
      expect(checkEvolution(monster, partyEvoSpecies, ctx)).toBe("mantine");
    });

    it("パーティに指定モンスターがいなければ進化しない", () => {
      const monster = createDummyMonster(20);
      monster.speciesId = "mantyke";
      const ctx: EvolutionContext = { partySpeciesIds: ["pikachu", "charmander"] };
      expect(checkEvolution(monster, partyEvoSpecies, ctx)).toBeNull();
    });

    it("パーティ未指定では進化しない", () => {
      const monster = createDummyMonster(20);
      monster.speciesId = "mantyke";
      expect(checkEvolution(monster, partyEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — なつき度指定進化", () => {
    const friendshipThresholdSpecies: MonsterSpecies = {
      id: "riolu",
      name: "リオル",
      types: ["fighting"],
      baseStats: { hp: 40, atk: 70, def: 40, spAtk: 35, spDef: 40, speed: 60 },
      baseExpYield: 57,
      expGroup: "medium_slow",
      learnset: [],
      evolvesTo: [{ id: "lucario", level: 1, condition: "friendship:180" }],
    };

    it("指定なつき度以上で進化する", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "riolu";
      const ctx: EvolutionContext = { friendship: 180 };
      expect(checkEvolution(monster, friendshipThresholdSpecies, ctx)).toBe("lucario");
    });

    it("指定なつき度未満では進化しない", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "riolu";
      const ctx: EvolutionContext = { friendship: 179 };
      expect(checkEvolution(monster, friendshipThresholdSpecies, ctx)).toBeNull();
    });
  });

  describe("describeCondition", () => {
    it("条件なし", () => {
      expect(describeCondition(undefined)).toBe("レベルアップ");
    });

    it("アイテム進化", () => {
      expect(describeCondition("item:fire-stone")).toContain("fire-stone");
    });

    it("時間帯進化", () => {
      expect(describeCondition("time:day")).toContain("昼");
      expect(describeCondition("time:night")).toContain("夜");
    });

    it("なつき進化", () => {
      expect(describeCondition("friendship")).toContain("なつき度");
    });

    it("通信進化", () => {
      expect(describeCondition("trade")).toContain("通信");
    });

    it("場所進化", () => {
      expect(describeCondition("location:power_plant")).toContain("power_plant");
    });

    it("技進化", () => {
      expect(describeCondition("move:ancient-power")).toContain("ancient-power");
    });

    it("パーティ条件進化", () => {
      expect(describeCondition("party:remoraid")).toContain("remoraid");
    });

    it("なつき度指定進化", () => {
      expect(describeCondition("friendship:180")).toContain("180");
    });

    it("不明な条件", () => {
      expect(describeCondition("unknown")).toContain("不明");
    });
  });

  describe("evolve", () => {
    it("speciesIdが更新される", () => {
      const monster = createDummyMonster(16, 30);
      evolve(monster, charmander, charmeleon);
      expect(monster.speciesId).toBe("charmeleon");
    });

    it("最大HPの増加分が現在HPに加算される", () => {
      const monster = createDummyMonster(16, 35);
      evolve(monster, charmander, charmeleon);
      expect(monster.currentHp).toBe(41); // 35 + 6
    });

    it("現在HPが新しい最大HPを超えない", () => {
      const monster = createDummyMonster(16, 45);
      evolve(monster, charmander, charmeleon);
      expect(monster.currentHp).toBeLessThanOrEqual(46);
    });
  });
});
