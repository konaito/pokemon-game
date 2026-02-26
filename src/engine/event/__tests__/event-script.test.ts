import { describe, it, expect } from "vitest";
import { canTriggerScript, resolveCommands, executeScript } from "../event-script";
import type { EventScript, EventCommand } from "../event-script";

describe("canTriggerScript", () => {
  it("triggerがないスクリプトは常に実行可能", () => {
    const script: EventScript = { id: "test", commands: [] };
    expect(canTriggerScript(script, {})).toBe(true);
  });

  it("trigger条件を満たすスクリプトは実行可能", () => {
    const script: EventScript = { id: "test", trigger: "intro_done", commands: [] };
    expect(canTriggerScript(script, { intro_done: true })).toBe(true);
  });

  it("trigger条件を満たさないスクリプトは実行不可", () => {
    const script: EventScript = { id: "test", trigger: "intro_done", commands: [] };
    expect(canTriggerScript(script, {})).toBe(false);
  });

  it("AND条件のtrigger", () => {
    const script: EventScript = {
      id: "test",
      trigger: ["intro_done", "gym1_cleared"],
      commands: [],
    };
    expect(canTriggerScript(script, { intro_done: true })).toBe(false);
    expect(canTriggerScript(script, { intro_done: true, gym1_cleared: true })).toBe(true);
  });
});

describe("resolveCommands", () => {
  it("dialogueコマンドを解決する", () => {
    const commands: EventCommand[] = [
      { type: "dialogue", speaker: "博士", lines: ["ようこそ！", "モンスターの世界へ！"] },
    ];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([
      { type: "dialogue", speaker: "博士", lines: ["ようこそ！", "モンスターの世界へ！"] },
    ]);
  });

  it("speakerなしのdialogue", () => {
    const commands: EventCommand[] = [{ type: "dialogue", lines: ["ナレーション"] }];
    const outputs = resolveCommands(commands, {});
    expect(outputs[0]).toEqual({
      type: "dialogue",
      speaker: undefined,
      lines: ["ナレーション"],
    });
  });

  it("set_flagコマンドを解決する", () => {
    const commands: EventCommand[] = [{ type: "set_flag", flag: "intro_done", value: true }];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([{ type: "set_flag", flag: "intro_done", value: true }]);
  });

  it("healコマンドを解決する", () => {
    const outputs = resolveCommands([{ type: "heal" }], {});
    expect(outputs).toEqual([{ type: "heal" }]);
  });

  it("give_itemコマンドを解決する", () => {
    const commands: EventCommand[] = [{ type: "give_item", itemId: "potion", quantity: 5 }];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([{ type: "give_item", itemId: "potion", quantity: 5 }]);
  });

  it("battleコマンドを解決する", () => {
    const commands: EventCommand[] = [
      {
        type: "battle",
        trainerName: "ジムリーダー",
        party: [{ speciesId: "fire-starter", level: 15 }],
      },
    ];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([
      {
        type: "battle",
        trainerName: "ジムリーダー",
        party: [{ speciesId: "fire-starter", level: 15 }],
      },
    ]);
  });

  it("move_playerコマンドを解決する", () => {
    const commands: EventCommand[] = [{ type: "move_player", mapId: "town-2", x: 5, y: 3 }];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([{ type: "move_player", mapId: "town-2", x: 5, y: 3 }]);
  });

  it("waitコマンドを解決する", () => {
    const outputs = resolveCommands([{ type: "wait", ms: 1000 }], {});
    expect(outputs).toEqual([{ type: "wait", ms: 1000 }]);
  });

  it("複数コマンドを順番に解決する", () => {
    const commands: EventCommand[] = [
      { type: "dialogue", speaker: "博士", lines: ["まずはこれを受け取りなさい。"] },
      { type: "give_item", itemId: "potion", quantity: 3 },
      { type: "set_flag", flag: "received_starter_items", value: true },
    ];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toHaveLength(3);
    expect(outputs[0].type).toBe("dialogue");
    expect(outputs[1].type).toBe("give_item");
    expect(outputs[2].type).toBe("set_flag");
  });
});

describe("branch コマンド", () => {
  it("条件を満たす場合thenを実行", () => {
    const commands: EventCommand[] = [
      {
        type: "branch",
        condition: "gym1_cleared",
        then: [{ type: "dialogue", lines: ["ジムバッジを持っているね。"] }],
        else: [{ type: "dialogue", lines: ["まだジムバッジがないようだ。"] }],
      },
    ];
    const outputs = resolveCommands(commands, { gym1_cleared: true });
    expect(outputs).toEqual([
      { type: "dialogue", speaker: undefined, lines: ["ジムバッジを持っているね。"] },
    ]);
  });

  it("条件を満たさない場合elseを実行", () => {
    const commands: EventCommand[] = [
      {
        type: "branch",
        condition: "gym1_cleared",
        then: [{ type: "dialogue", lines: ["OK"] }],
        else: [{ type: "dialogue", lines: ["まだだ。"] }],
      },
    ];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([{ type: "dialogue", speaker: undefined, lines: ["まだだ。"] }]);
  });

  it("elseが未定義で条件を満たさない場合、出力なし", () => {
    const commands: EventCommand[] = [
      {
        type: "branch",
        condition: "gym1_cleared",
        then: [{ type: "dialogue", lines: ["OK"] }],
      },
    ];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([]);
  });

  it("ネストされた分岐", () => {
    const commands: EventCommand[] = [
      {
        type: "branch",
        condition: "intro_done",
        then: [
          {
            type: "branch",
            condition: "gym1_cleared",
            then: [{ type: "dialogue", lines: ["完全クリア！"] }],
            else: [{ type: "dialogue", lines: ["ジムに挑戦しよう。"] }],
          },
        ],
        else: [{ type: "dialogue", lines: ["まずは冒険を始めよう。"] }],
      },
    ];

    expect(resolveCommands(commands, {})).toEqual([
      { type: "dialogue", speaker: undefined, lines: ["まずは冒険を始めよう。"] },
    ]);

    expect(resolveCommands(commands, { intro_done: true })).toEqual([
      { type: "dialogue", speaker: undefined, lines: ["ジムに挑戦しよう。"] },
    ]);

    expect(resolveCommands(commands, { intro_done: true, gym1_cleared: true })).toEqual([
      { type: "dialogue", speaker: undefined, lines: ["完全クリア！"] },
    ]);
  });

  it("スクリプト実行中にset_flagで変更されたフラグが後続branchに反映される", () => {
    const commands: EventCommand[] = [
      { type: "set_flag", flag: "talked_to_professor", value: true },
      {
        type: "branch",
        condition: "talked_to_professor",
        then: [{ type: "dialogue", lines: ["フラグが反映された！"] }],
        else: [{ type: "dialogue", lines: ["反映されなかった…"] }],
      },
    ];
    const outputs = resolveCommands(commands, {});
    expect(outputs).toEqual([
      { type: "set_flag", flag: "talked_to_professor", value: true },
      { type: "dialogue", speaker: undefined, lines: ["フラグが反映された！"] },
    ]);
  });
});

describe("executeScript", () => {
  it("trigger条件を満たすスクリプトは実行される", () => {
    const script: EventScript = {
      id: "intro",
      trigger: "game_started",
      commands: [
        { type: "dialogue", speaker: "博士", lines: ["ようこそ！"] },
        { type: "set_flag", flag: "intro_done", value: true },
      ],
    };

    const result = executeScript(script, { game_started: true });
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
  });

  it("trigger条件を満たさないスクリプトはnullを返す", () => {
    const script: EventScript = {
      id: "intro",
      trigger: "game_started",
      commands: [{ type: "dialogue", lines: ["test"] }],
    };
    expect(executeScript(script, {})).toBeNull();
  });

  it("triggerなしのスクリプトは常に実行される", () => {
    const script: EventScript = {
      id: "test",
      commands: [{ type: "dialogue", lines: ["hello"] }],
    };
    expect(executeScript(script, {})).not.toBeNull();
  });

  it("複合イベントスクリプトの統合テスト", () => {
    const script: EventScript = {
      id: "professor_event",
      commands: [
        { type: "dialogue", speaker: "博士", lines: ["やあ！来てくれたか。"] },
        {
          type: "branch",
          condition: "has_starter",
          then: [{ type: "dialogue", speaker: "博士", lines: ["モンスターの調子はどうだ？"] }],
          else: [
            { type: "dialogue", speaker: "博士", lines: ["君にモンスターをあげよう！"] },
            { type: "give_item", itemId: "potion", quantity: 5 },
            { type: "set_flag", flag: "has_starter", value: true },
          ],
        },
        { type: "dialogue", speaker: "博士", lines: ["頑張れよ！"] },
      ],
    };

    // 初回実行（スターターなし）
    const firstRun = executeScript(script, {})!;
    expect(firstRun).toHaveLength(5);
    expect(firstRun[0]).toEqual({
      type: "dialogue",
      speaker: "博士",
      lines: ["やあ！来てくれたか。"],
    });
    expect(firstRun[1]).toEqual({
      type: "dialogue",
      speaker: "博士",
      lines: ["君にモンスターをあげよう！"],
    });
    expect(firstRun[2]).toEqual({ type: "give_item", itemId: "potion", quantity: 5 });
    expect(firstRun[3]).toEqual({ type: "set_flag", flag: "has_starter", value: true });
    expect(firstRun[4]).toEqual({
      type: "dialogue",
      speaker: "博士",
      lines: ["頑張れよ！"],
    });

    // 2回目実行（スターターあり）
    const secondRun = executeScript(script, { has_starter: true })!;
    expect(secondRun).toHaveLength(3);
    expect(secondRun[1]).toEqual({
      type: "dialogue",
      speaker: "博士",
      lines: ["モンスターの調子はどうだ？"],
    });
  });
});
