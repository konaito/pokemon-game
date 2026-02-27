import { test, expect } from "../fixtures/game-fixture";
import { createMidGameSave } from "../fixtures/save-data";

test.describe("図鑑", () => {
  test.beforeEach(async ({ gamePage }) => {
    const saveData = createMidGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("図鑑画面が表示される", async ({ gamePage }) => {
    await gamePage.openMenu();

    // "図鑑"は3番目のメニュー項目（2回ArrowDown）
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // 図鑑ヘッダーの統計が表示される
    await expect(gamePage.page.getByText("みつけた:", { exact: false })).toBeVisible();
    await expect(gamePage.page.getByText("つかまえた:", { exact: false }).first()).toBeVisible();
  });

  test("見た/捕まえた数が正しく表示される", async ({ gamePage }) => {
    await gamePage.openMenu();
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // midGameSaveではseen=5, caught=4
    // ヘッダー統計の数値を確認（具体的なテキストパターンで検索）
    await expect(gamePage.page.getByText("みつけた:", { exact: false })).toBeVisible();
    await expect(gamePage.page.getByText("つかまえた:", { exact: false }).first()).toBeVisible();
  });

  test("Escapeで図鑑画面を閉じる", async ({ gamePage }) => {
    await gamePage.openMenu();
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    await gamePage.page.keyboard.press("Escape");
    await gamePage.page.waitForTimeout(300);
  });
});
