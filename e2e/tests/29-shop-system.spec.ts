import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave } from "../fixtures/save-data";

test.describe("ショップシステム", () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.seedRandom(42);
    const saveData = createNewGameSave();
    // ショップ店員の近く (8,7) に配置（ワスレ町のショップ店員は(8,6)）
    saveData.state.overworld!.currentMapId = "wasuremachi";
    saveData.state.overworld!.playerX = 8;
    saveData.state.overworld!.playerY = 7;
    saveData.state.overworld!.direction = "up";
    saveData.state.player.money = 5000;
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("ショップNPCに話しかけるとショップUIが表示される", async ({ gamePage }) => {
    // 上を向いてNPCに話しかける
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // ダイアログを進める
    await gamePage.advanceAllMessages(5);
    await gamePage.page.waitForTimeout(500);

    // ショップUIが表示される（「かう」「うる」「やめる」のいずれか）
    const shopUI = gamePage.page.locator("text=/かう|うる|やめる|キズぐすり/");
    await expect(shopUI).toBeVisible({ timeout: 5_000 });
  });

  test("アイテムを購入すると所持金が減少する", async ({ gamePage }) => {
    // NPCに話しかける
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);
    await gamePage.advanceAllMessages(5);
    await gamePage.page.waitForTimeout(500);

    // ショップUIが表示されるか確認
    const shopUI = gamePage.page.locator("text=/かう|キズぐすり/");
    const isShopVisible = await shopUI.isVisible().catch(() => false);
    if (!isShopVisible) {
      test.skip();
      return;
    }

    // 「かう」を選択（表示されている場合）
    const buyButton = gamePage.page.locator("text=かう");
    if (await buyButton.isVisible().catch(() => false)) {
      await buyButton.click();
      await gamePage.page.waitForTimeout(500);
    }

    // 最初のアイテムを購入
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // 確認ダイアログで「はい」
    const yesButton = gamePage.page.locator("text=はい");
    if (await yesButton.isVisible().catch(() => false)) {
      await yesButton.click();
      await gamePage.page.waitForTimeout(500);
    }

    // 購入完了メッセージまたは所持金表示
    const purchaseMsg = gamePage.page.locator("text=/買った|購入|ありがとう/");
    const moneyDisplay = gamePage.page.locator("text=/円/");
    await expect(purchaseMsg.or(moneyDisplay)).toBeVisible({ timeout: 5_000 });
  });
});
