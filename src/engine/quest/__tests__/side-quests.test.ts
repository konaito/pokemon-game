import { describe, it, expect } from "vitest";
import type { StoryFlags } from "@/engine/state/story-flags";
import {
  getQuestStatus,
  getActiveQuests,
  getAvailableQuests,
  getCompletedQuestCount,
  SIDE_QUESTS,
} from "../side-quests";

describe("サイドクエストデータ", () => {
  it("10個のクエストが定義されている", () => {
    expect(SIDE_QUESTS).toHaveLength(10);
  });

  it("全クエストにユニークなIDがある", () => {
    const ids = SIDE_QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("全クエストに報酬がある", () => {
    for (const quest of SIDE_QUESTS) {
      expect(quest.rewards.length, `${quest.id}に報酬がない`).toBeGreaterThan(0);
    }
  });

  it("全クエストにフラグが設定されている", () => {
    for (const quest of SIDE_QUESTS) {
      expect(quest.startedFlag).toBeTruthy();
      expect(quest.completedFlag).toBeTruthy();
    }
  });
});

describe("getQuestStatus", () => {
  const quest = SIDE_QUESTS[0]; // 迷子のコネズミ

  it("完了済み", () => {
    const flags: StoryFlags = { [quest.completedFlag]: true };
    expect(getQuestStatus(quest, flags)).toBe("completed");
  });

  it("進行中", () => {
    const flags: StoryFlags = { [quest.startedFlag]: true };
    expect(getQuestStatus(quest, flags)).toBe("active");
  });

  it("受注可能（条件なし）", () => {
    const flags: StoryFlags = {};
    expect(getQuestStatus(quest, flags)).toBe("available");
  });

  it("受注不可（条件未達）", () => {
    const quest2 = SIDE_QUESTS[1]; // ヒカリネコ（badge_1必要）
    const flags: StoryFlags = {};
    expect(getQuestStatus(quest2, flags)).toBe("unavailable");
  });

  it("条件付きクエストが条件達成で受注可能になる", () => {
    const quest2 = SIDE_QUESTS[1];
    const flags: StoryFlags = { badge_1: true };
    expect(getQuestStatus(quest2, flags)).toBe("available");
  });

  it("完了フラグが優先される", () => {
    const flags: StoryFlags = { [quest.startedFlag]: true, [quest.completedFlag]: true };
    expect(getQuestStatus(quest, flags)).toBe("completed");
  });
});

describe("getActiveQuests", () => {
  it("進行中のクエストを返す", () => {
    const flags: StoryFlags = {
      quest_lost_konezumi_started: true,
      quest_explore_ruins_started: true,
      badge_5: true,
    };
    const active = getActiveQuests(SIDE_QUESTS, flags);
    expect(active.length).toBe(2);
  });

  it("完了済みは含まない", () => {
    const flags: StoryFlags = {
      quest_lost_konezumi_started: true,
      quest_lost_konezumi_completed: true,
    };
    const active = getActiveQuests(SIDE_QUESTS, flags);
    expect(active.length).toBe(0);
  });
});

describe("getAvailableQuests", () => {
  it("受注可能なクエストを返す", () => {
    const flags: StoryFlags = {};
    const available = getAvailableQuests(SIDE_QUESTS, flags);
    // 条件なしのクエストのみ
    expect(available.length).toBe(1); // 迷子のコネズミのみ
  });

  it("バッジ取得で追加のクエストが受注可能になる", () => {
    const flags: StoryFlags = { badge_1: true, badge_2: true };
    const available = getAvailableQuests(SIDE_QUESTS, flags);
    expect(available.length).toBe(3);
  });
});

describe("getCompletedQuestCount", () => {
  it("完了済みクエスト数を返す", () => {
    const flags: StoryFlags = {
      quest_lost_konezumi_completed: true,
      quest_show_hikarineko_completed: true,
    };
    expect(getCompletedQuestCount(SIDE_QUESTS, flags)).toBe(2);
  });

  it("完了済みなしは0", () => {
    const flags: StoryFlags = {};
    expect(getCompletedQuestCount(SIDE_QUESTS, flags)).toBe(0);
  });
});
