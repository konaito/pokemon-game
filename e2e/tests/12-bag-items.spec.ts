import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave } from "../fixtures/save-data";

test.describe("バッグアイテム", () => {
  test.beforeEach(async ({ gamePage }) => {
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);
  });

  test("バッグ画面が表示される", async ({ gamePage }) => {
    await gamePage.openMenu();

    // "バッグ"は2番目の項目
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // カテゴリタブが表示される
    await expect(gamePage.page.locator("text=くすり")).toBeVisible();
  });

  test("カテゴリタブを切り替えられる", async ({ gamePage }) => {
    await gamePage.openMenu();
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // ArrowRightでカテゴリ切替
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(200);

    // ボールカテゴリのアイテムが表示される
    await expect(gamePage.page.getByRole("heading", { name: "モンスターボール" })).toBeVisible();
  });

  test("Escapeでバッグ画面を閉じる", async ({ gamePage }) => {
    await gamePage.openMenu();
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    await gamePage.page.keyboard.press("Escape");
    await gamePage.page.waitForTimeout(300);
  });
});
