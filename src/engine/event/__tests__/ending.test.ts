import { describe, it, expect } from "vitest";
import { executeScript } from "../event-script";
import {
  createEndingScript,
  createPostgameIntroScript,
  createSoumaFinalBattleScript,
} from "../ending";

describe("エンディングシーケンス", () => {
  describe("createEndingScript", () => {
    it("champion_defeatedフラグでトリガーされる", () => {
      const script = createEndingScript("テスト");
      expect(executeScript(script, {})).toBeNull();
      expect(executeScript(script, { champion_defeated: true })).not.toBeNull();
    });

    it("殿堂入りメッセージにプレイヤー名が含まれる", () => {
      const script = createEndingScript("ヒロト");
      const outputs = executeScript(script, { champion_defeated: true })!;
      const firstDialogue = outputs[0];
      expect(firstDialogue.type).toBe("dialogue");
      if (firstDialogue.type === "dialogue") {
        expect(firstDialogue.lines[0]).toContain("ヒロト");
      }
    });

    it("アカツキ、母、博士、ソウマの会話を含む", () => {
      const script = createEndingScript("テスト");
      const outputs = executeScript(script, { champion_defeated: true })!;

      const speakers = outputs
        .filter((o) => o.type === "dialogue" && "speaker" in o && o.speaker)
        .map((o) => (o as { speaker: string }).speaker);

      expect(speakers).toContain("アカツキ");
      expect(speakers).toContain("母");
      expect(speakers).toContain("コダチ博士");
      expect(speakers).toContain("ソウマ");
    });

    it("ワスレ町への移動を含む", () => {
      const script = createEndingScript("テスト");
      const outputs = executeScript(script, { champion_defeated: true })!;

      const movePlayer = outputs.find((o) => o.type === "move_player");
      expect(movePlayer).toBeDefined();
      if (movePlayer && movePlayer.type === "move_player") {
        expect(movePlayer.mapId).toBe("wasuremachi");
      }
    });

    it("ending_completeフラグが設定される", () => {
      const script = createEndingScript("テスト");
      const outputs = executeScript(script, { champion_defeated: true })!;

      const flag = outputs.find((o) => o.type === "set_flag" && o.flag === "ending_complete");
      expect(flag).toEqual({
        type: "set_flag",
        flag: "ending_complete",
        value: true,
      });
    });

    it("パーティ回復を含む", () => {
      const script = createEndingScript("テスト");
      const outputs = executeScript(script, { champion_defeated: true })!;

      const heal = outputs.find((o) => o.type === "heal");
      expect(heal).toBeDefined();
    });

    it("演出用のwaitを含む", () => {
      const script = createEndingScript("テスト");
      const outputs = executeScript(script, { champion_defeated: true })!;

      const waits = outputs.filter((o) => o.type === "wait");
      expect(waits.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("createPostgameIntroScript", () => {
    it("エンディング完了後にトリガーされる", () => {
      const script = createPostgameIntroScript();
      expect(
        executeScript(script, { ending_complete: true, postgame_started: false }),
      ).not.toBeNull();
    });

    it("エンディング未完了ではトリガーされない", () => {
      const script = createPostgameIntroScript();
      expect(executeScript(script, {})).toBeNull();
    });

    it("既にポストゲーム開始済みならトリガーされない", () => {
      const script = createPostgameIntroScript();
      expect(executeScript(script, { ending_complete: true, postgame_started: true })).toBeNull();
    });

    it("postgame_startedフラグが設定される", () => {
      const script = createPostgameIntroScript();
      const outputs = executeScript(script, { ending_complete: true, postgame_started: false })!;

      const flag = outputs.find((o) => o.type === "set_flag");
      expect(flag).toEqual({
        type: "set_flag",
        flag: "postgame_started",
        value: true,
      });
    });
  });

  describe("createSoumaFinalBattleScript", () => {
    it("エンディング完了後にトリガーされる", () => {
      const script = createSoumaFinalBattleScript();
      expect(
        executeScript(script, { ending_complete: true, souma_final_beaten: false }),
      ).not.toBeNull();
    });

    it("ソウマとの6匹フルバトルを含む", () => {
      const script = createSoumaFinalBattleScript();
      const outputs = executeScript(script, { ending_complete: true, souma_final_beaten: false })!;

      const battle = outputs.find((o) => o.type === "battle");
      expect(battle).toBeDefined();
      if (battle && battle.type === "battle") {
        expect(battle.trainerName).toBe("モンスター研究者 ソウマ");
        expect(battle.party).toHaveLength(6);
        // レベル62-65の範囲
        for (const mon of battle.party) {
          expect(mon.level).toBeGreaterThanOrEqual(62);
          expect(mon.level).toBeLessThanOrEqual(65);
        }
      }
    });

    it("souma_final_beatenフラグが設定される", () => {
      const script = createSoumaFinalBattleScript();
      const outputs = executeScript(script, { ending_complete: true, souma_final_beaten: false })!;

      const flag = outputs.find((o) => o.type === "set_flag");
      expect(flag).toEqual({
        type: "set_flag",
        flag: "souma_final_beaten",
        value: true,
      });
    });

    it("既に勝利済みならトリガーされない", () => {
      const script = createSoumaFinalBattleScript();
      expect(executeScript(script, { ending_complete: true, souma_final_beaten: true })).toBeNull();
    });
  });
});
