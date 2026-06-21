import { getPreset } from "./actions";
import {
  BASELINE_HEALTH,
  clampHealth,
  clearPower,
  healthDelta,
  isGreenKind,
  isPollutionKind,
  toGardenItem,
} from "./garden";
import type { GameState, GardenItem, LoggedAction } from "./types";

export const initialState: GameState = {
  log: [],
  gardenItems: [],
  health: BASELINE_HEALTH,
  lastAction: null,
};

export type GameAction =
  | { type: "LOG_ACTION"; presetId: string }
  | { type: "UNDO" }
  | { type: "RESET_DAY" };

function makeUid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOG_ACTION": {
      const preset = getPreset(action.presetId);
      if (!preset) return state;

      const item = toGardenItem(
        { ...preset, uid: makeUid(), loggedAt: Date.now() },
        state.gardenItems,
      );

      // Good and bad objects don't coexist forever — each action clears the
      // opposite. A new plant cleans up pollution; new pollution razes plants.
      // Bigger footprints clear more, and the oldest opposites go first.
      const power = clearPower(preset.co2e);
      const clears = isGreenKind(item.kind) ? isPollutionKind : isGreenKind;
      const removedItems: GardenItem[] = [];
      const survivors: GardenItem[] = [];
      for (const existing of state.gardenItems) {
        if (clears(existing.kind) && removedItems.length < power) {
          removedItems.push(existing);
        } else {
          survivors.push(existing);
        }
      }

      const logged: LoggedAction = {
        ...preset,
        uid: item.uid,
        loggedAt: Date.now(),
        removedItems,
      };

      return {
        log: [...state.log, logged],
        gardenItems: [...survivors, item],
        health: clampHealth(state.health + healthDelta(preset.co2e)),
        lastAction: {
          uid: logged.uid,
          emoji: logged.emoji,
          label: logged.label,
          co2e: logged.co2e,
        },
      };
    }

    case "UNDO": {
      if (state.log.length === 0) return state;
      const last = state.log[state.log.length - 1];
      const withoutAdded = state.gardenItems.filter((i) => i.uid !== last.uid);
      return {
        log: state.log.slice(0, -1),
        // Drop the item this action added, and restore whatever it destroyed.
        gardenItems: [...(last.removedItems ?? []), ...withoutAdded],
        health: clampHealth(state.health - healthDelta(last.co2e)),
        lastAction: null,
      };
    }

    case "RESET_DAY":
      return initialState;

    default:
      return state;
  }
}
