"use client";

import { TYPE_HEX } from "@/lib/design-tokens";

/**
 * モンスタースプライト (#129)
 * 種族IDベースのプロシージャルSVGスプライト
 * 全50種にユニークなシルエットとカラーリングを適用
 */

export interface MonsterSpriteProps {
  speciesId: string;
  types: string[];
  size?: number;
  className?: string;
  /** バトル画面で反転表示（相手側） */
  flip?: boolean;
  /** ひんし状態 */
  fainted?: boolean;
}

/** シード値からの擬似乱数生成 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** 文字列からシード値を生成 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** タイプの主色を取得 */
function getTypeColor(types: string[]): string {
  return TYPE_HEX[types[0]] ?? "#A8A878";
}

/** タイプの副色を取得 */
function getSecondaryColor(types: string[]): string {
  if (types.length > 1) return TYPE_HEX[types[1]] ?? "#A8A878";
  // 単タイプの場合は明るいバリエーション
  const hex = TYPE_HEX[types[0]] ?? "#A8A878";
  return lightenColor(hex, 40);
}

function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function darkenColor(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ─── 個別スプライト定義 ───────────────────────────────

interface SpriteShape {
  body: string;
  eyes: string;
  details: string;
  accent?: string;
}

/** 全50体のスプライト形状定義 */
function getSpriteShape(speciesId: string, primary: string, secondary: string): SpriteShape {
  const dark = darkenColor(primary, 40);
  const light = lightenColor(primary, 30);
  const eyeColor = "#FFFFFF";

  const sprites: Record<string, SpriteShape> = {
    // ─── スターター: 炎系 ───
    himori: {
      body: `<ellipse cx="32" cy="38" rx="14" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="28" rx="10" ry="9" fill="${primary}"/>
             <path d="M22 40 Q18 48 22 50 Q26 52 28 46" fill="${dark}"/>
             <path d="M36 40 Q40 48 42 50 Q46 52 42 46" fill="${dark}"/>`,
      eyes: `<circle cx="28" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="28" cy="26" r="1.5" fill="#333"/>
             <circle cx="36" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="36" cy="26" r="1.5" fill="#333"/>`,
      details: `<path d="M32 18 Q34 12 30 10 Q36 14 38 12 Q35 18 32 18" fill="#FF6030" opacity="0.9"/>`,
      accent: `<circle cx="32" cy="34" r="3" fill="#FFCC00" opacity="0.5"/>`,
    },
    hinomori: {
      body: `<ellipse cx="32" cy="36" rx="16" ry="14" fill="${primary}"/>
             <ellipse cx="32" cy="24" rx="12" ry="10" fill="${primary}"/>
             <path d="M20 38 Q14 48 18 52 Q22 54 24 46" fill="${dark}"/>
             <path d="M38 38 Q44 48 46 52 Q50 54 44 46" fill="${dark}"/>`,
      eyes: `<circle cx="26" cy="22" r="3" fill="${eyeColor}"/><circle cx="27" cy="22" r="1.8" fill="#333"/>
             <circle cx="38" cy="22" r="3" fill="${eyeColor}"/><circle cx="37" cy="22" r="1.8" fill="#333"/>`,
      details: `<path d="M32 14 Q36 6 30 4 Q38 8 42 6 Q37 14 32 14" fill="#FF6030"/>
                <path d="M28 14 Q24 6 26 4" fill="#FF8040" opacity="0.7" stroke-width="0" />`,
      accent: `<path d="M26 32 Q32 28 38 32 Q32 36 26 32" fill="#FFCC00" opacity="0.4"/>`,
    },
    enjuu: {
      body: `<ellipse cx="32" cy="34" rx="18" ry="16" fill="${primary}"/>
             <ellipse cx="32" cy="20" rx="13" ry="11" fill="${primary}"/>
             <path d="M18 36 Q10 46 14 52 Q20 56 22 44" fill="${dark}"/>
             <path d="M42 36 Q50 46 50 52 Q46 56 42 44" fill="${dark}"/>
             <path d="M26 50 Q24 56 28 58" fill="${dark}"/>
             <path d="M38 50 Q40 56 36 58" fill="${dark}"/>`,
      eyes: `<path d="M24 18 L22 16 L28 16 Z" fill="${eyeColor}"/><circle cx="25" cy="18" r="1.5" fill="#C03028"/>
             <path d="M36 18 L42 16 L40 16 Z" fill="${eyeColor}"/><circle cx="39" cy="18" r="1.5" fill="#C03028"/>`,
      details: `<path d="M32 10 Q38 0 28 -2 Q40 4 46 0 Q40 10 32 10" fill="#FF4020"/>
                <path d="M22 10 Q18 2 20 -2 Q14 4 22 10" fill="#FF6030" opacity="0.8"/>`,
      accent: `<path d="M24 30 Q32 24 40 30 Q32 36 24 30" fill="${secondary}" opacity="0.3"/>
               <circle cx="20" cy="26" r="1" fill="#FFF" opacity="0.6"/>
               <circle cx="44" cy="26" r="1" fill="#FFF" opacity="0.6"/>`,
    },

    // ─── スターター: 水系 ───
    shizukumo: {
      body: `<ellipse cx="32" cy="36" rx="12" ry="10" fill="${primary}"/>
             <circle cx="32" cy="26" r="10" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="24" r="3" fill="${eyeColor}"/><circle cx="28" cy="25" r="1.8" fill="#333"/>
             <circle cx="36" cy="24" r="3" fill="${eyeColor}"/><circle cx="36" cy="25" r="1.8" fill="#333"/>`,
      details: `<path d="M22 30 Q16 34 18 38 Q14 30 22 30" fill="${dark}" opacity="0.6"/>
                <path d="M42 30 Q48 34 46 38 Q50 30 42 30" fill="${dark}" opacity="0.6"/>
                <path d="M26 30 Q22 36 26 40" fill="${dark}" opacity="0.4"/>
                <path d="M38 30 Q42 36 38 40" fill="${dark}" opacity="0.4"/>`,
      accent: `<circle cx="32" cy="18" r="2" fill="${light}" opacity="0.5"/>`,
    },
    namikozou: {
      body: `<ellipse cx="32" cy="36" rx="15" ry="12" fill="${primary}"/>
             <circle cx="32" cy="24" r="12" fill="${primary}"/>
             <path d="M20 40 Q16 48 20 50" fill="${dark}"/>
             <path d="M44 40 Q48 48 44 50" fill="${dark}"/>`,
      eyes: `<circle cx="26" cy="22" r="3.5" fill="${eyeColor}"/><circle cx="27" cy="22" r="2" fill="#333"/>
             <circle cx="38" cy="22" r="3.5" fill="${eyeColor}"/><circle cx="37" cy="22" r="2" fill="#333"/>`,
      details: `<path d="M20 28 Q12 32 14 40 Q10 28 20 28" fill="${dark}" opacity="0.5"/>
                <path d="M44 28 Q52 32 50 40 Q54 28 44 28" fill="${dark}" opacity="0.5"/>`,
      accent: `<path d="M26 16 Q32 12 38 16" fill="${light}" opacity="0.6" stroke="${light}" stroke-width="1"/>`,
    },
    taikaiou: {
      body: `<ellipse cx="32" cy="34" rx="18" ry="15" fill="${primary}"/>
             <ellipse cx="32" cy="20" rx="14" ry="12" fill="${primary}"/>
             <path d="M16 36 Q8 44 12 50 Q18 54 20 42" fill="${dark}"/>
             <path d="M48 36 Q54 44 52 50 Q46 54 44 42" fill="${dark}"/>`,
      eyes: `<ellipse cx="24" cy="18" rx="3" ry="3.5" fill="${eyeColor}"/><circle cx="25" cy="18" r="2" fill="#F85888"/>
             <ellipse cx="40" cy="18" rx="3" ry="3.5" fill="${eyeColor}"/><circle cx="39" cy="18" r="2" fill="#F85888"/>`,
      details: `<path d="M32 8 Q28 4 24 8 Q28 6 32 8" fill="${light}"/>
                <path d="M32 8 Q36 4 40 8 Q36 6 32 8" fill="${light}"/>`,
      accent: `<circle cx="32" cy="28" r="4" fill="${secondary}" opacity="0.3"/>
               <circle cx="32" cy="28" r="2" fill="#FFF" opacity="0.2"/>`,
    },

    // ─── スターター: 草系 ───
    konohana: {
      body: `<ellipse cx="32" cy="38" rx="12" ry="10" fill="${primary}"/>
             <circle cx="32" cy="28" r="9" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="28" cy="27" r="1.5" fill="#333"/>
             <circle cx="36" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="36" cy="27" r="1.5" fill="#333"/>`,
      details: `<path d="M24 22 Q20 16 16 18 Q20 20 24 22" fill="#4CAF50"/>
                <path d="M40 22 Q44 16 48 18 Q44 20 40 22" fill="#4CAF50"/>`,
      accent: `<circle cx="32" cy="20" r="3" fill="#A5D6A7" opacity="0.5"/>
               <path d="M30 19 L32 15 L34 19" fill="#66BB6A" opacity="0.7"/>`,
    },
    morinoko: {
      body: `<ellipse cx="32" cy="36" rx="14" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="24" rx="11" ry="10" fill="${primary}"/>
             <path d="M22 40 Q18 48 22 52" fill="${dark}"/>
             <path d="M42 40 Q46 48 42 52" fill="${dark}"/>`,
      eyes: `<circle cx="26" cy="22" r="3" fill="${eyeColor}"/><circle cx="27" cy="22" r="1.8" fill="#333"/>
             <circle cx="38" cy="22" r="3" fill="${eyeColor}"/><circle cx="37" cy="22" r="1.8" fill="#333"/>`,
      details: `<path d="M22 18 Q16 12 12 16 Q18 16 22 18" fill="#388E3C"/>
                <path d="M42 18 Q48 12 52 16 Q46 16 42 18" fill="#388E3C"/>
                <path d="M32 14 Q30 8 32 6 Q34 8 32 14" fill="#66BB6A"/>`,
      accent: `<circle cx="28" cy="32" r="2" fill="#A5D6A7" opacity="0.4"/>
               <circle cx="36" cy="32" r="2" fill="#A5D6A7" opacity="0.4"/>`,
    },
    taijushin: {
      body: `<ellipse cx="32" cy="34" rx="18" ry="16" fill="${primary}"/>
             <ellipse cx="32" cy="20" rx="13" ry="11" fill="${primary}"/>
             <rect x="18" y="44" width="8" height="10" rx="3" fill="${dark}"/>
             <rect x="38" y="44" width="8" height="10" rx="3" fill="${dark}"/>`,
      eyes: `<path d="M22 18 L27 16 L27 20 Z" fill="${eyeColor}"/><circle cx="25" cy="18" r="1.5" fill="#333"/>
             <path d="M42 18 L37 16 L37 20 Z" fill="${eyeColor}"/><circle cx="39" cy="18" r="1.5" fill="#333"/>`,
      details: `<path d="M18 16 Q10 8 8 14 Q14 12 18 16" fill="#388E3C"/>
                <path d="M46 16 Q54 8 56 14 Q50 12 46 16" fill="#388E3C"/>
                <path d="M32 10 Q28 2 32 0 Q36 2 32 10" fill="#66BB6A"/>`,
      accent: `<path d="M24 30 Q32 26 40 30" fill="${secondary}" opacity="0.3" stroke="${secondary}" stroke-width="1"/>
               <circle cx="32" cy="28" r="3" fill="${secondary}" opacity="0.2"/>`,
    },

    // ─── 序盤モンスター ───
    konezumi: {
      body: `<ellipse cx="32" cy="38" rx="10" ry="8" fill="${primary}"/>
             <circle cx="32" cy="30" r="8" fill="${primary}"/>
             <path d="M26 34 Q22 40 26 42" fill="${dark}"/>
             <path d="M38 34 Q42 40 38 42" fill="${dark}"/>`,
      eyes: `<circle cx="29" cy="28" r="2" fill="${eyeColor}"/><circle cx="29" cy="28" r="1.2" fill="#333"/>
             <circle cx="35" cy="28" r="2" fill="${eyeColor}"/><circle cx="35" cy="28" r="1.2" fill="#333"/>`,
      details: `<path d="M28 24 Q26 20 24 22" fill="${light}"/>
                <path d="M36 24 Q38 20 40 22" fill="${light}"/>
                <path d="M40 36 Q48 38 50 34" fill="${primary}" opacity="0.7"/>`,
      accent: `<circle cx="32" cy="32" r="1" fill="#FFB6C1" opacity="0.6"/>`,
    },
    oonezumi: {
      body: `<ellipse cx="32" cy="36" rx="14" ry="10" fill="${primary}"/>
             <ellipse cx="32" cy="26" rx="10" ry="9" fill="${primary}"/>
             <path d="M22 38 Q16 46 20 48" fill="${dark}"/>
             <path d="M42 38 Q48 46 44 48" fill="${dark}"/>`,
      eyes: `<path d="M26 24 L24 22 L30 23 Z" fill="${eyeColor}"/><circle cx="27" cy="24" r="1.5" fill="#C03028"/>
             <path d="M38 24 L40 22 L34 23 Z" fill="${eyeColor}"/><circle cx="37" cy="24" r="1.5" fill="#C03028"/>`,
      details: `<path d="M26 20 Q22 14 20 18" fill="${light}"/>
                <path d="M38 20 Q42 14 44 18" fill="${light}"/>
                <path d="M42 34 Q52 36 56 30" fill="${primary}" opacity="0.6"/>`,
    },
    tobibato: {
      body: `<ellipse cx="32" cy="34" rx="12" ry="10" fill="${primary}"/>
             <circle cx="32" cy="26" r="8" fill="${primary}"/>
             <path d="M20 30 Q10 24 14 20" fill="${light}" opacity="0.8"/>
             <path d="M44 30 Q54 24 50 20" fill="${light}" opacity="0.8"/>`,
      eyes: `<circle cx="28" cy="24" r="2" fill="${eyeColor}"/><circle cx="29" cy="24" r="1.2" fill="#333"/>
             <circle cx="36" cy="24" r="2" fill="${eyeColor}"/><circle cx="35" cy="24" r="1.2" fill="#333"/>`,
      details: `<path d="M30 28 L32 32 L34 28" fill="#F8D030" opacity="0.7"/>`,
    },
    hayatedori: {
      body: `<ellipse cx="32" cy="32" rx="14" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="22" rx="10" ry="9" fill="${primary}"/>
             <path d="M18 28 Q4 18 10 14" fill="${light}"/>
             <path d="M46 28 Q60 18 54 14" fill="${light}"/>`,
      eyes: `<path d="M26 20 L24 18 L30 19 Z" fill="${eyeColor}"/><circle cx="27" cy="20" r="1.5" fill="#333"/>
             <path d="M38 20 L40 18 L34 19 Z" fill="${eyeColor}"/><circle cx="37" cy="20" r="1.5" fill="#333"/>`,
      details: `<path d="M28 24 L32 30 L36 24" fill="${dark}" opacity="0.4"/>
                <path d="M32 14 Q30 10 32 8 Q34 10 32 14" fill="${secondary}" opacity="0.7"/>`,
    },
    mayumushi: {
      body: `<ellipse cx="32" cy="38" rx="10" ry="8" fill="${primary}"/>
             <circle cx="32" cy="30" r="8" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="28" r="3" fill="${eyeColor}"/><circle cx="28" cy="29" r="1.8" fill="#333"/>
             <circle cx="36" cy="28" r="3" fill="${eyeColor}"/><circle cx="36" cy="29" r="1.8" fill="#333"/>`,
      details: `<path d="M22 34 Q18 38 16 36" fill="${dark}" opacity="0.5"/>
                <path d="M42 34 Q46 38 48 36" fill="${dark}" opacity="0.5"/>
                <path d="M24 34 Q20 40 18 38" fill="${dark}" opacity="0.3"/>
                <path d="M40 34 Q44 40 46 38" fill="${dark}" opacity="0.3"/>`,
    },
    hanamushi: {
      body: `<ellipse cx="32" cy="34" rx="12" ry="10" fill="${primary}"/>
             <circle cx="32" cy="24" r="9" fill="${primary}"/>
             <path d="M18 28 Q8 20 14 16" fill="${light}" opacity="0.7"/>
             <path d="M46 28 Q56 20 50 16" fill="${light}" opacity="0.7"/>`,
      eyes: `<circle cx="27" cy="22" r="2.5" fill="${eyeColor}"/><circle cx="27" cy="23" r="1.5" fill="#7038F8"/>
             <circle cx="37" cy="22" r="2.5" fill="${eyeColor}"/><circle cx="37" cy="23" r="1.5" fill="#7038F8"/>`,
      details: `<circle cx="26" cy="16" r="3" fill="#FF69B4" opacity="0.6"/>
                <circle cx="38" cy="16" r="3" fill="#FF69B4" opacity="0.6"/>
                <circle cx="32" cy="14" r="2.5" fill="#FF69B4" opacity="0.7"/>`,
    },
    hikarineko: {
      body: `<ellipse cx="32" cy="36" rx="12" ry="10" fill="${primary}"/>
             <circle cx="32" cy="26" r="10" fill="${primary}"/>
             <path d="M24 38 Q20 46 24 48" fill="${dark}"/>
             <path d="M40 38 Q44 46 40 48" fill="${dark}"/>`,
      eyes: `<circle cx="28" cy="24" r="3" fill="${eyeColor}"/><circle cx="28" cy="24" r="2" fill="#F8D030"/>
             <circle cx="36" cy="24" r="3" fill="${eyeColor}"/><circle cx="36" cy="24" r="2" fill="#F8D030"/>`,
      details: `<path d="M24 18 Q20 10 18 14" fill="${primary}"/>
                <path d="M40 18 Q44 10 46 14" fill="${primary}"/>
                <path d="M40 36 Q48 38 52 36 Q50 40 46 38" fill="${primary}"/>`,
      accent: `<path d="M26 16 Q32 14 38 16" fill="#FFF176" opacity="0.5"/>
               <circle cx="32" cy="20" r="1.5" fill="#FFEB3B" opacity="0.7"/>`,
    },
    dokudama: {
      body: `<circle cx="32" cy="32" r="12" fill="${primary}"/>`,
      eyes: `<circle cx="27" cy="30" r="2.5" fill="${eyeColor}"/><circle cx="27" cy="30" r="1.5" fill="#333"/>
             <circle cx="37" cy="30" r="2.5" fill="${eyeColor}"/><circle cx="37" cy="30" r="1.5" fill="#333"/>`,
      details: `<circle cx="26" cy="24" r="2" fill="${dark}" opacity="0.4"/>
                <circle cx="38" cy="26" r="1.5" fill="${dark}" opacity="0.3"/>
                <circle cx="30" cy="38" r="1.5" fill="${dark}" opacity="0.3"/>`,
      accent: `<path d="M32 22 Q30 18 32 16 Q34 18 32 22" fill="${light}" opacity="0.5"/>`,
    },
    dokunuma: {
      body: `<ellipse cx="32" cy="36" rx="16" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="26" rx="12" ry="10" fill="${primary}"/>`,
      eyes: `<path d="M24 24 L22 22 L28 23 Z" fill="${eyeColor}"/><circle cx="25" cy="24" r="1.5" fill="#C03028"/>
             <path d="M40 24 L42 22 L36 23 Z" fill="${eyeColor}"/><circle cx="39" cy="24" r="1.5" fill="#C03028"/>`,
      details: `<ellipse cx="32" cy="44" rx="14" ry="4" fill="${secondary}" opacity="0.4"/>
                <circle cx="24" cy="20" r="2" fill="${dark}" opacity="0.3"/>
                <circle cx="40" cy="22" r="1.5" fill="${dark}" opacity="0.3"/>`,
    },
    kawadojou: {
      body: `<ellipse cx="32" cy="34" rx="18" ry="8" fill="${primary}"/>
             <ellipse cx="24" cy="30" rx="8" ry="7" fill="${primary}"/>`,
      eyes: `<circle cx="20" cy="28" r="2" fill="${eyeColor}"/><circle cx="20" cy="28" r="1.2" fill="#333"/>
             <circle cx="28" cy="28" r="2" fill="${eyeColor}"/><circle cx="28" cy="28" r="1.2" fill="#333"/>`,
      details: `<path d="M40 30 Q50 28 54 32 Q50 36 44 34" fill="${dark}" opacity="0.4"/>
                <path d="M18 32 Q16 34 20 36" fill="${secondary}" opacity="0.4"/>`,
    },

    // ─── 中盤モンスター ───
    hidane: {
      body: `<ellipse cx="32" cy="36" rx="10" ry="9" fill="${primary}"/>
             <circle cx="32" cy="28" r="8" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="26" r="2" fill="${eyeColor}"/><circle cx="28" cy="27" r="1.2" fill="#333"/>
             <circle cx="36" cy="26" r="2" fill="${eyeColor}"/><circle cx="36" cy="27" r="1.2" fill="#333"/>`,
      details: `<path d="M32 20 Q30 14 32 12 Q34 14 32 20" fill="#FF6030" opacity="0.8"/>`,
      accent: `<circle cx="32" cy="32" r="2.5" fill="#FFCC00" opacity="0.4"/>`,
    },
    kaenjishi: {
      body: `<ellipse cx="32" cy="34" rx="16" ry="14" fill="${primary}"/>
             <ellipse cx="32" cy="22" rx="12" ry="10" fill="${primary}"/>
             <path d="M20 36 Q12 46 16 50" fill="${dark}"/>
             <path d="M44 36 Q52 46 48 50" fill="${dark}"/>`,
      eyes: `<path d="M24 20 L22 18 L28 19 Z" fill="${eyeColor}"/><circle cx="25" cy="20" r="1.5" fill="#FF6030"/>
             <path d="M40 20 L42 18 L36 19 Z" fill="${eyeColor}"/><circle cx="39" cy="20" r="1.5" fill="#FF6030"/>`,
      details: `<path d="M20 16 Q14 8 18 6 Q22 10 20 16" fill="#FF8040"/>
                <path d="M44 16 Q50 8 46 6 Q42 10 44 16" fill="#FF8040"/>
                <path d="M32 12 Q28 4 32 2 Q36 4 32 12" fill="#FF6030"/>`,
    },
    tsuchikobushi: {
      body: `<ellipse cx="32" cy="36" rx="14" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="26" rx="10" ry="9" fill="${primary}"/>`,
      eyes: `<rect x="26" y="24" width="4" height="3" rx="1" fill="${eyeColor}"/><circle cx="28" cy="25" r="1" fill="#333"/>
             <rect x="34" y="24" width="4" height="3" rx="1" fill="${eyeColor}"/><circle cx="36" cy="25" r="1" fill="#333"/>`,
      details: `<path d="M18 32 Q14 28 18 26" fill="${dark}" opacity="0.5"/>
                <path d="M46 32 Q50 28 46 26" fill="${dark}" opacity="0.5"/>`,
    },
    iwakenjin: {
      body: `<ellipse cx="32" cy="34" rx="18" ry="16" fill="${primary}"/>
             <ellipse cx="32" cy="20" rx="12" ry="10" fill="${primary}"/>
             <rect x="14" y="40" width="10" height="12" rx="3" fill="${dark}"/>
             <rect x="40" y="40" width="10" height="12" rx="3" fill="${dark}"/>`,
      eyes: `<path d="M24 18 L22 16 L28 17 Z" fill="${eyeColor}"/><circle cx="25" cy="18" r="1.5" fill="#C03028"/>
             <path d="M40 18 L42 16 L36 17 Z" fill="${eyeColor}"/><circle cx="39" cy="18" r="1.5" fill="#C03028"/>`,
      details: `<path d="M20 24 Q14 20 16 16" fill="${secondary}" opacity="0.5"/>
                <path d="M44 24 Q50 20 48 16" fill="${secondary}" opacity="0.5"/>`,
    },
    mogurakko: {
      body: `<ellipse cx="32" cy="38" rx="12" ry="8" fill="${primary}"/>
             <circle cx="32" cy="30" r="10" fill="${primary}"/>`,
      eyes: `<path d="M26 28 L30 28" stroke="#333" stroke-width="2" stroke-linecap="round"/>
             <path d="M34 28 L38 28" stroke="#333" stroke-width="2" stroke-linecap="round"/>`,
      details: `<circle cx="32" cy="32" r="3" fill="#FFB6C1" opacity="0.6"/>
                <path d="M20 34 Q16 30 14 32" fill="${dark}" opacity="0.5"/>
                <path d="M44 34 Q48 30 50 32" fill="${dark}" opacity="0.5"/>`,
    },
    dogou: {
      body: `<ellipse cx="32" cy="34" rx="16" ry="14" fill="${primary}"/>
             <ellipse cx="32" cy="22" rx="12" ry="10" fill="${primary}"/>
             <rect x="16" y="42" width="10" height="10" rx="3" fill="${dark}"/>
             <rect x="38" y="42" width="10" height="10" rx="3" fill="${dark}"/>`,
      eyes: `<rect x="24" y="20" width="5" height="3" rx="1" fill="${eyeColor}"/><circle cx="26" cy="21" r="1" fill="#B8B8D0"/>
             <rect x="35" y="20" width="5" height="3" rx="1" fill="${eyeColor}"/><circle cx="38" cy="21" r="1" fill="#B8B8D0"/>`,
      details: `<path d="M22 16 Q18 10 22 8" fill="${secondary}" opacity="0.5"/>
                <path d="M42 16 Q46 10 42 8" fill="${secondary}" opacity="0.5"/>
                <circle cx="32" cy="28" r="3" fill="${secondary}" opacity="0.3"/>`,
    },
    yurabi: {
      body: `<path d="M32 20 Q20 26 22 42 Q26 48 32 44 Q38 48 42 42 Q44 26 32 20" fill="${primary}" opacity="0.8"/>`,
      eyes: `<circle cx="28" cy="30" r="2.5" fill="#FF4444" opacity="0.8"/><circle cx="28" cy="30" r="1" fill="#FFCCCC"/>
             <circle cx="36" cy="30" r="2.5" fill="#FF4444" opacity="0.8"/><circle cx="36" cy="30" r="1" fill="#FFCCCC"/>`,
      details: `<path d="M26 38 Q24 44 26 48" fill="${primary}" opacity="0.5"/>
                <path d="M38 38 Q40 44 38 48" fill="${primary}" opacity="0.5"/>`,
    },
    kageboushi: {
      body: `<path d="M32 16 Q18 22 20 40 Q24 48 32 44 Q40 48 44 40 Q46 22 32 16" fill="${primary}" opacity="0.85"/>`,
      eyes: `<ellipse cx="26" cy="28" rx="3" ry="2.5" fill="#F85888" opacity="0.9"/><circle cx="26" cy="28" r="1.2" fill="#FFF"/>
             <ellipse cx="38" cy="28" rx="3" ry="2.5" fill="#F85888" opacity="0.9"/><circle cx="38" cy="28" r="1.2" fill="#FFF"/>`,
      details: `<path d="M24 36 Q20 44 24 50" fill="${primary}" opacity="0.4"/>
                <path d="M40 36 Q44 44 40 50" fill="${primary}" opacity="0.4"/>
                <path d="M32 18 Q28 12 32 10 Q36 12 32 18" fill="${secondary}" opacity="0.5"/>`,
    },
    yomikagura: {
      body: `<path d="M32 12 Q14 20 16 38 Q20 50 32 46 Q44 50 48 38 Q50 20 32 12" fill="${primary}" opacity="0.9"/>`,
      eyes: `<ellipse cx="24" cy="26" rx="4" ry="3" fill="#F85888"/><circle cx="24" cy="26" r="1.5" fill="#FFF"/>
             <ellipse cx="40" cy="26" rx="4" ry="3" fill="#F85888"/><circle cx="40" cy="26" r="1.5" fill="#FFF"/>`,
      details: `<path d="M22 36 Q16 46 22 54" fill="${primary}" opacity="0.4"/>
                <path d="M42 36 Q48 46 42 54" fill="${primary}" opacity="0.4"/>
                <path d="M28 36 Q24 44 28 50" fill="${primary}" opacity="0.3"/>
                <path d="M36 36 Q40 44 36 50" fill="${primary}" opacity="0.3"/>
                <path d="M32 14 Q26 6 32 4 Q38 6 32 14" fill="${secondary}" opacity="0.6"/>`,
      accent: `<circle cx="32" cy="32" r="4" fill="${secondary}" opacity="0.2"/>`,
    },
    hanausagi: {
      body: `<ellipse cx="32" cy="36" rx="10" ry="10" fill="${primary}"/>
             <circle cx="32" cy="28" r="8" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="28" cy="27" r="1.5" fill="#F85888"/>
             <circle cx="36" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="36" cy="27" r="1.5" fill="#F85888"/>`,
      details: `<path d="M26 20 Q24 12 22 14" fill="${primary}"/>
                <path d="M38 20 Q40 12 42 14" fill="${primary}"/>
                <circle cx="26" cy="12" r="2" fill="#FF69B4" opacity="0.7"/>
                <circle cx="38" cy="12" r="2" fill="#FF69B4" opacity="0.7"/>`,
      accent: `<circle cx="26" cy="30" r="1.5" fill="#FFB6C1" opacity="0.5"/>
               <circle cx="38" cy="30" r="1.5" fill="#FFB6C1" opacity="0.5"/>`,
    },
    tsukiusagi: {
      body: `<ellipse cx="32" cy="34" rx="12" ry="12" fill="${primary}"/>
             <circle cx="32" cy="24" r="10" fill="${primary}"/>`,
      eyes: `<circle cx="27" cy="22" r="3" fill="${eyeColor}"/><circle cx="27" cy="22" r="1.8" fill="#F85888"/>
             <circle cx="37" cy="22" r="3" fill="${eyeColor}"/><circle cx="37" cy="22" r="1.8" fill="#F85888"/>`,
      details: `<path d="M24 16 Q22 6 20 10" fill="${primary}"/>
                <path d="M40 16 Q42 6 44 10" fill="${primary}"/>
                <circle cx="24" cy="8" r="2.5" fill="#E1BEE7" opacity="0.7"/>
                <circle cx="40" cy="8" r="2.5" fill="#E1BEE7" opacity="0.7"/>`,
      accent: `<circle cx="32" cy="16" r="3" fill="#FFF" opacity="0.2"/>
               <path d="M26 28 Q32 32 38 28" fill="${secondary}" opacity="0.3"/>`,
    },
    kanamori: {
      body: `<rect x="18" y="20" width="28" height="28" rx="6" fill="${primary}"/>
             <rect x="22" y="16" width="20" height="20" rx="4" fill="${primary}"/>`,
      eyes: `<rect x="26" y="22" width="4" height="3" rx="1" fill="${eyeColor}"/><circle cx="28" cy="23" r="1" fill="#333"/>
             <rect x="34" y="22" width="4" height="3" rx="1" fill="${eyeColor}"/><circle cx="36" cy="23" r="1" fill="#333"/>`,
      details: `<line x1="22" y1="32" x2="42" y2="32" stroke="${dark}" stroke-width="1" opacity="0.3"/>
                <line x1="22" y1="36" x2="42" y2="36" stroke="${dark}" stroke-width="1" opacity="0.3"/>
                <line x1="22" y1="40" x2="42" y2="40" stroke="${dark}" stroke-width="1" opacity="0.3"/>`,
    },
    kusakabi: {
      body: `<ellipse cx="32" cy="36" rx="12" ry="10" fill="${primary}"/>
             <circle cx="32" cy="28" r="8" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="26" r="2" fill="${eyeColor}"/><circle cx="28" cy="27" r="1.2" fill="#A040A0"/>
             <circle cx="36" cy="26" r="2" fill="${eyeColor}"/><circle cx="36" cy="27" r="1.2" fill="#A040A0"/>`,
      details: `<circle cx="26" cy="22" r="2" fill="#A040A0" opacity="0.4"/>
                <circle cx="38" cy="24" r="1.5" fill="#A040A0" opacity="0.3"/>
                <path d="M32 20 Q30 16 32 14 Q34 16 32 20" fill="#78C850" opacity="0.6"/>`,
    },
    dokubana: {
      body: `<ellipse cx="32" cy="34" rx="14" ry="12" fill="${primary}"/>
             <circle cx="32" cy="24" r="10" fill="${primary}"/>`,
      eyes: `<ellipse cx="26" cy="22" rx="2.5" ry="2" fill="${eyeColor}"/><circle cx="26" cy="22" r="1.2" fill="#A040A0"/>
             <ellipse cx="38" cy="22" rx="2.5" ry="2" fill="${eyeColor}"/><circle cx="38" cy="22" r="1.2" fill="#A040A0"/>`,
      details: `<circle cx="28" cy="16" r="3" fill="#CE93D8" opacity="0.6"/>
                <circle cx="36" cy="14" r="3.5" fill="#CE93D8" opacity="0.7"/>
                <circle cx="32" cy="16" r="2.5" fill="#BA68C8" opacity="0.6"/>`,
      accent: `<path d="M20 30 Q16 34 18 38" fill="${secondary}" opacity="0.3"/>
               <path d="M44 30 Q48 34 46 38" fill="${secondary}" opacity="0.3"/>`,
    },
    yamigarasu: {
      body: `<ellipse cx="32" cy="34" rx="14" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="24" rx="10" ry="9" fill="${primary}"/>
             <path d="M18 28 Q6 18 12 14" fill="${dark}"/>
             <path d="M46 28 Q58 18 52 14" fill="${dark}"/>`,
      eyes: `<circle cx="27" cy="22" r="2.5" fill="#FF4444" opacity="0.9"/><circle cx="27" cy="22" r="1" fill="#FFF"/>
             <circle cx="37" cy="22" r="2.5" fill="#FF4444" opacity="0.9"/><circle cx="37" cy="22" r="1" fill="#FFF"/>`,
      details: `<path d="M30 26 L32 30 L34 26" fill="#F8D030" opacity="0.7"/>
                <path d="M32 16 Q28 12 32 10 Q36 12 32 16" fill="${dark}"/>`,
    },

    // ─── 終盤モンスター ───
    yukiusagi: {
      body: `<ellipse cx="32" cy="36" rx="10" ry="10" fill="${primary}"/>
             <circle cx="32" cy="28" r="8" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="28" cy="27" r="1.5" fill="#6890F0"/>
             <circle cx="36" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="36" cy="27" r="1.5" fill="#6890F0"/>`,
      details: `<path d="M26 20 Q24 12 22 14" fill="${primary}"/>
                <path d="M38 20 Q40 12 42 14" fill="${primary}"/>`,
      accent: `<circle cx="26" cy="30" r="1.5" fill="#B3E5FC" opacity="0.5"/>
               <circle cx="38" cy="30" r="1.5" fill="#B3E5FC" opacity="0.5"/>
               <circle cx="32" cy="20" r="1" fill="#E1F5FE" opacity="0.7"/>`,
    },
    koorigitsune: {
      body: `<ellipse cx="32" cy="34" rx="14" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="22" rx="11" ry="10" fill="${primary}"/>
             <path d="M22 36 Q16 44 20 48" fill="${dark}"/>
             <path d="M42 36 Q48 44 44 48" fill="${dark}"/>`,
      eyes: `<ellipse cx="26" cy="20" rx="2.5" ry="2" fill="${eyeColor}"/><circle cx="26" cy="20" r="1.5" fill="#EE99AC"/>
             <ellipse cx="38" cy="20" rx="2.5" ry="2" fill="${eyeColor}"/><circle cx="38" cy="20" r="1.5" fill="#EE99AC"/>`,
      details: `<path d="M24 14 Q20 6 18 10" fill="${primary}"/>
                <path d="M40 14 Q44 6 46 10" fill="${primary}"/>
                <path d="M42 34 Q52 38 54 34" fill="${primary}" opacity="0.7"/>`,
      accent: `<circle cx="32" cy="16" r="2" fill="#E1F5FE" opacity="0.5"/>`,
    },
    kogoriiwa: {
      body: `<path d="M20 44 L16 28 L24 18 L40 18 L48 28 L44 44 Z" fill="${primary}"/>
             <path d="M24 18 L28 10 L36 10 L40 18" fill="${light}"/>`,
      eyes: `<circle cx="28" cy="28" r="2" fill="${eyeColor}"/><circle cx="28" cy="28" r="1.2" fill="#6890F0"/>
             <circle cx="36" cy="28" r="2" fill="${eyeColor}"/><circle cx="36" cy="28" r="1.2" fill="#6890F0"/>`,
      details: `<line x1="24" y1="34" x2="40" y2="34" stroke="${dark}" stroke-width="1" opacity="0.3"/>
                <line x1="22" y1="38" x2="42" y2="38" stroke="${dark}" stroke-width="1" opacity="0.3"/>`,
    },
    tatsunoko: {
      body: `<ellipse cx="32" cy="34" rx="10" ry="10" fill="${primary}"/>
             <circle cx="32" cy="26" r="8" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="24" r="2.5" fill="${eyeColor}"/><circle cx="28" cy="24" r="1.5" fill="#7038F8"/>
             <circle cx="36" cy="24" r="2.5" fill="${eyeColor}"/><circle cx="36" cy="24" r="1.5" fill="#7038F8"/>`,
      details: `<path d="M26 20 Q24 14 22 16" fill="${dark}" opacity="0.5"/>
                <path d="M38 20 Q40 14 42 16" fill="${dark}" opacity="0.5"/>
                <path d="M38 38 Q44 42 46 38 Q44 44 40 40" fill="${dark}" opacity="0.4"/>`,
    },
    ryuubi: {
      body: `<ellipse cx="32" cy="34" rx="14" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="22" rx="11" ry="10" fill="${primary}"/>
             <path d="M18 28 Q8 22 12 16" fill="${secondary}" opacity="0.6"/>
             <path d="M46 28 Q56 22 52 16" fill="${secondary}" opacity="0.6"/>`,
      eyes: `<ellipse cx="26" cy="20" rx="2.5" ry="2" fill="${eyeColor}"/><circle cx="26" cy="20" r="1.5" fill="#7038F8"/>
             <ellipse cx="38" cy="20" rx="2.5" ry="2" fill="${eyeColor}"/><circle cx="38" cy="20" r="1.5" fill="#7038F8"/>`,
      details: `<path d="M24 14 Q20 6 22 4" fill="${dark}" opacity="0.5"/>
                <path d="M40 14 Q44 6 42 4" fill="${dark}" opacity="0.5"/>
                <path d="M40 38 Q50 44 52 38" fill="${dark}" opacity="0.4"/>`,
    },
    ryuujin: {
      body: `<ellipse cx="32" cy="32" rx="18" ry="16" fill="${primary}"/>
             <ellipse cx="32" cy="18" rx="13" ry="11" fill="${primary}"/>
             <path d="M14 26 Q2 18 8 10" fill="${secondary}"/>
             <path d="M50 26 Q62 18 56 10" fill="${secondary}"/>
             <rect x="16" y="42" width="10" height="12" rx="3" fill="${dark}"/>
             <rect x="38" y="42" width="10" height="12" rx="3" fill="${dark}"/>`,
      eyes: `<path d="M22 16 L20 14 L28 15 Z" fill="${eyeColor}"/><circle cx="24" cy="16" r="1.8" fill="#7038F8"/>
             <path d="M42 16 L44 14 L36 15 Z" fill="${eyeColor}"/><circle cx="40" cy="16" r="1.8" fill="#7038F8"/>`,
      details: `<path d="M22 10 Q16 2 20 0" fill="${dark}"/>
                <path d="M42 10 Q48 2 44 0" fill="${dark}"/>
                <path d="M42 36 Q54 44 56 36" fill="${dark}" opacity="0.5"/>`,
      accent: `<circle cx="32" cy="26" r="4" fill="${light}" opacity="0.2"/>`,
    },
    kiokudama: {
      body: `<circle cx="32" cy="30" r="12" fill="${primary}" opacity="0.85"/>`,
      eyes: `<circle cx="28" cy="28" r="2.5" fill="${eyeColor}"/><circle cx="28" cy="28" r="1.5" fill="#F85888"/>
             <circle cx="36" cy="28" r="2.5" fill="${eyeColor}"/><circle cx="36" cy="28" r="1.5" fill="#F85888"/>`,
      details: `<circle cx="32" cy="22" r="2" fill="${light}" opacity="0.5"/>
                <circle cx="28" cy="36" r="1.5" fill="${light}" opacity="0.3"/>
                <circle cx="36" cy="36" r="1.5" fill="${light}" opacity="0.3"/>`,
      accent: `<circle cx="32" cy="30" r="8" fill="none" stroke="${light}" stroke-width="0.5" opacity="0.4"/>`,
    },
    omoidama: {
      body: `<circle cx="32" cy="28" r="14" fill="${primary}" opacity="0.9"/>
             <path d="M22 36 Q20 44 24 46" fill="${primary}" opacity="0.5"/>
             <path d="M42 36 Q44 44 40 46" fill="${primary}" opacity="0.5"/>`,
      eyes: `<ellipse cx="26" cy="26" rx="3" ry="2.5" fill="${eyeColor}"/><circle cx="26" cy="26" r="1.5" fill="#EE99AC"/>
             <ellipse cx="38" cy="26" rx="3" ry="2.5" fill="${eyeColor}"/><circle cx="38" cy="26" r="1.5" fill="#EE99AC"/>`,
      details: `<circle cx="32" cy="18" r="3" fill="${secondary}" opacity="0.4"/>
                <circle cx="26" cy="20" r="1.5" fill="${secondary}" opacity="0.3"/>
                <circle cx="38" cy="20" r="1.5" fill="${secondary}" opacity="0.3"/>`,
      accent: `<circle cx="32" cy="28" r="10" fill="none" stroke="${secondary}" stroke-width="0.5" opacity="0.5"/>
               <circle cx="32" cy="28" r="6" fill="none" stroke="${secondary}" stroke-width="0.3" opacity="0.3"/>`,
    },
    haganedake: {
      body: `<path d="M18 44 L14 28 L22 14 L42 14 L50 28 L46 44 Z" fill="${primary}"/>
             <path d="M22 14 L26 6 L38 6 L42 14" fill="${light}"/>`,
      eyes: `<path d="M24 24 L22 22 L28 23 Z" fill="${eyeColor}"/><circle cx="25" cy="24" r="1.5" fill="#7038F8"/>
             <path d="M40 24 L42 22 L36 23 Z" fill="${eyeColor}"/><circle cx="39" cy="24" r="1.5" fill="#7038F8"/>`,
      details: `<line x1="20" y1="30" x2="44" y2="30" stroke="${dark}" stroke-width="1" opacity="0.3"/>
                <line x1="18" y1="36" x2="46" y2="36" stroke="${dark}" stroke-width="1" opacity="0.3"/>
                <path d="M28 8 Q32 2 36 8" fill="${secondary}" opacity="0.5"/>`,
      accent: `<circle cx="32" cy="26" r="3" fill="${secondary}" opacity="0.2"/>`,
    },
    kurooni: {
      body: `<ellipse cx="32" cy="34" rx="16" ry="14" fill="${primary}"/>
             <ellipse cx="32" cy="22" rx="12" ry="10" fill="${primary}"/>
             <rect x="16" y="42" width="10" height="10" rx="3" fill="${dark}"/>
             <rect x="38" y="42" width="10" height="10" rx="3" fill="${dark}"/>`,
      eyes: `<path d="M24 20 L22 18 L28 19 Z" fill="#FF4444"/><circle cx="25" cy="20" r="1.2" fill="#FFF"/>
             <path d="M40 20 L42 18 L36 19 Z" fill="#FF4444"/><circle cx="39" cy="20" r="1.2" fill="#FFF"/>`,
      details: `<path d="M26 14 Q24 8 26 6" fill="${dark}" opacity="0.7"/>
                <path d="M38 14 Q40 8 38 6" fill="${dark}" opacity="0.7"/>`,
    },
    fubukirei: {
      body: `<path d="M32 16 Q18 22 20 40 Q24 48 32 44 Q40 48 44 40 Q46 22 32 16" fill="${primary}" opacity="0.75"/>`,
      eyes: `<circle cx="28" cy="28" r="2.5" fill="#98D8D8" opacity="0.9"/><circle cx="28" cy="28" r="1" fill="#FFF"/>
             <circle cx="36" cy="28" r="2.5" fill="#98D8D8" opacity="0.9"/><circle cx="36" cy="28" r="1" fill="#FFF"/>`,
      details: `<path d="M24 36 Q20 44 24 50" fill="${primary}" opacity="0.4"/>
                <path d="M40 36 Q44 44 40 50" fill="${primary}" opacity="0.4"/>
                <circle cx="32" cy="22" r="2" fill="#E1F5FE" opacity="0.5"/>`,
    },
    umihebi: {
      body: `<ellipse cx="32" cy="32" rx="18" ry="10" fill="${primary}"/>
             <ellipse cx="22" cy="26" rx="10" ry="8" fill="${primary}"/>
             <path d="M44 28 Q54 26 58 30 Q54 34 48 32" fill="${dark}" opacity="0.5"/>`,
      eyes: `<ellipse cx="18" cy="24" rx="2" ry="2.5" fill="${eyeColor}"/><circle cx="18" cy="24" r="1.2" fill="#7038F8"/>
             <ellipse cx="26" cy="24" rx="2" ry="2.5" fill="${eyeColor}"/><circle cx="26" cy="24" r="1.2" fill="#7038F8"/>`,
      details: `<path d="M16 20 Q14 14 16 12" fill="${secondary}" opacity="0.5"/>
                <path d="M28 20 Q30 14 28 12" fill="${secondary}" opacity="0.5"/>`,
    },
    denjimushi: {
      body: `<ellipse cx="32" cy="36" rx="12" ry="8" fill="${primary}"/>
             <circle cx="32" cy="28" r="8" fill="${primary}"/>`,
      eyes: `<circle cx="28" cy="26" r="2" fill="${eyeColor}"/><circle cx="28" cy="27" r="1.2" fill="#F8D030"/>
             <circle cx="36" cy="26" r="2" fill="${eyeColor}"/><circle cx="36" cy="27" r="1.2" fill="#F8D030"/>`,
      details: `<path d="M22 34 Q18 38 16 36" fill="${dark}" opacity="0.5"/>
                <path d="M42 34 Q46 38 48 36" fill="${dark}" opacity="0.5"/>
                <path d="M24 34 Q20 40 18 38" fill="${dark}" opacity="0.3"/>
                <path d="M40 34 Q44 40 46 38" fill="${dark}" opacity="0.3"/>`,
      accent: `<path d="M28 22 Q32 18 36 22" fill="#FFEB3B" opacity="0.4"/>`,
    },
    raijindou: {
      body: `<ellipse cx="32" cy="34" rx="16" ry="12" fill="${primary}"/>
             <ellipse cx="32" cy="22" rx="12" ry="10" fill="${primary}"/>
             <rect x="16" y="40" width="10" height="10" rx="3" fill="${dark}"/>
             <rect x="38" y="40" width="10" height="10" rx="3" fill="${dark}"/>`,
      eyes: `<path d="M24 20 L22 18 L28 19 Z" fill="${eyeColor}"/><circle cx="25" cy="20" r="1.5" fill="#F8D030"/>
             <path d="M40 20 L42 18 L36 19 Z" fill="${eyeColor}"/><circle cx="39" cy="20" r="1.5" fill="#F8D030"/>`,
      details: `<path d="M24 14 Q20 6 24 4" fill="${secondary}" opacity="0.6"/>
                <path d="M40 14 Q44 6 40 4" fill="${secondary}" opacity="0.6"/>
                <path d="M32 12 Q28 4 32 2 Q36 4 32 12" fill="#FFEB3B" opacity="0.5"/>`,
      accent: `<circle cx="32" cy="28" r="3" fill="#FFEB3B" opacity="0.2"/>`,
    },

    // ─── 伝説 ───
    omoide: {
      body: `<circle cx="32" cy="26" r="14" fill="${primary}" opacity="0.9"/>
             <path d="M22 34 Q18 44 22 48 Q26 50 28 42" fill="${primary}" opacity="0.6"/>
             <path d="M42 34 Q46 44 42 48 Q38 50 36 42" fill="${primary}" opacity="0.6"/>`,
      eyes: `<ellipse cx="26" cy="24" rx="3.5" ry="3" fill="${eyeColor}"/><circle cx="26" cy="24" r="2" fill="#F85888"/>
             <ellipse cx="38" cy="24" rx="3.5" ry="3" fill="${eyeColor}"/><circle cx="38" cy="24" r="2" fill="#F85888"/>`,
      details: `<circle cx="32" cy="14" r="3" fill="${secondary}" opacity="0.6"/>
                <circle cx="24" cy="16" r="2" fill="${secondary}" opacity="0.4"/>
                <circle cx="40" cy="16" r="2" fill="${secondary}" opacity="0.4"/>`,
      accent: `<circle cx="32" cy="26" r="10" fill="none" stroke="${secondary}" stroke-width="0.5" opacity="0.6"/>
               <circle cx="32" cy="26" r="14" fill="none" stroke="${secondary}" stroke-width="0.3" opacity="0.3"/>
               <circle cx="32" cy="26" r="18" fill="none" stroke="${secondary}" stroke-width="0.2" opacity="0.15"/>`,
    },
    wasurenu: {
      body: `<ellipse cx="32" cy="28" rx="16" ry="14" fill="${primary}" opacity="0.85"/>
             <path d="M18 34 Q12 44 16 50 Q22 54 24 42" fill="${primary}" opacity="0.5"/>
             <path d="M46 34 Q52 44 48 50 Q42 54 40 42" fill="${primary}" opacity="0.5"/>`,
      eyes: `<ellipse cx="24" cy="24" rx="4" ry="3" fill="#FF4444" opacity="0.9"/><circle cx="24" cy="24" r="1.5" fill="#FFF"/>
             <ellipse cx="40" cy="24" rx="4" ry="3" fill="#FF4444" opacity="0.9"/><circle cx="40" cy="24" r="1.5" fill="#FFF"/>`,
      details: `<path d="M26 16 Q24 8 28 6 Q32 10 26 16" fill="${dark}" opacity="0.6"/>
                <path d="M38 16 Q40 8 36 6 Q32 10 38 16" fill="${dark}" opacity="0.6"/>`,
      accent: `<circle cx="32" cy="28" r="12" fill="none" stroke="${dark}" stroke-width="0.5" opacity="0.5"/>
               <circle cx="32" cy="28" r="16" fill="none" stroke="${dark}" stroke-width="0.3" opacity="0.3"/>
               <path d="M20 32 Q16 40 20 46" fill="${primary}" opacity="0.3"/>
               <path d="M44 32 Q48 40 44 46" fill="${primary}" opacity="0.3"/>`,
    },
  };

  return (
    sprites[speciesId] ?? generateFallbackSprite(speciesId, primary, secondary, dark, eyeColor)
  );
}

/** 未定義種族用のフォールバックスプライト */
function generateFallbackSprite(
  speciesId: string,
  primary: string,
  secondary: string,
  dark: string,
  eyeColor: string,
): SpriteShape {
  const rng = seededRandom(hashString(speciesId));
  const bodyWidth = 10 + rng() * 8;
  const bodyHeight = 8 + rng() * 6;
  const headRadius = 7 + rng() * 4;

  return {
    body: `<ellipse cx="32" cy="36" rx="${bodyWidth}" ry="${bodyHeight}" fill="${primary}"/>
           <circle cx="32" cy="28" r="${headRadius}" fill="${primary}"/>`,
    eyes: `<circle cx="28" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="28" cy="27" r="1.5" fill="#333"/>
           <circle cx="36" cy="26" r="2.5" fill="${eyeColor}"/><circle cx="36" cy="27" r="1.5" fill="#333"/>`,
    details: `<circle cx="${28 + rng() * 8}" cy="${20 + rng() * 4}" r="${1.5 + rng()}" fill="${secondary}" opacity="0.5"/>`,
    accent: `<circle cx="32" cy="32" r="2" fill="${dark}" opacity="0.3"/>`,
  };
}

export function MonsterSprite({
  speciesId,
  types,
  size = 64,
  className = "",
  flip = false,
  fainted = false,
}: MonsterSpriteProps) {
  const primary = getTypeColor(types);
  const secondary = getSecondaryColor(types);
  const shape = getSpriteShape(speciesId, primary, secondary);

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        transform: flip ? "scaleX(-1)" : undefined,
        opacity: fainted ? 0.3 : 1,
        filter: fainted ? "grayscale(0.8)" : undefined,
        transition: "opacity 0.3s, filter 0.3s",
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="pixel-perfect"
        style={{ imageRendering: "auto" }}
      >
        <defs>
          <radialGradient id={`glow-${speciesId}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
            <stop offset="100%" stopColor={primary} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* グロー効果 */}
        <circle cx="32" cy="32" r="28" fill={`url(#glow-${speciesId})`} />
        {/* ボディ */}
        <g dangerouslySetInnerHTML={{ __html: shape.body }} />
        {/* ディテール */}
        <g dangerouslySetInnerHTML={{ __html: shape.details }} />
        {/* アクセント */}
        {shape.accent && <g dangerouslySetInnerHTML={{ __html: shape.accent }} />}
        {/* 目 */}
        <g dangerouslySetInnerHTML={{ __html: shape.eyes }} />
      </svg>
    </div>
  );
}

/**
 * オーバーワールド用のミニスプライト
 * 小さいサイズでシンプル表示
 */
export function MonsterMiniSprite({
  speciesId,
  types,
  size = 24,
  className = "",
}: {
  speciesId: string;
  types: string[];
  size?: number;
  className?: string;
}) {
  const primary = getTypeColor(types);

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 16 16" width={size} height={size}>
        <circle cx="8" cy="8" r="6" fill={primary} />
        <circle cx="6" cy="7" r="1" fill="#FFF" />
        <circle cx="10" cy="7" r="1" fill="#FFF" />
      </svg>
    </div>
  );
}
