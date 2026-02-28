import { describe, it, expect } from "vitest";
import { OMOIDE_EVENT, WASURENU_EVENT, LEGENDARY_EVENTS } from "../legendary-events";
import { executeScript, canTriggerScript } from "../event-script";
import type { StoryFlags } from "@/engine/state/story-flags";

/** 全バッジ + チャンピオンクリア済みのフラグ */
function allBadgesAndChampion(): StoryFlags {
  return {
    badge_1: true,
    badge_2: true,
    badge_3: true,
    badge_4: true,
    badge_5: true,
    badge_6: true,
    badge_7: true,
    badge_8: true,
    champion_cleared: true,
  };
}

describe("OMOIDE_EVENT", () => {
  it("殿堂入り前はトリガーされない", () => {
    const flags: StoryFlags = { badge_1: true };
    expect(canTriggerScript(OMOIDE_EVENT, flags)).toBe(false);
  });

  it("全バッジ + 殿堂入り後にトリガーされる", () => {
    const flags = allBadgesAndChampion();
    expect(canTriggerScript(OMOIDE_EVENT, flags)).toBe(true);
  });

  it("初回実行時に会話・バトル・フラグ設定が含まれる", () => {
    const flags = allBadgesAndChampion();
    const outputs = executeScript(OMOIDE_EVENT, flags);
    expect(outputs).not.toBeNull();

    const types = outputs!.map((o) => o.type);
    expect(types).toContain("dialogue");
    expect(types).toContain("battle");
    expect(types).toContain("set_flag");
    expect(types).toContain("wait");

    // バトルはオモイデLv70
    const battle = outputs!.find((o) => o.type === "battle");
    expect(battle).toBeDefined();
    if (battle && battle.type === "battle") {
      expect(battle.party).toEqual([{ speciesId: "omoide", level: 70 }]);
    }
  });

  it("omoide_event_started済みなら短縮版になる", () => {
    const flags: StoryFlags = {
      ...allBadgesAndChampion(),
      omoide_event_started: true,
    };
    const outputs = executeScript(OMOIDE_EVENT, flags);
    expect(outputs).not.toBeNull();

    // 初回より短い（初回の長い導入がない）
    const dialogues = outputs!.filter((o) => o.type === "dialogue");
    expect(dialogues.length).toBeLessThan(5);
  });

  it("omoide_captured済みなら何もしない", () => {
    const flags: StoryFlags = {
      ...allBadgesAndChampion(),
      omoide_captured: true,
    };
    const outputs = executeScript(OMOIDE_EVENT, flags);
    expect(outputs).not.toBeNull();
    expect(outputs).toHaveLength(0);
  });
});

describe("WASURENU_EVENT", () => {
  it("オモイデ未捕獲ではトリガーされない", () => {
    const flags = allBadgesAndChampion();
    expect(canTriggerScript(WASURENU_EVENT, flags)).toBe(false);
  });

  it("オモイデ捕獲後にトリガーされる", () => {
    const flags: StoryFlags = {
      ...allBadgesAndChampion(),
      omoide_captured: true,
    };
    expect(canTriggerScript(WASURENU_EVENT, flags)).toBe(true);
  });

  it("初回実行時にストーリー会話とバトルが含まれる", () => {
    const flags: StoryFlags = {
      ...allBadgesAndChampion(),
      omoide_captured: true,
    };
    const outputs = executeScript(WASURENU_EVENT, flags);
    expect(outputs).not.toBeNull();

    const types = outputs!.map((o) => o.type);
    expect(types).toContain("dialogue");
    expect(types).toContain("battle");

    // バトルはワスレヌLv70
    const battle = outputs!.find((o) => o.type === "battle");
    if (battle && battle.type === "battle") {
      expect(battle.party).toEqual([{ speciesId: "wasurenu", level: 70 }]);
    }
  });

  it("wasurenu_captured済みなら何もしない", () => {
    const flags: StoryFlags = {
      ...allBadgesAndChampion(),
      omoide_captured: true,
      wasurenu_captured: true,
    };
    const outputs = executeScript(WASURENU_EVENT, flags);
    expect(outputs).not.toBeNull();
    expect(outputs).toHaveLength(0);
  });

  it("ワスレヌの初回ストーリーにはオモイデとの関係が語られる", () => {
    const flags: StoryFlags = {
      ...allBadgesAndChampion(),
      omoide_captured: true,
    };
    const outputs = executeScript(WASURENU_EVENT, flags);
    const dialogues = outputs!.filter((o) => o.type === "dialogue");
    const allLines = dialogues
      .filter((d): d is Extract<typeof d, { type: "dialogue" }> => d.type === "dialogue")
      .flatMap((d) => d.lines);

    // ストーリーにオモイデへの言及がある
    const mentionsOmoide = allLines.some((line) => line.includes("オモイデ"));
    expect(mentionsOmoide).toBe(true);
  });
});

describe("LEGENDARY_EVENTS", () => {
  it("2つのイベントが含まれる", () => {
    expect(LEGENDARY_EVENTS).toHaveLength(2);
    expect(LEGENDARY_EVENTS.map((e) => e.id)).toEqual(["legendary_omoide", "legendary_wasurenu"]);
  });
});
