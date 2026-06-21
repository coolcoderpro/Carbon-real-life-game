"use client";

import { motion } from "framer-motion";
import { useGame } from "@/context/GameProvider";
import {
  ACTION_PRESETS,
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
} from "@/lib/actions";
import type { ActionPreset } from "@/lib/types";

// Stagger children in as each category row mounts.
const rowVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 26 },
  },
};

function ActionButton({ preset }: { preset: ActionPreset }) {
  const { logAction } = useGame();
  const emits = preset.co2e > 0;

  return (
    <motion.button
      type="button"
      onClick={() => logAction(preset.id)}
      variants={buttonVariants}
      whileTap={{ scale: 0.9 }}
      whileHover={{ y: -3, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm ${
        emits
          ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
          : "border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
      }`}
    >
      <span className="text-base">{preset.emoji}</span>
      {preset.label}
      <span className="tabular-nums text-xs opacity-70">
        {emits ? "+" : ""}
        {preset.co2e}
      </span>
    </motion.button>
  );
}

export default function ActionBar() {
  return (
    <div className="space-y-3">
      {CATEGORIES.map((category) => (
        <div key={category}>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-900/60">
            {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category]}
          </h3>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={rowVariants}
            initial="hidden"
            animate="visible"
          >
            {ACTION_PRESETS.filter((p) => p.category === category).map((p) => (
              <ActionButton key={p.id} preset={p} />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
