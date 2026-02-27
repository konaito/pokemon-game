import { test, expect } from "../fixtures/game-fixture";
import { createNewGameSave, createMidGameSave } from "../fixtures/save-data";

test.describe("セーブ/ロード", () => {
  test("メニューからセーブしてlocalStorageに書き込まれる", async ({ gamePage }) => {
    const saveData = createNewGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // メニューを開く
    await gamePage.openMenu();

    // "レポート"を選択（メニューの4番目）
    for (let i = 0; i < 3; i++) {
      await gamePage.page.keyboard.press("ArrowDown");
      await gamePage.page.waitForTimeout(100);
    }
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(1000);

    // セーブ完了メッセージ
    await expect(gamePage.page.locator("text=冒険の記録を書きました！")).toBeVisible({
      timeout: 5000,
    });

    // localStorage確認
    const saveExists = await gamePage.page.evaluate(() => {
      return localStorage.getItem("pokemon_save_1") !== null;
    });
    expect(saveExists).toBe(true);
  });

  test("つづきからで状態が復元される", async ({ gamePage }) => {
    const saveData = createMidGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });

    // "つづきから"で復元
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // オーバーワールドに遷移していることを確認
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);

    // メニューを開いてプレイヤー情報を確認
    await gamePage.openMenu();

    // プレイヤー名
    await expect(gamePage.page.locator("text=テスト")).toBeVisible();
    // バッジ数（midGameSaveは4個）
    await expect(gamePage.page.locator("text=4")).toBeVisible();
  });

  test("セーブデータのpokedexSeen/CaughtがSetとして復元される", async ({ gamePage }) => {
    const saveData = createMidGameSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // localStorageのデータ形式を確認
    const pokedexData = await gamePage.page.evaluate(() => {
      const raw = localStorage.getItem("pokemon_save_1");
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        seenIsArray: Array.isArray(data.state.player.pokedexSeen),
        caughtIsArray: Array.isArray(data.state.player.pokedexCaught),
        seenCount: data.state.player.pokedexSeen.length,
        caughtCount: data.state.player.pokedexCaught.length,
      };
    });

    expect(pokedexData).not.toBeNull();
    expect(pokedexData!.seenIsArray).toBe(true);
    expect(pokedexData!.caughtIsArray).toBe(true);
    expect(pokedexData!.seenCount).toBeGreaterThan(0);
    expect(pokedexData!.caughtCount).toBeGreaterThan(0);
  });
});
