import { describe, it, expect } from "vitest";
import {
  getHeldItemDamageModifiers,
  applyFocusSash,
  getLifeOrbRecoil,
  applyEndOfTurnHeldItem,
  checkBerryAfterDamage,
  checkLumBerry,
} from "../held-item";
import { calculateDamage } from "../damage";
import { BattleEngine } from "../engine";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";
import { getSpeciesById } from "@/data/monsters";
import { getMoveById } from "@/data/moves";

function createTestMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
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

function createTestSpecies(overrides?: Partial<MonsterSpecies>): MonsterSpecies {
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

describe("getHeldItemDamageModifiers", () => {
  it("持ち物なしで全倍率1.0を返す", () => {
    const mods = getHeldItemDamageModifiers(undefined, "fire", "physical", 1);
    expect(mods.powerMultiplier).toBe(1);
    expect(mods.attackMultiplier).toBe(1);
    expect(mods.spAtkMultiplier).toBe(1);
    expect(mods.superEffectiveMultiplier).toBe(1);
  });

  it("もくたんでほのお技の威力が1.2倍", () => {
    const mods = getHeldItemDamageModifiers("charcoal", "fire", "physical", 1);
    expect(mods.powerMultiplier).toBe(1.2);
  });

  it("もくたんで非ほのお技は倍率なし", () => {
    const mods = getHeldItemDamageModifiers("charcoal", "water", "physical", 1);
    expect(mods.powerMultiplier).toBe(1);
  });

  it("いのちのたまで威力が1.3倍", () => {
    const mods = getHeldItemDamageModifiers("life-orb", "fire", "physical", 1);
    expect(mods.powerMultiplier).toBe(1.3);
  });

  it("こだわりハチマキで物理攻撃力が1.5倍", () => {
    const mods = getHeldItemDamageModifiers("choice-band", "fire", "physical", 1);
    expect(mods.attackMultiplier).toBe(1.5);
  });

  it("こだわりハチマキは特殊技に効果なし", () => {
    const mods = getHeldItemDamageModifiers("choice-band", "fire", "special", 1);
    expect(mods.attackMultiplier).toBe(1);
  });

  it("こだわりメガネで特殊攻撃力が1.5倍", () => {
    const mods = getHeldItemDamageModifiers("choice-specs", "fire", "special", 1);
    expect(mods.spAtkMultiplier).toBe(1.5);
  });

  it("こだわりメガネは物理技に効果なし", () => {
    const mods = getHeldItemDamageModifiers("choice-specs", "fire", "physical", 1);
    expect(mods.spAtkMultiplier).toBe(1);
  });

  it("たつじんのおびで効果抜群時に1.2倍", () => {
    const mods = getHeldItemDamageModifiers("expert-belt", "fire", "physical", 2);
    expect(mods.superEffectiveMultiplier).toBe(1.2);
  });

  it("たつじんのおびは等倍時に効果なし", () => {
    const mods = getHeldItemDamageModifiers("expert-belt", "fire", "physical", 1);
    expect(mods.superEffectiveMultiplier).toBe(1);
  });
});

describe("applyFocusSash", () => {
  it("きあいのタスキでHP満タンから一撃KOを防ぐ", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "focus-sash", currentHp: 150 });
    // maxHp計算結果は150前後
    const [adjusted, consumed] = applyFocusSash("focus-sash", monster, species, 200);
    expect(consumed).toBe(true);
    expect(adjusted).toBe(monster.currentHp - 1);
  });

  it("HPが満タンでない場合はきあいのタスキが発動しない", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "focus-sash", currentHp: 100 });
    const [adjusted, consumed] = applyFocusSash("focus-sash", monster, species, 200);
    expect(consumed).toBe(false);
    expect(adjusted).toBe(200);
  });

  it("ダメージがHPを超えない場合はきあいのタスキが発動しない", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "focus-sash", currentHp: 150 });
    const [adjusted, consumed] = applyFocusSash("focus-sash", monster, species, 50);
    expect(consumed).toBe(false);
    expect(adjusted).toBe(50);
  });

  it("持ち物なしの場合は発動しない", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ currentHp: 150 });
    const [adjusted, consumed] = applyFocusSash(undefined, monster, species, 200);
    expect(consumed).toBe(false);
    expect(adjusted).toBe(200);
  });
});

describe("getLifeOrbRecoil", () => {
  it("いのちのたまで最大HPの1/10の反動ダメージ", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "life-orb" });
    const recoil = getLifeOrbRecoil("life-orb", monster, species, true);
    expect(recoil).toBeGreaterThan(0);
  });

  it("ダメージを与えなかった場合は反動なし", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "life-orb" });
    const recoil = getLifeOrbRecoil("life-orb", monster, species, false);
    expect(recoil).toBe(0);
  });

  it("いのちのたま以外は反動なし", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "choice-band" });
    const recoil = getLifeOrbRecoil("choice-band", monster, species, true);
    expect(recoil).toBe(0);
  });
});

describe("applyEndOfTurnHeldItem", () => {
  it("たべのこしでHPが最大HPの1/16回復", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "leftovers", currentHp: 100 });
    const result = applyEndOfTurnHeldItem(monster, species);
    expect(result.healed).toBeGreaterThan(0);
    expect(result.message).toContain("たべのこし");
    expect(monster.currentHp).toBe(100 + result.healed);
  });

  it("HPが最大の場合はたべのこし回復なし", () => {
    const species = createTestSpecies();
    // maxHpに近い値を設定
    const monster = createTestMonster({ heldItem: "leftovers", currentHp: 999 });
    const result = applyEndOfTurnHeldItem(monster, species);
    // maxHpより大きいのでcurrentHpをmaxHpに制限されるが、回復量は0でない場合もある
    // ただし元からmaxHp以上なら回復しない
    expect(result.healed).toBe(0);
  });

  it("瀕死のモンスターにはたべのこし効果なし", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "leftovers", currentHp: 0 });
    const result = applyEndOfTurnHeldItem(monster, species);
    expect(result.healed).toBe(0);
    expect(result.message).toBeNull();
  });
});

describe("checkBerryAfterDamage", () => {
  it("オボンのみでHP1/2以下時にHP1/4回復", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "sitrus-berry", currentHp: 50 });
    const messages = checkBerryAfterDamage(monster, species);
    expect(messages.length).toBe(1);
    expect(messages[0]).toContain("オボンのみ");
    expect(monster.currentHp).toBeGreaterThan(50);
    expect(monster.heldItem).toBeUndefined();
  });

  it("HP1/2超ではオボンのみは発動しない", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "sitrus-berry", currentHp: 140 });
    const messages = checkBerryAfterDamage(monster, species);
    expect(messages.length).toBe(0);
    expect(monster.heldItem).toBe("sitrus-berry");
  });

  it("瀕死のモンスターにはきのみ効果なし", () => {
    const species = createTestSpecies();
    const monster = createTestMonster({ heldItem: "sitrus-berry", currentHp: 0 });
    const messages = checkBerryAfterDamage(monster, species);
    expect(messages.length).toBe(0);
  });
});

describe("checkLumBerry", () => {
  it("ラムのみで状態異常を治す", () => {
    const monster = createTestMonster({ heldItem: "lum-berry", status: "poison" });
    const messages = checkLumBerry(monster, "ヒモリ");
    expect(messages.length).toBe(1);
    expect(messages[0]).toContain("ラムのみ");
    expect(monster.status).toBeNull();
    expect(monster.heldItem).toBeUndefined();
  });

  it("状態異常なしではラムのみは発動しない", () => {
    const monster = createTestMonster({ heldItem: "lum-berry", status: null });
    const messages = checkLumBerry(monster, "ヒモリ");
    expect(messages.length).toBe(0);
    expect(monster.heldItem).toBe("lum-berry");
  });

  it("ラムのみ以外では発動しない", () => {
    const monster = createTestMonster({ heldItem: "sitrus-berry", status: "poison" });
    const messages = checkLumBerry(monster, "ヒモリ");
    expect(messages.length).toBe(0);
    expect(monster.status).toBe("poison");
  });
});

describe("ダメージ計算に持ち物倍率が反映される", () => {
  const attackerSpecies = createTestSpecies({
    id: "test-fire",
    types: ["fire"],
    baseStats: { hp: 100, atk: 100, def: 100, spAtk: 100, spDef: 100, speed: 100 },
  });
  const defenderSpecies = createTestSpecies({
    id: "test-grass",
    types: ["grass"],
    baseStats: { hp: 100, atk: 100, def: 100, spAtk: 100, spDef: 100, speed: 100 },
  });

  const move: MoveDefinition = {
    id: "test-fire-move",
    name: "テスト炎技",
    type: "fire",
    category: "physical",
    power: 80,
    accuracy: 100,
    pp: 15,
    priority: 0,
  };

  it("もくたんでほのお技のダメージが増加する", () => {
    const attacker = createTestMonster({ speciesId: "test-fire" });
    const defender = createTestMonster({ speciesId: "test-grass", currentHp: 300 });

    // 持ち物なし
    const noDmg = calculateDamage({
      attacker,
      attackerSpecies,
      defender,
      defenderSpecies,
      move,
      random: () => 0.5,
    });

    // もくたんあり
    const withDmg = calculateDamage({
      attacker,
      attackerSpecies,
      defender,
      defenderSpecies,
      move,
      random: () => 0.5,
      attackerHeldItem: "charcoal",
    });

    expect(withDmg.damage).toBeGreaterThan(noDmg.damage);
  });

  it("こだわりハチマキで物理ダメージが増加する", () => {
    const attacker = createTestMonster({ speciesId: "test-fire" });
    const defender = createTestMonster({ speciesId: "test-grass", currentHp: 300 });

    const noDmg = calculateDamage({
      attacker,
      attackerSpecies,
      defender,
      defenderSpecies,
      move,
      random: () => 0.5,
    });

    const withDmg = calculateDamage({
      attacker,
      attackerSpecies,
      defender,
      defenderSpecies,
      move,
      random: () => 0.5,
      attackerHeldItem: "choice-band",
    });

    expect(withDmg.damage).toBeGreaterThan(noDmg.damage);
  });
});

describe("BattleEngineで持ち物が統合動作する", () => {
  const speciesResolver = (id: string) => getSpeciesById(id)!;
  const moveResolver = (id: string) => getMoveById(id)!;

  it("たべのこしのターン終了時回復がバトルエンジンで動作する", () => {
    const player: MonsterInstance[] = [
      {
        uid: "p1",
        speciesId: "himori",
        level: 50,
        exp: 0,
        nature: "hardy",
        ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
        evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
        currentHp: 50,
        moves: [{ moveId: "tackle", currentPp: 35 }],
        status: null,
        heldItem: "leftovers",
      },
    ];
    const opponent: MonsterInstance[] = [
      {
        uid: "o1",
        speciesId: "shizukumo",
        level: 50,
        exp: 0,
        nature: "hardy",
        ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
        evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
        currentHp: 200,
        moves: [{ moveId: "tackle", currentPp: 35 }],
        status: null,
      },
    ];

    const engine = new BattleEngine(player, opponent, "wild", speciesResolver, moveResolver);
    const hpBefore = player[0].currentHp;

    // ターン実行
    engine.executeTurn({ type: "fight", moveIndex: 0 });

    // たべのこしでHP回復しているはず
    // ダメージも受けるので、HP増加を直接確認するのは難しいが、
    // メッセージにたべのこしが含まれることを確認
    const messages = engine.state.messages;
    expect(messages.some((m) => m.includes("たべのこし"))).toBe(true);
  });
});
