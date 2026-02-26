import { describe, it, expect } from "vitest";
import { createBgmManager, resolveMapBgm, resolveBattleBgm } from "../bgm-manager";

describe("createBgmManager", () => {
  it("初期状態は再生なし", () => {
    const mgr = createBgmManager();
    const state = mgr.getState();
    expect(state.currentTrackId).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.volume).toBe(0.7);
    expect(state.isFading).toBe(false);
  });

  describe("play", () => {
    it("BGMを再生開始する", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      const state = mgr.getState();
      expect(state.currentTrackId).toBe("town-1");
      expect(state.isPlaying).toBe(true);
      expect(mgr.getEventLog()).toEqual([{ type: "play", trackId: "town-1" }]);
    });

    it("同じトラック再生中は何もしない", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();
      mgr.play("town-1");
      expect(mgr.getEventLog()).toEqual([]);
    });

    it("別トラックに切り替え時は先にstopが発行される", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();
      mgr.play("route-1");
      expect(mgr.getEventLog()).toEqual([{ type: "stop" }, { type: "play", trackId: "route-1" }]);
      expect(mgr.getState().currentTrackId).toBe("route-1");
    });
  });

  describe("stop", () => {
    it("再生中のBGMを停止する", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();
      mgr.stop();
      expect(mgr.getState().isPlaying).toBe(false);
      expect(mgr.getState().currentTrackId).toBeNull();
      expect(mgr.getEventLog()).toEqual([{ type: "stop" }]);
    });

    it("再生していない場合は何もしない", () => {
      const mgr = createBgmManager();
      mgr.stop();
      expect(mgr.getEventLog()).toEqual([]);
    });
  });

  describe("pause / resume", () => {
    it("一時停止と再開ができる", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();

      mgr.pause();
      expect(mgr.getState().isPlaying).toBe(false);
      expect(mgr.getState().currentTrackId).toBe("town-1");

      mgr.resume();
      expect(mgr.getState().isPlaying).toBe(true);
      expect(mgr.getEventLog()).toEqual([{ type: "pause" }, { type: "resume" }]);
    });

    it("再生していない時のpauseは何もしない", () => {
      const mgr = createBgmManager();
      mgr.pause();
      expect(mgr.getEventLog()).toEqual([]);
    });

    it("トラックがない時のresumeは何もしない", () => {
      const mgr = createBgmManager();
      mgr.resume();
      expect(mgr.getEventLog()).toEqual([]);
    });
  });

  describe("fadeOut", () => {
    it("フェードアウトイベントを発行する", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();
      mgr.fadeOut(1000);
      expect(mgr.getState().isFading).toBe(true);
      expect(mgr.getEventLog()).toEqual([{ type: "fade_out", durationMs: 1000 }]);
    });

    it("再生していない場合は何もしない", () => {
      const mgr = createBgmManager();
      mgr.fadeOut(1000);
      expect(mgr.getEventLog()).toEqual([]);
    });
  });

  describe("fadeIn", () => {
    it("フェードインで新トラックを再生する", () => {
      const mgr = createBgmManager();
      mgr.fadeIn("battle-wild", 500);
      expect(mgr.getState().currentTrackId).toBe("battle-wild");
      expect(mgr.getState().isPlaying).toBe(true);
      expect(mgr.getState().isFading).toBe(true);
      expect(mgr.getEventLog()).toEqual([
        { type: "fade_in", trackId: "battle-wild", durationMs: 500 },
      ]);
    });

    it("別トラック再生中は先にstopが発行される", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();
      mgr.fadeIn("battle-wild", 500);
      expect(mgr.getEventLog()).toEqual([
        { type: "stop" },
        { type: "fade_in", trackId: "battle-wild", durationMs: 500 },
      ]);
    });
  });

  describe("crossFade", () => {
    it("クロスフェードでトラックを切り替える", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();
      mgr.crossFade("route-1", 1000);
      expect(mgr.getEventLog()).toEqual([
        { type: "fade_out", durationMs: 500 },
        { type: "fade_in", trackId: "route-1", durationMs: 500 },
      ]);
      expect(mgr.getState().currentTrackId).toBe("route-1");
    });

    it("同じトラック再生中は何もしない", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.clearEventLog();
      mgr.crossFade("town-1", 1000);
      expect(mgr.getEventLog()).toEqual([]);
    });

    it("停止中からのcrossFadeはfade_inのみ", () => {
      const mgr = createBgmManager();
      mgr.crossFade("town-1", 1000);
      expect(mgr.getEventLog()).toEqual([{ type: "fade_in", trackId: "town-1", durationMs: 500 }]);
    });
  });

  describe("setVolume", () => {
    it("音量を設定する", () => {
      const mgr = createBgmManager();
      mgr.setVolume(0.5);
      expect(mgr.getState().volume).toBe(0.5);
      expect(mgr.getEventLog()).toEqual([{ type: "volume_change", volume: 0.5 }]);
    });

    it("音量は0-1にクランプされる", () => {
      const mgr = createBgmManager();
      mgr.setVolume(-0.5);
      expect(mgr.getState().volume).toBe(0);

      mgr.setVolume(1.5);
      expect(mgr.getState().volume).toBe(1);
    });
  });

  describe("onFadeComplete", () => {
    it("フェード完了でisFadingがfalseになる", () => {
      const mgr = createBgmManager();
      mgr.play("town-1");
      mgr.fadeOut(1000);
      expect(mgr.getState().isFading).toBe(true);

      mgr.onFadeComplete();
      expect(mgr.getState().isFading).toBe(false);
    });
  });
});

describe("resolveMapBgm", () => {
  const mapBgmTable: Record<string, string> = {
    "town-1": "bgm-town-peaceful",
    "route-1": "bgm-route-adventure",
    "gym-1": "bgm-gym",
  };

  it("マップIDに対応するBGMを返す", () => {
    expect(resolveMapBgm("town-1", mapBgmTable)).toBe("bgm-town-peaceful");
    expect(resolveMapBgm("route-1", mapBgmTable)).toBe("bgm-route-adventure");
  });

  it("マッピングにないマップはデフォルトを返す", () => {
    expect(resolveMapBgm("unknown-map", mapBgmTable)).toBe("overworld-default");
  });

  it("カスタムデフォルトを指定できる", () => {
    expect(resolveMapBgm("unknown", mapBgmTable, "bgm-fallback")).toBe("bgm-fallback");
  });
});

describe("resolveBattleBgm", () => {
  it("野生バトルBGMを返す", () => {
    expect(resolveBattleBgm("wild")).toBe("battle-wild");
  });

  it("トレーナーバトルBGMを返す", () => {
    expect(resolveBattleBgm("trainer")).toBe("battle-trainer");
  });

  it("ジムリーダーBGMを返す", () => {
    expect(resolveBattleBgm("trainer", true)).toBe("battle-gym");
  });

  it("四天王BGMを返す（最優先）", () => {
    expect(resolveBattleBgm("trainer", true, true)).toBe("battle-elite");
    expect(resolveBattleBgm("trainer", false, true)).toBe("battle-elite");
  });
});
