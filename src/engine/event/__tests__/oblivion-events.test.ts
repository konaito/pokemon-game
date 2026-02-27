import { describe, it, expect } from "vitest";
import { executeScript } from "../event-script";
import {
  oblivionFirstEncounter,
  oblivionRuinsEvent,
  oblivionKirifuriEvent,
  oblivionFinalBattle,
  OBLIVION_EVENTS,
} from "../oblivion-events";

describe("オブリヴィオン団イベント", () => {
  describe("初遭遇イベント（カガリ市）", () => {
    it("ジム3クリア後にトリガーされる", () => {
      const outputs = executeScript(oblivionFirstEncounter, { gym3_cleared: true });
      expect(outputs).not.toBeNull();
    });

    it("ジム3未クリアではトリガーされない", () => {
      const outputs = executeScript(oblivionFirstEncounter, {});
      expect(outputs).toBeNull();
    });

    it("初回は会話→バトル→フラグ設定の流れ", () => {
      const outputs = executeScript(oblivionFirstEncounter, { gym3_cleared: true })!;
      expect(outputs).not.toBeNull();

      // 街の描写
      expect(outputs[0].type).toBe("dialogue");

      // 団員の演説
      expect(outputs[1]).toEqual({
        type: "dialogue",
        speaker: "オブリヴィオン団員",
        lines: expect.arrayContaining([expect.stringContaining("大忘却")]),
      });

      // マボロシとの会話
      const maboroshiDialogue = outputs.find(
        (o) => o.type === "dialogue" && "speaker" in o && o.speaker === "マボロシ",
      );
      expect(maboroshiDialogue).toBeDefined();

      // バトル
      const battle = outputs.find((o) => o.type === "battle");
      expect(battle).toEqual({
        type: "battle",
        trainerName: "オブリヴィオン マボロシ",
        party: expect.any(Array),
      });

      // フラグ設定
      const flagSet = outputs.find((o) => o.type === "set_flag");
      expect(flagSet).toEqual({
        type: "set_flag",
        flag: "oblivion_encountered",
        value: true,
      });
    });

    it("2回目は空配列（スキップ）を返す", () => {
      const outputs = executeScript(oblivionFirstEncounter, {
        gym3_cleared: true,
        oblivion_encountered: true,
      })!;
      expect(outputs).toHaveLength(0);
    });
  });

  describe("忘却の遺跡イベント（ナツメ町）", () => {
    it("ジム4クリア+初遭遇後にトリガーされる", () => {
      const outputs = executeScript(oblivionRuinsEvent, {
        gym4_cleared: true,
        oblivion_encountered: true,
      });
      expect(outputs).not.toBeNull();
    });

    it("前提条件が欠けているとトリガーされない", () => {
      expect(executeScript(oblivionRuinsEvent, { gym4_cleared: true })).toBeNull();
      expect(executeScript(oblivionRuinsEvent, { oblivion_encountered: true })).toBeNull();
    });

    it("初回はウツロとのバトルを含む", () => {
      const outputs = executeScript(oblivionRuinsEvent, {
        gym4_cleared: true,
        oblivion_encountered: true,
      })!;

      const battle = outputs.find((o) => o.type === "battle");
      expect(battle).toBeDefined();
      if (battle && battle.type === "battle") {
        expect(battle.trainerName).toBe("オブリヴィオン ウツロ");
      }

      const flag = outputs.find((o) => o.type === "set_flag");
      expect(flag).toEqual({
        type: "set_flag",
        flag: "ruins_investigated",
        value: true,
      });
    });
  });

  describe("キリフリ村防衛イベント", () => {
    it("ジム5クリア+遺跡調査後にトリガーされる", () => {
      const outputs = executeScript(oblivionKirifuriEvent, {
        gym5_cleared: true,
        ruins_investigated: true,
      });
      expect(outputs).not.toBeNull();
    });

    it("マボロシとの2回目のバトルを含む", () => {
      const outputs = executeScript(oblivionKirifuriEvent, {
        gym5_cleared: true,
        ruins_investigated: true,
      })!;

      const battle = outputs.find((o) => o.type === "battle");
      expect(battle).toBeDefined();
      if (battle && battle.type === "battle") {
        expect(battle.trainerName).toBe("オブリヴィオン マボロシ");
        expect(battle.party).toHaveLength(3); // パーティが増えている
      }
    });
  });

  describe("セイレイ山 最終決戦", () => {
    it("全8バッジ+キリフリ防衛後にトリガーされる", () => {
      const outputs = executeScript(oblivionFinalBattle, {
        gym8_cleared: true,
        kirifuri_defended: true,
      });
      expect(outputs).not.toBeNull();
    });

    it("トコヤミ→カゲロウの2連戦を含む", () => {
      const outputs = executeScript(oblivionFinalBattle, {
        gym8_cleared: true,
        kirifuri_defended: true,
      })!;

      const battles = outputs.filter((o) => o.type === "battle");
      expect(battles).toHaveLength(2);

      if (battles[0].type === "battle") {
        expect(battles[0].trainerName).toBe("オブリヴィオン トコヤミ");
      }
      if (battles[1].type === "battle") {
        expect(battles[1].trainerName).toBe("オブリヴィオン団ボス カゲロウ");
        expect(battles[1].party).toHaveLength(4); // ボスは4匹
      }
    });

    it("最終バトル後にoblivion_defeatedフラグが設定される", () => {
      const outputs = executeScript(oblivionFinalBattle, {
        gym8_cleared: true,
        kirifuri_defended: true,
      })!;

      const flag = outputs.find((o) => o.type === "set_flag");
      expect(flag).toEqual({
        type: "set_flag",
        flag: "oblivion_defeated",
        value: true,
      });
    });

    it("2回目は空配列（スキップ）を返す", () => {
      const outputs = executeScript(oblivionFinalBattle, {
        gym8_cleared: true,
        kirifuri_defended: true,
        oblivion_defeated: true,
      })!;
      expect(outputs).toHaveLength(0);
    });
  });

  describe("全イベント一覧", () => {
    it("4つのイベントが定義されている", () => {
      expect(OBLIVION_EVENTS).toHaveLength(4);
    });

    it("全イベントのIDがユニークである", () => {
      const ids = OBLIVION_EVENTS.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
