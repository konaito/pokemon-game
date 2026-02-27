/**
 * ルート1 — ワスレ町とはじまりの森を結ぶ最初のルート
 * 15x10、草むら帯2箇所、エンカウント率20%
 */
import type { MapDefinition } from "@/engine/map/map-data";

const W = "wall" as const;
const G = "ground" as const;
const T = "grass" as const;

export const ROUTE_1: MapDefinition = {
  id: "route-1",
  name: "ルート1",
  width: 15,
  height: 10,
  tiles: [
    // y=0: 北端（ワスレ町への接続）
    [W, W, W, W, W, W, W, G, G, W, W, W, W, W, W],
    // y=1: 道
    [W, T, T, T, G, G, G, G, G, G, G, T, T, T, W],
    // y=2: 草むら帯1
    [W, T, T, T, G, G, G, G, G, G, G, T, T, T, W],
    // y=3
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, W],
    // y=4: 中央の道
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, W],
    // y=5
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, W],
    // y=6: 草むら帯2
    [W, T, T, G, G, G, T, T, T, G, G, G, T, T, W],
    // y=7
    [W, T, T, G, G, G, T, T, T, G, G, G, T, T, W],
    // y=8: 道
    [W, G, G, G, G, G, G, G, G, G, G, G, G, G, W],
    // y=9: 南端（はじまりの森への接続）
    [W, W, W, W, W, W, W, G, G, W, W, W, W, W, W],
  ],
  connections: [
    {
      // 北出口 → ワスレ町
      targetMapId: "wasuremachi",
      targetX: 4,
      targetY: 8,
      sourceX: 7,
      sourceY: 0,
    },
    {
      targetMapId: "wasuremachi",
      targetX: 5,
      targetY: 8,
      sourceX: 8,
      sourceY: 0,
    },
    {
      // 南出口 → はじまりの森
      targetMapId: "hajimari-forest",
      targetX: 6,
      targetY: 0,
      sourceX: 7,
      sourceY: 9,
    },
    {
      targetMapId: "hajimari-forest",
      targetX: 7,
      targetY: 0,
      sourceX: 8,
      sourceY: 9,
    },
  ],
  encounters: [
    { speciesId: "konezumi", minLevel: 3, maxLevel: 5, weight: 40 },
    { speciesId: "tobibato", minLevel: 2, maxLevel: 4, weight: 30 },
    { speciesId: "mayumushi", minLevel: 3, maxLevel: 5, weight: 20 },
    { speciesId: "hikarineko", minLevel: 4, maxLevel: 6, weight: 10 },
  ],
  encounterRate: 20,
  npcs: [
    {
      id: "npc-route1-boy",
      name: "むしとりしょうねん",
      x: 4,
      y: 4,
      dialogue: ["草むらに入るとモンスターが出てくるよ！", "モンスターボールで捕まえてみなよ！"],
      isTrainer: false,
    },
  ],
};
