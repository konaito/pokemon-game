/**
 * デザイントークン - Monster Chronicle
 *
 * ゲーム全体のカラー・タイプ色・ステータス色・UIトークンを一元管理。
 * 各コンポーネントはここからインポートして使う。重複定義を排除する。
 */

// ─── タイプカラー（ビビッド） ───────────────────────────────

/** タイプ色 (hex) - バトルエフェクト・グラデーション等に使用 */
export const TYPE_HEX: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
} as const;

/** タイプ色 (Tailwind bg クラス) - バッジ・ラベル等に使用 */
export const TYPE_BG: Record<string, string> = {
  normal: "bg-[#A8A878]",
  fire: "bg-[#F08030]",
  water: "bg-[#6890F0]",
  grass: "bg-[#78C850]",
  electric: "bg-[#F8D030]",
  ice: "bg-[#98D8D8]",
  fighting: "bg-[#C03028]",
  poison: "bg-[#A040A0]",
  ground: "bg-[#E0C068]",
  flying: "bg-[#A890F0]",
  psychic: "bg-[#F85888]",
  bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]",
  ghost: "bg-[#705898]",
  dragon: "bg-[#7038F8]",
  dark: "bg-[#705848]",
  steel: "bg-[#B8B8D0]",
  fairy: "bg-[#EE99AC]",
} as const;

/** タイプ色 (Tailwind text + border クラス) - 選択UI等に使用 */
export const TYPE_ACCENT: Record<string, string> = {
  normal: "text-[#A8A878] border-[#A8A878]",
  fire: "text-[#F08030] border-[#F08030]",
  water: "text-[#6890F0] border-[#6890F0]",
  grass: "text-[#78C850] border-[#78C850]",
  electric: "text-[#F8D030] border-[#F8D030]",
  ice: "text-[#98D8D8] border-[#98D8D8]",
  fighting: "text-[#C03028] border-[#C03028]",
  poison: "text-[#A040A0] border-[#A040A0]",
  ground: "text-[#E0C068] border-[#E0C068]",
  flying: "text-[#A890F0] border-[#A890F0]",
  psychic: "text-[#F85888] border-[#F85888]",
  bug: "text-[#A8B820] border-[#A8B820]",
  rock: "text-[#B8A038] border-[#B8A038]",
  ghost: "text-[#705898] border-[#705898]",
  dragon: "text-[#7038F8] border-[#7038F8]",
  dark: "text-[#705848] border-[#705848]",
  steel: "text-[#B8B8D0] border-[#B8B8D0]",
  fairy: "text-[#EE99AC] border-[#EE99AC]",
} as const;

/** タイプの日本語名 */
export const TYPE_LABEL: Record<string, string> = {
  normal: "ノーマル",
  fire: "ほのお",
  water: "みず",
  grass: "くさ",
  electric: "でんき",
  ice: "こおり",
  fighting: "かくとう",
  poison: "どく",
  ground: "じめん",
  flying: "ひこう",
  psychic: "エスパー",
  bug: "むし",
  rock: "いわ",
  ghost: "ゴースト",
  dragon: "ドラゴン",
  dark: "あく",
  steel: "はがね",
  fairy: "フェアリー",
} as const;

// ─── ステータス異常カラー ───────────────────────────────

export const STATUS_COLOR: Record<string, { bg: string; text: string; hex: string }> = {
  poison: { bg: "bg-purple-600", text: "text-purple-300", hex: "#A040A0" },
  burn: { bg: "bg-orange-600", text: "text-orange-300", hex: "#F08030" },
  paralysis: { bg: "bg-yellow-600", text: "text-yellow-300", hex: "#F8D030" },
  sleep: { bg: "bg-gray-600", text: "text-gray-300", hex: "#8C8C8C" },
  freeze: { bg: "bg-cyan-600", text: "text-cyan-300", hex: "#98D8D8" },
} as const;

// ─── HPバーカラー ───────────────────────────────

export function getHpColor(ratio: number): string {
  if (ratio > 0.5) return "bg-emerald-400";
  if (ratio > 0.2) return "bg-yellow-400";
  return "bg-red-500";
}

export function getHpHex(ratio: number): string {
  if (ratio > 0.5) return "#34D399";
  if (ratio > 0.2) return "#FBBF24";
  return "#EF4444";
}

// ─── ゲームUIカラー ───────────────────────────────

export const UI = {
  /** メイン背景 */
  bg: "bg-[#1a1a2e]",
  /** サブ背景（パネル） */
  bgPanel: "bg-[#16213e]",
  /** カード/ウィンドウ背景 */
  bgCard: "bg-[#0f3460]",
  /** アクセントカラー */
  accent: "bg-[#e94560]",
  accentText: "text-[#e94560]",
  accentHover: "hover:bg-[#ff6b81]",
  /** ポジティブアクション */
  positive: "bg-emerald-500",
  positiveText: "text-emerald-400",
  positiveHover: "hover:bg-emerald-400",
  /** テキスト */
  textPrimary: "text-white",
  textSecondary: "text-gray-300",
  textMuted: "text-gray-500",
  /** ボーダー */
  border: "border-[#533483]/50",
  borderBright: "border-[#e94560]/60",
  /** ウィンドウフレーム（RPG風） */
  windowFrame: "border-2 border-[#533483] bg-[#16213e]/95 shadow-[0_0_20px_rgba(83,52,131,0.3)]",
  /** 選択状態 */
  selected: "bg-white/15",
  selectedBorder: "border-white/40",
} as const;

// ─── タイルカラー（オーバーワールド） ───────────────────

export const TILE_COLORS: Record<string, string> = {
  ground: "bg-[#c8b88c]",
  wall: "bg-[#5a5a6e]",
  grass: "bg-[#5cb85c]",
  water: "bg-[#5b9bd5]",
  ledge: "bg-[#d4a95a]",
  door: "bg-[#8b5e3c]",
  sign: "bg-[#b87333]",
} as const;
