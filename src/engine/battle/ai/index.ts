export type { AiLevel, AiContext, AiStrategy } from "./ai-types";
export { randomAi } from "./ai-random";
export { basicAi } from "./ai-basic";
export { smartAi } from "./ai-smart";

import type { AiLevel, AiStrategy } from "./ai-types";
import { randomAi } from "./ai-random";
import { basicAi } from "./ai-basic";
import { smartAi } from "./ai-smart";

/** AIレベルに応じたストラテジーを取得 */
export function getAiStrategy(level: AiLevel): AiStrategy {
  switch (level) {
    case "basic":
      return basicAi;
    case "smart":
      return smartAi;
    default:
      return randomAi;
  }
}
