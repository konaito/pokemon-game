import { describe, it, expect } from "vitest";
import { interactWithNpc } from "../npc";
import type { NpcDefinition } from "../map-data";

const npcs: NpcDefinition[] = [
  { id: "villager", name: "村人", x: 5, y: 5, dialogue: ["いい天気だね！"], isTrainer: false },
  {
    id: "trainer1",
    name: "ミニスカート",
    x: 8,
    y: 3,
    dialogue: ["勝負よ！", "悔しい〜！"],
    isTrainer: true,
  },
];

describe("NPC会話システム", () => {
  it("村人に話しかけると会話が返る", () => {
    const result = interactWithNpc("villager", npcs);
    expect(result).not.toBeNull();
    expect(result!.dialogue).toEqual(["いい天気だね！"]);
    expect(result!.triggerBattle).toBe(false);
  });

  it("未撃破トレーナーに話しかけるとバトルが発生する", () => {
    const result = interactWithNpc("trainer1", npcs);
    expect(result).not.toBeNull();
    expect(result!.triggerBattle).toBe(true);
  });

  it("撃破済みトレーナーにはバトルが発生しない", () => {
    const defeated = new Set(["trainer1"]);
    const result = interactWithNpc("trainer1", npcs, defeated);
    expect(result).not.toBeNull();
    expect(result!.triggerBattle).toBe(false);
  });

  it("存在しないNPCにはnullが返る", () => {
    const result = interactWithNpc("unknown", npcs);
    expect(result).toBeNull();
  });
});
