import { describe, it, expect } from "vitest";
import { executeScript } from "../event-script";
import {
  ELITE_FOUR,
  CHAMPION,
  createEliteFourScript,
  createChampionScript,
  createLeagueScripts,
} from "../elite-four";

describe("四天王 & チャンピオン戦", () => {
  describe("四天王データ", () => {
    it("四天王は4人", () => {
      expect(ELITE_FOUR).toHaveLength(4);
    });

    it("全メンバーのIDがユニーク", () => {
      const ids = ELITE_FOUR.map((m) => m.id);
      expect(new Set(ids).size).toBe(4);
    });

    it("全メンバーがパーティを持つ", () => {
      for (const member of ELITE_FOUR) {
        expect(member.party.length).toBeGreaterThanOrEqual(3);
        expect(member.introDialogue.length).toBeGreaterThan(0);
        expect(member.defeatDialogue.length).toBeGreaterThan(0);
      }
    });

    it("四天王のパーティレベルが段階的に上がる", () => {
      const maxLevels = ELITE_FOUR.map((m) =>
        Math.max(...m.party.map((p) => p.level))
      );
      for (let i = 1; i < maxLevels.length; i++) {
        expect(maxLevels[i]).toBeGreaterThanOrEqual(maxLevels[i - 1]);
      }
    });
  });

  describe("チャンピオンデータ", () => {
    it("チャンピオンはアカツキ", () => {
      expect(CHAMPION.name).toBe("アカツキ");
      expect(CHAMPION.title).toBe("チャンピオン");
    });

    it("チャンピオンは6匹フルパーティ", () => {
      expect(CHAMPION.party).toHaveLength(6);
    });

    it("チャンピオンのレベルは四天王より高い", () => {
      const champMax = Math.max(...CHAMPION.party.map((p) => p.level));
      const eliteMax = Math.max(
        ...ELITE_FOUR.flatMap((m) => m.party.map((p) => p.level))
      );
      expect(champMax).toBeGreaterThan(eliteMax);
    });
  });

  describe("createEliteFourScript", () => {
    it("未クリア時はバトルを含むスクリプトを生成する", () => {
      const script = createEliteFourScript(ELITE_FOUR[0], 0);
      expect(script.id).toBe("elite_four_battle_1");

      const outputs = executeScript(script, {})!;
      expect(outputs).not.toBeNull();

      // イントロ会話
      expect(outputs[0]).toEqual({
        type: "dialogue",
        speaker: "ツバサ",
        lines: expect.any(Array),
      });

      // バトル
      expect(outputs[1]).toEqual({
        type: "battle",
        trainerName: "四天王 ツバサ",
        party: expect.any(Array),
      });

      // 敗北会話
      expect(outputs[2]).toEqual({
        type: "dialogue",
        speaker: "ツバサ",
        lines: expect.any(Array),
      });

      // フラグ設定
      expect(outputs[3]).toEqual({
        type: "set_flag",
        flag: "elite_four_1_cleared",
        value: true,
      });
    });

    it("クリア済みは短い会話のみ", () => {
      const script = createEliteFourScript(ELITE_FOUR[0], 0);
      const outputs = executeScript(script, { elite_four_1_cleared: true })!;
      expect(outputs).toHaveLength(1);
      expect(outputs[0].type).toBe("dialogue");
    });

    it("4人分のフラグ名が正しい", () => {
      for (let i = 0; i < 4; i++) {
        const script = createEliteFourScript(ELITE_FOUR[i], i);
        const outputs = executeScript(script, {})!;
        const flag = outputs.find((o) => o.type === "set_flag");
        expect(flag).toEqual({
          type: "set_flag",
          flag: `elite_four_${i + 1}_cleared`,
          value: true,
        });
      }
    });
  });

  describe("createChampionScript", () => {
    it("初回は会話→バトル→殿堂入りの流れ", () => {
      const script = createChampionScript(CHAMPION);
      expect(script.id).toBe("champion_battle");

      const outputs = executeScript(script, {})!;

      // イントロ
      expect(outputs[0]).toEqual({
        type: "dialogue",
        speaker: "アカツキ",
        lines: expect.any(Array),
      });

      // バトル
      expect(outputs[1]).toEqual({
        type: "battle",
        trainerName: "チャンピオン アカツキ",
        party: expect.any(Array),
      });

      // 敗北会話
      expect(outputs[2].type).toBe("dialogue");

      // 殿堂入りメッセージ
      expect(outputs[3]).toEqual({
        type: "dialogue",
        speaker: undefined,
        lines: ["殿堂入りおめでとう！"],
      });

      // champion_defeatedフラグ
      expect(outputs[4]).toEqual({
        type: "set_flag",
        flag: "champion_defeated",
        value: true,
      });
    });

    it("2回目以降も再戦可能（殿堂入りメッセージなし）", () => {
      const script = createChampionScript(CHAMPION);
      const outputs = executeScript(script, { champion_defeated: true })!;

      const battle = outputs.find((o) => o.type === "battle");
      expect(battle).toBeDefined();

      // 殿堂入りメッセージやフラグ設定はない
      const flagSets = outputs.filter((o) => o.type === "set_flag");
      expect(flagSets).toHaveLength(0);
    });
  });

  describe("createLeagueScripts", () => {
    it("5つのスクリプト（四天王4 + チャンピオン1）を生成する", () => {
      const scripts = createLeagueScripts();
      expect(scripts).toHaveLength(5);
      expect(scripts[0].id).toBe("elite_four_battle_1");
      expect(scripts[1].id).toBe("elite_four_battle_2");
      expect(scripts[2].id).toBe("elite_four_battle_3");
      expect(scripts[3].id).toBe("elite_four_battle_4");
      expect(scripts[4].id).toBe("champion_battle");
    });
  });
});
