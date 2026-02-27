import { test, expect } from "../fixtures/game-fixture";
import { createPreLeagueSave } from "../fixtures/save-data";

test.describe("四天王 + チャンピオン", () => {
  test("バッジ8個のセーブデータが正常にロードされる", async ({ gamePage }) => {
    const saveData = createPreLeagueSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // オーバーワールドに遷移していること
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);

    // メニューでバッジ8個を確認
    await gamePage.openMenu();
    await expect(gamePage.page.locator("text=テスト")).toBeVisible();
    await expect(gamePage.page.locator("text=8")).toBeVisible();
  });
});
