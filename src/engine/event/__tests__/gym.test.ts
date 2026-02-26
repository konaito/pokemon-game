import { describe, it, expect } from "vitest";
import {
  createGymBattleScript,
  getGymFlagName,
  getGymEntryFlagName,
  canChallengeGym,
  getEarnedBadges,
  canChallengeEliteFour,
  getRequiredBadgeCount,
} from "../gym";
import type { GymDefinition } from "../gym";
import { executeScript } from "../event-script";
import type { StoryFlags } from "@/engine/state/story-flags";

const testGym: GymDefinition = {
  id: "gym-1",
  gymNumber: 1,
  name: "いわジム",
  leaderName: "タケシ",
  type: "rock",
  leaderParty: [
    { speciesId: "geodude", level: 12 },
    { speciesId: "onix", level: 14 },
  ],
  badgeName: "グレーバッジ",
  mapId: "gym-1-map",
  leaderIntroDialogue: ["ようこそ、いわジムへ！", "お前の実力を見せてもらおう！"],
  leaderDefeatDialogue: ["やるな…お前の実力を認めよう。", "このバッジを受け取ってくれ。"],
  rewardItemId: "tm-rock-throw",
};

const testGym3: GymDefinition = {
  id: "gym-3",
  gymNumber: 3,
  name: "でんきジム",
  leaderName: "マチス",
  type: "electric",
  leaderParty: [{ speciesId: "voltorb", level: 21 }],
  badgeName: "オレンジバッジ",
  mapId: "gym-3-map",
  leaderIntroDialogue: ["覚悟はいいか！"],
  leaderDefeatDialogue: ["ビリビリだぜ！"],
};

describe("getGymFlagName / getGymEntryFlagName", () => {
  it("ジムクリアフラグ名を生成する", () => {
    expect(getGymFlagName(1)).toBe("gym1_cleared");
    expect(getGymFlagName(8)).toBe("gym8_cleared");
  });

  it("ジム入場フラグ名を生成する", () => {
    expect(getGymEntryFlagName(1)).toBe("gym1_entered");
    expect(getGymEntryFlagName(5)).toBe("gym5_entered");
  });
});

describe("getRequiredBadgeCount", () => {
  it("ジム1は前提バッジ0", () => {
    expect(getRequiredBadgeCount(1)).toBe(0);
  });

  it("ジム3は前提バッジ2", () => {
    expect(getRequiredBadgeCount(3)).toBe(2);
  });

  it("ジム8は前提バッジ7", () => {
    expect(getRequiredBadgeCount(8)).toBe(7);
  });
});

describe("canChallengeGym", () => {
  it("ジム1は常に挑戦可能", () => {
    expect(canChallengeGym(1, {})).toBe(true);
  });

  it("ジム2はジム1クリアが必要", () => {
    expect(canChallengeGym(2, {})).toBe(false);
    expect(canChallengeGym(2, { gym1_cleared: true })).toBe(true);
  });

  it("ジム3はジム1,2両方のクリアが必要", () => {
    expect(canChallengeGym(3, { gym1_cleared: true })).toBe(false);
    expect(canChallengeGym(3, { gym1_cleared: true, gym2_cleared: true })).toBe(true);
  });

  it("ジム8はジム1-7の全クリアが必要", () => {
    const flags: StoryFlags = {};
    for (let i = 1; i <= 7; i++) {
      flags[`gym${i}_cleared`] = true;
    }
    expect(canChallengeGym(8, flags)).toBe(true);

    // 1つ欠けるとダメ
    delete flags.gym4_cleared;
    expect(canChallengeGym(8, flags)).toBe(false);
  });
});

describe("getEarnedBadges", () => {
  it("バッジなしの場合は空配列", () => {
    expect(getEarnedBadges({})).toEqual([]);
  });

  it("クリア済みジムのバッジ番号を返す", () => {
    const flags: StoryFlags = {
      gym1_cleared: true,
      gym3_cleared: true,
      gym5_cleared: true,
    };
    expect(getEarnedBadges(flags)).toEqual([1, 3, 5]);
  });

  it("全8バッジ取得", () => {
    const flags: StoryFlags = {};
    for (let i = 1; i <= 8; i++) {
      flags[`gym${i}_cleared`] = true;
    }
    expect(getEarnedBadges(flags)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("canChallengeEliteFour", () => {
  it("バッジ不足では挑戦不可", () => {
    const flags: StoryFlags = {
      gym1_cleared: true,
      gym2_cleared: true,
    };
    expect(canChallengeEliteFour(flags)).toBe(false);
  });

  it("全8バッジで挑戦可能", () => {
    const flags: StoryFlags = {};
    for (let i = 1; i <= 8; i++) {
      flags[`gym${i}_cleared`] = true;
    }
    expect(canChallengeEliteFour(flags)).toBe(true);
  });

  it("カスタムジム数対応", () => {
    const flags: StoryFlags = {
      gym1_cleared: true,
      gym2_cleared: true,
      gym3_cleared: true,
    };
    expect(canChallengeEliteFour(flags, 3)).toBe(true);
    expect(canChallengeEliteFour(flags, 4)).toBe(false);
  });
});

describe("createGymBattleScript", () => {
  it("未クリア時のスクリプトにバトルとバッジ獲得が含まれる", () => {
    const script = createGymBattleScript(testGym);
    expect(script.id).toBe("gym_battle_1");

    const outputs = executeScript(script, {})!;
    expect(outputs).not.toBeNull();

    // リーダー会話
    expect(outputs[0]).toEqual({
      type: "dialogue",
      speaker: "タケシ",
      lines: ["ようこそ、いわジムへ！", "お前の実力を見せてもらおう！"],
    });

    // バトル
    expect(outputs[1]).toEqual({
      type: "battle",
      trainerName: "タケシ",
      party: [
        { speciesId: "geodude", level: 12 },
        { speciesId: "onix", level: 14 },
      ],
    });

    // 勝利会話
    expect(outputs[2]).toEqual({
      type: "dialogue",
      speaker: "タケシ",
      lines: ["やるな…お前の実力を認めよう。", "このバッジを受け取ってくれ。"],
    });

    // バッジ獲得メッセージ
    expect(outputs[3]).toEqual({
      type: "dialogue",
      speaker: undefined,
      lines: ["グレーバッジを手に入れた！"],
    });

    // 報酬アイテム
    expect(outputs[4]).toEqual({
      type: "give_item",
      itemId: "tm-rock-throw",
      quantity: 1,
    });

    // クリアフラグ
    expect(outputs[5]).toEqual({
      type: "set_flag",
      flag: "gym1_cleared",
      value: true,
    });
  });

  it("クリア済みの場合は短い会話のみ", () => {
    const script = createGymBattleScript(testGym);
    const outputs = executeScript(script, { gym1_cleared: true })!;

    expect(outputs).toHaveLength(1);
    expect(outputs[0]).toEqual({
      type: "dialogue",
      speaker: "タケシ",
      lines: ["また来たのか。お前の実力は認めている。先に進むがいい。"],
    });
  });

  it("報酬アイテムなしのジムスクリプト", () => {
    const script = createGymBattleScript(testGym3);
    const outputs = executeScript(script, {})!;

    // battle(1) + dialogue前(1) + dialogue後(1) + badge(1) + flag(1) = 5
    expect(outputs).toHaveLength(5);

    // give_item が含まれない
    const itemOutputs = outputs.filter((o) => o.type === "give_item");
    expect(itemOutputs).toHaveLength(0);

    // フラグは gym3_cleared
    const flagOutput = outputs.find((o) => o.type === "set_flag");
    expect(flagOutput).toEqual({
      type: "set_flag",
      flag: "gym3_cleared",
      value: true,
    });
  });
});
