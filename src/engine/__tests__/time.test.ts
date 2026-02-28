import { describe, it, expect, afterEach } from "vitest";
import {
  getCurrentTimeOfDay,
  getCurrentHour,
  setTimeOverride,
  getTimeOfDayName,
  getGreeting,
  getTimeOverlayColor,
} from "../time";
import { filterEncountersByTime, rollEncounter } from "../map/encounter";
import type { EncounterEntry } from "../map/map-data";

afterEach(() => {
  setTimeOverride(null);
});

describe("getCurrentTimeOfDay", () => {
  it("朝6時は昼", () => {
    setTimeOverride(6);
    expect(getCurrentTimeOfDay()).toBe("day");
  });

  it("正午12時は昼", () => {
    setTimeOverride(12);
    expect(getCurrentTimeOfDay()).toBe("day");
  });

  it("16時は昼", () => {
    setTimeOverride(16);
    expect(getCurrentTimeOfDay()).toBe("day");
  });

  it("17時は夕方", () => {
    setTimeOverride(17);
    expect(getCurrentTimeOfDay()).toBe("evening");
  });

  it("19時は夕方", () => {
    setTimeOverride(19);
    expect(getCurrentTimeOfDay()).toBe("evening");
  });

  it("20時は夜", () => {
    setTimeOverride(20);
    expect(getCurrentTimeOfDay()).toBe("night");
  });

  it("深夜0時は夜", () => {
    setTimeOverride(0);
    expect(getCurrentTimeOfDay()).toBe("night");
  });

  it("早朝5時は夜", () => {
    setTimeOverride(5);
    expect(getCurrentTimeOfDay()).toBe("night");
  });
});

describe("getCurrentHour", () => {
  it("オーバーライド設定時はその値を返す", () => {
    setTimeOverride(14);
    expect(getCurrentHour()).toBe(14);
  });

  it("オーバーライドなしで実時間を返す", () => {
    setTimeOverride(null);
    const hour = getCurrentHour();
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
  });
});

describe("getTimeOfDayName", () => {
  it("各時間帯の日本語名を返す", () => {
    expect(getTimeOfDayName("day")).toBe("昼");
    expect(getTimeOfDayName("evening")).toBe("夕方");
    expect(getTimeOfDayName("night")).toBe("夜");
  });
});

describe("getGreeting", () => {
  it("昼はこんにちは", () => {
    expect(getGreeting("day")).toBe("こんにちは");
  });

  it("夕方はこんばんは", () => {
    expect(getGreeting("evening")).toBe("こんばんは");
  });

  it("夜はこんばんは", () => {
    expect(getGreeting("night")).toBe("こんばんは");
  });
});

describe("getTimeOverlayColor", () => {
  it("昼はnull（オーバーレイなし）", () => {
    expect(getTimeOverlayColor("day")).toBeNull();
  });

  it("夕方はオレンジ系", () => {
    expect(getTimeOverlayColor("evening")).toContain("rgba(255, 165, 0");
  });

  it("夜は青暗系", () => {
    expect(getTimeOverlayColor("night")).toContain("rgba(0, 0, 50");
  });
});

describe("filterEncountersByTime", () => {
  const entries: EncounterEntry[] = [
    { speciesId: "day-only", minLevel: 5, maxLevel: 10, weight: 30, timeOfDay: ["day"] },
    {
      speciesId: "night-only",
      minLevel: 5,
      maxLevel: 10,
      weight: 30,
      timeOfDay: ["night"],
    },
    {
      speciesId: "evening-night",
      minLevel: 5,
      maxLevel: 10,
      weight: 20,
      timeOfDay: ["evening", "night"],
    },
    { speciesId: "all-time", minLevel: 5, maxLevel: 10, weight: 20 },
  ];

  it("昼に昼限定と全時間帯のモンスターのみ出現", () => {
    const filtered = filterEncountersByTime(entries, "day");
    expect(filtered.map((e) => e.speciesId)).toEqual(["day-only", "all-time"]);
  });

  it("夜に夜限定と夕夜と全時間帯のモンスターが出現", () => {
    const filtered = filterEncountersByTime(entries, "night");
    expect(filtered.map((e) => e.speciesId)).toEqual(["night-only", "evening-night", "all-time"]);
  });

  it("夕方に夕夜と全時間帯のモンスターが出現", () => {
    const filtered = filterEncountersByTime(entries, "evening");
    expect(filtered.map((e) => e.speciesId)).toEqual(["evening-night", "all-time"]);
  });

  it("timeOfDay未設定のエントリはすべての時間帯で出現", () => {
    const allTime: EncounterEntry[] = [
      { speciesId: "always", minLevel: 5, maxLevel: 10, weight: 100 },
    ];
    expect(filterEncountersByTime(allTime, "day")).toHaveLength(1);
    expect(filterEncountersByTime(allTime, "evening")).toHaveLength(1);
    expect(filterEncountersByTime(allTime, "night")).toHaveLength(1);
  });
});

describe("rollEncounterに時間帯フィルタが適用される", () => {
  it("昼にrollEncounterすると夜限定モンスターは出ない", () => {
    const entries: EncounterEntry[] = [
      { speciesId: "night-ghost", minLevel: 10, maxLevel: 15, weight: 100, timeOfDay: ["night"] },
    ];
    const result = rollEncounter(entries, Math.random, "day");
    expect(result).toBeNull();
  });

  it("夜にrollEncounterすると夜限定モンスターが出る", () => {
    const entries: EncounterEntry[] = [
      { speciesId: "night-ghost", minLevel: 10, maxLevel: 15, weight: 100, timeOfDay: ["night"] },
    ];
    const result = rollEncounter(entries, Math.random, "night");
    expect(result).not.toBeNull();
    expect(result!.speciesId).toBe("night-ghost");
  });

  it("timeOfDay未指定だとフィルタなしで全エントリが対象", () => {
    const entries: EncounterEntry[] = [
      { speciesId: "a", minLevel: 5, maxLevel: 10, weight: 50, timeOfDay: ["night"] },
      { speciesId: "b", minLevel: 5, maxLevel: 10, weight: 50 },
    ];
    // timeOfDay未指定なら両方対象
    const result = rollEncounter(entries, () => 0.1);
    expect(result).not.toBeNull();
  });
});
