import { describe, expect, it } from "vitest";
import {
  BASELINE_HEALTH,
  GARDEN_COLS,
  GARDEN_ROWS,
  classifyHealth,
  clampHealth,
  clearPower,
  healthDelta,
  isGreenKind,
  isPollutionKind,
  itemVitality,
  pickPosition,
  toGardenItem,
  worldMood,
} from "./garden";
import type { GardenItem, LoggedAction } from "./types";

describe("kind predicates", () => {
  it("classifies green vs pollution kinds, with no overlap", () => {
    for (const k of ["tree", "sprout"] as const) {
      expect(isGreenKind(k)).toBe(true);
      expect(isPollutionKind(k)).toBe(false);
    }
    for (const k of ["smog", "scorch", "trash"] as const) {
      expect(isPollutionKind(k)).toBe(true);
      expect(isGreenKind(k)).toBe(false);
    }
  });
});

describe("clearPower", () => {
  it("scales with carbon and is clamped to 1..4", () => {
    expect(clearPower(0)).toBe(1); // never below 1
    expect(clearPower(0.6)).toBe(1);
    expect(clearPower(5)).toBe(1); // round(5/4)=1
    expect(clearPower(10)).toBe(3); // round(10/4)=3 (fast fashion)
    expect(clearPower(90)).toBe(4); // flight, clamped to 4
    expect(clearPower(-90)).toBe(4); // magnitude only
  });
});

describe("classifyHealth", () => {
  it("maps carbon value to a visual health band", () => {
    expect(classifyHealth(-5)).toBe("thriving");
    expect(classifyHealth(0)).toBe("neutral");
    expect(classifyHealth(2)).toBe("withering");
    expect(classifyHealth(5)).toBe("dead");
  });
});

describe("healthDelta", () => {
  it("savings heal and emissions harm, scaled by 1.5", () => {
    expect(healthDelta(-1)).toBe(1.5);
    expect(healthDelta(2)).toBe(-3);
  });

  it("clamps so a single huge action cannot swing the world too far", () => {
    expect(healthDelta(90)).toBe(-15); // flight floored at -15
    expect(healthDelta(-100)).toBe(8); // capped at +8
  });
});

describe("clampHealth", () => {
  it("keeps health within 0..100", () => {
    expect(clampHealth(-5)).toBe(0);
    expect(clampHealth(150)).toBe(100);
    expect(clampHealth(42)).toBe(42);
  });
});

describe("worldMood", () => {
  it("returns a mood band for each health range", () => {
    expect(worldMood(90).label).toBe("Flourishing");
    expect(worldMood(60).label).toBe("Holding on");
    expect(worldMood(30).label).toBe("Struggling");
    expect(worldMood(10).label).toBe("Wilting");
  });
});

describe("itemVitality", () => {
  it("drags a plant's vitality toward world health and stays within 0..1", () => {
    const thriving: GardenItem = {
      uid: "a", emoji: "🌳", label: "t", health: "thriving",
      co2e: -5, kind: "tree", x: 0, y: 0,
    };
    const dyingWorld = itemVitality(thriving, 0);
    const healthyWorld = itemVitality(thriving, 100);
    // A thriving plant still droops when the world wilts...
    expect(dyingWorld).toBeLessThan(healthyWorld);
    // ...and everything stays inside the valid range.
    expect(dyingWorld).toBeGreaterThanOrEqual(0);
    expect(healthyWorld).toBeLessThanOrEqual(1);
  });
});

describe("pickPosition", () => {
  it("always returns a cell inside the grid", () => {
    for (let i = 0; i < 50; i++) {
      const { x, y } = pickPosition([]);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(GARDEN_COLS);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(GARDEN_ROWS);
    }
  });

  it("prefers a free cell over an occupied one", () => {
    // Fill every cell but (0,0); the next pick must land there.
    const existing: GardenItem[] = [];
    for (let y = 0; y < GARDEN_ROWS; y++) {
      for (let x = 0; x < GARDEN_COLS; x++) {
        if (x === 0 && y === 0) continue;
        existing.push({
          uid: `${x}-${y}`, emoji: "🌳", label: "t", health: "neutral",
          co2e: 0, kind: "tree", x, y,
        });
      }
    }
    expect(pickPosition(existing)).toEqual({ x: 0, y: 0 });
  });
});

describe("toGardenItem", () => {
  it("derives a garden item from a logged action", () => {
    const action: LoggedAction = {
      id: "beef", label: "Ate beef", emoji: "🥩", category: "food",
      co2e: 5, kind: "scorch", uid: "x", loggedAt: 0,
    };
    const item = toGardenItem(action, []);
    expect(item.uid).toBe("x");
    expect(item.kind).toBe("scorch");
    expect(item.health).toBe("dead"); // +5 co2e => dead
  });
});

describe("constants", () => {
  it("baseline health is the documented starting value", () => {
    expect(BASELINE_HEALTH).toBe(70);
  });
});
