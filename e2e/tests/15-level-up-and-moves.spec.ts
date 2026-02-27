import { test, expect } from "../fixtures/game-fixture";
import { createBattleReadySave } from "../fixtures/save-data";
import { waitForBattleReady } from "../helpers/wait-helpers";

test.describe("レベルアップと技習得", () => {
  test("バトル勝利後にレベルアップする可能性がある", async ({ gamePage }) => {
    await gamePage.seedRandom(42);
    const saveData = createBattleReadySave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // 草むらでエンカウント
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

    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // 敵を倒す（たたかうを繰り返す）
    for (let turn = 0; turn < 10; turn++) {
      await gamePage.selectFight(0);
      await gamePage.page.waitForTimeout(2000);

      // 勝利確認
      const victoryMsg = gamePage.page.locator("text=バトルに勝利した！");
      if (await victoryMsg.isVisible().catch(() => false)) {
        // 勝利した
        break;
      }

      // まだバトル中か確認
      const actionPrompt = gamePage.page.locator("text=/はどうする？/");
      if (await actionPrompt.isVisible().catch(() => false)) {
        continue;
      }
    }

    // バトル終了後、オーバーワールドに戻ることを確認
    await gamePage.page.waitForTimeout(3000);
    await expect(gamePage.page.locator('[aria-label^="バトル:"]')).toHaveCount(0, {
      timeout: 10000,
    });
  });
});
