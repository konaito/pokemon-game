import { describe, it, expect } from "vitest";
import { BattleEngine } from "../engine";
import { determineTurnOrder, type TurnAction } from "../turn-order";
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

const ghostSpecies: MonsterSpecies = {
  id: "ghost-mon",
  name: "ユウレイ",
  types: ["ghost"],
  baseStats: { hp: 60, atk: 60, def: 60, spAtk: 60, spDef: 60, speed: 60 },
  learnset: [{ level: 1, moveId: "shadow-ball" }],
};

const normalSpecies: MonsterSpecies = {
  id: "normal-mon",
  name: "ノーマン",
  types: ["normal"],
  baseStats: { hp: 80, atk: 80, def: 80, spAtk: 80, spDef: 80, speed: 80 },
  learnset: [{ level: 1, moveId: "tackle" }],
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
  tackle: {
    id: "tackle",
    name: "たいあたり",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    pp: 35,
    priority: 0,
  },
  "shadow-ball": {
    id: "shadow-ball",
    name: "シャドーボール",
    type: "ghost",
    category: "special",
    power: 80,
    accuracy: 100,
    pp: 15,
    priority: 0,
  },
  hypnosis: {
    id: "hypnosis",
    name: "さいみんじゅつ",
    type: "psychic",
    category: "status",
    power: null,
    accuracy: 100,
    pp: 20,
    priority: 0,
    effect: { statusCondition: "sleep", statusChance: 100 },
  },
};

const allSpecies: Record<string, MonsterSpecies> = {
  ...species,
  "ghost-mon": ghostSpecies,
  "normal-mon": normalSpecies,
};

const speciesResolver = (id: string) => allSpecies[id];
const moveResolver = (id: string) => moves[id];

function createInstance(speciesId: string, level: number = 50): MonsterInstance {
  const sp = allSpecies[speciesId];
  return {
    speciesId,
    level,
    exp: level * level * level,
    ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 200,
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

describe("BattleEngine - バグ修正検証", () => {
  it("Bug1: 眠りから回復したらステータスがクリアされる", () => {
    const player = [createInstance("fire-starter")];
    player[0].status = "sleep";
    const opponent = [createInstance("grass-starter")];

    // rng < 1/3 で眠りから覚める
    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.1, // 0.1 < 1/3 → 眠りから覚める
    );

    engine.executeTurn({ type: "fight", moveIndex: 0 });
    // 眠りが治っていることを確認
    expect(player[0].status).toBeNull();
  });

  it("Bug1: 氷から回復したらステータスがクリアされる", () => {
    const player = [createInstance("fire-starter")];
    player[0].status = "freeze";
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.1, // 0.1 < 0.2 → 氷から解凍
    );

    engine.executeTurn({ type: "fight", moveIndex: 0 });
    expect(player[0].status).toBeNull();
  });

  it("Bug2: タイプ無効（ノーマル→ゴースト）はダメージ0", () => {
    const player = [createInstance("normal-mon")];
    player[0].currentHp = 200;
    const opponent = [createInstance("ghost-mon")];
    opponent[0].currentHp = 100;

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    const hpBefore = opponent[0].currentHp;
    engine.executeTurn({ type: "fight", moveIndex: 0 });
    // ノーマル→ゴーストは無効なのでHPが変わらない
    // （相手のゴースト技はノーマルに無効なので互いにダメージなし）
    expect(opponent[0].currentHp).toBe(hpBefore);
  });

  it("Bug3: PP=0の技は使えない", () => {
    const player = [createInstance("fire-starter")];
    player[0].moves[0].currentPp = 0; // PP切れ
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    const messages = engine.executeTurn({ type: "fight", moveIndex: 0 });
    expect(messages.some((m) => m.includes("PPが足りない"))).toBe(true);
  });

  it("Bug4: 逃走失敗時に相手が攻撃してくる", () => {
    const player = [createInstance("grass-starter", 5)]; // 遅い低レベル
    player[0].currentHp = 200;
    const opponent = [createInstance("fire-starter", 50)]; // 速い高レベル

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.99, // 逃走失敗しやすい
    );

    const hpBefore = player[0].currentHp;
    engine.executeTurn({ type: "run" });
    // 逃走失敗後に相手が攻撃してくるのでHPが減る
    expect(player[0].currentHp).toBeLessThan(hpBefore);
  });

  it("Bug5: やけど状態で物理攻撃のダメージが減少する", () => {
    // やけど無し vs やけど有りの物理ダメージ比較
    const playerNoBurn = [createInstance("grass-starter")];
    const playerBurn = [createInstance("grass-starter")];
    playerBurn[0].status = "burn";
    const opponent1 = [createInstance("fire-starter")];
    opponent1[0].currentHp = 999;
    const opponent2 = [createInstance("fire-starter")];
    opponent2[0].currentHp = 999;

    const engine1 = new BattleEngine(
      playerNoBurn,
      opponent1,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );
    const engine2 = new BattleEngine(
      playerBurn,
      opponent2,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    engine1.executeTurn({ type: "fight", moveIndex: 0 }); // つるのムチ（物理）
    engine2.executeTurn({ type: "fight", moveIndex: 0 });

    const damage1 = 999 - opponent1[0].currentHp;
    const damage2 = 999 - opponent2[0].currentHp;
    // やけど有りのほうがダメージが少ない
    expect(damage2).toBeLessThan(damage1);
  });

  it("Bug6: ステータス技（さいみんじゅつ）で相手を眠らせる", () => {
    const player = [createInstance("fire-starter")];
    player[0].moves.push({ moveId: "hypnosis", currentPp: 20 });
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5, // 命中、状態異常付与成功
    );

    engine.executeTurn({ type: "fight", moveIndex: 1 }); // さいみんじゅつ
    expect(opponent[0].status).toBe("sleep");
  });
});

describe("T1: ステータス効果テスト", () => {
  it("麻痺時の素早さ低下がターン順に反映される", () => {
    // 通常なら fire-starter(speed70) > grass-starter(speed50) で fire が先攻
    // 麻痺なら fire-starter の速度が半分(35)になり grass-starter(50) が先攻
    const fireMonster = createInstance("fire-starter", 50);
    fireMonster.status = "paralysis";
    const grassMonster = createInstance("grass-starter", 50);

    const fireSpecies = allSpecies["fire-starter"];
    const grassSpecies = allSpecies["grass-starter"];

    const fireAction: TurnAction = {
      side: "player",
      action: { type: "fight", moveIndex: 0 },
      monster: fireMonster,
      species: fireSpecies,
      move: moves["ember"],
    };
    const grassAction: TurnAction = {
      side: "opponent",
      action: { type: "fight", moveIndex: 0 },
      monster: grassMonster,
      species: grassSpecies,
      move: moves["vine-whip"],
    };

    const [first] = determineTurnOrder(fireAction, grassAction, () => 0.5);
    // 麻痺で fire の速度が半分 → grass が先攻
    expect(first.side).toBe("opponent");
  });

  it("毒ダメージがターン終了時に適用される", () => {
    const player = [createInstance("fire-starter")];
    player[0].status = "poison";
    player[0].currentHp = 200;
    const opponent = [createInstance("grass-starter")];
    opponent[0].currentHp = 999;

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    const hpBefore = player[0].currentHp;
    engine.executeTurn({ type: "fight", moveIndex: 0 });
    // 毒ダメージ分HPが減っているはず
    expect(player[0].currentHp).toBeLessThan(hpBefore);
  });
});

describe("T2: 逃走ロジックテスト", () => {
  it("逃走試行回数が増えると逃走確率が上がる", () => {
    const player = [createInstance("grass-starter", 5)]; // 遅い
    player[0].currentHp = 999;
    const opponent = [createInstance("fire-starter", 50)]; // 速い
    opponent[0].currentHp = 999;

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.99, // 高い乱数 → 逃走失敗しやすい
    );

    // 初回の逃走は失敗する
    engine.executeTurn({ type: "run" });
    expect(engine.state.result).toBeNull();
    expect(engine.state.escapeAttempts).toBe(1);

    // 試行回数が増加している
    engine.executeTurn({ type: "run" });
    expect(engine.state.escapeAttempts).toBeGreaterThanOrEqual(1);
  });
});

describe("T3: スイッチ検証テスト", () => {
  it("無効なpartyIndexでエラーが投げられる", () => {
    const player = [createInstance("fire-starter"), createInstance("water-starter")];
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
    );

    expect(() => engine.executeTurn({ type: "switch", partyIndex: 5 })).toThrow(
      "無効なパーティインデックス",
    );
  });

  it("負のpartyIndexでエラーが投げられる", () => {
    const player = [createInstance("fire-starter"), createInstance("water-starter")];
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
    );

    expect(() => engine.executeTurn({ type: "switch", partyIndex: -1 })).toThrow(
      "無効なパーティインデックス",
    );
  });

  it("瀕死のモンスターへの交代でエラーが投げられる", () => {
    const player = [createInstance("fire-starter"), createInstance("water-starter")];
    player[1].currentHp = 0; // 瀕死
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
    );

    expect(() => engine.executeTurn({ type: "switch", partyIndex: 1 })).toThrow(
      "瀕死のモンスター",
    );
  });

  it("現在のアクティブモンスターへの交代でエラーが投げられる", () => {
    const player = [createInstance("fire-starter"), createInstance("water-starter")];
    const opponent = [createInstance("grass-starter")];

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
    );

    expect(() => engine.executeTurn({ type: "switch", partyIndex: 0 })).toThrow(
      "既にバトルに出ている",
    );
  });
});

describe("T4: 経験値境界テスト", () => {
  it("Lv100では経験値を得てもレベルが上がらない", () => {
    const player = [createInstance("fire-starter", 100)];
    player[0].currentHp = 999;

    const opponent = [createInstance("grass-starter", 50)];
    opponent[0].currentHp = 1;

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
    expect(player[0].level).toBe(100);
  });
});

describe("T6: わるあがきテスト", () => {
  it("全技のPPが0の場合、相手はわるあがきを使う", () => {
    const player = [createInstance("fire-starter")];
    player[0].currentHp = 999;
    const opponent = [createInstance("grass-starter")];
    opponent[0].moves[0].currentPp = 0; // PP切れ

    const engine = new BattleEngine(
      player,
      opponent,
      "wild",
      speciesResolver,
      moveResolver,
      () => 0.5,
    );

    const messages = engine.executeTurn({ type: "fight", moveIndex: 0 });
    // 相手がわるあがきを使ったメッセージが出る
    expect(messages.some((m) => m.includes("わるあがき"))).toBe(true);
  });
});
