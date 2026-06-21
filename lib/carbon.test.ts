import { describe, expect, it } from "vitest";
import {
  categoryBreakdown,
  drivingEquivalentKm,
  grossEmissions,
  round1,
  totalCO2e,
  totalSavings,
  treesToOffset,
} from "./carbon";
import { getPreset } from "./actions";
import type { LoggedAction } from "./types";

/** Build a LoggedAction list from preset ids (carbon fns only read co2e/category). */
function log(...ids: string[]): LoggedAction[] {
  return ids.map((id, i) => {
    const preset = getPreset(id);
    if (!preset) throw new Error(`unknown preset ${id}`);
    return { ...preset, uid: `u${i}`, loggedAt: i };
  });
}

describe("round1", () => {
  it("rounds to one decimal place", () => {
    expect(round1(1.04)).toBe(1);
    expect(round1(1.05)).toBe(1.1);
    expect(round1(-0.349)).toBe(-0.3);
  });
});

describe("totalCO2e", () => {
  it("is 0 for an empty log", () => {
    expect(totalCO2e([])).toBe(0);
  });

  it("sums positives and negatives into a net figure", () => {
    // beef +5.0, cycle -1.0  => 4.0
    expect(totalCO2e(log("beef", "cycle"))).toBe(4);
  });

  it("can be negative on a net-good day", () => {
    expect(totalCO2e(log("tree", "cycle"))).toBe(-6);
  });
});

describe("grossEmissions", () => {
  it("counts only positive (emitting) actions", () => {
    expect(grossEmissions(log("beef", "cycle", "drive"))).toBe(7.5);
  });
});

describe("totalSavings", () => {
  it("returns the magnitude of negative actions as a positive number", () => {
    expect(totalSavings(log("tree", "cycle", "beef"))).toBe(6);
  });
});

describe("categoryBreakdown", () => {
  it("nets per category and sorts by largest emitter first", () => {
    const result = categoryBreakdown(log("beef", "flight", "tree"));
    expect(result[0]).toEqual({ category: "transport", total: 90 });
    const food = result.find((r) => r.category === "food");
    const lifestyle = result.find((r) => r.category === "lifestyle");
    expect(food?.total).toBe(5);
    expect(lifestyle?.total).toBe(-5);
  });
});

describe("treesToOffset", () => {
  it("is 0 when there is nothing to offset", () => {
    expect(treesToOffset(0)).toBe(0);
    expect(treesToOffset(-10)).toBe(0);
  });

  it("returns at least one tree for any positive emission", () => {
    expect(treesToOffset(1)).toBe(1);
    expect(treesToOffset(21)).toBe(1);
    expect(treesToOffset(42)).toBe(2);
  });
});

describe("drivingEquivalentKm", () => {
  it("converts emissions to equivalent car km (absolute)", () => {
    expect(drivingEquivalentKm(2.5)).toBe(10);
    expect(drivingEquivalentKm(-2.5)).toBe(10);
  });
});
