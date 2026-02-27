import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave } from "../fixtures/save-data";

test.describe("タイトル画面 + ニューゲーム", () => {
  test("タイトル画面が表示される", async ({ gamePage }) => {
    await gamePage.goto();

    // タイトルテキストの存在確認
    await expect(gamePage.page.locator("text=MONSTER")).toBeVisible();
    await expect(gamePage.page.locator("text=CHRONICLE")).toBeVisible();
    await expect(gamePage.page.locator("text=PRESS ENTER")).toBeVisible();

    // aria-label確認
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toBeVisible();
  });

  test("タイトルアニメーションが段階表示される", async ({ gamePage }) => {
    await gamePage.page.goto("/");

    // Phase 0: 初期状態ではMONSTERがまだ非表示（opacity:0）
    // Phase 1 (300ms後): MONSTER表示
    await gamePage.page.waitForTimeout(400);
    await expect(gamePage.page.locator("h1:has-text('MONSTER')")).toBeVisible();

    // Phase 2 (800ms後): CHRONICLE表示
    await gamePage.page.waitForTimeout(500);
    await expect(gamePage.page.locator("h2:has-text('CHRONICLE')")).toBeVisible();

    // Phase 3 (1400ms後): PRESS ENTER表示
    await gamePage.page.waitForTimeout(700);
    await expect(gamePage.page.locator("text=PRESS ENTER")).toBeVisible();
  });

  test("はじめからを選択して名前入力フォームが表示される", async ({ gamePage }) => {
    await gamePage.goto();

    // "はじめから"選択
    await gamePage.page.locator('button:has-text("はじめから")').click();

    // 名前入力フォーム
    await expect(gamePage.page.locator('input[placeholder="なまえ"]')).toBeVisible();
    await expect(gamePage.page.locator('button:has-text("けってい")')).toBeVisible();
    await expect(gamePage.page.locator('button:has-text("もどる")')).toBeVisible();
  });

  test("名前入力で1-8文字の制限が機能する", async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.page.locator('button:has-text("はじめから")').click();

    const nameInput = gamePage.page.locator('input[placeholder="なまえ"]');
    const submitBtn = gamePage.page.locator('button:has-text("けってい")');

    // 空白名では送信不可（disabled）
    await expect(submitBtn).toBeDisabled();

    // 名前入力後はdisabledが解除される
    await nameInput.fill("テスト");
    await expect(submitBtn).toBeEnabled();

    // maxLength=8 の確認
    await expect(nameInput).toHaveAttribute("maxLength", "8");
  });

  test("名前入力後にスターター選択画面に遷移する", async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.startNewGame("サトシ");

    // スターター選択画面のUI確認
    await expect(gamePage.page.locator("text=ヒモリ")).toBeVisible();
    await expect(gamePage.page.locator("text=シズクモ")).toBeVisible();
    await expect(gamePage.page.locator("text=コノハナ")).toBeVisible();
  });

  test("もどるボタンでキャンセルできる", async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.page.locator('button:has-text("はじめから")').click();
    await expect(gamePage.page.locator('input[placeholder="なまえ"]')).toBeVisible();

    // "もどる"でキャンセル
    await gamePage.page.locator('button:has-text("もどる")').click();

    // メニューに戻る
    await expect(gamePage.page.locator('button:has-text("はじめから")')).toBeVisible();
  });

  test("セーブデータなし時につづきからが非表示", async ({ gamePage }) => {
    await gamePage.page.goto("/");
    await gamePage.page.evaluate(() => {
      for (let i = 0; i < 3; i++) {
        localStorage.removeItem(`pokemon_save_${i}`);
      }
    });
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });

    // "つづきから"が非表示
    await expect(gamePage.page.locator('button:has-text("つづきから")')).toHaveCount(0);
  });

  test("セーブデータあり時につづきからが表示される", async ({ gamePage }) => {
    await gamePage.page.goto("/");
    const saveData = createNewGameSave();
    await gamePage.injectSaveData(saveData, 1);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });

    // "つづきから"が表示される
    await expect(gamePage.page.locator('button:has-text("つづきから")')).toBeVisible();
  });
});
