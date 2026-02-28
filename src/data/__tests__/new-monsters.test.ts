import { describe, it, expect } from "vitest";
import { NEW_MONSTERS } from "@/data/monsters/new-monsters";
import { ALL_SPECIES, getSpeciesById } from "@/data/monsters";
import { getSpriteData } from "@/data/sprites";
import type { TypeId } from "@/types";

describe("追加モンスター20体", () => {
  it("20体の新モンスターが定義されている", () => {
    expect(NEW_MONSTERS).toHaveLength(20);
  });

  it("全モンスター合計が70体になっている", () => {
    expect(ALL_SPECIES.length).toBe(70);
  });

  it("全新モンスターにIDと名前がある", () => {
    for (const m of NEW_MONSTERS) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
    }
  });

  it("全新モンスターのIDが一意である", () => {
    const ids = ALL_SPECIES.map((m) => m.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("全新モンスターに20×20スプライトが作成されている", () => {
    for (const m of NEW_MONSTERS) {
      const sprite = getSpriteData(m.id);
      expect(sprite, `${m.name}(${m.id})のスプライトがない`).toBeDefined();
      expect(sprite!.grid).toHaveLength(20);
      for (let y = 0; y < 20; y++) {
        expect(
          sprite!.grid[y].length,
          `${m.name} 行${y}が20文字でない: ${sprite!.grid[y].length}`,
        ).toBe(20);
      }
    }
  });

  it("全新モンスターにlearnsetがある", () => {
    for (const m of NEW_MONSTERS) {
      expect(m.learnset.length, `${m.name}のlearnsetが空`).toBeGreaterThan(0);
    }
  });

  it("全新モンスターにbaseStatsがある", () => {
    for (const m of NEW_MONSTERS) {
      const { hp, atk, def, spAtk, spDef, speed } = m.baseStats;
      expect(hp).toBeGreaterThan(0);
      expect(atk).toBeGreaterThan(0);
      expect(def).toBeGreaterThan(0);
      expect(spAtk).toBeGreaterThan(0);
      expect(spDef).toBeGreaterThan(0);
      expect(speed).toBeGreaterThan(0);
    }
  });

  describe("不足タイプの補強", () => {
    function countType(typeId: TypeId): number {
      return ALL_SPECIES.filter((m) => m.types[0] === typeId || m.types[1] === typeId).length;
    }

    it("毒タイプが増加している（7体以上）", () => {
      expect(countType("poison")).toBeGreaterThanOrEqual(7);
    });

    it("虫タイプが増加している（5体以上）", () => {
      expect(countType("bug")).toBeGreaterThanOrEqual(5);
    });

    it("ゴーストタイプが増加している（7体以上）", () => {
      expect(countType("ghost")).toBeGreaterThanOrEqual(7);
    });

    it("鋼タイプが増加している（7体以上）", () => {
      expect(countType("steel")).toBeGreaterThanOrEqual(7);
    });

    it("悪タイプが増加している（6体以上）", () => {
      expect(countType("dark")).toBeGreaterThanOrEqual(6);
    });

    it("氷タイプが増加している（6体以上）", () => {
      expect(countType("ice")).toBeGreaterThanOrEqual(6);
    });

    it("地面タイプが増加している（5体以上）", () => {
      expect(countType("ground")).toBeGreaterThanOrEqual(5);
    });
  });

  describe("進化系統", () => {
    it("ドクキノコ→キノドクシの進化が正しい", () => {
      const dokukinoko = getSpeciesById("dokukinoko")!;
      expect(dokukinoko.evolvesTo).toBeDefined();
      expect(dokukinoko.evolvesTo![0].id).toBe("kinodokushi");
      expect(dokukinoko.evolvesTo![0].level).toBe(25);
    });

    it("クモイト→ジョロウグモの進化が正しい", () => {
      const kumoito = getSpeciesById("kumoito")!;
      expect(kumoito.evolvesTo![0].id).toBe("jorougumo");
    });

    it("ヒトダマ→ユウレイビ→アマテラの3段階進化が正しい", () => {
      const hitodama = getSpeciesById("hitodama")!;
      expect(hitodama.evolvesTo![0].id).toBe("yuureibi");
      const yuureibi = getSpeciesById("yuureibi")!;
      expect(yuureibi.evolvesTo![0].id).toBe("amatera");
    });

    it("テツイワ→コウテツジンの進化が正しい", () => {
      const tetsuiwa = getSpeciesById("tetsuiwa")!;
      expect(tetsuiwa.evolvesTo![0].id).toBe("koutetsujin");
    });

    it("ヤミトカゲ→アンコクリュウの進化が正しい", () => {
      const yamitokage = getSpeciesById("yamitokage")!;
      expect(yamitokage.evolvesTo![0].id).toBe("ankokuryuu");
    });

    it("コオリモグラ→トウドジンの進化が正しい", () => {
      const koorimogura = getSpeciesById("koorimogura")!;
      expect(koorimogura.evolvesTo![0].id).toBe("toudojin");
    });
  });

  describe("分岐進化", () => {
    it("ハナウサギからヒカリウサギへの分岐進化がある", () => {
      const hanausagi = getSpeciesById("hanausagi")!;
      expect(hanausagi.evolvesTo!.length).toBeGreaterThanOrEqual(2);
      const hikariEvolution = hanausagi.evolvesTo!.find((e) => e.id === "hikariusagi");
      expect(hikariEvolution).toBeDefined();
      expect(hikariEvolution!.condition).toBe("day");
    });

    it("ヒカリネコからヨゾラネコへの分岐進化がある", () => {
      const hikarineko = getSpeciesById("hikarineko")!;
      expect(hikarineko.evolvesTo).toBeDefined();
      const yozoraEvolution = hikarineko.evolvesTo!.find((e) => e.id === "yozoraneko");
      expect(yozoraEvolution).toBeDefined();
      expect(yozoraEvolution!.condition).toBe("night");
    });
  });

  describe("テーマ一致", () => {
    it("ワスレナグサ（忘れな草）がテーマに合致する草/フェアリータイプ", () => {
      const wasurenagusa = getSpeciesById("wasurenagusa")!;
      expect(wasurenagusa.types).toEqual(["grass", "fairy"]);
    });

    it("アマテラ（天照）がゴースト/フェアリーの最終進化", () => {
      const amatera = getSpeciesById("amatera")!;
      expect(amatera.types).toEqual(["ghost", "fairy"]);
      // 高い種族値を持つ
      const totalStats = Object.values(amatera.baseStats).reduce((a, b) => a + b, 0);
      expect(totalStats).toBeGreaterThanOrEqual(450);
    });
  });

  it("全進化先IDが実在するモンスターを指している", () => {
    for (const m of ALL_SPECIES) {
      if (m.evolvesTo) {
        for (const evo of m.evolvesTo) {
          expect(getSpeciesById(evo.id), `${m.name}の進化先${evo.id}が存在しない`).toBeDefined();
        }
      }
    }
  });
});
