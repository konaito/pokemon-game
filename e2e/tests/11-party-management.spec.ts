import { test, expect } from "../fixtures/game-fixture";
import { createMidGameSave } from "../fixtures/save-data";

test.describe("パーティ管理", () => {
  test.beforeEach(async ({ gamePage }) => {
    const saveData = createMidGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("パーティ情報が表示される", async ({ gamePage }) => {
    await gamePage.openMenu();
    // "ポケモン"を選択
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // パーティ画面ヘッダーの表示確認
    await expect(gamePage.page.locator("text=てもち")).toBeVisible();
    // パーティメンバーのボタンが存在する
    await expect(gamePage.page.locator("button").filter({ hasText: "ヒノモリ" })).toBeVisible();
    await expect(gamePage.page.locator("button").filter({ hasText: "オオネズミ" })).toBeVisible();
  });

  test("Escapeでパーティ画面を閉じる", async ({ gamePage }) => {
    await gamePage.openMenu();
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    await gamePage.page.keyboard.press("Escape");
    await gamePage.page.waitForTimeout(300);

    // パーティ画面のヘッダーが消える
    await expect(gamePage.page.locator("text=てもち")).toHaveCount(0);
  });
});
