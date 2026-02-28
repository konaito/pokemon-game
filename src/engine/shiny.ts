/**
 * 色違いモンスターシステム
 */

/** 色違い出現確率 (1/4096) */
export const SHINY_RATE = 1 / 4096;

/**
 * 色違い判定
 * @param random 乱数関数（テスト用DI）
 * @returns 色違いかどうか
 */
export function rollShiny(random: () => number = Math.random): boolean {
  return random() < SHINY_RATE;
}

/**
 * パレットを色違い用に自動変換
 * 色相を反転 or シフトする簡易アルゴリズム
 * 元のパレットキー('1','2','3'等)のHEXカラーを変換
 */
export function generateShinyPalette(palette: Record<string, string>): Record<string, string> {
  const shiny: Record<string, string> = {};
  for (const [key, color] of Object.entries(palette)) {
    shiny[key] = shiftHue(color);
  }
  return shiny;
}

/**
 * HEXカラーの色相をシフトする
 */
function shiftHue(hex: string): string {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // HSLに変換
  const [h, s, l] = rgbToHsl(r, g, b);

  // 色相を180度シフト（補色）
  const newH = (h + 0.5) % 1;

  // RGBに戻す
  const [nr, ng, nb] = hslToRgb(newH, s, l);

  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}
