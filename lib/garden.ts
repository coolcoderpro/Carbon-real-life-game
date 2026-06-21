import type { GardenItem, ItemHealth, LoggedAction, WorldKind } from "./types";

/** Green, life-giving objects. */
export function isGreenKind(kind: WorldKind): boolean {
  return kind === "tree" || kind === "sprout";
}

/** Pollution / destruction objects. */
export function isPollutionKind(kind: WorldKind): boolean {
  return kind === "smog" || kind === "scorch" || kind === "trash";
}

/**
 * How many *opposing* objects an action clears from the world. A bad action
 * destroys this many existing plants; a good one cleans up this many pollution
 * objects. Bigger carbon footprints clear more (a flight razes more than a bus).
 */
export function clearPower(co2e: number): number {
  return clamp(Math.round(Math.abs(co2e) / 4), 1, 4);
}

/** Garden grid dimensions, in cells. */
export const GARDEN_COLS = 8;
export const GARDEN_ROWS = 5;
const TOTAL_CELLS = GARDEN_COLS * GARDEN_ROWS;

export const BASELINE_HEALTH = 70;

/** Classify an action's carbon value into a visual health state. */
export function classifyHealth(co2e: number): ItemHealth {
  if (co2e <= -0.5) return "thriving";
  if (co2e <= 0.5) return "neutral";
  if (co2e <= 3) return "withering";
  return "dead";
}

/**
 * How much a single action moves the world-health meter.
 * Savings (negative co2e) heal the world; emissions harm it. Each action's
 * effect is clamped so one huge entry (a flight) can't instantly zero it out.
 */
export function healthDelta(co2e: number): number {
  const raw = -co2e * 1.5;
  return clamp(raw, -15, 8);
}

export function clampHealth(health: number): number {
  return clamp(health, 0, 100);
}

/** Map overall world health to a descriptive mood + accent color. */
export function worldMood(health: number): {
  label: string;
  emoji: string;
  color: string;
} {
  if (health >= 75) return { label: "Flourishing", emoji: "🌳", color: "#16a34a" };
  if (health >= 50) return { label: "Holding on", emoji: "🌿", color: "#65a30d" };
  if (health >= 25) return { label: "Struggling", emoji: "🍂", color: "#d97706" };
  return { label: "Wilting", emoji: "🏜️", color: "#dc2626" };
}

/**
 * Pick a grid cell for a new item: prefer an unoccupied cell, otherwise fall
 * back to a pseudo-random one so the garden keeps filling gracefully.
 */
export function pickPosition(existing: GardenItem[]): { x: number; y: number } {
  const taken = new Set(existing.map((i) => i.y * GARDEN_COLS + i.x));
  const free: number[] = [];
  for (let cell = 0; cell < TOTAL_CELLS; cell++) {
    if (!taken.has(cell)) free.push(cell);
  }
  const cell =
    free.length > 0
      ? free[Math.floor(Math.random() * free.length)]
      : Math.floor(Math.random() * TOTAL_CELLS);
  return { x: cell % GARDEN_COLS, y: Math.floor(cell / GARDEN_COLS) };
}

/** Build the garden element that represents a logged action. */
export function toGardenItem(
  action: LoggedAction,
  existing: GardenItem[],
): GardenItem {
  const { x, y } = pickPosition(existing);
  return {
    uid: action.uid,
    emoji: action.emoji,
    label: action.label,
    health: classifyHealth(action.co2e),
    co2e: action.co2e,
    kind: action.kind,
    x,
    y,
  };
}

/** Base vitality (0–1) implied by an item's own carbon value. */
function baseVitality(health: ItemHealth): number {
  switch (health) {
    case "thriving":
      return 1;
    case "neutral":
      return 0.72;
    case "withering":
      return 0.42;
    case "dead":
      return 0.18;
  }
}

/**
 * A plant's *current* vitality (0–1): its birth vitality dragged toward the
 * overall world health. A thriving plant still droops when the world wilts,
 * and a struggling one perks up a little when the world recovers — so the
 * whole garden visibly reacts to every choice, not just the newest item.
 */
export function itemVitality(item: GardenItem, worldHealth: number): number {
  const base = baseVitality(item.health);
  const world = clampHealth(worldHealth) / 100;
  // World health scales the plant between half-strength (world=0) and full.
  return clamp(base * (0.45 + 0.55 * world), 0, 1);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
