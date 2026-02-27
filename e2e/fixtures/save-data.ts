/**
 * E2Eテスト用セーブデータファクトリ
 * SaveData互換のJSONオブジェクトを生成するビルダー
 */

interface SaveMonsterInstance {
  uid: string;
  speciesId: string;
  nickname?: string;
  level: number;
  exp: number;
  nature: string;
  ivs: { hp: number; atk: number; def: number; spAtk: number; spDef: number; speed: number };
  evs: { hp: number; atk: number; def: number; spAtk: number; spDef: number; speed: number };
  currentHp: number;
  moves: { moveId: string; currentPp: number }[];
  status: string | null;
}

interface SaveData {
  version: number;
  savedAt: string;
  playTime: number;
  state: {
    player: {
      name: string;
      money: number;
      badges: string[];
      partyState: {
        party: SaveMonsterInstance[];
        boxes: SaveMonsterInstance[][];
      };
      bag: {
        items: { itemId: string; quantity: number }[];
      };
      pokedexSeen: string[];
      pokedexCaught: string[];
    };
    overworld: {
      currentMapId: string;
      playerX: number;
      playerY: number;
      direction: "up" | "down" | "left" | "right";
    } | null;
    storyFlags: Record<string, boolean>;
  };
}

const DEFAULT_IVS = { hp: 20, atk: 20, def: 20, spAtk: 20, spDef: 20, speed: 20 };
const ZERO_EVS = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 };

function makeMonster(
  speciesId: string,
  level: number,
  moves: { moveId: string; currentPp: number }[],
  currentHp: number,
  overrides: Partial<SaveMonsterInstance> = {},
): SaveMonsterInstance {
  return {
    uid: `test-${speciesId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    speciesId,
    level,
    exp: 0,
    nature: "hardy",
    ivs: { ...DEFAULT_IVS },
    evs: { ...ZERO_EVS },
    currentHp,
    moves,
    status: null,
    ...overrides,
  };
}

function wrapSave(state: SaveData["state"], playTime: number = 0): SaveData {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    playTime,
    state,
  };
}

/** ワスレ町(4,4)、スターター1匹Lv5、ボール×5、キズぐすり×3 */
export function createNewGameSave(starterSpeciesId: string = "himori"): SaveData {
  const starterMoves: Record<string, { moveId: string; currentPp: number }[]> = {
    himori: [
      { moveId: "tackle", currentPp: 35 },
      { moveId: "growl", currentPp: 40 },
      { moveId: "ember", currentPp: 25 },
    ],
    shizukumo: [
      { moveId: "tackle", currentPp: 35 },
      { moveId: "tail-whip", currentPp: 30 },
      { moveId: "water-gun", currentPp: 25 },
    ],
    konohana: [
      { moveId: "tackle", currentPp: 35 },
      { moveId: "leer", currentPp: 30 },
      { moveId: "vine-whip", currentPp: 25 },
    ],
  };

  const starter = makeMonster(
    starterSpeciesId,
    5,
    starterMoves[starterSpeciesId] ?? starterMoves.himori,
    25,
  );

  return wrapSave({
    player: {
      name: "テスト",
      money: 3000,
      badges: [],
      partyState: {
        party: [starter],
        boxes: Array.from({ length: 8 }, () => []),
      },
      bag: {
        items: [
          { itemId: "monster-ball", quantity: 5 },
          { itemId: "potion", quantity: 3 },
        ],
      },
      pokedexSeen: [starterSpeciesId],
      pokedexCaught: [starterSpeciesId],
    },
    overworld: {
      currentMapId: "wasuremachi",
      playerX: 4,
      playerY: 4,
      direction: "down",
    },
    storyFlags: {},
  });
}

/** route-1草むら手前、Lv10パーティ */
export function createBattleReadySave(): SaveData {
  const party = [
    makeMonster(
      "himori",
      10,
      [
        { moveId: "tackle", currentPp: 35 },
        { moveId: "growl", currentPp: 40 },
        { moveId: "ember", currentPp: 25 },
        { moveId: "quick-attack", currentPp: 30 },
      ],
      35,
    ),
  ];

  return wrapSave({
    player: {
      name: "テスト",
      money: 3000,
      badges: [],
      partyState: {
        party,
        boxes: Array.from({ length: 8 }, () => []),
      },
      bag: {
        items: [
          { itemId: "monster-ball", quantity: 10 },
          { itemId: "potion", quantity: 5 },
        ],
      },
      pokedexSeen: ["himori"],
      pokedexCaught: ["himori"],
    },
    overworld: {
      currentMapId: "route-1",
      playerX: 7,
      playerY: 3,
      direction: "down",
    },
    storyFlags: {},
  });
}

/** バッジ4、Lv30パーティ、豊富なアイテム */
export function createMidGameSave(): SaveData {
  const party = [
    makeMonster(
      "hinomori",
      30,
      [
        { moveId: "flame-wheel", currentPp: 25 },
        { moveId: "bite", currentPp: 25 },
        { moveId: "quick-attack", currentPp: 30 },
        { moveId: "double-kick", currentPp: 30 },
      ],
      100,
    ),
    makeMonster(
      "oonezumi",
      28,
      [
        { moveId: "tackle", currentPp: 35 },
        { moveId: "quick-attack", currentPp: 30 },
        { moveId: "bite", currentPp: 25 },
        { moveId: "headbutt", currentPp: 15 },
      ],
      85,
    ),
  ];

  return wrapSave({
    player: {
      name: "テスト",
      money: 15000,
      badges: ["ほのおバッジ", "みずバッジ", "くさバッジ", "でんきバッジ"],
      partyState: {
        party,
        boxes: Array.from({ length: 8 }, () => []),
      },
      bag: {
        items: [
          { itemId: "monster-ball", quantity: 20 },
          { itemId: "super-ball", quantity: 10 },
          { itemId: "potion", quantity: 10 },
          { itemId: "super-potion", quantity: 5 },
        ],
      },
      pokedexSeen: ["himori", "hinomori", "konezumi", "oonezumi", "tobibato"],
      pokedexCaught: ["himori", "hinomori", "konezumi", "oonezumi"],
    },
    overworld: {
      currentMapId: "wasuremachi",
      playerX: 4,
      playerY: 4,
      direction: "down",
    },
    storyFlags: {
      gym1_cleared: true,
      gym2_cleared: true,
      gym3_cleared: true,
      gym4_cleared: true,
    },
  });
}

/** バッジ8、Lv50パーティ、全フラグ設定済み */
export function createPreLeagueSave(): SaveData {
  const party = [
    makeMonster(
      "enjuu",
      50,
      [
        { moveId: "flame-wheel", currentPp: 25 },
        { moveId: "double-kick", currentPp: 30 },
        { moveId: "bite", currentPp: 25 },
        { moveId: "quick-attack", currentPp: 30 },
      ],
      180,
    ),
    makeMonster(
      "oonezumi",
      48,
      [
        { moveId: "tackle", currentPp: 35 },
        { moveId: "quick-attack", currentPp: 30 },
        { moveId: "bite", currentPp: 25 },
        { moveId: "headbutt", currentPp: 15 },
      ],
      140,
    ),
  ];

  return wrapSave({
    player: {
      name: "テスト",
      money: 50000,
      badges: [
        "ほのおバッジ",
        "みずバッジ",
        "くさバッジ",
        "でんきバッジ",
        "こおりバッジ",
        "かくとうバッジ",
        "エスパーバッジ",
        "ドラゴンバッジ",
      ],
      partyState: {
        party,
        boxes: Array.from({ length: 8 }, () => []),
      },
      bag: {
        items: [
          { itemId: "monster-ball", quantity: 30 },
          { itemId: "super-ball", quantity: 20 },
          { itemId: "hyper-ball", quantity: 10 },
          { itemId: "potion", quantity: 10 },
          { itemId: "super-potion", quantity: 10 },
          { itemId: "hyper-potion", quantity: 5 },
          { itemId: "full-restore", quantity: 3 },
        ],
      },
      pokedexSeen: [
        "himori",
        "hinomori",
        "enjuu",
        "konezumi",
        "oonezumi",
        "tobibato",
        "hayatedori",
        "mayumushi",
        "hikarineko",
      ],
      pokedexCaught: [
        "himori",
        "hinomori",
        "enjuu",
        "konezumi",
        "oonezumi",
        "tobibato",
        "hayatedori",
      ],
    },
    overworld: {
      currentMapId: "wasuremachi",
      playerX: 4,
      playerY: 4,
      direction: "down",
    },
    storyFlags: {
      gym1_cleared: true,
      gym2_cleared: true,
      gym3_cleared: true,
      gym4_cleared: true,
      gym5_cleared: true,
      gym6_cleared: true,
      gym7_cleared: true,
      gym8_cleared: true,
    },
  });
}

export type { SaveData, SaveMonsterInstance };
