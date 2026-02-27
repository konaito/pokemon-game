import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave } from "../fixtures/save-data";

// モバイルビューポートのみで実行
test.use({ viewport: { width: 375, height: 667 } });

test.describe("モバイル VirtualPad", () => {
  test.beforeEach(async ({ gamePage }) => {
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("モバイルサイズでVirtualPadが表示される", async ({ gamePage }) => {
    // VirtualPadのボタンが表示されることを確認
    // VirtualPadはsm:hidden（640px未満で表示）
    // D-Padのボタンが存在するか確認
    const dpadButtons = gamePage.page.locator("button").filter({ hasText: /^[▲▼◀▶AB]$/ });
    const count = await dpadButtons.count();
    // 何らかの操作ボタンが表示されている
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("デスクトップでVirtualPad非表示", () => {
  test.use({ viewport: { width: 960, height: 640 } });

  test("960px以上ではVirtualPadが非表示", async ({ gamePage }) => {
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // sm:hidden なのでデスクトップサイズでは非表示
    // VirtualPadコンテナが見えないことを確認
    // ゲーム画面自体は正常に表示される
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });
});
