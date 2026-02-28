import { describe, it, expect } from "vitest";
import {
  TOWN_BGM_THEMES,
  TOWN_SOUNDSCAPES,
  getTownBgmTheme,
  getTownSoundscape,
  resolveBgmTrackId,
  getBgmThemeCount,
} from "../town-bgm";

describe("街BGMテーマ", () => {
  it("10街以上にBGMテーマが定義されている", () => {
    expect(getBgmThemeCount()).toBeGreaterThanOrEqual(10);
  });

  it("全テーマに必須フィールドがある", () => {
    for (const theme of TOWN_BGM_THEMES) {
      expect(theme.mapId.length).toBeGreaterThan(0);
      expect(theme.trackId.length).toBeGreaterThan(0);
      expect(theme.themeName.length).toBeGreaterThan(0);
      expect(theme.mood.length).toBeGreaterThan(0);
      expect(theme.instruments.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("トラックIDがユニーク", () => {
    const ids = TOWN_BGM_THEMES.map((t) => t.trackId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("各テーマのテンポが有効値", () => {
    const validTempos = ["slow", "moderate", "fast"];
    for (const theme of TOWN_BGM_THEMES) {
      expect(validTempos).toContain(theme.tempo);
    }
  });

  it("getTownBgmThemeでテーマを取得できる", () => {
    const theme = getTownBgmTheme("wasuremachi");
    expect(theme).toBeDefined();
    expect(theme!.themeName).toContain("忘却");
  });

  it("存在しない街はundefined", () => {
    expect(getTownBgmTheme("nonexistent")).toBeUndefined();
  });
});

describe("サウンドスケープ", () => {
  it("10街以上にサウンドスケープが定義されている", () => {
    expect(TOWN_SOUNDSCAPES.length).toBeGreaterThanOrEqual(10);
  });

  it("各街に2つ以上の環境音がある", () => {
    for (const scape of TOWN_SOUNDSCAPES) {
      expect(scape.ambientSounds.length, `${scape.mapId}の環境音が少ない`).toBeGreaterThanOrEqual(
        2,
      );
    }
  });

  it("環境音の音量が0.0-1.0の範囲", () => {
    for (const scape of TOWN_SOUNDSCAPES) {
      for (const sound of scape.ambientSounds) {
        expect(sound.volume).toBeGreaterThanOrEqual(0);
        expect(sound.volume).toBeLessThanOrEqual(1);
      }
    }
  });

  it("getTownSoundscapeでサウンドスケープを取得できる", () => {
    const scape = getTownSoundscape("kawasemi-city");
    expect(scape).toBeDefined();
    const hasWater = scape!.ambientSounds.some(
      (s) => s.name.includes("川") || s.name.includes("水"),
    );
    expect(hasWater).toBe(true);
  });
});

describe("BGMトラックID解決", () => {
  it("街BGMが定義されていればそのトラックIDを返す", () => {
    expect(resolveBgmTrackId("wasuremachi")).toBe("bgm-wasuremachi");
  });

  it("街BGMが未定義ならデフォルトを返す", () => {
    expect(resolveBgmTrackId("unknown-map")).toBe("bgm-overworld");
  });

  it("全定義済み街のBGMが解決される", () => {
    for (const theme of TOWN_BGM_THEMES) {
      const trackId = resolveBgmTrackId(theme.mapId);
      expect(trackId).toBe(theme.trackId);
    }
  });
});
