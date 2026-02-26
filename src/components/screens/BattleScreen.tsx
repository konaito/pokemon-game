"use client";

import { useState } from "react";
import { HpBar } from "../ui/HpBar";

/**
 * バトルUI (#61)
 * HPバー、技選択、メッセージウィンドウ、アクション選択
 */

export interface BattleMonsterInfo {
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  isPlayer: boolean;
}

export interface BattleMoveInfo {
  moveId: string;
  name: string;
  type: string;
  currentPp: number;
  maxPp: number;
}

export type BattleAction =
  | { type: "fight"; moveIndex: number }
  | { type: "bag" }
  | { type: "pokemon" }
  | { type: "run" };

export interface BattleScreenProps {
  player: BattleMonsterInfo;
  opponent: BattleMonsterInfo;
  moves: BattleMoveInfo[];
  messages: string[];
  isWild: boolean;
  onAction: (action: BattleAction) => void;
  /** trueの場合、メッセージ表示中でアクション選択不可 */
  isProcessing: boolean;
}

type BattlePhase = "action" | "move_select";

export function BattleScreen({
  player,
  opponent,
  moves,
  messages,
  isWild,
  onAction,
  isProcessing,
}: BattleScreenProps) {
  const [phase, setPhase] = useState<BattlePhase>("action");
  const [selectedAction, setSelectedAction] = useState(0);
  const [selectedMove, setSelectedMove] = useState(0);

  const actions = [
    { label: "たたかう", value: "fight" },
    { label: "バッグ", value: "bag" },
    { label: "ポケモン", value: "pokemon" },
    { label: isWild ? "にげる" : "---", value: "run" },
  ];

  const handleActionSelect = (index: number) => {
    const action = actions[index];
    if (action.value === "fight") {
      setPhase("move_select");
      setSelectedMove(0);
    } else if (action.value === "bag") {
      onAction({ type: "bag" });
    } else if (action.value === "pokemon") {
      onAction({ type: "pokemon" });
    } else if (action.value === "run" && isWild) {
      onAction({ type: "run" });
    }
  };

  const handleMoveSelect = (index: number) => {
    if (moves[index] && moves[index].currentPp > 0) {
      onAction({ type: "fight", moveIndex: index });
      setPhase("action");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isProcessing) return;

    if (phase === "action") {
      if (e.key === "ArrowUp" || e.key === "w") {
        setSelectedAction((prev) => (prev < 2 ? prev : prev - 2));
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        setSelectedAction((prev) => (prev >= 2 ? prev : prev + 2));
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        setSelectedAction((prev) => (prev % 2 === 0 ? prev : prev - 1));
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setSelectedAction((prev) => (prev % 2 === 1 ? prev : prev + 1));
      }
      if (e.key === "Enter" || e.key === "z") {
        handleActionSelect(selectedAction);
      }
    } else if (phase === "move_select") {
      if (e.key === "ArrowUp" || e.key === "w") {
        setSelectedMove((prev) => (prev < 2 ? prev : prev - 2));
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        setSelectedMove((prev) =>
          prev >= 2 && prev < moves.length ? prev : prev + 2 < moves.length ? prev + 2 : prev,
        );
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        setSelectedMove((prev) => (prev % 2 === 0 ? prev : prev - 1));
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setSelectedMove((prev) => (prev % 2 === 1 || prev + 1 >= moves.length ? prev : prev + 1));
      }
      if (e.key === "Enter" || e.key === "z") {
        handleMoveSelect(selectedMove);
      }
      if (e.key === "Escape" || e.key === "x") {
        setPhase("action");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-950" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* バトルフィールド */}
      <div className="flex flex-1 flex-col justify-between px-8 py-6">
        {/* 相手モンスター情報 */}
        <div className="flex justify-start">
          <div className="rounded-lg bg-gray-900/80 px-4 py-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-white">{opponent.name}</span>
              <span className="font-mono text-sm text-gray-400">Lv.{opponent.level}</span>
            </div>
            <HpBar current={opponent.currentHp} max={opponent.maxHp} className="mt-1 w-40" />
          </div>
        </div>

        {/* バトルアリーナ（プレースホルダー） */}
        <div className="flex items-center justify-center py-8">
          <div className="flex gap-32">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-4xl">
              👾
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-4xl">
              🐾
            </div>
          </div>
        </div>

        {/* 自分モンスター情報 */}
        <div className="flex justify-end">
          <div className="rounded-lg bg-gray-900/80 px-4 py-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-white">{player.name}</span>
              <span className="font-mono text-sm text-gray-400">Lv.{player.level}</span>
            </div>
            <HpBar current={player.currentHp} max={player.maxHp} className="mt-1 w-40" />
          </div>
        </div>
      </div>

      {/* メッセージ + コマンドウィンドウ */}
      <div className="border-t-2 border-gray-700 bg-gray-900">
        {isProcessing ? (
          /* メッセージ表示 */
          <div className="min-h-[6rem] px-6 py-4">
            <p className="font-mono text-lg text-white">{messages[messages.length - 1] ?? ""}</p>
          </div>
        ) : phase === "action" ? (
          /* アクション選択 */
          <div className="flex">
            <div className="flex-1 px-6 py-4">
              <p className="font-mono text-lg text-white">{player.name}はどうする？</p>
            </div>
            <div className="grid w-56 grid-cols-2 gap-1 px-4 py-3">
              {actions.map((action, i) => (
                <button
                  key={action.value}
                  className={`rounded px-3 py-1.5 text-left font-mono text-sm transition-colors ${
                    i === selectedAction
                      ? "bg-white/20 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => handleActionSelect(i)}
                  onMouseEnter={() => setSelectedAction(i)}
                >
                  {i === selectedAction ? "▶" : " "} {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 技選択 */
          <div className="flex">
            <div className="flex-1 px-4 py-3">
              <div className="grid grid-cols-2 gap-1">
                {moves.map((move, i) => (
                  <button
                    key={move.moveId}
                    className={`rounded px-3 py-1.5 text-left font-mono text-sm transition-colors ${
                      i === selectedMove
                        ? "bg-white/20 text-white"
                        : move.currentPp > 0
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600"
                    }`}
                    onClick={() => handleMoveSelect(i)}
                    onMouseEnter={() => setSelectedMove(i)}
                    disabled={move.currentPp <= 0}
                  >
                    {i === selectedMove ? "▶" : " "} {move.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-40 border-l border-gray-700 px-4 py-3">
              {moves[selectedMove] && (
                <>
                  <p className="font-mono text-xs text-gray-400">
                    タイプ/{moves[selectedMove].type}
                  </p>
                  <p className="font-mono text-xs text-gray-400">
                    PP {moves[selectedMove].currentPp}/{moves[selectedMove].maxPp}
                  </p>
                </>
              )}
              <button
                className="mt-2 font-mono text-xs text-gray-500 hover:text-white"
                onClick={() => setPhase("action")}
              >
                ← もどる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
