"use client";

import { useState } from "react";
import { HpBar } from "../ui/HpBar";
import { MonsterSprite } from "../ui/MonsterSprite";
import { BattleBackground, type BattleEnvironment } from "../ui/BattleBackgrounds";
import { TYPE_BG, TYPE_HEX, TYPE_LABEL } from "@/lib/design-tokens";

/**
 * バトルUI (#61)
 * HPバー、技選択、メッセージ、アクション選択 - ハイブリッドデザイン
 */

export interface BattleMonsterInfo {
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  isPlayer: boolean;
  speciesId: string;
  types: string[];
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
  isProcessing: boolean;
  /** バトル環境（背景決定用） */
  environment?: BattleEnvironment;
}

type BattlePhase = "action" | "move_select";

const ACTION_ITEMS = [
  { label: "たたかう", value: "fight", icon: "⚔" },
  { label: "バッグ", value: "bag", icon: "■" },
  { label: "ポケモン", value: "pokemon", icon: "◆" },
  { label: "にげる", value: "run", icon: "→" },
];

export function BattleScreen({
  player,
  opponent,
  moves,
  messages,
  isWild,
  onAction,
  isProcessing,
  environment = "grassland",
}: BattleScreenProps) {
  const [phase, setPhase] = useState<BattlePhase>("action");
  const [selectedAction, setSelectedAction] = useState(0);
  const [selectedMove, setSelectedMove] = useState(0);

  const actions = ACTION_ITEMS.map((a) =>
    a.value === "run" && !isWild ? { ...a, label: "---" } : a,
  );

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
    <div
      className="flex h-full w-full flex-col bg-[#1a1a2e]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* バトルフィールド */}
      <div className="relative flex flex-1 flex-col justify-between px-6 py-4">
        {/* バトル背景 */}
        <BattleBackground environment={environment} />

        {/* 相手モンスター情報 */}
        <div className="relative z-10 flex justify-start">
          <div className="rpg-window">
            <div className="flex items-baseline gap-2 px-3 py-2">
              <span className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg font-bold text-white">
                {opponent.name}
              </span>
              <span className="font-[family-name:var(--font-dotgothic)] text-sm text-gray-400">
                Lv.{opponent.level}
              </span>
            </div>
            <div className="px-3 pb-2">
              <HpBar
                current={opponent.currentHp}
                max={opponent.maxHp}
                className="w-44"
                showNumbers={false}
              />
            </div>
          </div>
        </div>

        {/* バトルアリーナ */}
        <div className="relative z-10 flex items-center justify-center py-4">
          <div className="flex gap-32">
            {/* 相手モンスター */}
            <div className="animate-float flex flex-col items-center">
              <MonsterSprite speciesId={opponent.speciesId} types={opponent.types} size={96} flip />
              <div
                className="mt-1 h-2 w-16 rounded-full opacity-30"
                style={{
                  background: `radial-gradient(ellipse, ${TYPE_HEX[opponent.types[0]] ?? "#533483"}80, transparent)`,
                }}
              />
            </div>
            {/* 自分モンスター */}
            <div className="flex flex-col items-center">
              <MonsterSprite speciesId={player.speciesId} types={player.types} size={96} />
              <div
                className="mt-1 h-2 w-16 rounded-full opacity-30"
                style={{
                  background: `radial-gradient(ellipse, ${TYPE_HEX[player.types[0]] ?? "#e94560"}60, transparent)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 自分モンスター情報 */}
        <div className="relative z-10 flex justify-end">
          <div className="rpg-window">
            <div className="flex items-baseline gap-2 px-3 py-2">
              <span className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg font-bold text-white">
                {player.name}
              </span>
              <span className="font-[family-name:var(--font-dotgothic)] text-sm text-gray-400">
                Lv.{player.level}
              </span>
            </div>
            <div className="px-3 pb-2">
              <HpBar current={player.currentHp} max={player.maxHp} className="w-44" />
            </div>
          </div>
        </div>
      </div>

      {/* コマンドウィンドウ */}
      <div className="rpg-window mx-2 mb-2 rounded-t-none border-t-2 border-[#533483]">
        <div className="rpg-window-inner">
          {isProcessing ? (
            <div className="min-h-[4rem]">
              <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg text-white">
                {messages[messages.length - 1] ?? ""}
              </p>
            </div>
          ) : phase === "action" ? (
            <div className="flex items-center">
              <div className="flex-1">
                <p className="game-text-shadow font-[family-name:var(--font-dotgothic)] text-lg text-white">
                  {player.name}はどうする？
                </p>
              </div>
              <div className="grid w-52 grid-cols-2 gap-1">
                {actions.map((action, i) => (
                  <button
                    key={action.value}
                    className={`flex items-center gap-1 rounded-md px-3 py-2 text-left font-[family-name:var(--font-dotgothic)] text-sm transition-all ${
                      i === selectedAction
                        ? "bg-white/15 text-white shadow-[0_0_10px_rgba(233,69,96,0.1)]"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => handleActionSelect(i)}
                    onMouseEnter={() => setSelectedAction(i)}
                  >
                    <span
                      className="text-xs"
                      style={{ color: i === selectedAction ? "#e94560" : "transparent" }}
                    >
                      ▶
                    </span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-1">
                  {moves.map((move, i) => {
                    const isSelected = i === selectedMove;
                    const isDisabled = move.currentPp <= 0;
                    const hex = TYPE_HEX[move.type] ?? "#A8A878";

                    return (
                      <button
                        key={move.moveId}
                        className={`flex items-center gap-1 rounded-md px-3 py-2 text-left font-[family-name:var(--font-dotgothic)] text-sm transition-all ${
                          isSelected
                            ? "bg-white/15 text-white"
                            : isDisabled
                              ? "text-gray-600"
                              : "text-gray-400 hover:text-gray-300"
                        }`}
                        onClick={() => handleMoveSelect(i)}
                        onMouseEnter={() => setSelectedMove(i)}
                        disabled={isDisabled}
                      >
                        <span
                          className="text-xs"
                          style={{ color: isSelected ? hex : "transparent" }}
                        >
                          ▶
                        </span>
                        {move.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-36 border-l border-[#533483]/30 pl-3">
                {moves[selectedMove] && (
                  <>
                    <span
                      className={`game-text-shadow inline-block rounded-md px-2 py-0.5 font-[family-name:var(--font-dotgothic)] text-xs text-white ${TYPE_BG[moves[selectedMove].type] ?? "bg-gray-600"}`}
                    >
                      {TYPE_LABEL[moves[selectedMove].type] ?? moves[selectedMove].type}
                    </span>
                    <p className="mt-1.5 font-[family-name:var(--font-dotgothic)] text-xs text-gray-400">
                      PP{" "}
                      <span
                        className={
                          moves[selectedMove].currentPp <= 0 ? "text-red-400" : "text-white"
                        }
                      >
                        {moves[selectedMove].currentPp}
                      </span>
                      /{moves[selectedMove].maxPp}
                    </p>
                  </>
                )}
                <button
                  className="mt-2 font-[family-name:var(--font-dotgothic)] text-xs text-gray-500 transition-colors hover:text-white"
                  onClick={() => setPhase("action")}
                >
                  ← もどる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
