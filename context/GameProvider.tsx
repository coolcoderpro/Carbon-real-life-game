"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { gameReducer, initialState, type GameAction } from "@/lib/gameState";
import type { GameState } from "@/lib/types";

interface GameContextValue {
  state: GameState;
  logAction: (presetId: string) => void;
  undo: () => void;
  resetDay: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      logAction: (presetId: string) =>
        dispatch({ type: "LOG_ACTION", presetId } satisfies GameAction),
      undo: () => dispatch({ type: "UNDO" }),
      resetDay: () => dispatch({ type: "RESET_DAY" }),
    }),
    [state],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
