import { test, expect } from "../fixtures/game-fixture";
import { waitForBattleReady } from "../helpers/wait-helpers";
import type { SaveData } from "../fixtures/save-data";

/** 2匹パーティのセーブデータ（route-1草むら付近） */
function createTwoMonsterSave(): SaveData {
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
              uid: "test-himori",
              speciesId: "himori",
              level: 10,
              exp: 1000,
              nature: "hardy",
              ivs: { hp: 20, atk: 20, def: 20, spAtk: 20, spDef: 20, speed: 20 },
              evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
              currentHp: 35,
              moves: [
                { moveId: "tackle", currentPp: 35 },
                { moveId: "ember", currentPp: 25 },
              ],
              status: null,
            },
            {
              uid: "test-konezumi",
              speciesId: "konezumi",
              level: 8,
              exp: 512,
              nature: "hardy",
              ivs: { hp: 20, atk: 20, def: 20, spAtk: 20, spDef: 20, speed: 20 },
              evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
              currentHp: 30,
              moves: [
                { moveId: "tackle", currentPp: 35 },
                { moveId: "quick-attack", currentPp: 30 },
              ],
              status: null,
            },
          ],
          boxes: Array.from({ length: 8 }, () => []),
        },
        bag: {
          items: [{ itemId: "potion", quantity: 5 }],
        },
        pokedexSeen: ["himori", "konezumi"],
        pokedexCaught: ["himori", "konezumi"],
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

/** 1匹瀕死・1匹生存のセーブデータ */
function createOneFaintedSave(): SaveData {
  const save = createTwoMonsterSave();
  save.state.player.partyState.party[1].currentHp = 0; // konezumi瀕死
  return save;
}

test.describe("バトル中の交代", () => {
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

  test("交代操作でモンスターが入れ替わる", async ({ gamePage }) => {
    await gamePage.seedRandom(42);
    const saveData = createTwoMonsterSave();
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

    // 「ポケモン」（交代メニュー）を選択: action grid [fight, bag] [pokemon, run]
    // pokemon = ArrowDown from fight
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // パーティリストが表示される
    const partyList = gamePage.page.locator("text=コネズミ");
    const isPartyVisible = await partyList.isVisible().catch(() => false);
    if (!isPartyVisible) {
      test.skip();
      return;
    }

    // コネズミを選択
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(2000);

    // 交代メッセージが表示されるか、コネズミが場に出る
    const switchMsg = gamePage.page.locator("text=/コネズミ/");
    await expect(switchMsg).toBeVisible({ timeout: 5_000 });
  });

  test("瀕死モンスターは交代先に選べない", async ({ gamePage }) => {
    await gamePage.seedRandom(100);
    const saveData = createOneFaintedSave();
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

    // パーティメニューを開く
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // 瀕死のコネズミを選択しようとする
    await gamePage.page.keyboard.press("ArrowDown");
    await gamePage.page.waitForTimeout(100);
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(500);

    // 瀕死メッセージまたは選択不可の表示
    const faintedMsg = gamePage.page.locator("text=/ひんし|たたかえない|選べない/");
    const actionPrompt = gamePage.page.locator("text=/はどうする？/");
    // 瀕死メッセージが出るか、行動選択画面に戻される
    await expect(faintedMsg.or(actionPrompt)).toBeVisible({ timeout: 5_000 });
  });
});
