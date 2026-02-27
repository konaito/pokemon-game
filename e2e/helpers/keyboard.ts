import type { Page } from "@playwright/test";

/** 方向キー入力（繰り返し + 間隔制御） */
export async function pressDirection(
  page: Page,
  direction: "up" | "down" | "left" | "right",
  steps: number = 1,
  interval: number = 150,
) {
  const keyMap = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  } as const;

  for (let i = 0; i < steps; i++) {
    await page.keyboard.press(keyMap[direction]);
    await page.waitForTimeout(interval);
  }
}

/** Enter/決定キー */
export async function pressConfirm(page: Page) {
  await page.keyboard.press("Enter");
}

/** Escape/キャンセルキー */
export async function pressCancel(page: Page) {
  await page.keyboard.press("Escape");
}

/** メニューを開く */
export async function pressMenu(page: Page) {
  await page.keyboard.press("Escape");
}
