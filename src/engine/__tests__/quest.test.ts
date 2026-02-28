import { describe, it, expect } from "vitest";
import {
  createQuestState,
  canAcceptQuest,
  acceptQuest,
  updateQuestCondition,
  isQuestComplete,
  completeQuest,
  getQuestProgressText,
  getQuestById,
  SIDE_QUESTS,
} from "../quest";
import type { QuestDefinition, QuestState } from "../quest";

const sampleQuest: QuestDefinition = {
  id: "test_quest",
  title: "テストクエスト",
  description: "テスト用のクエスト",
  giverNpcId: "test_npc",
  giverMapId: "test_map",
  conditions: [
    { type: "show_monster", speciesId: "himori" },
    { type: "visit_location", mapId: "route-1" },
  ],
  rewards: [{ type: "item", itemId: "potion", count: 3 }],
};

const questWithPrereq: QuestDefinition = {
  id: "prereq_quest",
  title: "前提条件付きクエスト",
  description: "前提条件が必要",
  giverNpcId: "test_npc",
  giverMapId: "test_map",
  conditions: [{ type: "visit_location", mapId: "route-1" }],
  rewards: [{ type: "item", itemId: "potion", count: 1 }],
  prerequisite: { flag: "gym1_cleared", badge: 2 },
};

describe("createQuestState", () => {
  it("初期状態は空", () => {
    const state = createQuestState();
    expect(state.active).toEqual([]);
    expect(state.completed).toEqual([]);
  });
});

describe("canAcceptQuest", () => {
  it("前提条件なしのクエストは受注可能", () => {
    const state = createQuestState();
    expect(canAcceptQuest(sampleQuest, state, {}, 0)).toBe(true);
  });

  it("既に受注中のクエストは受注不可", () => {
    let state = createQuestState();
    state = acceptQuest(sampleQuest, state);
    expect(canAcceptQuest(sampleQuest, state, {}, 0)).toBe(false);
  });

  it("既に完了したクエストは受注不可", () => {
    let state = createQuestState();
    state = acceptQuest(sampleQuest, state);
    state = updateQuestCondition(state, "test_quest", 0);
    state = updateQuestCondition(state, "test_quest", 1);
    state = completeQuest(state, "test_quest");
    expect(canAcceptQuest(sampleQuest, state, {}, 0)).toBe(false);
  });

  it("フラグ前提条件を満たさない場合受注不可", () => {
    const state = createQuestState();
    expect(canAcceptQuest(questWithPrereq, state, {}, 2)).toBe(false);
  });

  it("バッジ前提条件を満たさない場合受注不可", () => {
    const state = createQuestState();
    expect(canAcceptQuest(questWithPrereq, state, { gym1_cleared: true }, 1)).toBe(false);
  });

  it("前提条件を全て満たせば受注可能", () => {
    const state = createQuestState();
    expect(canAcceptQuest(questWithPrereq, state, { gym1_cleared: true }, 2)).toBe(true);
  });
});

describe("acceptQuest", () => {
  it("クエストを受注するとactive配列に追加される", () => {
    const state = createQuestState();
    const newState = acceptQuest(sampleQuest, state);
    expect(newState.active).toHaveLength(1);
    expect(newState.active[0].questId).toBe("test_quest");
    expect(newState.active[0].conditionsMet).toEqual([false, false]);
  });
});

describe("updateQuestCondition", () => {
  it("条件を達成済みにできる", () => {
    let state = createQuestState();
    state = acceptQuest(sampleQuest, state);
    state = updateQuestCondition(state, "test_quest", 0);
    expect(state.active[0].conditionsMet[0]).toBe(true);
    expect(state.active[0].conditionsMet[1]).toBe(false);
  });
});

describe("isQuestComplete", () => {
  it("全条件達成で完了", () => {
    let state = createQuestState();
    state = acceptQuest(sampleQuest, state);
    state = updateQuestCondition(state, "test_quest", 0);
    state = updateQuestCondition(state, "test_quest", 1);
    expect(isQuestComplete(state, "test_quest")).toBe(true);
  });

  it("一部未達成では未完了", () => {
    let state = createQuestState();
    state = acceptQuest(sampleQuest, state);
    state = updateQuestCondition(state, "test_quest", 0);
    expect(isQuestComplete(state, "test_quest")).toBe(false);
  });

  it("受注していないクエストはfalse", () => {
    const state = createQuestState();
    expect(isQuestComplete(state, "test_quest")).toBe(false);
  });
});

describe("completeQuest", () => {
  it("クエストをactiveからcompletedに移動", () => {
    let state = createQuestState();
    state = acceptQuest(sampleQuest, state);
    state = completeQuest(state, "test_quest");
    expect(state.active).toHaveLength(0);
    expect(state.completed).toContain("test_quest");
  });
});

describe("getQuestProgressText", () => {
  it("進行状況テキストを返す", () => {
    let state = createQuestState();
    state = acceptQuest(sampleQuest, state);
    state = updateQuestCondition(state, "test_quest", 0);
    const text = getQuestProgressText(sampleQuest, state.active[0]);
    expect(text).toBe("テストクエスト (1/2)");
  });
});

describe("SIDE_QUESTS", () => {
  it("10個のクエストが定義されている", () => {
    expect(SIDE_QUESTS).toHaveLength(10);
  });

  it("全クエストにIDとタイトルがある", () => {
    for (const quest of SIDE_QUESTS) {
      expect(quest.id).toBeTruthy();
      expect(quest.title).toBeTruthy();
      expect(quest.conditions.length).toBeGreaterThan(0);
      expect(quest.rewards.length).toBeGreaterThan(0);
    }
  });

  it("getQuestByIdで検索できる", () => {
    const quest = getQuestById("quest_lost_monster");
    expect(quest).toBeDefined();
    expect(quest!.title).toBe("迷子のモンスター");
  });

  it("存在しないIDはundefined", () => {
    expect(getQuestById("nonexistent")).toBeUndefined();
  });
});
