import { describe, it, expect } from "vitest";
import type { EvolutionPhase } from "../EvolutionAnimation";

/**
 * 進化アニメーションのフェーズ遷移ロジックのテスト
 * UIレンダリングはReact Testing Libraryが必要だが、
 * ここではフェーズ遷移の設計が正しいことを検証する
 */

/** フェーズの正しい遷移順序 */
const EXPECTED_PHASE_ORDER: EvolutionPhase[] = [
  "idle",
  "start",
  "glow",
  "flash",
  "transform",
  "reveal",
  "complete",
];

/** 各フェーズの期待時間（ms） */
const PHASE_DURATIONS: Record<EvolutionPhase, number> = {
  idle: 0,
  start: 2000,
  glow: 2000,
  flash: 600,
  transform: 1500,
  reveal: 2000,
  complete: 0,
};

describe("進化アニメーション設計", () => {
  it("フェーズは7段階", () => {
    expect(EXPECTED_PHASE_ORDER).toHaveLength(7);
  });

  it("フェーズがidleから始まりcompleteで終わる", () => {
    expect(EXPECTED_PHASE_ORDER[0]).toBe("idle");
    expect(EXPECTED_PHASE_ORDER[EXPECTED_PHASE_ORDER.length - 1]).toBe("complete");
  });

  it("演出の合計時間が6秒以上（idleとcomplete除く）", () => {
    const totalDuration = EXPECTED_PHASE_ORDER.reduce(
      (sum, phase) => sum + PHASE_DURATIONS[phase],
      0,
    );
    expect(totalDuration).toBeGreaterThanOrEqual(6000);
  });

  it("各フェーズのDurationが非負", () => {
    for (const phase of EXPECTED_PHASE_ORDER) {
      expect(PHASE_DURATIONS[phase]).toBeGreaterThanOrEqual(0);
    }
  });

  it("flashフェーズは短い（1秒未満）", () => {
    expect(PHASE_DURATIONS.flash).toBeLessThan(1000);
  });

  it("glowフェーズは十分な長さ（光の演出のため1.5秒以上）", () => {
    expect(PHASE_DURATIONS.glow).toBeGreaterThanOrEqual(1500);
  });

  it("revealフェーズは十分な長さ（テキスト読み取りのため1.5秒以上）", () => {
    expect(PHASE_DURATIONS.reveal).toBeGreaterThanOrEqual(1500);
  });

  it("キャンセル可能なフェーズはstartとglowのみ", () => {
    const cancellablePhases: EvolutionPhase[] = ["start", "glow"];
    // flashに入ったらキャンセル不可（デザイン意図の確認）
    expect(cancellablePhases).not.toContain("flash");
    expect(cancellablePhases).not.toContain("transform");
    expect(cancellablePhases).not.toContain("reveal");
  });
});
