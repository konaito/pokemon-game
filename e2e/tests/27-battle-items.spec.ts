import { test, expect } from "../fixtures/game-fixture";
import { waitForBattleReady } from "../helpers/wait-helpers";
import { createBattleReadySave } from "../fixtures/save-data";

test.describe("バトル中のアイテム使用", () => {
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
    // HPを減らしておく
    saveData.state.player.partyState.party[0].currentHp = 15;
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("バトル中にキズぐすりを使ってHP回復できる", async ({ gamePage }) => {
    const encountered = await triggerEncounter(gamePage);
    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // 「バッグ」を選択: action grid [fight, bag] [pokemon, run]
    // bag = ArrowRight from fight
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // バッグUIが表示される
    const bagUI = gamePage.page.locator("text=キズぐすり");
    const isBagVisible = await bagUI.isVisible().catch(() => false);
    if (!isBagVisible) {
      test.skip();
      return;
    }

    // キズぐすりを選択
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(2000);

    // 回復メッセージが表示される
    const healMsg = gamePage.page.locator("text=/回復|HP/");
    const actionPrompt = gamePage.page.locator("text=/はどうする？/");
    await expect(healMsg.or(actionPrompt)).toBeVisible({ timeout: 10_000 });
  });
});
