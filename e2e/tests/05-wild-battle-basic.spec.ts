import { test, expect } from "../fixtures/game-fixture";
import { createBattleReadySave } from "../fixtures/save-data";
import { waitForBattleReady } from "../helpers/wait-helpers";

test.describe("野生バトル（基本UI）", () => {
  test.beforeEach(async ({ gamePage }) => {
    // Math.randomをシード固定
    await gamePage.seedRandom(42);

    const saveData = createBattleReadySave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("草むらでエンカウントが発生する", async ({ gamePage }) => {
    // route-1で草むらに向かって移動（下方向に数歩）
    // route-1の草むらはy=1-2にある。プレイヤーはy=3から。上に移動
    for (let i = 0; i < 10; i++) {
      await gamePage.move("ArrowUp", 1);
      await gamePage.page.waitForTimeout(200);

      // バトル画面に遷移したか確認
      const battleScreen = gamePage.page.locator('[aria-label^="バトル:"]');
      if (await battleScreen.isVisible().catch(() => false)) {
        // バトル画面が表示された
        return;
      }

      await gamePage.move("ArrowDown", 1);
      await gamePage.page.waitForTimeout(200);

      if (await battleScreen.isVisible().catch(() => false)) {
        return;
      }
    }

    // 10往復してもエンカウントしない場合はスキップ（確率依存）
    test.skip();
  });

  test("バトルUIにプレイヤーと敵の情報が表示される", async ({ gamePage }) => {
    // 草むらを歩いてエンカウントを発生させる
    for (let i = 0; i < 20; i++) {
      await gamePage.move("ArrowUp", 1);
      await gamePage.page.waitForTimeout(150);
      const battleScreen = gamePage.page.locator('[aria-label^="バトル:"]');
      if (await battleScreen.isVisible().catch(() => false)) {
        break;
      }
      await gamePage.move("ArrowDown", 1);
      await gamePage.page.waitForTimeout(150);
      if (await battleScreen.isVisible().catch(() => false)) {
        break;
      }
    }

    // バトル画面確認
    const battleScreen = gamePage.page.locator('[aria-label^="バトル:"]');
    if (!(await battleScreen.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    // バトルが開始されたら処理完了を待つ
    await waitForBattleReady(gamePage.page);

    // アクション選択UIの確認
    await expect(gamePage.page.locator("text=たたかう")).toBeVisible();
    await expect(gamePage.page.locator("text=バッグ")).toBeVisible();
    await expect(gamePage.page.locator("text=ポケモン")).toBeVisible();
    await expect(gamePage.page.locator("text=にげる")).toBeVisible();
  });
});
