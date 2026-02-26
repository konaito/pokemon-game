import { describe, it, expect } from "vitest";
import { interactWithNpc, resolveNpcDialogue, isNpcVisible, getVisibleNpcs } from "../npc";
import type { NpcDefinition } from "../map-data";

const npcs: NpcDefinition[] = [
  { id: "villager", name: "村人", x: 5, y: 5, dialogue: ["いい天気だね！"], isTrainer: false },
  {
    id: "trainer1",
    name: "ミニスカート",
    x: 8,
    y: 3,
    dialogue: ["勝負よ！", "悔しい〜！"],
    isTrainer: true,
  },
];

describe("NPC会話システム", () => {
  it("村人に話しかけると会話が返る", () => {
    const result = interactWithNpc("villager", npcs);
    expect(result).not.toBeNull();
    expect(result!.dialogue).toEqual(["いい天気だね！"]);
    expect(result!.triggerBattle).toBe(false);
  });

  it("未撃破トレーナーに話しかけるとバトルが発生する", () => {
    const result = interactWithNpc("trainer1", npcs);
    expect(result).not.toBeNull();
    expect(result!.triggerBattle).toBe(true);
  });

  it("撃破済みトレーナーにはバトルが発生しない", () => {
    const defeated = new Set(["trainer1"]);
    const result = interactWithNpc("trainer1", npcs, defeated);
    expect(result).not.toBeNull();
    expect(result!.triggerBattle).toBe(false);
  });

  it("存在しないNPCにはnullが返る", () => {
    const result = interactWithNpc("unknown", npcs);
    expect(result).toBeNull();
  });
});

describe("条件付きダイアログ", () => {
  const npcWithConditional: NpcDefinition = {
    id: "elder",
    name: "長老",
    x: 3,
    y: 3,
    dialogue: ["ここは始まりの町じゃ。"],
    conditionalDialogues: [
      {
        condition: "gym1_cleared",
        dialogue: ["ジムバッジを手に入れたのか！大したものじゃ。"],
      },
      {
        condition: "intro_done",
        dialogue: ["冒険の準備はできたかの？"],
      },
    ],
    isTrainer: false,
  };

  it("条件を満たさない場合はデフォルトダイアログ", () => {
    const dialogue = resolveNpcDialogue(npcWithConditional, {});
    expect(dialogue).toEqual(["ここは始まりの町じゃ。"]);
  });

  it("最初に条件を満たしたダイアログが使用される", () => {
    const flags = { gym1_cleared: true, intro_done: true };
    const dialogue = resolveNpcDialogue(npcWithConditional, flags);
    expect(dialogue).toEqual(["ジムバッジを手に入れたのか！大したものじゃ。"]);
  });

  it("2番目の条件のみ満たす場合はそのダイアログ", () => {
    const flags = { intro_done: true };
    const dialogue = resolveNpcDialogue(npcWithConditional, flags);
    expect(dialogue).toEqual(["冒険の準備はできたかの？"]);
  });

  it("AND条件の条件付きダイアログ", () => {
    const npc: NpcDefinition = {
      id: "guard",
      name: "門番",
      x: 1,
      y: 1,
      dialogue: ["ここから先は通せない。"],
      conditionalDialogues: [
        {
          condition: ["gym1_cleared", "gym2_cleared"],
          dialogue: ["バッジを2つ持っているな。通ってよし。"],
        },
      ],
      isTrainer: false,
    };

    expect(resolveNpcDialogue(npc, { gym1_cleared: true })).toEqual(["ここから先は通せない。"]);
    expect(resolveNpcDialogue(npc, { gym1_cleared: true, gym2_cleared: true })).toEqual([
      "バッジを2つ持っているな。通ってよし。",
    ]);
  });

  it("interactWithNpcでも条件分岐が反映される", () => {
    const result = interactWithNpc("elder", [npcWithConditional], new Set(), { intro_done: true });
    expect(result).not.toBeNull();
    expect(result!.dialogue).toEqual(["冒険の準備はできたかの？"]);
  });
});

describe("NPCイベントトリガー", () => {
  it("onInteractイベントが返される", () => {
    const npc: NpcDefinition = {
      id: "professor",
      name: "博士",
      x: 5,
      y: 5,
      dialogue: ["ようこそ！モンスターの世界へ！"],
      isTrainer: false,
      onInteract: {
        setFlags: { intro_done: true },
      },
    };

    const result = interactWithNpc("professor", [npc]);
    expect(result).not.toBeNull();
    expect(result!.event).toEqual({ setFlags: { intro_done: true } });
  });

  it("onInteractがない場合はeventがnull", () => {
    const result = interactWithNpc("villager", npcs);
    expect(result!.event).toBeNull();
  });
});

describe("NPC出現条件", () => {
  const conditionalNpcs: NpcDefinition[] = [
    {
      id: "always-visible",
      name: "常駐NPC",
      x: 1,
      y: 1,
      dialogue: ["こんにちは"],
      isTrainer: false,
    },
    {
      id: "post-gym",
      name: "ジム後NPC",
      x: 2,
      y: 2,
      dialogue: ["おめでとう！"],
      isTrainer: false,
      appearCondition: "gym1_cleared",
    },
    {
      id: "pre-event",
      name: "イベント前NPC",
      x: 3,
      y: 3,
      dialogue: ["何か起きそうだ…"],
      isTrainer: false,
      appearCondition: { flag: "event_started", value: false },
    },
  ];

  it("appearConditionがないNPCは常に表示", () => {
    expect(isNpcVisible(conditionalNpcs[0], {})).toBe(true);
  });

  it("appearConditionを満たすNPCは表示", () => {
    expect(isNpcVisible(conditionalNpcs[1], { gym1_cleared: true })).toBe(true);
  });

  it("appearConditionを満たさないNPCは非表示", () => {
    expect(isNpcVisible(conditionalNpcs[1], {})).toBe(false);
  });

  it("value=false条件のNPC出現チェック", () => {
    expect(isNpcVisible(conditionalNpcs[2], {})).toBe(true);
    expect(isNpcVisible(conditionalNpcs[2], { event_started: true })).toBe(false);
  });

  it("getVisibleNpcsがフィルタリングされたリストを返す", () => {
    const visible = getVisibleNpcs(conditionalNpcs, {});
    expect(visible.map((n) => n.id)).toEqual(["always-visible", "pre-event"]);
  });

  it("getVisibleNpcsにフラグを渡すと結果が変わる", () => {
    const visible = getVisibleNpcs(conditionalNpcs, { gym1_cleared: true, event_started: true });
    expect(visible.map((n) => n.id)).toEqual(["always-visible", "post-gym"]);
  });

  it("出現条件を満たさないNPCにはinteractWithNpcがnullを返す", () => {
    const result = interactWithNpc("post-gym", conditionalNpcs, new Set(), {});
    expect(result).toBeNull();
  });

  it("出現条件を満たすNPCには通常通りインタラクトできる", () => {
    const result = interactWithNpc("post-gym", conditionalNpcs, new Set(), { gym1_cleared: true });
    expect(result).not.toBeNull();
    expect(result!.dialogue).toEqual(["おめでとう！"]);
  });
});
