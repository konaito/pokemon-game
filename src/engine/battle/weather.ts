/**
 * 天候システム (#173)
 * 天候によるダメージ倍率、毎ターンダメージ、ターン管理
 */
import type { WeatherId, TypeId } from "@/types";

/** 天候の表示名 */
export const WEATHER_NAMES: Record<WeatherId, string> = {
  clear: "なし",
  sunny: "晴れ",
  rainy: "雨",
  sandstorm: "砂嵐",
  hail: "あられ",
};

/** 天候状態 */
export interface WeatherState {
  weather: WeatherId;
  /** 残りターン数（0なら永続、1以上でカウントダウン） */
  turnsRemaining: number;
}

/** デフォルト天候状態（快晴＝天候なし） */
export function createWeatherState(weather: WeatherId = "clear"): WeatherState {
  return { weather, turnsRemaining: 0 };
}

/**
 * 天候を設定する
 * @param turns ターン数（デフォルト5ターン、0=永続）
 */
export function setWeather(weather: WeatherId, turns: number = 5): WeatherState {
  if (weather === "clear") {
    return { weather: "clear", turnsRemaining: 0 };
  }
  return { weather, turnsRemaining: turns };
}

/**
 * ターン終了時の天候処理
 * @returns 新しい天候状態
 */
export function tickWeather(state: WeatherState): WeatherState {
  if (state.weather === "clear" || state.turnsRemaining === 0) return state;

  const remaining = state.turnsRemaining - 1;
  if (remaining <= 0) {
    return { weather: "clear", turnsRemaining: 0 };
  }
  return { ...state, turnsRemaining: remaining };
}

/**
 * 天候が変化した（終了した）ときのメッセージ
 */
export function getWeatherEndMessage(weather: WeatherId): string {
  switch (weather) {
    case "sunny":
      return "日差しが元に戻った。";
    case "rainy":
      return "雨が止んだ。";
    case "sandstorm":
      return "砂嵐が収まった。";
    case "hail":
      return "あられが止んだ。";
    default:
      return "";
  }
}

/**
 * 天候開始時のメッセージ
 */
export function getWeatherStartMessage(weather: WeatherId): string {
  switch (weather) {
    case "sunny":
      return "日差しが強くなった！";
    case "rainy":
      return "雨が降り始めた！";
    case "sandstorm":
      return "砂嵐が巻き起こった！";
    case "hail":
      return "あられが降り始めた！";
    default:
      return "";
  }
}

/**
 * 天候による攻撃技のダメージ倍率
 *
 * 晴れ: 炎1.5倍, 水0.5倍
 * 雨:   水1.5倍, 炎0.5倍
 */
export function getWeatherDamageMultiplier(weather: WeatherId, moveType: TypeId): number {
  if (weather === "sunny") {
    if (moveType === "fire") return 1.5;
    if (moveType === "water") return 0.5;
  }
  if (weather === "rainy") {
    if (moveType === "water") return 1.5;
    if (moveType === "fire") return 0.5;
  }
  return 1.0;
}

/** 砂嵐で特防ブーストを受けるタイプ */
const SANDSTORM_SPDEF_TYPES: TypeId[] = ["rock"];

/**
 * 砂嵐時の岩タイプ特防1.5倍判定
 */
export function getSandstormSpDefMultiplier(weather: WeatherId, defenderTypes: TypeId[]): number {
  if (weather === "sandstorm" && defenderTypes.some((t) => SANDSTORM_SPDEF_TYPES.includes(t))) {
    return 1.5;
  }
  return 1.0;
}

/** 天候ダメージの免除タイプ */
const SANDSTORM_IMMUNE: TypeId[] = ["rock", "ground", "steel"];
const HAIL_IMMUNE: TypeId[] = ["ice"];

/**
 * 毎ターンの天候ダメージを計算
 * 砂嵐・あられ: 最大HPの1/16（免除タイプあり）
 *
 * @returns ダメージ量（0なら免除）
 */
export function getWeatherDamage(
  weather: WeatherId,
  maxHp: number,
  monsterTypes: TypeId[],
): number {
  if (weather === "sandstorm") {
    if (monsterTypes.some((t) => SANDSTORM_IMMUNE.includes(t))) return 0;
    return Math.max(1, Math.floor(maxHp / 16));
  }
  if (weather === "hail") {
    if (monsterTypes.some((t) => HAIL_IMMUNE.includes(t))) return 0;
    return Math.max(1, Math.floor(maxHp / 16));
  }
  return 0;
}

/**
 * 天候ダメージメッセージ
 */
export function getWeatherDamageMessage(weather: WeatherId, monsterName: string): string {
  if (weather === "sandstorm") return `${monsterName}は砂嵐でダメージを受けた！`;
  if (weather === "hail") return `${monsterName}はあられでダメージを受けた！`;
  return "";
}

/**
 * 天候の継続メッセージ（毎ターン表示）
 */
export function getWeatherContinueMessage(weather: WeatherId): string {
  switch (weather) {
    case "sunny":
      return "日差しが強い。";
    case "rainy":
      return "雨が降り続いている。";
    case "sandstorm":
      return "砂嵐が吹き荒れている。";
    case "hail":
      return "あられが降り続いている。";
    default:
      return "";
  }
}
