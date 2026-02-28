/**
 * デザイントークン — ゲーム本体から移植
 */

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
};

export const COLORS = {
  bg: "#1a1a2e",
  bgPanel: "#16213e",
  bgCard: "#0f3460",
  accent: "#e94560",
  purple: "#533483",
  expBlue: "#3b82f6",
  expBlueBright: "#60a5fa",
  white: "#FFFFFF",
  textPrimary: "#FFFFFF",
  textSecondary: "#C0C0C0",
  textMuted: "#888888",
} as const;
