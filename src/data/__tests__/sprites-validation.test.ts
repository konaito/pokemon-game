import { describe, it, expect } from "vitest";
import { getSpriteData } from "../sprites";
import { getAllSpeciesIds } from "../monsters";

const GRID_ROWS = 20;
const GRID_COLS = 20;
const VALID_CHARS = new Set([
  ".",
  "1",
  "2",
  "3",
  "w",
  "-",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
]);

describe("スプライトデータバリデーション", () => {
  const speciesIds = getAllSpeciesIds();

  it("モンスターが定義されている", () => {
    expect(speciesIds.length).toBeGreaterThan(0);
  });

  it("全モンスターにスプライトが存在する", () => {
    const missing: string[] = [];
    for (const id of speciesIds) {
      if (!getSpriteData(id)) {
        missing.push(id);
      }
    }
    expect(missing).toEqual([]);
  });

  describe("各スプライトのフォーマット検証", () => {
    for (const id of speciesIds) {
      const sprite = getSpriteData(id);
      if (!sprite) continue;

      it(`${id}: gridは${GRID_ROWS}行`, () => {
        expect(sprite.grid).toHaveLength(GRID_ROWS);
      });

      it(`${id}: 各行は${GRID_COLS}文字`, () => {
        for (let i = 0; i < sprite.grid.length; i++) {
          expect(sprite.grid[i]).toHaveLength(GRID_COLS);
        }
      });

      it(`${id}: 使用文字が有効`, () => {
        for (let row = 0; row < sprite.grid.length; row++) {
          for (let col = 0; col < sprite.grid[row].length; col++) {
            const char = sprite.grid[row][col];
            expect(VALID_CHARS.has(char)).toBe(true);
          }
        }
      });

      it(`${id}: palette参照の整合性（grid内の4-f文字にpalette定義がある）`, () => {
        const paletteChars = new Set(["4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]);
        const usedChars = new Set<string>();
        for (const row of sprite.grid) {
          for (const char of row) {
            if (paletteChars.has(char)) {
              usedChars.add(char);
            }
          }
        }
        for (const char of usedChars) {
          expect(sprite.palette[char]).toBeDefined();
        }
      });
    }
  });
});
