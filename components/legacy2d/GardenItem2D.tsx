"use client";

import { motion } from "framer-motion";
import { GARDEN_COLS, GARDEN_ROWS, itemVitality } from "@/lib/garden";
import type { GardenItem as GardenItemType } from "@/lib/types";

/** Pick a soft accent ring from a plant's current vitality. */
function ring(vitality: number): string {
  if (vitality >= 0.75) return "ring-green-400/60";
  if (vitality >= 0.5) return "ring-lime-300/50";
  if (vitality >= 0.3) return "ring-amber-400/50";
  return "ring-red-400/50";
}

/**
 * The original 2D garden plant: an emoji that fades, desaturates (grayscale),
 * and droops as its vitality drops. Vitality blends the item's own carbon with
 * overall world health, so the whole garden reacts together.
 */
export default function GardenItem2D({
  item,
  worldHealth,
}: {
  item: GardenItemType;
  worldHealth: number;
}) {
  const leftPct = ((item.x + 0.5) / GARDEN_COLS) * 100;
  const topPct = ((item.y + 0.5) / GARDEN_ROWS) * 100;

  const vitality = itemVitality(item, worldHealth);
  const opacity = 0.4 + vitality * 0.6;
  const grayscale = (1 - vitality) * 0.95;
  const rotate = (1 - vitality) * 26;
  const isAlive = vitality >= 0.5;

  return (
    <motion.div
      layout
      title={`${item.label} — ${Math.round(vitality * 100)}% vitality`}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      initial={{ scale: 0, y: 8, opacity: 0 }}
      animate={{ scale: 1, opacity, rotate, y: isAlive ? [0, -3, 0] : 0 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
      transition={{
        scale: { type: "spring", stiffness: 320, damping: 18 },
        rotate: { duration: 0.6 },
        opacity: { duration: 0.6 },
        y: isAlive
          ? { repeat: Infinity, duration: 3 + item.x * 0.15, ease: "easeInOut" }
          : { duration: 0.3 },
      }}
    >
      <motion.span
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-2xl shadow-sm ring-2 ${ring(
          vitality,
        )} sm:h-11 sm:w-11 sm:text-3xl`}
        animate={{ filter: `grayscale(${grayscale})` }}
        transition={{ duration: 0.6 }}
      >
        {item.emoji}
      </motion.span>
    </motion.div>
  );
}
