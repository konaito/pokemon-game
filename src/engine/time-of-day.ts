/**
 * 時間帯システム (#186)
 * 実時間連動で昼/夕/夜を判定。出現モンスターやイベントに影響。
 */

/** 時間帯 */
export type TimeOfDay = "morning" | "day" | "evening" | "night";

/** 時間帯の時間範囲（時） */
export const TIME_RANGES: Record<TimeOfDay, { start: number; end: number }> = {
  morning: { start: 6, end: 10 },
  day: { start: 10, end: 17 },
  evening: { start: 17, end: 20 },
  night: { start: 20, end: 6 },
};

/** 時間帯の表示名 */
export const TIME_NAMES: Record<TimeOfDay, string> = {
  morning: "朝",
  day: "昼",
  evening: "夕方",
  night: "夜",
};

/**
 * 時刻（0-23）から時間帯を判定
 */
export function getTimeOfDay(hour: number): TimeOfDay {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 6 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}

/**
 * 現在の実時間から時間帯を取得
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  return getTimeOfDay(new Date().getHours());
}

/**
 * 時間帯による画面の色調補正
 * @returns CSS filter値
 */
export function getTimeFilter(time: TimeOfDay): string {
  switch (time) {
    case "morning":
      return "sepia(0.1) brightness(1.05)";
    case "day":
      return "none";
    case "evening":
      return "sepia(0.3) brightness(0.9) hue-rotate(-10deg)";
    case "night":
      return "brightness(0.6) saturate(0.7) hue-rotate(20deg)";
  }
}

/**
 * 時間帯による背景色のオーバーレイ
 */
export function getTimeOverlayColor(time: TimeOfDay): string {
  switch (time) {
    case "morning":
      return "rgba(255, 200, 100, 0.05)";
    case "day":
      return "rgba(0, 0, 0, 0)";
    case "evening":
      return "rgba(255, 100, 50, 0.15)";
    case "night":
      return "rgba(0, 0, 80, 0.3)";
  }
}

/**
 * 時間帯によるエンカウント倍率
 * 夜は遭遇率が上がる
 */
export function getTimeEncounterMultiplier(time: TimeOfDay): number {
  switch (time) {
    case "morning":
      return 0.8;
    case "day":
      return 1.0;
    case "evening":
      return 1.1;
    case "night":
      return 1.3;
  }
}

/**
 * 時間帯限定モンスターのフィルタリング
 * モンスターのtimeRestriction と現在の時間帯が一致するか
 */
export function isAvailableAtTime(
  monsterTimeRestriction: TimeOfDay | TimeOfDay[] | undefined,
  currentTime: TimeOfDay,
): boolean {
  if (!monsterTimeRestriction) return true;
  if (Array.isArray(monsterTimeRestriction)) {
    return monsterTimeRestriction.includes(currentTime);
  }
  return monsterTimeRestriction === currentTime;
}

/**
 * 簡易的な昼/夜判定（進化条件用）
 */
export function isDayTime(time: TimeOfDay): boolean {
  return time === "morning" || time === "day";
}

/**
 * 簡易的な昼/夜判定（進化条件用）
 */
export function isNightTime(time: TimeOfDay): boolean {
  return time === "evening" || time === "night";
}

/**
 * 時間帯変更メッセージ
 */
export function getTimeChangeMessage(newTime: TimeOfDay): string {
  switch (newTime) {
    case "morning":
      return "朝になった。";
    case "day":
      return "日が高くなった。";
    case "evening":
      return "夕方になった。空が赤く染まっている。";
    case "night":
      return "夜になった。星が瞬いている。";
  }
}
