import { describe, it, expect } from "vitest";
import { checkEvolution, evolve } from "../evolution";
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
      id: "test-location",
      name: "テスト場所進化",
      types: ["ground"],
      baseStats: { hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 },
      baseExpYield: 100,
      expGroup: "medium_fast",
      learnset: [],
      evolvesTo: [{ id: "test-location-evo", level: 25, condition: "location:seirei-mountain" }],
    };

    it("特定マップでレベル条件を満たすと進化する", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "test-location";
      const ctx: EvolutionContext = { currentMapId: "seirei-mountain" };
      expect(checkEvolution(monster, locationEvoSpecies, ctx)).toBe("test-location-evo");
    });

    it("別のマップでは進化しない", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "test-location";
      const ctx: EvolutionContext = { currentMapId: "wasuremachi" };
      expect(checkEvolution(monster, locationEvoSpecies, ctx)).toBeNull();
    });

    it("マップ指定なしでは進化しない", () => {
      const monster = createDummyMonster(25);
      monster.speciesId = "test-location";
      expect(checkEvolution(monster, locationEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — 技条件進化", () => {
    const moveEvoSpecies: MonsterSpecies = {
      id: "test-move",
      name: "テスト技進化",
      types: ["rock"],
      baseStats: { hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 },
      baseExpYield: 100,
      expGroup: "medium_fast",
      learnset: [],
      evolvesTo: [{ id: "test-move-evo", level: 20, condition: "move:ancient-power" }],
    };

    it("特定技を覚えた状態でレベル条件を満たすと進化する", () => {
      const monster = createDummyMonster(20);
      monster.speciesId = "test-move";
      const ctx: EvolutionContext = { knownMoves: ["tackle", "ancient-power", "rock-throw"] };
      expect(checkEvolution(monster, moveEvoSpecies, ctx)).toBe("test-move-evo");
    });

    it("技を覚えていなければ進化しない", () => {
      const monster = createDummyMonster(20);
      monster.speciesId = "test-move";
      const ctx: EvolutionContext = { knownMoves: ["tackle", "rock-throw"] };
      expect(checkEvolution(monster, moveEvoSpecies, ctx)).toBeNull();
    });

    it("技一覧未指定では進化しない", () => {
      const monster = createDummyMonster(20);
      monster.speciesId = "test-move";
      expect(checkEvolution(monster, moveEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — パーティ条件進化", () => {
    const partyEvoSpecies: MonsterSpecies = {
      id: "test-party",
      name: "テストパーティ進化",
      types: ["dark"],
      baseStats: { hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 },
      baseExpYield: 100,
      expGroup: "medium_fast",
      learnset: [],
      evolvesTo: [{ id: "test-party-evo", level: 30, condition: "party:hikarineko" }],
    };

    it("パーティに特定モンスターがいるとレベル条件で進化する", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "test-party";
      const ctx: EvolutionContext = { partySpeciesIds: ["himori", "hikarineko", "konezumi"] };
      expect(checkEvolution(monster, partyEvoSpecies, ctx)).toBe("test-party-evo");
    });

    it("パーティに対象モンスターがいなければ進化しない", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "test-party";
      const ctx: EvolutionContext = { partySpeciesIds: ["himori", "konezumi"] };
      expect(checkEvolution(monster, partyEvoSpecies, ctx)).toBeNull();
    });

    it("パーティ情報未指定では進化しない", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "test-party";
      expect(checkEvolution(monster, partyEvoSpecies)).toBeNull();
    });
  });

  describe("checkEvolution — 複合条件", () => {
    // 複合条件はevolvesToの各エントリにconditionが1つのため、
    // 複数条件は分岐進化として表現
    const multiCondSpecies: MonsterSpecies = {
      id: "test-multi",
      name: "テスト複合",
      types: ["normal"],
      baseStats: { hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 },
      baseExpYield: 100,
      expGroup: "medium_fast",
      learnset: [],
      evolvesTo: [
        { id: "multi-location", level: 30, condition: "location:seirei-mountain" },
        { id: "multi-item", level: 1, condition: "item:metal-coat" },
        { id: "multi-default", level: 40 },
      ],
    };

    it("場所条件が先にマッチすればそちらに進化", () => {
      const monster = createDummyMonster(30);
      monster.speciesId = "test-multi";
      const ctx: EvolutionContext = { currentMapId: "seirei-mountain" };
      expect(checkEvolution(monster, multiCondSpecies, ctx)).toBe("multi-location");
    });

    it("アイテム条件がマッチすればアイテム進化", () => {
      const monster = createDummyMonster(5);
      monster.speciesId = "test-multi";
      const ctx: EvolutionContext = { usedItemId: "metal-coat" };
      expect(checkEvolution(monster, multiCondSpecies, ctx)).toBe("multi-item");
    });

    it("条件なしの場合はレベル40でデフォルト進化", () => {
      const monster = createDummyMonster(40);
      monster.speciesId = "test-multi";
      expect(checkEvolution(monster, multiCondSpecies)).toBe("multi-default");
    });

    it("どの条件も満たさなければ進化しない", () => {
      const monster = createDummyMonster(35);
      monster.speciesId = "test-multi";
      expect(checkEvolution(monster, multiCondSpecies)).toBeNull();
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
