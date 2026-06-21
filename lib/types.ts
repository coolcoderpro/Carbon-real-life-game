export type Category = "food" | "transport" | "energy" | "lifestyle";

export type ItemHealth = "thriving" | "neutral" | "withering" | "dead";

/**
 * What an action spawns in the 3D world.
 *  - tree / sprout: green, life-giving (good, low-carbon choices)
 *  - smog: a rising pollution plume (emissions: driving, flying, AC…)
 *  - scorch: charred earth + dead stump (land destruction, e.g. beef)
 *  - trash: a heap of waste (consumption, e.g. fast fashion)
 */
export type WorldKind = "tree" | "sprout" | "smog" | "scorch" | "trash";

/** A pickable real-life action with an associated carbon value. */
export interface ActionPreset {
  id: string;
  label: string; // e.g. "Ate beef"
  emoji: string; // e.g. "🥩"
  category: Category;
  /** kg CO2e. Positive = emits, negative = saves vs. a typical alternative. */
  co2e: number;
  /** What this action manifests as in the 3D world. */
  kind: WorldKind;
}

/** A preset that has actually been logged today. */
export interface LoggedAction extends ActionPreset {
  uid: string;
  loggedAt: number;
  /** Opposing items this action cleared from the world (for undo). */
  removedItems?: GardenItem[];
}

/** A visual element rendered in the garden, derived from a LoggedAction. */
export interface GardenItem {
  uid: string; // mirrors the LoggedAction uid
  emoji: string;
  label: string;
  /** The item's "birth" health, from its own carbon value. */
  health: ItemHealth;
  /** Carbon value carried over so the plant can react to world health. */
  co2e: number;
  /** What this item manifests as in the 3D world. */
  kind: WorldKind;
  /** Grid position, in cells. */
  x: number;
  y: number;
}

/** A transient record of the most recent action, used to flash feedback. */
export interface LastAction {
  uid: string;
  emoji: string;
  label: string;
  co2e: number;
}

export interface GameState {
  log: LoggedAction[];
  gardenItems: GardenItem[];
  /** 0–100 overall world health. */
  health: number;
  /** The most recently logged action, for one-shot visual feedback. */
  lastAction: LastAction | null;
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
}

export interface Insight {
  id: string;
  tone: "good" | "warning" | "info";
  text: string;
}
