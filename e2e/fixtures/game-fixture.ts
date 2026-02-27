import { test as base, expect, type Page } from "@playwright/test";
import type { SaveData } from "./save-data";

/**
 * GamePage — E2Eテスト用カスタムfixture
 * 全テストの基盤となるページ操作を抽象化
 */
export class GamePage {
  constructor(public readonly page: Page) {}

  /** ページ遷移 + タイトルアニメーション待ち */
  async goto() {
    await this.page.goto("/");
    await this.page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
  }

  /** はじめから → 名前入力 → けってい → starter_select画面 */
  async startNewGame(name: string = "テスト") {
    // "はじめから"を選択（Enterキー）
    await this.page.keyboard.press("Enter");
    // 名前入力フォームが表示される
    const nameInput = this.page.locator('input[placeholder="なまえ"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
    // "けってい"ボタンを押す
    await this.page.locator('button:has-text("けってい")').click();
  }

  /** セーブデータ注入後、つづきから */
  async continueGame() {
    // "つづきから"は hasSaveData=true 時にオプション0に表示
    await this.page.keyboard.press("Enter");
  }

  /** スターター選択: index=0(ヒモリ)/1(シズクモ)/2(コノハナ) */
  async selectStarter(index: 0 | 1 | 2 = 0) {
    // ArrowRight × index で選択移動
    for (let i = 0; i < index; i++) {
      await this.page.keyboard.press("ArrowRight");
      await this.page.waitForTimeout(100);
    }
    // Enter で選択 → 確認ダイアログ
    await this.page.keyboard.press("Enter");
    // "はい"ボタンで確定
    await this.page.locator('button:has-text("はい")').click();
  }

  /** 方向キーで移動 */
  async move(direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight", steps: number = 1) {
    for (let i = 0; i < steps; i++) {
      await this.page.keyboard.press(direction);
      await this.page.waitForTimeout(150);
    }
  }

  /** "たたかう" → 技選択 */
  async selectFight(moveIndex: number = 0) {
    // "たたかう"は action[0] → Enter
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(100);
    // 技選択: 2x2グリッドナビゲーション
    const row = Math.floor(moveIndex / 2);
    const col = moveIndex % 2;
    for (let i = 0; i < row; i++) {
      await this.page.keyboard.press("ArrowDown");
      await this.page.waitForTimeout(50);
    }
    for (let i = 0; i < col; i++) {
      await this.page.keyboard.press("ArrowRight");
      await this.page.waitForTimeout(50);
    }
    await this.page.keyboard.press("Enter");
  }

  /** "にげる"選択（2x2グリッドの右下 = index 3） */
  async selectRun() {
    // action grid: [fight, bag] [pokemon, run]
    // run = index 3 → ArrowDown + ArrowRight from 0
    await this.page.keyboard.press("ArrowDown");
    await this.page.waitForTimeout(50);
    await this.page.keyboard.press("ArrowRight");
    await this.page.waitForTimeout(50);
    await this.page.keyboard.press("Enter");
  }

  /** メニューを開く (Escape) */
  async openMenu() {
    await this.page.keyboard.press("Escape");
    await this.page.locator('[role="dialog"]').waitFor({ state: "visible" });
  }

  /** メッセージを送る (Enter) */
  async advanceMessage() {
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  /** メッセージウィンドウが消えるまでEnter連打 */
  async advanceAllMessages(maxAttempts: number = 20) {
    for (let i = 0; i < maxAttempts; i++) {
      const msgWindow = this.page.locator(".rpg-window").last();
      const isVisible = await msgWindow.isVisible().catch(() => false);
      if (!isVisible) break;
      await this.page.keyboard.press("Enter");
      await this.page.waitForTimeout(400);
    }
  }

  /** セーブデータをlocalStorageに注入 */
  async injectSaveData(data: SaveData, slot: number = 1) {
    await this.page.evaluate(
      ({ saveData, slotNum }) => {
        localStorage.setItem(`pokemon_save_${slotNum}`, JSON.stringify(saveData));
      },
      { saveData: data, slotNum: slot },
    );
  }

  /** セーブデータを全削除 */
  async clearSaveData() {
    await this.page.evaluate(() => {
      for (let i = 0; i < 3; i++) {
        localStorage.removeItem(`pokemon_save_${i}`);
      }
    });
  }

  /** Math.randomをシード固定 */
  async seedRandom(seed: number = 42) {
    await this.page.addInitScript((s) => {
      let _seed = s;
      Math.random = () => {
        _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
        return (_seed >>> 0) / 0xffffffff;
      };
    }, seed);
  }
}

/** カスタムfixture: 全テストで gamePage を使用可能にする */
export const test = base.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => {
    const gamePage = new GamePage(page);
    // Playwright fixture API — not a React Hook
    await use(gamePage); // eslint-disable-line react-hooks/rules-of-hooks
  },
});

export { expect };
