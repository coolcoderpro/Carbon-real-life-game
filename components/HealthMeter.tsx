"use client";

import { motion } from "framer-motion";
import { useGame } from "@/context/GameProvider";
import { worldMood } from "@/lib/garden";

export default function HealthMeter() {
  const { state } = useGame();
  const mood = worldMood(state.health);

  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-emerald-950">Garden health</h2>
        <span className="text-sm font-bold" style={{ color: mood.color }}>
          {Math.round(state.health)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-black/10">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${state.health}%`, backgroundColor: mood.color }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <p className="mt-2 text-xs text-emerald-900/70">
        {mood.emoji} {mood.label}
      </p>
    </div>
  );
}
