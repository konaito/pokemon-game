import type { TimeOfDay } from "@/types";

/**
 * 時間帯の定義:
 * - 昼:   6:00 〜 16:59
 * - 夕方: 17:00 〜 19:59
 * - 夜:   20:00 〜 5:59
 */

/** テスト用の時間オーバーライド */
let overrideHour: number | null = null;

/**
 * テスト用: 時間を固定する
 */
export function setTimeOverride(hour: number | null): void {
  overrideHour = hour;
}

/**
 * 現在の時間（時）を取得
 */
export function getCurrentHour(): number {
  if (overrideHour !== null) return overrideHour;
  return new Date().getHours();
}

/**
 * 現在の時間帯を取得
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = getCurrentHour();
  if (hour >= 6 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

/**
 * 時間帯の日本語名を取得
 */
export function getTimeOfDayName(time: TimeOfDay): string {
  switch (time) {
    case "day":
      return "昼";
    case "evening":
      return "夕方";
    case "night":
      return "夜";
  }
}

/**
 * 時間帯に応じた挨拶テキストを取得
 */
export function getGreeting(time: TimeOfDay): string {
  switch (time) {
    case "day":
      return "こんにちは";
    case "evening":
      return "こんばんは";
    case "night":
      return "こんばんは";
  }
}

/**
 * 時間帯に応じたマップオーバーレイ色を取得
 */
export function getTimeOverlayColor(time: TimeOfDay): string | null {
  switch (time) {
    case "day":
      return null; // オーバーレイなし
    case "evening":
      return "rgba(255, 165, 0, 0.15)";
    case "night":
      return "rgba(0, 0, 50, 0.3)";
  }
}
