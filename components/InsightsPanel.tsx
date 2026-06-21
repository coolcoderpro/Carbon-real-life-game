"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/context/GameProvider";
import { generateInsights } from "@/lib/insights";

const TONE_STYLE: Record<string, string> = {
  good: "border-green-200 bg-green-50 text-green-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

const TONE_ICON: Record<string, string> = {
  good: "✅",
  warning: "⚠️",
  info: "💡",
};

export default function InsightsPanel() {
  const { state } = useGame();
  const insights = generateInsights(state.log);

  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-emerald-950">Personalized insights</h2>
      <ul className="space-y-2">
        <AnimatePresence mode="popLayout">
          {insights.map((insight) => (
            <motion.li
              key={insight.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className={`flex gap-2 rounded-xl border px-3 py-2 text-xs leading-snug ${TONE_STYLE[insight.tone]}`}
            >
              <span>{TONE_ICON[insight.tone]}</span>
              <span>{insight.text}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
