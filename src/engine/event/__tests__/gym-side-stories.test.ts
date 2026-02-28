import { describe, it, expect } from "vitest";
import { GYM_SIDE_STORIES } from "../gym-side-stories";
import { executeScript, canTriggerScript } from "../event-script";
import type { StoryFlags } from "@/engine/state/story-flags";

function championFlags(): StoryFlags {
  return {
    champion_cleared: true,
    badge_1: true,
    badge_2: true,
    badge_3: true,
    badge_4: true,
    badge_5: true,
    badge_6: true,
    badge_7: true,
    badge_8: true,
  };
}

describe("GYM_SIDE_STORIES", () => {
  it("8つのサイドストーリーが定義されている", () => {
    expect(GYM_SIDE_STORIES).toHaveLength(8);
  });

  it("各ストーリーにユニークなIDがある", () => {
    const ids = GYM_SIDE_STORIES.map((s) => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(8);
  });

  it("殿堂入り前はどのストーリーもトリガーされない", () => {
    const flags: StoryFlags = { badge_1: true };
    for (const story of GYM_SIDE_STORIES) {
      expect(canTriggerScript(story, flags)).toBe(false);
    }
  });

  it("殿堂入り後に全ストーリーがトリガー可能", () => {
    const flags = championFlags();
    for (const story of GYM_SIDE_STORIES) {
      expect(canTriggerScript(story, flags)).toBe(true);
    }
  });

  it("各ストーリーの初回実行で会話とアイテムが含まれる", () => {
    const flags = championFlags();
    for (const story of GYM_SIDE_STORIES) {
      const outputs = executeScript(story, flags);
      expect(outputs).not.toBeNull();
      expect(outputs!.length).toBeGreaterThan(0);

      const types = outputs!.map((o) => o.type);
      expect(types).toContain("dialogue");
      expect(types).toContain("give_item");
      expect(types).toContain("set_flag");
    }
  });

  it("クリア済みストーリーは再実行されない", () => {
    for (let i = 1; i <= 8; i++) {
      const flags: StoryFlags = {
        ...championFlags(),
        [`gym${i}_story_cleared`]: true,
      };
      const story = GYM_SIDE_STORIES[i - 1];
      const outputs = executeScript(story, flags);
      expect(outputs).not.toBeNull();
      expect(outputs!).toHaveLength(0);
    }
  });

  it("ジム8のストーリーでオモイデとワスレヌに言及する", () => {
    const flags = championFlags();
    const story = GYM_SIDE_STORIES[7]; // タツミ
    const outputs = executeScript(story, flags)!;
    const dialogues = outputs.filter(
      (o): o is Extract<typeof o, { type: "dialogue" }> => o.type === "dialogue",
    );
    const allLines = dialogues.flatMap((d) => d.lines);
    const mentionsLegendary = allLines.some(
      (line) => line.includes("オモイデ") || line.includes("ワスレヌ"),
    );
    expect(mentionsLegendary).toBe(true);
  });

  it("ジム6のストーリーで忘却の遺跡に言及する", () => {
    const flags = championFlags();
    const story = GYM_SIDE_STORIES[5]; // キリフリ
    const outputs = executeScript(story, flags)!;
    const dialogues = outputs.filter(
      (o): o is Extract<typeof o, { type: "dialogue" }> => o.type === "dialogue",
    );
    const allLines = dialogues.flatMap((d) => d.lines);
    expect(allLines.some((line) => line.includes("遺跡"))).toBe(true);
  });
});
