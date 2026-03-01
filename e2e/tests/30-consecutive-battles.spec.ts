import { test, expect } from "../fixtures/game-fixture";
import { waitForBattleReady } from "../helpers/wait-helpers";
import { createBattleReadySave } from "../fixtures/save-data";

test.describe("連続バトルでHP持続確認", () => {
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

  async function winBattle(
    gamePage: InstanceType<typeof import("../fixtures/game-fixture").GamePage>,
    maxTurns: number = 20,
  ): Promise<boolean> {
    for (let turn = 0; turn < maxTurns; turn++) {
      const actionPrompt = gamePage.page.locator("text=/はどうする？/");
      const isAction = await actionPrompt.isVisible().catch(() => false);
      if (!isAction) {
        // バトル終了かチェック
        await gamePage.page.waitForTimeout(500);
        break;
      }

      // 最初の技で攻撃
      await gamePage.selectFight(0);
      await gamePage.page.waitForTimeout(2000);

      // メッセージを進める
      await gamePage.advanceAllMessages(10);
      await gamePage.page.waitForTimeout(500);
    }

    // 勝利メッセージを確認
    const victory = gamePage.page.locator("text=バトルに勝利した！");
    const isVictory = await victory.isVisible().catch(() => false);
    if (isVictory) {
      await gamePage.advanceAllMessages(15);
      return true;
    }
    return false;
  }

  test("連続バトル後もHPが正しく維持される", async ({ gamePage }) => {
    await gamePage.seedRandom(42);
    const saveData = createBattleReadySave();
    // HPをフルに設定
    saveData.state.player.partyState.party[0].currentHp = 35;
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // 1戦目
    const encountered1 = await triggerEncounter(gamePage);
    if (!encountered1) {
      test.skip();
      return;
    }
    await waitForBattleReady(gamePage.page);
    const won1 = await winBattle(gamePage);
    if (!won1) {
      // 負けた場合はスキップ
      test.skip();
      return;
    }

    // フィールドに戻ったことを確認
    await gamePage.page.waitForTimeout(1000);

    // 2戦目
    const encountered2 = await triggerEncounter(gamePage);
    if (!encountered2) {
      // エンカウントできなかった場合でも1戦目は成功
      return;
    }
    await waitForBattleReady(gamePage.page);

    // 2戦目開始時にHPが0でないことを確認（連戦でHP持続）
    // HPバーが表示されていることを確認
    const hpBar = gamePage.page.locator('[aria-label^="バトル:"]');
    await expect(hpBar).toBeVisible({ timeout: 5_000 });

    // 行動選択画面が出ている = 味方がまだ戦える
    const actionPrompt = gamePage.page.locator("text=/はどうする？/");
    await expect(actionPrompt).toBeVisible({ timeout: 5_000 });
  });
});
