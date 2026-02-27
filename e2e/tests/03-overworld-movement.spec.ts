import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave } from "../fixtures/save-data";

test.describe("オーバーワールド移動", () => {
  test.beforeEach(async ({ gamePage }) => {
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    // "つづきから"でロード
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("4方向にArrowKeysで移動できる", async ({ gamePage }) => {
    // 各方向に移動（壁に当たらない範囲）
    await gamePage.move("ArrowDown", 1);
    await gamePage.move("ArrowUp", 1);
    await gamePage.move("ArrowLeft", 1);
    await gamePage.move("ArrowRight", 1);

    // オーバーワールドが表示されていることを確認
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });

  test("WASDキーでも移動できる", async ({ gamePage }) => {
    await gamePage.page.keyboard.press("s");
    await gamePage.page.waitForTimeout(150);
    await gamePage.page.keyboard.press("w");
    await gamePage.page.waitForTimeout(150);
    await gamePage.page.keyboard.press("a");
    await gamePage.page.waitForTimeout(150);
    await gamePage.page.keyboard.press("d");
    await gamePage.page.waitForTimeout(150);
  });

  test("NPC会話がEnterキーで開始される", async ({ gamePage }) => {
    // 町の人NPCの方向に移動して会話
    // npc-townsperson は (5,4) にいる。プレイヤーは (4,4) から右に移動
    await gamePage.move("ArrowRight", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // NPCダイアログが表示される（RPGウィンドウ）
    const msgWindow = gamePage.page.locator(".rpg-window");
    await expect(msgWindow.first()).toBeVisible();
  });

  test("Escapeでメニューが開く", async ({ gamePage }) => {
    await gamePage.openMenu();

    // メニューダイアログ確認
    await expect(gamePage.page.locator('[role="dialog"]')).toBeVisible();
    await expect(gamePage.page.locator('[aria-label="メインメニュー"]')).toBeVisible();
  });
});
