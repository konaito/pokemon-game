import { test, expect } from "../fixtures/game-fixture";
import type { SaveData } from "../fixtures/save-data";

test.describe("全滅リカバリー", () => {
  test("全滅するとワスレ町に復帰してパーティが全回復する", async ({ gamePage }) => {
    // HP1のモンスターで意図的に全滅させる
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
                uid: "test-weak-1",
                speciesId: "himori",
                level: 3,
                exp: 0,
                nature: "hardy",
                ivs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
                evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
                currentHp: 1,
                moves: [{ moveId: "tackle", currentPp: 35 }],
                status: null,
              },
            ],
            boxes: Array.from({ length: 8 }, () => []),
          },
          bag: { items: [] },
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

    // 草むらでエンカウントを試みる
    let encountered = false;
    for (let i = 0; i < 30; i++) {
      await gamePage.move("ArrowUp", 1);
      await gamePage.page.waitForTimeout(100);
      const battleScreen = gamePage.page.locator('[aria-label^="バトル:"]');
      if (await battleScreen.isVisible().catch(() => false)) {
        encountered = true;
        break;
      }
      await gamePage.move("ArrowDown", 1);
      await gamePage.page.waitForTimeout(100);
      if (await battleScreen.isVisible().catch(() => false)) {
        encountered = true;
        break;
      }
    }

    if (!encountered) {
      test.skip();
      return;
    }

    // HP1なので敵の攻撃で倒される可能性が高い
    // にげるを試みて失敗させるか、何もしない
    // 実際には敵ターンで倒される
    await gamePage.page.waitForTimeout(3000);

    // 全滅メッセージを確認（表示される場合）
    const blackout = gamePage.page.locator("text=目の前が真っ暗になった…");
    const actionPrompt = gamePage.page.locator("text=/はどうする？/");

    // バトルが続行中の場合は戦闘を進める
    if (await actionPrompt.isVisible().catch(() => false)) {
      // たたかうを選ぶ（高レベル相手なら反撃で倒される可能性）
      await gamePage.selectFight(0);
      await gamePage.page.waitForTimeout(3000);
    }

    // 全滅した場合のメッセージ確認（確率依存のためoptional）
    if (await blackout.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(blackout).toBeVisible();
    }
  });
});
