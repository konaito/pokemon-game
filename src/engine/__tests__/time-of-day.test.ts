import { describe, it, expect } from "vitest";
import {
  getTimeOfDay,
  getTimeFilter,
  getTimeOverlayColor,
  getTimeEncounterMultiplier,
  isAvailableAtTime,
  isDayTime,
  isNightTime,
  getTimeChangeMessage,
  TIME_NAMES,
} from "../time-of-day";

describe("getTimeOfDay", () => {
  it("6-9時は朝", () => {
    expect(getTimeOfDay(6)).toBe("morning");
    expect(getTimeOfDay(9)).toBe("morning");
  });

  it("10-16時は昼", () => {
    expect(getTimeOfDay(10)).toBe("day");
    expect(getTimeOfDay(12)).toBe("day");
    expect(getTimeOfDay(16)).toBe("day");
  });

  it("17-19時は夕方", () => {
    expect(getTimeOfDay(17)).toBe("evening");
    expect(getTimeOfDay(19)).toBe("evening");
  });

  it("20-5時は夜", () => {
    expect(getTimeOfDay(20)).toBe("night");
    expect(getTimeOfDay(0)).toBe("night");
    expect(getTimeOfDay(5)).toBe("night");
  });

  it("負の値も正しく処理", () => {
    expect(getTimeOfDay(-1)).toBe("night"); // 23時相当
  });
});

describe("TIME_NAMES", () => {
  it("全時間帯に名前がある", () => {
    expect(TIME_NAMES.morning).toBe("朝");
    expect(TIME_NAMES.day).toBe("昼");
    expect(TIME_NAMES.evening).toBe("夕方");
    expect(TIME_NAMES.night).toBe("夜");
  });
});

describe("getTimeFilter", () => {
  it("昼はフィルターなし", () => {
    expect(getTimeFilter("day")).toBe("none");
  });

  it("他の時間帯はフィルターあり", () => {
    expect(getTimeFilter("morning").length).toBeGreaterThan(0);
    expect(getTimeFilter("evening").length).toBeGreaterThan(0);
    expect(getTimeFilter("night").length).toBeGreaterThan(0);
  });
});

describe("getTimeOverlayColor", () => {
  it("昼は透明", () => {
    expect(getTimeOverlayColor("day")).toContain("0, 0, 0, 0");
  });

  it("夜は青みがかったオーバーレイ", () => {
    expect(getTimeOverlayColor("night")).toContain("rgba");
  });
});

describe("getTimeEncounterMultiplier", () => {
  it("朝は0.8倍", () => {
    expect(getTimeEncounterMultiplier("morning")).toBe(0.8);
  });

  it("昼は等倍", () => {
    expect(getTimeEncounterMultiplier("day")).toBe(1.0);
  });

  it("夕方は1.1倍", () => {
    expect(getTimeEncounterMultiplier("evening")).toBe(1.1);
  });

  it("夜は1.3倍", () => {
    expect(getTimeEncounterMultiplier("night")).toBe(1.3);
  });
});

describe("isAvailableAtTime", () => {
  it("制限なし: 常に利用可能", () => {
    expect(isAvailableAtTime(undefined, "day")).toBe(true);
  });

  it("単一時間帯指定: 一致すればtrue", () => {
    expect(isAvailableAtTime("night", "night")).toBe(true);
    expect(isAvailableAtTime("night", "day")).toBe(false);
  });

  it("複数時間帯指定: いずれかに一致すればtrue", () => {
    expect(isAvailableAtTime(["morning", "day"], "day")).toBe(true);
    expect(isAvailableAtTime(["morning", "day"], "night")).toBe(false);
  });
});

describe("isDayTime / isNightTime", () => {
  it("朝と昼は昼間", () => {
    expect(isDayTime("morning")).toBe(true);
    expect(isDayTime("day")).toBe(true);
    expect(isDayTime("evening")).toBe(false);
    expect(isDayTime("night")).toBe(false);
  });

  it("夕方と夜は夜間", () => {
    expect(isNightTime("evening")).toBe(true);
    expect(isNightTime("night")).toBe(true);
    expect(isNightTime("morning")).toBe(false);
    expect(isNightTime("day")).toBe(false);
  });
});

describe("getTimeChangeMessage", () => {
  it("各時間帯のメッセージを返す", () => {
    expect(getTimeChangeMessage("morning")).toContain("朝");
    expect(getTimeChangeMessage("day")).toContain("日");
    expect(getTimeChangeMessage("evening")).toContain("夕方");
    expect(getTimeChangeMessage("night")).toContain("夜");
  });
});
