import { test, expect } from "../fixtures/game-fixture";
import type { SaveData, SaveMonsterInstance } from "../fixtures/save-data";
import path from "path";

/**
 * フルプレイスルーテスト
 * タイトル → スターター選択 → ジム1〜8 → オブリヴィオンイベント →
 * 四天王+チャンピオン → エンディング を通しで実行し、
 * 動画+スクリーンショットを生成する
 *
 * 各ジムごとにセーブデータを注入して直接町に配置する方式。
 * マップ遷移ではオブリヴィオンイベントが自動発火するため、
 * イベント付きのジムではマップ遷移をトリガーしてイベントを消化する。
 */

const SCREENSHOT_DIR = path.resolve("test-screenshots/full-playthrough");

// ================================================================
// データ定義
// ================================================================

const BADGE_NAMES = [
  "シズマリバッジ",
  "モリノハバッジ",
  "イナヅマバッジ",
  "カガリバッジ",
  "ゴウキバッジ",
  "キリフリバッジ",
  "フユハバッジ",
  "タツミバッジ",
];

const GYM_TOWNS: { mapId: string; name: string; leaderName: string }[] = [
  { mapId: "tsuchigumo-village", name: "ツチグモ村", leaderName: "マサキ" },
  { mapId: "morinoha-town", name: "モリノハの町", leaderName: "カイコ" },
  { mapId: "inazuma-city", name: "イナヅマシティ", leaderName: "ライゾウ" },
  { mapId: "kagari-city", name: "カガリ市", leaderName: "カガリ" },
  { mapId: "gouki-town", name: "ゴウキの町", leaderName: "ゴウキ" },
  { mapId: "kirifuri-village", name: "キリフリ村", leaderName: "キリフリ" },
  { mapId: "fuyuha-town", name: "フユハの町", leaderName: "フユハ" },
  { mapId: "tatsumi-city", name: "タツミシティ", leaderName: "タツミ" },
];

// ================================================================
// ヘルパー: セーブデータ
// ================================================================

function createOverpoweredParty(): SaveMonsterInstance[] {
  return [
    {
      uid: "full-test-enjuu",
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
      uid: "full-test-taikaiou",
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

/** 指定ジム町・指定バッジ数・指定フラグでセーブデータ生成 */
function createGymSave(gymNumber: number, storyFlags: Record<string, boolean> = {}): SaveData {
  const badges = BADGE_NAMES.slice(0, gymNumber - 1);
  const flags: Record<string, boolean> = {};
  for (let i = 1; i < gymNumber; i++) {
    flags[`gym${i}_cleared`] = true;
  }
  Object.assign(flags, storyFlags);

  const town = GYM_TOWNS[gymNumber - 1];
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    playTime: gymNumber * 1000,
    state: {
      player: {
        name: "テスト",
        money: 99999,
        badges,
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
        currentMapId: town.mapId,
        playerX: 5,
        playerY: 4,
        direction: "up",
      },
      storyFlags: flags,
    },
  };
}

/** ポケモンリーグ用セーブデータ（テスト24と同等） */
function createLeagueSave(): SaveData {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    playTime: 36000,
    state: {
      player: {
        name: "テスト",
        money: 99999,
        badges: [...BADGE_NAMES],
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
        oblivion_encountered: true,
        ruins_investigated: true,
        kirifuri_defended: true,
        oblivion_defeated: true,
      },
    },
  };
}

// ================================================================
// ヘルパー: 型定義
// ================================================================

type TestPage = InstanceType<typeof import("@playwright/test").Page>;
type TestGamePage = InstanceType<typeof import("../fixtures/game-fixture").GamePage>;

// ================================================================
// ヘルパー: スクリーンショット
// ================================================================

let screenshotIndex = 0;

async function snap(page: TestPage, label: string): Promise<void> {
  const idx = String(screenshotIndex++).padStart(3, "0");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${idx}-${label}.png`),
  });
}

// ================================================================
// ヘルパー: セーブデータ注入 + ゲーム再開
// ================================================================

async function loadSaveAndContinue(gamePage: TestGamePage, save: SaveData): Promise<void> {
  await gamePage.page.goto("/");
  await gamePage.injectSaveData(save);
  await gamePage.page.reload();
  await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
  const continueButton = gamePage.page.locator('button:has-text("つづきから")');
  await continueButton.waitFor({ state: "visible", timeout: 10_000 });
  await continueButton.click();
  await gamePage.page.waitForTimeout(2000);
}

// ================================================================
// ヘルパー: バトル
// ================================================================

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

    const partySelectHeading = page.getByRole("heading", { name: "モンスターを選んでください" });
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

/** NPC対面でバトルを開始し勝利する */
async function fightTrainer(
  gamePage: TestGamePage,
  label: string,
  maxBattleTurns: number = 50,
): Promise<void> {
  const page = gamePage.page;

  await snap(page, `${label}-会話前`);

  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);

  await snap(page, `${label}-イントロ`);

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
    throw new Error(`${label}のバトルが開始されませんでした`);
  }

  await winBattle(gamePage, label, maxBattleTurns);
  await snap(page, `${label}-勝利`);
  await consumePostBattleDialogues(page);
  await snap(page, `${label}-完了`);
}

// ================================================================
// ヘルパー: ジム攻略
// ================================================================

/**
 * ジム攻略: (5,4)からスタート → リーダー(8,3)戦 → 回復(2,3) → 完了
 * 全ジム町は同じレイアウト: y=4は全ground、リーダー(8,3)、ヒーラー(2,3)
 */
async function clearGymFromSave(
  gamePage: TestGamePage,
  gymNumber: number,
  label: string,
): Promise<void> {
  await snap(gamePage.page, `${label}-町到着`);

  // (5,4) → right 3 → (8,4) → up → face NPC(8,3)
  await gamePage.move("ArrowRight", 3);
  await gamePage.page.waitForTimeout(200);
  await gamePage.page.keyboard.press("ArrowUp");
  await gamePage.page.waitForTimeout(300);

  // リーダー戦
  await fightTrainer(gamePage, label);

  // (8,4)付近 → left 5 → (3,4) → up → (3,3) → left → face ヒーラー(2,3)
  await gamePage.move("ArrowLeft", 5);
  await gamePage.page.waitForTimeout(200);
  await gamePage.move("ArrowUp", 1);
  await gamePage.page.waitForTimeout(200);
  await gamePage.page.keyboard.press("ArrowLeft");
  await gamePage.page.waitForTimeout(200);
  await gamePage.page.keyboard.press("Enter");
  await gamePage.page.waitForTimeout(500);

  // 回復ダイアログ消化
  for (let i = 0; i < 10; i++) {
    const hasMsg = await gamePage.page
      .locator('[aria-label="メッセージウィンドウ"]')
      .isVisible()
      .catch(() => false);
    if (!hasMsg) break;
    await gamePage.page.keyboard.press("Enter");
    await gamePage.page.waitForTimeout(400);
  }
  await gamePage.page.waitForTimeout(500);
}

// ================================================================
// ヘルパー: オブリヴィオンイベント
// ================================================================

/**
 * オブリヴィオンイベントはマップ遷移時に自動発火する。
 * セーブデータ注入→ロードでは発火しないため、
 * マップ内で南出口に移動してマップ遷移をトリガーし、
 * 遷移先でイベントを消化する。
 *
 * ただし、実装上は handleMapTransition 内でイベントチェックが走る。
 * セーブデータのcurrentMapIdを隣接ルートに設定し、
 * そこからマップ遷移で町に入ることでイベントを発火させる。
 */
async function triggerAndConsumeOblivionEvent(
  gamePage: TestGamePage,
  label: string,
  sourceMapId: string,
  sourceX: number,
  sourceY: number,
  storyFlags: Record<string, boolean>,
): Promise<void> {
  // ルートの南出口付近にセーブデータを配置し、1歩南に移動してマップ遷移を起こす
  const save: SaveData = {
    version: 1,
    savedAt: new Date().toISOString(),
    playTime: 10000,
    state: {
      player: {
        name: "テスト",
        money: 99999,
        badges: BADGE_NAMES.slice(
          0,
          Object.keys(storyFlags).filter((k) => k.startsWith("gym") && k.endsWith("_cleared"))
            .length,
        ),
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
        currentMapId: sourceMapId,
        playerX: sourceX,
        playerY: sourceY,
        direction: "down",
      },
      storyFlags,
    },
  };

  await loadSaveAndContinue(gamePage, save);

  // 1歩南に移動してマップ遷移をトリガー
  await gamePage.move("ArrowDown", 1);
  await gamePage.page.waitForTimeout(2000); // マップ遷移 + イベント開始待ち

  await snap(gamePage.page, `${label}-イベント開始`);

  // イベント消化（ダイアログ + バトル の繰り返し）
  const eventDeadline = Date.now() + 120_000;
  while (Date.now() < eventDeadline) {
    const inBattle = await gamePage.page
      .locator('[aria-label^="バトル:"]')
      .isVisible()
      .catch(() => false);
    if (inBattle) {
      await snap(gamePage.page, `${label}-バトル`);
      await winBattle(gamePage, label, 50);
      await snap(gamePage.page, `${label}-バトル勝利`);
      await consumePostBattleDialogues(gamePage.page);
      continue;
    }

    const hasMessage = await gamePage.page
      .locator('[aria-label="メッセージウィンドウ"]')
      .isVisible()
      .catch(() => false);
    if (hasMessage) {
      await gamePage.page.keyboard.press("Enter");
      await gamePage.page.waitForTimeout(400);
      continue;
    }

    // イベント終了チェック
    await gamePage.page.waitForTimeout(1000);
    const hasMsg2 = await gamePage.page
      .locator('[aria-label="メッセージウィンドウ"]')
      .isVisible()
      .catch(() => false);
    const inBattle2 = await gamePage.page
      .locator('[aria-label^="バトル:"]')
      .isVisible()
      .catch(() => false);
    if (!hasMsg2 && !inBattle2) break;
  }

  await snap(gamePage.page, `${label}-イベント完了`);
}

// ================================================================
// テスト本体
// ================================================================

test.use({ video: "on" });

test.describe("フルプレイスルー — タイトル → エンディング", () => {
  test.setTimeout(600_000);

  test("最初から最後までプレイスルーする", async ({ gamePage }) => {
    screenshotIndex = 0;
    await gamePage.seedRandom(42);

    // ============================
    // Part 1: オープニング（ニューゲーム）
    // ============================
    await gamePage.page.goto("/");
    await gamePage.clearSaveData();
    await gamePage.page.reload();
    await gamePage.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });

    await snap(gamePage.page, "タイトル画面");

    await gamePage.startNewGame("テスト");
    await gamePage.page.waitForTimeout(1000);
    await snap(gamePage.page, "スターター選択");

    await gamePage.selectStarter(0);
    await gamePage.page.waitForTimeout(2000);
    await snap(gamePage.page, "ワスレ町到着");

    await expect(
      gamePage.page.locator('[aria-label="Monster Chronicle タイトル画面"]'),
    ).toHaveCount(0);

    // ============================
    // Part 2: ジム1〜8
    // 各ジムごとにセーブデータ注入して直接町に配置
    // ============================
    for (let gym = 1; gym <= 8; gym++) {
      const town = GYM_TOWNS[gym - 1];
      const label = `G${gym}-${town.leaderName}`;
      const save = createGymSave(gym);
      await loadSaveAndContinue(gamePage, save);
      await clearGymFromSave(gamePage, gym, label);
    }

    // ============================
    // Part 3: オブリヴィオンイベント
    // gym3_cleared後: マボロシ初遭遇（ルート4南端→カガリ市遷移で発火）
    // ============================
    await triggerAndConsumeOblivionEvent(
      gamePage,
      "OB1-マボロシ初遭遇",
      "route-4",
      5,
      8, // 南出口(5,9)の1歩前
      {
        gym1_cleared: true,
        gym2_cleared: true,
        gym3_cleared: true,
      },
    );

    // gym4_cleared後: 遺跡イベント（ルート5南端→ゴウキの町遷移で発火）
    await triggerAndConsumeOblivionEvent(gamePage, "OB2-遺跡ウツロ", "route-5", 5, 8, {
      gym1_cleared: true,
      gym2_cleared: true,
      gym3_cleared: true,
      gym4_cleared: true,
      oblivion_encountered: true,
    });

    // gym5_cleared後: キリフリ防衛（ルート6南端→キリフリ村遷移で発火）
    await triggerAndConsumeOblivionEvent(gamePage, "OB3-キリフリ防衛", "route-6", 5, 8, {
      gym1_cleared: true,
      gym2_cleared: true,
      gym3_cleared: true,
      gym4_cleared: true,
      gym5_cleared: true,
      oblivion_encountered: true,
      ruins_investigated: true,
    });

    // gym8_cleared後: セイレイ山最終決戦（タツミ南出口→ポケモンリーグ遷移で発火）
    // タツミシティの南出口(4,9)→ポケモンリーグ(5,0)
    await triggerAndConsumeOblivionEvent(
      gamePage,
      "OB4-最終決戦",
      "tatsumi-city",
      4,
      8, // 南出口(4,9)の1歩前
      {
        gym1_cleared: true,
        gym2_cleared: true,
        gym3_cleared: true,
        gym4_cleared: true,
        gym5_cleared: true,
        gym6_cleared: true,
        gym7_cleared: true,
        gym8_cleared: true,
        oblivion_encountered: true,
        ruins_investigated: true,
        kirifuri_defended: true,
      },
    );

    // ============================
    // Part 4: ポケモンリーグ（テスト24と同パターン）
    // ============================
    const leagueSave = createLeagueSave();
    await loadSaveAndContinue(gamePage, leagueSave);

    await snap(gamePage.page, "ポケモンリーグ到着");

    // 四天王1: ツバサ (5,6)
    // 現在(5,8) → up 2 → (5,6)
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(500);
    await fightTrainer(gamePage, "E1-ツバサ");

    // 四天王2: クロガネ (5,5)
    await gamePage.move("ArrowLeft", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.move("ArrowUp", 2);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightTrainer(gamePage, "E2-クロガネ");

    // 四天王3: ミヤビ (5,4)
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightTrainer(gamePage, "E3-ミヤビ");

    // 四天王4: ゲンブ (5,3)
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightTrainer(gamePage, "E4-ゲンブ");

    // チャンピオン: アカツキ (5,2)
    await gamePage.move("ArrowUp", 1);
    await gamePage.page.waitForTimeout(200);
    await gamePage.page.keyboard.press("ArrowRight");
    await gamePage.page.waitForTimeout(300);
    await fightTrainer(gamePage, "CH-アカツキ", 80);

    // ============================
    // Part 5: エンディング
    // ============================
    await gamePage.page.waitForTimeout(3000);

    let endingMsgCount = 0;
    for (let i = 0; i < 50; i++) {
      const hasMessage = await gamePage.page
        .locator('[aria-label="メッセージウィンドウ"]')
        .isVisible()
        .catch(() => false);
      if (!hasMessage) break;
      if (endingMsgCount < 5) {
        await snap(gamePage.page, `エンディング-${endingMsgCount + 1}`);
      }
      endingMsgCount++;
      await gamePage.page.keyboard.press("Enter");
      await gamePage.page.waitForTimeout(500);
    }

    await snap(gamePage.page, "クリア完了");

    await expect(gamePage.page.locator('[aria-label^="バトル:"]')).toHaveCount(0, {
      timeout: 10_000,
    });
  });
});
