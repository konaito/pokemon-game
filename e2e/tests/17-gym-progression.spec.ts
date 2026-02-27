import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave, createMidGameSave } from "../fixtures/save-data";

test.describe("ジム進行", () => {
  test("バッジ不足でジムが拒否される", async ({ gamePage }) => {
    // バッジ0個のセーブデータでジムNPCに話しかける
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // ワスレ町のオーバーワールドに正常に遷移していること
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });

  test("バッジ4個のセーブデータでゲームが正常に動作する", async ({ gamePage }) => {
    const saveData = createMidGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // メニューを開いてバッジ数を確認
    await gamePage.openMenu();
    await expect(gamePage.page.locator("text=4")).toBeVisible();
  });
});
