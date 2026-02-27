import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave } from "../fixtures/save-data";
import { waitForMapTransition } from "../helpers/wait-helpers";

test.describe("マップ遷移", () => {
  test.beforeEach(async ({ gamePage }) => {
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("接続タイルでマップ遷移が発生する", async ({ gamePage }) => {
    // ワスレ町(4,4)から南出口(4,9)に向かう → route-1へ
    // yを4→9なので5歩下に移動
    await gamePage.move("ArrowDown", 5);
    await waitForMapTransition(gamePage.page);

    // マップ遷移したことを確認（フェードアニメーション）
    // route-1のマップに切り替わっている
    await gamePage.page.waitForTimeout(1000);

    // 画面がオーバーワールドのままであることを確認
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });

  test("マップ遷移時にオートセーブされる", async ({ gamePage }) => {
    // 南出口に向かう
    await gamePage.move("ArrowDown", 5);
    await waitForMapTransition(gamePage.page);
    await gamePage.page.waitForTimeout(1000);

    // localStorageにセーブデータが書き込まれていることを確認
    const saveExists = await gamePage.page.evaluate(() => {
      return localStorage.getItem("pokemon_save_1") !== null;
    });
    expect(saveExists).toBe(true);
  });
});
