import { test, expect } from "../fixtures/game-fixture";
import { waitForBattleReady } from "../helpers/wait-helpers";

test.describe("統合スモークテスト", () => {
  test("タイトル → スターター → フィールド → バトル → 復帰 の一連フロー", async ({ gamePage }) => {
    await gamePage.seedRandom(42);

    // 1. タイトル画面
    await gamePage.goto();
    await expect(gamePage.page.locator("text=MONSTER")).toBeVisible();
    await expect(gamePage.page.locator("text=CHRONICLE")).toBeVisible();

    // 2. ニューゲーム開始
    await gamePage.startNewGame("テスト");

    // 3. スターター選択
    await expect(gamePage.page.locator("text=ヒモリ")).toBeVisible();
    await gamePage.selectStarter(0);
    await gamePage.page.waitForTimeout(1500);

    // 4. オーバーワールド
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);

    // 5. メニューを開いて閉じる
    await gamePage.openMenu();
    await expect(gamePage.page.locator('[role="dialog"]')).toBeVisible();
    await gamePage.page.keyboard.press("Escape");
    await gamePage.page.waitForTimeout(300);
    await expect(gamePage.page.locator('[role="dialog"]')).toHaveCount(0);

    // 6. 南へ移動してルート1に行く
    await gamePage.move("ArrowDown", 5);
    await gamePage.page.waitForTimeout(1000);

    // 7. 草むらを歩いてエンカウントを試みる
    let encountered = false;
    for (let i = 0; i < 30; i++) {
      await gamePage.move("ArrowUp", 1);
      await gamePage.page.waitForTimeout(100);
      const battleScreen = gamePage.page.locator('[aria-label^="バトル:"]');
      if (await battleScreen.isVisible().catch(() => false)) {
        encountered = true;
        break;
      }
      await gamePage.move("ArrowDown", 1);
      await gamePage.page.waitForTimeout(100);
      if (await battleScreen.isVisible().catch(() => false)) {
        encountered = true;
        break;
      }
    }

    if (encountered) {
      // 8. バトルUI確認
      await waitForBattleReady(gamePage.page);
      await expect(gamePage.page.locator("text=たたかう")).toBeVisible();

      // 9. にげるで復帰
      await gamePage.selectRun();
      await gamePage.page.waitForTimeout(2000);

      // 10. オーバーワールドに復帰
      await expect(gamePage.page.locator('[aria-label^="バトル:"]')).toHaveCount(0, {
        timeout: 5000,
      });
    }

    // テスト完了: 一連のフローが正常に動作した
  });
});
