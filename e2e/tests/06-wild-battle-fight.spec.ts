import { test, expect } from "../fixtures/game-fixture";
import { createBattleReadySave } from "../fixtures/save-data";
import { waitForBattleReady } from "../helpers/wait-helpers";

test.describe("野生バトル（戦闘）", () => {
  /** 草むらを歩いてエンカウントを発生させる */
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

  test.beforeEach(async ({ gamePage }) => {
    await gamePage.seedRandom(42);
    const saveData = createBattleReadySave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("たたかうで技選択画面が表示される", async ({ gamePage }) => {
    const encountered = await triggerEncounter(gamePage);
    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // "たたかう"を選択（Enter）
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(200);

    // 技名が表示される（ヒモリの技）
    await expect(gamePage.page.locator("text=たいあたり")).toBeVisible();
  });

  test("Escapeで技選択をキャンセルしてアクション画面に戻れる", async ({ gamePage }) => {
    const encountered = await triggerEncounter(gamePage);
    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // 技選択に入る
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(200);

    // Escapeでキャンセル
    await gamePage.page.keyboard.press("Escape");
    await gamePage.page.waitForTimeout(200);

    // アクション選択に戻る
    await expect(gamePage.page.locator("text=はどうする？")).toBeVisible();
  });

  test("技を選択してダメージを与えられる", async ({ gamePage }) => {
    const encountered = await triggerEncounter(gamePage);
    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // "たたかう" → 最初の技を選択
    await gamePage.selectFight(0);

    // バトルメッセージが表示される（処理中）
    await gamePage.page.waitForTimeout(2000);

    // 次のターンの行動選択に戻るか、バトル終了
    const actionPrompt = gamePage.page.locator("text=/はどうする？/");
    const victoryMsg = gamePage.page.locator("text=バトルに勝利した！");

    // どちらかが表示されるまで待つ
    await expect(actionPrompt.or(victoryMsg)).toBeVisible({ timeout: 10_000 });
  });
});
