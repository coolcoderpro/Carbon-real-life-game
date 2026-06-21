import { CATEGORY_LABELS } from "./actions";
import {
  categoryBreakdown,
  totalCO2e,
  totalSavings,
  treesToOffset,
} from "./carbon";
import type { Category, Insight, LoggedAction } from "./types";

/** Best lower-carbon swap to suggest for the heaviest category. */
const SWAP_SUGGESTIONS: Record<Category, string> = {
  food: "swap one red-meat meal for a plant-based one (~4.5 kg saved)",
  transport: "take the bus or cycle for a short trip (~2 kg saved)",
  energy: "ease off the AC and switch to LED lighting",
  lifestyle: "skip an impulse purchase or buy second-hand",
};

/**
 * Turn the day's log into a short list of personalized, deterministic tips.
 * No model calls — just rules over the logged actions.
 */
export function generateInsights(log: LoggedAction[]): Insight[] {
  if (log.length === 0) {
    return [
      {
        id: "empty",
        tone: "info",
        text: "Log what you did today to see how your choices shape the garden.",
      },
    ];
  }

  const insights: Insight[] = [];
  const net = totalCO2e(log);
  const saved = totalSavings(log);
  const breakdown = categoryBreakdown(log);
  const topEmitter = breakdown.find((b) => b.total > 0);

  // 1. Headline on the net day.
  if (net <= 0) {
    insights.push({
      id: "net",
      tone: "good",
      text: `Net-positive day! You came out ${Math.abs(net)} kg CO₂e ahead — the garden is healing.`,
    });
  } else {
    insights.push({
      id: "net",
      tone: net > 10 ? "warning" : "info",
      text: `Today's footprint is about ${net} kg CO₂e — roughly ${treesToOffset(net)} tree-year(s) to offset.`,
    });
  }

  // 2. Biggest contributor + a concrete swap.
  if (topEmitter) {
    insights.push({
      id: "top",
      tone: "warning",
      text: `Your biggest source was ${CATEGORY_LABELS[topEmitter.category]} (${topEmitter.total} kg). Tomorrow, ${SWAP_SUGGESTIONS[topEmitter.category]}.`,
    });
  }

  // 3. Acknowledge the good choices.
  if (saved > 0) {
    insights.push({
      id: "saved",
      tone: "good",
      text: `Nice — your greener choices saved about ${saved} kg CO₂e today. Keep it up!`,
    });
  }

  return insights;
}
