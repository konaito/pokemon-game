/**
 * ピクセルスプライトデータ
 *
 * 20x20 グリッド文字列で各モンスターのドット絵を定義。
 * - '.' = 透明
 * - '1' = タイプ主色（実行時に TYPE_HEX から取得）
 * - '2' = タイプ副色（第2タイプ or 主色の明色）
 * - '3' = 暗色（主色のダーク版）
 * - 'w' = 白 (#FFFFFF) — 目の白目
 * - '-' = 黒 (#333333) — 目の閉じ線
 * - '4'〜'f' = モンスター固有色（palette で定義）
 */

export interface PixelSpriteData {
  /** モンスター固有色 ('4'〜'f' → hex) */
  palette: Record<string, string>;
  /** 20行の文字列配列（各行20文字） */
  grid: string[];
}

// ─── スターター ───
import {
  himori,
  hinomori,
  enjuu,
  shizukumo,
  namikozou,
  taikaiou,
  konohana,
  morinoko,
  taijushin,
} from "./starters";

// ─── 序盤 ───
import {
  konezumi,
  oonezumi,
  tobibato,
  hayatedori,
  mayumushi,
  hanamushi,
  hikarineko,
  dokudama,
  dokunuma,
  kawadojou,
} from "./early";

// ─── 中盤 ───
import {
  hidane,
  kaenjishi,
  tsuchikobushi,
  iwakenjin,
  mogurakko,
  dogou,
  yurabi,
  kageboushi,
  yomikagura,
  hanausagi,
  tsukiusagi,
  kanamori,
  kusakabi,
  dokubana,
  yamigarasu,
} from "./mid";

// ─── 終盤 ───
import {
  yukiusagi,
  koorigitsune,
  kogoriiwa,
  tatsunoko,
  ryuubi,
  ryuujin,
  kiokudama,
  omoidama,
  haganedake,
  kurooni,
  fubukirei,
  umihebi,
  denjimushi,
  raijindou,
} from "./late";

// ─── 伝説 ───
import { omoide, wasurenu } from "./legendary";

const ALL_SPRITES: Record<string, PixelSpriteData> = {
  // スターター
  himori,
  hinomori,
  enjuu,
  shizukumo,
  namikozou,
  taikaiou,
  konohana,
  morinoko,
  taijushin,
  // 序盤
  konezumi,
  oonezumi,
  tobibato,
  hayatedori,
  mayumushi,
  hanamushi,
  hikarineko,
  dokudama,
  dokunuma,
  kawadojou,
  // 中盤
  hidane,
  kaenjishi,
  tsuchikobushi,
  iwakenjin,
  mogurakko,
  dogou,
  yurabi,
  kageboushi,
  yomikagura,
  hanausagi,
  tsukiusagi,
  kanamori,
  kusakabi,
  dokubana,
  yamigarasu,
  // 終盤
  yukiusagi,
  koorigitsune,
  kogoriiwa,
  tatsunoko,
  ryuubi,
  ryuujin,
  kiokudama,
  omoidama,
  haganedake,
  kurooni,
  fubukirei,
  umihebi,
  denjimushi,
  raijindou,
  // 伝説
  omoide,
  wasurenu,
};

/** speciesId からスプライトデータを取得。未定義なら undefined */
export function getSpriteData(speciesId: string): PixelSpriteData | undefined {
  return ALL_SPRITES[speciesId];
}
