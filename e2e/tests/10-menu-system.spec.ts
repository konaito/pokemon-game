import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave } from "../fixtures/save-data";

test.describe("メニューシステム", () => {
  test.beforeEach(async ({ gamePage }) => {
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("Escapeでメニューオーバーレイが開く", async ({ gamePage }) => {
    await gamePage.openMenu();

    await expect(gamePage.page.locator('[role="dialog"]')).toBeVisible();
    await expect(gamePage.page.locator('[role="menu"]')).toBeVisible();
  });

  test("メニュー項目が表示される", async ({ gamePage }) => {
    await gamePage.openMenu();

    await expect(gamePage.page.locator('[role="menuitem"]:has-text("ポケモン")')).toBeVisible();
    await expect(gamePage.page.locator('[role="menuitem"]:has-text("バッグ")')).toBeVisible();
    await expect(gamePage.page.locator('[role="menuitem"]:has-text("図鑑")')).toBeVisible();
    await expect(gamePage.page.locator('[role="menuitem"]:has-text("レポート")')).toBeVisible();
    await expect(gamePage.page.locator('[role="menuitem"]:has-text("とじる")')).toBeVisible();
  });

  test("プレイヤー名とバッジ数が表示される", async ({ gamePage }) => {
    await gamePage.openMenu();

    await expect(gamePage.page.locator("text=テスト")).toBeVisible();
    await expect(gamePage.page.locator("text=0")).toBeVisible(); // バッジ0個
  });

  test("ArrowUp/Downでメニュー項目を移動できる", async ({ gamePage }) => {
    await gamePage.openMenu();

    // ArrowDownで移動
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
  });

  test("Escapeでメニューを閉じる", async ({ gamePage }) => {
    await gamePage.openMenu();
    await expect(gamePage.page.locator('[role="dialog"]')).toBeVisible();

    await gamePage.page.keyboard.press("Escape");
    await gamePage.page.waitForTimeout(300);

    await expect(gamePage.page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test("とじるでメニューを閉じる", async ({ gamePage }) => {
    await gamePage.openMenu();

    // "とじる"まで移動（6番目の項目=5回ArrowDown）
    for (let i = 0; i < 5; i++) {
      await gamePage.page.keyboard.press("ArrowDown");
      await gamePage.page.waitForTimeout(100);
    }
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(300);

    await expect(gamePage.page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test("ポケモンを選択するとパーティ画面が表示される", async ({ gamePage }) => {
    await gamePage.openMenu();

    // "ポケモン"は最初の項目
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // パーティ画面のUI確認（てもちヘッダーが表示される）
    await expect(gamePage.page.locator("text=てもち")).toBeVisible();
  });
});
