import { describe, it, expect } from "vitest";
import {
  ALL_SPECIES,
  STARTERS,
  EARLY_MONSTERS,
  MID_MONSTERS,
  LATE_MONSTERS,
  LEGENDARY_MONSTERS,
  getSpeciesById,
  getAllSpeciesIds,
} from "../monsters";
import { ALL_MOVES, getMoveById } from "../moves";

describe("モンスターデータの整合性", () => {
  it("全モンスターのIDがユニークである", () => {
    const ids = ALL_SPECIES.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("全モンスターの名前がユニークである", () => {
    const names = ALL_SPECIES.map((s) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it("全モンスターの種族値がプラスである", () => {
    for (const species of ALL_SPECIES) {
      const { hp, atk, def, spAtk, spDef, speed } = species.baseStats;
      expect(hp, `${species.name} HP`).toBeGreaterThan(0);
      expect(atk, `${species.name} atk`).toBeGreaterThan(0);
      expect(def, `${species.name} def`).toBeGreaterThan(0);
      expect(spAtk, `${species.name} spAtk`).toBeGreaterThan(0);
      expect(spDef, `${species.name} spDef`).toBeGreaterThan(0);
      expect(speed, `${species.name} speed`).toBeGreaterThan(0);
    }
  });

  it("全モンスターのタイプが1つまたは2つである", () => {
    for (const species of ALL_SPECIES) {
      expect(species.types.length).toBeGreaterThanOrEqual(1);
      expect(species.types.length).toBeLessThanOrEqual(2);
    }
  });

  it("全モンスターのbaseExpYieldがプラスである", () => {
    for (const species of ALL_SPECIES) {
      expect(species.baseExpYield, species.name).toBeGreaterThan(0);
    }
  });

  it("全モンスターの技習得リストが存在する技を参照している", () => {
    for (const species of ALL_SPECIES) {
      for (const entry of species.learnset) {
        const move = getMoveById(entry.moveId);
        expect(move, `${species.name}のmoveId: ${entry.moveId}`).toBeDefined();
      }
    }
  });

  it("進化先が存在するモンスターを参照している", () => {
    const allIds = new Set(getAllSpeciesIds());
    for (const species of ALL_SPECIES) {
      if (species.evolvesTo) {
        for (const evo of species.evolvesTo) {
          expect(allIds.has(evo.id), `${species.name} → ${evo.id}`).toBe(true);
          expect(evo.level, `${species.name}→${evo.id}の進化レベル`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("技習得リストがレベル順にソートされている", () => {
    for (const species of ALL_SPECIES) {
      for (let i = 1; i < species.learnset.length; i++) {
        expect(
          species.learnset[i].level,
          `${species.name}の${species.learnset[i].moveId}`,
        ).toBeGreaterThanOrEqual(species.learnset[i - 1].level);
      }
    }
  });
});

describe("御三家データ", () => {
  it("御三家は9匹（3系列×3段階）", () => {
    expect(STARTERS).toHaveLength(9);
  });

  it("最初の段階は炎・水・草の3タイプ", () => {
    const firstStages = STARTERS.filter((s) => ["himori", "shizukumo", "konohana"].includes(s.id));
    expect(firstStages).toHaveLength(3);
    expect(firstStages.map((s) => s.types[0]).sort()).toEqual(["fire", "grass", "water"]);
  });

  it("最終進化は副タイプを持つ", () => {
    const finalStages = STARTERS.filter((s) => ["enjuu", "taikaiou", "taijushin"].includes(s.id));
    expect(finalStages).toHaveLength(3);
    for (const mon of finalStages) {
      expect(mon.types.length, mon.name).toBe(2);
    }
  });

  it("最終進化の種族値合計は500-530の範囲", () => {
    const finalStages = STARTERS.filter((s) => ["enjuu", "taikaiou", "taijushin"].includes(s.id));
    for (const mon of finalStages) {
      const total =
        mon.baseStats.hp +
        mon.baseStats.atk +
        mon.baseStats.def +
        mon.baseStats.spAtk +
        mon.baseStats.spDef +
        mon.baseStats.speed;
      expect(total, `${mon.name}の合計種族値`).toBeGreaterThanOrEqual(500);
      expect(total, `${mon.name}の合計種族値`).toBeLessThanOrEqual(530);
    }
  });

  it("全御三家がmedium_slow経験値グループ", () => {
    for (const mon of STARTERS) {
      expect(mon.expGroup, mon.name).toBe("medium_slow");
    }
  });

  it("進化チェーンが正しく繋がっている", () => {
    // ヒモリ → ヒノモリ → エンジュウ
    const himori = getSpeciesById("himori");
    expect(himori?.evolvesTo?.[0].id).toBe("hinomori");
    const hinomori = getSpeciesById("hinomori");
    expect(hinomori?.evolvesTo?.[0].id).toBe("enjuu");
    const enjuu = getSpeciesById("enjuu");
    expect(enjuu?.evolvesTo).toBeUndefined();

    // シズクモ → ナミコゾウ → タイカイオウ
    const shizukumo = getSpeciesById("shizukumo");
    expect(shizukumo?.evolvesTo?.[0].id).toBe("namikozou");
    const namikozou = getSpeciesById("namikozou");
    expect(namikozou?.evolvesTo?.[0].id).toBe("taikaiou");

    // コノハナ → モリノコ → タイジュシン
    const konohana = getSpeciesById("konohana");
    expect(konohana?.evolvesTo?.[0].id).toBe("morinoko");
    const morinoko = getSpeciesById("morinoko");
    expect(morinoko?.evolvesTo?.[0].id).toBe("taijushin");
  });
});

describe("序盤モンスターデータ", () => {
  it("序盤モンスターは10匹以上", () => {
    expect(EARLY_MONSTERS.length).toBeGreaterThanOrEqual(10);
  });

  it("全モンスターの合計は50種以上", () => {
    expect(ALL_SPECIES.length).toBeGreaterThanOrEqual(50);
  });

  it("序盤に多様なタイプが存在する", () => {
    const types = new Set<string>();
    for (const mon of EARLY_MONSTERS) {
      for (const t of mon.types) {
        types.add(t);
      }
    }
    // ノーマル、飛行、虫、電気、毒、水、地面が含まれる
    expect(types.has("normal")).toBe(true);
    expect(types.has("flying")).toBe(true);
    expect(types.has("bug")).toBe(true);
    expect(types.has("electric")).toBe(true);
    expect(types.has("poison")).toBe(true);
    expect(types.has("water")).toBe(true);
  });

  it("getSpeciesByIdで種族を取得できる", () => {
    const konezumi = getSpeciesById("konezumi");
    expect(konezumi).toBeDefined();
    expect(konezumi!.name).toBe("コネズミ");
    expect(konezumi!.types).toEqual(["normal"]);
  });

  it("存在しないIDはundefinedを返す", () => {
    expect(getSpeciesById("nonexistent")).toBeUndefined();
  });

  it("getAllSpeciesIdsが全モンスターのIDを返す", () => {
    const ids = getAllSpeciesIds();
    expect(ids).toContain("himori");
    expect(ids).toContain("konezumi");
    expect(ids).toContain("tobibato");
    expect(ids.length).toBe(ALL_SPECIES.length);
  });
});

describe("中盤モンスターデータ", () => {
  it("中盤モンスターは15匹以上", () => {
    expect(MID_MONSTERS.length).toBeGreaterThanOrEqual(15);
  });

  it("中盤に炎、格闘、地面、ゴースト、フェアリー、鋼タイプが存在する", () => {
    const types = new Set<string>();
    for (const mon of MID_MONSTERS) {
      for (const t of mon.types) {
        types.add(t);
      }
    }
    expect(types.has("fire")).toBe(true);
    expect(types.has("fighting")).toBe(true);
    expect(types.has("ground")).toBe(true);
    expect(types.has("ghost")).toBe(true);
    expect(types.has("fairy")).toBe(true);
    expect(types.has("steel")).toBe(true);
  });

  it("ゴースト系は3段階進化（ユラビ→カゲボウシ→ヨミカグラ）", () => {
    const yurabi = getSpeciesById("yurabi");
    expect(yurabi?.evolvesTo?.[0].id).toBe("kageboushi");
    const kageboushi = getSpeciesById("kageboushi");
    expect(kageboushi?.evolvesTo?.[0].id).toBe("yomikagura");
    const yomikagura = getSpeciesById("yomikagura");
    expect(yomikagura?.evolvesTo).toBeUndefined();
  });

  it("中盤モンスターのレベル帯が序盤より高い", () => {
    const midMaxLevels = MID_MONSTERS.filter((m) => m.evolvesTo?.length).map(
      (m) => m.evolvesTo![0].level,
    );
    const earlyMaxLevels = EARLY_MONSTERS.filter((m) => m.evolvesTo?.length).map(
      (m) => m.evolvesTo![0].level,
    );

    if (midMaxLevels.length > 0 && earlyMaxLevels.length > 0) {
      const midAvg = midMaxLevels.reduce((a, b) => a + b, 0) / midMaxLevels.length;
      const earlyAvg = earlyMaxLevels.reduce((a, b) => a + b, 0) / earlyMaxLevels.length;
      expect(midAvg).toBeGreaterThan(earlyAvg);
    }
  });
});

describe("終盤モンスターデータ", () => {
  it("終盤モンスターは12匹以上", () => {
    expect(LATE_MONSTERS.length).toBeGreaterThanOrEqual(12);
  });

  it("終盤に氷、ドラゴン、エスパー、鋼タイプが存在する", () => {
    const types = new Set<string>();
    for (const mon of LATE_MONSTERS) {
      for (const t of mon.types) {
        types.add(t);
      }
    }
    expect(types.has("ice")).toBe(true);
    expect(types.has("dragon")).toBe(true);
    expect(types.has("psychic")).toBe(true);
    expect(types.has("steel")).toBe(true);
  });

  it("ドラゴン系は3段階進化（タツノコ→リュウビ→リュウジン）", () => {
    const tatsunoko = getSpeciesById("tatsunoko");
    expect(tatsunoko?.evolvesTo?.[0].id).toBe("ryuubi");
    const ryuubi = getSpeciesById("ryuubi");
    expect(ryuubi?.evolvesTo?.[0].id).toBe("ryuujin");
    const ryuujin = getSpeciesById("ryuujin");
    expect(ryuujin?.evolvesTo).toBeUndefined();
  });

  it("リュウジンの種族値合計は555（擬似伝説級）", () => {
    const ryuujin = getSpeciesById("ryuujin")!;
    const total =
      ryuujin.baseStats.hp +
      ryuujin.baseStats.atk +
      ryuujin.baseStats.def +
      ryuujin.baseStats.spAtk +
      ryuujin.baseStats.spDef +
      ryuujin.baseStats.speed;
    expect(total).toBe(555);
  });

  it("終盤モンスターの進化レベルが中盤より高い", () => {
    const lateMaxLevels = LATE_MONSTERS.filter((m) => m.evolvesTo?.length).map(
      (m) => m.evolvesTo![0].level,
    );
    const midMaxLevels = MID_MONSTERS.filter((m) => m.evolvesTo?.length).map(
      (m) => m.evolvesTo![0].level,
    );

    if (lateMaxLevels.length > 0 && midMaxLevels.length > 0) {
      const lateAvg = lateMaxLevels.reduce((a, b) => a + b, 0) / lateMaxLevels.length;
      const midAvg = midMaxLevels.reduce((a, b) => a + b, 0) / midMaxLevels.length;
      expect(lateAvg).toBeGreaterThan(midAvg);
    }
  });

  it("テーマ的に重要なエスパー/フェアリー枠が存在する", () => {
    const omoidama = getSpeciesById("omoidama");
    expect(omoidama).toBeDefined();
    expect(omoidama!.types).toEqual(["psychic", "fairy"]);
  });
});

describe("伝説のモンスターデータ", () => {
  it("伝説のモンスターは2匹", () => {
    expect(LEGENDARY_MONSTERS).toHaveLength(2);
  });

  it("オモイデはエスパー/フェアリー", () => {
    const omoide = getSpeciesById("omoide");
    expect(omoide).toBeDefined();
    expect(omoide!.name).toBe("オモイデ");
    expect(omoide!.types).toEqual(["psychic", "fairy"]);
  });

  it("ワスレヌはエスパー/あく", () => {
    const wasurenu = getSpeciesById("wasurenu");
    expect(wasurenu).toBeDefined();
    expect(wasurenu!.name).toBe("ワスレヌ");
    expect(wasurenu!.types).toEqual(["psychic", "dark"]);
  });

  it("伝説のモンスターの種族値合計は600", () => {
    for (const mon of LEGENDARY_MONSTERS) {
      const total =
        mon.baseStats.hp +
        mon.baseStats.atk +
        mon.baseStats.def +
        mon.baseStats.spAtk +
        mon.baseStats.spDef +
        mon.baseStats.speed;
      expect(total, mon.name).toBe(600);
    }
  });

  it("伝説のモンスターはslow経験値グループ", () => {
    for (const mon of LEGENDARY_MONSTERS) {
      expect(mon.expGroup, mon.name).toBe("slow");
    }
  });

  it("伝説のモンスターは進化しない", () => {
    for (const mon of LEGENDARY_MONSTERS) {
      expect(mon.evolvesTo, mon.name).toBeUndefined();
    }
  });

  it("2体ともエスパータイプを共有している", () => {
    for (const mon of LEGENDARY_MONSTERS) {
      expect(mon.types).toContain("psychic");
    }
  });
});

describe("技データの整合性", () => {
  it("全技のIDがユニークである", () => {
    const ids = Object.keys(ALL_MOVES);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("getMoveByIdで技を取得できる", () => {
    const tackle = getMoveById("tackle");
    expect(tackle).toBeDefined();
    expect(tackle!.name).toBe("たいあたり");
    expect(tackle!.type).toBe("normal");
    expect(tackle!.power).toBe(40);
  });

  it("攻撃技はpower > 0、ステータス技はpower === null", () => {
    for (const move of Object.values(ALL_MOVES)) {
      if (move.category === "status") {
        expect(move.power, move.name).toBeNull();
      } else {
        expect(move.power, move.name).toBeGreaterThan(0);
      }
    }
  });

  it("全技の命中率が0-100の範囲", () => {
    for (const move of Object.values(ALL_MOVES)) {
      expect(move.accuracy, move.name).toBeGreaterThan(0);
      expect(move.accuracy, move.name).toBeLessThanOrEqual(100);
    }
  });

  it("全技のPPがプラス", () => {
    for (const move of Object.values(ALL_MOVES)) {
      expect(move.pp, move.name).toBeGreaterThan(0);
    }
  });
});
