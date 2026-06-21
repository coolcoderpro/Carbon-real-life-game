import type { ActionPreset, Category } from "./types";

/**
 * Quick-pick action presets. CO2e values are approximate, illustrative
 * estimates (kg CO2e) drawn from common public footprint figures — good
 * enough to convey relative impact in the demo, not precise accounting.
 *
 * Negative values represent a saving relative to a typical higher-carbon
 * alternative (e.g. cycling instead of driving).
 */
export const ACTION_PRESETS: ActionPreset[] = [
  // Food
  { id: "beef", label: "Ate beef", emoji: "🥩", category: "food", co2e: 5.0, kind: "scorch" },
  { id: "chicken", label: "Ate chicken", emoji: "🍗", category: "food", co2e: 1.8, kind: "smog" },
  { id: "cheese", label: "Dairy / cheese", emoji: "🧀", category: "food", co2e: 1.2, kind: "smog" },
  { id: "vegan", label: "Plant-based meal", emoji: "🥗", category: "food", co2e: 0.4, kind: "sprout" },
  { id: "leftovers", label: "Ate leftovers", emoji: "🍱", category: "food", co2e: -0.3, kind: "sprout" },

  // Transport
  { id: "flight", label: "Short flight", emoji: "✈️", category: "transport", co2e: 90.0, kind: "smog" },
  { id: "drive", label: "Drove 10 km", emoji: "🚗", category: "transport", co2e: 2.5, kind: "smog" },
  { id: "bus", label: "Took the bus", emoji: "🚌", category: "transport", co2e: 0.6, kind: "smog" },
  { id: "cycle", label: "Cycled instead", emoji: "🚲", category: "transport", co2e: -1.0, kind: "sprout" },
  { id: "walk", label: "Walked instead", emoji: "🚶", category: "transport", co2e: -1.0, kind: "sprout" },

  // Energy
  { id: "ac", label: "AC all day", emoji: "❄️", category: "energy", co2e: 3.0, kind: "smog" },
  { id: "led", label: "Lights off / LED", emoji: "💡", category: "energy", co2e: -0.2, kind: "sprout" },
  { id: "airdry", label: "Line-dried laundry", emoji: "🌞", category: "energy", co2e: -0.5, kind: "sprout" },

  // Lifestyle
  { id: "fastfashion", label: "Fast-fashion buy", emoji: "🛍️", category: "lifestyle", co2e: 10.0, kind: "trash" },
  { id: "recycle", label: "Recycled", emoji: "♻️", category: "lifestyle", co2e: -0.4, kind: "sprout" },
  { id: "tree", label: "Planted a tree", emoji: "🌳", category: "lifestyle", co2e: -5.0, kind: "tree" },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food",
  transport: "Transport",
  energy: "Energy",
  lifestyle: "Lifestyle",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  food: "🍽️",
  transport: "🚦",
  energy: "⚡",
  lifestyle: "🏠",
};

export const CATEGORIES: Category[] = ["food", "transport", "energy", "lifestyle"];

export function getPreset(id: string): ActionPreset | undefined {
  return ACTION_PRESETS.find((p) => p.id === id);
}
