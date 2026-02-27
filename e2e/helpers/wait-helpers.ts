import type { Page } from "@playwright/test";

/** バトル画面で「はどうする？」メッセージが出るまで待機 */
export async function waitForBattleReady(page: Page) {
  await page.waitForSelector("text=/はどうする？/", { timeout: 15_000 });
}

/** マップ遷移アニメーション完了待ち */
export async function waitForMapTransition(page: Page) {
  await page.waitForTimeout(600);
}

/** タイトル画面の「PRESS ENTER」表示待ち */
export async function waitForTitleReady(page: Page) {
  await page.waitForSelector("text=PRESS ENTER", { timeout: 10_000 });
}

/** バトル処理中メッセージが消えて操作可能になるまで待機 */
export async function waitForBattleActionable(page: Page) {
  await page.waitForSelector("text=/はどうする？/", { timeout: 15_000 });
}

/** オーバーワールド画面が表示されるまで待機 */
export async function waitForOverworld(page: Page) {
  // overworldにはaria-label付きの要素がないため、マップ名表示またはプレイヤーの存在で判断
  await page.waitForTimeout(500);
}
