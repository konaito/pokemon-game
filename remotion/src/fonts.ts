/**
 * フォント読み込み
 * @remotion/google-fonts で自動ブロッキング
 */
import { loadFont as loadPressStart2P } from "@remotion/google-fonts/PressStart2P";
import { loadFont as loadDotGothic16 } from "@remotion/google-fonts/DotGothic16";
import { loadFont as loadNotoSansJP } from "@remotion/google-fonts/NotoSansJP";

export const { fontFamily: fontTitle } = loadPressStart2P();
export const { fontFamily: fontPixel } = loadDotGothic16();
export const { fontFamily: fontBody } = loadNotoSansJP();
