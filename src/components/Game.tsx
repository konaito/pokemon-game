"use client";

import { useGameState, useGameDispatch } from "./GameProvider";
import { TitleScreen } from "./screens/TitleScreen";
import { StarterSelect, type StarterOption } from "./screens/StarterSelect";
import type { MonsterInstance } from "@/types";

/** スターター定義（実際のモンスターデータと一致） */
const STARTERS: StarterOption[] = [
  {
    speciesId: "himori",
    name: "ヒモリ",
    type: "fire",
    description: "背中に小さな炎を灯す子ヤモリのモンスター。情熱的で勇敢な性格。",
  },
  {
    speciesId: "shizukumo",
    name: "シズクモ",
    type: "water",
    description: "水滴をまとう蜘蛛のモンスター。冷静で穏やかな知性派。",
  },
  {
    speciesId: "konohana",
    name: "コノハナ",
    type: "grass",
    description: "木の葉のような耳を持つ小さな精霊。好奇心旺盛で元気いっぱい。",
  },
];

function createStarterInstance(speciesId: string): MonsterInstance {
  return {
    uid: crypto.randomUUID(),
    speciesId,
    level: 5,
    exp: 0,
    nature: "hardy",
    ivs: { hp: 20, atk: 20, def: 20, spAtk: 20, spDef: 20, speed: 20 },
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 },
    currentHp: 20,
    moves: [{ moveId: "tackle", currentPp: 35 }],
    status: null,
  };
}

export function Game() {
  const state = useGameState();
  const dispatch = useGameDispatch();

  switch (state.screen) {
    case "title":
      return (
        <TitleScreen onNewGame={(name) => dispatch({ type: "START_NEW_GAME", playerName: name })} />
      );

    case "starter_select":
      return (
        <StarterSelect
          starters={STARTERS}
          onSelect={(speciesId) =>
            dispatch({ type: "SET_STARTER", monster: createStarterInstance(speciesId) })
          }
        />
      );

    case "overworld":
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950">
          <div className="text-center">
            <p className="font-mono text-lg text-white">{state.player?.name}の冒険が始まった！</p>
            <p className="mt-2 font-mono text-gray-400">
              パーティ: {state.player?.partyState.party.map((m) => m.speciesId).join(", ")}
            </p>
            <p className="mt-4 font-mono text-sm text-gray-600">（オーバーワールドは開発中...）</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex min-h-screen items-center justify-center bg-black">
          <p className="font-mono text-white">画面: {state.screen}（開発中）</p>
        </div>
      );
  }
}
