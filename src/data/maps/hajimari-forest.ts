/**
 * はじまりの森 — 最初のダンジョン的マップ
 * 12x12、草むら帯3箇所、エンカウント率25%
 */
import type { MapDefinition } from "@/engine/map/map-data";

const W = "wall" as const;
const G = "ground" as const;
const T = "grass" as const;

export const HAJIMARI_FOREST: MapDefinition = {
  id: "hajimari-forest",
  name: "はじまりの森",
  width: 12,
  height: 12,
  tiles: [
    // y=0: 北端（ルート1への接続）
    [W, W, W, W, W, W, G, G, W, W, W, W],
    // y=1
    [W, T, T, G, G, G, G, G, G, T, T, W],
    // y=2: 草むら帯1
    [W, T, T, G, G, G, G, G, G, T, T, W],
    // y=3
    [W, G, G, G, W, W, G, G, G, G, G, W],
    // y=4
    [W, G, G, G, W, W, G, T, T, G, G, W],
    // y=5: 草むら帯2
    [W, G, T, T, G, G, G, T, T, G, G, W],
    // y=6
    [W, G, T, T, G, G, G, G, G, G, G, W],
    // y=7
    [W, G, G, G, G, W, W, G, G, G, G, W],
    // y=8
    [W, G, G, G, G, W, W, G, T, T, G, W],
    // y=9: 草むら帯3
    [W, G, G, G, G, G, G, G, T, T, G, W],
    // y=10
    [W, G, G, G, G, G, G, G, G, G, G, W],
    // y=11: 南端（次のエリアへの接続 — ジム1の町方面）
    [W, W, W, W, W, G, G, W, W, W, W, W],
  ],
  connections: [
    {
      // 北出口 → ルート1
      targetMapId: "route-1",
      targetX: 7,
      targetY: 8,
      sourceX: 6,
      sourceY: 0,
    },
    {
      targetMapId: "route-1",
      targetX: 8,
      targetY: 8,
      sourceX: 7,
      sourceY: 0,
    },
    {
      // 南出口 → ツチグモ村
      targetMapId: "tsuchigumo-village",
      targetX: 5,
      targetY: 0,
      sourceX: 5,
      sourceY: 11,
    },
    {
      targetMapId: "tsuchigumo-village",
      targetX: 6,
      targetY: 0,
      sourceX: 6,
      sourceY: 11,
    },
  ],
  encounters: [
    { speciesId: "konezumi", minLevel: 4, maxLevel: 6, weight: 30 },
    { speciesId: "mayumushi", minLevel: 3, maxLevel: 6, weight: 30 },
    { speciesId: "tobibato", minLevel: 4, maxLevel: 6, weight: 20 },
    { speciesId: "dokudama", minLevel: 4, maxLevel: 6, weight: 15 },
    { speciesId: "hikarineko", minLevel: 5, maxLevel: 7, weight: 5 },
  ],
  encounterRate: 25,
  npcs: [
    {
      id: "npc-forest-girl",
      name: "もりのおんなのこ",
      x: 3,
      y: 5,
      dialogue: [
        "この森には色々なモンスターがいるの。",
        "草むらを歩いて、新しいモンスターを見つけてね！",
      ],
      isTrainer: false,
    },
    {
      id: "npc-forest-hiker",
      name: "ハイカー",
      x: 9,
      y: 8,
      dialogue: ["南に抜けると次の町があるらしいが…", "まだ道が整備されていないらしい。"],
      isTrainer: false,
      conditionalDialogues: [
        {
          condition: "gym1_cleared",
          dialogue: ["南の道が開通したぞ！", "次の町に向かうといい！"],
        },
      ],
    },
  ],
};
