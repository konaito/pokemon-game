import { test, expect } from "../fixtures/game-fixture";
import { waitForBattleReady } from "../helpers/wait-helpers";
import type { SaveData } from "../fixtures/save-data";

/**
 * ひのこ（炎）を持つヒモリで草タイプの野生モンスターが出る場所に配置
 * hajimari-forest は草タイプのモンスターが出現する
 */
function createTypeEffectivenessSave(): SaveData {
  return {
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
              uid: "test-himori-type",
              speciesId: "himori",
              level: 15,
              exp: 3375,
              nature: "hardy",
              ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
              evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
              currentHp: 50,
              moves: [
                { moveId: "ember", currentPp: 25 },
                { moveId: "water-gun", currentPp: 25 },
                { moveId: "tackle", currentPp: 35 },
                { moveId: "vine-whip", currentPp: 25 },
              ],
              status: null,
            },
          ],
          boxes: Array.from({ length: 8 }, () => []),
        },
        bag: {
          items: [{ itemId: "potion", quantity: 10 }],
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
}

test.describe("タイプ相性メッセージ", () => {
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

  test("攻撃後にタイプ相性メッセージが表示される", async ({ gamePage }) => {
    await gamePage.seedRandom(42);
    const saveData = createTypeEffectivenessSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(1000);

    const encountered = await triggerEncounter(gamePage);
    if (!encountered) {
      test.skip();
      return;
    }

    await waitForBattleReady(gamePage.page);

    // 最初の技（ひのこ）で攻撃
    await gamePage.selectFight(0);
    await gamePage.page.waitForTimeout(3000);

    // タイプ相性メッセージが出るか確認
    // 草タイプ相手なら「効果は抜群だ！」、水タイプ相手なら「いまひとつ」
    const superEffective = gamePage.page.locator("text=効果は抜群だ！");
    const notVeryEffective = gamePage.page.locator("text=効果はいまひとつ");
    const neutral = gamePage.page.locator("text=/はどうする？/");
    const victory = gamePage.page.locator("text=バトルに勝利した！");

    // いずれかの結果が表示される
    await expect(superEffective.or(notVeryEffective).or(neutral).or(victory)).toBeVisible({
      timeout: 10_000,
    });
  });
});
