/**
 * 色違い & 隠れ特性システム (#179)
 */

/** 色違いの出現確率（1/4096） */
export const SHINY_RATE = 1 / 4096;

/** ひかるおまもり所持時のボーナス倍率 */
export const SHINY_CHARM_MULTIPLIER = 3;

/**
 * 色違い判定
 * @param hasShinyCharm ひかるおまもり所持時はtrue
 * @param random 乱数生成器（テスト用DI）
 */
export function isShinyRoll(
  hasShinyCharm: boolean = false,
  random: () => number = Math.random,
): boolean {
  const rate = hasShinyCharm ? SHINY_RATE * SHINY_CHARM_MULTIPLIER : SHINY_RATE;
  return random() < rate;
}

/**
 * 色違いスプライトのパレットシフト
 * 通常パレットの色相を180度シフトして色違い風にする
 */
export function generateShinyPalette(
  normalPalette: Record<string, string>,
): Record<string, string> {
  const shiny: Record<string, string> = {};
  for (const [key, hex] of Object.entries(normalPalette)) {
    shiny[key] = shiftHue(hex, 180);
  }
  return shiny;
}

/**
 * HEX色の色相をシフトする
 */
function shiftHue(hex: string, degrees: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = (((h * 60 + degrees) % 360) + 360) % 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  // HSV → RGB
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r2: number, g2: number, b2: number;
  if (h < 60) [r2, g2, b2] = [c, x, 0];
  else if (h < 120) [r2, g2, b2] = [x, c, 0];
  else if (h < 180) [r2, g2, b2] = [0, c, x];
  else if (h < 240) [r2, g2, b2] = [0, x, c];
  else if (h < 300) [r2, g2, b2] = [x, 0, c];
  else [r2, g2, b2] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

/**
 * 色違いモンスター出現メッセージ
 */
export function getShinyEncounterMessage(monsterName: string): string {
  return `★ 色違いの${monsterName}が現れた！`;
}

// ── 隠れ特性 ──

/** 隠れ特性の出現確率 */
export const HIDDEN_ABILITY_RATE = 1 / 100;

/**
 * 隠れ特性の選出判定
 * @returns true なら隠れ特性を持つ個体
 */
export function isHiddenAbilityRoll(random: () => number = Math.random): boolean {
  return random() < HIDDEN_ABILITY_RATE;
}

/** 隠れ特性マッピング（種族ID → 隠れ特性ID） */
export const HIDDEN_ABILITIES: Record<string, string> = {
  // 御三家
  himori: "speed_boost",
  hinomori: "speed_boost",
  enjuu: "speed_boost",
  shizukumo: "swift_swim",
  namikozou: "swift_swim",
  taikaiou: "swift_swim",
  konohana: "thick_fat",
  morinoko: "thick_fat",
  taijushin: "thick_fat",

  // 序盤
  konezumi: "huge_power",
  oonezumi: "huge_power",
  tobibato: "speed_boost",
  hayatedori: "adaptability",
  mayumushi: "speed_boost",
  hanamushi: "adaptability",
  hikarineko: "speed_boost",
  dokudama: "adaptability",
  dokunuma: "water_absorb",
  kawadojou: "adaptability",

  // 中盤
  hidane: "drought",
  kaenjishi: "guts",
  tsuchikobushi: "iron_fist",
  iwakenjin: "rock_head",
  mogurakko: "adaptability",
  dogou: "huge_power",
  yurabi: "shadow_tag",
  kageboushi: "shadow_tag",
  yomikagura: "inner_focus",
  hanausagi: "adaptability",
  tsukiusagi: "marvel_scale",
  kanamori: "huge_power",
  kusakabi: "adaptability",
  dokubana: "adaptability",
  yamigarasu: "speed_boost",

  // 終盤
  yukiusagi: "adaptability",
  koorigitsune: "speed_boost",
  kogoriiwa: "huge_power",
  tatsunoko: "adaptability",
  ryuubi: "adaptability",
  ryuujin: "huge_power",
  kiokudama: "adaptability",
  omoidama: "adaptability",
  haganedake: "huge_power",
  kurooni: "speed_boost",
  fubukirei: "shadow_tag",
  umihebi: "adaptability",
  denjimushi: "speed_boost",
  raijindou: "huge_power",
};

/**
 * 種族IDから隠れ特性を取得
 */
export function getHiddenAbility(speciesId: string): string | null {
  return HIDDEN_ABILITIES[speciesId] ?? null;
}
