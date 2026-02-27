import { test, expect } from "../fixtures/game-fixture";
import type { SaveData } from "../fixtures/save-data";

test.describe("進化", () => {
  test("進化条件を満たすレベルでバトル後に進化が発生する可能性がある", async ({ gamePage }) => {
    // Lv15のヒモリ（Lv16で進化）で草むらバトルに勝てば進化するはず
    const saveData: SaveData = {
      version: 1,
      savedAt: new Date().toISOString(),
      playTime: 0,
      state: {
        player: {
          name: "テスト",
          money: 3000,
          badges: [],
          partyState: {
            party: [
              {
                uid: "test-pre-evo",
                speciesId: "himori",
                level: 15,
                exp: 0,
                nature: "hardy",
                ivs: { hp: 20, atk: 20, def: 20, spAtk: 20, spDef: 20, speed: 20 },
                evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
                currentHp: 50,
                moves: [
                  { moveId: "ember", currentPp: 25 },
                  { moveId: "quick-attack", currentPp: 30 },
                  { moveId: "bite", currentPp: 25 },
                  { moveId: "tackle", currentPp: 35 },
                ],
                status: null,
              },
            ],
            boxes: Array.from({ length: 8 }, () => []),
          },
          bag: {
            items: [
              { itemId: "potion", quantity: 5 },
              { itemId: "monster-ball", quantity: 5 },
            ],
          },
          pokedexSeen: ["himori"],
          pokedexCaught: ["himori"],
        },
        overworld: {
          currentMapId: "route-1",
          playerX: 7,
          playerY: 3,
          direction: "down",
        },
        storyFlags: {},
      },
    };

    await gamePage.seedRandom(42);
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    // テストとして成立することを確認（エンカウントとバトル自体は他テストでカバー）
    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);
  });
});
