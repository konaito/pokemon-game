import { describe, it, expect } from "vitest";
import { checkFlagRequirement, setFlags, hasFlag, hasAllFlags, hasAnyFlag } from "../story-flags";
import type { StoryFlags } from "../story-flags";

describe("story-flags", () => {
  describe("hasFlag", () => {
    it("trueのフラグを検出する", () => {
      const flags: StoryFlags = { intro_done: true };
      expect(hasFlag(flags, "intro_done")).toBe(true);
    });

    it("未設定のフラグはfalse", () => {
      const flags: StoryFlags = {};
      expect(hasFlag(flags, "intro_done")).toBe(false);
    });

    it("falseのフラグはfalse", () => {
      const flags: StoryFlags = { intro_done: false };
      expect(hasFlag(flags, "intro_done")).toBe(false);
    });
  });

  describe("hasAllFlags", () => {
    it("すべてのフラグがtrueの場合true", () => {
      const flags: StoryFlags = { gym1_cleared: true, gym2_cleared: true };
      expect(hasAllFlags(flags, ["gym1_cleared", "gym2_cleared"])).toBe(true);
    });

    it("一つでもfalseならfalse", () => {
      const flags: StoryFlags = { gym1_cleared: true, gym2_cleared: false };
      expect(hasAllFlags(flags, ["gym1_cleared", "gym2_cleared"])).toBe(false);
    });

    it("空配列はtrue", () => {
      expect(hasAllFlags({}, [])).toBe(true);
    });
  });

  describe("hasAnyFlag", () => {
    it("いずれかのフラグがtrueならtrue", () => {
      const flags: StoryFlags = { gym1_cleared: false, gym2_cleared: true };
      expect(hasAnyFlag(flags, ["gym1_cleared", "gym2_cleared"])).toBe(true);
    });

    it("すべてfalseならfalse", () => {
      const flags: StoryFlags = { gym1_cleared: false };
      expect(hasAnyFlag(flags, ["gym1_cleared", "gym2_cleared"])).toBe(false);
    });

    it("空配列はfalse", () => {
      expect(hasAnyFlag({}, [])).toBe(false);
    });
  });

  describe("checkFlagRequirement", () => {
    it("文字列条件: フラグがtrueなら満たす", () => {
      const flags: StoryFlags = { intro_done: true };
      expect(checkFlagRequirement(flags, "intro_done")).toBe(true);
    });

    it("文字列条件: フラグがfalse/未設定なら満たさない", () => {
      expect(checkFlagRequirement({}, "intro_done")).toBe(false);
      expect(checkFlagRequirement({ intro_done: false }, "intro_done")).toBe(false);
    });

    it("オブジェクト条件: value=trueの判定", () => {
      const flags: StoryFlags = { gym1_cleared: true };
      expect(checkFlagRequirement(flags, { flag: "gym1_cleared", value: true })).toBe(true);
    });

    it("オブジェクト条件: value=falseの判定（フラグが未設定の場合もfalseとして扱う）", () => {
      expect(checkFlagRequirement({}, { flag: "gym1_cleared", value: false })).toBe(true);
      expect(
        checkFlagRequirement({ gym1_cleared: false }, { flag: "gym1_cleared", value: false }),
      ).toBe(true);
      expect(
        checkFlagRequirement({ gym1_cleared: true }, { flag: "gym1_cleared", value: false }),
      ).toBe(false);
    });

    it("配列条件（AND）: すべて満たす場合true", () => {
      const flags: StoryFlags = { intro_done: true, gym1_cleared: true };
      expect(checkFlagRequirement(flags, ["intro_done", "gym1_cleared"])).toBe(true);
    });

    it("配列条件（AND）: 一つでも満たさなければfalse", () => {
      const flags: StoryFlags = { intro_done: true };
      expect(checkFlagRequirement(flags, ["intro_done", "gym1_cleared"])).toBe(false);
    });

    it("配列条件に混在（文字列+オブジェクト）", () => {
      const flags: StoryFlags = { intro_done: true, evil_team_defeated: false };
      expect(
        checkFlagRequirement(flags, ["intro_done", { flag: "evil_team_defeated", value: false }]),
      ).toBe(true);
    });
  });

  describe("setFlags", () => {
    it("新しいフラグを追加する", () => {
      const flags: StoryFlags = { intro_done: true };
      const result = setFlags(flags, { gym1_cleared: true });
      expect(result).toEqual({ intro_done: true, gym1_cleared: true });
    });

    it("既存のフラグを上書きする", () => {
      const flags: StoryFlags = { intro_done: false };
      const result = setFlags(flags, { intro_done: true });
      expect(result).toEqual({ intro_done: true });
    });

    it("元のオブジェクトを変更しない（イミュータブル）", () => {
      const flags: StoryFlags = { intro_done: true };
      const result = setFlags(flags, { gym1_cleared: true });
      expect(flags).toEqual({ intro_done: true });
      expect(result).not.toBe(flags);
    });

    it("複数フラグを一度に設定する", () => {
      const result = setFlags({}, { intro_done: true, gym1_cleared: true, gym2_cleared: false });
      expect(result).toEqual({ intro_done: true, gym1_cleared: true, gym2_cleared: false });
    });
  });
});
