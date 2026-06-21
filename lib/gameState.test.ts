import { describe, expect, it } from "vitest";
import { gameReducer, initialState } from "./gameState";
import { BASELINE_HEALTH } from "./garden";

describe("gameReducer — LOG_ACTION", () => {
  it("logs the action, spawns an item, and moves world health", () => {
    const next = gameReducer(initialState, { type: "LOG_ACTION", presetId: "beef" });
    expect(next.log).toHaveLength(1);
    expect(next.gardenItems).toHaveLength(1);
    // beef (+5 co2e) => healthDelta -7.5
    expect(next.health).toBe(BASELINE_HEALTH - 7.5);
    expect(next.lastAction?.label).toBe("Ate beef");
  });

  it("ignores unknown preset ids (input validation)", () => {
    const next = gameReducer(initialState, { type: "LOG_ACTION", presetId: "nope" });
    expect(next).toBe(initialState);
  });

  it("clears opposite objects: a plant cleans up existing pollution", () => {
    let state = gameReducer(initialState, { type: "LOG_ACTION", presetId: "drive" });
    expect(state.gardenItems.every((i) => i.kind === "smog")).toBe(true);

    // Plant a tree — it should remove pollution and leave only the new tree.
    state = gameReducer(state, { type: "LOG_ACTION", presetId: "tree" });
    expect(state.gardenItems).toHaveLength(1);
    expect(state.gardenItems[0].kind).toBe("tree");
  });

  it("never lets health leave the 0..100 range", () => {
    let state = initialState;
    for (let i = 0; i < 30; i++) {
      state = gameReducer(state, { type: "LOG_ACTION", presetId: "flight" });
    }
    expect(state.health).toBe(0);
  });
});

describe("gameReducer — UNDO", () => {
  it("is a no-op on an empty log", () => {
    expect(gameReducer(initialState, { type: "UNDO" })).toBe(initialState);
  });

  it("reverses the last action's item and health change", () => {
    const logged = gameReducer(initialState, { type: "LOG_ACTION", presetId: "beef" });
    const undone = gameReducer(logged, { type: "UNDO" });
    expect(undone.log).toHaveLength(0);
    expect(undone.gardenItems).toHaveLength(0);
    expect(undone.health).toBe(BASELINE_HEALTH);
  });

  it("restores objects that the undone action destroyed", () => {
    let state = gameReducer(initialState, { type: "LOG_ACTION", presetId: "drive" });
    const pollutionCount = state.gardenItems.length;
    state = gameReducer(state, { type: "LOG_ACTION", presetId: "tree" }); // razes pollution
    state = gameReducer(state, { type: "UNDO" }); // should bring it back
    expect(state.gardenItems).toHaveLength(pollutionCount);
    expect(state.gardenItems.every((i) => i.kind === "smog")).toBe(true);
  });
});

describe("gameReducer — RESET_DAY", () => {
  it("returns to the initial state", () => {
    let state = gameReducer(initialState, { type: "LOG_ACTION", presetId: "beef" });
    state = gameReducer(state, { type: "RESET_DAY" });
    expect(state).toEqual(initialState);
  });
});
