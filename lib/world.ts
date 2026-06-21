import { GARDEN_COLS, GARDEN_ROWS } from "./garden";

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Frame-rate-independent smoothing factor for useFrame lerps. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * Map a garden grid cell (x: 0–7, y: 0–4) to a position on the 3D ground
 * plane. The grid is centered on the origin and slightly jittered per cell so
 * the planting doesn't look like a rigid lattice.
 */
export function cellToWorld(x: number, y: number): [number, number, number] {
  const spacingX = 0.95;
  const spacingZ = 0.95;
  // Deterministic per-cell jitter so a tree never hops between renders.
  const jx = (((x * 73 + y * 19) % 10) / 10 - 0.5) * 0.45;
  const jz = (((x * 17 + y * 53) % 10) / 10 - 0.5) * 0.45;
  const wx = (x - (GARDEN_COLS - 1) / 2) * spacingX + jx;
  const wz = (y - (GARDEN_ROWS - 1) / 2) * spacingZ + jz;
  return [wx, 0, wz];
}

/** Palette anchors used to tint the world between thriving and wilting. */
export const WORLD_COLORS = {
  groundHealthy: "#4f8f3a",
  groundDead: "#7a5a36",
  skyHealthy: "#aee0ff",
  skyDead: "#b9a07e",
  fogHealthy: "#cfefff",
  fogDead: "#9c8a6d",
  foliageHealthy: "#2f9e44",
  foliageDead: "#7c5a2e",
};
