"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import { gameReducer, initialState, type GameAction } from "@/lib/gameState";
import type { GameState } from "@/lib/types";

interface GameActions {
  logAction: (presetId: string) => void;
  undo: () => void;
  resetDay: () => void;
}

// State and actions live in separate contexts on purpose: the actions object is
// stable for the lifetime of the provider, so components that only dispatch
// (e.g. the action buttons) never re-render when the state changes.
const GameStateContext = createContext<GameState | null>(null);
const GameActionsContext = createContext<GameActions | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // `dispatch` is stable, so these callbacks are created once (empty deps).
  const actions = useMemo<GameActions>(
    () => ({
      logAction: (presetId: string) =>
        dispatch({ type: "LOG_ACTION", presetId } satisfies GameAction),
      undo: () => dispatch({ type: "UNDO" }),
      resetDay: () => dispatch({ type: "RESET_DAY" }),
    }),
    [],
  );

  return (
    <GameActionsContext.Provider value={actions}>
      <GameStateContext.Provider value={state}>
        {children}
      </GameStateContext.Provider>
    </GameActionsContext.Provider>
  );
}

/** Subscribe to game state (re-renders when state changes). */
export function useGameState(): GameState {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used within a GameProvider");
  return ctx;
}

/** Subscribe to the stable game actions (never triggers a re-render). */
export function useGameActions(): GameActions {
  const ctx = useContext(GameActionsContext);
  if (!ctx) throw new Error("useGameActions must be used within a GameProvider");
  return ctx;
}

/**
 * Convenience hook returning state + actions in one object. Prefer
 * `useGameActions` in dispatch-only components so they don't re-render on
 * every state change.
 */
export function useGame(): { state: GameState } & GameActions {
  return { state: useGameState(), ...useGameActions() };
}
