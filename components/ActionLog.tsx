"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/context/GameProvider";

export default function ActionLog() {
  const { state, undo, resetDay } = useGame();
  const entries = [...state.log].reverse();

  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-emerald-950">
          Today&apos;s log{" "}
          <span className="text-emerald-900/50">({state.log.length})</span>
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={state.log.length === 0}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-emerald-900 disabled:opacity-40 enabled:hover:bg-black/5"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={resetDay}
            disabled={state.log.length === 0}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-emerald-900 disabled:opacity-40 enabled:hover:bg-black/5"
          >
            Reset day
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-emerald-900/60">Nothing logged yet today.</p>
      ) : (
        <ul className="max-h-40 space-y-1 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.li
                key={e.uid}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between rounded-lg px-2 py-1 text-xs text-emerald-900/80 odd:bg-black/[0.03]"
              >
                <span>
                  {e.emoji} {e.label}
                </span>
                <span
                  className={`tabular-nums font-medium ${e.co2e > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {e.co2e > 0 ? "+" : ""}
                  {e.co2e} kg
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
