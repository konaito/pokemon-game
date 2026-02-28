import type { WeatherId, TypeId, MonsterInstance, MonsterSpecies } from "@/types";
import { calcAllStats } from "@/engine/monster/stats";

/** 天候の状態 */
export interface WeatherState {
  current: WeatherId;
  /** 残りターン数（0=永続/通常天候、1-5=残りターン） */
  turnsRemaining: number;
}

/** 天候初期状態（晴れ=通常） */
export function createWeatherState(defaultWeather: WeatherId = "clear"): WeatherState {
  return { current: defaultWeather, turnsRemaining: 0 };
}

/** 天候名を日本語で返す */
export function getWeatherName(weather: WeatherId): string {
  switch (weather) {
    case "clear":
      return "通常";
    case "sunny":
      return "ひざしがつよい";
    case "rainy":
      return "あめ";
    case "sandstorm":
      return "すなあらし";
    case "hail":
      return "あられ";
  }
}

/** 天候を変更する */
export function setWeather(state: WeatherState, weather: WeatherId, turns: number = 5): string[] {
  if (state.current === weather) {
    return ["しかし効果がなかった！"];
  }

  state.current = weather;
  state.turnsRemaining = weather === "clear" ? 0 : turns;

  switch (weather) {
    case "sunny":
      return ["日差しが強くなった！"];
    case "rainy":
      return ["雨が降り始めた！"];
    case "sandstorm":
      return ["砂嵐が吹き始めた！"];
    case "hail":
      return ["あられが降り始めた！"];
    case "clear":
      return ["天候が元に戻った！"];
  }
}

/** 天候によるダメージ技の倍率を返す */
export function getWeatherDamageMultiplier(weather: WeatherId, moveType: TypeId): number {
  if (weather === "sunny") {
    if (moveType === "fire") return 1.5;
    if (moveType === "water") return 0.5;
  }
  if (weather === "rainy") {
    if (moveType === "water") return 1.5;
    if (moveType === "fire") return 0.5;
  }
  return 1;
}

/** 砂嵐時の岩タイプ特防1.5倍 */
export function getWeatherSpDefMultiplier(weather: WeatherId, defenderTypes: TypeId[]): number {
  if (weather === "sandstorm" && defenderTypes.includes("rock")) {
    return 1.5;
  }
  return 1;
}

/**
 * ターン終了時の天候ダメージ
 * 砂嵐: 岩/地面/鋼タイプ以外に最大HPの1/16ダメージ
 * あられ: 氷タイプ以外に最大HPの1/16ダメージ
 */
export function applyWeatherDamage(
  weather: WeatherId,
  monster: MonsterInstance,
  species: MonsterSpecies,
): { damage: number; message: string | null } {
  if (monster.currentHp <= 0) return { damage: 0, message: null };

  const maxHp = calcAllStats(
    species.baseStats,
    monster.ivs,
    monster.evs,
    monster.level,
    monster.nature,
  ).hp;
  const weatherDmg = Math.max(1, Math.floor(maxHp / 16));

  if (weather === "sandstorm") {
    const immuneTypes: TypeId[] = ["rock", "ground", "steel"];
    if (species.types.some((t) => immuneTypes.includes(t))) {
      return { damage: 0, message: null };
    }
    const actualDmg = Math.min(weatherDmg, monster.currentHp);
    monster.currentHp -= actualDmg;
    return { damage: actualDmg, message: `${species.name}は砂嵐でダメージを受けた！` };
  }

  if (weather === "hail") {
    if (species.types.includes("ice")) {
      return { damage: 0, message: null };
    }
    const actualDmg = Math.min(weatherDmg, monster.currentHp);
    monster.currentHp -= actualDmg;
    return { damage: actualDmg, message: `${species.name}はあられでダメージを受けた！` };
  }

  return { damage: 0, message: null };
}

/** ターン終了時の天候ターンカウント処理 */
export function tickWeather(state: WeatherState): string[] {
  if (state.current === "clear" || state.turnsRemaining <= 0) return [];

  state.turnsRemaining--;

  if (state.turnsRemaining <= 0) {
    const oldWeather = state.current;
    state.current = "clear";
    switch (oldWeather) {
      case "sunny":
        return ["日差しが元に戻った。"];
      case "rainy":
        return ["雨が止んだ。"];
      case "sandstorm":
        return ["砂嵐が収まった。"];
      case "hail":
        return ["あられが止んだ。"];
    }
  }

  return [];
}
