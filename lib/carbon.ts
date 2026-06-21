import { CATEGORIES } from "./actions";
import type { CategoryBreakdown, LoggedAction } from "./types";

/** Net CO2e of the day (kg). Can be negative on a great day. */
export function totalCO2e(log: LoggedAction[]): number {
  return round1(log.reduce((sum, a) => sum + a.co2e, 0));
}

/** Sum of only the emitting (positive) actions — the "footprint". */
export function grossEmissions(log: LoggedAction[]): number {
  return round1(log.reduce((sum, a) => (a.co2e > 0 ? sum + a.co2e : sum), 0));
}

/** Sum of only the saving (negative) actions, returned as a positive number. */
export function totalSavings(log: LoggedAction[]): number {
  return round1(log.reduce((sum, a) => (a.co2e < 0 ? sum - a.co2e : sum), 0));
}

/** Per-category net totals, sorted by largest emitter first. */
export function categoryBreakdown(log: LoggedAction[]): CategoryBreakdown[] {
  return CATEGORIES.map((category) => ({
    category,
    total: round1(
      log
        .filter((a) => a.category === category)
        .reduce((sum, a) => sum + a.co2e, 0),
    ),
  })).sort((a, b) => b.total - a.total);
}

/** Rough offset comparison: trees needed for a year to absorb net emissions. */
export function treesToOffset(netCO2e: number): number {
  if (netCO2e <= 0) return 0;
  // A mature tree absorbs ~21 kg CO2 per year.
  return Math.max(1, Math.round(netCO2e / 21));
}

/** Equivalent km of average car driving for a given emission. */
export function drivingEquivalentKm(co2e: number): number {
  // ~0.25 kg CO2e per km for an average petrol car.
  return Math.round(Math.abs(co2e) / 0.25);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
