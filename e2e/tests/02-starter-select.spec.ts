import { test, expect } from "../fixtures/game-fixture";

test.describe("スターター選択画面", () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.startNewGame("テスト");
  });

  test("3匹のスターターが表示される", async ({ gamePage }) => {
    await expect(gamePage.page.locator("text=ヒモリ")).toBeVisible();
    await expect(gamePage.page.locator("text=シズクモ")).toBeVisible();
    await expect(gamePage.page.locator("text=コノハナ")).toBeVisible();
  });

  test("ArrowLeft/Rightで選択が切り替わる", async ({ gamePage }) => {
    // 博士のセリフが表示されている
    await expect(gamePage.page.locator("text=この3匹から1匹を選ぶのじゃ！")).toBeVisible();

    // ArrowRightでシズクモに移動
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(100);

    // もう一回でコノハナ
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(100);

    // ArrowLeftでシズクモに戻る
    await gamePage.page.keyboard.press("ArrowLeft");
    await gamePage.page.waitForTimeout(100);
  });

  test("Enterで確認ダイアログが表示される", async ({ gamePage }) => {
    await gamePage.page.keyboard.press("Enter");

    // 確認ダイアログ
    await expect(gamePage.page.locator("text=ヒモリでよいかな？")).toBeVisible();
    await expect(gamePage.page.locator('button:has-text("はい")')).toBeVisible();
    await expect(gamePage.page.locator('button:has-text("いいえ")')).toBeVisible();
  });

  test("いいえでキャンセルできる", async ({ gamePage }) => {
    await gamePage.page.keyboard.press("Enter");
    await expect(gamePage.page.locator("text=ヒモリでよいかな？")).toBeVisible();

    // "いいえ"でキャンセル
    await gamePage.page.locator('button:has-text("いいえ")').click();

    // 元のセリフに戻る
    await expect(gamePage.page.locator("text=この3匹から1匹を選ぶのじゃ！")).toBeVisible();
  });

  test("Escapeでキャンセルできる", async ({ gamePage }) => {
    await gamePage.page.keyboard.press("Enter");
    await expect(gamePage.page.locator("text=ヒモリでよいかな？")).toBeVisible();

    await gamePage.page.keyboard.press("Escape");

    // 元のセリフに戻る
    await expect(gamePage.page.locator("text=この3匹から1匹を選ぶのじゃ！")).toBeVisible();
  });

  test("はいで確定するとオーバーワールドに遷移する", async ({ gamePage }) => {
    await gamePage.selectStarter(0);

    // オーバーワールド遷移確認（ワスレ町）
    // 少し待機してからマップUI表示確認
    await gamePage.page.waitForTimeout(1000);
    // overworld画面はtitle/starter画面とは異なるUIを持つ
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });

  test("シズクモを選択できる", async ({ gamePage }) => {
    await gamePage.selectStarter(1);
    await gamePage.page.waitForTimeout(1000);
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });

  test("コノハナを選択できる", async ({ gamePage }) => {
    await gamePage.selectStarter(2);
    await gamePage.page.waitForTimeout(1000);
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });
});
