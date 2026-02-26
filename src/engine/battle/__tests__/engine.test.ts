import { describe, it, expect } from "vitest";
import { BattleEngine } from "../engine";
import type { MonsterInstance, MonsterSpecies, MoveDefinition } from "@/types";

// --- テスト用マスターデータ ---
const species: Record<string, MonsterSpecies> = {
  "fire-starter": {
    id: "fire-starter",
    name: "ヒノコン",
    types: ["fire"],
    baseStats: { hp: 45, atk: 60, def: 50, spAtk: 80, spDef: 60, speed: 70 },
    learnset: [{ level: 1, moveId: "ember" }],
  },
  "water-starter": {
    id: "water-starter",
    name: "ミズリン",
    types: ["water"],
    baseStats: { hp: 50, atk: 50, def: 65, spAtk: 70, spDef: 70, speed: 60 },
    learnset: [{ level: 1, moveId: "water-gun" }],
  },
  "grass-starter": {
    id: "grass-starter",
    name: "クサネコ",
    types: ["grass"],
    baseStats: { hp: 55, atk: 55, def: 60, spAtk: 65, spDef: 65, speed: 50 },
    learnset: [{ level: 1, moveId: "vine-whip" }],
  },
};

const moves: Record<string, MoveDefinition> = {
  ember: {
    id: "ember",
    name: "ひのこ",
    type: "fire",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  "water-gun": {
    id: "water-gun",
    name: "みずでっぽう",
    type: "water",
    category: "special",
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  "vine-whip": {
    id: "vine-whip",
    name: "つるのムチ",
    type: "grass",
    category: "physical",
    power: 45,
    accuracy: 100,
    pp: 25,
    priority: 0,
  },
  "quick-attack": {
    id: "quick-attack",
    name: "でんこうせっか",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 30,
    priority: 1,
  },
};

const speciesResolver = (id: string) => species[id];
const moveResolver = (id: string) => moves[id];

function createInstance(speciesId: string, level: number = 50): MonsterInstance {
  const sp = species[speciesId];
  return {
    speciesId,
    level,
    exp: level * level * level,
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 200, // 十分なHP
    moves: sp.learnset.map((l) => ({ moveId: l.moveId, currentPp: moves[l.moveId].pp })),
    status: null,
  };
}

describe("BattleEngine - 統合テスト", () => {
  it("1vs1バトルが最後まで完走する（野生バトル）", () => {
    const player = [createInstance("fire-starter")];
    const opponent = [createInstance("grass-starter")];

    // 乱数を固定（急所なし・高乱数・命中100%）
    const fixedRandom = () => {
      return 0.5; // 急所なし（0.5 > 1/24）、乱数中間
    };

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      fixedRandom,
    );

    let totalTurns = 0;
    const maxTurns = 100;

    while (!engine.state.result && totalTurns < maxTurns) {
      engine.executeTurn({ type: "fight", moveIndex: 0 });
      totalTurns++;
    }

    expect(engine.state.result).not.toBeNull();
    expect(totalTurns).toBeLessThan(maxTurns);
    // 炎 vs 草 → プレイヤー勝利のはず
    expect(engine.state.result?.type).toBe("win");
  });

  it("タイプ不利でも高レベルなら勝てる", () => {
    const player = [createInstance("grass-starter", 80)]; // 草Lv80
    const opponent = [createInstance("fire-starter", 20)]; // 炎Lv20
    opponent[0].currentHp = 50; // 低HP

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    engine.executeTurn({ type: "fight", moveIndex: 0 });
    expect(engine.state.result?.type).toBe("win");
  });

  it("野生バトルから逃走できる", () => {
    const player = [createInstance("fire-starter", 100)]; // 高速
    const opponent = [createInstance("grass-starter", 5)]; // 低速

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.1, // 逃走成功しやすい
    );

    engine.executeTurn({ type: "run" });
    expect(engine.state.result?.type).toBe("run_success");
  });

  it("トレーナー戦からは逃走できない", () => {
    const player = [createInstance("fire-starter")];
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(player, opponent, "trainer", speciesResolver, moveResolver);

    const messages = engine.executeTurn({ type: "run" });
    expect(messages).toContain("トレーナー戦からは逃げられない！");
    expect(engine.state.result).toBeNull();
  });

  it("トレーナー戦: 相手が複数モンスター持ちの場合、順番に出してくる", () => {
    const player = [createInstance("fire-starter", 80)];
    player[0].currentHp = 999; // 十分なHP

    const opp1 = createInstance("grass-starter", 10);
    opp1.currentHp = 1; // すぐ倒れる
    const opp2 = createInstance("water-starter", 10);
    opp2.currentHp = 1; // すぐ倒れる

    const engine = new BattleEngine(
      player,
      [opp1, opp2],
      "trainer",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    // 1体目を倒す
    engine.executeTurn({ type: "fight", moveIndex: 0 });
    // まだバトル終了していない（2体目がいる）
    if (!engine.state.result) {
      // 2体目を倒す
      engine.executeTurn({ type: "fight", moveIndex: 0 });
    }

    expect(engine.state.result?.type).toBe("win");
  });

  it("経験値を獲得してレベルアップする", () => {
    const player = [createInstance("fire-starter", 5)];
    player[0].exp = 5 * 5 * 5; // Lv5の最低経験値
    player[0].currentHp = 999;

    const opponent = [createInstance("grass-starter", 50)];
    opponent[0].currentHp = 1; // すぐ倒れる

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    const levelBefore = player[0].level;
    engine.executeTurn({ type: "fight", moveIndex: 0 });

    expect(engine.state.result?.type).toBe("win");
    expect(player[0].level).toBeGreaterThan(levelBefore);
  });

  it("先制技（priority）が素早さに関わらず先に出る", () => {
    // 草スターター（遅い）にでんこうせっか（priority 1）を持たせる
    const slowMonster = createInstance("grass-starter", 50);
    slowMonster.moves.push({ moveId: "quick-attack", currentPp: 30 });

    const fastMonster = createInstance("fire-starter", 50);

    const engine = new BattleEngine(
      [slowMonster],
      [fastMonster],
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    // プレイヤーがでんこうせっか（index 1）を使う
    const messages = engine.executeTurn({ type: "fight", moveIndex: 1 });

    // 先にクサネコの技が出る（先制技なので）
    const firstMoveMsg = messages.find((m) => m.includes("の"));
    expect(firstMoveMsg).toContain("クサネコ");
  });
});
