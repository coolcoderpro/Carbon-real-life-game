"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "@/context/GameProvider";
import { worldMood } from "@/lib/garden";
import type { LastAction } from "@/lib/types";
import GardenAmbient2D from "./GardenAmbient2D";
import GardenItem2D from "./GardenItem2D";

/**
 * The original 2D emoji garden (pre-3D), preserved as a standalone demo for
 * the build-log / video. Sky tints with health, plants pop in and wilt, and
 * each action triggers a flash + floating impact badge.
 */
export default function Garden2D() {
  const { state } = useGame();
  const mood = worldMood(state.health);

  const [pulse, setPulse] = useState<LastAction | null>(null);
  useEffect(() => {
    if (!state.lastAction) return;
    setPulse(state.lastAction);
    const t = setTimeout(() => setPulse(null), 1500);
    return () => clearTimeout(t);
  }, [state.lastAction]);

  const pulseEmits = (pulse?.co2e ?? 0) > 0;

  // Sky shifts from lush blue-green (healthy) toward a hazy brown (wilting).
  const skyTop = `hsl(${110 + state.health * 0.9}, ${30 + state.health * 0.4}%, ${78 - (100 - state.health) * 0.12}%)`;
  const skyBottom = `hsl(${90 + state.health * 0.6}, ${35 + state.health * 0.3}%, ${88 - (100 - state.health) * 0.18}%)`;

  return (
    <motion.div
      className="relative h-72 w-full overflow-hidden rounded-3xl border border-black/5 shadow-inner sm:h-96"
      animate={{ background: `linear-gradient(to bottom, ${skyTop}, ${skyBottom})` }}
      transition={{ duration: 0.8 }}
    >
      <GardenAmbient2D health={state.health} />

      {/* Good/bad flash on each action */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            key={pulse.uid}
            className="pointer-events-none absolute inset-0"
            style={{
              background: pulseEmits
                ? "radial-gradient(circle at 50% 60%, rgba(220,38,38,0.28), transparent 70%)"
                : "radial-gradient(circle at 50% 60%, rgba(16,185,129,0.30), transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, times: [0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Mood badge */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/50 px-3 py-1 text-sm font-medium text-emerald-900 backdrop-blur-sm">
        <span className="text-lg">{mood.emoji}</span>
        {mood.label}
      </div>

      {/* Ground */}
      <div
        className="absolute bottom-0 h-1/4 w-full"
        style={{
          background:
            "linear-gradient(to bottom, rgba(101,163,13,0.25), rgba(120,89,53,0.45))",
        }}
      />

      {/* Items */}
      <AnimatePresence>
        {state.gardenItems.map((item) => (
          <GardenItem2D key={item.uid} item={item} worldHealth={state.health} />
        ))}
      </AnimatePresence>

      {/* Floating impact badge */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            key={`toast-${pulse.uid}`}
            className={`pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold shadow-lg ${
              pulseEmits ? "bg-red-600/90 text-white" : "bg-emerald-600/90 text-white"
            }`}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -54, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, times: [0, 0.15, 0.7, 1] }}
          >
            <span className="text-base">{pulse.emoji}</span>
            <span className="tabular-nums">
              {pulseEmits ? "+" : "−"}
              {Math.abs(pulse.co2e)} kg CO₂e
            </span>
            <span>{pulseEmits ? "🥀" : "🌱"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {state.gardenItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-emerald-900/60">
          Your garden is empty. Log a daily action below and watch it take root. 🌱
        </div>
      )}
    </motion.div>
  );
}
