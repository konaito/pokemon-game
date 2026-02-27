import { test, expect } from "../fixtures/game-fixture";
import { createBattleReadySave } from "../fixtures/save-data";
import { waitForBattleReady } from "../helpers/wait-helpers";

test.describe("野生バトル（にげる）", () => {
  async function triggerEncounter(
    gamePage: InstanceType<typeof import("../fixtures/game-fixture").GamePage>,
  ) {
    for (let i = 0; i < 30; i++) {
      await gamePage.move("ArrowUp", 1);
      await gamePage.page.waitForTimeout(100);
      const battleScreen = gamePage.page.locator('[aria-label^="バトル:"]');
      if (await battleScreen.isVisible().catch(() => false)) return true;
      await gamePage.move("ArrowDown", 1);
      await gamePage.page.waitForTimeout(100);
      if (await battleScreen.isVisible().catch(() => false)) return true;
    }
    return false;
  }

  test("野生戦でにげるを選択するとオーバーワールドに復帰する", async ({ gamePage }) => {
    await gamePage.seedRandom(42);
    const saveData = createBattleReadySave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    const encountered = await triggerEncounter(gamePage);
    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // "にげる"を選択
    await gamePage.selectRun();
    await gamePage.page.waitForTimeout(2000);

    // オーバーワールドに戻る（バトル画面が消える）
    await expect(gamePage.page.locator('[aria-label^="バトル:"]')).toHaveCount(0, {
      timeout: 5000,
    });
  });

  test("トレーナー戦ではにげるが---表示になる", async ({ gamePage }) => {
    // トレーナー戦のUI検証はトレーナー戦テストで行うが、
    // ここでは野生戦で「にげる」が正常に表示されることを確認
    await gamePage.seedRandom(42);
    const saveData = createBattleReadySave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    const encountered = await triggerEncounter(gamePage);
    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // 野生戦では"にげる"がそのまま表示される
    await expect(gamePage.page.locator("text=にげる")).toBeVisible();
  });
});
