import { describe, it, expect } from "vitest";
import { createSeManager, resolveDamageSe, generateCaptureSe, SE } from "../se-manager";

describe("createSeManager", () => {
  it("初期マスターボリュームは0.8", () => {
    const mgr = createSeManager();
    expect(mgr.getMasterVolume()).toBe(0.8);
  });

  describe("play", () => {
    it("SEを再生する（マスターボリュームが適用される）", () => {
      const mgr = createSeManager();
      mgr.play(SE.CONFIRM);
      expect(mgr.getEventLog()).toEqual([{ type: "play", seId: "se-confirm", volume: 0.8 }]);
    });

    it("個別音量を指定できる", () => {
      const mgr = createSeManager();
      mgr.play(SE.CURSOR_MOVE, 0.5);
      // 0.5 * 0.8 = 0.4
      expect(mgr.getEventLog()[0]).toEqual({
        type: "play",
        seId: "se-cursor-move",
        volume: 0.4,
      });
    });

    it("音量は0-1にクランプされる", () => {
      const mgr = createSeManager();
      mgr.play(SE.CONFIRM, 2.0);
      // 2.0 * 0.8 = 1.6 → クランプで1.0
      expect(mgr.getEventLog()[0].volume).toBe(1);
    });
  });

  describe("setMasterVolume", () => {
    it("マスターボリュームを変更する", () => {
      const mgr = createSeManager();
      mgr.setMasterVolume(0.5);
      expect(mgr.getMasterVolume()).toBe(0.5);
      expect(mgr.getEventLog()).toEqual([{ type: "master_volume_change", volume: 0.5 }]);
    });

    it("マスターボリュームは0-1にクランプされる", () => {
      const mgr = createSeManager();
      mgr.setMasterVolume(-1);
      expect(mgr.getMasterVolume()).toBe(0);

      mgr.setMasterVolume(5);
      expect(mgr.getMasterVolume()).toBe(1);
    });

    it("マスターボリューム変更後のSE再生に反映される", () => {
      const mgr = createSeManager();
      mgr.setMasterVolume(0.5);
      mgr.clearEventLog();

      mgr.play(SE.CONFIRM, 1.0);
      // 1.0 * 0.5 = 0.5
      expect(mgr.getEventLog()[0].volume).toBe(0.5);
    });
  });

  describe("clearEventLog", () => {
    it("イベントログをクリアする", () => {
      const mgr = createSeManager();
      mgr.play(SE.CONFIRM);
      mgr.play(SE.CANCEL);
      expect(mgr.getEventLog()).toHaveLength(2);

      mgr.clearEventLog();
      expect(mgr.getEventLog()).toHaveLength(0);
    });
  });
});

describe("resolveDamageSe", () => {
  it("効果抜群", () => {
    expect(resolveDamageSe(2)).toBe(SE.ATTACK_SUPER);
    expect(resolveDamageSe(4)).toBe(SE.ATTACK_SUPER);
  });

  it("等倍", () => {
    expect(resolveDamageSe(1)).toBe(SE.ATTACK_NORMAL);
  });

  it("いまひとつ", () => {
    expect(resolveDamageSe(0.5)).toBe(SE.ATTACK_WEAK);
    expect(resolveDamageSe(0.25)).toBe(SE.ATTACK_WEAK);
  });

  it("無効", () => {
    expect(resolveDamageSe(0)).toBe(SE.ATTACK_MISS);
  });
});

describe("generateCaptureSe", () => {
  it("捕獲成功（3回揺れ）", () => {
    const seq = generateCaptureSe(3, true);
    expect(seq).toEqual([
      SE.BALL_THROW,
      SE.BALL_SHAKE,
      SE.BALL_SHAKE,
      SE.BALL_SHAKE,
      SE.CATCH_SUCCESS,
    ]);
  });

  it("捕獲失敗（1回揺れ）", () => {
    const seq = generateCaptureSe(1, false);
    expect(seq).toEqual([SE.BALL_THROW, SE.BALL_SHAKE, SE.CATCH_FAIL]);
  });

  it("捕獲失敗（0回揺れ）", () => {
    const seq = generateCaptureSe(0, false);
    expect(seq).toEqual([SE.BALL_THROW, SE.CATCH_FAIL]);
  });
});
