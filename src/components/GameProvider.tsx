"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import {
  createInitialGameState,
  gameReducer,
  type GameState,
  type GameAction,
} from "@/engine/state/game-state";

const GameStateContext = createContext<GameState | null>(null);
const GameDispatchContext = createContext<Dispatch<GameAction> | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  return (
    <GameStateContext value={state}>
      <GameDispatchContext value={dispatch}>{children}</GameDispatchContext>
    </GameStateContext>
  );
}

export function useGameState(): GameState {
  const state = useContext(GameStateContext);
  if (!state) throw new Error("useGameState must be used within GameProvider");
  return state;
}

export function useGameDispatch(): Dispatch<GameAction> {
  const dispatch = useContext(GameDispatchContext);
  if (!dispatch) throw new Error("useGameDispatch must be used within GameProvider");
  return dispatch;
}
