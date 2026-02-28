import { describe, it, expect } from "vitest";
import {
  checkDialogueCondition,
  resolveDialogue,
  resolveNpcDialogueById,
  NPC_DIALOGUE_SETS,
  getDialogueSetCount,
  getTotalConditionCount,
  type DialogueContext,
  type NpcDialogueSet,
} from "../npc-dialogue";

/** テスト用のデフォルトコンテキスト */
function defaultContext(overrides: Partial<DialogueContext> = {}): DialogueContext {
  return {
    storyFlags: {},
    badgeCount: 0,
    partySpeciesIds: [],
    partySize: 1,
    ...overrides,
  };
}

describe("checkDialogueCondition", () => {
  it("空の条件は常にtrue", () => {
    expect(checkDialogueCondition({}, defaultContext())).toBe(true);
  });

  it("フラグ条件を評価する", () => {
    const condition = { flag: "gym1_cleared" as const };
    expect(checkDialogueCondition(condition, defaultContext())).toBe(false);
    expect(
      checkDialogueCondition(condition, defaultContext({ storyFlags: { gym1_cleared: true } })),
    ).toBe(true);
  });

  it("badgeCountMin条件を評価する", () => {
    const condition = { badgeCountMin: 4 };
    expect(checkDialogueCondition(condition, defaultContext({ badgeCount: 3 }))).toBe(false);
    expect(checkDialogueCondition(condition, defaultContext({ badgeCount: 4 }))).toBe(true);
    expect(checkDialogueCondition(condition, defaultContext({ badgeCount: 8 }))).toBe(true);
  });

  it("badgeCountMax条件を評価する", () => {
    const condition = { badgeCountMax: 3 };
    expect(checkDialogueCondition(condition, defaultContext({ badgeCount: 3 }))).toBe(true);
    expect(checkDialogueCondition(condition, defaultContext({ badgeCount: 4 }))).toBe(false);
  });

  it("partyHas条件を評価する", () => {
    const condition = { partyHas: "omoide" };
    expect(checkDialogueCondition(condition, defaultContext({ partySpeciesIds: [] }))).toBe(false);
    expect(
      checkDialogueCondition(condition, defaultContext({ partySpeciesIds: ["himori", "omoide"] })),
    ).toBe(true);
  });

  it("partySizeMin条件を評価する", () => {
    const condition = { partySizeMin: 4 };
    expect(checkDialogueCondition(condition, defaultContext({ partySize: 3 }))).toBe(false);
    expect(checkDialogueCondition(condition, defaultContext({ partySize: 4 }))).toBe(true);
    expect(checkDialogueCondition(condition, defaultContext({ partySize: 6 }))).toBe(true);
  });

  it("複数条件をANDで評価する", () => {
    const condition = { badgeCountMin: 4, partyHas: "omoide" };
    // バッジだけ足りている
    expect(
      checkDialogueCondition(condition, defaultContext({ badgeCount: 4, partySpeciesIds: [] })),
    ).toBe(false);
    // パーティだけ満たす
    expect(
      checkDialogueCondition(
        condition,
        defaultContext({ badgeCount: 2, partySpeciesIds: ["omoide"] }),
      ),
    ).toBe(false);
    // 両方満たす
    expect(
      checkDialogueCondition(
        condition,
        defaultContext({ badgeCount: 4, partySpeciesIds: ["omoide"] }),
      ),
    ).toBe(true);
  });

  it("フラグとバッジの複合条件", () => {
    const condition = { flag: "champion_cleared" as const, badgeCountMin: 8 };
    expect(
      checkDialogueCondition(
        condition,
        defaultContext({ storyFlags: { champion_cleared: true }, badgeCount: 8 }),
      ),
    ).toBe(true);
    expect(
      checkDialogueCondition(condition, defaultContext({ storyFlags: {}, badgeCount: 8 })),
    ).toBe(false);
  });
});

describe("resolveDialogue", () => {
  const testSet: NpcDialogueSet = {
    npcId: "test-npc",
    mapId: "test-map",
    default: ["デフォルトメッセージ"],
    conditions: [
      {
        condition: { badgeCountMin: 8 },
        text: ["全バッジ持ちへのメッセージ"],
      },
      {
        condition: { badgeCountMin: 4 },
        text: ["バッジ4個以上へのメッセージ"],
      },
      {
        condition: { flag: "starter_selected" },
        text: ["旅立ち後のメッセージ"],
      },
    ],
  };

  it("条件を満たさない場合はdefaultを返す", () => {
    const result = resolveDialogue(testSet, defaultContext());
    expect(result).toEqual(["デフォルトメッセージ"]);
  });

  it("最初にマッチした条件のテキストを返す", () => {
    const result = resolveDialogue(testSet, defaultContext({ badgeCount: 8 }));
    expect(result).toEqual(["全バッジ持ちへのメッセージ"]);
  });

  it("バッジ4個で2番目の条件にマッチ", () => {
    const result = resolveDialogue(testSet, defaultContext({ badgeCount: 5 }));
    expect(result).toEqual(["バッジ4個以上へのメッセージ"]);
  });

  it("フラグ条件にマッチ", () => {
    const result = resolveDialogue(
      testSet,
      defaultContext({ storyFlags: { starter_selected: true } }),
    );
    expect(result).toEqual(["旅立ち後のメッセージ"]);
  });

  it("上位の条件が優先される（バッジ8個はバッジ4個より先にマッチ）", () => {
    const result = resolveDialogue(testSet, defaultContext({ badgeCount: 8 }));
    expect(result).toEqual(["全バッジ持ちへのメッセージ"]);
    // 4個の場合は2番目にマッチ
    const result2 = resolveDialogue(testSet, defaultContext({ badgeCount: 4 }));
    expect(result2).toEqual(["バッジ4個以上へのメッセージ"]);
  });
});

describe("resolveNpcDialogueById", () => {
  const sets: NpcDialogueSet[] = [
    {
      npcId: "npc-a",
      mapId: "map-1",
      default: ["マップ1のNPC Aです"],
      conditions: [],
    },
    {
      npcId: "npc-a",
      mapId: "map-2",
      default: ["マップ2のNPC Aです"],
      conditions: [],
    },
  ];

  it("NPC IDとマップIDで会話を取得できる", () => {
    const result = resolveNpcDialogueById("npc-a", "map-1", sets, defaultContext());
    expect(result).toEqual(["マップ1のNPC Aです"]);
  });

  it("同じNPC IDでもマップIDが異なると別の会話", () => {
    const result = resolveNpcDialogueById("npc-a", "map-2", sets, defaultContext());
    expect(result).toEqual(["マップ2のNPC Aです"]);
  });

  it("存在しないNPCにはnullを返す", () => {
    const result = resolveNpcDialogueById("nonexistent", "map-1", sets, defaultContext());
    expect(result).toBeNull();
  });

  it("存在しないマップにはnullを返す", () => {
    const result = resolveNpcDialogueById("npc-a", "unknown-map", sets, defaultContext());
    expect(result).toBeNull();
  });
});

describe("NPC_DIALOGUE_SETS データ整合性", () => {
  it("20セット以上のNPC会話データがある", () => {
    expect(getDialogueSetCount()).toBeGreaterThanOrEqual(20);
  });

  it("50パターン以上の条件分岐がある", () => {
    expect(getTotalConditionCount()).toBeGreaterThanOrEqual(50);
  });

  it("全てのセットにdefaultテキストがある", () => {
    for (const set of NPC_DIALOGUE_SETS) {
      expect(set.default.length, `${set.npcId}@${set.mapId}のdefaultが空`).toBeGreaterThan(0);
    }
  });

  it("全てのセットにnpcIdとmapIdがある", () => {
    for (const set of NPC_DIALOGUE_SETS) {
      expect(set.npcId.length).toBeGreaterThan(0);
      expect(set.mapId.length).toBeGreaterThan(0);
    }
  });

  it("全ての条件分岐テキストが非空", () => {
    for (const set of NPC_DIALOGUE_SETS) {
      for (const entry of set.conditions) {
        expect(entry.text.length, `${set.npcId}@${set.mapId}の条件テキストが空`).toBeGreaterThan(0);
      }
    }
  });

  it("パーティ構成条件の会話がある", () => {
    const hasPartyHas = NPC_DIALOGUE_SETS.some((set) =>
      set.conditions.some((c) => c.condition.partyHas !== undefined),
    );
    expect(hasPartyHas).toBe(true);
  });

  it("バッジ数条件の会話がある", () => {
    const hasBadgeCount = NPC_DIALOGUE_SETS.some((set) =>
      set.conditions.some((c) => c.condition.badgeCountMin !== undefined),
    );
    expect(hasBadgeCount).toBe(true);
  });

  it("パーティサイズ条件の会話がある", () => {
    const hasPartySize = NPC_DIALOGUE_SETS.some((set) =>
      set.conditions.some((c) => c.condition.partySizeMin !== undefined),
    );
    expect(hasPartySize).toBe(true);
  });

  it("ワスレ町のNPC会話でバッジ数に応じた変化がある", () => {
    const professorSet = NPC_DIALOGUE_SETS.find(
      (s) => s.npcId === "npc-professor" && s.mapId === "wasuremachi",
    );
    expect(professorSet).toBeDefined();

    // バッジ0
    const text0 = resolveDialogue(professorSet!, defaultContext());
    // バッジ1
    const text1 = resolveDialogue(professorSet!, defaultContext({ badgeCount: 1 }));
    // バッジ4
    const text4 = resolveDialogue(professorSet!, defaultContext({ badgeCount: 4 }));
    // バッジ8
    const text8 = resolveDialogue(professorSet!, defaultContext({ badgeCount: 8 }));

    // 全て異なるテキスト
    expect(text0).not.toEqual(text1);
    expect(text1).not.toEqual(text4);
    expect(text4).not.toEqual(text8);
  });

  it("伝説モンスター所持で特別会話が出る", () => {
    const legendSet = NPC_DIALOGUE_SETS.find(
      (s) => s.npcId === "npc-legend-scholar" && s.mapId === "wasuremachi",
    );
    expect(legendSet).toBeDefined();

    const withOmoide = resolveDialogue(legendSet!, defaultContext({ partySpeciesIds: ["omoide"] }));
    expect(withOmoide.some((t) => t.includes("オモイデ"))).toBe(true);

    const withWasurenu = resolveDialogue(
      legendSet!,
      defaultContext({ partySpeciesIds: ["wasurenu"] }),
    );
    expect(withWasurenu.some((t) => t.includes("ワスレヌ"))).toBe(true);
  });
});
