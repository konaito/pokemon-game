import { test, expect } from "../fixtures/game-fixture";
import type { Page } from "@playwright/test";
import type { SaveData, SaveMonsterInstance } from "../fixtures/save-data";
import type { GamePage } from "../fixtures/game-fixture";
import path from "path";

/**
 * ゲームクリアテスト
 * ポケモンリーグ（四天王4人 + チャンピオン）を連戦で撃破し、
 * エンディングまで到達することを検証する
 */

const SCREENSHOT_DIR = path.resolve("test-screenshots");

/** Lv99の最強パーティを生成 */
function createOverpoweredParty(): SaveMonsterInstance[] {
  return [
    {
      uid: "clear-test-enjuu",
      speciesId: "enjuu",
      level: 99,
      exp: 0,
      nature: "adamant",
      ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
      evs: { hp: 252, atk: 252, def: 0, spAtk: 0, spDef: 0, speed: 252 },
      currentHp: 400,
      moves: [
        { moveId: "flame-wheel", currentPp: 25 },
        { moveId: "double-kick", currentPp: 30 },
        { moveId: "bite", currentPp: 25 },
        { moveId: "quick-attack", currentPp: 30 },
      ],
      status: null,
    },
    {
      uid: "clear-test-taikaiou",
      speciesId: "taikaiou",
      level: 99,
      exp: 0,
      nature: "modest",
      ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
      evs: { hp: 252, atk: 0, def: 0, spAtk: 252, spDef: 0, speed: 252 },
      currentHp: 380,
      moves: [
        { moveId: "water-pulse", currentPp: 20 },
        { moveId: "water-gun", currentPp: 25 },
        { moveId: "quick-attack", currentPp: 30 },
        { moveId: "bubble", currentPp: 30 },
      ],
      status: null,
    },
  ];
}

function createLeagueSave(): SaveData {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    playTime: 36000,
    state: {
      player: {
        name: "テスト",
        money: 99999,
        badges: [
          "シズマリバッジ",
          "モリノハバッジ",
          "イナヅマバッジ",
          "カガリバッジ",
          "ゴウキバッジ",
          "キリフリバッジ",
          "フユハバッジ",
          "タツミバッジ",
        ],
        partyState: {
          party: createOverpoweredParty(),
          boxes: Array.from({ length: 8 }, () => []),
        },
        bag: {
          items: [
            { itemId: "hyper-potion", quantity: 99 },
            { itemId: "full-restore", quantity: 99 },
            { itemId: "hyper-ball", quantity: 99 },
          ],
        },
        pokedexSeen: ["himori", "hinomori", "enjuu", "shizukumo", "namikozou", "taikaiou"],
        pokedexCaught: ["himori", "hinomori", "enjuu", "shizukumo", "namikozou", "taikaiou"],
      },
      overworld: {
        currentMapId: "pokemon-league",
        playerX: 5,
        playerY: 8,
        direction: "up",
      },
      storyFlags: {
        gym1_cleared: true,
        gym2_cleared: true,
        gym3_cleared: true,
        gym4_cleared: true,
        gym5_cleared: true,
        gym6_cleared: true,
        gym7_cleared: true,
        gym8_cleared: true,
      },
    },
  };
}

type TestPage = Page;
type TestGamePage = GamePage;

let screenshotIndex = 0;

/** 連番スクリーンショット */
async function snap(page: TestPage, label: string): Promise<void> {
  const idx = String(screenshotIndex++).padStart(3, "0");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${idx}-${label}.png`),
  });
}

/**
 * バトル後のトレーナーイベント（勝利台詞 + set_flag）を完全に消化する
 */
async function consumePostBattleDialogues(
  page: TestPage,
  timeoutMs: number = 30_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const inBattle = await page
      .locator('[aria-label^="バトル:"]')
      .isVisible()
      .catch(() => false);
    if (!inBattle) break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
  }

  let dialogueAppeared = false;
  for (let i = 0; i < 10; i++) {
    const hasMessage = await page
      .locator('[aria-label="メッセージウィンドウ"]')
      .isVisible()
      .catch(() => false);
    if (hasMessage) {
      dialogueAppeared = true;
      break;
    }
    await page.waitForTimeout(300);
  }

  if (dialogueAppeared) {
    while (Date.now() < deadline) {
      const hasMessage = await page
        .locator('[aria-label="メッセージウィンドウ"]')
        .isVisible()
        .catch(() => false);
      if (!hasMessage) {
        await page.waitForTimeout(800);
        const hasMessage2 = await page
          .locator('[aria-label="メッセージウィンドウ"]')
          .isVisible()
          .catch(() => false);
        if (!hasMessage2) break;
      }
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
    }
  }

  await page.waitForTimeout(1000);
}

/** バトルを自動で勝利（途中スクリーンショット付き） */
async function winBattle(
  gamePage: TestGamePage,
  battleName: string,
  maxTurns: number = 50,
): Promise<void> {
  const page = gamePage.page;
  let firstTurn = true;

  for (let turn = 0; turn < maxTurns; turn++) {
    const inBattle = await page
      .locator('[aria-label^="バトル:"]')
      .isVisible()
      .catch(() => false);
    if (!inBattle) return;

    // モンスター交代選択画面
    const partySelectHeading = page.getByRole("heading", {
      name: "モンスターを選んでください",
    });
    const needsSwitch = await partySelectHeading.isVisible().catch(() => false);
    if (needsSwitch) {
      await snap(page, `${battleName}-交代選択`);
      const allButtons = page.locator('button:has-text("Lv.")');
      const buttonCount = await allButtons.count();
      for (let bi = 0; bi < buttonCount; bi++) {
        const btnText = (await allButtons.nth(bi).textContent()) ?? "";
        if (btnText.includes("HP") && /HP\s*0\s*\//.test(btnText)) continue;
        await allButtons.nth(bi).click();
        await page.waitForTimeout(1500);
        break;
      }
      continue;
    }

    const isActionVisible = await page
      .locator("text=/はどうする？/")
      .waitFor({ state: "visible", timeout: 8_000 })
      .then(() => true)
      .catch(() => false);

    if (isActionVisible) {
      // 最初のターンだけスクリーンショット
      if (firstTurn) {
        await snap(page, `${battleName}-バトル開始`);
        firstTurn = false;
      }
      await gamePage.selectFight(0);
      await page.waitForTimeout(1500);
    } else {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
    }
  }
}

/**
 * 四天王/チャンピオンとの戦闘完全フロー（スクリーンショット付き）
 */
async function fightLeagueMember(
  gamePage: TestGamePage,
  name: string,
  label: string,
  maxBattleTurns: number = 50,
): Promise<void> {
  const page = gamePage.page;

  // NPC会話前
  await snap(page, `${label}-会話前`);

  // NPC会話開始
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);

  // イントロダイアログ
  await snap(page, `${label}-イントロ`);

  // ダイアログ消化 → バトル突入
  const battleDeadline = Date.now() + 25_000;
  let battleStarted = false;
  while (Date.now() < battleDeadline) {
    const inBattle = await page
      .locator('[aria-label^="バトル:"]')
      .isVisible()
      .catch(() => false);
    if (inBattle) {
      battleStarted = true;
      break;
    }
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
  }

  if (!battleStarted) {
    await snap(page, `${label}-エラー`);
    throw new Error(`${name}とのバトルが開始されませんでした`);
  }

  // バトル勝利
  await winBattle(gamePage, label, maxBattleTurns);

  // 勝利直後
  await snap(page, `${label}-勝利`);

  // バトル後イベント消化
  await consumePostBattleDialogues(page);

  // 勝利後overworld
  await snap(page, `${label}-完了`);
}

test.use({ video: "on" });

test.describe("ゲームクリア — 四天王 + チャンピオン撃破 → エンディング", () => {
  test.setTimeout(300_000);

  test("ポケモンリーグを制覇してエンディングに到達する", async ({ gamePage }) => {
    screenshotIndex = 0;
    await gamePage.seedRandom(42);

    const saveData = createLeagueSave();
    await gamePage.page.goto("/");
    await gamePage.injectSaveData(saveData);
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });

    // タイトル画面
    await snap(gamePage.page, "タイトル画面");

    await gamePage.continueGame();
    await gamePage.page.waitForTimeout(2000);

    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);

    // ポケモンリーグ到着
    await snap(gamePage.page, "ポケモンリーグ到着");

    // ============================
    // 四天王1: ツバサ (5,6)
    // ============================
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(500);
    await fightLeagueMember(gamePage, "四天王 ツバサ", "01-ツバサ");

    // ============================
    // 四天王2: クロガネ (5,5)
    // ============================
    await gamePage.move("ArrowLeft", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.move("ArrowUp", 2);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightLeagueMember(gamePage, "四天王 クロガネ", "02-クロガネ");

    // ============================
    // 四天王3: ミヤビ (5,4)
    // ============================
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightLeagueMember(gamePage, "四天王 ミヤビ", "03-ミヤビ");

    // ============================
    // 四天王4: ゲンブ (5,3)
    // ============================
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightLeagueMember(gamePage, "四天王 ゲンブ", "04-ゲンブ");

    // ============================
    // チャンピオン: アカツキ (5,2)
    // ============================
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightLeagueMember(gamePage, "チャンピオン アカツキ", "05-チャンピオン", 80);

    // ============================
    // エンディング
    // ============================
    await gamePage.page.waitForTimeout(3000);

    // エンディングメッセージをスクリーンショット付きで消化
    let endingMsgCount = 0;
    for (let i = 0; i < 50; i++) {
      const hasMessage = await gamePage.page
        .locator('[aria-label="メッセージウィンドウ"]')
        .isVisible()
        .catch(() => false);
      if (!hasMessage) break;
      if (endingMsgCount < 5) {
        await snap(gamePage.page, `06-エンディング-${endingMsgCount + 1}`);
      }
      endingMsgCount++;
      await gamePage.page.keyboard.press("Enter");
      await gamePage.page.waitForTimeout(500);
    }

    // 最終画面
    await snap(gamePage.page, "07-クリア完了");

    // 最終確認: バトル画面でないこと
    await expect(gamePage.page.locator('[aria-label^="バトル:"]')).toHaveCount(0, {
      timeout: 10_000,
    });
  });
});
