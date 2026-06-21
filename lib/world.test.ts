import { describe, expect, it } from "vitest";
import { cellToWorld, damp, lerp } from "./world";
import { GARDEN_COLS, GARDEN_ROWS } from "./garden";

describe("lerp", () => {
  it("interpolates linearly between a and b", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

describe("damp", () => {
  it("moves toward the target and converges as dt grows", () => {
    expect(damp(0, 10, 5, 0)).toBe(0); // no time passed, no movement
    const step = damp(0, 10, 5, 0.1);
    expect(step).toBeGreaterThan(0);
    expect(step).toBeLessThan(10);
    // A long dt should land very close to the target.
    expect(damp(0, 10, 5, 100)).toBeCloseTo(10, 5);
  });
});

describe("cellToWorld", () => {
  it("keeps every grid cell within a bounded region and y on the ground", () => {
    for (let y = 0; y < GARDEN_ROWS; y++) {
      for (let x = 0; x < GARDEN_COLS; x++) {
        const [wx, wy, wz] = cellToWorld(x, y);
        expect(wy).toBe(0);
        expect(Math.abs(wx)).toBeLessThan(GARDEN_COLS);
        expect(Math.abs(wz)).toBeLessThan(GARDEN_ROWS);
      }
    }
  });

  it("is deterministic (same cell always maps to the same point)", () => {
    expect(cellToWorld(3, 2)).toEqual(cellToWorld(3, 2));
  });
});
