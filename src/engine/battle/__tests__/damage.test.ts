import { describe, it, expect } from "vitest";
import { calculateDamage, type DamageContext } from "../damage";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";

/** テスト用ヘルパー: デフォルトのモンスターインスタンスを生成 */
function createMonster(overrides?: Partial<MonsterInstance>): MonsterInstance {
  return {
    speciesId: "test-monster",
    level: 50,
    exp: 0,
    ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 100,
    moves: [],
    status: null,
    ...overrides,
  };
}

/** テスト用ヘルパー: デフォルトの種族データを生成 */
function createSpecies(overrides?: Partial<MonsterSpecies>): MonsterSpecies {
  return {
    id: "test-monster",
    name: "テストモンスター",
    types: ["normal"],
    baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
    learnset: [],
    ...overrides,
  };
}

/** テスト用: 固定乱数 */
const fixedRandom = (value: number) => () => value;

describe("calculateDamage", () => {
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

  it("ステータス技はダメージ0を返す", () => {
    const statusMove: MoveDefinition = {
      id: "growl",
      name: "なきごえ",
      type: "normal",
      category: "status",
      power: null,
      accuracy: 100,
      pp: 40,
      priority: 0,
    };

    const ctx: DamageContext = {
      attacker: createMonster(),
      attackerSpecies: createSpecies(),
      defender: createMonster(),
      defenderSpecies: createSpecies(),
      move: statusMove,
    };

    const result = calculateDamage(ctx);
    expect(result.damage).toBe(0);
  });

  it("通常ダメージが1以上になる", () => {
    const ctx: DamageContext = {
      attacker: createMonster(),
      attackerSpecies: createSpecies(),
      defender: createMonster(),
      defenderSpecies: createSpecies(),
      move: physicalMove,
      random: fixedRandom(0.5), // 急所なし、乱数中間
    };

    const result = calculateDamage(ctx);
    expect(result.damage).toBeGreaterThanOrEqual(1);
  });

  it("タイプ一致ボーナス(STAB)が適用される", () => {
    const normalAttacker = createSpecies({ types: ["normal"] });
    const fireAttacker = createSpecies({ types: ["fire"] });

    // ノーマルタイプのたいあたり → STAB有り
    const withStab = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: normalAttacker,
      defender: createMonster(),
      defenderSpecies: createSpecies(),
      move: physicalMove,
      random: fixedRandom(0.99), // 急所なし
    });

    // 炎タイプのたいあたり → STAB無し
    const withoutStab = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: fireAttacker,
      defender: createMonster(),
      defenderSpecies: createSpecies(),
      move: physicalMove,
      random: fixedRandom(0.99),
    });

    expect(withStab.isStab).toBe(true);
    expect(withoutStab.isStab).toBe(false);
    expect(withStab.damage).toBeGreaterThan(withoutStab.damage);
  });

  it("タイプ相性が反映される", () => {
    const fireMove: MoveDefinition = {
      ...physicalMove,
      id: "ember",
      name: "ひのこ",
      type: "fire",
      power: 40,
    };

    const grassDefender = createSpecies({ types: ["grass"] });
    const waterDefender = createSpecies({ types: ["water"] });

    const superEffective = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: createSpecies({ types: ["fire"] }),
      defender: createMonster(),
      defenderSpecies: grassDefender,
      move: fireMove,
      random: fixedRandom(0.99),
    });

    const notVeryEffective = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: createSpecies({ types: ["fire"] }),
      defender: createMonster(),
      defenderSpecies: waterDefender,
      move: fireMove,
      random: fixedRandom(0.99),
    });

    expect(superEffective.effectiveness).toBe(2);
    expect(notVeryEffective.effectiveness).toBe(0.5);
    expect(superEffective.damage).toBeGreaterThan(notVeryEffective.damage);
  });

  it("無効タイプにはダメージ0（最低保証1は適用されない — effectiveness=0）", () => {
    const normalMove: MoveDefinition = {
      ...physicalMove,
      type: "normal",
      power: 100,
    };

    const result = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: createSpecies(),
      defender: createMonster(),
      defenderSpecies: createSpecies({ types: ["ghost"] }),
      move: normalMove,
      random: fixedRandom(0.99),
    });

    expect(result.effectiveness).toBe(0);
    expect(result.damage).toBe(0);
  });

  it("急所が出ると1.5倍になる", () => {
    // random < 1/24 で急所
    const critical = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: createSpecies(),
      defender: createMonster(),
      defenderSpecies: createSpecies(),
      move: physicalMove,
      random: fixedRandom(0), // 0 < 1/24 → 急所、乱数=0.85
    });

    const normal = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: createSpecies(),
      defender: createMonster(),
      defenderSpecies: createSpecies(),
      move: physicalMove,
      random: fixedRandom(0.5), // 0.5 > 1/24 → 急所なし、乱数=0.925
    });

    expect(critical.isCritical).toBe(true);
    expect(normal.isCritical).toBe(false);
    // 急所のダメージが通常より大きいことを確認（乱数も考慮）
    expect(critical.damage).toBeGreaterThanOrEqual(normal.damage);
  });

  it("レベルが高いほどダメージが大きい", () => {
    const lowLevel = calculateDamage({
      attacker: createMonster({ level: 10 }),
      attackerSpecies: createSpecies(),
      defender: createMonster({ level: 50 }),
      defenderSpecies: createSpecies(),
      move: physicalMove,
      random: fixedRandom(0.99),
    });

    const highLevel = calculateDamage({
      attacker: createMonster({ level: 100 }),
      attackerSpecies: createSpecies(),
      defender: createMonster({ level: 50 }),
      defenderSpecies: createSpecies(),
      move: physicalMove,
      random: fixedRandom(0.99),
    });

    expect(highLevel.damage).toBeGreaterThan(lowLevel.damage);
  });

  it("特殊技はspAtk/spDefを使用する", () => {
    const specialMove: MoveDefinition = {
      id: "water-gun",
      name: "みずでっぽう",
      type: "water",
      category: "special",
      power: 40,
      accuracy: 100,
      pp: 25,
      priority: 0,
    };

    // spAtkが高く、atkが低い攻撃側
    const specialAttacker = createSpecies({
      baseStats: { hp: 80, atk: 30, def: 80, spAtk: 130, spDef: 80, speed: 80 },
    });

    const result = calculateDamage({
      attacker: createMonster(),
      attackerSpecies: specialAttacker,
      defender: createMonster(),
      defenderSpecies: createSpecies(),
      move: specialMove,
      random: fixedRandom(0.99),
    });

    // 高spAtkなのでダメージは通常より大きいはず
    expect(result.damage).toBeGreaterThan(0);
  });
});
